import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import { getCalculatedFinalValue, getProfitMargin, type TPricingVariableSource } from "@/utils/pricing/methods";
import { TPricingItem } from "@/utils/schemas/proposal.schema";
import React from "react";
import { TbMathFunction } from "react-icons/tb";
import { VscChromeClose } from "react-icons/vsc";
import PricingFormulaBreakdown from "./PricingFormulaBreakdown";

type EditPriceItemProps = {
	itemIndex: number;
	pricing: TPricingItem[];
	setPricing: React.Dispatch<React.SetStateAction<TPricingItem[]>>;
	variableValues: Record<string, number | undefined | null>;
	variableSources?: Record<string, TPricingVariableSource>;
	closeModal: () => void;
};

function EditPriceItem({ itemIndex, pricing, setPricing, variableValues, variableSources, closeModal }: EditPriceItemProps) {
	const { descricao, custoFinal, margemLucro, valorCalculado, valorFinal, faturavel, formulaArr, custoCalculado } =
		pricing[itemIndex];
	const hasFormula = Boolean(formulaArr?.length);

	return (
		<div id="edit-pricing-item" className="fixed inset-0 z-100 bg-[rgba(0,0,0,.85)]">
			<div
				className={`fixed left-[50%] top-[50%] z-100 max-h-[90vh] w-[92%] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-background p-[10px] ${hasFormula ? "lg:w-[min(560px,92%)]" : "lg:w-[30%]"}`}
			>
				<div className="flex h-full max-h-[calc(90vh-20px)] flex-col">
					<div className="flex flex-wrap items-center justify-between border-b border-primary/30 px-2 pb-2">
						<div className="flex flex-col gap-0.5">
							<h3 className="text-xl font-bold text-primary">ALTERAÇÃO DE PREÇOS</h3>
							<p className="text-xs text-primary/60">{descricao}</p>
						</div>
						<button
							onClick={() => closeModal()}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
						{hasFormula ? (
							<div className="flex flex-col gap-1 px-1">
								<div className="flex items-center gap-1.5">
									<TbMathFunction className="text-[#15599a]" size={15} />
									<span className="text-[0.68rem] font-semibold uppercase tracking-tight text-[#15599a]">
										Detalhamento da fórmula
									</span>
								</div>
								<PricingFormulaBreakdown
									formulaArr={formulaArr ?? []}
									variableValues={variableValues}
									variableSources={variableSources}
									computedCost={custoCalculado}
									margin={margemLucro}
								/>
								{Math.abs(custoFinal - custoCalculado) > 0.01 ? (
									<p className="text-[0.68rem] text-amber-800">
										O custo final ({formatCurrency(custoFinal)}) difere do calculado pela fórmula — valores abaixo refletem
										a fórmula com os dados atuais.
									</p>
								) : null}
							</div>
						) : null}
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
									const pricingCopy = [...pricing];
									const newPricing = pricingCopy.map((copy, copyIndex) => {
										if (itemIndex == copyIndex) {
											return { ...copy, margemLucro: value, valorFinal: newSalePrice };
										}
										return copy;
									});
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
									const pricingCopy = [...pricing];
									const newPricing = pricingCopy.map((copy, copyIndex) => {
										if (itemIndex == copyIndex) {
											return { ...copy, margemLucro: newMargin * 100, valorFinal: value };
										}
										return copy;
									});
									setPricing(newPricing);
								}}
								width="100%"
							/>
						</div>
						{Math.abs(valorFinal - valorCalculado) > 1 ? (
							<p className="self-center text-center text-[0.68rem] text-primary/50">
								Venda sugerida pela fórmula: {formatCurrency(valorCalculado)}
							</p>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}

function formatCurrency(value: number) {
	return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default EditPriceItem;
