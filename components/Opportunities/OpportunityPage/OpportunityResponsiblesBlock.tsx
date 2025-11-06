import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { useOpportunityCreators } from "@/utils/queries/users";
import type { TOpportunity, TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import { OpportunityResponsibilityRoles } from "@/utils/select-options";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { AiOutlineCheck } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import SelectInput from "../../Inputs/SelectInput";
import SelectWithImages from "../../Inputs/SelectWithImages";
import Avatar from "../../utils/Avatar";

import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { addResponsibleToOpportunity, removeResponsibleFromOpportunity, updateResponsibleInOpportunity } from "@/utils/mutations/opportunities";
import { BsCalendarPlus } from "react-icons/bs";
import { Check, ChevronDown, Diamond, Plus, Trash2, UsersRound, X } from "lucide-react";
import ResponsiveDialogDrawerSection from "../../utils/ResponsiveDialogDrawerSection";
import { Button } from "../../ui/button";
import { getErrorMessage } from "@/lib/methods/errors";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
type OpportunityResponsiblesBlockProps = {
	opportunityId: string;
	opportunityQueryKey: any;
	infoHolder: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	setInfoHolder: Dispatch<SetStateAction<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>>;
	handleUpdateOpportunity: any;
	session: TUserSession;
	callbacks: {
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
	};
};
function OpportunityResponsiblesBlock({
	opportunityId,
	opportunityQueryKey,
	infoHolder,
	setInfoHolder,
	handleUpdateOpportunity,
	session,
	callbacks,
}: OpportunityResponsiblesBlockProps) {
	const queryClient = useQueryClient();
	const { data: opportunityCreators } = useOpportunityCreators();
	const [newResponsibleMenuIsOpen, setNewResponsibleMenuIsOpen] = useState<boolean>(false);
	const [newOpportunityResponsible, setNewOpportunityResponsible] = useState<{
		nome: string | null;
		id: string | null;
		papel: string | null;
		avatar_url?: string | null;
	}>({
		nome: session.user.nome,
		id: session.user.id,
		papel: null,
		avatar_url: session.user.avatar_url,
	});

	const { mutate: handleAddResponsibleToOpportunity, isPending: isAddingResponsible } = useMutation({
		mutationKey: ["add-responsible-to-opportunity"],
		mutationFn: addResponsibleToOpportunity,
		onMutate: async (variables) => {
			const previousOpportunity = queryClient.getQueryData<TOpportunity>(["opportunity", opportunityId]);
			if (!previousOpportunity) return { previousOpportunity };

			queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, (old) => {
				if (!old) return old;
				const equivalentUser = opportunityCreators?.find((opCreator) => opCreator._id.toString() === variables.responsibleId);
				const newResponsible = {
					nome: equivalentUser?.nome || "",
					id: variables.responsibleId,
					papel: variables.responsibleRole,
					avatar_url: equivalentUser?.avatar_url || undefined,
					dataInsercao: new Date().toISOString(),
				};
				return {
					...old,
					responsaveis: old?.responsaveis ? [...old.responsaveis, newResponsible] : [newResponsible],
				};
			});
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data as string);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error, variables, context) => {
			await queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, context?.previousOpportunity);
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
	});

	const { mutate: handleUpdateResponsible, isPending: isUpdatingResponsible } = useMutation({
		mutationKey: ["update-responsible"],
		mutationFn: updateResponsibleInOpportunity,
		onMutate: async (variables) => {
			const previousOpportunity = queryClient.getQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey);
			if (!previousOpportunity) return { previousOpportunity };

			queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, (old) => {
				if (!old) return old;
				return {
					...old,
					responsaveis: old?.responsaveis?.map((responsible, index) =>
						index === variables.responsibleIndex ? { ...responsible, papel: variables.responsibleRole } : responsible,
					),
				};
			});
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data as string);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error, variables, context) => {
			await queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, context?.previousOpportunity);
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
	});
	const { mutate: handleResponsibleRemoval, isPending: isRemovingResponsible } = useMutation({
		mutationKey: ["remove-responsible-from-opportunity"],
		mutationFn: removeResponsibleFromOpportunity,
		onMutate: async (variables) => {
			const previousOpportunity = queryClient.getQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey);
			if (!previousOpportunity) return { previousOpportunity };

			queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, (old) => {
				if (!old) return old;
				return {
					...old,
					responsaveis: old?.responsaveis?.filter((responsible) => responsible.id !== variables.responsibleId),
				};
			});
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data as string);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error, variables, context) => {
			await queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, context?.previousOpportunity);
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
	});

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="RESPONSÁVEIS DA OPORTUNIDADE" sectionTitleIcon={<UsersRound className="w-4 h-4 min-w-4 min-h-4" />}>
			{infoHolder.responsaveis.map((resp, index) => (
				<OpportunityResponsibleCard
					key={`${resp.id}-${index.toString()}`}
					responsible={resp}
					updateResponsible={(newResponsibleRole) => handleUpdateResponsible({ opportunityId, responsibleIndex: index, responsibleRole: newResponsibleRole })}
					removeResponsible={() => handleResponsibleRemoval({ opportunityId, responsibleId: resp.id })}
				/>
			))}
			<div className="flex w-full items-center justify-end">
				<Button size={"xs"} variant="ghost" onClick={() => setNewResponsibleMenuIsOpen((prev) => !prev)} className="flex items-center gap-1">
					{newResponsibleMenuIsOpen ? <X className="h-4 w-4 min-h-4 min-w-4" /> : <Plus className="h-4 w-4 min-h-4 min-w-4" />}
					<p className="text-xs font-medium">{newResponsibleMenuIsOpen ? "FECHAR" : "ADICIONAR RESPONSÁVEL"}</p>
				</Button>
			</div>
			{newResponsibleMenuIsOpen ? (
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full gap-2">
						<div className="w-2/3">
							<SelectWithImages
								label="USUÁRIO"
								value={newOpportunityResponsible.id}
								options={
									opportunityCreators?.map((user) => ({
										id: user._id.toString(),
										label: user.nome,
										value: user._id.toString(),
										url: user.avatar_url || undefined,
									})) || []
								}
								handleChange={(value) => {
									const equivalentUser = opportunityCreators?.find((opCreator) => value === opCreator._id.toString());
									setNewOpportunityResponsible((prev) => ({
										...prev,
										id: equivalentUser?._id.toString() || "",
										nome: equivalentUser?.nome || "",
										avatar_url: equivalentUser?.avatar_url || null,
									}));
								}}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setNewOpportunityResponsible({
										nome: "",
										id: "",
										papel: "",
										avatar_url: null,
									})
								}
								width="100%"
							/>
						</div>
						<div className="w-1/3">
							<SelectInput
								label="PAPEL"
								value={newOpportunityResponsible.papel}
								options={OpportunityResponsibilityRoles}
								handleChange={(value) => setNewOpportunityResponsible((prev) => ({ ...prev, papel: value }))}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => setNewOpportunityResponsible((prev) => ({ ...prev, papel: null }))}
								width="100%"
							/>
						</div>
					</div>
					<div className="flex w-full items-center justify-end">
						<Button
							disabled={isAddingResponsible}
							size={"xs"}
							variant="ghost"
							onClick={() => {
								if (!newOpportunityResponsible.id || !newOpportunityResponsible.papel)
									return toast.error("Preencha todos os campos para adicionar um responsável.");
								handleAddResponsibleToOpportunity({
									opportunityId,
									responsibleId: newOpportunityResponsible.id,
									responsibleRole: newOpportunityResponsible.papel as "VENDEDOR" | "SDR" | "ANALISTA TÉCNICO",
								});
							}}
							className="flex items-center gap-1"
						>
							<Plus className="h-4 w-4 min-h-4 min-w-4" />
							<p className="text-xs font-medium">ADICIONAR</p>
						</Button>
					</div>
				</div>
			) : null}
		</ResponsiveDialogDrawerSection>
	);
}

