import React, { useState } from "react";
import AnalysisVinculation from "./Blocks/AnalysisVinculation";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import GeneralInfo from "./Blocks/GeneralInfo";
import SystemInfo from "./Blocks/SystemInfo";
import PAInfo from "./Blocks/PAInfo";
import TransformerInfo from "./Blocks/TransformerInfo";
import StructureInfo from "./Blocks/StructureInfo";
import InstallationInfo from "./Blocks/InstallationInfo";
import ReviewInfo from "./Blocks/ReviewInfo";
import { IProposalInfo } from "@/utils/models";
type ProjectAlterationProps = {
	requestInfo: TTechnicalAnalysis;
	setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	resetSolicitationType: () => void;
	proposal: IProposalInfo | undefined;
	projectId?: string;
};
function ProjectAlteration({ requestInfo, setRequestInfo, resetSolicitationType, proposal, projectId }: ProjectAlterationProps) {
	const [stage, setStage] = useState(1);
	const [files, setFiles] = useState<{
		[key: string]: {
			title: string;
			file: File | null | string;
		};
	}>();
	return (
		<div className="flex w-full grow flex-col">
			{stage == 1 ? (
				<AnalysisVinculation
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					resetSolicitationType={resetSolicitationType}
					goToNextStage={() => setStage((prev) => prev + 1)}
				/>
			) : null}
			{stage == 2 ? (
				<GeneralInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={false}
					goToNextStage={() => setStage((prev) => prev + 1)}
					resetSolicitationType={resetSolicitationType}
					files={files}
					setFiles={setFiles}
				/>
			) : null}
			{stage == 3 ? (
				<SystemInfo
					requestInfo={requestInfo}
					proposal={proposal}
					setRequestInfo={setRequestInfo}
					requireFiles={false}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
				/>
			) : null}
			{stage == 4 ? (
				<PAInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={false}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}
			{stage == 5 ? (
				<TransformerInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={false}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}
			{stage == 6 ? (
				<StructureInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={false}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}
			{stage == 7 ? (
				<InstallationInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={false}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}
			{stage == 8 ? (
				<ReviewInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={false}
					goToNextStage={() => setStage((prev) => prev + 1)}
					files={files}
					setFiles={setFiles}
					projectId={projectId}
				/>
			) : null}
		</div>
	);
}

export default ProjectAlteration;
