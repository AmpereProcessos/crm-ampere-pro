import NewActivityMenu from "@/components/Activities/NewActivityMenu";
import PurchaseActivity from "@/components/Cards/PurchaseActivity";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import { useActivitiesByPurchaseId } from "@/utils/queries/activities";
import { TPurchase } from "@/utils/schemas/purchase.schema";
import type { TUserSession } from "@/lib/auth/session";
import React from "react";

type PendencyBlockProps = {
	purchaseId: string;
	project: TPurchase["projeto"];
	session: TUserSession;
};
function PendencyBlock({ purchaseId, project, session }: PendencyBlockProps) {
	const { data: activities, isLoading, isError, isSuccess } = useActivitiesByPurchaseId({ purchaseId });
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">PENDÊNCIAS</h1>
			<NewActivityMenu
				session={session}
				opportunity={{}}
				project={{ id: project.id, nome: project.nome }}
				purchaseId={purchaseId}
				affectedQueryKey={["purchase-activities", purchaseId]}
			/>
			<div className="mt-2 flex w-full flex-col gap-1">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Houve um erro ao buscar atividades da compra." /> : null}
				{isSuccess ? (
					activities.length > 0 ? (
						activities.map((activity, index) => <PurchaseActivity key={activity._id} activity={activity} purchaseId={purchaseId} />)
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">Sem atividades adicionadas.</p>
					)
				) : null}
			</div>
		</div>
	);
}

export default PendencyBlock;
