import type { TComissionScenarioConditionType, TUserComissionItem } from "../schemas/user.schema";
import { OpportunityResponsibilityRolesCombinations } from "../select-options";
import type { TComissionConditionData, TComissionVariableData } from "./methods";

export const MathematicalOperators = [
	{
		id: 1,
		label: "ABERTURA DE PARENTÊSES",
		value: "(",
	},
	{
		id: 2,
		label: "FECHAMENTO DE PARENTÊSES",
		value: ")",
	},
	{
		id: 3,
		label: "DIVISÃO",
		value: "/",
	},
	{
		id: 4,
		label: "MULTIPLICAÇÃO",
		value: "*",
	},
	{
		id: 5,
		label: "SOMA",
		value: "+",
	},
	{
		id: 6,
		label: "SUBTRAÇÃO",
		value: "-",
	},
];
export const SaleDefinitions = [
	{
		label: "POTÊNCIA PICO",
		identifier: "potencia_pico",
		type: "NÚMERICO",
		options: [],
	},
	{
		label: "VALOR DA VENDA",
		identifier: "valor_venda",
		type: "NÚMERICO",
		options: [],
	},
	{
		label: "VALOR DO PROJETO",
		identifier: "valor_projeto",
		type: "NÚMERICO",
		options: [],
	},
	{
		label: "VALOR DO PADRÃO",
		identifier: "valor_padrao",
		type: "NÚMERICO",
		options: [],
	},
	{
		label: "VALOR DA ESTRUTURA",
		identifier: "valor_estrutura",
		type: "NÚMERICO",
		options: [],
	},
	{
		label: "VALOR DO O&M",
		identifier: "valor_oem",
		type: "NÚMERICO",
		options: [],
	},
	{
		label: "VALOR DO SEGURO",
		identifier: "valor_seguro",
		type: "NÚMERICO",
		options: [],
	},
	{
		label: "COMBINAÇÃO DE RESPONSÁVEIS",
		identifier: "combinacao_responsaveis",
		type: "SELEÇÃO",
		options: OpportunityResponsibilityRolesCombinations.map((c, index) => ({ id: index + 1, label: c, value: c })),
	},
	{
		label: "PARCEIRO DA VENDA",
		identifier: "parceiro_venda",
		type: "SELEÇÃO",
		options: [],
	},
	{
		label: "PARCEIRO DO VENDEDOR",
		identifier: "parceiro_vendedor",
		type: "SELEÇÃO",
		options: [],
	},
	{
		label: "PARCEIRO DO SDR",
		identifier: "parceiro_sdr",
		type: "SELEÇÃO",
		options: [],
	},
];
export const MethodConditionTypes: {
	id: number;
	label: string;
	value: TComissionScenarioConditionType;
	applicableDefinitionTypes: ("NÚMERICO" | "SELEÇÃO" | "BOOLEANO")[];
}[] = [
	{ id: 1, label: "IGUALDADE DE TEXTO", value: "IGUAL_TEXTO", applicableDefinitionTypes: ["SELEÇÃO", "BOOLEANO"] },
	{ id: 2, label: "IGUALDADE NÚMERICA", value: "IGUAL_NÚMERICO", applicableDefinitionTypes: ["NÚMERICO"] },
	{ id: 3, label: "MAIOR QUE", value: "MAIOR_QUE_NÚMERICO", applicableDefinitionTypes: ["NÚMERICO"] },
	{ id: 4, label: "MENOR QUE", value: "MENOR_QUE_NÚMERICO", applicableDefinitionTypes: ["NÚMERICO"] },
	{ id: 5, label: "INVERVALO NÚMERICO", value: "INTERVALO_NÚMERICO", applicableDefinitionTypes: ["NÚMERICO"] },
	{ id: 6, label: "INCLUSO EM LISTA", value: "INCLUI_LISTA", applicableDefinitionTypes: ["SELEÇÃO"] },
];
type FormatComissionFormulaIndividualItemLabelParams = {
	item: string;
	definitions: typeof SaleDefinitions;
};
export function formatComissionFormulaIndividualItemLabel({ item, definitions }: FormatComissionFormulaIndividualItemLabelParams) {
	// If not a variable, return the item
	if (!item.includes("[") || !item.includes("]")) return item;

	// Extracting the identifier from the item
	const formulaItemIdentifier = item.replace("[", "").replace("]", "");

	// Then, checking for premisses
	const definition = definitions.find((p) => p.identifier === formulaItemIdentifier);
	if (!definition) return item;
	return definition.label;
}
type GetComissionScenarioConditionApplicableDefinitionsParams = {
	conditionType: TComissionScenarioConditionType;
	definitions: typeof SaleDefinitions;
};
export function getComissionScenarioConditionApplicableDefinitions({
	conditionType,
	definitions,
}: GetComissionScenarioConditionApplicableDefinitionsParams) {
	const applicableDefinitionTypes = MethodConditionTypes.find((c) => c.value === conditionType)?.applicableDefinitionTypes;
	return definitions.filter((p) => applicableDefinitionTypes?.includes(p.type as "NÚMERICO" | "SELEÇÃO" | "BOOLEANO"));
}
type GetComissionScenarioConditionOptionsByDefinitionParams = {
	conditionVariable: string;
	definitions: typeof SaleDefinitions;
	metadata?: {
		partners: { id: string; label: string; value: string }[];
	};
};
export function getComissionScenarioConditionOptionsByDefinition({
	conditionVariable,
	definitions,
	metadata,
}: GetComissionScenarioConditionOptionsByDefinitionParams) {
	const definition = definitions.find((p) => p.identifier === conditionVariable);
	if (!definition) return [];
	// If the definition is a partner, then return the options from the metadata
	if (conditionVariable === "parceiro_venda" || conditionVariable === "parceiro_vendedor" || conditionVariable === "parceiro_sdr") {
		return metadata?.partners.map((p) => ({ id: p.id, label: p.label, value: p.value })) || [];
	}
	return definition.options;
}
type HandleRenderComissionScenarioResultConditionPhraseParams = {
	result: TUserComissionItem["resultados"][number];
	definitions: typeof SaleDefinitions;
	metadata?: {
		partners: { id: string; label: string; value: string }[];
	};
};
export function handleRenderComissionScenarioResultConditionPhrase({
	result,
	definitions,
	metadata,
}: HandleRenderComissionScenarioResultConditionPhraseParams) {
	const {
		condicao: { aplicavel, tipo, variavel, igual, maiorQue, menorQue, entre, inclui },
	} = result;

	if (!aplicavel) return <p className="text-sm font-bold leading-none tracking-tight">CÁLCULO GERAL</p>;

	const premisseDefinition = definitions.find((p) => p.identifier === variavel);
	const premisseDefinitionLabel = premisseDefinition?.label || "";

	if (tipo === "IGUAL_TEXTO" || tipo === "IGUAL_NÚMERICO") {
		if (
			premisseDefinition?.identifier === "parceiro_venda" ||
			premisseDefinition?.identifier === "parceiro_vendedor" ||
			premisseDefinition?.identifier === "parceiro_sdr"
		) {
			const partner = metadata?.partners.find((p) => p.value === igual);
			if (partner) {
				return (
					<p className="text-sm font-bold leading-none tracking-tight">
						CÁLCULO SE {premisseDefinitionLabel} FOR IGUAL A {partner?.label}:
					</p>
				);
			}
		}
		return (
			<p className="text-sm font-bold leading-none tracking-tight">
				CÁLCULO SE {premisseDefinitionLabel} FOR IGUAL A {igual}:
			</p>
		);
	}
	if (tipo === "MAIOR_QUE_NÚMERICO") {
		return (
			<p className="text-sm font-bold leading-none tracking-tight">
				CÁLCULO SE {premisseDefinitionLabel} FOR MAIOR QUE {maiorQue}:
			</p>
		);
	}
	if (tipo === "MENOR_QUE_NÚMERICO") {
		return (
			<p className="text-sm font-bold leading-none tracking-tight">
				CÁLCULO SE {premisseDefinitionLabel} FOR MENOR QUE {menorQue}:
			</p>
		);
	}
	if (tipo === "INTERVALO_NÚMERICO") {
		return (
			<p className="text-sm font-bold leading-none tracking-tight">
				CÁLCULO SE {premisseDefinitionLabel} ESTIVER ENTRE {entre?.minimo || 0} E {entre?.maximo || 0}:
			</p>
		);
	}
	if (tipo === "INCLUI_LISTA") {
		if (
			premisseDefinition?.identifier === "parceiro_venda" ||
			premisseDefinition?.identifier === "parceiro_vendedor" ||
			premisseDefinition?.identifier === "parceiro_sdr"
		) {
			const partnersLabels = metadata?.partners
				.filter((p) => inclui?.includes(p.value))
				.map((p) => p.label)
				.join(", ");
			console.log({ partnersLabels });
			return (
				<p className="text-sm font-bold leading-none tracking-tight">
					CÁLCULO SE {premisseDefinitionLabel} FOR UMA DAS OPÇÕES DEFINIDAS ({partnersLabels || ""}):
				</p>
			);
		}
		return (
			<p className="text-sm font-bold leading-none tracking-tight">
				CÁLCULO SE {premisseDefinitionLabel} FOR UMA DAS OPÇÕES DEFINIDAS ({inclui?.join(", ") || ""}):
			</p>
		);
	}
	return <></>;
}

