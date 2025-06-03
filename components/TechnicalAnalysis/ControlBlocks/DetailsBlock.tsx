import CheckboxInput from "@/components/Inputs/CheckboxInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import React from "react";

type DetailsBlockProps = {
	infoHolder: TTechnicalAnalysisDTO;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
	changes: object;
	setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function DetailsBlock({ infoHolder, setInfoHolder, changes, setChanges }: DetailsBlockProps) {
	return (
		<div className="mt-4 flex w-full flex-col">
			<div className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2">
				<h1 className="font-bold text-white">DETALHES ADICIONAIS</h1>
			</div>
			<div className="mt-2 flex w-full flex-col gap-2">
				<div className="flex w-full flex-col justify-around gap-2 lg:flex-row">
					<div className="w-full lg:w-1/4">
						<TextInput
							label="CONCESSIONÁRIA"
							placeholder="Preencha aqui a concessionária que atende o projeto..."
							value={infoHolder.detalhes.concessionaria}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, detalhes: { ...prev.detalhes, concessionaria: value } }));
								setChanges((prev) => ({ ...prev, "detalhes.concessionaria": value }));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="TOPOLOGIA"
							options={[
								{ id: 1, label: "MICRO-INVERSOR", value: "MICRO-INVERSOR" },
								{ id: 2, label: "INVERSOR", value: "INVERSOR" },
							]}
							value={infoHolder.detalhes.topologia}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, detalhes: { ...prev.detalhes, topologia: value } }));
								setChanges((prev) => ({ ...prev, "detalhes.topologia": value }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, detalhes: { ...prev.detalhes, topologia: null } }));
								setChanges((prev) => ({ ...prev, "detalhes.topologia": null }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
				</div>

				<div className="flex w-full flex-col gap-2 lg:flex-row">
					<div className="flex w-full items-center justify-center lg:w-1/4">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="IMAGENS DE DRONE DISPONÍVEIS"
								labelTrue="IMAGENS DE DRONE DISPONÍVEIS"
								checked={infoHolder.detalhes.imagensDrone}
								justify="justify-center"
								handleChange={(value) => {
									setInfoHolder((prev) => ({ ...prev, detalhes: { ...prev.detalhes, imagensDrone: value } }));
									setChanges((prev) => ({ ...prev, "detalhes.imagensDrone": value }));
								}}
							/>
						</div>
					</div>

					<div className="flex w-full items-center justify-center lg:w-1/4">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="IMAGENS DA FACHADA DISPONÍVEIS"
								labelTrue="IMAGENS DA FACHADA DISPONÍVEIS"
								checked={infoHolder.detalhes.imagensFachada}
								justify="justify-center"
								handleChange={(value) => {
									setInfoHolder((prev) => ({ ...prev, detalhes: { ...prev.detalhes, imagensFachada: value } }));
									setChanges((prev) => ({ ...prev, "detalhes.imagensFachada": value }));
								}}
							/>
						</div>
					</div>

					<div className="flex w-full items-center justify-center lg:w-1/4">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="IMAGENS DE SATÉLITE DISPONÍVEIS"
								labelTrue="IMAGENS DE SATÉLITE DISPONÍVEIS"
								checked={infoHolder.detalhes.imagensSatelite}
								justify="justify-center"
								handleChange={(value) => {
									setInfoHolder((prev) => ({ ...prev, detalhes: { ...prev.detalhes, imagensSatelite: value } }));
									setChanges((prev) => ({ ...prev, "detalhes.imagensSatelite": value }));
								}}
							/>
						</div>
					</div>
					<div className="flex w-full items-center justify-center lg:w-1/4">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="MEDIÇÕES DISPONÍVEIS"
								labelTrue="MEDIÇÕES DISPONÍVEIS"
								checked={infoHolder.detalhes.medicoes}
								justify="justify-center"
								handleChange={(value) => {
									setInfoHolder((prev) => ({ ...prev, detalhes: { ...prev.detalhes, medicoes: value } }));
									setChanges((prev) => ({ ...prev, "detalhes.medicoes": value }));
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DetailsBlock;
