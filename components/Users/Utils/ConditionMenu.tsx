import React from "react";

import MultipleSelectInput from "@/components/Inputs/MultipleSelectInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { comissionConditionsAlias, getComissionScenarioConditionOptions } from "@/utils/comissions/helpers";
import { TComissionConditionData } from "@/utils/comissions/methods";
import { TPricingMethodConditionType } from "@/utils/schemas/pricing-method.schema";
import { TUserComissionItem } from "@/utils/schemas/user.schema";
import { PricingMethodConditionTypeOptions } from "@/utils/select-options";

type ConditionMenuProps = {
	resultHolder: TUserComissionItem["resultados"][number];
	setResultHolder: React.Dispatch<React.SetStateAction<TUserComissionItem["resultados"][number]>>;
};
function ConditionMenu({ resultHolder, setResultHolder }: ConditionMenuProps) {
	return (
		<div className="flex w-full flex-col">
			<div className="my-2 flex flex-wrap items-center gap-2">
				{PricingMethodConditionTypeOptions.map((va, index) => (
					<button
						key={va.id}
						onClick={() =>
							setResultHolder((prev) => ({
								...prev,
								condicao: {
									...prev.condicao,
									tipo: va.value,
									variavel: undefined,
									igual: undefined,
									maiorQue: undefined,
									menorQue: undefined,
									entre: undefined,
									inclui: undefined,
								},
							}))
						}
						className={`grow ${
							va.value == resultHolder.condicao.tipo ? "bg-blue-700  text-primary-foreground" : "text-blue-700 "
						} rounded border border-blue-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-blue-700  hover:text-primary-foreground`}
					>
						{va.label}
					</button>
				))}
			</div>
			<h1 className="w-full text-start text-xs font-black text-blue-500">VARIÁVEL</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{!!resultHolder.condicao.tipo
					? comissionConditionsAlias
							.filter((c) => c.types.includes(resultHolder.condicao.tipo as TPricingMethodConditionType))
							.map((va, index) => (
								<button
									key={index}
									onClick={() =>
										setResultHolder((prev) => ({
											...prev,
											condicao: {
												...prev.condicao,
												variavel: va.value,
												igual: undefined,
												maiorQue: undefined,
												menorQue: undefined,
												entre: undefined,
												inclui: undefined,
											},
										}))
									}
									className={`grow ${
										va.value == resultHolder.condicao.variavel ? "bg-primary/70  text-primary-foreground" : "text-primary/70 "
									} rounded border border-primary/70  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-primary/70  hover:text-primary-foreground`}
								>
									{va.label}
								</button>
							))
					: null}
			</div>
			{resultHolder.condicao.tipo == "IGUAL_TEXTO" ? (
				<SelectInput
					label="IGUAL A:"
					value={resultHolder.condicao.igual}
					// options={options[resultHolder.condicao.variavel as keyof typeof options]?.map((op, index) => ({ id: index + 1, label: op, value: op })) || []}
					options={getComissionScenarioConditionOptions({
						variable: resultHolder.condicao.variavel as keyof TComissionConditionData,
					})}
					handleChange={(value) => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, igual: value } }))}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, igual: null } }))}
					width="100%"
				/>
			) : null}
			{resultHolder.condicao.tipo == "IGUAL_NÚMERICO" ? (
				<NumberInput
					label="IGUAL A:"
					placeholder="Preencha o valor para comparação."
					value={resultHolder.condicao.igual != null && resultHolder.condicao.igual != undefined ? Number(resultHolder.condicao.igual) : null}
					handleChange={(value) => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, igual: value.toString() } }))}
					width="100%"
				/>
			) : null}
			{resultHolder.condicao.tipo == "MAIOR_QUE_NÚMERICO" ? (
				<NumberInput
					label="MAIOR QUE:"
					placeholder="Preencha o valor para comparação."
					value={resultHolder.condicao.maiorQue != null && resultHolder.condicao.maiorQue != undefined ? Number(resultHolder.condicao.maiorQue) : null}
					handleChange={(value) => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, maiorQue: value } }))}
					width="100%"
				/>
			) : null}
			{resultHolder.condicao.tipo == "MENOR_QUE_NÚMERICO" ? (
				<NumberInput
					label="MENOR QUE:"
					placeholder="Preencha o valor para comparação."
					value={resultHolder.condicao.menorQue != null && resultHolder.condicao.menorQue != undefined ? Number(resultHolder.condicao.menorQue) : null}
					handleChange={(value) => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, menorQue: value } }))}
					width="100%"
				/>
			) : null}
			{resultHolder.condicao.tipo == "INTERVALO_NÚMERICO" ? (
				<div className="flex w-full flex-col gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="MAIOR QUE:"
							placeholder="Preencha o valor mínimo do intervalo."
							value={
								resultHolder.condicao.entre?.minimo != null && resultHolder.condicao.entre?.minimo != undefined
									? Number(resultHolder.condicao.entre?.minimo)
									: null
							}
							handleChange={(value) =>
								setResultHolder((prev) => ({
									...prev,
									condicao: {
										...prev.condicao,
										entre: prev.condicao.entre ? { ...prev.condicao.entre, minimo: value } : { minimo: value, maximo: 0 },
									},
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="MENOR QUE:"
							placeholder="Preencha o valor máximo do intervalo."
							value={
								resultHolder.condicao.entre?.maximo != null && resultHolder.condicao.entre?.maximo != undefined
									? Number(resultHolder.condicao.entre?.maximo)
									: null
							}
							handleChange={(value) =>
								setResultHolder((prev) => ({
									...prev,
									condicao: {
										...prev.condicao,
										entre: prev.condicao.entre ? { ...prev.condicao.entre, maximo: value } : { minimo: 0, maximo: value },
									},
								}))
							}
							width="100%"
						/>
					</div>
				</div>
			) : null}
			{resultHolder.condicao.tipo == "INCLUI_LISTA" ? (
				<MultipleSelectInput
					label="INCLUSO EM:"
					selected={resultHolder.condicao.inclui || null}
					options={getComissionScenarioConditionOptions({
						variable: resultHolder.condicao.variavel as keyof TComissionConditionData,
					})}
					handleChange={(value) => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, inclui: value as string[] } }))}
					onReset={() => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, inclui: [] } }))}
					resetOptionLabel="NÃO DEFINIDO"
					width="100%"
				/>
			) : null}
		</div>
	);
}

export default ConditionMenu;