type TComissionDefinitionWithValue = {
	identifier: string;
	value: string;
};

type isComissionConditionMatchedParams = {
	conditionConfig: TUserComissionItem["resultados"][number]["condicao"];
	definitions: TComissionDefinitionWithValue[];
};
function isComissionConditionMatched({ conditionConfig, definitions }: isComissionConditionMatchedParams) {
	const { tipo, variavel, igual, maiorQue, menorQue, entre, inclui } = conditionConfig;

	if (!tipo)
		// Shouldnt happen. but just in case
		return false;
	const checkConditionIdentifier = variavel;
	const checkPremisseValue = definitions.find((p) => p.identifier === checkConditionIdentifier)?.value;

	if (tipo === "IGUAL_TEXTO" || tipo === "IGUAL_NÚMERICO") {
		if (checkPremisseValue === igual) return true;
	}
	// If there's no value, then the condition is not applicable
	if (!checkPremisseValue) return false;

	if (tipo === "IGUAL_TEXTO") {
		const checkConditionValue = igual;
		return checkConditionValue === checkPremisseValue;
	}
	if (tipo === "IGUAL_NÚMERICO") {
		const checkConditionValue = igual;
		return Number(checkPremisseValue) === Number(checkConditionValue);
	}
	if (tipo === "MAIOR_QUE_NÚMERICO") {
		const checkConditionValue = maiorQue;
		return Number(checkPremisseValue) > Number(checkConditionValue);
	}
	if (tipo === "MENOR_QUE_NÚMERICO") {
		const checkConditionValue = menorQue;
		return Number(checkPremisseValue) < Number(checkConditionValue);
	}
	if (tipo === "INTERVALO_NÚMERICO") {
		// Getting the values as numbers
		const checkConditionValueMinNumber = Number(entre?.minimo || 0);
		const checkConditionValueMaxNumber = Number(entre?.maximo || 0);
		const checkPremisseValueNumber = Number(checkPremisseValue);

		return checkPremisseValueNumber >= checkConditionValueMinNumber && checkPremisseValueNumber <= checkConditionValueMaxNumber;
	}
	if (inclui) {
		const checkConditionValuesList = inclui || [];
		return checkConditionValuesList.includes(checkPremisseValue);
	}

	return false;
}
type GetComissionValueParams = {
	userComissionConfig: TUserComissionItem[];
	projectTypeId: string;
	userRole: string;
	definitions: TComissionDefinitionWithValue[];
};
export function getComissionValue({ userComissionConfig, projectTypeId, userRole, definitions }: GetComissionValueParams) {
	const comissionConfig = userComissionConfig.find((c) => c.tipoProjeto.id === projectTypeId && c.papel === userRole);
	if (!comissionConfig) return 0;

	const orderedPossibleResults = comissionConfig.resultados.sort((a, b) =>
		a.condicao.aplicavel === b.condicao.aplicavel ? 0 : a.condicao.aplicavel ? -1 : 1,
	);

	const applicableResult = orderedPossibleResults.find((r) => {
		// Since general formulas are last, if condicao aplicavel equals false, either:
		// 1. no result matched the condition
		// 2. there is only one possible result (the general one)
		if (!r.condicao.aplicavel) return true;

		return isComissionConditionMatched({ conditionConfig: r.condicao, definitions });
	});
	// If no result is applicable, then the comission is 0
	if (!applicableResult) return 0;

	try {
		const populatedFormula = applicableResult.formulaArr
			.map((f) => {
				// Extracting the variable, which is determined by outer brackets
				const isVariable = f.includes("[") && f.includes("]");
				if (!isVariable)
					// If there is not variable, then returning the original value
					return f;
				// Else, exchanging the variable key by the variable value itself and returning it
				const variableIdentifier = f.replace("[", "").replace("]", "");

				// Checking if variable used was from definitions, if so, returning it
				const premisseValue = definitions.find((p) => p.identifier === variableIdentifier)?.value;
				if (premisseValue) return premisseValue;

				// If any (definitions) matched, returning 0
				return 0;
			})
			.join("");
		const evaluatedComission = eval(populatedFormula);

		return Number(evaluatedComission);
	} catch (error) {
		console.log("Error processing comission formula", error);
		return 0;
	}
}