export default OpportunityResponsiblesBlock;

type OpportunityResponsibleCardProps = {
	responsible: TOpportunity["responsaveis"][number];
	updateResponsible: (newResponsibleRole: "VENDEDOR" | "SDR" | "ANALISTA TÉCNICO") => void;
	removeResponsible: () => void;
};
function OpportunityResponsibleCard({ responsible, updateResponsible, removeResponsible }: OpportunityResponsibleCardProps) {
	return (
		<div className="flex w-full flex-col rounded-md border border-primary/30 p-3">
			<div className="flex w-full justify-between items-center gap-x-2 flex-col lg:flex-row gap-y-1">
				<div className="flex items-center gap-2">
					<Avatar url={responsible.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(responsible.nome)} />
					<h1 className="font-sans font-bold  text-primary">{responsible.nome}</h1>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size={"fit"} className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs">
							<Diamond className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
							<h3>{responsible.papel}</h3>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
						<DropdownMenuLabel>PAPEL</DropdownMenuLabel>
						<DropdownMenuGroup>
							{OpportunityResponsibilityRoles.map((role) => (
								<button key={role.id} type="button" className="w-full" onClick={() => updateResponsible(role.value as "VENDEDOR" | "SDR" | "ANALISTA TÉCNICO")}>
									<DropdownMenuItem className="flex items-center justify-between">
										<div className="flex items-center gap-1">
											<h1 className="text-sm lg:text-base">{role.label}</h1>
										</div>
										{responsible.papel === role.value ? <Check size={15} /> : null}
									</DropdownMenuItem>
								</button>
							))}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="mt-2 flex w-full items-center justify-between">
				<Button
					size={"fit"}
					variant="ghost"
					className="flex items-center gap-1 hover:bg-red-200 hover:text-red-600 px-2 py-1 transition-colors duration-300 ease-linear rounded-lg"
					onClick={removeResponsible}
				>
					<Trash2 className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
					<p className="text-[0.65rem] font-medium">REMOVER</p>
				</Button>
				<div className={"flex items-center gap-1"}>
					<BsCalendarPlus />
					<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(responsible.dataInsercao, true)}</p>
				</div>
			</div>
		</div>
	);
}
