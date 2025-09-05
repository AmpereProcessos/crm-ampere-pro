import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { useActivitiesByOpportunityId } from "@/utils/queries/activities";
import { VscChromeClose } from "react-icons/vsc";
import ActivityCard from "../Cards/ActivityCard";
import OpportunityActivity from "../Cards/OpportunityActivity";
import OpportunityActivitySimplified from "../Cards/OpportunityActivitySimplified";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import ResponsiveDialogDrawerViewOnly from "../utils/ResponsiveDialogDrawerViewOnly";

type OpportunityActivitiesModalProps = {
	opportunityId: string;
	closeModal: () => void;
	session: TUserSession;
};
function OpportunityActivitiesModal({
	opportunityId,
	closeModal,
	session,
}: OpportunityActivitiesModalProps) {
	const {
		data: activities,
		isLoading,
		isError,
		isSuccess,
		error,
	} = useActivitiesByOpportunityId({
		opportunityId: opportunityId,
		openOnly: true,
		dueOnly: true,
	});

	return (
		<ResponsiveDialogDrawerViewOnly
			menuTitle="ATIVIDADES"
			menuDescription="Visualize as atividades da oportunidade"
			menuCancelButtonText="FECHAR"
			closeMenu={closeModal}
		>
			{isLoading ? (
				<p className="w-full text-center animate-pulse font-medium italic tracking-tight text-primary">
					Carregando atividades...
				</p>
			) : null}
			{isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
			{isSuccess ? (
				activities.length > 0 ? (
					activities.map((activity) => (
						<OpportunityActivity
							key={activity._id}
							activity={activity}
							opportunityId={opportunityId}
							session={session}
						/>
					))
				) : (
					<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
						Sem atividades adicionadas.
					</p>
				)
			) : null}
		</ResponsiveDialogDrawerViewOnly>
	);
}

export default OpportunityActivitiesModal;
