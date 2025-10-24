import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import CheckboxInput from "../Inputs/CheckboxInput";
import { TOpportunityActivity, TOpportunityActivityDTO } from "@/utils/schemas/opportunity-history.schema";
import { projectActivityTypes } from "@/utils/constants";
import { renderDateDiffText, renderIcon } from "@/lib/methods/rendering";
import { updateOpportunityHistory } from "@/utils/mutations/opportunity-history";

type SimplifiedActivityCardProps = {
	activity: TOpportunityActivityDTO;
	opportunityId: string;
};
function SimplifiedActivityCard({ activity, opportunityId }: SimplifiedActivityCardProps) {
	const queryClient = useQueryClient();
	const { mutate: handleOpportunityHistoryUpdate } = useMutationWithFeedback({
		mutationKey: ["update-opportunity-history", opportunityId],
		mutationFn: updateOpportunityHistory,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-history", opportunityId],
		callbackFn: () => queryClient.invalidateQueries({ queryKey: ["opportunity-open-activities", opportunityId] }),
	});
	return (
		<div className="flex w-full flex-col p-2">
			<div className="flex flex-col gap-2">
				<div className="flex w-full items-center justify-between">
					<div className="w-fit">
						<CheckboxInput
							labelFalse={activity.titulo}
							labelTrue={activity.titulo}
							checked={!!activity.dataConclusao}
							handleChange={() =>
								// @ts-ignore
								handleOpportunityHistoryUpdate({
									id: activity._id,
									changes: { dataConclusao: activity.dataConclusao ? null : new Date().toISOString() },
								})
							}
							padding="0.25rem"
						/>
					</div>
					<div className="flex items-center gap-1 text-blue-600">
						{renderIcon(projectActivityTypes[activity.tipo].icon)}
						<h1 className="w-full text-start text-xs leading-none tracking-tight ">{activity.tipo}</h1>
					</div>
				</div>

				<div className="flex w-full items-center justify-end">{renderDateDiffText(activity.dataVencimento || "")}</div>
			</div>
		</div>
	);
}

export default SimplifiedActivityCard;
