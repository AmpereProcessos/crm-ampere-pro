import React from "react";
import CheckboxInput from "../Inputs/CheckboxInput";
import { TActivityDTO } from "@/utils/schemas/activities.schema";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { editActivity } from "@/utils/mutations/activities";
import { useQueryClient } from "@tanstack/react-query";
import { renderDateDiffText } from "@/lib/methods/rendering";

type OpportunityActivitySimplifiedProps = {
	activity: TActivityDTO;
	opportunityId: string;
};
function OpportunityActivitySimplified({ activity, opportunityId }: OpportunityActivitySimplifiedProps) {
	const queryClient = useQueryClient();
	const { mutate: handleUpdateActivity } = useMutationWithFeedback({
		mutationKey: ["edit-activity", activity._id],
		mutationFn: editActivity,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-activities", opportunityId],
	});
	return (
		<div className="flex w-full flex-col border-b p-2">
			<div className="flex flex-col gap-2">
				<CheckboxInput
					labelFalse={activity.titulo}
					labelTrue={activity.titulo}
					checked={!!activity.dataConclusao}
					handleChange={() =>
						// @ts-ignore
						handleUpdateActivity({
							id: activity._id,
							changes: { dataConclusao: activity.dataConclusao ? null : new Date().toISOString() },
						})
					}
					padding="0.25rem"
				/>

				<div className="flex w-full items-center justify-end">{renderDateDiffText(activity.dataVencimento || "")}</div>
			</div>
		</div>
	);
}

export default OpportunityActivitySimplified;
