import { TProjectType } from "../schemas/project-types.schema";
import { TDocumentationConditionData } from "./helpers";

type TRequiredDocument = {
	titulo: string;
	descricao: string;
	multiplo: boolean;
};

type HandleDocumentationDefinitionParams = {
	projectTypeDocumentation: TProjectType["documentacao"];
	conditionData: TDocumentationConditionData;
};
export function handleDocumentationDefinition({ projectTypeDocumentation, conditionData }: HandleDocumentationDefinitionParams) {
	// Filtering the possible project type documentation to those that will be applicable
	// Which means those which are overall obligatory or matching the mandatory conditions
	const projectTypeDocumentationMatchingCondition = projectTypeDocumentation.filter((documentation) => {
		if (!documentation.condicao.aplicavel) return true;
		// If there's a condition, extracting the conditionns comparators and the condition data to compare
		const conditionVariable = documentation.condicao.variavel;
		const conditionValue = documentation.condicao.igual;
		const condition = conditionData[conditionVariable as keyof typeof conditionData];
		// in case the condition data value is null, returning false
		if (!condition) return false;
		// If condition is matched, then returning true
		if (condition == conditionValue) return true;
		// Else, returning false
		return false;
	});
	const requiredDocuments: TRequiredDocument[] = projectTypeDocumentationMatchingCondition.map((documentation) => ({
		titulo: documentation.titulo,
		descricao: documentation.descricao,
		multiplo: documentation.multiplo,
	}));
	return requiredDocuments;
}
