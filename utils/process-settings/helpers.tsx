import { TProcessAutomationConditionType, TProcessAutomationEntities } from ".";
import { ProjectContractStatus, YesOrNoOptions } from "../select-options";

export type TProcessAutomationConditionData = {
	projetoAprovado: "SIM" | "NÃO"; // PROJECT ENTITY
	statusContrato: string; // PROJECT ENTITY
	porcentagemReceitaRecebida: number;
	pedidoCompraFeito: "SIM" | "NÃO";
	entregaCompraFeita: "SIM" | "NÃO";
	ordemServicoConcluida: "SIM" | "NÃO";
	atividadeConcluida: "SIM" | "NÃO";
};
type TProcessAutomationConditionAlias = {
	entity: TProcessAutomationEntities;
	label: string;
	value: keyof TProcessAutomationConditionData;
	types: TProcessAutomationConditionType[];
};

export const processAutomationConditionAlias: TProcessAutomationConditionAlias[] = [
	{ entity: "Project", label: "PROJETO APROVADO", value: "projetoAprovado", types: ["IGUAL_TEXTO"] },
	{ entity: "Project", label: "STATUS DO CONTRATO", value: "statusContrato", types: ["IGUAL_TEXTO"] },
	{
		entity: "Revenue",
		label: "PORCENTAGEM RECEBIDA",
		value: "porcentagemReceitaRecebida",
		types: ["IGUAL_NÚMERICO", "MAIOR_QUE_NÚMERICO", "MENOR_QUE_NÚMERICO"],
	},
	{
		entity: "Purchase",
		label: "PEDIDO FEITO",
		value: "pedidoCompraFeito",
		types: ["IGUAL_TEXTO"], // SIM OU NÃO COM BASE NA DATA
	},
	{
		entity: "Purchase",
		label: "ENTREGA FEITA",
		value: "entregaCompraFeita",
		types: ["IGUAL_TEXTO"], // SIM OU NÃO COM BASE NA DATA
	},
	{
		entity: "ServiceOrder",
		label: "ORDEM CONCLUÍDA",
		value: "ordemServicoConcluida",
		types: ["IGUAL_TEXTO"], // SIM OU NÃO COM BASE NA DATA
	},
	{
		entity: "Activity",
		label: "ATIVIDADE CONCLUÍDA",
		value: "atividadeConcluida",
		types: ["IGUAL_TEXTO"], // SIM OU NÃO COM BASE NA DATA
	},
];

export function formatProcessAutomationConditionAlias(value: string) {
	const condition = processAutomationConditionAlias.find((p) => p.value == value);
	if (!condition) return "NÃO DEFINIDO";
	return condition.label;
}
type FormatProcessAutomationConditionValueParams = {
	conditionVariable: keyof TProcessAutomationConditionData;
	conditionValue: string;
};
export function formatProcessAutomationConditionValue({ conditionValue, conditionVariable }: FormatProcessAutomationConditionValueParams) {
	return conditionValue;
}

type GetProcessAutomationConditionOptionsParams = {
	variable: keyof TProcessAutomationConditionData;
};
export function getProcessAutomationConditionOptions({ variable }: GetProcessAutomationConditionOptionsParams) {
	if (variable == "projetoAprovado") return YesOrNoOptions;
	if (variable == "statusContrato") return ProjectContractStatus;
	if (variable == "pedidoCompraFeito") return YesOrNoOptions;
	if (variable == "entregaCompraFeita") return YesOrNoOptions;
	if (variable == "ordemServicoConcluida") return YesOrNoOptions;
	if (variable == "atividadeConcluida") return YesOrNoOptions;
	return [];
}
