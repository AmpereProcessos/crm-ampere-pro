import type { TGetOpportunitiesKanbanViewInput, TGetOpportunitiesKanbanViewOutput } from "@/pages/api/opportunities/kanban";
import { updateFunnelReference } from "@/utils/mutations/funnel-references";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { type InfiniteData, type QueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";

export const OPPORTUNITIES_FUNNEL_CONFIG = {
	STAGE_WIDTH: 400,
	STAGE_MIN_WIDTH: 400,
	VIRTUALIZED_HEIGHT: 400,
	ESTIMATED_ITEM_SIZE: 150,
	OVERSCAN: 3,
} as const;

async function updateOpportunityKanbanConnection({
	funnelReferenceId,
	funnelId,
	newFunnelStageId,
	previousFunnelStageId,
}: { funnelReferenceId: string; funnelId: string; newFunnelStageId: string; previousFunnelStageId: string }) {
	return await updateFunnelReference({ funnelReferenceId, newStageId: newFunnelStageId });
}

type UseDragAndDropLogicParams = {
	globalQueryParams: Omit<TGetOpportunitiesKanbanViewInput, "page" | "funnelId" | "funnelStage">;
	queryClient: QueryClient;
};
export const useOpportunitiesDragAndDropLogic = ({ globalQueryParams, queryClient }: UseDragAndDropLogicParams) => {
	const [activeDragItem, setActiveDragItem] = useState<TGetOpportunitiesKanbanViewOutput["data"]["opportunities"][number] | null>(null);

	const { mutate: updateOpportunityKanbanConnectionMutation, isPending: isUpdateLoading } = useMutation({
		mutationKey: ["update-opportunity-kanban-connection"],
		mutationFn: updateOpportunityKanbanConnection,
		onMutate: async ({ funnelReferenceId, funnelId, newFunnelStageId, previousFunnelStageId }) => {
			// Canceling ongoing queries to avoid race conditions
			await Promise.all([
				queryClient.cancelQueries({ queryKey: ["opportunities-kanban-view", funnelId, previousFunnelStageId, globalQueryParams] }),
				queryClient.cancelQueries({ queryKey: ["opportunities-kanban-view", funnelId, newFunnelStageId, globalQueryParams] }),
			]);

			// Getting the previous stage query snapshot
			const previousKanbanStageQuerySnapshot = queryClient.getQueryData(["opportunities-kanban-view", funnelId, previousFunnelStageId, globalQueryParams]) as InfiniteData<
				TGetOpportunitiesKanbanViewOutput["data"]
			>;

			// Getting the next stage query snapshot
			const nextKanbanStageQuerySnapshot = queryClient.getQueryData(["opportunities-kanban-view", funnelId, newFunnelStageId, globalQueryParams]) as InfiniteData<
				TGetOpportunitiesKanbanViewOutput["data"]
			>;

			let movedOpportunity: any = null;
			if (previousKanbanStageQuerySnapshot) {
				const updatedPreviousStagePages = previousKanbanStageQuerySnapshot.pages.map((page) => {
					const opportunityIndex = page.opportunities.findIndex((p) => p.referenciaFunil.id === funnelReferenceId);
					if (opportunityIndex !== -1) {
						// Found the opportunity in this page
						movedOpportunity = page.opportunities[opportunityIndex];
						return {
							...page,
							opportunitiesMatched: page.opportunitiesMatched - 1,
							opportunities: page.opportunities.filter((p) => p.referenciaFunil.id !== funnelReferenceId),
						};
					}
					return page;
				});
				const updatedPreviousKanbanStageQuerySnapshot = {
					...previousKanbanStageQuerySnapshot,
					pages: updatedPreviousStagePages,
				};

				// Atualizar o snapshot do estágio anterior
				queryClient.setQueryData(["opportunities-kanban-view", funnelId, previousFunnelStageId, globalQueryParams], updatedPreviousKanbanStageQuerySnapshot);
			}

			// Adicionar o projeto ao novo estágio (na primeira página)
			if (nextKanbanStageQuerySnapshot && movedOpportunity) {
				const updatedNewStagePages = [...nextKanbanStageQuerySnapshot.pages];

				// Se não há páginas, criar a primeira
				if (updatedNewStagePages.length === 0) {
					updatedNewStagePages.push({
						opportunities: [movedOpportunity],
						opportunitiesMatched: 1,
						nextCursor: null,
						previousCursor: null,
					});
				} else {
					// Adicionar na primeira página
					updatedNewStagePages[0] = {
						...updatedNewStagePages[0],
						opportunitiesMatched: (updatedNewStagePages[0]?.opportunitiesMatched || 0) + 1,
						opportunities: [movedOpportunity, ...(updatedNewStagePages[0]?.opportunities || [])],
						nextCursor: updatedNewStagePages[0]?.nextCursor || null,
						previousCursor: updatedNewStagePages[0]?.previousCursor || null,
					};
				}

				const updatedNextKanbanStageQuerySnapshot = {
					...nextKanbanStageQuerySnapshot,
					pages: updatedNewStagePages,
				};

				// Atualizar o snapshot do novo estágio
				queryClient.setQueryData(["opportunities-kanban-view", funnelId, newFunnelStageId, globalQueryParams], updatedNextKanbanStageQuerySnapshot);
			}

			// Returning the previous and next stage query snapshots
			return { previousKanbanStageQuerySnapshot, nextKanbanStageQuerySnapshot };
		},
		onError: (err, { funnelReferenceId, funnelId, newFunnelStageId, previousFunnelStageId }, context) => {
			// Restaurar os snapshots originais em caso de erro
			if (context?.previousKanbanStageQuerySnapshot) {
				queryClient.setQueryData(["opportunities-kanban-view", funnelId, previousFunnelStageId, globalQueryParams], context.previousKanbanStageQuerySnapshot);
			}

			if (context?.nextKanbanStageQuerySnapshot) {
				queryClient.setQueryData(["opportunities-kanban-view", funnelId, newFunnelStageId, globalQueryParams], context.nextKanbanStageQuerySnapshot);
			}
		},
		onSettled: async (_, error, { funnelId, newFunnelStageId, previousFunnelStageId }) => {
			await queryClient.invalidateQueries({ queryKey: ["opportunities-kanban-view", funnelId, newFunnelStageId, globalQueryParams] });
			await queryClient.invalidateQueries({ queryKey: ["opportunities-kanban-view", funnelId, previousFunnelStageId, globalQueryParams] });
		},
	});

	const handleOnDragStart = (event: DragStartEvent) => {
		const draggedOpportunity = event.active.data.current?.opportunity as TGetOpportunitiesKanbanViewOutput["data"]["opportunities"][number] | undefined;
		setActiveDragItem(draggedOpportunity || null);
	};

	const handleOnDragEnd = ({ funnelId, event }: { funnelId: string; event: DragEndEvent }) => {
		const { active, over } = event;

		console.log("EVENT", {
			active,
			over,
		});
		const opportunityId = active.id as string;
		const newStageId = over?.id as string | undefined;
		const previousStageId = active.data.current?.stageId;

		// Limpa o item ativo do drag
		setActiveDragItem(null);

		if (!opportunityId || !newStageId || !previousStageId) return;

		if (newStageId === previousStageId) return;
		return updateOpportunityKanbanConnectionMutation({
			funnelReferenceId: opportunityId,
			funnelId,
			newFunnelStageId: newStageId,
			previousFunnelStageId: previousStageId,
		});
	};

	const handleOnDragCancel = () => {
		setActiveDragItem(null);
	};

	return {
		activeDragItem,
		isUpdateLoading,
		handleOnDragStart,
		handleOnDragEnd,
		handleOnDragCancel,
	};
};
