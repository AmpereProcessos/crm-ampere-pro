import ErrorComponent from "@/components/utils/ErrorComponent";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createManyProcessFlowReferences } from "@/utils/mutations/process-flow-references";
import { useProjectSettingStore } from "@/utils/process-settings/store";
import { useProcessFlows } from "@/utils/queries/process-flows";
import { TIndividualProcess } from "@/utils/schemas/process-flow.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaCodeBranch } from "react-icons/fa";
import ProcessFlowSelectionSetting from "./ProcessFlowSelectionSetting";

type ProcessFlowSelectionMenuProps = {
	projectId: string;
};
function ProcessFlowSelectionMenu({ projectId }: ProcessFlowSelectionMenuProps) {
	const queryClient = useQueryClient();
	const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
	const { data: flows, isLoading, isError, isSuccess } = useProcessFlows();

	const store = useProjectSettingStore();

	const activeFlow = flows ? flows.find((f) => f._id == activeFlowId) || null : null;
	const { mutate: handleCreateManyProcessFlowReferences, isPending } = useMutationWithFeedback({
		mutationKey: ["create-many-process-flow-references"],
		mutationFn: createManyProcessFlowReferences,
		queryClient: queryClient,
		affectedQueryKey: [],
	});
	console.log("EDGES", store.edges);
	console.log("NODES", store.nodes);
	return (
		<div className="flex w-full flex-col gap-2 rounded-sm border border-primary/80">
			<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">ESCOLHA DO FLUXO DE PROCESSOS</h1>
			<div className="flex w-full grow flex-col gap-2 p-2">
				<div className="flex w-full flex-wrap items-center justify-around gap-2">
					{isLoading ? <h1 className="w-full animate-pulse py-2 text-center font-medium tracking-tight text-primary/70">Carregando fluxos...</h1> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar fluxos de processo" /> : null}
					{isSuccess
						? flows.map((flow) => (
								<button
									key={flow._id}
									onClick={() => setActiveFlowId(flow._id)}
									className={`flex w-fit items-center gap-2 rounded border border-primary/50 p-2 text-primary/70 duration-300 ease-in-out ${
										flow._id == activeFlowId
											? "border-primary/80 bg-primary/80 text-primary-foreground"
											: "bg-transparent text-primary/70 hover:border-primary/80 hover:text-primary/80"
									}`}
								>
									<FaCodeBranch />
									<p className="text-sm font-bold">{flow.nome}</p>
								</button>
							))
						: null}
				</div>
				{activeFlow ? (
					<>
						<ProcessFlowSelectionSetting flow={activeFlow} />
						<div className="flex w-full items-center justify-end">
							<button
								disabled={isPending}
								onClick={() => {
									const individualProcess: TIndividualProcess[] = store.nodes.map((node) => {
										return {
											id: node.data.id,
											idProcessoPai: node.data.idProcessoPai,
											entidade: node.data.entidade,
											ativacao: node.data.ativacao,
											canvas: {
												id: node.id,
												posX: node.position.x,
												posY: node.position.y,
											},
										};
									});
									// @ts-ignore
									handleCreateManyProcessFlowReferences({ individualProcess, projectId });
								}}
								className="h-9 whitespace-nowrap rounded-sm bg-green-700 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-green-600 enabled:hover:text-primary-foreground"
							>
								DEFINIR FLUXO
							</button>
						</div>
					</>
				) : null}
			</div>
		</div>
	);
}

export default ProcessFlowSelectionMenu;
