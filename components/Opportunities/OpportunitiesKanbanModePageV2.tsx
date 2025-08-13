import type { TUserSession } from "@/lib/auth/session";
import type { TGetOpportunitiesQueryDefinitionsOutput } from "@/pages/api/opportunities/query-definitions";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AiOutlinePlus, AiOutlineRight } from "react-icons/ai";
import SearchOpportunities from "./SearchOpportunities";
import { BsCalendarPlus, BsDownload, BsFillMegaphoneFill } from "react-icons/bs";
import { FaBolt, FaRotate } from "react-icons/fa6";
import { DndContext, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { useOpportunitiesKanbanView } from "@/utils/queries/opportunities";
import { GripVertical, Loader2, Share2 } from "lucide-react";
import { MdAttachMoney, MdDashboard } from "react-icons/md";
import { OPPORTUNITIES_FUNNEL_CONFIG, useOpportunitiesDragAndDropLogic } from "@/lib/funnels/opportunities-funnel-config";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "../ui/button";
import type { TGetOpportunitiesKanbanViewOutput } from "@/pages/api/opportunities/kanban";
import Link from "next/link";
import { formatToMoney } from "@/utils/methods";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";

type OpportunitiesKanbanModePageV2Props = {
	session: TUserSession;
	opportunityViewPreferences: TGetOpportunitiesQueryDefinitionsOutput["data"];
};
export default function OpportunitiesKanbanModePageV2({ session, opportunityViewPreferences }: OpportunitiesKanbanModePageV2Props) {
	const queryClient = useQueryClient();
	const [newProjectModalIsOpen, setNewProjectModalIsOpen] = useState(false);
	const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(opportunityViewPreferences.filterOptions.funnels[0].id || null);

	const selectedFunnel = opportunityViewPreferences.filterOptions.funnels.find((funnel) => funnel.id === selectedFunnelId);

	const { activeDragItem, handleOnDragStart, handleOnDragEnd, handleOnDragCancel } = useOpportunitiesDragAndDropLogic({
		globalQueryParams: opportunityViewPreferences.filterSelections,
		queryClient,
	});

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
				<div className="flex flex-col items-center border-b border-[#000] pb-2 gap-1">
					<div className="w-full flex items-center justify-between gap-2 flex-col lg:flex-row">
						<div className="flex items-center gap-1">
							<div className="text-xl font-black leading-none tracking-tight md:text-2xl">OPORTUNIDADES</div>
							{/* <button type="button" onClick={() => handleSetMode("card")} className="flex items-center gap-1 px-2 text-xs text-gray-500 duration-300 ease-out hover:text-gray-800">
								<FaRotate />
								<h1 className="font-medium">ALTERAR MODO</h1>
							</button> */}
						</div>

						<div className="flex grow flex-col items-center justify-end  gap-2 xl:flex-row">
							<button
								type="button"
								// onClick={() => handleExportData()}
								className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#2c6e49] p-2 px-3 text-sm font-medium text-white shadow-md duration-300 ease-in-out hover:scale-105"
							>
								<BsDownload style={{ fontSize: "18px" }} />
							</button>

							<SearchOpportunities />
							<button
								type="button"
								onClick={() => setNewProjectModalIsOpen(true)}
								className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#15599a] p-2 px-3 text-sm font-medium text-white shadow-md duration-300 ease-in-out hover:scale-105"
							>
								<AiOutlinePlus style={{ fontSize: "18px" }} />
							</button>
						</div>
					</div>
				</div>
				{selectedFunnel ? (
					<DndContext onDragStart={handleOnDragStart} onDragEnd={(event) => handleOnDragEnd({ funnelId: selectedFunnel.id, event })} onDragCancel={handleOnDragCancel}>
						<div className="flex items-start overflow-x-auto gap-2 flex-1 min-h-0 w-full max-w-full max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
							{selectedFunnel.stages.map((stage) => (
								<KanbanBoardStage key={stage.id} funnelId={selectedFunnel.id} stage={stage} globalQueryParams={opportunityViewPreferences.filterSelections} />
							))}
						</div>
						<DragOverlay>{activeDragItem ? <KanbanBoardStageCard stageId="" opportunity={activeDragItem} isDragOverlay={true} /> : null}</DragOverlay>
					</DndContext>
				) : null}
			</div>
		</div>
	);
}

