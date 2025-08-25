import CheckboxInput from "@/components/Inputs/CheckboxInput";
import { useActivityStore } from "@/utils/stores/activity-store";
import { Link } from "lucide-react";

export type TActivityVinculations = {
	opportunity?: {
		blocked: boolean;
		id: string;
		name: string;
		identifier: string;
	};
	homologation?: {
		blocked: boolean;
		id: string;
	};
	technicalAnalysis?: {
		blocked: boolean;
		id: string;
	};
};

function ActivityVinculationsBlock({ vinculations }: { vinculations: TActivityVinculations }) {
	const opportunityId = useActivityStore((s) => s.activity.oportunidade.id);
	const homologationId = useActivityStore((s) => s.activity.idHomologacao);
	const technicalAnalysisId = useActivityStore((s) => s.activity.idAnaliseTecnica);
	const updateActivity = useActivityStore((s) => s.updateActivity);
	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<Link size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">VINCULAÇÕES</h1>
			</div>
			<div className="flex w-full flex-col gap-3">
				<div className="flex w-full flex-wrap items-center justify-center gap-2">
					{opportunityId ? (
						<div className="w-fit">
							<CheckboxInput
								labelFalse="VINCULAR À OPORTUNIDADE"
								labelTrue="VINCULAR À OPORTUNIDADE"
								checked={!!opportunityId}
								editable={!vinculations.opportunity?.blocked}
								handleChange={(value) =>
									updateActivity({
										oportunidade: value ? { id: vinculations.opportunity?.id, nome: vinculations.opportunity?.name } : undefined,
									})
								}
							/>
						</div>
					) : null}
					{homologationId ? (
						<div className="w-fit">
							<CheckboxInput
								labelFalse="VINCULAR À HOMOLOGACAO"
								labelTrue="VINCULAR À HOMOLOGACAO"
								checked={!!homologationId}
								editable={!vinculations.homologation?.blocked}
								handleChange={(value) =>
									updateActivity({
										idHomologacao: value ? vinculations.homologation?.id : undefined,
									})
								}
							/>
						</div>
					) : null}
					{technicalAnalysisId ? (
						<div className="w-fit">
							<CheckboxInput
								labelFalse="VINCULAR À ANALISE TÉCNICA"
								labelTrue="VINCULAR À ANALISE TÉCNICA"
								checked={!!technicalAnalysisId}
								editable={!vinculations.technicalAnalysis?.blocked}
								handleChange={(value) =>
									updateActivity({
										idAnaliseTecnica: value ? vinculations.technicalAnalysis?.id : undefined,
									})
								}
							/>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default ActivityVinculationsBlock;