///

type TComissionVariablesAlias = { label: string; value: keyof TComissionVariableData };

export const comissionVariablesAlias: TComissionVariablesAlias[] = [
	{ label: "VALOR DA PROPOSTA", value: "valorProposta" },
	{ label: "POTÊNCIA DA PROPOSTA", value: "potenciaPico" },
];

type TConditionsAlias = {
	label: string;
	value: keyof TComissionConditionData;
	types: TComissionScenarioConditionType[];
};
export const comissionConditionsAlias: TConditionsAlias[] = [
	{ label: "VALOR DA PROPOSTA", value: "valorProposta", types: ["IGUAL_NÚMERICO", "MAIOR_QUE_NÚMERICO", "MENOR_QUE_NÚMERICO", "INTERVALO_NÚMERICO"] },
	{
		label: "POTÊNCIA DA PROPOSTA",
		value: "potenciaPico",
		types: ["IGUAL_NÚMERICO", "MAIOR_QUE_NÚMERICO", "MENOR_QUE_NÚMERICO", "INTERVALO_NÚMERICO"],
	},
	{ label: "COMBINAÇÃO DE RESPONSÁVEIS", value: "combinacaoResponsaveis", types: ["IGUAL_TEXTO"] },
];
export function formatComissionFormulaItem(value: string) {
	if (value.includes("[") && value.includes("]")) {
		const variable = comissionVariablesAlias.find((c) => c.value === value.replace("[", "").replace("]", ""));
		if (!variable) return "NÃO DEFINIDO";
		return variable.label;
	}
	return value;
}

