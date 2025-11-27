import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { usePaymentMethodsPersonalized } from "@/utils/queries/payment-methods";
import type { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import type { TProjectTypeDTO } from "@/utils/schemas/project-types.schema";
import type { TProposal, TProposalPaymentMethodItem } from "@/utils/schemas/proposal.schema";
import PaymentMethodCard from "../Blocks/PaymentMethodCard";

type PaymentProps = {
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	opportunityProjectType: TProjectTypeDTO;
	moveToNextStage: () => void;
	moveToPreviousStage: () => void;
	applicablePaymentMethodsIds: string[];
	session: TUserSession;
};
function Payment({
	infoHolder,
	setInfoHolder,
	opportunityProjectType,
	moveToNextStage,
	moveToPreviousStage,
	applicablePaymentMethodsIds,
	session,
}: PaymentProps) {
	console.log(infoHolder.kits);
	const {
		data: paymentMethods,
		isLoading,
		isSuccess,
		isError,
	} = usePaymentMethodsPersonalized({
		methodologyIds: applicablePaymentMethodsIds,
		kitsIds: infoHolder.kits.map((k) => k.id),
		plansIds: infoHolder.planos.map((p) => p.id),
		productsIds: infoHolder.produtos.map((p) => p.id || ""),
		servicesIds: infoHolder.servicos.map((s) => s.id || ""),
	});
	const [selectedMethods, setSelectedMethods] = useState<TProposalPaymentMethodItem[]>([]);
	const proposalValue = infoHolder.valor;
	function addMethod(method: TProposalPaymentMethodItem) {
		const methods = [...selectedMethods];
		methods.push(method);
		setSelectedMethods(methods);
	}
	const validPaymentMethods = paymentMethods?.filter((method) => opportunityProjectType.metodosPagamento.some((m) => m.id === method._id)) ?? [];

	function handleProceed() {
		if (!validPaymentMethods) return toast.error("Erro ao buscar métodos de pagamento.");
		if (validPaymentMethods.length > 0 && selectedMethods.length === 0) return toast.error("Selecione ao menos um método de pagamento a ser aplicável.");
		setInfoHolder((prev) => ({ ...prev, pagamento: { ...prev.pagamento, metodos: selectedMethods } }));
		return moveToNextStage();
	}

	return (
		<div className="flex w-full flex-col gap-4 py-4">
			<h1 className="font-Raleway font-bold text-primary/80">MÉTODOS DE PAGAMENTO</h1>
			<div className="flex w-full items-center justify-center">
				<h1 className="text-center text-xs font-medium italic text-[#fead61] lg:text-base">
					Nessa etapa, você pode escolher os métodos de pagamento aplicáveis para essa proposta. Os métodos escolhidos serão utilizados para compor o documento
					de apresentação das propostas.
				</h1>
			</div>
			{isLoading ? <LoadingComponent /> : null}
			{isError ? <ErrorComponent msg="Erro ao buscar metodologias de pagamento" /> : null}
			{isSuccess ? (
				validPaymentMethods.length > 0 ? (
					validPaymentMethods.map((method, index) => (
						<PaymentMethodCard
							index={index}
							key={method._id}
							method={method}
							proposalValue={proposalValue}
							selectedMethods={selectedMethods}
							updateSelectedMethods={(updatedMethods) => setSelectedMethods(updatedMethods)}
							selectMethod={(id) => addMethod(id)}
							removeMethod={(id) => {
								const filtered = [...selectedMethods].filter((s) => s.id !== id);
								setSelectedMethods(filtered);
							}}
						/>
					))
				) : (
					<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
						Nenhum método de pagamento disponível.
					</p>
				)
			) : null}
			<div className="flex w-full items-center justify-between gap-2 px-1">
				<button type="button" onClick={() => moveToPreviousStage()} className="rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105">
					Voltar
				</button>
				<button type="button" onClick={handleProceed} className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground">
					{selectedMethods.length > 0 ? "Prosseguir" : "Prosseguir sem métodos de pagamento"}
				</button>
			</div>
		</div>
	);
}

export default Payment;
