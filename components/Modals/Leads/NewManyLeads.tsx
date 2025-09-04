import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import ResponsiveDialogDrawerViewOnly from "@/components/utils/ResponsiveDialogDrawerViewOnly";
import type { TUserSession } from "@/lib/auth/session";
import { copyToClipboard } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/methods/errors";
import { getJSONFromExcelFile } from "@/lib/methods/excel-utils";
import {
	formatNameAsInitials,
	formatWithoutDiacritics,
} from "@/lib/methods/formatting";
import { formatToPhone } from "@/utils/methods";
import { createManyLeads } from "@/utils/mutations/leads";
import { useOpportunityCreators } from "@/utils/queries/users";
import type { TLead } from "@/utils/schemas/leads.schema";
import type { TUserDTOSimplified } from "@/utils/schemas/user.schema";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, MapPin, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsCloudUploadFill } from "react-icons/bs";
import { TbFileImport } from "react-icons/tb";
import z from "zod";

type NewManyLeadsProps = {
	sessionUser: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};

export default function NewManyLeads({
	closeModal,
	callbacks,
	sessionUser,
}: NewManyLeadsProps) {
	const { data: qualifiers } = useOpportunityCreators();

	const initialInfoHolder: TLead[] = [];
	const [infoHolder, setInfoHolder] = useState<TLead[]>(initialInfoHolder);

	function updateInfoHolder(newInfo: TLead[]) {
		setInfoHolder((prev) => [...prev, ...newInfo]);
	}
	function updateInfoHolderItem({
		index,
		newInfo,
	}: { index: number; newInfo: Partial<TLead> }) {
		setInfoHolder((prev) =>
			prev.map((item, i) => (i === index ? { ...item, ...newInfo } : item)),
		);
	}
	const { mutate: handleCreateManyLeadsMutation, isPending } = useMutation({
		mutationFn: createManyLeads,
		mutationKey: ["create-many-leads"],
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			setInfoHolder(initialInfoHolder);
			return toast.success(data.message);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
	});
	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVOS LEADS"
			menuDescription="Anexe a planilha de referência de leads abaixo para criar novos leads."
			menuActionButtonText="CRIAR LEADS"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() =>
				handleCreateManyLeadsMutation({ type: "multiple", leads: infoHolder })
			}
			actionIsPending={isPending}
			stateIsLoading={false}
		>
			<Utils qualifiers={qualifiers ?? []} />
			<Dropzone
				updateInfoHolder={updateInfoHolder}
				qualifiers={qualifiers ?? []}
			/>
			<LeadsList infoHolder={infoHolder} />
		</ResponsiveDialogDrawer>
	);
}

type UtilsProps = {
	qualifiers: TUserDTOSimplified[];
};
function Utils({ qualifiers }: UtilsProps) {
	const [seeQualifiersOptions, setSeeQualifiersOptions] = useState(false);
	return (
		<div className="w-full flex flex-col gap-2">
			<div className="w-full flex items-center justify-between gap-2 flex-wrap">
				<Button
					onClick={() => setSeeQualifiersOptions(!seeQualifiersOptions)}
					variant={seeQualifiersOptions ? "default" : "ghost"}
					size="fit"
					className="flex items-center gap-1 rounded-lg px-2 py-1"
				>
					<UserRound className="w-4 h-4 min-w-4 min-h-4" />
					<p className="text-xs">VER QUALIFICADORES</p>
				</Button>
				<Button
					onClick={() => {
						const fileUrl = "/operacao-em-massa-leads.xlsx";
						const link = document.createElement("a");
						link.href = fileUrl;
						link.download = "operacao-em-massa-leads.xlsx";
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}}
					variant={"ghost"}
					size="fit"
					className="flex items-center gap-1 rounded-lg px-2 py-1"
				>
					<TbFileImport className="w-4 h-4 min-w-4 min-h-4" />
					<p className="text-xs">BAIXAR PLANILHA DE REFERÊNCIA</p>
				</Button>
			</div>
			{seeQualifiersOptions ? (
				<QualifiersList
					qualifiers={qualifiers}
					closeMenu={() => setSeeQualifiersOptions(false)}
				/>
			) : null}
		</div>
	);
}

