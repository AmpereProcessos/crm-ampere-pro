import CheckboxInput from "@/components/Inputs/CheckboxInput";
import DateInput from "@/components/Inputs/DateInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { formatDateInputChange } from "@/lib/methods/formatting";
import { formatDateForInput } from "@/utils/methods";
import { TExpense, TExpensePaymentItem } from "@/utils/schemas/expenses.schema";
import { PaymentMethods } from "@/utils/select-options";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ExpensePaymentsTable from "./Utils/PaymentsTable";

type PaymentsInformationBlockProps = {
	infoHolder: TExpense;
	setInfoHolder: React.Dispatch<React.SetStateAction<TExpense>>;
};
function PaymentsInformationBlock({ infoHolder, setInfoHolder }: PaymentsInformationBlockProps) {
	const pendingTotal = infoHolder.total - infoHolder.pagamentos.reduce((acc, current) => current.valor + acc, 0);

	const [paymentHolder, setPaymentHolder] = useState<TExpensePaymentItem>({
		valor: 0,
		metodo: PaymentMethods[0].value,
		dataPagamento: null,
		efetivado: false,
	});
	function addPayment(receipt: TExpensePaymentItem) {
		if (receipt.valor > pendingTotal) return toast.error("Valor do novo pagamento não pode exceder o valor total pendente.");
		if (receipt.efetivado && !receipt.dataPagamento) return toast.error("Para pagamentos efetivados, preencher a data de pagamento.");

		const payments = [...infoHolder.pagamentos];
		payments.push({ ...receipt });
		setInfoHolder((prev) => ({ ...prev, pagamentos: payments }));
		const newPendingTotal = infoHolder.total - payments.reduce((acc, current) => current.valor + acc, 0);
		setPaymentHolder({ valor: newPendingTotal, metodo: PaymentMethods[0].value, dataPagamento: null, efetivado: false });
	}

	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES DE PAGAMENTO</h1>
			<div className="flex w-full flex-col gap-1">
				<div className="flex w-full items-center justify-center lg:justify-end">
					<DateInput
						label="DATA DE COMPETÊNCIA"
						value={formatDateForInput(infoHolder.dataCompetencia)}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, dataCompetencia: formatDateInputChange(value) || prev.dataCompetencia }))}
					/>
				</div>
				<h1 className="w-full bg-gray-500 p-1 text-center text-xs font-medium text-white">PAGAMENTOS DA DESPESA</h1>
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-[25%]">
							<NumberInput
								label="VALOR"
								placeholder="Preencha o valor do pagamento..."
								value={paymentHolder.valor}
								handleChange={(value) => setPaymentHolder((prev) => ({ ...prev, valor: value }))}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[25%]">
							<SelectInput
								label="MÉTODO DE PAGAMENTO"
								resetOptionLabel="NÃO DEFINIDO"
								options={PaymentMethods}
								value={paymentHolder.metodo}
								handleChange={(value) =>
									setPaymentHolder((prev) => ({
										...prev,
										metodo: value,
									}))
								}
								onReset={() => {
									setPaymentHolder((prev) => ({
										...prev,
										metodo: "UN",
									}));
								}}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[25%]">
							<DateInput
								label="DATA/PREVISÃO DE PAGAMENTO"
								value={formatDateForInput(paymentHolder.dataPagamento)}
								handleChange={(value) =>
									setPaymentHolder((prev) => ({
										...prev,
										dataPagamento: formatDateInputChange(value),
									}))
								}
								width="100%"
							/>
						</div>
						<div className="flex w-full items-center justify-center lg:w-[25%]">
							<div className="w-fit">
								<CheckboxInput labelFalse="PAGO" labelTrue="PAGO" checked={paymentHolder.efetivado} handleChange={(value) => setPaymentHolder((prev) => ({ ...prev, efetivado: value }))} />
							</div>
						</div>
					</div>
					<div className="flex items-center justify-end">
						<button className="rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700" onClick={() => addPayment(paymentHolder)}>
							ADICIONAR PAGAMENTO
						</button>
					</div>
				</div>
				<ExpensePaymentsTable infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			</div>
		</div>
	);
}

export default PaymentsInformationBlock;
