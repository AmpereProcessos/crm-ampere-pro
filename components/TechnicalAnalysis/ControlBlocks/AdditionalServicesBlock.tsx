import CheckboxInput from "@/components/Inputs/CheckboxInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import { AdditionalServicesResponsibilityOptions } from "@/utils/select-options";
import React from "react";

type AdditionalServicesBlockProps = {
	infoHolder: TTechnicalAnalysisDTO;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
	changes: object;
	setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function AdditionalServicesBlock({ infoHolder, setInfoHolder, changes, setChanges }: AdditionalServicesBlockProps) {
	return (
		<div className="mt-4 flex w-full flex-col">
			<div className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2">
				<h1 className="font-bold text-white">SERVIÇOS ADICIONAIS</h1>
			</div>
			<div className="mt-2 flex w-full flex-col gap-2">
				<div className="flex w-full flex-col gap-2 lg:flex-row">
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="ALAMBRADO"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.alambrado}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, alambrado: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.alambrado": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, alambrado: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.alambrado": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="BRITAGEM"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.britagem}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, britagem: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.britagem": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, britagem: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.britagem": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="CASA DE MÁQUINAS"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.casaDeMaquinas}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, casaDeMaquinas: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.casaDeMaquinas": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, casaDeMaquinas: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.casaDeMaquinas": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="CONSTRUÇÃO DE BARRACÃO"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.barracao}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, barracao: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.barracao": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, barracao: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.barracao": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col gap-2 lg:flex-row">
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="INSTALAÇÃO DE ROTEADOR"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.roteador}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, roteador: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.roteador": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, roteador: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.roteador": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="LIMPEZA DO LOCAL"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.limpezaLocal}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, limpezaLocal: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.limpezaLocal": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, limpezaLocal: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.limpezaLocal": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="REDE DE RELIGAÇÃO"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.redeReligacao}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, redeReligacao: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.redeReligacao": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, redeReligacao: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.redeReligacao": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="TERRAPLANAGEM"
							options={AdditionalServicesResponsibilityOptions}
							value={infoHolder.servicosAdicionais.terraplanagem}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, terraplanagem: value } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.terraplanagem": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, terraplanagem: null } }));
								setChanges((prev) => ({ ...prev, "servicosAdicionais.terraplanagem": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full items-center justify-center">
					<CheckboxInput
						labelFalse="REALIMENTAR"
						labelTrue="REALIMENTAR"
						checked={infoHolder.servicosAdicionais.realimentar}
						justify="justify-center"
						handleChange={(value) => {
							setInfoHolder((prev) => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, realimentar: value } }));
							setChanges((prev) => ({ ...prev, "servicosAdicionais.realimentar": value }));
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default AdditionalServicesBlock;