function QualifiersList({
	qualifiers,
	closeMenu,
}: { qualifiers: TUserDTOSimplified[]; closeMenu: () => void }) {
	const [search, setSearch] = useState("");

	const filteredQualifiers = qualifiers.filter((qualifier) =>
		formatWithoutDiacritics(qualifier.nome, true).includes(
			formatWithoutDiacritics(search, true),
		),
	);
	return (
		<ResponsiveDialogDrawerViewOnly
			menuTitle="QUALIFICADORES"
			menuDescription="Lista de qualificadores disponíveis."
			menuCancelButtonText="FECHAR"
			dialogContentClassName="max-h-[50vh]"
			closeMenu={closeMenu}
		>
			<input
				className="w-full h-fit outline-hidden ring-0 border-none bg-transparent text-xs placeholder:italic"
				placeholder="Pesquise por um qualificador..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<AnimatePresence>
				{filteredQualifiers.length > 0
					? filteredQualifiers.map((qualifier, index) => (
							<motion.div key={qualifier._id}>
								<motion.div
									key={qualifier._id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.3,
										delay: 0.05 * index, // Exponential decrease: items later in the list have much less delay
									}}
									className="flex items-center gap-2 justify-between text-xs font-normal"
								>
									<div className="flex items-center gap-2">
										<Avatar className="w-5 h-5 min-w-5 min-h-5">
											<AvatarImage src={qualifier.avatar_url || undefined} />
											<AvatarFallback>
												{formatNameAsInitials(qualifier.nome)}
											</AvatarFallback>
										</Avatar>
										<p className="text-xs font-medium">{qualifier.nome}</p>
									</div>
									<Button
										onClick={() => copyToClipboard(qualifier.nome)}
										size={"fit"}
										variant={"ghost"}
										className="p-2 rounded-full"
									>
										<Copy className="w-4 h-4 min-w-4 min-h-4" />
									</Button>
								</motion.div>
							</motion.div>
						))
					: null}
			</AnimatePresence>
		</ResponsiveDialogDrawerViewOnly>
	);
}

