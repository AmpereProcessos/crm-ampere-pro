import { getHoursDiff } from "@/lib/methods/dates";
import { formatDateAsLocale, formatDecimalPlaces } from "@/lib/methods/formatting";
import { deleteFunnelReference, updateFunnelReference } from "@/utils/mutations/funnel-references";
import type { TFunnelReferenceDTO } from "@/utils/schemas/funnel-reference.schema";
import type { TFunnelDTO } from "@/utils/schemas/funnel.schema";
import type { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsCalendarPlus, BsFunnelFill } from "react-icons/bs";
import { FaClipboardList } from "react-icons/fa";
import { MdTimer } from "react-icons/md";
import { TbDownload, TbUpload } from "react-icons/tb";
import { getErrorMessage } from "@/lib/methods/errors";
import { Check, Funnel, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type GetFunnelInfoParams = {
	funnelId: TFunnelReferenceDTO["idFunil"];
	funnels: TFunnelDTO[] | undefined;
};
function getFunnelInfo({ funnelId, funnels }: GetFunnelInfoParams) {
	if (!funnels) return { funnelLabel: null, funnelStageLabel: null, stageOptions: [] };

	const funnel = funnels.find((f) => f._id == funnelId);
	if (!funnel) return { funnelLabel: null, funnelStageLabel: null, stageOptions: [] };
	const funnelLabel = funnel.nome;

	const stageOptions = funnel.etapas.map((e) => ({ id: e.id, value: e.id.toString(), label: e.nome }));

	return { funnelLabel, stageOptions };
}

type RenderLogsParams = {
	activeStageId: string | number;
	stages: TFunnelReferenceDTO["estagios"];
	funnelId: TFunnelReferenceDTO["idFunil"];
	funnels: TFunnelDTO[] | undefined;
};
function renderLogs({ activeStageId, stages, funnelId, funnels }: RenderLogsParams) {
	if (!funnels) return [];
	const funnel = funnels.find((f) => f._id == funnelId);
	if (!funnel) return [];
	return Object.entries(stages).map(([key, value], index) => {
		const label = funnel.etapas.find((e) => e.id.toString() == key.toString())?.nome || "NÃO DEFINIDO";
		const isActive = key.toString() == activeStageId;
		const arrival = value.entrada ? formatDateAsLocale(value.entrada, true) : null;
		const exit = value.saida ? formatDateAsLocale(value.saida, true) : null;
		const diff = value.entrada && value.saida ? getHoursDiff({ start: value.entrada, finish: value.saida }) : null;
		return (
			<div className="flex w-full items-center justify-between">
				<h1 className="text-[0.55rem] font-bold text-cyan-500">
					{label} {isActive ? <strong className="text-[#fead41]">(ATIVO)</strong> : null}
				</h1>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<TbDownload color="rgb(22,163,74)" />
						<p className="text-[0.55rem] text-primary/70">{arrival || "-"}</p>
					</div>
					<div className="flex items-center gap-1">
						<TbUpload color="rgb(220,38,38)" />
						<p className="text-[0.55rem] text-primary/70">{exit || "-"}</p>
					</div>
					{diff ? (
						<div className="flex items-center gap-1">
							<MdTimer color="rgb(37,99,235)" />
							<p className="text-[0.55rem] text-primary/70">{formatDecimalPlaces(diff, 0, 2)}h</p>
						</div>
					) : null}
				</div>
			</div>
		);
	});
}

type OpportunityFunnelReferenceProps = {
	reference: TFunnelReferenceDTO;
	referenceIndex: number;
	funnels: TFunnelDTO[] | undefined;
	opportunityId: string;
	opportunityQueryKey: any;
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	setOpportunity: React.Dispatch<React.SetStateAction<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>>;
	callbacks: {
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
	};
};
function OpportunityFunnelReference({ reference, referenceIndex, funnels, opportunityId, opportunityQueryKey, opportunity, setOpportunity, callbacks }: OpportunityFunnelReferenceProps) {
	const queryClient = useQueryClient();
	const [logsMenuIsOpen, setLogsMenuIsOpen] = useState<boolean>(false);
	const { funnelLabel, stageOptions } = getFunnelInfo({ funnelId: reference.idFunil, funnels });

	// Updating
	async function updateOpportunityFunnelReference({ id, newStageId }: { id: string; newStageId: string }) {
		try {
			const response = await updateFunnelReference({ funnelReferenceId: id, newStageId: newStageId });
			return "Referência de funil atualizada com sucesso !";
		} catch (error) {
			throw error;
		}
	}
	const { mutate: handleUpdateOpportunityFunnelReference, isPending: isUpdatingFunnelReference } = useMutation({
		mutationKey: ["update-funnel-reference"],
		mutationFn: updateOpportunityFunnelReference,
		onMutate: async (variables) => {
			const previousOpportunity = queryClient.getQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey);
			if (!previousOpportunity) return { previousOpportunity };

			queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, (old) => {
				if (!old) return old;
				return {
					...old,
					referenciasFunil: old?.referenciasFunil?.map((fr, index) =>
						index === referenceIndex ? { ...fr, idEstagioFunil: variables.newStageId } : fr,
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

	// Deleting
	async function removeFunnelReference({ funnelReferenceId }: { funnelReferenceId: string }) {
		if (opportunity.referenciasFunil.length === 1) throw new Error("Não é possível remover a única referência de funil da oportunidade.");
		const response = await deleteFunnelReference({ id: funnelReferenceId });
		return response;
	}
	const { mutate: handleRemoveFunnelReference, isPending: isRemovingFunnelReference } = useMutation({
		mutationKey: ["remove-funnel-reference"],
		mutationFn: removeFunnelReference,
		onMutate: async (variables) => {
			const previousOpportunity = queryClient.getQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey);
			if (!previousOpportunity) return { previousOpportunity };

			queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, (old) => {
				if (!old) return old;
				return {
					...old,
					referenciasFunil: old?.referenciasFunil?.filter((fr) => fr._id !== variables.funnelReferenceId),
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
	const currentStageLabel = stageOptions.find((opt) => opt.value === reference.idEstagioFunil.toString())?.label || "CARREGANDO...";

	return (
		<div className="flex w-full flex-col rounded-md border border-primary/30 p-3">
			<div className="flex w-full justify-between items-center gap-x-2 flex-col lg:flex-row gap-y-1">
				<div className="flex items-center gap-2">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-primary/30 p-1">
						<Funnel className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
					</div>
					<h1 className="font-sans font-bold text-primary">{funnelLabel || "CARREGANDO..."}</h1>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size={"fit"} className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs">
							<BsFunnelFill className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
							<h3>{currentStageLabel}</h3>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
						<DropdownMenuLabel>ESTÁGIO</DropdownMenuLabel>
						<DropdownMenuGroup>
							{stageOptions.map((stage) => (
								<button
									key={stage.id}
									type="button"
									className="w-full"
									onClick={() => handleUpdateOpportunityFunnelReference({ id: reference._id, newStageId: stage.value })}
								>
									<DropdownMenuItem className="flex items-center justify-between">
										<div className="flex items-center gap-1">
											<h1 className="text-sm lg:text-base">{stage.label}</h1>
										</div>
										{reference.idEstagioFunil.toString() === stage.value ? <Check size={15} /> : null}
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
					onClick={() => handleRemoveFunnelReference({ funnelReferenceId: reference._id })}
					disabled={isRemovingFunnelReference}
				>
					<Trash2 className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
					<p className="text-[0.65rem] font-medium">REMOVER</p>
				</Button>
				<div className="flex items-center gap-1">
					<BsCalendarPlus />
					<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(reference.dataInsercao, true)}</p>
				</div>
			</div>
			<div className="mt-2 flex w-full items-center justify-start">
				<button
					type="button"
					onClick={() => setLogsMenuIsOpen((prev) => !prev)}
					className="flex items-center gap-1 py-1 text-[0.6rem] text-primary/70 hover:text-primary transition-colors"
				>
					<FaClipboardList />
					<p className="font-medium">{logsMenuIsOpen ? "OCULTAR HISTÓRICO" : "MOSTRAR HISTÓRICO"}</p>
				</button>
			</div>
			{logsMenuIsOpen ? (
				<div className="mt-2 flex w-full flex-col gap-2 rounded-md border border-primary/20 bg-primary/5 p-2">
					{renderLogs({ activeStageId: reference.idEstagioFunil, stages: reference.estagios, funnelId: reference.idFunil, funnels: funnels })}
				</div>
			) : null}
		</div>
	);
}

export default OpportunityFunnelReference;
