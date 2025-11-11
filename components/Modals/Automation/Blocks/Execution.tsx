import { CalendarClock, Clock, RotateCcw } from "lucide-react";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TAutomationConfiguration } from "@/utils/schemas/automations.schema";
import { AutomationConfigurationRecurrentExecutionExpressions, AutomationConfigurationTriggerTypes, TimeDurationEnumOptions } from "@/utils/select-options";

type AutomationExecutionBlockProps = {
	execution: TAutomationConfiguration["execucao"];
	updateExecution: (newExecution: TAutomationConfiguration["execucao"]) => void;
	triggerType: TAutomationConfiguration["gatilho"]["tipo"];
};

export default function AutomationExecutionBlock({ execution, updateExecution, triggerType }: AutomationExecutionBlockProps) {
	// Get supported execution types for current trigger
	const triggerConfig = AutomationConfigurationTriggerTypes.find((t) => t.value === triggerType);
	const supportedExecutions = triggerConfig?.supportedExecutions ?? [];

	// Determine if user can change execution type
	const canChangeExecutionType = supportedExecutions.length > 1;

	const canSelectedScheduleExecution = supportedExecutions.includes("AGENDADA");
	const canSelectedRecurrentExecution = supportedExecutions.includes("RECORRENTE");
	function handleExecutionTypeChange(newType: "AGENDADA" | "RECORRENTE") {
		if (newType === "AGENDADA") {
			updateExecution({
				tipo: "AGENDADA",
				tempoDelayMedida: "HORAS",
				tempoDelayValor: 1,
			});
		} else {
			updateExecution({
				tipo: "RECORRENTE",
				expressao: "0 0 * * *",
			});
		}
	}

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="EXECUÇÃO" sectionTitleIcon={<Clock className="h-4 w-4" />}>
			<div className="w-full flex items-center gap-2 flex-wrap justify-center">
				<Button
					variant={execution.tipo === "AGENDADA" ? "default" : "ghost"}
					onClick={() => handleExecutionTypeChange("AGENDADA")}
					size="fit"
					className="flex items-center gap-2 px-2 py-1 rounded-md"
					disabled={!canSelectedScheduleExecution}
				>
					<CalendarClock className="w-4 h-4 min-w-4 min-h-4" />
					AGENDADA
				</Button>
				<Button
					variant={execution.tipo === "RECORRENTE" ? "default" : "ghost"}
					onClick={() => handleExecutionTypeChange("RECORRENTE")}
					size="fit"
					className="flex items-center gap-2 px-2 py-1 rounded-md"
					disabled={!canSelectedRecurrentExecution}
				>
					<RotateCcw className="w-4 h-4 min-w-4 min-h-4" />
					RECORRENTE
				</Button>
			</div>

			{execution.tipo === "AGENDADA" && (
				<div className="w-full flex items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="MEDIDA DE TEMPO (DELAY)"
							value={execution.tempoDelayMedida}
							resetOptionLabel="NÃO DEFINIDO"
							options={TimeDurationEnumOptions}
							handleChange={(value) => updateExecution({ ...execution, tempoDelayMedida: value as "HORAS" | "DIAS" | "SEMANAS" | "MESES" | "ANOS" })}
							onReset={() => updateExecution({ ...execution, tempoDelayMedida: "HORAS" })}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="VALOR DO TEMPO (DELAY)"
							placeholder="Valor do tempo de espera para a automação ser acionada."
							value={execution.tempoDelayValor}
							handleChange={(value) => updateExecution({ ...execution, tempoDelayValor: value })}
							width="100%"
						/>
					</div>
				</div>
			)}

			{execution.tipo === "RECORRENTE" && (
				<div className="flex flex-col gap-2">
					<SelectInput
						label="EXPRESSÃO CRON (TEMPLATE)"
						value={execution.expressao}
						resetOptionLabel="NÃO DEFINIDO"
						options={AutomationConfigurationRecurrentExecutionExpressions}
						handleChange={(value) => updateExecution({ ...execution, expressao: value })}
						onReset={() => updateExecution({ ...execution, expressao: "0 0 * * *" })}
						width="100%"
					/>
					<TextInput
						label="EXPRESSÃO CRON"
						value={execution.expressao}
						placeholder="Ex: 0 0 * * *"
						handleChange={(value) => updateExecution({ ...execution, expressao: value })}
						width="100%"
					/>

					<div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
						<p className="mb-2 font-semibold">EXEMPLO DE EXPRESSÕES CRON:</p>
						<ul className="list-disc space-y-1 pl-4">
							<li>
								<code className="rounded bg-background px-1">0 0 * * *</code> - Todos os dias à meia-noite
							</li>
							<li>
								<code className="rounded bg-background px-1">0 */6 * * *</code> - A cada 6 horas
							</li>
							<li>
								<code className="rounded bg-background px-1">0 9 * * 1</code> - Toda segunda-feira às 9h
							</li>
						</ul>
					</div>
				</div>
			)}
		</ResponsiveDialogDrawerSection>
	);
}
