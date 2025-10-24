import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import { comissionVariablesAlias, formatComissionFormulaItem } from "@/utils/comissions/helpers";
import { operators } from "@/utils/pricing/helpers";
import { TUser, TUserComissionItem } from "@/utils/schemas/user.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiDelete } from "react-icons/fi";
import { VscChromeClose } from "react-icons/vsc";
import ConditionMenu from "./ConditionMenu";

type EditComissionScenarioProps = {
	index: number;
	infoHolder: TUser;
	setInfoHolder: React.Dispatch<React.SetStateAction<TUser>>;
	resultHolder: TUserComissionItem["resultados"][number];
	setResultHolder: React.Dispatch<React.SetStateAction<TUserComissionItem["resultados"][number]>>;
	closeMenu: () => void;
};
function EditComissionScenario({ index, infoHolder, setInfoHolder, resultHolder, setResultHolder, closeMenu }: EditComissionScenarioProps) {
	const [numberHolder, setNumberHolder] = useState(0);
	function addToUnitPricingItems(x: string) {
		const currentList = [...resultHolder.formulaArr];
		currentList.push(x);
		setResultHolder((prev) => ({ ...prev, formulaArr: currentList }));
		return;
	}
	function dropUnitPricingItem() {
		const currentList = [...resultHolder.formulaArr];
		currentList.pop();
		setResultHolder((prev) => ({ ...prev, formulaArr: currentList }));
	}
	function updateScenario(result: TUserComissionItem["resultados"][number], index: number) {
		if (result.condicao.aplicavel) {
			if (!result.condicao.variavel) return toast.error("Selecione uma variável para condição.");
			if (result.condicao.tipo == "IGUAL_TEXTO" && !result.condicao.igual) return toast.error("Selecione o resultado para comparação da condição.");
			if (result.condicao.tipo == "IGUAL_NÚMERICO" && (result.condicao.igual == null || result.condicao.igual == undefined))
				return toast.error("Preencha o resultado para comparação da condição.");
			if (result.condicao.tipo == "MAIOR_QUE_NÚMERICO" && (result.condicao.maiorQue == null || result.condicao.maiorQue == undefined))
				return toast.error("Preencha o valor para comparação.");
			if (result.condicao.tipo == "MENOR_QUE_NÚMERICO" && (result.condicao.menorQue == null || result.condicao.menorQue == undefined))
				return toast.error("Preencha o valor para comparação.");
			if (
				result.condicao.tipo == "INTERVALO_NÚMERICO" &&
				(result.condicao.entre?.minimo == null || result.condicao.entre?.minimo == undefined) &&
				(result.condicao.entre?.maximo == null || result.condicao.entre?.maximo == undefined)
			)
				return toast.error("Preencha os valores para comparação.");
			if (result.condicao.tipo == "INCLUI_LISTA" && (!result.condicao.inclui || result.condicao.inclui.length == 0))
				return toast.error("Preencha a list para comparação.");
		}
		if (result.formulaArr.length == 0) return toast.error("Preencha uma fórmula válida.");
		const scenarios = [...infoHolder.comissionamento.resultados];

		// Validating existence of general formula in results array
		const hasGeneralFormula = scenarios.filter((s, sIndex) => sIndex != index).some((r) => !r.condicao.aplicavel);
		if (hasGeneralFormula && !result.condicao.aplicavel) return toast.error("Não é possível cadastrar duas fórmulas gerais.");
		scenarios[index] = result;
		const newScenarios = scenarios.sort((a, b) => (a.condicao.aplicavel === b.condicao.aplicavel ? 0 : a.condicao.aplicavel ? -1 : 1));
		setInfoHolder((prev) => ({ ...prev, comissionamento: { ...prev.comissionamento, resultados: newScenarios } }));
		closeMenu();
		return toast.success("Cenário atualizado com sucesso !");
	}
	return (
		<div className="flex w-[80%] flex-col self-center rounded-md border border-primary/50 p-2 font-Inter">
			<div className="mb-4 flex w-full items-center justify-between">
				<h1 className="font-Inter font-black">EDITAR CENÁRIO</h1>
				<button
					onClick={() => closeMenu()}
					type="button"
					className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
				>
					<VscChromeClose style={{ color: "red" }} />
				</button>
			</div>
			<h1 className="mt-4 w-full text-center font-Inter text-sm font-black leading-none tracking-tight">CONSTRUÇÃO DO CÁLCULO DE COMISSÃO</h1>
			<h1 className="my-2 w-full text-start text-sm font-black text-[#FF9B50]">VALORES</h1>
			<div className="flex w-full items-end gap-2">
				<div className="grow">
					<NumberInput
						label="NÚMERO"
						labelClassName="font-semibold leading-none tracking-tight text-xs"
						placeholder="Preencha um valor para adição a fórmula..."
						value={numberHolder}
						handleChange={(value) => setNumberHolder(value)}
						width="100%"
					/>
				</div>
				<button
					onClick={() => {
						if (numberHolder) addToUnitPricingItems(numberHolder?.toString());
					}}
					className="min-h-[46px] rounded-md bg-green-500 p-2 text-sm text-primary-foreground hover:bg-green-600"
				>
					ADD
				</button>
			</div>
			<h1 className="mt-2 w-full text-start text-sm font-black text-[#FF9B50]">VARIÁVEIS</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{comissionVariablesAlias.map((va, index) => (
					<button
						key={index}
						onClick={() => addToUnitPricingItems(`[${va.value}]`)}
						className="grow rounded-sm border border-primary/70 p-1 text-xs font-medium text-primary/70 duration-300 ease-in-out hover:bg-primary/70 hover:text-primary-foreground"
					>
						{va.label}
					</button>
				))}
			</div>
			<h1 className="my-2 w-full text-start text-sm font-black text-[#FF9B50]">OPERAÇÕES</h1>
			<div className="flex w-full flex-wrap items-center justify-around gap-2">
				{operators.map((op, index) => (
					<button
						key={index}
						onClick={() => addToUnitPricingItems(op)}
						className="grow rounded-sm border border-primary/30 bg-primary/10 p-2 text-center font-medium text-primary/70 duration-300 ease-in-out hover:scale-105 hover:bg-primary/30"
					>
						{op}
					</button>
				))}
				<button
					onClick={() => dropUnitPricingItem()}
					className="flex grow items-center justify-center rounded-sm border border-red-300 bg-red-100 p-2 text-center font-medium duration-300 ease-in-out hover:scale-105 hover:bg-red-200"
				>
					<FiDelete size={23} />
				</button>
			</div>
			<h1 className="my-2 w-full text-start text-sm font-black text-[#FF9B50]">FÓRMULA</h1>
			<div className="my-2 flex w-full flex-col items-center gap-2 lg:flex-row">
				<p className="w-[50px] p-1 text-center text-xl font-black">=</p>
				<div className="flex min-h-[52px] w-full items-center justify-center gap-1 rounded-md border border-blue-800 p-3">
					{resultHolder.formulaArr.map((y, index) => (
						<p key={index} className={`text-xs ${y.includes("[") ? "rounded-sm bg-primary/70  p-1 text-primary-foreground" : ""}`}>
							{formatComissionFormulaItem(y)}
						</p>
					))}
				</div>
			</div>
			<div className="my-2 flex w-full items-center justify-center gap-2">
				<div className="w-fit">
					<CheckboxInput
						labelFalse="APLICAR CONDIÇÃO"
						labelTrue="APLICAR CONDIÇÃO"
						checked={resultHolder.condicao.aplicavel}
						handleChange={(value) => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, aplicavel: value } }))}
						justify="justify-center"
					/>
				</div>
			</div>
			{resultHolder.condicao.aplicavel ? <ConditionMenu resultHolder={resultHolder} setResultHolder={setResultHolder} /> : null}
			<div className="my-2 flex items-center justify-end gap-2">
				<button
					className="rounded bg-black p-1 px-4 text-xs font-medium text-primary-foreground duration-300 ease-in-out disabled:bg-primary/40 disabled:text-primary enabled:hover:bg-primary/60"
					onClick={() => updateScenario(resultHolder, index)}
				>
					ATUALIZAR CENÁRIO
				</button>
			</div>
		</div>
	);
}

export default EditComissionScenario;
