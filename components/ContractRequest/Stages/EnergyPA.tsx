import CheckboxInput from "@/components/Inputs/CheckboxInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { TProject } from "@/utils/schemas/project.schema";
import { AmperageOptions, EnergyPAConnectionTypes, EnergyPATypes, PhaseTypes } from "@/utils/select-options";
import React from "react";

type EnergyPAProps = {
	requestInfo: TProject;
	setRequestInfo: React.Dispatch<React.SetStateAction<TProject>>;
	goToNextState: () => void;
};
function EnergyPA({ requestInfo, setRequestInfo, goToNextState }: EnergyPAProps) {
	function validateAndProceed() {}
	return (
		<div className="flex w-full grow flex-col gap-2">
			<div className="flex w-full grow flex-col gap-2">
				<h1 className="w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-white">PADRÃO DE ENERGIA</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="TIPO DO PADRÃO"
							value={requestInfo.padraoEnergia.tipo}
							resetOptionLabel="NÃO DEFINIDO"
							options={EnergyPATypes}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, tipo: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, tipo: "CONTRA À REDE" } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="TIPO DE ENTRADA"
							value={requestInfo.padraoEnergia.tipoEntrada}
							resetOptionLabel="NÃO DEFINIDO"
							options={EnergyPAConnectionTypes}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, tipoEntrada: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, tipoEntrada: "AÉREO" } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="TIPO DE SAÍDA"
							value={requestInfo.padraoEnergia.tipoSaida}
							resetOptionLabel="NÃO DEFINIDO"
							options={EnergyPAConnectionTypes}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, tipoSaida: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, tipoSaida: "AÉREO" } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="LIGAÇÃO"
							value={requestInfo.padraoEnergia.ligacao}
							resetOptionLabel="NÃO DEFINIDO"
							options={PhaseTypes}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, ligacao: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, ligacao: "BIFÁSICO" } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="AMPERAGEM"
							value={requestInfo.padraoEnergia.amperagem}
							resetOptionLabel="NÃO DEFINIDO"
							options={AmperageOptions}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, amperagem: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, amperagem: "" } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full items-center justify-center">
					<CheckboxInput
						labelFalse="NECESSÁRIO ADEQUAÇÕES"
						labelTrue="NECESSÁRIO ADEQUAÇÕES"
						checked={requestInfo.padraoEnergia.alteracao}
						handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, alteracao: value } }))}
						justify="justify-center"
					/>
				</div>
				{requestInfo.padraoEnergia.alteracao ? (
					<>
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-1/2">
								<SelectInput
									label="NOVA LIGAÇÃO"
									value={requestInfo.padraoEnergia.novaLigacao}
									resetOptionLabel="NÃO DEFINIDO"
									options={PhaseTypes}
									handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, novaLigacao: value } }))}
									onReset={() => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, novaLigacao: null } }))}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/2">
								<SelectInput
									label="NOVA AMPERAGEM"
									value={requestInfo.padraoEnergia.novaAmperagem}
									resetOptionLabel="NÃO DEFINIDO"
									options={AmperageOptions}
									handleChange={(value) => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, novaAmperagem: value } }))}
									onReset={() => setRequestInfo((prev) => ({ ...prev, padraoEnergia: { ...prev.padraoEnergia, novaAmperagem: null } }))}
									width="100%"
								/>
							</div>
						</div>
						<div className="flex w-full flex-col">
							<h1 className="w-full rounded-tl-sm rounded-tr-sm bg-gray-500 p-1 text-center font-bold text-white">OBSERVAÇÕES</h1>
							<textarea
								placeholder="SEM OBSERVAÇÕES PREENCHIDAS..."
								value={requestInfo.padraoEnergia.observacoes || ""}
								onChange={(e) => {
									setRequestInfo((prev) => ({
										...prev,
										padraoEnergia: { ...prev.padraoEnergia, observacoes: e.target.value },
									}));
								}}
								className="min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-gray-100 p-3 text-center text-xs font-medium text-gray-600 outline-none"
							/>
						</div>
					</>
				) : null}
			</div>
			<div className="flex w-full items-center justify-end">
				<button onClick={() => validateAndProceed()} className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700">
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default EnergyPA;
