import { nodeTypes, TProcessSettingNode } from '@/utils/process-settings/store';
import { TProcessFlowReferenceDTO } from '@/utils/schemas/process-flow-reference.schema';
import { nanoid } from 'nanoid';
import ReactFlow, { Background, Edge } from 'reactflow';

function getFlowNodes(flowReferences: TProcessFlowReferenceDTO[]) {
  const nodes: TProcessSettingNode[] = flowReferences.map((p) => ({
    id: p.canvas.id || '',
    data: {
      id: p.idProcesso,
      idProcessoPai: p.idProcessoPai,
      entidade: p.entidade,
      ativacao: {
        referencia: {
          identificacao: p.ativacao?.referencia.identificacao || 'Project',
        },
        gatilho: p.ativacao?.gatilho || { tipo: 'IGUAL_TEXTO', variavel: '' },
      },
      canvas: p.canvas,
    },
    position: { x: p.canvas.posX || 0, y: p.canvas.posY || 0 },
    type: p.entidade.identificacao.toLowerCase(),
  }));
  return nodes;
}
function getFlowEdges(flowReferences: TProcessFlowReferenceDTO[]) {
  const dependencyRelations = flowReferences.reduce((acc: { [key: string]: string[] }, current) => {
    const flowId = current.idProcesso;
    const fatherFlowId = current.idProcessoPai;
    if (!fatherFlowId) return acc;
    if (!acc[fatherFlowId]) acc[fatherFlowId] = [];
    acc[fatherFlowId].push(flowId);
    return acc;
  }, {});
  const edges: Edge[] = Object.entries(dependencyRelations)
    .map(([source, targets]) => {
      const sourceCanvasId = flowReferences.find((f) => f.idProcesso == source)?.canvas.id || '';
      return targets.map((target) => {
        const targetCanvasId = flowReferences.find((f) => f.idProcesso == target)?.canvas.id || '';
        return { id: nanoid(6), source: sourceCanvasId, target: targetCanvasId };
      });
    })
    .flat(1);
  return edges;
}

type ProcessFlowReferencesProps = {
  flowReferences: TProcessFlowReferenceDTO[];
};
function ProcessFlowReferences({ flowReferences }: ProcessFlowReferencesProps) {
  const nodes = getFlowNodes(flowReferences);
  const edges = getFlowEdges(flowReferences);
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/80'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground'>FLUXO DE PROCESSOS</h1>
      <p className='w-full text-center text-sm tracking-tight'>Visualize o fluxo de processos do projeto.</p>
      <div className='flex h-[700px] w-full flex-col rounded-sm border border-primary/50 p-2'>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} nodesFocusable={false} fitView>
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default ProcessFlowReferences;
