import { Users } from "lucide-react";
import type { TCreateCustomFieldInput } from "@/app/api/custom-fields/route";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import SelectInput from "@/components/Inputs/SelectInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TCustomFieldHeritage } from "@/utils/schemas/custom-fields.schema";

type TEntity = "CLIENTES" | "OPORTUNIDADES" | "PROPOSTAS";

const HERITAGE_BEHAVIOR_OPTIONS = [
	{ id: "copiar", value: "copiar", label: "COPIAR (UMA VEZ NA CRIAÇÃO)" },
	{ id: "sincronizar", value: "sincronizar", label: "SINCRONIZAR (ATUALIZA QUANDO A ORIGEM MUDA)" },
	// { id: "sugerir", value: "sugerir", label: "SUGERIR (permite alteração)" },
];

// Get possible source entities for heritage (entities that come before in the flow)
const getSourceEntitiesForHeritage = (targetEntity: TEntity): TEntity[] => {
	const flow: TEntity[] = ["CLIENTES", "OPORTUNIDADES", "PROPOSTAS"];
	const targetIndex = flow.indexOf(targetEntity);
	return flow.slice(0, targetIndex);
};

type HeritageBlockProps = {
	infoHolder: TCreateCustomFieldInput["customField"];
	updateHeritage: (entity: TEntity, updates: Partial<TCustomFieldHeritage>) => void;
	removeHeritage: (entity: TEntity) => void;
};

export default function HeritageBlock({ infoHolder, updateHeritage, removeHeritage }: HeritageBlockProps) {
	// Only show if there are entities that can inherit (not CLIENTES as it's the root)
	const inheritableEntities = infoHolder.entidades.filter((e) => e !== "CLIENTES");

	if (inheritableEntities.length === 0) {
		return null;
	}

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="HERANÇA DE VALORES" sectionTitleIcon={<Users className="w-4 h-4 min-w-4 min-h-4" />}>
			<p className="text-xs text-primary/70 mb-2">Configure como os valores deste campo são herdados entre entidades.</p>

			{inheritableEntities.map((entity) => {
				const sourceEntities = getSourceEntitiesForHeritage(entity);
				const hasHeritage = infoHolder.heranca?.[entity] !== undefined;
				const heritageConfig = infoHolder.heranca?.[entity];

				return (
					<div key={entity} className="rounded-md border border-primary/20 p-3">
						<div className="flex items-center justify-between mb-2 gap-2">
							<p className="text-sm font-medium">{entity}</p>
							<CheckboxInput
								labelTrue="HERDAR VALOR"
								labelFalse="HERDAR HERDAR"
								checked={hasHeritage}
								handleChange={(value) => {
									if (value) {
										updateHeritage(entity, { entidadeOrigem: sourceEntities[0] || "CLIENTES" });
									} else {
										removeHeritage(entity);
									}
								}}
								justify="justify-end"
								padding="0"
							/>
						</div>

						{hasHeritage && sourceEntities.length > 0 && (
							<div className="flex flex-col gap-2 mt-3 pl-2 border-l-2 border-primary/20">
								<SelectInput
									label="HERDAR DE"
									value={heritageConfig?.entidadeOrigem || sourceEntities[0]}
									options={sourceEntities.map((e) => ({
										id: e,
										value: e,
										label: e,
									}))}
									handleChange={(value) => updateHeritage(entity, { entidadeOrigem: value })}
									onReset={() => updateHeritage(entity, { entidadeOrigem: sourceEntities[0] })}
									resetOptionLabel={sourceEntities[0]}
									width="100%"
								/>
								<SelectInput
									label="COMPORTAMENTO"
									value={heritageConfig?.comportamento || "copiar"}
									options={HERITAGE_BEHAVIOR_OPTIONS}
									handleChange={(value) => updateHeritage(entity, { comportamento: value })}
									onReset={() => updateHeritage(entity, { comportamento: "copiar" })}
									resetOptionLabel="Copiar"
									width="100%"
								/>
								<CheckboxInput
									labelTrue="PERMITIR SOBRESCREVER VALOR HERDADO"
									labelFalse="NÃO PERMITIR SOBRESCREVER"
									checked={heritageConfig?.permitirSobrescrita ?? true}
									handleChange={(value) => updateHeritage(entity, { permitirSobrescrita: value })}
									justify="justify-start"
									padding="0"
								/>
							</div>
						)}
					</div>
				);
			})}
		</ResponsiveDialogDrawerSection>
	);
}
