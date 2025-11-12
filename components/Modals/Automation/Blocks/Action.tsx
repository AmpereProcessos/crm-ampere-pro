import { Send } from "lucide-react";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { WHATSAPP_TEMPLATES } from "@/lib/automations/whatsapp";
import { EMAIL_TEMPLATES_OPTIONS } from "@/lib/email/templates";
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

	const whatsappTemplateOptions = Object.entries(WHATSAPP_TEMPLATES).map(([key, value]) => ({
		id: key,
		label: value.title,
		value: key,
	}));
	const emailTemplateOptions = Object.entries(EMAIL_TEMPLATES_OPTIONS).map(([key, value]) => ({
		id: key,
		label: value.title,
		value: key,
	}));
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
				<SelectInput
					label="TEMPLATE DE E-MAIL"
					value={action.templateId}
					resetOptionLabel="NÃO DEFINIDO"
					options={emailTemplateOptions}
					handleChange={(value) => updateAction({ ...action, templateId: value })}
					onReset={() => updateAction({ ...action, templateId: "" })}
					width="100%"
				/>
			)}

			{action.tipo === "ENVIO-CLIENTE-WHATSAPP" && (
				<SelectInput
					label="TEMPLATE DE WHATSAPP"
					value={action.templateId}
					resetOptionLabel="NÃO DEFINIDO"
					options={whatsappTemplateOptions}
					handleChange={(value) => updateAction({ ...action, templateId: value })}
					onReset={() => updateAction({ ...action, templateId: "" })}
					width="100%"
				/>
			)}
		</ResponsiveDialogDrawerSection>
	);
}
