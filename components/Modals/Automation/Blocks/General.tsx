import { Settings } from "lucide-react";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import TextareaInput from "@/components/Inputs/TextareaInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TAutomationConfiguration } from "@/utils/schemas/automations.schema";

type AutomationGeneralBlockProps = {
	infoHolder: TAutomationConfiguration;
	updateInfoHolder: (changes: Partial<TAutomationConfiguration>) => void;
};

export default function AutomationGeneralBlock({ infoHolder, updateInfoHolder }: AutomationGeneralBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="INFORMAÇÕES GERAIS" sectionTitleIcon={<Settings className="h-4 w-4" />}>
			<div className="w-fit self-center">
				<CheckboxInput
					checked={infoHolder.ativo}
					labelFalse="AUTOMAÇÃO DESATIVADA"
					labelTrue="AUTOMAÇÃO ATIVADA"
					handleChange={(value) => updateInfoHolder({ ativo: value })}
				/>
			</div>
			<TextInput
				label="TÍTULO"
				value={infoHolder.titulo}
				placeholder="Ex: Lembrete de proposta pendente"
				handleChange={(value) => updateInfoHolder({ titulo: value })}
				width="100%"
			/>
			<TextareaInput
				label="DESCRIÇÃO"
				value={infoHolder.descricao}
				placeholder="Descreva o objetivo desta automação..."
				handleChange={(value) => updateInfoHolder({ descricao: value })}
			/>
		</ResponsiveDialogDrawerSection>
	);
}
