import { DndContext, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeDollarSign, GripVertical, Loader2, MapPin, Settings, Share2, Zap } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BsCalendarPlus, BsDownload, BsFillMegaphoneFill } from "react-icons/bs";
import { MdDashboard } from "react-icons/md";
import { Sidebar } from "@/components/Sidebar";
import type { TUserSession } from "@/lib/auth/session";
import { OPPORTUNITIES_FUNNEL_CONFIG, useOpportunitiesDragAndDropLogic } from "@/lib/funnels/opportunities-funnel-config";
import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials, formatToMoney } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import type { TGetOpportunitiesKanbanViewOutput } from "@/pages/api/opportunities/kanban";
import type { TGetOpportunitiesQueryDefinitionsOutput, TUpdateOpportunityQueryDefinitionsInput } from "@/pages/api/opportunities/query-definitions";
import { updateOpportunitiesQueryDefinitions } from "@/utils/mutations/opportunities";
import { useOpportunitiesKanbanView } from "@/utils/queries/opportunities";
import { DEFAULT_KANBAN_CARD_BLOCKS, type TKanbanCardBlock, type TKanbanCardConfig } from "@/utils/schemas/funnel.schema";
import UserConectaIndicationCodeFlag from "../Conecta/UserConectaIndicationCodeFlag";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import { PeriodByFieldFilter } from "../Inputs/PeriodByFieldFilter";
import SelectInput from "../Inputs/SelectInput";
import KanbanCardConfigModal from "../Modals/Funnels/KanbanCardConfigModal";
import NewOpportunity from "../Modals/Opportunity/NewOpportunity";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import SearchOpportunities from "./SearchOpportunities";

