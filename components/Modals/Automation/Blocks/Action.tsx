import { Send } from "lucide-react";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TAutomationConfiguration } from "@/utils/schemas/automations.schema";
import { AutomationConfigurationActionTypes } from "@/utils/select-options";

type AutomationActionBlockProps = {
	action: TAutomationConfiguration["acao"];
	updateAction: (newAction: TAutomationConfiguration["acao"]) => void;
};

export default function AutomationActionBlock({ action, updateAction }: AutomationActionBlockProps) {
	function handleActionTypeChange(newType: "ENVIO-CLIENTE-EMAIL" | "ENVIO-CLIENTE-WHATSAPP") {
		if (newType === "ENVIO-CLIENTE-EMAIL") {
			updateAction({
				tipo: "ENVIO-CLIENTE-EMAIL",
				templateId: "",
			});
		} else {
			updateAction({
				tipo: "ENVIO-CLIENTE-WHATSAPP",
				templateId: "",
			});
		}
	}

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="AÇÃO" sectionTitleIcon={<Send className="h-4 w-4" />}>
			<SelectInput
				label="TIPO DE AÇÃO"
				value={action.tipo}
				resetOptionLabel="NÃO DEFINIDO"
				options={AutomationConfigurationActionTypes}
				handleChange={(value) => handleActionTypeChange(value as "ENVIO-CLIENTE-EMAIL" | "ENVIO-CLIENTE-WHATSAPP")}
				onReset={() => updateAction({ tipo: "ENVIO-CLIENTE-EMAIL", templateId: "" })}
				width="100%"
			/>
			{action.tipo === "ENVIO-CLIENTE-EMAIL" && (
				<TextInput
					label="ID DO TEMPLATE"
					value={action.templateId}
					placeholder="ID do template de e-mail"
					handleChange={(value) => updateAction({ ...action, templateId: value })}
					width="100%"
				/>
			)}

			{action.tipo === "ENVIO-CLIENTE-WHATSAPP" && (
				<TextInput
					label="ID DO TEMPLATE"
					value={action.templateId}
					placeholder="ID do template de WhatsApp"
					handleChange={(value) => updateAction({ ...action, templateId: value })}
					width="100%"
				/>
			)}
		</ResponsiveDialogDrawerSection>
	);
}