type DropzoneProps = {
	qualifiers: TUserDTOSimplified[];
	updateInfoHolder: (newInfo: TLead[]) => void;
};
function Dropzone({ updateInfoHolder, qualifiers }: DropzoneProps) {
	async function handleFileDrop(file: File | null) {
		if (!file) return;

		try {
			const data = await getJSONFromExcelFile(file);
			const parsedData = z
				.array(
					z.object({
						NOME: z
							.string({
								required_error: "Nome não informado.",
								invalid_type_error: "Tipo não válido para o nome.",
							})
							.optional()
							.nullable(),
						TELEFONE: z
							.union([
								z.string({
									required_error: "Telefone não informado.",
									invalid_type_error: "Tipo não válido para o telefone.",
								}),
								z.number({
									required_error: "Telefone não informado.",
									invalid_type_error: "Tipo não válido para o telefone.",
								}),
							])
							.transform((telefone) => telefone.toString()),
						UF: z
							.string({
								required_error: "UF não informada.",
								invalid_type_error: "Tipo não válido para a UF.",
							})
							.optional()
							.nullable(),
						CIDADE: z
							.string({
								required_error: "Cidade não informada.",
								invalid_type_error: "Tipo não válido para a cidade.",
							})
							.optional()
							.nullable(),
						QUALIFICADOR: z
							.string({
								required_error: "Qualificador não informado.",
								invalid_type_error: "Tipo não válido para o qualificador.",
							})
							.optional()
							.nullable(),
					}),
				)
				.parse(data);

			// To get unique leads by phone, use a Map with the formatted phone as the key.
			const leadsMap = new Map<string, TLead>();
			for (const lead of parsedData) {
				const formattedPhone = formatToPhone(lead.TELEFONE);
				if (!leadsMap.has(formattedPhone)) {
					const qualifierUser = lead.QUALIFICADOR
						? qualifiers?.find(
								(qualifier) => qualifier.nome === lead.QUALIFICADOR,
							)
						: null;
					const info: TLead = {
						nome: lead.NOME,
						telefone: formattedPhone,
						uf: lead.UF,
						cidade: lead.CIDADE,
						qualificacao: {
							score: 0,
							atributos: [],
							responsavel: qualifierUser
								? {
										id: qualifierUser._id,
										nome: qualifierUser.nome,
										avatar_url: qualifierUser.avatar_url,
									}
								: null,
						},
						canalAquisicao: "PROSPECÇÃO ATIVA",
						dataInsercao: new Date().toISOString(),
					};
					leadsMap.set(formattedPhone, info);
				}
			}
			const leads = Array.from(leadsMap.values());
			updateInfoHolder(leads);
		} catch (error) {
			console.error(error);
			const msg = getErrorMessage(error);
			return toast.error(msg);
		}
	}
	return (
		<div className="relative mb-4 flex w-full items-center justify-center">
			<label
				htmlFor="dropzone-file"
				className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary"
			>
				<div className="flex flex-col items-center justify-center pb-6 pt-5 text-primary">
					<BsCloudUploadFill size={50} />
					<p className="mb-2 px-2 text-center text-sm">
						<span className="font-semibold">
							Clique para escolher um arquivo
						</span>{" "}
						ou o arraste para a àrea demarcada
					</p>
				</div>
				<input
					onChange={(e) => {
						const file = e.target.files?.[0] || null;
						return handleFileDrop(file);
					}}
					id="dropzone-file"
					type="file"
					className="absolute h-full w-full opacity-0"
					accept=".xlsx"
				/>
			</label>
		</div>
	);
}

function LeadsList({ infoHolder }: { infoHolder: TLead[] }) {
	if (infoHolder.length === 0)
		return (
			<p className="w-full text-center italic text-primary/70">
				Nenhum lead para criar...
			</p>
		);
	return (
		<div className="flex flex-col gap-2">
			{infoHolder.map((lead) => (
				<div
					key={lead.telefone}
					className={
						"bg-card border-primary/20 flex w-full flex-col gap-3 rounded-xl border shadow-xs p-3"
					}
				>
					<div className="w-full flex items-center justify-between flex-col lg:flex-row gap-2">
						<h1 className="text-sm font-bold  text-truncate">
							{lead.telefone}
						</h1>
						<div className="flex items-center grow flex-wrap">
							{lead.nome ? (
								<div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-lg">
									<UserRound className="w-3 h-3 min-w-3 min-h-3" />
									<p className="text-[0.6rem] font-medium">{lead.nome}</p>
								</div>
							) : null}
							{lead.cidade || lead.uf ? (
								<div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-lg">
									<MapPin className="w-3 h-3 min-w-3 min-h-3" />
									<p className="text-[0.6rem] font-medium">
										{lead.cidade && `${lead.cidade}`}
										{lead.uf && ` (${lead.uf})`}
									</p>
								</div>
							) : null}
						</div>
					</div>

					{lead.qualificacao.responsavel ? (
						<div className="w-full flex items-center justify-between flex-col lg:flex-row">
							<div className="flex items-center gap-1">
								<p className="text-xs font-medium">QUALIFICADO POR:</p>
								<Avatar className="w-5 h-5 min-w-5 min-h-5">
									<AvatarImage
										src={lead.qualificacao.responsavel.avatar_url || undefined}
									/>
									<AvatarFallback>
										{formatNameAsInitials(lead.qualificacao.responsavel.nome)}
									</AvatarFallback>
								</Avatar>
								<p className="text-xs font-medium">
									{lead.qualificacao.responsavel.nome}
								</p>
							</div>
						</div>
					) : null}
				</div>
			))}
		</div>
	);
}
