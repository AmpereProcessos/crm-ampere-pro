import { usePaymentMethods } from "@/utils/queries/payment-methods";
import { TProduct } from "@/utils/schemas/products.schema";
import React from "react";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import NumberInput from "../Inputs/NumberInput";

type ValuesInformationBlockProps = {
	infoHolder: TProduct;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProduct>>;
};
function ValuesInformationBlock({ infoHolder, setInfoHolder }: ValuesInformationBlockProps) {
	const { data: paymentMethods } = usePaymentMethods();

	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground">VALORES</h1>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="POTÊNCIA"
						placeholder="Preencha a potência do produto, se aplicável."
						value={infoHolder.potencia || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, potencia: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="GARANTIA"
						placeholder="Preencha a garantia do produto."
						value={infoHolder.garantia || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, garantia: value }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="VALOR DO PRODUTO"
						placeholder="Preencha o valor do produto."
						value={infoHolder.preco || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, preco: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<MultipleSelectInput
						label="MÉTODOS DE PAGAMENTO"
						selected={infoHolder.idsMetodologiasPagamento}
						options={
							paymentMethods?.map((type, index) => ({
								id: type._id,
								label: type.nome,
								value: type._id,
							})) || []
						}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value: string[] | []) =>
							setInfoHolder((prev) => ({
								...prev,
								idsMetodologiasPagamento: value,
							}))
						}
						onReset={() =>
							setInfoHolder((prev) => ({
								...prev,
								idsMetodologiasPagamento: [],
							}))
						}
						width="100%"
					/>
				</div>
			</div>
		</div>
	);
}

export default ValuesInformationBlock;
