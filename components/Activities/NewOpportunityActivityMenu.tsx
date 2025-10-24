import { formatDateForInputValue, formatDateOnInputChange, formatNameAsInitials } from "@/lib/methods/formatting";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";

import type { TUserSession } from "@/lib/auth/session";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { createActivity } from "@/utils/mutations/activities";
import { useUsers } from "@/utils/queries/users";
import { TActivity } from "@/utils/schemas/activities.schema";
import { TUserDTO } from "@/utils/schemas/user.schema";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import DateTimeInput from "../Inputs/DateTimeInput";
import SelectWithImages from "../Inputs/SelectWithImages";
import TextInput from "../Inputs/TextInput";
import Avatar from "../utils/Avatar";

const variants = {
	hidden: {
		opacity: 0.2,
		transition: {
			duration: 0.8, // Adjust the duration as needed
		},
	},
	visible: {
		opacity: 1,
		transition: {
			duration: 0.8, // Adjust the duration as needed
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.01, // Adjust the duration as needed
		},
	},
};

type NewOpportunityActivityMenuProps = {
	session: TUserSession;
	opportunity: { id: string; nome: string };
	closeMenu: () => void;
};
function NewOpportunityActivityMenu({ session, opportunity, closeMenu }: NewOpportunityActivityMenuProps) {
	const queryClient = useQueryClient();
	const { data: users } = useUsers();
	const [newActivityMenuIsOpen, setNewActivityMenuIsOpen] = useState<boolean>(false);
	const [newResponsibleHolder, setNewResponsibleHolder] = useState<string | null>(null);

	const [newActivityHolder, setNewActivityHolder] = useState<TActivity>({
		idParceiro: session.user.idParceiro || "",
		titulo: "", // resume of the activity
		descricao: "", // description of what to be done
		responsaveis: [],
		oportunidade: opportunity,
		idHomologacao: undefined,
		idAnaliseTecnica: undefined,
		subatividades: [],
		dataVencimento: null,
		dataConclusao: null,
		dataInsercao: new Date().toISOString(),
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
	});
	function vinculateResponsible({ id, users }: { id: string | null; users: TUserDTO[] }) {
		if (!id) return toast.error("Escolha um usuário válido.");
		const user = users?.find((u: any) => u._id == id);
		if (!user) return;
		const newResponsible = {
			id: user._id as string,
			nome: user.nome as string,
			avatar_url: user.avatar_url as string | null,
		};
		const responsibles = [...newActivityHolder.responsaveis];
		responsibles.push(newResponsible);
		setNewActivityHolder((prev) => ({ ...prev, responsaveis: responsibles }));
	}
	function removeResponsible(index: number) {
		const responsibles = [...newActivityHolder.responsaveis];
		responsibles.splice(index, 1);
		return setNewActivityHolder((prev) => ({ ...prev, responsaveis: responsibles }));
	}
	const { mutate: handleCreateActivity } = useMutationWithFeedback({
		mutationKey: ["create-activity"],
		mutationFn: createActivity,
		queryClient: queryClient,
		affectedQueryKey: [],
	});
	return (
		<motion.div variants={GeneralVisibleHiddenExitMotionVariants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-2 p-2">
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-1/2 lg:w-full">
					<TextInput
						label="TÍTULO DA ATIVIDADE"
						placeholder="Preencha aqui o titulo a ser dado à atividade..."
						value={newActivityHolder.titulo}
						handleChange={(value) => setNewActivityHolder((prev) => ({ ...prev, titulo: value }))}
						width="100%"
					/>
				</div>
				<div className="w-1/2 lg:w-full">
					<DateTimeInput
						label="DATA DE VENCIMENTO"
						value={formatDateForInputValue(newActivityHolder.dataVencimento)}
						handleChange={(value) => setNewActivityHolder((prev) => ({ ...prev, dataVencimento: formatDateOnInputChange(value, "string") as string }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col rounded-md border border-primary/30 p-2 shadow-md">
				<h1 className="text-sm font-medium leading-none tracking-tight text-primary/70">DESCRIÇÃO DA ATIVIDADE</h1>
				<input
					value={newActivityHolder.descricao}
					onChange={(e) => setNewActivityHolder((prev) => ({ ...prev, descricao: e.target.value }))}
					type="text"
					placeholder="Preencha aqui uma descrição mais específica da atividade a ser feita..."
					className="w-full p-3 text-start text-sm outline-hidden"
				/>
			</div>
			<h1 className="text-sm font-medium leading-none tracking-tight text-primary/70">VINCULE RESPONSÁVEIS</h1>
			<div className="flex w-full items-center gap-2">
				<div className="flex items-end gap-2">
					<SelectWithImages
						label={"RESPONSÁVEL"}
						editable={true}
						showLabel={false}
						value={newResponsibleHolder}
						options={
							users?.map((resp) => ({
								id: resp._id,
								label: resp.nome,
								value: resp._id,
								url: resp.avatar_url || undefined,
								fallback: formatNameAsInitials(resp.nome),
							})) || []
						}
						handleChange={(value: any) => setNewResponsibleHolder(value)}
						onReset={() => setNewResponsibleHolder(null)}
						resetOptionLabel={"USUÁRIO NÃO DEFINIDO"}
					/>
					<button
						onClick={() => vinculateResponsible({ id: newResponsibleHolder, users: users || [] })}
						className="min-h-[46.6px]  rounded-sm border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 shadow-sm hover:bg-orange-500 hover:text-primary-foreground"
					>
						VINCULAR
					</button>
				</div>
			</div>
			<div className="flex w-full flex-wrap items-center justify-start gap-2">
				{newActivityHolder.responsaveis.map((resp, index) => (
					<div
						onClick={() => removeResponsible(index)}
						key={index}
						className="flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-500 p-2 shadow-md duration-300 ease-in-out hover:border-red-500 hover:bg-red-100"
					>
						<Avatar width={25} height={25} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
						<p className="text-sm font-medium tracking-tight text-primary/70">{resp.nome}</p>
					</div>
				))}
			</div>
			<div className="flex w-full items-center justify-between">
				<button
					onClick={() => closeMenu()}
					className="whitespace-nowrap rounded-sm bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					FECHAR
				</button>
				<button
					// @ts-ignore
					onClick={() => handleCreateActivity({ info: newActivityHolder })}
					className="whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					CRIAR ATIVIDADE
				</button>
			</div>
		</motion.div>
	);
}

export default NewOpportunityActivityMenu;
