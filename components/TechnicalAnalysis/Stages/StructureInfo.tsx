import DocumentFileInput from "@/components/Inputs/DocumentFileInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { TFileHolder } from "@/utils/schemas/file-reference.schema";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { StructureTypes } from "@/utils/select-options";
import Image from "next/image";
import React from "react";
import { toast } from "react-hot-toast";
import RoofTiles from "../../../utils/images/roofTiles.png";
type StructureInfoProps = {
	infoHolder: TTechnicalAnalysis;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
	files: TFileHolder;
	setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
};
function StructureInfo({ infoHolder, setInfoHolder, files, setFiles, goToNextStage, goToPreviousStage }: StructureInfoProps) {
	function validateAndProceed() {
		if (!infoHolder.detalhes?.tipoEstrutura) return toast.error("Preencha a estrutura de montagem.");

		if (!infoHolder.detalhes?.materialEstrutura) return toast.error("Preencha o tipo de estrutura.");

		if (infoHolder.detalhes.tipoEstrutura == "TELHADO") {
			if (!infoHolder.detalhes?.tipoTelha) return toast.error("Preencha o tipo de telha do cliente.");

			if (!infoHolder.detalhes?.telhasReservas) return toast.error("Preencha sobre a existência de telhas reservas.");
		}

		// if (!infoHolder.arquivosAuxiliares) return toast.error('Preencha o link para a pasta na nuvem de arquivos auxiliares.')

		if (!infoHolder.detalhes?.orientacao) return toast.error("Preencha a orientação da estrutura.");

		// FILES
		if (!files["FOTO DO LOCAL DE INSTALAÇÃO"]) return toast.error("Anexe uma foto do local para instalação.");
		if (!files["FOTO DA ESTRUTURA DE MONTAGEM"]) return toast.error("Anexe uma foto da estrutura de montagem (laje, solo, etc.).");
		if (!files["FOTO DA ESTRUTURA DE MONTAGEM"]) return toast.error("Anexe uma foto do local para instalação.");

		return goToNextStage();
	}
	return (
		<div className="flex w-full grow flex-col bg-background px-2">
			<h1 className="w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-primary-foreground">INFORMAÇÕES DA ESTRUTURA DE MONTAGEM</h1>
			<div className="flex w-full grow flex-col gap-2">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="TIPO DA ESTRUTURA DE MONTAGEM"
							width="100%"
							value={infoHolder.detalhes?.tipoEstrutura}
							options={StructureTypes}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										tipoEstrutura: value,
									},
								}))
							}
							onReset={() =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										tipoEstrutura: null,
									},
								}))
							}
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="TIPO DA ESTRUTURA"
							width="100%"
							value={infoHolder.detalhes?.materialEstrutura}
							options={[
								{ id: 1, label: "MADEIRA", value: "MADEIRA" },
								{ id: 2, label: "FERRO", value: "FERRO" },
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										materialEstrutura: value,
									},
								}))
							}
							onReset={() =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										materialEstrutura: null,
									},
								}))
							}
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="TIPO DA TELHA"
							width="100%"
							value={infoHolder.detalhes?.tipoTelha}
							options={[
								{ id: 1, label: "PORTUGUESA", value: "PORTUGUESA" },
								{ id: 2, label: "FRANCESA", value: "FRANCESA" },
								{ id: 3, label: "ROMANA", value: "ROMANA" },
								{ id: 4, label: "CIMENTO", value: "CIMENTO" },
								{ id: 5, label: "ETHERNIT", value: "ETHERNIT" },
								{ id: 6, label: "SANDUÍCHE", value: "SANDUÍCHE" },
								{ id: 7, label: "AMERICANA", value: "AMERICANA" },
								{ id: 8, label: "ZINCO", value: "ZINCO" },
								{ id: 9, label: "CAPE E BICA", value: "CAPE E BICA" },
								{ id: 10, label: "ESTRUTURA DE SOLO", value: "ESTRUTURA DE SOLO" },
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										tipoTelha: value,
									},
								}))
							}
							onReset={() =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										tipoTelha: null,
									},
								}))
							}
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="CLIENTE POSSUIU TELHAS RESERVAS ?"
							width="100%"
							value={infoHolder.detalhes?.telhasReservas}
							options={[
								{ id: 1, label: "SIM", value: "SIM" },
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										telhasReservas: value,
									},
								}))
							}
							onReset={() =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										telhasReservas: null,
									},
								}))
							}
						/>
					</div>
				</div>
				<div className="my-3 flex h-[165px] w-[300px] flex-col items-center justify-center self-center border border-primary/30 p-1 py-2 lg:h-[250px] lg:w-[450px]">
					<h1 className="text-sm font-bold text-[#fead41]">TIPOS DE TELHAS</h1>
					<Image src={RoofTiles} alt="Tipos de Telhas" />
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="LINK DE ARQUIVOS AUXILIARES (EX: PASTA FOTOS DE DRONE)"
							width="100%"
							value={infoHolder.arquivosAuxiliares || ""}
							placeholder="Preencha aqui o link para uma pasta na nuvem dos arquivos auxiliares."
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									arquivosAuxiliares: value,
								}))
							}
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="ORIENTAÇÃO DOS MÓDULOS"
							width="100%"
							value={infoHolder.detalhes?.orientacao ? infoHolder.detalhes?.orientacao : ""}
							placeholder="Preencha aqui a orientação dos módulos. (EX: 10° NORTE)"
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										orientacao: value,
									},
								}))
							}
						/>
					</div>
				</div>
				<h1 className="mt-2 w-full text-start font-sans  font-bold text-cyan-500">ARQUIVOS</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<DocumentFileInput
							label="FOTO DO LOCAL DE INSTALAÇÃO"
							value={files["FOTO DO LOCAL DE INSTALAÇÃO"]}
							handleChange={(value) => setFiles((prev) => ({ ...prev, ["FOTO DO LOCAL DE INSTALAÇÃO"]: value }))}
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<DocumentFileInput
							label="FOTO DA ESTRUTURA DE MONTAGEM"
							value={files["FOTO DA ESTRUTURA DE MONTAGEM"]}
							handleChange={(value) => setFiles((prev) => ({ ...prev, ["FOTO DA ESTRUTURA DE MONTAGEM"]: value }))}
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<DocumentFileInput
							label="ESTUDO DE CASO (SE HOUVER)"
							value={files["ESTUDO DE CASO (SE HOUVER)"]}
							handleChange={(value) => setFiles((prev) => ({ ...prev, ["ESTUDO DE CASO (SE HOUVER)"]: value }))}
						/>
					</div>
				</div>
			</div>

			<div className="mt-2 flex w-full items-end justify-between bg-background">
				<button onClick={() => goToPreviousStage()} className="rounded p-2 font-bold text-primary/70 duration-300 ease-in-out hover:scale-105">
					Voltar
				</button>
				<button
					onClick={() => {
						if (validateAndProceed()) {
							goToNextStage();
						}
					}}
					className=" rounded-sm p-2 font-bold hover:bg-black hover:text-primary-foreground"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default StructureInfo;
