import { TFractionnementItem, TPaymentMethodDTO } from "../schemas/payment-methods";
import { TProposalPaymentMethodItem } from "../schemas/proposal.schema";

export function getPaymentMethodFinalValue({ method, proposalValue }: { method: TPaymentMethodDTO | TProposalPaymentMethodItem; proposalValue: number }) {
	const finalValue = method.fracionamento.reduce((acc, current) => {
		const fractionnementPart = proposalValue * (current.porcentagem / 100);
		const fractionnementTotalWithInterest = fractionnementPart * (1 + current.taxaJuros / 100) ** (current.parcelas || current.maximoParcelas);
		const fractionnementTotalWithInterestWithUniqueTax = fractionnementTotalWithInterest * (1 + current.taxaUnica / 100);
		return acc + fractionnementTotalWithInterestWithUniqueTax;
	}, 0);
	return finalValue;
}

export function getFractionnementValue({ fractionnement, proposalValue }: { fractionnement: TFractionnementItem; proposalValue: number }) {
	const fractionnementPart = proposalValue * (fractionnement.porcentagem / 100);
	const fractionnementTotalWithInterest = getFractionnementValueWithInterest({ fractionnementPart, fractionnementInfo: fractionnement });
	const fractionnementTotalWithInterestWithUniqueTax = fractionnementTotalWithInterest * (1 + fractionnement.taxaUnica / 100);
	return fractionnementTotalWithInterestWithUniqueTax;
}
function getFractionnementValueWithInterest({
	fractionnementPart,
	fractionnementInfo,
}: {
	fractionnementPart: number;
	fractionnementInfo: TFractionnementItem;
}) {
	const interestRate = fractionnementInfo.taxaJuros;
	// Calculating fractionnement value total with simple interests
	if (fractionnementInfo.modalidade == "SIMPLES")
		return fractionnementPart + fractionnementPart * (interestRate / 100) * (fractionnementInfo.parcelas || fractionnementInfo.maximoParcelas);
	// Calculating fractionnement value total with composed interests
	if (fractionnementInfo.modalidade == "COMPOSTOS")
		return fractionnementPart * (1 + interestRate / 100) ** (fractionnementInfo.parcelas || fractionnementInfo.maximoParcelas);

	return fractionnementPart * (1 + interestRate / 100) ** (fractionnementInfo.parcelas || fractionnementInfo.maximoParcelas);
}
