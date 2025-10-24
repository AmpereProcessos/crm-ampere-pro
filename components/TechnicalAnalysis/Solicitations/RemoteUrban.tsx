import React, { useState } from "react";
import GeneralInfo from "../Stages/GeneralInfo";
import SystemInfo from "../Stages/SystemInfo";
import PAInfo from "../Stages/PAInfo";
import TransformerInfo from "../Stages/TransformerInfo";
import StructureInfo from "../Stages/StructureInfo";
import InstallationInfo from "../Stages/InstallationInfo";
import ReviewInfo from "../Stages/ReviewInfo";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { TFileHolder } from "@/utils/schemas/file-reference.schema";
import type { TUserSession } from "@/lib/auth/session";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";

type RemoteUrbanProps = {
	session: TUserSession;
	infoHolder: TTechnicalAnalysis;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	resetSolicitationType: () => void;
	files: TFileHolder;
	setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
	activeProposalId: TOpportunity["idPropostaAtiva"];
	handleRequestAnalysis: ({ info, files }: { info: TTechnicalAnalysis; files: TFileHolder }) => void;
};
function RemoteUrban({
	session,
	infoHolder,
	setInfoHolder,
	files,
	setFiles,
	activeProposalId,
	resetSolicitationType,
	handleRequestAnalysis,
}: RemoteUrbanProps) {
	const [stage, setStage] = useState(1);

	return (
		<div className="flex h-full w-full flex-col">
			{stage == 1 ? (
				<GeneralInfo
					infoHolder={infoHolder}
					setInfoHolder={setInfoHolder}
					goToNextStage={() => setStage((prev) => prev + 1)}
					resetSolicitationType={resetSolicitationType}
					files={files}
					setFiles={setFiles}
				/>
			) : null}
			{stage == 2 ? (
				<SystemInfo
					infoHolder={infoHolder}
					setInfoHolder={setInfoHolder}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					session={session}
					activeProposalId={activeProposalId}
				/>
			) : null}
			{stage == 3 ? (
				<PAInfo
					infoHolder={infoHolder}
					setInfoHolder={setInfoHolder}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}

			{stage == 4 ? (
				<TransformerInfo
					infoHolder={infoHolder}
					setInfoHolder={setInfoHolder}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}

			{stage == 5 ? (
				<StructureInfo
					infoHolder={infoHolder}
					setInfoHolder={setInfoHolder}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}

			{stage == 6 ? (
				<InstallationInfo
					infoHolder={infoHolder}
					setInfoHolder={setInfoHolder}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
				/>
			) : null}

			{stage == 7 ? (
				<ReviewInfo
					session={session}
					infoHolder={infoHolder}
					setInfoHolder={setInfoHolder}
					goToNextStage={() => setStage((prev) => prev + 1)}
					goToPreviousStage={() => setStage((prev) => prev - 1)}
					files={files}
					setFiles={setFiles}
					handleRequestAnalysis={handleRequestAnalysis}
				/>
			) : null}
		</div>
	);
}

export default RemoteUrban;
