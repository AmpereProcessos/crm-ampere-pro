import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import React, { useState } from "react";
import ProjectVinculation from "../ControlBlocks/ProjectVinculation";
import GeneralInfo from "../ControlBlocks/GeneralInfo";
import SystemInfo from "../ControlBlocks/SystemInfo";
import PAInfo from "../ControlBlocks/PAInfo";
import TransformerInfo from "../ControlBlocks/TransformerInfo";
import StructureInfo from "../ControlBlocks/StructureInfo";
import InstallationInfo from "../ControlBlocks/InstallationInfo";
import ReviewInfo from "../ControlBlocks/ReviewInfo";
type AmpliationProps = {
	requestInfo: TTechnicalAnalysis;
	setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	resetSolicitationType: () => void;
	projectId?: string;
};

function Ampliation({ requestInfo, setRequestInfo, resetSolicitationType, projectId }: AmpliationProps) {
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
				<ProjectVinculation
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
					requireFiles={!requestInfo.aumento?.id}
					goToNextStage={() => setStage((prev) => prev + 1)}
					resetSolicitationType={resetSolicitationType}
					files={files}
					setFiles={setFiles}
				/>
			) : null}
			{stage == 3 ? (
				<SystemInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={!requestInfo.aumento?.id}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
				/>
			) : null}
			{stage == 4 ? (
				<PAInfo
					requestInfo={requestInfo}
					setRequestInfo={setRequestInfo}
					requireFiles={!requestInfo.aumento?.id}
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
					requireFiles={!requestInfo.aumento?.id}
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
					requireFiles={!requestInfo.aumento?.id}
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
					requireFiles={!requestInfo.aumento?.id}
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
					requireFiles={!requestInfo.aumento?.id}
					goToNextStage={() => setStage((prev) => prev + 1)}
					files={files}
					setFiles={setFiles}
					projectId={projectId}
				/>
			) : null}
		</div>
	);
}

export default Ampliation;
