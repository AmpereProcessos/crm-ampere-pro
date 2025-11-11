import { Zap } from "lucide-react";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { useFunnels } from "@/utils/queries/funnels";
import type { TAutomationConfiguration } from "@/utils/schemas/automations.schema";
import { AutomationConfigurationTriggerTypes, TimeDurationEnumOptions } from "@/utils/select-options";

type AutomationTriggerBlockProps = {
	trigger: TAutomationConfiguration["gatilho"];
	updateTrigger: (newTrigger: TAutomationConfiguration["gatilho"]) => void;
	currentExecution: TAutomationConfiguration["execucao"];
	updateExecution: (newExecution: TAutomationConfiguration["execucao"]) => void;
};

export default function AutomationTriggerBlock({ trigger, updateTrigger, currentExecution, updateExecution }: AutomationTriggerBlockProps) {
	const { data: funnelsData } = useFunnels();

	const selectedFunnel = trigger.tipo === "OPORTUNIDADE-MUDANÇA-ESTÁGIO-FUNIL" ? funnelsData?.find((f: { _id: string }) => f._id === trigger.funilId) : null;

	function handleTriggerTypeChange(newType: TAutomationConfiguration["gatilho"]["tipo"]) {
		// Find supported executions for the new trigger type
		const triggerConfig = AutomationConfigurationTriggerTypes.find((t) => t.value === newType);
		const supportedExecutions = triggerConfig?.supportedExecutions ?? [];

		// Check if current execution is supported by new trigger
		const isCurrentExecutionSupported = supportedExecutions.includes(currentExecution.tipo);

		// Reset execution if not supported
		if (!isCurrentExecutionSupported) {
			if (supportedExecutions.includes("AGENDADA")) {
				updateExecution({
					tipo: "AGENDADA",
					tempoDelayMedida: "HORAS",
					tempoDelayValor: 1,
				});
			} else if (supportedExecutions.includes("RECORRENTE")) {
				updateExecution({
					tipo: "RECORRENTE",
					expressao: "0 0 * * *",
				});
			}
		}

		// Update trigger based on type
		switch (newType) {
			case "OPORTUNIDADE-MUDANÇA-ESTÁGIO-FUNIL":
				updateTrigger({
					tipo: "OPORTUNIDADE-MUDANÇA-ESTÁGIO-FUNIL",
					funilId: "",
					estagioFunilInicialId: "",
					estagioFunilFinalId: "",
				});
				break;
			case "OPORTUNIDADE-PERDA":
				updateTrigger({
					tipo: "OPORTUNIDADE-PERDA",
				});
				break;
			case "OPORTUNIDADE-PERÍODO-DESDE-INTERAÇÃO":
				updateTrigger({
					tipo: "OPORTUNIDADE-PERÍODO-DESDE-INTERAÇÃO",
					tempoMedida: "DIAS",
					tempoValor: 7,
				});
				break;
			case "OPORTUNIDADE-PERÍODO-DESDE-PERDA":
				updateTrigger({
					tipo: "OPORTUNIDADE-PERÍODO-DESDE-PERDA",
					tempoMedida: "DIAS",
					tempoValor: 7,
				});
				break;
		}
	}

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="GATILHO" sectionTitleIcon={<Zap className="h-4 w-4" />}>
			<SelectInput
				label="TIPO DE GATILHO"
				value={trigger.tipo}
				resetOptionLabel="NÃO DEFINIDO"
				options={AutomationConfigurationTriggerTypes.map((type) => ({
					id: type.value,
					value: type.value,
					label: type.label,
				}))}
				handleChange={(value) => handleTriggerTypeChange(value as TAutomationConfiguration["gatilho"]["tipo"])}
				onReset={() => updateTrigger({ tipo: "OPORTUNIDADE-PERDA" })}
				width="100%"
			/>

			{trigger.tipo === "OPORTUNIDADE-MUDANÇA-ESTÁGIO-FUNIL" && (
				<>
					<SelectInput
						label="FUNIL"
						value={trigger.funilId}
						resetOptionLabel="NÃO DEFINIDO"
						options={
							funnelsData?.map((funnel: { _id: string; nome: string }) => ({
								id: funnel._id,
								value: funnel._id,
								label: funnel.nome,
							})) ?? []
						}
						handleChange={(value) => updateTrigger({ ...trigger, funilId: value })}
						onReset={() => updateTrigger({ ...trigger, funilId: "" })}
						width="100%"
					/>

					{trigger.funilId && selectedFunnel && (
						<div className="w-full flex items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-1/2">
								<SelectInput
									label="ESTÁGIO INICIAL"
									value={trigger.estagioFunilInicialId}
									resetOptionLabel="NÃO DEFINIDO"
									options={
										selectedFunnel.etapas?.map((etapa) => ({
											id: etapa.id.toString(),
											value: etapa.id.toString(),
											label: etapa.nome,
										})) ?? []
									}
									handleChange={(value) => updateTrigger({ ...trigger, estagioFunilInicialId: value })}
									onReset={() => updateTrigger({ ...trigger, estagioFunilInicialId: "" })}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/2">
								<SelectInput
									label="ESTÁGIO FINAL"
									value={trigger.estagioFunilFinalId}
									resetOptionLabel="NÃO DEFINIDO"
									options={
										selectedFunnel.etapas?.map((etapa) => ({
											id: etapa.id.toString(),
											value: etapa.id.toString(),
											label: etapa.nome,
										})) ?? []
									}
									handleChange={(value) => updateTrigger({ ...trigger, estagioFunilFinalId: value })}
									onReset={() => updateTrigger({ ...trigger, estagioFunilFinalId: "" })}
									width="100%"
								/>
							</div>
						</div>
					)}
				</>
			)}

			{trigger.tipo === "OPORTUNIDADE-PERDA" && (
				<div className="rounded-md border border-border bg-yellow-100 p-3 text-sm text-yellow-800">
					Esta automação será acionada quando uma oportunidade for marcada como perdida.
				</div>
			)}

			{(trigger.tipo === "OPORTUNIDADE-PERÍODO-DESDE-INTERAÇÃO" || trigger.tipo === "OPORTUNIDADE-PERÍODO-DESDE-PERDA") && (
				<div className="w-full flex items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="MEDIDA DE TEMPO"
							value={trigger.tempoMedida}
							resetOptionLabel="NÃO DEFINIDO"
							options={TimeDurationEnumOptions}
							handleChange={(value) => updateTrigger({ ...trigger, tempoMedida: value as "HORAS" | "DIAS" | "SEMANAS" | "MESES" | "ANOS" })}
							onReset={() => updateTrigger({ ...trigger, tempoMedida: "HORAS" })}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="VALOR DO TEMPO"
							placeholder="Valor do tempo de espera para a automação ser acionada."
							value={trigger.tempoValor}
							handleChange={(value) => updateTrigger({ ...trigger, tempoValor: value })}
							width="100%"
						/>
					</div>
				</div>
			)}
		</ResponsiveDialogDrawerSection>
	);
}
