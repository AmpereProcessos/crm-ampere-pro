import { nodeTypes, TProcessSettingNode, useProjectSettingStore } from "@/utils/process-settings/store";
import { TProcessFlowDTO } from "@/utils/schemas/process-flow.schema";
import { useEffect } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

type ProcessFlowSelectionSettingProps = {
	flow: TProcessFlowDTO;
};
function ProcessFlowSelectionSetting({ flow }: ProcessFlowSelectionSettingProps) {
	const store = useProjectSettingStore();

	useEffect(() => {
		const nodes: TProcessSettingNode[] = flow.processos.map((p) => ({
			id: p.canvas.id || "",
			data: {
				id: p.id,
				idProcessoPai: p.idProcessoPai,
				entidade: p.entidade,
				ativacao: p.ativacao,
				canvas: p.canvas,
			},
			position: { x: p.canvas.posX || 0, y: p.canvas.posY || 0 },
			type: p.entidade.identificacao.toLowerCase(),
		}));
		const edges = flow.arestas;
		store.setNodesDirectly(nodes);
		store.setEdgesDirectly(edges);
	}, [flow]);
	return (
		<div className="flex h-[500px] w-full flex-col rounded-sm border border-primary/50 p-2">
			<ReactFlow
				nodes={store.nodes}
				edges={store.edges}
				nodeTypes={nodeTypes}
				onNodesChange={store.onNodesChange}
				onEdgesChange={store.onEdgesChange}
				onConnect={store.addEdge}
				fitView
			>
				<Background />
				<Controls />
			</ReactFlow>
		</div>
	);
}

export default ProcessFlowSelectionSetting;
