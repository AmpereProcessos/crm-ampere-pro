import { deleteFunnelReference, updateFunnelReference } from "@/utils/mutations/funnel-references";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { TFunnelReferenceDTO } from "@/utils/schemas/funnel-reference.schema";
import { TFunnelDTO } from "@/utils/schemas/funnel.schema";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { BsFunnelFill } from "react-icons/bs";
import { MdDelete, MdTimer } from "react-icons/md";
import SelectInput from "../Inputs/SelectInput";
import { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import toast from "react-hot-toast";
import { FaClipboardList } from "react-icons/fa";
import { TbDownload, TbUpload } from "react-icons/tb";
import { formatDateAsLocale, formatDecimalPlaces } from "@/lib/methods/formatting";
import { getHoursDiff } from "@/lib/methods/dates";

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
						<p className="text-[0.55rem] text-gray-500">{arrival || "-"}</p>
					</div>
					<div className="flex items-center gap-1">
						<TbUpload color="rgb(220,38,38)" />
						<p className="text-[0.55rem] text-gray-500">{exit || "-"}</p>
					</div>
					{diff ? (
						<div className="flex items-center gap-1">
							<MdTimer color="rgb(37,99,235)" />
							<p className="text-[0.55rem] text-gray-500">{formatDecimalPlaces(diff, 0, 2)}h</p>
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
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	setOpportunity: React.Dispatch<React.SetStateAction<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>>;
};
function OpportunityFunnelReference({ reference, referenceIndex, funnels, opportunity, setOpportunity }: OpportunityFunnelReferenceProps) {
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
	const { mutate: handleUpdateOpportunityFunnelReference, isPending } = useMutationWithFeedback({
		mutationKey: ["update-funnel-reference"],
		mutationFn: updateOpportunityFunnelReference,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-by-id", reference.idOportunidade],
	});

	// Deleting
	async function removeFunnelReference({
		funnelReferenceToRemoveIndex,
		opportunityFunnelReferences,
	}: {
		funnelReferenceToRemoveIndex: number;
		opportunityFunnelReferences: TFunnelReferenceDTO[];
	}) {
		try {
			if (opportunityFunnelReferences.length == 1) return toast.error("Não é possível remover a única referência de funil da oportundiade.");

			const funnelReferenceId = opportunityFunnelReferences[funnelReferenceToRemoveIndex]._id;
			const response = await deleteFunnelReference({ id: funnelReferenceId });
			const newReferences = [...opportunity.referenciasFunil];
			newReferences.splice(funnelReferenceToRemoveIndex, 1);
			setOpportunity((prev) => ({ ...prev, referenciasFunil: newReferences }));
			return response;
		} catch (error) {
			throw error;
		}
	}
	const { mutate: handleRemoveFunnelReference, isPending: removeFunnelReferencePending } = useMutationWithFeedback({
		mutationKey: ["remove-funnel-reference"],
		mutationFn: removeFunnelReference,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-by-id", opportunity._id],
	});
	return (
		<div className="flex w-full flex-col rounded-md border border-gray-300 p-3">
			<div className="flex w-full items-center gap-2">
				<div className="flex items-center gap-2">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
						<BsFunnelFill />
					</div>
					<h1 className="font-sans font-bold  text-[#353432]">{funnelLabel || "CARREGANDO..."}</h1>
				</div>
				<div className="flex grow items-center justify-end gap-2">
					<button
						onClick={() =>
							// @ts-ignore
							handleRemoveFunnelReference({ funnelReferenceToRemoveIndex: referenceIndex, opportunityFunnelReferences: opportunity.referenciasFunil })
						}
						type="button"
						className="flex items-center justify-center gap-2 rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
					>
						<MdDelete style={{ color: "red" }} size={15} />
					</button>
					<button
						disabled={isPending}
						onClick={() =>
							// @ts-ignore
							handleUpdateOpportunityFunnelReference({ id: reference._id, newStageId: reference.idEstagioFunil })
						}
						className="flex items-end justify-center text-green-200 duration-300 ease-in-out disabled:text-gray-500 enabled:hover:text-green-500"
					>
						<AiOutlineCheck
							style={{
								fontSize: "18px",
								// color: infoHolder.responsaveis[index].papel != info.responsaveis[index].papel ? 'rgb(34,197,94)' : 'rgb(156,163,175)',
								color: "rgb(34,197,94)",
							}}
						/>
					</button>
				</div>
			</div>
			<div className="mt-1 flex grow">
				<SelectInput
					label="ESTÁGIO"
					showLabel={false}
					value={reference.idEstagioFunil.toString()}
					options={stageOptions}
					handleChange={(value) => {
						const references = [...opportunity.referenciasFunil];
						references[referenceIndex].idEstagioFunil = value.toString();
						setOpportunity((prev) => ({ ...prev, referenciasFunil: references }));
					}}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() => {
						const references = [...opportunity.referenciasFunil];
						references[referenceIndex].idEstagioFunil = opportunity.referenciasFunil[referenceIndex].idEstagioFunil;
						setOpportunity((prev) => ({ ...prev, referenciasFunil: references }));
					}}
					width="100%"
				/>
			</div>
			<div className="mt-1 flex w-full items-center justify-start">
				<button onClick={() => setLogsMenuIsOpen((prev) => !prev)} className="flex items-center gap-1 py-1 text-[0.6rem] text-gray-500">
					<FaClipboardList />
					<p className="font-medium">MOSTRAR HISTÓRICO</p>
				</button>
			</div>
			{logsMenuIsOpen ? (
				<div className="flex w-full flex-col gap-2">
					{renderLogs({ activeStageId: reference.idEstagioFunil, stages: reference.estagios, funnelId: reference.idFunil, funnels: funnels })}
				</div>
			) : null}
		</div>
	);
}

export default OpportunityFunnelReference;
