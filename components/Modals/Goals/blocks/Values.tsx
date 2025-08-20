import { AlertTriangle, BadgeDollarSign, Check, Goal, Percent, Plus, Send, Zap } from "lucide-react";
import NumberInput from "@/components/Inputs/NumberInput";
import { Button } from "@/components/ui/button";
import type { TGoalKeys } from "@/utils/schemas/goal.schema";
import { type TGoalStore, useGoalStore } from "@/utils/stores/goal-store";

export default function GoalValuesBlock() {
	const goalValues = useGoalStore((s) => s.goal.objetivo);
	const updateGoalValues = useGoalStore((s) => s.updateGoalValues);
	const valuesTotalsFromUsers = useGoalStore((s) =>
		s.goal.usuarios.reduce(
			(acc: { usersCount: number; totals: Record<TGoalKeys, number> }, user) => {
				acc.usersCount++;
				acc.totals.oportunidadesCriadas += user.objetivo.oportunidadesCriadas;
				acc.totals.oportunidadesEnviadas += user.objetivo.oportunidadesEnviadas;
				acc.totals.oportunidadesEnviadasConversao += user.objetivo.oportunidadesEnviadasConversao;
				acc.totals.oportunidadesEnviadasGanhas += user.objetivo.oportunidadesEnviadasGanhas;
				acc.totals.oportunidadesEnviadasGanhasConversao += user.objetivo.oportunidadesEnviadasGanhasConversao;
				acc.totals.oportunidadesGanhas += user.objetivo.oportunidadesGanhas;
				acc.totals.oportunidadesGanhasConversao += user.objetivo.oportunidadesGanhasConversao;
				acc.totals.potenciaVendida += user.objetivo.potenciaVendida;
				acc.totals.valorVendido += user.objetivo.valorVendido;
				return acc;
			},
			{
				usersCount: 0,
				totals: {
					oportunidadesCriadas: 0,
					oportunidadesEnviadas: 0,
					oportunidadesEnviadasConversao: 0,
					oportunidadesEnviadasGanhas: 0,
					oportunidadesEnviadasGanhasConversao: 0,
					oportunidadesGanhas: 0,
					oportunidadesGanhasConversao: 0,
					potenciaVendida: 0,
					valorVendido: 0,
				},
			},
		),
	);
	const hasDiscrepancies =
		valuesTotalsFromUsers.usersCount > 0 &&
		Object.keys(valuesTotalsFromUsers.totals).some((key) => valuesTotalsFromUsers.totals[key as TGoalKeys] !== goalValues[key as TGoalKeys]);
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex w-fit items-center gap-2 rounded bg-primary/20 px-2 py-1">
				<Goal size={15} />
				<h1 className="w-fit text-start font-medium text-xs tracking-tight">OBJETIVO</h1>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						handleChange={(value) => updateGoalValues({ oportunidadesCriadas: value })}
						label="OPORTUNIDADES CRIADAS"
						labelIcon={Plus}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades criadas..."
						value={goalValues.oportunidadesCriadas}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<NumberInput
						handleChange={(value) => updateGoalValues({ oportunidadesEnviadas: value })}
						label="OPORTUNIDADES ENVIADAS"
						labelIcon={Send}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades enviadas..."
						value={goalValues.oportunidadesEnviadas}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<NumberInput
						handleChange={(value) => updateGoalValues({ oportunidadesGanhas: value })}
						label="OPORTUNIDADES GANHAS"
						labelIcon={Check}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades ganhas..."
						value={goalValues.oportunidadesGanhas}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<NumberInput
						handleChange={(value) => updateGoalValues({ valorVendido: value })}
						label="VALOR VENDIDO (R$)"
						labelIcon={BadgeDollarSign}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de valor vendido..."
						value={goalValues.valorVendido}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<NumberInput
						handleChange={(value) => updateGoalValues({ potenciaVendida: value })}
						label="POTÊNCIA VENDIDA (kWp)"
						labelIcon={Zap}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de potência vendida..."
						value={goalValues.potenciaVendida}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						handleChange={(value) => updateGoalValues({ oportunidadesEnviadasConversao: value })}
						label="CONVERSÃO EM ENVIO (%)"
						labelIcon={Percent}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de conversão em envio..."
						value={goalValues.oportunidadesEnviadasConversao}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<NumberInput
						handleChange={(value) => updateGoalValues({ oportunidadesGanhasConversao: value })}
						label="CONVERSÃO EM GANHO (%)"
						labelIcon={Percent}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de conversão em ganho..."
						value={goalValues.oportunidadesGanhasConversao}
						width="100%"
					/>
				</div>
			</div>
			{hasDiscrepancies ? (
				<div className="flex w-full flex-col gap-1 rounded-lg border border-yellow-700 bg-yellow-100 p-3 text-yellow-700">
					<div className="flex w-full items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4" />
							<h1 className="font-bold text-xs">ALERTA</h1>
						</div>
						<Button
							className="text-xs text-yellow-700"
							onClick={() => {
								updateGoalValues({
									oportunidadesCriadas: valuesTotalsFromUsers.totals.oportunidadesCriadas,
									oportunidadesEnviadas: valuesTotalsFromUsers.totals.oportunidadesEnviadas,
									oportunidadesEnviadasConversao: valuesTotalsFromUsers.totals.oportunidadesEnviadasConversao,
									oportunidadesEnviadasGanhas: valuesTotalsFromUsers.totals.oportunidadesEnviadasGanhas,
									oportunidadesEnviadasGanhasConversao: valuesTotalsFromUsers.totals.oportunidadesEnviadasGanhasConversao,
									oportunidadesGanhas: valuesTotalsFromUsers.totals.oportunidadesGanhas,
									oportunidadesGanhasConversao: valuesTotalsFromUsers.totals.oportunidadesGanhasConversao,
									potenciaVendida: valuesTotalsFromUsers.totals.potenciaVendida,
									valorVendido: valuesTotalsFromUsers.totals.valorVendido,
								});
							}}
							size={"fit"}
							variant={"link"}
						>
							AJUSTAR
						</Button>
					</div>
					<div className="flex items-center gap-2">
						<h1 className="text-xs">Existem discrepâncias entre os valores totais definidos aos usuários e o objetivo total do período.</h1>
					</div>
				</div>
			) : null}
		</div>
	);
}