type OpportunitiesKanbanModePageV2Props = {
	session: TUserSession;
	opportunityViewPreferences: TGetOpportunitiesQueryDefinitionsOutput["data"];
};
export default function OpportunitiesKanbanModePageV2({ session, opportunityViewPreferences }: OpportunitiesKanbanModePageV2Props) {
	const queryClient = useQueryClient();
	const [newProjectModalIsOpen, setNewProjectModalIsOpen] = useState(false);
	const [cardConfigModalIsOpen, setCardConfigModalIsOpen] = useState(false);
	const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(opportunityViewPreferences.filterOptions.funnels[0].id || null);

	const selectedFunnel = opportunityViewPreferences.filterOptions.funnels.find((funnel) => funnel.id === selectedFunnelId);

	const cardConfig = selectedFunnel?.configuracaoCartao ?? null;

	const { activeDragItem, handleOnDragStart, handleOnDragEnd, handleOnDragCancel } = useOpportunitiesDragAndDropLogic({
		globalQueryParams: opportunityViewPreferences.filterSelections,
		queryClient,
	});

	const { mutate: updateOpportunitiesQueryDefinitionsMutation, isPending } = useMutation({
		mutationKey: ["update-opportunities-query-definitions"],
		mutationFn: updateOpportunitiesQueryDefinitions,
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey: ["opportunities-query-definitions"] });

			const snapshot = queryClient.getQueryData(["opportunities-query-definitions"]) as TGetOpportunitiesQueryDefinitionsOutput["data"];
			if (snapshot) return { snapshot };

			await queryClient.setQueryData(["opportunities-query-definitions"], (prev: TGetOpportunitiesQueryDefinitionsOutput["data"]) => ({
				identificador: prev.identificador,
				mode: prev.mode,
				filterOptions: prev.filterOptions,
				filterSelections: {
					partnerIds: payload.preferences.filtrosKanban.parceirosIds ?? prev.filterSelections.partnerIds,
					responsiblesIds: payload.preferences.filtrosKanban.responsaveisIds ?? prev.filterSelections.responsiblesIds,
					opportunityTypeIds: payload.preferences.filtrosKanban.tiposOportunidadeIds ?? prev.filterSelections.opportunityTypeIds,
					period: payload.preferences.filtrosKanban.periodo
						? {
								field: payload.preferences.filtrosKanban.periodo.parametro ?? undefined,
								after: payload.preferences.filtrosKanban.periodo.depois ?? undefined,
								before: payload.preferences.filtrosKanban.periodo.antes ?? undefined,
							}
						: prev.filterSelections.period,
					cities: payload.preferences.filtrosKanban.cidades ?? prev.filterSelections.cities,
					ufs: payload.preferences.filtrosKanban.ufs ?? prev.filterSelections.ufs,
					segments: payload.preferences.filtrosKanban.segmentos ?? prev.filterSelections.segments,
					status: payload.preferences.filtrosKanban.status ?? prev.filterSelections.status,
					isFromMarketing: payload.preferences.filtrosKanban.viaMarketing ?? prev.filterSelections.isFromMarketing,
					isFromIndication: payload.preferences.filtrosKanban.viaIndicacao ?? prev.filterSelections.isFromIndication,
				},
			}));
			return { snapshot };
		},
		onSettled: async (data, error, variables, context) => {
			await queryClient.invalidateQueries({ queryKey: ["opportunities-query-definitions"] });
		},
		onError: (error, variables, context) => {
			if (context?.snapshot) queryClient.setQueryData(["opportunities-query-definitions"], context.snapshot);
		},
	});
	function updateOpportunitiesQueryDefinitionsMutationPartial(payload: Partial<TUpdateOpportunityQueryDefinitionsInput["preferences"]["filtrosKanban"]>) {
		updateOpportunitiesQueryDefinitionsMutation({
			preferences: {
				modo: opportunityViewPreferences.mode,
				identificador: opportunityViewPreferences.identificador,
				filtrosKanban: {
					parceirosIds: opportunityViewPreferences.filterSelections.partnerIds,
					responsaveisIds: opportunityViewPreferences.filterSelections.responsiblesIds,
					tiposOportunidadeIds: opportunityViewPreferences.filterSelections.opportunityTypeIds,
					periodo: {
						parametro: opportunityViewPreferences.filterSelections.period.field,
						depois: opportunityViewPreferences.filterSelections.period.after,
						antes: opportunityViewPreferences.filterSelections.period.before,
					},
					cidades: opportunityViewPreferences.filterSelections.cities,
					ufs: opportunityViewPreferences.filterSelections.ufs,
					segmentos: opportunityViewPreferences.filterSelections.segments,
					status: opportunityViewPreferences.filterSelections.status,
					viaMarketing: opportunityViewPreferences.filterSelections.isFromMarketing,
					viaIndicacao: opportunityViewPreferences.filterSelections.isFromIndication,
					...payload,
				},
				usuarioId: session.user.id,
			},
		});
	}
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6 gap-3">
				<div className="flex flex-col items-center border-b border-black pb-2 gap-1">
					<div className="w-full flex items-center justify-between gap-2 flex-col lg:flex-row">
						<div className="flex items-center gap-1">
							<div className="text-xl font-black leading-none tracking-tight md:text-2xl">OPORTUNIDADES</div>
						</div>

						<div className="flex grow flex-col items-center justify-end  gap-2 xl:flex-row">
							<button
								type="button"
								// onClick={() => handleExportData()}
								className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#2c6e49] p-2 px-3 text-sm font-medium text-primary-foreground shadow-md duration-300 ease-in-out hover:scale-105"
							>
								<BsDownload style={{ fontSize: "18px" }} />
							</button>

							<SearchOpportunities />
							{selectedFunnel ? (
								<button
									type="button"
									onClick={() => setCardConfigModalIsOpen(true)}
									title="Configurar cartão do Kanban"
									className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-primary/80 p-2 px-3 text-sm font-medium text-primary-foreground shadow-md duration-300 ease-in-out hover:scale-105 hover:bg-primary"
								>
									<Settings style={{ fontSize: "18px" }} className="w-[18px] h-[18px]" />
								</button>
							) : null}
							<button
								type="button"
								onClick={() => setNewProjectModalIsOpen(true)}
								className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#15599a] p-2 px-3 text-sm font-medium text-primary-foreground shadow-md duration-300 ease-in-out hover:scale-105"
							>
								<AiOutlinePlus style={{ fontSize: "18px" }} />
							</button>
						</div>
					</div>
					<div className="w-full flex flex-col lg:flex-row justify-between gap-2 items-center">
						<UserConectaIndicationCodeFlag sellerId={session.user.id} code={session.user.codigoIndicacaoConecta} />
						<div className="flex items-center justify-end flex-wrap gap-2">
							<button
								type="button"
								className={cn("flex items-center justify-center p-2 max-h-[36px] min-h-[36px] border border-[#3e53b2] rounded-md transition-colors", {
									"bg-[#3e53b2] text-primary-foreground": opportunityViewPreferences.filterSelections.isFromMarketing,
									"text-[#3e53b2]": !opportunityViewPreferences.filterSelections.isFromMarketing,
								})}
								onClick={() =>
									updateOpportunitiesQueryDefinitionsMutationPartial({ viaMarketing: !opportunityViewPreferences.filterSelections.isFromMarketing })
								}
							>
								<BsFillMegaphoneFill className="w-4 h-4" />
							</button>
							<button
								onClick={() =>
									updateOpportunitiesQueryDefinitionsMutationPartial({ viaIndicacao: !opportunityViewPreferences.filterSelections.isFromIndication })
								}
								type="button"
								className={cn("flex items-center justify-center p-2 max-h-[36px] min-h-[36px] border border-[#06b6d4] rounded-md transition-colors", {
									"bg-[#06b6d4] text-primary-foreground": opportunityViewPreferences.filterSelections.isFromIndication,
									"text-[#06b6d4]": !opportunityViewPreferences.filterSelections.isFromIndication,
								})}
							>
								<Share2 className="w-4 h-4" />
							</button>
							<PeriodByFieldFilter
								value={opportunityViewPreferences.filterSelections.period}
								handleChange={(v) =>
									updateOpportunitiesQueryDefinitionsMutationPartial({
										periodo: {
											depois: v?.after ?? undefined,
											antes: v?.before ?? undefined,
											parametro: v?.field as "dataInsercao" | "dataGanho" | "dataPerda" | "ultimaInteracao.data",
										},
									})
								}
								holderClassName="text-xs p-2 max-h-[36px] min-h-[36px]"
								fieldOptions={[
									{ id: 1, label: "DATA DE INSERÇÃO", value: "dataInsercao" },
									{ id: 2, label: "DATA DE GANHO", value: "dataGanho" },
									{ id: 3, label: "DATA DE PERDA", value: "dataPerda" },
									{ id: 4, label: "DATA DA ÚLTIMA INTERAÇÃO", value: "ultimaInteracao.data" },
								]}
							/>
							<div className="w-full lg:w-[250px]">
								<SelectInput
									showLabel={false}
									label="STATUS"
									labelClassName="text-[0.6rem]"
									holderClassName="text-xs p-2 min-h-[34px]"
									resetOptionLabel="EM ANDAMENTO"
									value={opportunityViewPreferences.filterSelections.status}
									options={[
										{ id: 1, label: "EM ANDAMENTO", value: "ongoing" },
										{ id: 2, label: "GANHOS", value: "won" },
										{ id: 3, label: "PERDIDOS", value: "lost" },
									]}
									handleChange={(selected) => {
										updateOpportunitiesQueryDefinitionsMutationPartial({ status: selected });
									}}
									onReset={() => updateOpportunitiesQueryDefinitionsMutationPartial({ status: undefined })}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[250px]">
								<MultipleSelectInput
									label="Usuários"
									labelClassName="text-[0.6rem]"
									holderClassName="text-xs p-2 min-h-[34px]"
									showLabel={false}
									resetOptionLabel="Todos"
									selected={opportunityViewPreferences.filterSelections.responsiblesIds}
									options={opportunityViewPreferences.filterOptions.responsibles}
									handleChange={(selected) => {
										updateOpportunitiesQueryDefinitionsMutationPartial({ responsaveisIds: selected as string[] });
									}}
									onReset={() => {
										if (!session.user.permissoes.oportunidades.escopo) {
											updateOpportunitiesQueryDefinitionsMutationPartial({ responsaveisIds: [] });
										} else {
											updateOpportunitiesQueryDefinitionsMutationPartial({ responsaveisIds: session.user.permissoes.oportunidades.escopo ?? [] });
										}
									}}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[250px]">
								<SelectInput
									label="Funis"
									labelClassName="text-[0.6rem]"
									holderClassName="text-xs p-2 min-h-[34px]"
									showLabel={false}
									resetOptionLabel="NÃO DEFINIDO"
									value={selectedFunnelId}
									options={opportunityViewPreferences.filterOptions.funnels}
									handleChange={(selected) => {
										setSelectedFunnelId(selected);
										// setFunnel(selected.value)
									}}
									onReset={() => {
										setSelectedFunnelId(selectedFunnelId);
									}}
									width="100%"
								/>
							</div>
						</div>
					</div>
				</div>
				{selectedFunnel ? (
					<DndContext
						onDragStart={handleOnDragStart}
						onDragEnd={(event) => handleOnDragEnd({ funnelId: selectedFunnel.id, event })}
						onDragCancel={handleOnDragCancel}
					>
						<div className="flex items-start overflow-x-auto gap-2 flex-1 min-h-0 w-full max-w-full max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
							{selectedFunnel.stages.map((stage) => (
								<KanbanBoardStage
									key={stage.id}
									funnelId={selectedFunnel.id}
									stage={stage}
									globalQueryParams={opportunityViewPreferences.filterSelections}
									cardConfig={cardConfig}
								/>
							))}
						</div>
						<DragOverlay>
							{activeDragItem ? <KanbanBoardStageCard stageId="" opportunity={activeDragItem} isDragOverlay={true} cardConfig={cardConfig} /> : null}
						</DragOverlay>
					</DndContext>
				) : null}
			</div>
			{newProjectModalIsOpen ? (
				<NewOpportunity
					session={session}
					opportunityCreators={opportunityViewPreferences.filterOptions.responsibles || []}
					funnels={opportunityViewPreferences.filterOptions.funnels || []}
					closeModal={() => setNewProjectModalIsOpen(false)}
				/>
			) : null}
			{cardConfigModalIsOpen && selectedFunnel ? (
				<KanbanCardConfigModal funnelId={selectedFunnel.id} currentConfig={cardConfig} closeModal={() => setCardConfigModalIsOpen(false)} />
			) : null}
		</div>
	);
}

