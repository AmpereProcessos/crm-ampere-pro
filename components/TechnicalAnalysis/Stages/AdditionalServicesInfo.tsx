import SelectInput from "@/components/Inputs/SelectInput";
import { TFileHolder } from "@/utils/schemas/file-reference.schema";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import React from "react";
import { toast } from "react-hot-toast";

type AdditionalServicesInfoProps = {
	infoHolder: TTechnicalAnalysis;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
	files: TFileHolder;
	setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
};
function AdditionalServicesInfo({ infoHolder, setInfoHolder, files, setFiles, goToNextStage, goToPreviousStage }: AdditionalServicesInfoProps) {
	function validateFields() {
		if (!infoHolder.servicosAdicionais.casaDeMaquinas) {
			toast.error("Preencha sobre a necessidade de construção de uma casa de máquinas.");
			return false;
		}
		if (!infoHolder.servicosAdicionais.alambrado) {
			toast.error("Preencha sobre a necessidade de construção de um alambrado.");
			return false;
		}
		if (!infoHolder.servicosAdicionais.britagem) {
			toast.error("Preencha sobre a necessidade de uma operação de britagem.");
			return false;
		}
		if (!infoHolder.servicosAdicionais.barracao) {
			toast.error("Preencha sobre a necessidade de construção de um barracão.");
			return false;
		}
		if (!infoHolder.servicosAdicionais.roteador) {
			toast.error("Preencha sobre a necessidade de instalação de roteador");
			return false;
		}
		if (!infoHolder.servicosAdicionais.redeReligacao) {
			toast.error("Preencha sobre a necessidade de execução da rede de religação da fazenda.");
			return false;
		}
		if (!infoHolder.servicosAdicionais.limpezaLocal) {
			toast.error("Preencha sobre a necessidade de execução de limpeza do local da usina de solo.");
			return false;
		}
		if (!infoHolder.servicosAdicionais.terraplanagem) {
			toast.error("Preencha sobre a necessidade de execução de terraplanagem do local da usina de solo.");
			return false;
		}
		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-background px-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">SERIVÇOS ADICIONAIS</span>
			<div className="flex w-full grow flex-col gap-2">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"CASA DE MÁQUINAS"}
							editable={true}
							value={infoHolder.servicosAdicionais.casaDeMaquinas}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, casaDeMaquinas: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, casaDeMaquinas: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"ALAMBRADO"}
							editable={true}
							value={infoHolder.servicosAdicionais.alambrado}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, alambrado: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, alambrado: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"BRITAGEM"}
							editable={true}
							value={infoHolder.servicosAdicionais.britagem}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, britagem: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, britagem: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"CONSTRUÇÃO DE BARRACÃO"}
							editable={true}
							value={infoHolder.servicosAdicionais.barracao}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, barracao: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, barracao: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"INSTALAÇÃO DE ROTEADOR"}
							editable={true}
							value={infoHolder.servicosAdicionais.roteador}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, roteador: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, roteador: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"REDE DE RELIGAÇÃO DA FAZENDA"}
							editable={true}
							value={infoHolder.servicosAdicionais.redeReligacao}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, redeReligacao: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, redeReligacao: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"LIMPEZA DO LOCAL DA USINA DE SOLO"}
							editable={true}
							value={infoHolder.servicosAdicionais.limpezaLocal}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, limpezaLocal: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, limpezaLocal: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"TERRAPLANAGEM PARA USINA DE SOLO"}
							editable={true}
							value={infoHolder.servicosAdicionais.terraplanagem}
							options={[
								{
									id: 1,
									label: "SIM - RESPONSABILIDADE DA EMPRESA",
									value: "SIM - RESPONSABILIDADE DA EMPRESA",
								},
								{
									id: 2,
									label: "SIM - RESPONSABILIDADE DO CLIENTE",
									value: "SIM - RESPONSABILIDADE DO CLIENTE",
								},
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, terraplanagem: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, terraplanagem: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
				</div>
			</div>

			<div className="mt-2 flex w-full justify-between">
				<button onClick={() => goToPreviousStage()} className="rounded p-2 font-bold text-primary/70 duration-300 ease-in-out hover:scale-105">
					Voltar
				</button>
				<button
					onClick={() => {
						if (validateFields()) {
							goToNextStage();
						}
					}}
					className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default AdditionalServicesInfo;