type KanbanBoardStageProps = {
	funnelId: string;
	stage: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterOptions"]["funnels"][number]["stages"][number];
	globalQueryParams: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterSelections"];
};
function KanbanBoardStage({ funnelId, stage, globalQueryParams }: KanbanBoardStageProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const { isOver, setNodeRef } = useDroppable({
		id: stage.id,
		data: {
			stage,
		},
	});

	const {
		data: oppportunitesKanbanViewStage,
		isLoading,
		isError,
		isSuccess,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useOpportunitiesKanbanView({
		funnelId,
		funnelStage: stage.id,
		globalFilters: globalQueryParams,
	});

	const stageOpportunitiesMatched = oppportunitesKanbanViewStage?.pages[0]?.opportunitiesMatched || 0;
	const stageOpportunities = oppportunitesKanbanViewStage?.pages.flatMap((page) => page.opportunities) || [];

	return (
		<div className="flex flex-col gap-2 h-full" style={{ width: OPPORTUNITIES_FUNNEL_CONFIG.STAGE_WIDTH, minWidth: OPPORTUNITIES_FUNNEL_CONFIG.STAGE_MIN_WIDTH }}>
			<div className="w-full bg-primary text-primary-foreground flex flex-col gap-2 p-3 rounded-md">
				<div className="w-full flex items-center justify-center gap-2">
					<h1 className="text-sm font-medium text-center">{stage.label}</h1>
				</div>
				<div className="w-full flex items-center justify-center gap-2">
					<MdDashboard className="w-4 h-4" />
					<p className="text-xs">{stageOpportunitiesMatched}</p>
				</div>
			</div>

			<div
				ref={(node) => {
					setNodeRef(node);
					// Usar uma função de callback para atualizar o ref de forma segura
					if (node && parentRef.current !== node) {
						(parentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
					}
				}}
				className="flex flex-col flex-1 overflow-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30 gap-2"
			>
				{stageOpportunities.map((opportunity) => (
					<KanbanBoardStageCard key={opportunity._id} stageId={stage.id} opportunity={opportunity} />
				))}
			</div>

			{hasNextPage ? (
				<div className="flex items-center justify-center">
					<Button type="button" variant="ghost" onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
						{isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : hasNextPage ? "Carregar mais projetos" : null}
					</Button>
				</div>
			) : null}
		</div>
	);
}

function getBarColor({ isWon, isRequested, isLost }: { isWon: boolean; isRequested: boolean; isLost: boolean }) {
	if (isWon) return "bg-green-500";
	if (isRequested) return "bg-orange-400";
	if (isLost) return "bg-red-500";
	return "bg-blue-400";
}
type KanbanBoardStageCardProps = {
	stageId: string;
	opportunity: TGetOpportunitiesKanbanViewOutput["data"]["opportunities"][number];
	isDragOverlay?: boolean;
};
function KanbanBoardStageCard({ stageId, opportunity, isDragOverlay = false }: KanbanBoardStageCardProps) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: opportunity.referenciaFunil.id,
		data: {
			stageId,
			opportunity,
		},
		disabled: isDragOverlay, // Desabilita drag quando for overlay
	});
	const isWon = !!opportunity.ganho.data;
	const isRequested = !!opportunity.ganho?.dataSolicitacao;
	const isLost = !!opportunity.perda?.data;
	const style =
		!isDragOverlay && transform
			? {
					transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				}
			: undefined;
	return (
		<div ref={setNodeRef} style={style} className="w-full group flex flex-col border border-primary bg-[#fff] dark:bg-[#121212] rounded-md shadow-sm p-2 gap-1">
			<div
				{...listeners}
				{...attributes}
				className="absolute top-1 right-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-primary/10 hover:bg-primary/20"
				title="Arrastar para mover"
			>
				<GripVertical className="w-3 h-3 text-primary/60" />
			</div>
			<div className={`h-1 w-full rounded-sm  ${getBarColor({ isWon, isRequested, isLost })}`} />
			<div {...listeners} {...attributes} className="flex w-full flex-col gap-2">
				{isWon ? (
					<div className="z-8 absolute right-2 top-4 flex items-center justify-center text-green-500">
						<p className="text-sm font-medium italic">GANHO</p>
					</div>
				) : null}

				<div className="flex w-full flex-col">
					<div className="flex items-center gap-1">
						<h1 className="text-xs font-bold text-[#fead41]">{opportunity.identificador}</h1>
						{opportunity.idMarketing ? <BsFillMegaphoneFill color="#3e53b2" /> : null}
						{opportunity.idIndicacao ? <Share2 size={15} color="#06b6d4" /> : null}
					</div>
					<Link href={`/comercial/oportunidades/id/${opportunity._id}`} prefetch={false}>
						<h1 className="font-bold text-[#353432] hover:text-blue-400">{opportunity.nome}</h1>
					</Link>
					<div className="flex items-center gap-1">
						<MdDashboard />
						<h3 className="text-[0.6rem] font-light">{opportunity.tipo.titulo}</h3>
					</div>
				</div>
				{/* {item.proposta?.nome ? (
					<div className="my-2 flex w-full grow flex-col rounded-md border border-gray-300 p-2">
						<h1 className="text-[0.6rem] font-extralight text-gray-500">PROPOSTA ATIVA</h1>
						<div className="flex w-full flex-col justify-between">
							<p className="text-xs font-medium text-cyan-500">{item.proposta.nome}</p>
							<div className="flex  items-center justify-between">
								<div className="flex items-center gap-1">
									<FaBolt color="rgb(6,182,212)" />
									<p className="text-xs  text-gray-500">
										{formatDecimalPlaces(item.proposta.potenciaPico || 0)}
										kWp
									</p>
								</div>
								<div className="flex items-center gap-1">
									<MdAttachMoney color="rgb(6,182,212)" />
									<p className="text-xs  text-gray-500">{formatToMoney(item.proposta.valor)}</p>
								</div>
							</div>
						</div>
					</div>
				) : null} */}
				<div className="flex w-full items-center justify-between gap-2">
					<div className="flex grow flex-wrap items-center gap-2">
						{opportunity.responsaveis.map((resp) => {
							return (
								<div key={resp.id} className="flex items-center gap-1">
									<Avatar className="h-5 w-5 min-w-5 min-h-5">
										<AvatarImage src={resp.avatar_url || undefined} alt={resp.nome} />
										<AvatarFallback className="text-xs">{formatNameAsInitials(resp.nome)}</AvatarFallback>
									</Avatar>
								</div>
							);
						})}
					</div>

					<div className="ites-center flex min-w-fit gap-1">
						<BsCalendarPlus />
						<p className={"text-[0.65rem] font-medium text-gray-500"}>{formatDateAsLocale(opportunity.dataInsercao, true)}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
