import {
	ProcessAutomationConditionTypesOptions,
	ProcessAutomationEntitiesSpecs,
	TProcessAutomationEntities,
	TProcessAutomationEntitySpec,
} from "@/utils/process-settings";
import { getProcessAutomationConditionOptions, TProcessAutomationConditionData } from "@/utils/process-settings/helpers";
import { TProjectTypeProcessSetting } from "@/utils/schemas/project-type-process-settings";
import { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import NumberInput from "../Inputs/NumberInput";
import SelectInput from "../Inputs/SelectInput";

type NewProcessSettingMenuProps = {
	projectTypeId: string;
	dependencySettingId: string | null;
	dependencySettingEntity: TProcessAutomationEntities | null;
	closeMenu: () => void;
};
function NewProcessSettingMenu({ projectTypeId, dependencySettingId, dependencySettingEntity, closeMenu }: NewProcessSettingMenuProps) {
	const [infoHolder, setInfoHolder] = useState<TProjectTypeProcessSetting>({
		idTipoProjeto: projectTypeId,
		idConfiguracaoDependencia: dependencySettingId,
		referencia: {
			entidade: dependencySettingEntity || "Project",
		},
		gatilho: {
			tipo: "IGUAL_TEXTO",
			variavel: getActiveAutomationReference("Project").triggerConditions[0].value,
		},
		retorno: {
			entidade: "Revenue",
		},
	});
	function getActiveAutomationReference(referenceEntity: TProcessAutomationEntities) {
		const entitySpecs = ProcessAutomationEntitiesSpecs.find((p) => p.entity == referenceEntity);
		if (!entitySpecs) return ProcessAutomationEntitiesSpecs[0];
		return entitySpecs;
	}
	function getComparationMethods({ entity, variable }: { entity: TProcessAutomationEntitySpec; variable: string }) {
		const types = entity.triggerConditions.find((c) => c.value == variable);
		if (!types) return [];
		return types.types.map((t, index) => {
			const typeLabel = ProcessAutomationConditionTypesOptions.find((o) => o.value == t)?.label;
			return { id: index + 1, label: typeLabel || "NÃO DEFINIDO", value: t };
		});
	}

	const activeAutomationReference = getActiveAutomationReference(infoHolder.referencia.entidade);
	return (
		<div className="flex w-[80%] flex-col gap-2 self-center rounded-md border border-primary/50 p-2 font-Inter">
			<div className="mb-4 flex w-full items-center justify-between">
				<h1 className="font-Inter font-black">NOVA CONFIGURAÇÃO</h1>
				<button
					onClick={() => closeMenu()}
					type="button"
					className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
				>
					<VscChromeClose style={{ color: "red" }} />
				</button>
			</div>
			<div className="flex w-full flex-col items-center justify-center">
				<h1 className="w-full text-start text-xs font-black text-blue-500">ENTIDADE DE REFERÊNCIA</h1>
				<h1 className="w-fit rounded-sm border border-cyan-500 p-2 text-center text-xs font-bold text-cyan-500">{activeAutomationReference.entityLabel}</h1>
			</div>
			<h1 className="w-full text-start text-xs font-black text-blue-500">VARIÁVEL</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{activeAutomationReference.triggerConditions.map((c, index) => (
					<button
						key={index}
						onClick={() => {
							setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, variavel: c.value } }));
						}}
						className={`grow ${
							c.value == infoHolder.gatilho.variavel ? "bg-blue-700  text-primary-foreground" : "text-blue-700 "
						} rounded border border-blue-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-blue-700  hover:text-primary-foreground`}
					>
						{c.label}
					</button>
				))}
			</div>
			<h1 className="w-full text-start text-xs font-black text-blue-500">MÉTODO DE COMPARAÇÃO</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{getComparationMethods({ entity: activeAutomationReference, variable: infoHolder.gatilho.variavel }).map((method) => (
					<button
						key={method.id}
						onClick={() =>
							setInfoHolder((prev) => ({
								...prev,
								gatilho: {
									...prev.gatilho,
									tipo: method.value,
									igual: undefined,
									maiorQue: undefined,
									menorQue: undefined,
									entre: undefined,
									inclui: undefined,
								},
							}))
						}
						className={`grow ${
							method.value == infoHolder.gatilho.tipo ? "bg-blue-700  text-primary-foreground" : "text-blue-700 "
						} rounded border border-blue-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-blue-700  hover:text-primary-foreground`}
					>
						{method.label}
					</button>
				))}
			</div>
			{infoHolder.gatilho.tipo == "IGUAL_TEXTO" ? (
				<SelectInput
					label="IGUAL A:"
					value={infoHolder.gatilho.igual}
					// options={options[infoHolder.gatilho.variavel as keyof typeof options]?.map((op, index) => ({ id: index + 1, label: op, value: op })) || []}
					options={getProcessAutomationConditionOptions({
						variable: infoHolder.gatilho.variavel as keyof TProcessAutomationConditionData,
					})}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, igual: value } }))}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() => setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, igual: null } }))}
					width="100%"
				/>
			) : null}
			{infoHolder.gatilho.tipo == "IGUAL_NÚMERICO" ? (
				<NumberInput
					label="IGUAL A:"
					placeholder="Preencha o valor para comparação."
					value={infoHolder.gatilho.igual != null && infoHolder.gatilho.igual != undefined ? Number(infoHolder.gatilho.igual) : null}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, igual: value.toString() } }))}
					width="100%"
				/>
			) : null}
			{infoHolder.gatilho.tipo == "MAIOR_QUE_NÚMERICO" ? (
				<NumberInput
					label="MAIOR QUE:"
					placeholder="Preencha o valor para comparação."
					value={infoHolder.gatilho.maiorQue != null && infoHolder.gatilho.maiorQue != undefined ? Number(infoHolder.gatilho.maiorQue) : null}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, maiorQue: value } }))}
					width="100%"
				/>
			) : null}
			{infoHolder.gatilho.tipo == "MENOR_QUE_NÚMERICO" ? (
				<NumberInput
					label="MENOR QUE:"
					placeholder="Preencha o valor para comparação."
					value={infoHolder.gatilho.menorQue != null && infoHolder.gatilho.menorQue != undefined ? Number(infoHolder.gatilho.menorQue) : null}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, menorQue: value } }))}
					width="100%"
				/>
			) : null}
			{infoHolder.gatilho.tipo == "INTERVALO_NÚMERICO" ? (
				<div className="flex w-full flex-col gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="MAIOR QUE:"
							placeholder="Preencha o valor mínimo do intervalo."
							value={
								infoHolder.gatilho.entre?.minimo != null && infoHolder.gatilho.entre?.minimo != undefined ? Number(infoHolder.gatilho.entre?.minimo) : null
							}
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									gatilho: { ...prev.gatilho, entre: prev.gatilho.entre ? { ...prev.gatilho.entre, minimo: value } : { minimo: value, maximo: 0 } },
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="MENOR QUE:"
							placeholder="Preencha o valor máximo do intervalo."
							value={
								infoHolder.gatilho.entre?.maximo != null && infoHolder.gatilho.entre?.maximo != undefined ? Number(infoHolder.gatilho.entre?.maximo) : null
							}
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									gatilho: { ...prev.gatilho, entre: prev.gatilho.entre ? { ...prev.gatilho.entre, maximo: value } : { minimo: 0, maximo: value } },
								}))
							}
							width="100%"
						/>
					</div>
				</div>
			) : null}
			{infoHolder.gatilho.tipo == "INCLUI_LISTA" ? (
				<MultipleSelectInput
					label="INCLUSO EM:"
					selected={infoHolder.gatilho.inclui || null}
					options={getProcessAutomationConditionOptions({
						variable: infoHolder.gatilho.variavel as keyof TProcessAutomationConditionData,
					})}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, inclui: value as string[] } }))}
					onReset={() => setInfoHolder((prev) => ({ ...prev, gatilho: { ...prev.gatilho, inclui: [] } }))}
					resetOptionLabel="NÃO DEFINIDO"
					width="100%"
				/>
			) : null}
			<h1 className="w-full text-start text-xs font-black text-blue-500">ENTIDADE DE RETORNO</h1>
			<div className="my-2 flex flex-wrap items-center gap-2">
				{ProcessAutomationEntitiesSpecs.filter((p) => !!p.returnable).map((p, index) => (
					<button
						key={index}
						onClick={() => {
							setInfoHolder((prev) => ({ ...prev, retorno: { entidade: p.entity } }));
						}}
						className={`grow ${
							p.entity == infoHolder.retorno.entidade ? "bg-green-700  text-primary-foreground" : "text-green-700 "
						} rounded border border-green-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-green-700  hover:text-primary-foreground`}
					>
						{p.entityLabel}
					</button>
				))}
			</div>
			<h1 className="w-full text-start text-xs font-black text-blue-500">DADOS PARA DE ENTIDADE RETORNO</h1>
			{infoHolder.retorno.entidade == "Revenue" ? (
				<h1 className="w-full rounded-sm border border-orange-500 bg-orange-50 p-1 text-center text-xs tracking-tight text-orange-500 ">
					POR PADRÃO, OS DADOS A SEREM UTILIZADOS NA RECEITA TERÃO COMO BASE O VALOR DE VENDA DO PROJETO E O FRACIONAMENTO DE RECEBIMENTOS DO MÉTODO DE
					PAGAMENTO.
				</h1>
			) : null}
		</div>
	);
}

export default NewProcessSettingMenu;
