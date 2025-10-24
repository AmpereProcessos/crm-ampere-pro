import { TIndividualProcess } from "@/utils/schemas/process-flow.schema";
import { MdDashboard } from "react-icons/md";
import { Handle, NodeProps, Position } from "reactflow";
import ReturnDependentProcessBlock from "./ProcessSettingBlocks/ReturnDependentProcessBlock";

function ProjectNode(node: NodeProps<TIndividualProcess>) {
	const { id, data } = node;
	return (
		<>
			<div className="flex min-w-[700px] max-w-[700px] flex-col gap-2 rounded-sm border border-primary/50 bg-background p-6 ">
				<div className="flex items-center gap-1">
					<div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1">
						<MdDashboard />
					</div>
					<h1 className="text-xl font-black leading-none tracking-tight">PROJETO</h1>
				</div>
				<ReturnDependentProcessBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
			</div>
			<Handle type="source" position={Position.Bottom} id="project-source" />
		</>
	);
}

export default ProjectNode;
