import { Database } from "lucide-react";
import type { TCreateCustomFieldInput } from "@/app/api/custom-fields/route";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import MultipleSelectInput from "@/components/Inputs/MultipleSelectInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";

export const ENTITY_OPTIONS = [
	{ id: "CLIENTES", value: "CLIENTES", label: "CLIENTES" },
	{ id: "OPORTUNIDADES", value: "OPORTUNIDADES", label: "OPORTUNIDADES" },
	{ id: "PROPOSTAS", value: "PROPOSTAS", label: "PROPOSTAS" },
];

type EntityConfigBlockProps = {
	infoHolder: TCreateCustomFieldInput["customField"];
	updateInfoHolder: (updates: Partial<TCreateCustomFieldInput["customField"]>) => void;
};

export default function EntityConfigBlock({ infoHolder, updateInfoHolder }: EntityConfigBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="ENTIDADES" sectionTitleIcon={<Database className="w-4 h-4 min-w-4 min-h-4" />}>
			<MultipleSelectInput
				label="ENTIDADES QUE USARÃO ESTE CAMPO (*)"
				selected={infoHolder.entidades}
				options={ENTITY_OPTIONS}
				handleChange={(values) => updateInfoHolder({ entidades: values as TCreateCustomFieldInput["customField"]["entidades"] })}
				onReset={() => updateInfoHolder({ entidades: [] })}
				resetOptionLabel="NENHUMA"
				width="100%"
			/>

			{infoHolder.entidades.length > 0 && (
				<div className="flex flex-col gap-2 rounded-md border border-primary/20 p-3">
					<p className="text-xs font-medium text-primary/70">OBRIGATÓRIO EM:</p>
					<div className="flex flex-wrap gap-4">
						{infoHolder.entidades.map((entity) => (
							<CheckboxInput
								key={entity}
								labelTrue={entity}
								labelFalse={entity}
								checked={infoHolder.obrigatorio?.[entity] ?? false}
								handleChange={(value) =>
									updateInfoHolder({
										obrigatorio: { ...infoHolder.obrigatorio, [entity]: value },
									})
								}
								justify="justify-start"
								padding="0"
							/>
						))}
					</div>
				</div>
			)}
		</ResponsiveDialogDrawerSection>
	);
}
