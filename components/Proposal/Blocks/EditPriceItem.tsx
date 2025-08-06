import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import { getCalculatedFinalValue, getProfitMargin, getSalePrice } from "@/utils/pricing/methods";
import { TPricingItem } from "@/utils/schemas/proposal.schema";
import React from "react";
import { VscChromeClose } from "react-icons/vsc";
type EditPriceItemProps = {
	itemIndex: number;
	pricing: TPricingItem[];
	setPricing: React.Dispatch<React.SetStateAction<TPricingItem[]>>;
	closeModal: () => void;
};
function EditPriceItem({ itemIndex, pricing, setPricing, closeModal }: EditPriceItemProps) {
	const { custoFinal, margemLucro, valorCalculado, valorFinal, faturavel } = pricing[itemIndex];
	return (
		<div id="edit-pricing-item" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-fit w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px]  lg:w-[30%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-wrap items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">ALTERAÇÃO DE PREÇOS</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<div className="w-full self-center lg:w-[50%]">
							<NumberInput
								label="CUSTO"
								value={custoFinal}
								placeholder="Valor de custo..."
								handleChange={(value) => {
									const newSalePrice = getCalculatedFinalValue({ value: value, margin: margemLucro / 100 });
									const pricingCopy = [...pricing];
									const newPricing = pricingCopy.map((copy, copyIndex) => {
										if (itemIndex == copyIndex) {
											return { ...copy, custoFinal: value, valorFinal: newSalePrice };
										}
										return copy;
									});
									// pricingCopy[itemIndex].custoFinal = value
									// pricingCopy[itemIndex].valorFinal = newSalePrice
									setPricing(newPricing);
								}}
								width="100%"
							/>
						</div>
						<div className="w-full self-center lg:w-[50%]">
							<NumberInput
								label="MARGEM DE LUCRO"
								value={margemLucro ? Number(margemLucro.toFixed(2)) : 0}
								placeholder="Valor da margem de lucro..."
								handleChange={(value) => {
									const newSalePrice = getCalculatedFinalValue({ value: custoFinal, margin: value / 100 });
									console.log("NOVO VALOR DE VENDA", newSalePrice);
									const pricingCopy = [...pricing];
									const newPricing = pricingCopy.map((copy, copyIndex) => {
										if (itemIndex == copyIndex) {
											return { ...copy, margemLucro: value, valorFinal: newSalePrice };
										}
										return copy;
									});
									// pricingCopy[itemIndex].margemLucro = value
									// pricingCopy[itemIndex].valorFinal = newSalePrice
									setPricing(newPricing);
								}}
								width="100%"
							/>
						</div>
						<div className="my-2 flex w-fit items-center justify-center self-center">
							<CheckboxInput
								labelFalse="FATURÁVEL"
								labelTrue="FATURÁVEL"
								checked={faturavel}
								justify="justify-center"
								handleChange={(value) => {
									const pricingCopy = [...pricing];
									pricingCopy[itemIndex].faturavel = value;
									setPricing(pricingCopy);
								}}
							/>
						</div>
						<div className="w-full self-center lg:w-[50%]">
							<NumberInput
								label="PREÇO DE VENDA"
								value={valorFinal}
								placeholder="Valor de venda final..."
								handleChange={(value) => {
									const newMargin = getProfitMargin(custoFinal, value);
									console.log(newMargin);
									const pricingCopy = [...pricing];
									const newPricing = pricingCopy.map((copy, copyIndex) => {
										if (itemIndex == copyIndex) {
											return { ...copy, margemLucro: newMargin * 100, valorFinal: value };
										}
										return copy;
									});
									// pricingCopy[itemIndex].margemLucro = newMargin * 100
									// pricingCopy[itemIndex].valorFinal = value
									setPricing(newPricing);
								}}
								width="100%"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default EditPriceItem;