export function formatCondition(value: string) {
	const condition = comissionConditionsAlias.find((c) => c.value === value);
	if (!condition) return "NÃO DEFINIDO";
	return condition.label;
}

type FormatComissionSccenarioConditionValueParams = {
	conditionVariable: keyof TComissionConditionData;
	conditionValue: string;
};
export function formatComissionSccenarioConditionValue({ conditionValue, conditionVariable }: FormatComissionSccenarioConditionValueParams) {
	if (conditionVariable === "combinacaoResponsaveis") {
		return OpportunityResponsibilityRolesCombinations.find((c) => c === conditionValue) || "NÃO DEFINIDO";
	}
	if (conditionVariable === "potenciaPico") return conditionValue.toString();
	if (conditionVariable === "valorProposta") return conditionValue.toString();
}

type GetConditionOptions = {
	variable: keyof TComissionConditionData;
};
export function getComissionScenarioConditionOptions({ variable }: GetConditionOptions) {
	if (variable === "combinacaoResponsaveis")
		return OpportunityResponsibilityRolesCombinations.map((c, index) => ({ id: index + 1, label: c, value: c }));
	return [];
}

type RenderComissionScenarioConditionPhraseParams = {
	condition: TUserComissionItem["resultados"][number]["condicao"];
};
export function renderComissionScenarioConditionPhrase({ condition }: RenderComissionScenarioConditionPhraseParams) {
	const isConditionAplicable = condition.aplicavel;
	const conditionType = condition.tipo;
	const conditionAlias = formatCondition(condition.variavel || "");
	if (!isConditionAplicable) return <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">FÓRMULA GERAL:</h1>;
	if (!conditionType || conditionType === "IGUAL_TEXTO" || conditionType === "IGUAL_NÚMERICO")
		return (
			<h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
				SE <strong className="text-[#fead41]">{formatCondition(condition.variavel || "")}</strong> FOR IGUAL A{" "}
				<strong className="text-[#fead41]">
					{formatComissionSccenarioConditionValue({
						conditionVariable: condition.variavel as keyof TComissionConditionData,
						conditionValue: condition.igual || "",
					})}
				</strong>
				:
			</h1>
		);
	if (conditionType === "MAIOR_QUE_NÚMERICO")
		return (
			<h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
				{`SE ${formatCondition(condition.variavel || "")} FOR MAIOR QUE ${condition.maiorQue || 0}:`}
			</h1>
		);
	if (conditionType === "MENOR_QUE_NÚMERICO")
		return (
			<h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
				{`SE ${formatCondition(condition.variavel || "")} FOR MENOR QUE ${condition.menorQue || 0}:`}
			</h1>
		);
	if (conditionType === "INTERVALO_NÚMERICO")
		return (
			<h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
				{`SE ${formatCondition(condition.variavel || "")} ESTIVER ENTRE ${condition.entre?.minimo || 0} E ${condition.entre?.maximo || 0}:`}
			</h1>
		);
	const conditionValues = condition.inclui ? condition.inclui.join(", ") : "";
	if (conditionType === "INCLUI_LISTA")
		return (
			<h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
				{`SE ${formatCondition(condition.variavel || "")} FOR UMA DAS OPÇÕES A SEGUIR ${conditionValues}:`}
			</h1>
		);
}
