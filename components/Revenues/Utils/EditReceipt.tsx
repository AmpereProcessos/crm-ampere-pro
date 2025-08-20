import CheckboxInput from "@/components/Inputs/CheckboxInput";
import DateInput from "@/components/Inputs/DateInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { formatDateForInputValue } from "@/utils/methods";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { editRevenuePersonalized } from "@/utils/mutations/revenues";
import { TReceipt } from "@/utils/schemas/revenues.schema";
import { PaymentMethods } from "@/utils/select-options";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

type EditReceiptProps = {
	receipt: TReceipt;
	affectedQueryKey: any[];
};
function EditReceipt({ receipt, affectedQueryKey }: EditReceiptProps) {
	console.log(receipt);
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TReceipt["recebimentos"]>(receipt.recebimentos);

	const {
		mutate: handleUpdateReceipt,
		isPending,
		isError,
		isSuccess,
	} = useMutationWithFeedback({
		mutationKey: ["edit-revenue-receipt", receipt._id, receipt.indexRecebimento],
		mutationFn: editRevenuePersonalized,
		queryClient: queryClient,
		affectedQueryKey: affectedQueryKey,
	});
	return (
		<DialogContent className="w-[90%] sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Editar Recebimento</DialogTitle>
				<DialogDescription>Atualize as informações do recebimento.</DialogDescription>
			</DialogHeader>
			<div className="flex w-full flex-col items-center gap-2">
				<div className="w-full">
					<NumberInput
						label="VALOR"
						placeholder="Preencha o valor do recebimento..."
						value={infoHolder.valor}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, valor: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full">
					<SelectInput
						label="MÉTODO DE PAGAMENTO"
						resetOptionLabel="NÃO DEFINIDO"
						options={PaymentMethods}
						value={infoHolder.metodo}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								metodo: value,
							}))
						}
						onReset={() => {
							setInfoHolder((prev) => ({
								...prev,
								metodo: "UN",
							}));
						}}
						width="100%"
					/>
				</div>
				<div className="w-full">
					<DateInput
						label="DATA/PREVISÃO DE RECEBIMENTO"
						value={formatDateForInputValue(infoHolder.dataRecebimento)}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								dataRecebimento: formatDateOnInputChange(value),
							}))
						}
						width="100%"
					/>
				</div>
				<div className="flex w-full items-center justify-center">
					<div className="w-fit">
						<CheckboxInput labelFalse="RECEBIDO" labelTrue="RECEBIDO" checked={infoHolder.efetivado} handleChange={(value) => setInfoHolder((prev) => ({ ...prev, efetivado: value }))} />
					</div>
				</div>
			</div>
			<DialogFooter>
				<Button
					disabled={isPending}
					onClick={() => {
						// @ts-ignore
						handleUpdateReceipt({
							id: receipt._id,
							changes: {
								[`recebimentos.${receipt.indexRecebimento}`]: infoHolder,
							},
						});
					}}
					type="submit"
					className="text-xs"
				>
					SALVAR ALTERAÇÃO
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

export default EditReceipt;
