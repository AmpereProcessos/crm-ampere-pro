import React, { useState } from "react";
import type { TUser } from "@/utils/schemas/user.schema";
import { useProjectTypes } from "@/utils/queries/project-types";
import ErrorComponent from "@/components/utils/ErrorComponent";
import { getErrorMessage } from "@/lib/methods/errors";
import type { TProjectTypeDTO } from "@/utils/schemas/project-types.schema";
import { Button } from "@/components/ui/button";
import ComissionResultModal from "./ComissionResultModal";
import { OpportunityResponsibilityRoles } from "@/utils/select-options";
import { formatComissionFormulaIndividualItemLabel, handleRenderComissionScenarioResultConditionPhrase, SaleDefinitions } from "@/utils/comissions/helpers";
import { MdEdit } from "react-icons/md";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { usePartnersSimplified } from "@/utils/queries/partners";
import type { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";

const comissionVariablesAlias = [{ label: "VALOR DA PROPOSTA", value: "valorProposta" }, { label: "POTÊNCIA PICO DA PROPOSTA" }];

type ComissionScenariosMenuProps = {
	userComissionConfig: TUser["comissionamento"];
	addComissionConfigItem: (item: TUser["comissionamento"][number]) => void;
	updateComissionConfigItem: (info: { item: Partial<TUser["comissionamento"][number]>; index: number }) => void;
};
function ComissionScenariosMenu({ userComissionConfig, addComissionConfigItem, updateComissionConfigItem }: ComissionScenariosMenuProps) {
	const { data: projectTypes, isLoading, isError, isSuccess, error } = useProjectTypes();
	const { data: partners } = usePartnersSimplified();
	return (
		<div className="w-full flex flex-col gap-2">
			<h1 className="text-sm font-medium">CENÁRIOS DE COMISSÃO</h1>
			{isLoading ? <p className="text-xs text-muted-foreground animate-pulse">Carregando...</p> : null}
			{isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
			{isSuccess
				? projectTypes.map((projectType) => (
						<ComissionProjectTypeCard
							key={projectType._id}
							projectType={projectType}
							userComissionConfig={userComissionConfig}
							addComissionConfigItem={addComissionConfigItem}
							updateComissionConfigItem={updateComissionConfigItem}
							partners={partners || []}
						/>
					))
				: null}
		</div>
	);
}

export default ComissionScenariosMenu;

type ComissionProjectTypeCardProps = {
	projectType: TProjectTypeDTO;
	userComissionConfig: TUser["comissionamento"];
	addComissionConfigItem: (item: TUser["comissionamento"][number]) => void;
	updateComissionConfigItem: (info: { item: Partial<TUser["comissionamento"][number]>; index: number }) => void;
	partners: TPartnerSimplifiedDTO[];
};
function ComissionProjectTypeCard({ projectType, userComissionConfig, addComissionConfigItem, updateComissionConfigItem, partners }: ComissionProjectTypeCardProps) {
	const [newComissionMenuActiveRole, setNewComissionMenuActiveRole] = useState<string | null>(null);
	const projectTypeComissionConfig = userComissionConfig.map((c, i) => ({ ...c, itemIndex: i })).filter((scenario) => scenario.tipoProjeto.id === projectType._id);
	const missingRoleComissionConfig = OpportunityResponsibilityRoles.filter((role) => !projectTypeComissionConfig.some((scenario) => scenario.papel === role.value)).map(
		(role) => role.value,
	);
	function addComissionConfigItemResult(info: { comissionConfigIndex: number; result: TUser["comissionamento"][number]["resultados"][number] }) {
		if (info.result.condicao.aplicavel) {
			if (!info.result.condicao.tipo) return toast.error("Selecione uma variável para condição.");
			if (info.result.condicao.tipo === "IGUAL_TEXTO" && !info.result.condicao.igual) return toast.error("Selecione o resultado para comparação da condição.");
			if (info.result.condicao.tipo === "IGUAL_NÚMERICO" && (info.result.condicao.igual === null || info.result.condicao.igual === undefined))
				return toast.error("Preencha o resultado para comparação da condição.");
			if (info.result.condicao.tipo === "MAIOR_QUE_NÚMERICO" && (info.result.condicao.maiorQue === null || info.result.condicao.maiorQue === undefined))
				return toast.error("Preencha o valor para comparação.");
			if (info.result.condicao.tipo === "MENOR_QUE_NÚMERICO" && (info.result.condicao.menorQue === null || info.result.condicao.menorQue === undefined))
				return toast.error("Preencha o valor para comparação.");
			if (
				info.result.condicao.tipo === "INTERVALO_NÚMERICO" &&
				(info.result.condicao.entre?.minimo === null || info.result.condicao.entre?.minimo === undefined) &&
				(info.result.condicao.entre?.maximo === null || info.result.condicao.entre?.maximo === undefined)
			)
				return toast.error("Preencha os valores para comparação.");
			if (info.result.condicao.tipo === "INCLUI_LISTA" && (!info.result.condicao.inclui || info.result.condicao.inclui.length === 0))
				return toast.error("Preencha a list para comparação.");
		}
		const currentResults = userComissionConfig[info.comissionConfigIndex].resultados;
		// Validating existence of general formula in results array
		const hasGeneralFormula = currentResults.some((r) => !r.condicao.aplicavel);
		if (hasGeneralFormula && !info.result.condicao.aplicavel) return toast.error("Não é possível cadastrar duas fórmulas gerais.");

		updateComissionConfigItem({
			index: info.comissionConfigIndex,
			item: { resultados: [...currentResults, info.result] },
		});
	}
	function updateComissionConfigItemResult(info: { comissionConfigIndex: number; resultIndex: number; result: TUser["comissionamento"][number]["resultados"][number] }) {
		updateComissionConfigItem({
			index: info.comissionConfigIndex,
			item: { resultados: userComissionConfig[info.comissionConfigIndex].resultados.map((r, i) => (i === info.resultIndex ? info.result : r)) },
		});
	}
	return (
		<div className="flex w-full flex-col gap-3 rounded border border-primary/20 bg-[#fff] p-2 shadow-sm">
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<h1 className="text-sm font-bold leading-none tracking-tight">{projectType.nome}</h1>
			</div>
			{projectTypeComissionConfig
				? projectTypeComissionConfig.map((scenario, index) => (
						<ComissionProjectTypeComissionConfigCard
							key={`${projectType._id}-${index}`}
							scenario={scenario}
							addComissionConfigItemResult={(data) => addComissionConfigItemResult({ comissionConfigIndex: scenario.itemIndex, result: data })}
							updateComissionConfigItemResult={(data) => updateComissionConfigItemResult({ comissionConfigIndex: scenario.itemIndex, resultIndex: data.resultIndex, result: data.result })}
							partners={partners}
						/>
					))
				: null}
			<div className="w-full flex items-center justify-center flex-wrap p-2">
				{missingRoleComissionConfig.map((role) => (
					<Button key={role} onClick={() => setNewComissionMenuActiveRole(role)} variant={"ghost"} size={"fit"} className="px-2 py-1 text-xs">
						DEFINIR COMISSÃO PARA {role}
					</Button>
				))}
			</div>
			{newComissionMenuActiveRole ? (
				<ComissionResultModal
					handleCommitConditionResult={(info) =>
						addComissionConfigItem({
							tipoProjeto: {
								nome: projectType.nome,
								id: projectType._id,
							},
							papel: newComissionMenuActiveRole,
							resultados: [info],
						})
					}
					closeModal={() => setNewComissionMenuActiveRole(null)}
				/>
			) : null}
		</div>
	);
}

type ComissionProjectTypeComissionConfigCardProps = {
	scenario: TUser["comissionamento"][number];
	updateComissionConfigItemResult: (info: { resultIndex: number; result: TUser["comissionamento"][number]["resultados"][number] }) => void;
	addComissionConfigItemResult: (item: TUser["comissionamento"][number]["resultados"][number]) => void;
	partners: TPartnerSimplifiedDTO[];
};
function ComissionProjectTypeComissionConfigCard({
	scenario,
	updateComissionConfigItemResult,
	addComissionConfigItemResult,
	partners,
}: ComissionProjectTypeComissionConfigCardProps) {
	const [newResultModalIsOpen, setNewResultModalIsOpen] = useState(false);
	return (
		<div className="flex w-full flex-col gap-3 rounded border border-gray-200 bg-[#fff] p-2 shadow-sm ">
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<p className="text-sm font-bold leading-none tracking-tight">
					COMISSÃO PARA ATUAÇÃO COMO: <span className="font-black">{scenario.papel}</span>
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => setNewResultModalIsOpen(true)}
						className="flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6rem] text-primary hover:bg-green-500 hover:text-white transition-colors"
					>
						<Plus className="w-4 h-4 min-w-4 min-h-4" />
						<p>NOVO RESULTADO</p>
					</button>
					{/* <button
									type="button"
									onClick={() => handleRemove()}
									className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-white hover:bg-red-500 transition-colors"
								>
									<MdDelete width={10} height={10} />
									<p>REMOVER</p>
								</button> */}
				</div>
			</div>

			{scenario.resultados.map((result, index) => (
				<ComissionProjectTypeCardResult
					key={`${scenario.tipoProjeto.id}-${index}`}
					result={result}
					updateResult={(data) => updateComissionConfigItemResult({ resultIndex: index, result: data })}
					partners={partners}
				/>
			))}
			{newResultModalIsOpen ? (
				<ComissionResultModal handleCommitConditionResult={(info) => addComissionConfigItemResult(info)} closeModal={() => setNewResultModalIsOpen(false)} />
			) : null}
		</div>
	);
}

type ComissionProjectTypeCardResultProps = {
	result: TUser["comissionamento"][number]["resultados"][number];
	updateResult: (info: TUser["comissionamento"][number]["resultados"][number]) => void;
	partners: TPartnerSimplifiedDTO[];
};
function ComissionProjectTypeCardResult({ result, updateResult, partners }: ComissionProjectTypeCardResultProps) {
	const [editModalIsOpen, setEditModalIsOpen] = useState(false);
	return (
		<div className="w-full flex flex-col gap-1 rounded border border-primary/10 shadow-xs">
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex flex-wrap items-center gap-2">
					{handleRenderComissionScenarioResultConditionPhrase({
						result: result,
						definitions: SaleDefinitions,
						metadata: { partners: partners.map((p) => ({ id: p._id, label: p.nome, value: p._id })) },
					})}
				</div>
				<button
					type="button"
					onClick={() => setEditModalIsOpen(true)}
					className="flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6rem] text-primary hover:bg-orange-500 hover:text-white transition-colors"
				>
					<MdEdit width={10} height={10} />
					<p>EDITAR</p>
				</button>
			</div>
			<div className="flex w-full flex-wrap items-center justify-center gap-1 rounded-lg bg-primary/10 p-1">
				{result.formulaArr.map((y, index) => (
					<p
						key={`${y}`}
						className={cn("rounded-lg p-1 text-[0.55rem] font-medium", {
							"bg-primary/80 px-2 text-white dark:bg-primary/20": y.includes("[") && y.includes("]"),
						})}
					>
						{formatComissionFormulaIndividualItemLabel({ item: y, definitions: SaleDefinitions })}
					</p>
				))}
			</div>
			{editModalIsOpen ? (
				<ComissionResultModal initialResult={result} handleCommitConditionResult={(info) => updateResult(info)} closeModal={() => setEditModalIsOpen(false)} />
			) : null}
		</div>
	);
}
