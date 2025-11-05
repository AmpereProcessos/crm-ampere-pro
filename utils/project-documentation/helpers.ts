import { stateCities } from "../estados_cidades";
import { TElectricalInstallationGroups, TElectricalInstallationLigationTypes, TElectricalInstallationOwnerTypes } from "../schemas/opportunity.schema";
import { ConsumerUnitHolderType, ConsumerUnitLigationType, ElectricalInstallationGroups } from "../select-options";

const States = Object.keys(stateCities).map((k, index) => ({ id: index + 1, label: k, value: k }));
const Cities = Object.entries(stateCities)
	.map(([uf, cities]) => cities)
	.flat(1)
	.map((c, index) => ({ id: index + 1, label: c, value: c }));
export type TDocumentationConditionData = {
	uf: string;
	cidade: string;
	tipoLigacao: TElectricalInstallationLigationTypes | null;
	grupoInstalacao: TElectricalInstallationGroups | null;
	tipoTitular: TElectricalInstallationOwnerTypes | null;
};

export const conditionsAlias = [
	{ label: "ESTADO", value: "uf" },
	{ label: "CIDADE", value: "cidade" },
	{ label: "TIPO DE LIGAÇÃO", value: "tipoLigacao" },
	{ label: "TIPO DA INSTALAÇÃO", value: "grupoInstalacao" },
	{ label: "TIPO DO TITULAR", value: "tipoTitular" },
];

export function formatCondition(value: string) {
	const condition = conditionsAlias.find((c) => c.value == value);
	if (!condition) return "NÃO DEFINIDO";
	return condition.label;
}

type GetConditionOptionsParams = {
	variable: keyof TDocumentationConditionData;
};

export function getConditionOptions({ variable }: GetConditionOptionsParams) {
	if (variable == "uf") return States;
	if (variable == "cidade") return Cities;
	if (variable == "tipoLigacao") return ConsumerUnitLigationType;
	if (variable == "grupoInstalacao") return ElectricalInstallationGroups;
	if (variable == "tipoTitular") return ConsumerUnitHolderType;
	return [];
}
