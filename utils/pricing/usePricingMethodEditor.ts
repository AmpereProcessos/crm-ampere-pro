import { useMemo, useReducer } from "react";
import { TPricingMethod, TPricingMethodItemResultItem } from "../schemas/pricing-method.schema";
import { validateFormula } from "./formula";

/**
 * Estado de edição de uma metodologia de precificação.
 *
 * Princípio: fonte ÚNICA de verdade em `methodology`. A edição é direta e inline —
 * não há buffer de rascunho. Cada ação produz um novo estado imutável preservando a
 * identidade dos itens NÃO tocados (para que linhas memoizadas não re-renderizem à toa).
 */
export type TEditorMethodology = TPricingMethod & { _id?: string };
type TUnit = TPricingMethod["itens"][number];
type TResult = TPricingMethodItemResultItem;
type TCondition = TResult["condicao"];

export function createEmptyResult(general: boolean): TResult {
	return {
		condicao: { aplicavel: !general, variavel: null, igual: null },
		faturavel: false,
		margemLucro: 0,
		formulaArr: [],
	};
}

export function createEmptyUnit(): TUnit {
	return { nome: "", resultados: [createEmptyResult(true)] };
}

type Action =
	| { type: "SET_ALL"; payload: TEditorMethodology }
	| { type: "SET_NAME"; nome: string }
	| { type: "SET_PARTNER"; idParceiro: string | null }
	| { type: "ADD_UNIT" }
	| { type: "REMOVE_UNIT"; unitIndex: number }
	| { type: "SET_UNIT_NAME"; unitIndex: number; nome: string }
	| { type: "ADD_RESULT"; unitIndex: number }
	| { type: "REMOVE_RESULT"; unitIndex: number; resultIndex: number }
	| { type: "PATCH_RESULT"; unitIndex: number; resultIndex: number; patch: Partial<TResult> }
	| { type: "PATCH_CONDITION"; unitIndex: number; resultIndex: number; patch: Partial<TCondition> };

function mapUnit(state: TEditorMethodology, unitIndex: number, fn: (unit: TUnit) => TUnit): TEditorMethodology {
	return { ...state, itens: state.itens.map((unit, i) => (i === unitIndex ? fn(unit) : unit)) };
}
function mapResult(unit: TUnit, resultIndex: number, fn: (result: TResult) => TResult): TUnit {
	return { ...unit, resultados: unit.resultados.map((result, j) => (j === resultIndex ? fn(result) : result)) };
}

function reducer(state: TEditorMethodology, action: Action): TEditorMethodology {
	switch (action.type) {
		case "SET_ALL":
			return action.payload;
		case "SET_NAME":
			return { ...state, nome: action.nome };
		case "SET_PARTNER":
			return { ...state, idParceiro: action.idParceiro };
		case "ADD_UNIT":
			return { ...state, itens: [...state.itens, createEmptyUnit()] };
		case "REMOVE_UNIT":
			return { ...state, itens: state.itens.filter((_, i) => i !== action.unitIndex) };
		case "SET_UNIT_NAME":
			return mapUnit(state, action.unitIndex, (unit) => ({ ...unit, nome: action.nome }));
		case "ADD_RESULT":
			return mapUnit(state, action.unitIndex, (unit) => {
				const hasGeneral = unit.resultados.some((r) => !r.condicao.aplicavel);
				return { ...unit, resultados: [...unit.resultados, createEmptyResult(!hasGeneral)] };
			});
		case "REMOVE_RESULT":
			return mapUnit(state, action.unitIndex, (unit) => ({
				...unit,
				resultados: unit.resultados.filter((_, j) => j !== action.resultIndex),
			}));
		case "PATCH_RESULT":
			return mapUnit(state, action.unitIndex, (unit) =>
				mapResult(unit, action.resultIndex, (result) => ({ ...result, ...action.patch })),
			);
		case "PATCH_CONDITION":
			return mapUnit(state, action.unitIndex, (unit) =>
				mapResult(unit, action.resultIndex, (result) => ({ ...result, condicao: { ...result.condicao, ...action.patch } })),
			);
		default:
			return state;
	}
}

export type TPricingMethodActions = {
	setAll: (methodology: TEditorMethodology) => void;
	setName: (nome: string) => void;
	setPartner: (idParceiro: string | null) => void;
	addUnit: () => void;
	removeUnit: (unitIndex: number) => void;
	setUnitName: (unitIndex: number, nome: string) => void;
	addResult: (unitIndex: number) => void;
	removeResult: (unitIndex: number, resultIndex: number) => void;
	patchResult: (unitIndex: number, resultIndex: number, patch: Partial<TResult>) => void;
	patchCondition: (unitIndex: number, resultIndex: number, patch: Partial<TCondition>) => void;
};

export function usePricingMethodEditor(initial: TEditorMethodology) {
	const [methodology, dispatch] = useReducer(reducer, initial);

	const actions = useMemo<TPricingMethodActions>(
		() => ({
			setAll: (payload) => dispatch({ type: "SET_ALL", payload }),
			setName: (nome) => dispatch({ type: "SET_NAME", nome }),
			setPartner: (idParceiro) => dispatch({ type: "SET_PARTNER", idParceiro }),
			addUnit: () => dispatch({ type: "ADD_UNIT" }),
			removeUnit: (unitIndex) => dispatch({ type: "REMOVE_UNIT", unitIndex }),
			setUnitName: (unitIndex, nome) => dispatch({ type: "SET_UNIT_NAME", unitIndex, nome }),
			addResult: (unitIndex) => dispatch({ type: "ADD_RESULT", unitIndex }),
			removeResult: (unitIndex, resultIndex) => dispatch({ type: "REMOVE_RESULT", unitIndex, resultIndex }),
			patchResult: (unitIndex, resultIndex, patch) => dispatch({ type: "PATCH_RESULT", unitIndex, resultIndex, patch }),
			patchCondition: (unitIndex, resultIndex, patch) => dispatch({ type: "PATCH_CONDITION", unitIndex, resultIndex, patch }),
		}),
		[],
	);

	return { methodology, actions };
}

/**
 * Validação de toda a metodologia — usada para liberar/bloquear o salvamento final.
 * Reaproveita exatamente a mesma regra de fórmula do motor de cálculo.
 */
export function getMethodologyIssues(methodology: TEditorMethodology, allowedVariables: string[]): string[] {
	const issues: string[] = [];
	if (!methodology.nome || methodology.nome.trim().length < 2) issues.push("Dê um nome de ao menos 2 caracteres à metodologia.");
	if (methodology.itens.length === 0) issues.push("Adicione ao menos uma unidade de preço.");

	methodology.itens.forEach((unit, i) => {
		const label = unit.nome?.trim() || `Unidade ${i + 1}`;
		if (!unit.nome || unit.nome.trim().length < 2) issues.push(`${label}: dê um nome de ao menos 2 caracteres.`);
		if (unit.resultados.length === 0) issues.push(`${label}: adicione ao menos uma fórmula.`);
		else if (!unit.resultados.some((r) => !r.condicao.aplicavel)) issues.push(`${label}: precisa de ao menos uma fórmula geral (sem condição).`);

		unit.resultados.forEach((result, j) => {
			const validation = validateFormula(result.formulaArr, allowedVariables);
			if (!validation.ok) issues.push(`${label} · resultado ${j + 1}: ${validation.errors[0]}`);
		});
	});

	return issues;
}