type KanbanBoardStageProps = {
	funnelId: string;
	stage: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterOptions"]["funnels"][number]["stages"][number];
	globalQueryParams: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterSelections"];
	cardConfig: TKanbanCardConfig | null;
};
function KanbanBoardStage({ funnelId, stage, globalQueryParams, cardConfig }: KanbanBoardStageProps) {
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
		<div
			className="flex flex-col gap-2 h-full"
			style={{ width: OPPORTUNITIES_FUNNEL_CONFIG.STAGE_WIDTH, minWidth: OPPORTUNITIES_FUNNEL_CONFIG.STAGE_MIN_WIDTH }}
		>
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
					<KanbanBoardStageCard key={opportunity._id} stageId={stage.id} opportunity={opportunity} cardConfig={cardConfig} />
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

type TOpportunityCard = TGetOpportunitiesKanbanViewOutput["data"]["opportunities"][number];

function renderNativeBlock(chave: string, opportunity: TOpportunityCard) {
	switch (chave) {
		case "TIPO_OPORTUNIDADE":
			return (
				<div className="flex w-full flex-col">
					<div className="flex items-center gap-1">
						<MdDashboard />
						<h3 className="text-[0.6rem] font-light">{opportunity.tipo.titulo}</h3>
					</div>
				</div>
			);
		case "PROPOSTA_ATIVA":
			if (!opportunity.proposta) return null;
			return (
				<div className="flex w-full grow flex-col rounded-md border border-primary/30 p-2">
					<h1 className="text-[0.6rem] font-extralight text-primary/70">PROPOSTA ATIVA</h1>
					<div className="flex w-full flex-col justify-between">
						<p className="text-xs font-medium text-cyan-500">{opportunity.proposta.nome}</p>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1">
								<Zap className="text-cyan-500 w-4 h-4 min-w-4 min-h-4" />
								<p className="text-xs text-primary/70">
									{formatDecimalPlaces(opportunity.proposta.potenciaPico || 0)}
									kWp
								</p>
							</div>
							<div className="flex items-center gap-1">
								<BadgeDollarSign className="text-cyan-500 w-4 h-4 min-w-4 min-h-4" />
								<p className="text-xs text-primary/70">{formatToMoney(opportunity.proposta.valor)}</p>
							</div>
						</div>
					</div>
				</div>
			);
		case "RESPONSAVEIS_E_DATA":
			return (
				<div className="flex w-full items-center justify-between gap-2">
					<div className="flex grow flex-wrap items-center gap-2">
						{opportunity.responsaveis.map((resp) => (
							<div key={resp.id} className="flex items-center gap-1">
								<Avatar className="h-5 w-5 min-w-5 min-h-5">
									<AvatarImage src={resp.avatar_url || undefined} alt={resp.nome} />
									<AvatarFallback className="text-xs">{formatNameAsInitials(resp.nome)}</AvatarFallback>
								</Avatar>
							</div>
						))}
					</div>
					<div className="flex items-center min-w-fit gap-1">
						<BsCalendarPlus />
						<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(opportunity.dataInsercao, true)}</p>
					</div>
				</div>
			);
		case "INFO_CLIENTE": {
			const cliente = (opportunity as any).cliente;
			if (!cliente) return null;
			return (
				<div className="flex w-full flex-col gap-0.5">
					<p className="text-xs font-medium text-primary/90 truncate">{cliente.nome}</p>
					{cliente.telefonePrimario ? <p className="text-[0.6rem] text-primary/60">{cliente.telefonePrimario}</p> : null}
				</div>
			);
		}
		case "LOCALIZACAO": {
			const localizacao = (opportunity as any).localizacao;
			if (!localizacao?.cidade && !localizacao?.uf) return null;
			const parts = [localizacao.cidade, localizacao.uf].filter(Boolean);
			return (
				<div className="flex items-center gap-1">
					<MapPin className="w-3 h-3 text-primary/60 min-w-3 min-h-3" />
					<p className="text-[0.6rem] text-primary/70">{parts.join("/")}</p>
				</div>
			);
		}
		case "SEGMENTO": {
			const grupo = (opportunity as any).instalacao?.grupo;
			if (!grupo) return null;
			return (
				<div className="flex items-center">
					<span className="text-[0.6rem] px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary/70 font-medium">{grupo}</span>
				</div>
			);
		}
		default:
			return null;
	}
}

