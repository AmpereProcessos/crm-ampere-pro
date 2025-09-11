import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import TextareaInput from "@/components/Inputs/TextareaInput";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import { getFileTypeTitle, isFileImage } from "@/lib/methods/firebase";
import { cn } from "@/lib/utils";
import {
	BrazilianCitiesOptionsFromUF,
	BrazilianStatesOptions,
	type stateCities,
} from "@/utils/estados_cidades";
import {
	formatToCEP,
	formatToCPForCNPJ,
	formatToPhone,
	getCEPInfo,
} from "@/utils/methods";
import type { TPPSCall } from "@/utils/schemas/pps-calls.schema";
import type { TAttachmentState } from "@/utils/schemas/utils";
import { PPSCallTypes, StructureTypes } from "@/utils/select-options";
import {
	Code,
	LayoutGrid,
	LinkIcon,
	Plus,
	UserRound,
	Variable,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsCloudUploadFill } from "react-icons/bs";
import { GiBatteryPack } from "react-icons/gi";
import { MdDelete } from "react-icons/md";

type GeneralBlockProps = {
	infoHolder: TPPSCall;
	updateInfoHolder: (changes: Partial<TPPSCall>) => void;
};
export function GeneralBlock({
	infoHolder,
	updateInfoHolder,
}: GeneralBlockProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<LayoutGrid size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">
					INFORMAÇÕES GERAIS
				</h1>
			</div>
			<SelectInput
				label="TIPO DE SOLICITAÇÃO"
				value={infoHolder.tipoSolicitacao}
				options={PPSCallTypes.map((type) => ({
					id: type.value,
					label: type.label,
					value: type.value,
				}))}
				handleChange={(value) => updateInfoHolder({ tipoSolicitacao: value })}
				onReset={() => updateInfoHolder({ tipoSolicitacao: null })}
				resetOptionLabel="NÃO DEFINIDO"
				width="100%"
			/>
			{infoHolder.projeto ? (
				<div className="bg-card flex w-full flex-col items-center justify-center gap-3 p-3">
					<div className="bg-primary/20 flex items-center gap-1 rounded-md px-2 py-0.5">
						<Code className="h-3 min-h-3 w-3 min-w-3" />
						<h1 className="text-[0.55rem]">{infoHolder.projeto.id}</h1>
					</div>
					<h1 className="text-sm font-medium tracking-tight">
						({infoHolder.projeto.codigo}) {infoHolder.projeto.nome}
					</h1>
				</div>
			) : null}
			<TextareaInput
				label="ANOTAÇÕES"
				value={infoHolder.observacoes}
				handleChange={(value) => updateInfoHolder({ observacoes: value })}
				placeholder="Preencha aqui as observações do chamado ou dúvidas."
			/>
		</div>
	);
}

