import { useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { BsFillClipboardCheckFill } from "react-icons/bs";

import { LoadingButton } from "@/components/Buttons/loading-button";
import ErrorComponent from "@/components/utils/ErrorComponent";
import ContractInfo from "./ContractInfo";
import DeliveryInfo from "./DeliveryInfo";
import Documents from "./Documents";
import HomologationInfo from "./HomologationInfo";
import OtherServices from "./OtherServices";
import PaymentInfo from "./PaymentInfo";
import ProductsAndServices from "./ProductsAndServices";
import SignaturePlans from "./SignaturePlans";

import { getErrorMessage } from "@/lib/methods/errors";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import type { TContractRequest } from "@/utils/schemas//contract-request.schema";
import type { TProposalDTOWithOpportunity } from "@/utils/schemas/proposal.schema";

type ReviewProps = {
	proposal: TProposalDTOWithOpportunity;
	requestInfo: TContractRequest;
	setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
	documentsFile: { [key: string]: File | string | null };
	setDocumentsFile: React.Dispatch<React.SetStateAction<{ [key: string]: File | string | null }>>;
	handleRequestContract: () => void;
};
function Review({ proposal, requestInfo, setRequestInfo, documentsFile, setDocumentsFile, handleRequestContract }: ReviewProps) {
	const queryClient = useQueryClient();

	const { mutate, isPending, isSuccess, isError, error } = useMutationWithFeedback({
		queryClient: queryClient,
		mutationKey: ["create-ufv-contract-request"],
		// @ts-ignore
		mutationFn: handleRequestContract,
		affectedQueryKey: ["propose", proposal._id],
	});

	function requestContract() {
		const proposeId = proposal?._id || "";
		const projectResponsibleId = proposal?.oportunidadeDados?.responsaveis.find((r) => r.papel === "VENDEDOR")?.id;
		const kitCost = proposal?.precificacao?.find((c) => c.descricao.includes("KIT"))?.custoFinal;
		const opportunityId = proposal?.oportunidadeDados?.idMarketing;
		const clientEmail = requestInfo.email;
		// @ts-ignore
		mutate({
			requestInfo,
			projectId: opportunityId,
			proposeId,
			projectResponsibleId,
			kitCost,
			opportunityId,
			clientEmail,
		});
	}
	if (isSuccess) {
		return (
			<div className="flex w-full grow flex-col items-center justify-center gap-2 text-green-500">
				<BsFillClipboardCheckFill color="rgb(34,197,94)" size={35} />
				<p className="text-lg font-medium tracking-tight text-primary/70">Contrato solicitado com sucesso !</p>
			</div>
		);
	}
	if (isError) {
		return <ErrorComponent msg={getErrorMessage(error)} />;
	}
	return (
		<div className="flex w-full flex-col bg-background pb-2 gap-6 grow">
			<span className="px-4 py-2 bg-[#fead41] rounded-lg font-bold tracking-tight text-primary self-center w-fit text-center text-sm">
				REVISÃO DAS INFORMAÇÕES
			</span>
			<ContractInfo requestInfo={requestInfo} setRequestInfo={setRequestInfo} showActions={false} goToNextStage={() => {}} />
			<ProductsAndServices
				editable={true}
				requestInfo={requestInfo}
				setRequestInfo={setRequestInfo}
				showActions={false}
				goToNextStage={() => {}}
				goToPreviousStage={() => {}}
			/>
			<SignaturePlans
				proposal={proposal}
				requestInfo={requestInfo}
				setRequestInfo={setRequestInfo}
				showActions={false}
				goToNextStage={() => {}}
				goToPreviousStage={() => {}}
			/>
			<DeliveryInfo requestInfo={requestInfo} setRequestInfo={setRequestInfo} showActions={false} goToNextStage={() => {}} goToPreviousStage={() => {}} />
			<PaymentInfo requestInfo={requestInfo} setRequestInfo={setRequestInfo} showActions={false} goToNextStage={() => {}} goToPreviousStage={() => {}} />
			<HomologationInfo requestInfo={requestInfo} setRequestInfo={setRequestInfo} showActions={false} goToNextStage={() => {}} goToPreviousStage={() => {}} />
			<OtherServices requestInfo={requestInfo} setRequestInfo={setRequestInfo} showActions={false} goToNextStage={() => {}} goToPreviousStage={() => {}} />
			<Documents
				opportunityId={proposal.oportunidade.id}
				documentsFile={documentsFile}
				setDocumentsFile={setDocumentsFile}
				requestInfo={requestInfo}
				setRequestInfo={setRequestInfo}
				showActions={false}
				goToNextStage={() => {}}
				goToPreviousStage={() => {}}
			/>
			<div className="w-full flex items-center justify-end">
				<LoadingButton loading={isPending} onClick={() => requestContract()}>
					SOLICITAR CONTRATO
				</LoadingButton>
			</div>
		</div>
	);
}

export default Review;