function renderCustomFieldBlock(fieldId: string, opportunity: TOpportunityCard) {
	const camposPersonalizados = (opportunity as any).camposPersonalizados;
	const fieldRef = camposPersonalizados?.[fieldId];
	if (!fieldRef?.valor) return null;

	const { campo, valor } = fieldRef;
	const label = campo?.nome || fieldId;

	let displayValue: string;
	if (typeof valor === "boolean") {
		displayValue = valor ? "SIM" : "NÃO";
	} else if (Array.isArray(valor)) {
		displayValue = valor.join(", ");
	} else if (valor instanceof Date || (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor))) {
		displayValue = formatDateAsLocale(valor as string) || "NÃO DEFINIDO";
	} else if (typeof valor === "number") {
		displayValue = String(valor);
	} else {
		displayValue = String(valor);
	}

	return (
		<div className="w-fit flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10">
			<p className="text-[0.65rem] text-primary uppercase">{label}</p>
			<p className="text-[0.65rem] text-primary truncate font-bold">{displayValue}</p>
		</div>
	);
}

type KanbanBoardStageCardProps = {
	stageId: string;
	opportunity: TOpportunityCard;
	isDragOverlay?: boolean;
	cardConfig: TKanbanCardConfig | null;
};
function KanbanBoardStageCard({ stageId, opportunity, isDragOverlay = false, cardConfig }: KanbanBoardStageCardProps) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: opportunity.referenciaFunil.id,
		data: {
			stageId,
			opportunity,
		},
		disabled: isDragOverlay,
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

	const blocks = cardConfig?.blocos ?? DEFAULT_KANBAN_CARD_BLOCKS;
	const activeBlocks = [...blocks].filter((b) => b.ativo).sort((a, b) => a.ordem - b.ordem);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="w-full group flex flex-col border border-primary bg-background dark:bg-[#121212] rounded-md shadow-xs p-2 gap-1 relative"
		>
			<div
				{...listeners}
				{...attributes}
				className="absolute top-1 right-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-sm bg-primary/30 hover:bg-primary/80 hover:text-primary-foreground"
				title="Arrastar para mover"
			>
				<GripVertical className="w-3 h-3" />
			</div>
			<div className={`h-1 w-full rounded-xs  ${getBarColor({ isWon, isRequested, isLost })}`} />
			<div className="w-full flex flex-col gap-1">
				<div className="flex items-center gap-1">
					<h1 className="text-xs font-bold text-[#fead41]">{opportunity.identificador}</h1>
					{opportunity.idMarketing ? <BsFillMegaphoneFill color="#3e53b2" /> : null}
					{opportunity.idIndicacao ? <Share2 size={15} color="#06b6d4" /> : null}
				</div>
				<Link href={`/comercial/oportunidades/id/${opportunity._id}`} prefetch={false}>
					<h1 className="font-bold text-primary hover:text-blue-400">{opportunity.nome}</h1>
				</Link>
			</div>
			{isWon ? (
				<div className="z-8 absolute right-2 top-4 flex items-center justify-center text-green-500">
					<p className="text-sm font-medium italic">GANHO</p>
				</div>
			) : null}
			<div {...listeners} {...attributes} className="w-full grow flex flex-col gap-2">
				{activeBlocks.map((block) => {
					const key = block.tipo === "NATIVO" ? block.chave : block.campoPersonalizadoId;
					const rendered =
						block.tipo === "NATIVO" ? renderNativeBlock(block.chave, opportunity) : renderCustomFieldBlock(block.campoPersonalizadoId, opportunity);
					if (!rendered) return null;
					return <div key={key}>{rendered}</div>;
				})}
			</div>
		</div>
	);
}
