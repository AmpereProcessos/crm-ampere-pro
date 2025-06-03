import React, { useState } from "react";
import NumberInput from "../Inputs/NumberInput";
import { FiDelete } from "react-icons/fi";
import toast from "react-hot-toast";
import CheckboxInput from "../Inputs/CheckboxInput";
import SelectInput from "../Inputs/SelectInput";
import { stateCities } from "@/utils/estados_cidades";
import { VscChromeClose } from "react-icons/vsc";
import { MdContentCopy, MdDelete } from "react-icons/md";
import { TPricingMethod, TPricingMethodItemResultItem } from "@/utils/schemas/pricing-method.schema";
import { ElectricalInstallationGroups, StructureTypes } from "@/utils/select-options";
import {
	conditionsAlias,
	formatCondition,
	formatConditionValue,
	formatFormulaItem,
	getConditionOptions,
	operators,
	renderConditionPhrase,
	variablesAlias,
} from "@/utils/pricing/helpers";
import { usePartnersSimplified } from "@/utils/queries/partners";
import { TPricingConditionData } from "@/utils/pricing/methods";
import ConditionMenu from "./ConditionMenu";
import { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";

type NewPricingUnitProps = {
	pricingHolder: TPricingMethod["itens"][number];
	setPricingHolder: React.Dispatch<React.SetStateAction<TPricingMethod["itens"][number]>>;
	resultHolder: TPricingMethodItemResultItem;
	setResultHolder: React.Dispatch<React.SetStateAction<TPricingMethodItemResultItem>>;
	methodology: TPricingMethod;
	setMethodology: React.Dispatch<React.SetStateAction<TPricingMethod>>;
	partners: TPartnerSimplifiedDTO[] | undefined;
	closeMenu: () => void;
};

function NewPricingUnit({ pricingHolder, setPricingHolder, resultHolder, setResultHolder, methodology, setMethodology, partners, closeMenu }: NewPricingUnitProps) {
	function addResultFormula() {
		if (resultHolder.condicao.aplicavel) {
			if (!resultHolder.condicao.variavel) return toast.error("Selecione uma variável para condição.");
			if (resultHolder.condicao.tipo == "IGUAL_TEXTO" && !resultHolder.condicao.igual) return toast.error("Selecione o resultado para comparação da condição.");
			if (resultHolder.condicao.tipo == "IGUAL_NÚMERICO" && (resultHolder.condicao.igual == null || resultHolder.condicao.igual == undefined))
				return toast.error("Preencha o resultado para comparação da condição.");
			if (resultHolder.condicao.tipo == "MAIOR_QUE_NÚMERICO" && (resultHolder.condicao.maiorQue == null || resultHolder.condicao.maiorQue == undefined))
				return toast.error("Preencha o valor para comparação.");
			if (resultHolder.condicao.tipo == "MENOR_QUE_NÚMERICO" && (resultHolder.condicao.menorQue == null || resultHolder.condicao.menorQue == undefined))
				return toast.error("Preencha o valor para comparação.");
			if (
				resultHolder.condicao.tipo == "INTERVALO_NÚMERICO" &&
				(resultHolder.condicao.entre?.minimo == null || resultHolder.condicao.entre?.minimo == undefined) &&
				(resultHolder.condicao.entre?.maximo == null || resultHolder.condicao.entre?.maximo == undefined)
			)
				return toast.error("Preencha os valores para comparação.");
			if (resultHolder.condicao.tipo == "INCLUI_LISTA" && (!resultHolder.condicao.inclui || resultHolder.condicao.inclui.length == 0))
				return toast.error("Preencha a list para comparação.");
		}
		if (resultHolder.margemLucro < 0) return toast.error("Preencha uma margem de lucro válida.");

		const currentResultFormulas = [...pricingHolder.resultados];

		// Validating existence of general formula in results array
		const hasGeneralFormula = currentResultFormulas.some((r) => !r.condicao.aplicavel);
		if (hasGeneralFormula && !resultHolder.condicao.aplicavel) return toast.error("Não é possível cadastrar duas fórmulas gerais.");
		currentResultFormulas.push(resultHolder);
		const newResultFormulas = currentResultFormulas.sort((a, b) => (a.condicao.aplicavel === b.condicao.aplicavel ? 0 : a.condicao.aplicavel ? -1 : 1));
		setPricingHolder((prev) => ({ ...prev, resultados: newResultFormulas }));
		setResultHolder({
			condicao: {
				aplicavel: false,
				variavel: null,
				igual: null,
			},
			faturavel: false,
			margemLucro: 0,
			formulaArr: [],
		});
		return toast.success("Fórmula cadastrada com sucesso !");
	}
	function removeResultFormula(index: number) {
		const currentResultFormulas = [...pricingHolder.resultados];
		currentResultFormulas.splice(index, 1);
		setPricingHolder((prev) => ({ ...prev, resultados: currentResultFormulas }));
		return;
	}
	function createPricingUnit() {
		if (pricingHolder.nome.trim().length < 2) return toast.error("Dê um nome de ao menos 2 caractéres a unidade de preço.");
		// Validing existence of atleast one general formula
		const hasGeneralFormula = pricingHolder.resultados.some((r) => !r.condicao.aplicavel);
		if (!hasGeneralFormula) return toast.error("É necessário que haja ao menos uma fórmula geral.");
		console.log(pricingHolder);

		const methodologyArr = [...methodology.itens];
		methodologyArr.push(pricingHolder);
		setMethodology((prev) => ({ ...prev, itens: methodologyArr }));
		setPricingHolder({
			nome: "",
			resultados: [],
		});
		setResultHolder({
			condicao: {
				aplicavel: false,
				variavel: null,
				igual: null,
			},
			faturavel: false,
			margemLucro: 0,
			formulaArr: [],
		});
	}
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
		return;
	}

	return (
		<div className="flex w-[80%] flex-col self-center rounded-md border border-gray-500 p-2 font-Inter">
			<div className="mb-4 flex w-full items-center justify-between">
				<h1 className="font-Inter font-black">NOVA UNIDADE DE PREÇO</h1>
				<button onClick={() => closeMenu()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
					<VscChromeClose style={{ color: "red" }} />
				</button>
			</div>
			<input
				value={pricingHolder.nome}
				onChange={(e) => setPricingHolder((prev) => ({ ...prev, nome: e.target.value }))}
				id={"pricingName"}
				type="text"
				placeholder={"Preencha o nome da unidade de preço..."}
				className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none placeholder:italic"
			/>
			<h1 className="mt-4 w-full text-center font-Inter text-sm font-black leading-none tracking-tight">CONSTRUÇÃO DO CÁLCULO DE CUSTO</h1>
			<h1 className="my-2 w-full text-start text-sm font-black text-[#FF9B50]">VALORES</h1>
			<div className="flex w-full items-end gap-2">
				<div className="grow">
					<NumberInput
						label="NÚMERO"
						labelClassName="font-semibold leading-none tracking-tight text-xs"
						placeholder="Preencha um valor para adição a fórmula..."
						value={numberHolder}
						handleChange={(value) => setNumberHolder(Number(value))}
						width="100%"
					/>
				</div>
				<button
					onClick={() => {
						addToUnitPricingItems(numberHolder?.toString());
					}}
					className="min-h-[46px] rounded-md bg-green-500 p-2 text-sm text-white hover:bg-green-600"
				>
					ADD
				</button>
			</div>
			<h1 className="mt-2 w-full text-start text-sm font-black text-[#FF9B50]">VARIÁVEIS</h1>
			<h1 className="mt-2 w-full text-start text-xs font-black text-blue-500">GERAIS</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{variablesAlias
					.filter((v) => v.type == "general")
					.map((va, index) => (
						<button
							key={index}
							onClick={() => addToUnitPricingItems(`[${va.value}]`)}
							className="grow rounded border border-gray-700 p-1 text-xs font-medium text-gray-700 duration-300 ease-in-out hover:bg-gray-700 hover:text-white"
						>
							{va.label}
						</button>
					))}
			</div>
			<h1 className="mt-2 w-full text-start text-xs font-black text-blue-500">ACUMULATIVAS</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{variablesAlias
					.filter((v) => v.type == "cumulative")
					.map((va, index) => (
						<button
							key={index}
							onClick={() => addToUnitPricingItems(`[${va.value}]`)}
							className="grow rounded border border-gray-700 p-1 text-xs font-medium text-gray-700 duration-300 ease-in-out hover:bg-gray-700 hover:text-white"
						>
							{va.label}
						</button>
					))}
			</div>
			<h1 className="mt-2 w-full text-start text-xs font-black text-blue-500">ESTIMADO EM ANÁLISE TÉCNICA</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{variablesAlias
					.filter((v) => v.type == "technical-analysis")
					.map((va, index) => (
						<button
							key={index}
							onClick={() => addToUnitPricingItems(`[${va.value}]`)}
							className="grow rounded border border-gray-700 p-1 text-xs font-medium text-gray-700 duration-300 ease-in-out hover:bg-gray-700 hover:text-white"
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
						className="grow rounded border border-gray-300 bg-gray-100 p-2 text-center font-medium text-gray-700 duration-300 ease-in-out hover:scale-105 hover:bg-gray-200"
					>
						{op}
					</button>
				))}
				<button
					onClick={() => dropUnitPricingItem()}
					className="flex grow items-center justify-center rounded border border-red-300 bg-red-100 p-2 text-center font-medium duration-300 ease-in-out hover:scale-105 hover:bg-red-200"
				>
					<FiDelete size={23} />
				</button>
			</div>
			<div className="my-2 flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						labelClassName="font-semibold leading-none tracking-tight text-xs"
						label="MARGEM DE LUCRO"
						placeholder="Preencha a margem de lucro aplicável a esse item."
						value={resultHolder.margemLucro}
						handleChange={(value) => setResultHolder((prev) => ({ ...prev, margemLucro: value }))}
						width="100%"
					/>
				</div>
				<div className="flex w-full items-center justify-center lg:w-1/2">
					<div className="w-fit">
						<CheckboxInput
							labelTrue="FATURÁVEL"
							labelFalse="FATURÁVEL"
							checked={resultHolder.faturavel}
							handleChange={(value) => setResultHolder((prev) => ({ ...prev, faturavel: value }))}
							justify="justify-center"
						/>
					</div>
				</div>
			</div>
			<h1 className="my-2 w-full text-start text-sm font-black text-[#FF9B50]">FÓRMULA</h1>
			<div className="my-2 flex w-full flex-col items-center gap-2 lg:flex-row">
				<p className="w-[50px] p-1 text-center text-xl font-black">=</p>
				<div className="flex min-h-[52px] w-full items-center justify-center gap-1 rounded-md border border-blue-800 p-3">
					{resultHolder.formulaArr.map((y, index) => (
						<p key={index} className={`text-xs ${y.includes("[") ? "rounded bg-gray-700  p-1 text-white" : ""}`}>
							{formatFormulaItem(y)}
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
			{/* {resultHolder.condicao.aplicavel ? (
        <div className="flex w-full flex-col">
          <div className="my-2 flex flex-wrap items-center gap-2">
            {conditionsAlias.map((va, index) => (
              <button
                key={index}
                onClick={() => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, variavel: va.value, igual: null } }))}
                className={`grow ${
                  va.value == resultHolder.condicao.variavel ? 'bg-gray-700  text-white' : 'text-gray-700 '
                } rounded border border-gray-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-gray-700  hover:text-white`}
              >
                {va.label}
              </button>
            ))}
          </div>
          <SelectInput
            label="IGUAL A:"
            value={resultHolder.condicao.igual}
            // options={options[resultHolder.condicao.variavel as keyof typeof options]?.map((op, index) => ({ id: index + 1, label: op, value: op })) || []}
            options={getConditionOptions({ variable: resultHolder.condicao.variavel as keyof TPricingConditionData, additional: { partners: partners || [] } })}
            handleChange={(value) => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, igual: value } }))}
            resetOptionLabel="NÃO DEFINIDO"
            onReset={() => setResultHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, igual: null } }))}
            width="100%"
          />
        </div>
      ) : null} */}
			{resultHolder.condicao.aplicavel ? <ConditionMenu resultHolder={resultHolder} setResultHolder={setResultHolder} partners={partners} /> : null}
			<div className="my-2 flex items-center justify-end gap-2">
				<button
					className="rounded bg-black p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out disabled:bg-gray-400 disabled:text-black enabled:hover:bg-gray-600"
					onClick={() => addResultFormula()}
				>
					ADICIONAR FÓRMULA
				</button>
			</div>
			<h1 className="mb-2 w-full text-center font-Inter text-sm font-black leading-none tracking-tight">LISTA DE FÓRMULAS APLICÁVEIS</h1>
			{pricingHolder.resultados.length > 0 ? (
				pricingHolder.resultados.map((result, index) => (
					<div key={index} className="mb-1 flex w-full flex-col items-center gap-2 rounded-md border border-[#A0E9FF] p-1 md:flex-row">
						<div className="flex flex-col">
							{renderConditionPhrase({ condition: result.condicao, partners: partners || [] })}
							{/* <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
                {!result.condicao.aplicavel
                  ? 'FÓRMULA GERAL:'
                  : `SE ${formatCondition(result.condicao.variavel || '')} FOR IGUAL A ${formatConditionValue({
                      conditionVariable: result.condicao.variavel as keyof TPricingConditionData,
                      conditionValue: result.condicao.igual || '',
                      additional: {
                        partners: partners || [],
                      },
                    })}:`}
              </h1> */}
							<div className="flex items-center gap-2 font-Inter">
								<div className="flex items-center gap-1">
									<p className="text-xs text-gray-500">MARGEM: </p>
									<p className="text-xs font-bold text-[#FFBB5C]">{result.margemLucro}%</p>
								</div>
								<div className="flex items-center gap-1">
									<p className="text-xs text-gray-500">FATURÁVEL: </p>
									<p className="text-xs font-bold text-[#FFBB5C]">{result.faturavel ? "SIM" : "NÃO"}</p>
								</div>
							</div>
						</div>

						<div className="flex  grow flex-wrap items-center justify-center gap-1 p-1">
							{result.formulaArr.map((y, index2) => (
								<p key={index2} className={`text-[0.7rem] ${y.includes("[") ? "rounded bg-blue-500 p-1 text-white" : ""}`}>
									{formatFormulaItem(y)}
								</p>
							))}
						</div>
						<div className="flex items-center gap-1">
							<button
								onClick={() => {
									setResultHolder((prev) => ({ ...prev, formulaArr: [...prev.formulaArr, ...result.formulaArr] }));
									return toast.success("Formula adicionada a área de trabalho");
								}}
								className="flex items-center justify-center rounded-lg p-1 text-gray-900 duration-300 ease-linear hover:scale-105 hover:bg-gray-200"
							>
								<MdContentCopy />
							</button>
							<button
								onClick={() => removeResultFormula(index)}
								type="button"
								className="flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
							>
								<MdDelete style={{ color: "red" }} />
							</button>
						</div>
					</div>
				))
			) : (
				<p className="w-full text-center text-xs font-medium italic">Sem fórmulas de cálculo cadastradas...</p>
			)}
			<div className="my-2 flex items-center justify-end gap-2">
				<button className="rounded bg-blue-600 p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out hover:bg-blue-800" onClick={() => createPricingUnit()}>
					CADASTRAR UNIDADE DE PREÇO
				</button>
			</div>
		</div>
	);
}

export default NewPricingUnit;