type ClientBlockProps = {
	requestType: TPPSCall["tipoSolicitacao"];
	client: TPPSCall["cliente"];
	updateClient: (changes: Partial<TPPSCall["cliente"]>) => void;
};
export function ClientBlock({
	client,
	updateClient,
	requestType,
}: ClientBlockProps) {
	async function setAddressDataByCEP(cep: string) {
		const addressInfo = await getCEPInfo(cep);
		const toastID = toast.loading("Buscando informações sobre o CEP...", {
			duration: 2000,
		});
		setTimeout(() => {
			if (addressInfo) {
				toast.dismiss(toastID);
				toast.success("Dados do CEP buscados com sucesso.", {
					duration: 1000,
				});
				updateClient({
					endereco: addressInfo.logradouro,
					bairro: addressInfo.bairro,
					uf: addressInfo.uf as keyof typeof stateCities,
					cidade: addressInfo.localidade.toUpperCase(),
				});
			}
		}, 1000);
	}
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<UserRound size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">
					INFORMAÇÕES GERAIS DO CLIENTE
				</h1>
			</div>
			<div className="w-full flex flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NOME DO CLIENTE"
						value={client.nome}
						placeholder="Preencha aqui o nome do cliente"
						handleChange={(value) => updateClient({ nome: value })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="CPF/CNPJ DO CLIENTE"
						value={client.cpfCnpj}
						placeholder="Preencha aqui o CPF ou CNPJ do cliente"
						handleChange={(value) =>
							updateClient({ cpfCnpj: formatToCPForCNPJ(value) })
						}
						width="100%"
					/>
				</div>
			</div>
			<div className="w-full flex flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="TELEFONE DO CLIENTE"
						value={client.telefone}
						placeholder="Preencha aqui o telefone do cliente"
						handleChange={(value) =>
							updateClient({ telefone: formatToPhone(value) })
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="EMAIL DO CLIENTE"
						value={client.email}
						placeholder="Preencha aqui o email do cliente"
						handleChange={(value) => updateClient({ email: value })}
						width="100%"
					/>
				</div>
			</div>
			<div className="w-full flex flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="CEP DO CLIENTE"
						value={client.cep ?? ""}
						placeholder="Preencha aqui o CEP do cliente"
						handleChange={(value) => {
							if (value.length === 9) {
								setAddressDataByCEP(value);
							}
							updateClient({
								cep: formatToCEP(value),
							});
						}}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="ESTADO DO CLIENTE"
						value={client.uf}
						options={BrazilianStatesOptions}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value) =>
							updateClient({
								uf: value,
								cidade: BrazilianCitiesOptionsFromUF(value)[0]?.value,
							})
						}
						onReset={() => updateClient({ uf: "" })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="CIDADE DO CLIENTE"
						value={client.cidade}
						options={BrazilianCitiesOptionsFromUF(client.uf)}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value) => updateClient({ cidade: value })}
						onReset={() => updateClient({ cidade: "" })}
						width="100%"
					/>
				</div>
			</div>
			<div className="w-full flex flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="BAIRRO DO CLIENTE"
						value={client.bairro ?? ""}
						placeholder="Preencha aqui o bairro do cliente"
						handleChange={(value) => updateClient({ bairro: value })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="LOGRADOURO DO CLIENTE"
						value={client.endereco ?? ""}
						placeholder="Preencha aqui o logradouro do cliente"
						handleChange={(value) => updateClient({ endereco: value })}
						width="100%"
					/>
				</div>
			</div>
			{requestType === "ANÁLISE DE CRÉDITO" ? (
				<div className="mt-1 flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-[50%]">
						<NumberInput
							label="RENDA DO CLIENTE"
							value={client.renda || 0}
							placeholder="Preencha aqui a renda do cliente"
							handleChange={(value) =>
								updateClient({
									renda: value,
								})
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-[50%]">
						<TextInput
							label="PROFISSÃO"
							value={client.profissao || ""}
							placeholder="Preencha aqui a profissão do cliente"
							handleChange={(value) =>
								updateClient({
									profissao: value,
								})
							}
							width="100%"
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}

type PremissesBlockProps = {
	requestType: TPPSCall["tipoSolicitacao"];
	premissas: TPPSCall["premissas"];
	updatePremissas: (changes: Partial<TPPSCall["premissas"]>) => void;
	addCharge: (
		charge: Exclude<TPPSCall["premissas"]["cargas"], undefined | null>[number],
	) => void;
	removeCharge: (index: number) => void;
};

export function PremissesBlock({
	requestType,
	premissas,
	updatePremissas,
	addCharge,
	removeCharge,
}: PremissesBlockProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<Variable size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">
					PREMISSAS
				</h1>
			</div>
			{requestType !== "ANÁLISE DE CRÉDITO" ? (
				<div className="mt-1 flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<NumberInput
							label="GERAÇÃO (kWh)"
							value={premissas?.geracao || 0}
							placeholder="Preencha aqui a geração desejada"
							handleChange={(value) =>
								updatePremissas({
									geracao: value,
								})
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="TIPO DA ESTRUTURA"
							value={premissas?.tipoEstrutura || ""}
							options={StructureTypes.map((type, index) => ({
								id: index + 1,
								label: type.label,
								value: type.value,
							}))}
							handleChange={(value) =>
								updatePremissas({
									tipoEstrutura: value,
								})
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() =>
								updatePremissas({
									tipoEstrutura: null,
								})
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="TOPOLOGIA"
							value={premissas?.topologia || ""}
							options={[
								{
									id: 1,
									label: "MICRO-INVERSOR",
									value: "MICRO-INVERSOR",
								},
								{ id: 2, label: "INVERSOR", value: "INVERSOR" },
							]}
							handleChange={(value) =>
								updatePremissas({
									topologia: value,
								})
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() =>
								updatePremissas({
									topologia: null,
								})
							}
							width="100%"
						/>
					</div>
				</div>
			) : null}

			{requestType === "ANÁLISE DE CRÉDITO" ? (
				<div className="mt-1 flex w-full items-center justify-center gap-2">
					<div className="w-full lg:w-[50%]">
						<NumberInput
							label="VALOR DO FINANCIAMENTO"
							placeholder="Preencha o valor do financiamento..."
							value={premissas?.valorFinanciamento || null}
							handleChange={(value) =>
								updatePremissas({
									valorFinanciamento: value,
								})
							}
							width="100%"
						/>
					</div>
				</div>
			) : null}

			{requestType === "PROPOSTA COMERCIAL (OFF GRID)" ? (
				<ChargeMenuBlock
					charges={premissas.cargas}
					addCharge={addCharge}
					removeCharge={removeCharge}
				/>
			) : null}
		</div>
	);
}

type ChargeMenuBlockProps = {
	charges: TPPSCall["premissas"]["cargas"];
	addCharge: (
		charge: Exclude<TPPSCall["premissas"]["cargas"], undefined | null>[number],
	) => void;
	removeCharge: (index: number) => void;
};
function ChargeMenuBlock({
	charges,
	addCharge,
	removeCharge,
}: ChargeMenuBlockProps) {
	const [newChargeMenuIsOpen, setNewChargeMenuIsOpen] = useState(false);
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<Zap size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">
					CARGAS
				</h1>
			</div>
			<div className="w-full flex flex-col gap-1">
				{charges && charges.length > 0 ? (
					charges.map((charge, index) => (
						<div
							key={`${charge.descricao}-${index}`}
							className="flex w-full items-center justify-between gap-2 rounded-md border border-cyan-500 p-2"
						>
							<div className="flex items-center gap-2">
								<GiBatteryPack color="rgb(6,182,212)" size={"20px"} />
								<p className="text-sm text-primary/70">
									<strong className="text-cyan-500">{charge.qtde}</strong> x{" "}
									<strong className="text-cyan-500">{charge.descricao}</strong>{" "}
									de{" "}
									<strong className="text-cyan-500">{charge.potencia}W</strong>{" "}
									por{" "}
									<strong className="text-cyan-500">
										{charge.horasFuncionamento} horas
									</strong>
								</p>
							</div>
							<Button
								onClick={() => removeCharge(index)}
								size={"fit"}
								variant={"destructive"}
								className="p-2 rounded-full"
							>
								<MdDelete className="w-4 h-4 min-w-4 min-h-4" />
							</Button>
						</div>
					))
				) : (
					<p className=" text-sm italic text-primary/70">
						Sem cargas adicionadas...
					</p>
				)}
				<div className="w-full flex items-center justify-center">
					<Button
						onClick={() => setNewChargeMenuIsOpen(true)}
						size="fit"
						variant="ghost"
						className="flex items-cente gap-2 px-2 py-1 rounded-lg"
					>
						<Plus className="w-4 h-4 min-w-4 min-h-4" />
						ADICIONAR CARGA
					</Button>
				</div>
			</div>
			{newChargeMenuIsOpen ? (
				<NewChargeMenuBlock
					addCharge={addCharge}
					closeMenu={() => setNewChargeMenuIsOpen(false)}
				/>
			) : null}
		</div>
	);
}
type NewChargeMenuBlockProps = {
	addCharge: (
		charge: Exclude<TPPSCall["premissas"]["cargas"], undefined | null>[number],
	) => void;
	closeMenu: () => void;
};
function NewChargeMenuBlock({ addCharge, closeMenu }: NewChargeMenuBlockProps) {
	const [chargeHolder, setChargeHolder] = useState<
		Exclude<TPPSCall["premissas"]["cargas"], undefined | null>[number]
	>({
		descricao: "",
		qtde: 0,
		horasFuncionamento: 0,
		potencia: 0,
	});
	function handleChargeAdd(
		info: Exclude<TPPSCall["premissas"]["cargas"], undefined | null>[number],
	) {
		if (info.descricao.trim().length < 3) {
			toast.error("Preencha uma descrição válida para a carga.");
			return;
		}
		if (info.potencia <= 0) {
			toast.error("Preencha uma potência válida para a carga.");
			return;
		}
		if (info.qtde <= 0) {
			toast.error("Preencha uma quantidade válida para a carga.");
			return;
		}
		addCharge(chargeHolder);
		closeMenu();
	}
	return (
		<ResponsiveDialogDrawer
			menuTitle="ADICIONAR CARGA"
			menuDescription="Preencha os campos abaixo para adicionar uma carga ao chamado"
			menuActionButtonText="ADICIONAR CARGA"
			menuCancelButtonText="CANCELAR"
			actionFunction={() => {
				handleChargeAdd(chargeHolder);
			}}
			actionIsLoading={false}
			stateIsLoading={false}
			closeMenu={closeMenu}
		>
			<TextInput
				label="DESCRIÇÃO"
				value={chargeHolder.descricao}
				handleChange={(value) =>
					setChargeHolder((prev) => ({ ...prev, descricao: value }))
				}
				placeholder="Descrição/nome da carga..."
				width="100%"
			/>
			<NumberInput
				label="QTDE"
				value={chargeHolder.qtde}
				handleChange={(value) =>
					setChargeHolder((prev) => ({ ...prev, qtde: value }))
				}
				placeholder="Quantidade de itens da carga..."
				width="100%"
			/>
			<NumberInput
				label="POTÊNCIA (W)"
				value={chargeHolder.potencia}
				handleChange={(value) =>
					setChargeHolder((prev) => ({ ...prev, potencia: value }))
				}
				placeholder="Potência da carga.."
				width="100%"
			/>
			<NumberInput
				label="FUNCIONAMENTO (h)"
				value={chargeHolder.horasFuncionamento}
				handleChange={(value) =>
					setChargeHolder((prev) => ({ ...prev, horasFuncionamento: value }))
				}
				placeholder="Horas de funcionamento..."
				width="100%"
			/>
		</ResponsiveDialogDrawer>
	);
}

type AttachFileBlockProps = {
	attachments: TAttachmentState[];
	addAttachment: (file: TAttachmentState) => void;
	removeAttachment: (index: number) => void;
};
export function AttachFileBlock({
	attachments,
	addAttachment,
	removeAttachment,
}: AttachFileBlockProps) {
	const [newAttachmentMenuIsOpen, setNewAttachmentMenuIsOpen] = useState(false);
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<LinkIcon size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">
					ANEXOS
				</h1>
			</div>
			<div className="w-full flex flex-col gap-1">
				{attachments && attachments.length > 0 ? (
					attachments.map((attachment, index) => (
						<div
							key={`${attachment.titulo}-${index}`}
							className={cn(
								"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs",
							)}
						>
							<div className="flex items-center justify-between">
								<h1 className="text-xs font-medium tracking-tight uppercase">
									{attachment.titulo}
								</h1>
								<Button
									size={"fit"}
									className="p-2 rounded-full"
									variant={"destructive"}
									onClick={() => removeAttachment(index)}
								>
									<MdDelete className="w-4 h-4 min-w-4 min-h-4" />
								</Button>
							</div>
							<div className="w-full flex items-center flex-wrap gap-3">
								{attachment.arquivos.map((file, index) => (
									<div
										key={`${file.arquivo?.name}-${index}`}
										className="flex h-[100px] w-[100px] flex-col rounded border border-primary/50"
									>
										<div className="relative flex h-[100px] w-full grow items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
											{file.previewUrl ? (
												<Image
													src={file.previewUrl}
													alt={file.arquivo?.name || ""}
													fill={true}
												/>
											) : (
												<h1 className="rounded-lg bg-blue-600 px-4 py-1 text-[0.65rem] font-bold text-white">
													{getFileTypeTitle(file.tipo || "")}
												</h1>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					))
				) : (
					<p className=" text-sm italic text-primary/70">
						Sem anexos adicionados...
					</p>
				)}
				<div className="w-full flex items-center justify-center">
					<Button
						onClick={() => setNewAttachmentMenuIsOpen(true)}
						size="fit"
						variant="ghost"
						className="flex items-cente gap-2 px-2 py-1 rounded-lg"
					>
						<Plus className="w-4 h-4 min-w-4 min-h-4" />
						ADICIONAR ANEXO
					</Button>
				</div>
			</div>
			{newAttachmentMenuIsOpen ? (
				<NewAttachmentMenuBlock
					addAttachment={addAttachment}
					closeMenu={() => setNewAttachmentMenuIsOpen(false)}
				/>
			) : null}
		</div>
	);
}

type NewAttachmentMenuBlockProps = {
	addAttachment: (attachment: TAttachmentState) => void;
	closeMenu: () => void;
};
function NewAttachmentMenuBlock({
	addAttachment,
	closeMenu,
}: NewAttachmentMenuBlockProps) {
	const [attachmentHolder, setAttachmentHolder] = useState<TAttachmentState>({
		titulo: "",
		identificador: "",
		arquivos: [],
	});

	function handleAttachmentAdd(info: TAttachmentState) {
		if (info.titulo.trim().length < 3) {
			toast.error("Preencha um título válido para o arquivo.");
			return;
		}
		if (info.arquivos.length === 0) {
			toast.error("Preencha um arquivo válido para o arquivo.");
			return;
		}
		addAttachment(info);
		closeMenu();
	}
	function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = e.target.files ? Array.from(e.target.files) : [];
		if (files.length > 0) {
			setAttachmentHolder((prev) => ({
				...prev,
				arquivos: [
					...prev.arquivos,
					...files.map((file) => ({
						arquivo: file,
						previewUrl: isFileImage(file.type)
							? URL.createObjectURL(file)
							: null,
						tipo: file.type,
					})),
				],
			}));
		}
	}
	return (
		<ResponsiveDialogDrawer
			menuTitle="ADICIONAR ANEXO"
			menuDescription="Preencha os campos abaixo para adicionar um arquivo ao chamado"
			menuActionButtonText="ADICIONAR ANEXO"
			menuCancelButtonText="CANCELAR"
			actionFunction={() => {
				handleAttachmentAdd(attachmentHolder);
			}}
			actionIsLoading={false}
			stateIsLoading={false}
			closeMenu={closeMenu}
		>
			<TextInput
				label="TÍTULO"
				value={attachmentHolder.titulo}
				handleChange={(value) =>
					setAttachmentHolder((prev) => ({ ...prev, titulo: value }))
				}
				placeholder="Título/nome do arquivo..."
				width="100%"
			/>
			<div className="relative flex w-full items-center justify-center">
				<label
					htmlFor="dropzone-file"
					className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-[#fff] hover:bg-primary/10 dark:bg-[#121212]"
				>
					<div className="flex flex-col items-center justify-center px-6 pb-6 pt-5 text-primary">
						<BsCloudUploadFill size={50} />
						<p className="text-center text-xs font-medium tracking-tight">
							Clique para escolher um ou mais arquivos ou os arraste para a àrea
							demarcada
						</p>
					</div>
					<input
						onChange={(e) => {
							handleFileInputChange(e);
						}}
						multiple={true}
						id="dropzone-file"
						type="file"
						className="absolute h-full w-full opacity-0"
					/>
				</label>
			</div>
			<div className="w-full flex items-center flex-wrap gap-3">
				{attachmentHolder.arquivos.map((file, index) => (
					<div
						key={`${file.arquivo?.name}-${index}`}
						className="flex h-[100px] w-[100px] flex-col rounded border border-primary/50"
					>
						<div className="relative flex h-[100px] w-full grow items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
							{file.previewUrl ? (
								<Image
									src={file.previewUrl}
									alt={file.arquivo?.name || ""}
									fill={true}
								/>
							) : (
								<h1 className="rounded-lg bg-blue-600 px-4 py-1 text-[0.65rem] font-bold text-white">
									{getFileTypeTitle(file.tipo || "")}
								</h1>
							)}
						</div>
					</div>
				))}
			</div>
		</ResponsiveDialogDrawer>
	);
}
