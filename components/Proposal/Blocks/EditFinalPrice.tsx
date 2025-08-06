import NumberInput from "@/components/Inputs/NumberInput";
import { formatDecimalPlaces } from "@/lib/methods/formatting";
import { getPricingSuggestedTotal, getPricingTotal, getProfitMargin } from "@/utils/pricing/methods";
import { TPricingItem } from "@/utils/schemas/proposal.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { VscChromeClose } from "react-icons/vsc";

type HandlePricingCorrectionParams = {
	diffPercentage: number;
};

type EditFinalPriceProps = {
	pricing: TPricingItem[];
	setPricing: React.Dispatch<React.SetStateAction<TPricingItem[]>>;
	alterationLimit: number | undefined;
	closeModal: () => void;
};
function EditFinalPrice({ pricing, setPricing, alterationLimit, closeModal }: EditFinalPriceProps) {
	const pricingTotal = getPricingTotal({ pricing });
	const pricingSuggestedTotal = getPricingSuggestedTotal({ pricing });

	const [priceHolder, setPriceHolder] = useState(pricingTotal);

	function handlePricingCorrection({ diffPercentage }: HandlePricingCorrectionParams) {
		const pricingCopy = [...pricing];
		const newPricing = pricingCopy.map((p) => {
			// Getting current pricing item suggested sale price
			const itemSuggestedValue = p.valorCalculado;
			// Using the percentage difference to update the item's sale price by that proportion
			const newSalePrice = itemSuggestedValue * (1 - diffPercentage);
			// Getting new margin based on the new sale price
			const newMargin = getProfitMargin(p.custoFinal, newSalePrice);
			return { ...p, margemLucro: newMargin * 100, valorFinal: newSalePrice };
		});
		setPricing(newPricing);
	}
	return (
		<div id="edit-final-price" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-fit w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px]  lg:w-[25%]">
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
								label="PREÇO FINAL DA PROPOSTA"
								value={priceHolder}
								placeholder="Preencha aqui o valor final da proposta..."
								handleChange={(value) => {
									setPriceHolder(value);
								}}
								width="100%"
							/>
						</div>
						{alterationLimit != undefined ? (
							<>
								<p className="text-center text-sm italic text-gray-500">
									Valor mínimo permitido de R${" "}
									{(pricingSuggestedTotal * (1 - alterationLimit)).toLocaleString("pt-br", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</p>
								<p className="text-center text-sm italic text-gray-500">
									Valor máximo permitido de R${" "}
									{(pricingSuggestedTotal * (1 + alterationLimit)).toLocaleString("pt-br", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</p>
							</>
						) : null}
					</div>
					<div className="flex w-full items-center justify-end py-2">
						<button
							onClick={() => {
								const diff = pricingSuggestedTotal - priceHolder;
								const diffPercentage = diff / pricingSuggestedTotal;
								// In case there is a defined alteration limit, checking if alterations surpass that limit
								if (alterationLimit != undefined && Math.abs(diffPercentage) > Math.abs(alterationLimit)) return toast.error("Alteração ultrapassa o limite permitido.");
								handlePricingCorrection({ diffPercentage: diffPercentage });
								toast.success("Preços alterados com sucesso !");
								return closeModal();
							}}
							className="rounded bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
						>
							EFETIVAR
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default EditFinalPrice;
