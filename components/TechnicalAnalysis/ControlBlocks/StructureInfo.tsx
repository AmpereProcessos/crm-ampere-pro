import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatLongString } from "@/utils/methods";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { StructureTypes } from "@/utils/select-options";
import Image from "next/image";
import React from "react";
import { toast } from "react-hot-toast";
import { BsCheckCircleFill } from "react-icons/bs";
import RoofTiles from "../../../utils/images/roofTiles.png";
type StructureInfoProps = {
	requestInfo: TTechnicalAnalysis;
	setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	requireFiles?: boolean;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
	files:
		| {
				[key: string]: {
					title: string;
					file: File | null | string;
				};
		  }
		| undefined;
	setFiles: React.Dispatch<
		React.SetStateAction<
			| {
					[key: string]: {
						title: string;
						file: File | null | string;
					};
			  }
			| undefined
		>
	>;
};
function StructureInfo({ requestInfo, setRequestInfo, requireFiles = true, files, setFiles, goToNextStage, goToPreviousStage }: StructureInfoProps) {
	function validateFields() {
		if (!requestInfo.detalhes?.tipoEstrutura) {
			toast.error("Preencha a estrutura de montagem.");
			return false;
		}
		if (!requestInfo.detalhes?.materialEstrutura) {
			toast.error("Preencha o tipo de estrutura.");
			return false;
		}
		if (requestInfo.detalhes.tipoEstrutura == "TELHADO") {
			if (!requestInfo.detalhes?.tipoTelha) {
				toast.error("Preencha o tipo de telha do cliente.");
				return false;
			}
			if (!requestInfo.detalhes?.telhasReservas) {
				toast.error("Preencha sobre a existência de telhas reservas.");
				return false;
			}
		}

		if (!requestInfo.arquivosAuxiliares) {
			toast.error("Preencha o link para a pasta na nuvem de arquivos auxiliares.");
			return false;
		}
		if (!requestInfo.detalhes?.orientacao) {
			toast.error("Preencha a orientação da estrutura.");
			return false;
		}
		if (requireFiles) {
			if (requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - URBANA") {
				if (!files?.fotoEstrutura) {
					toast.error("Anexe uma foto da estrutura do telhado.");
					return false;
				}
				if (!files?.fotoTelhas) {
					toast.error("Anexe uma foto das telhas.");
					return false;
				}
			}
			if (requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - RURAL") {
				if (!files?.fotoLocalMontagemModulos) {
					toast.error("Anexe uma foto do local para instalação dos módulos.");
					return false;
				}

				if (!files?.estudoDeCaso) {
					toast.error("Anexe o arquivo do estudo de caso.");
					return false;
				}
			}
		}

		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-background px-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DA ESTRUTURA</span>

			<div className="flex w-full grow flex-col gap-2">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="ESTRUTURA DE MONTAGEM"
							width="100%"
							value={requestInfo.detalhes?.tipoEstrutura}
							options={StructureTypes}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) =>
								setRequestInfo((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										tipoEstrutura: value,
									},
								}))
							}
							onReset={() =>
								setRequestInfo((prev) => ({
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
							value={requestInfo.detalhes?.materialEstrutura}
							options={[
								{ id: 1, label: "MADEIRA", value: "MADEIRA" },
								{ id: 2, label: "FERRO", value: "FERRO" },
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) =>
								setRequestInfo((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										materialEstrutura: value,
									},
								}))
							}
							onReset={() =>
								setRequestInfo((prev) => ({
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
							value={requestInfo.detalhes?.tipoTelha}
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
								setRequestInfo((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										tipoTelha: value,
									},
								}))
							}
							onReset={() =>
								setRequestInfo((prev) => ({
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
							value={requestInfo.detalhes?.telhasReservas}
							options={[
								{ id: 1, label: "SIM", value: "SIM" },
								{ id: 3, label: "NÃO", value: "NÃO" },
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) =>
								setRequestInfo((prev) => ({
									...prev,
									detalhes: {
										...prev.detalhes,
										telhasReservas: value,
									},
								}))
							}
							onReset={() =>
								setRequestInfo((prev) => ({
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
							value={requestInfo.arquivosAuxiliares || ""}
							placeholder="Preencha aqui o link para uma pasta na nuvem dos arquivos auxiliares."
							handleChange={(value) =>
								setRequestInfo((prev) => ({
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
							value={requestInfo.detalhes?.orientacao ? requestInfo.detalhes?.orientacao : ""}
							placeholder="Preencha aqui a orientação dos módulos. (EX: 10° NORTE)"
							handleChange={(value) =>
								setRequestInfo((prev) => ({
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
				{requireFiles ? (
					<>
						{/**FILES TO REMOTE RURAL */}
						{requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - RURAL" ? (
							<div className="grid w-full grid-cols-1 grid-rows-3 gap-2 lg:grid-cols-3 lg:grid-rows-1">
								<div className="flex w-full flex-col items-center justify-center self-center">
									<div className="flex items-center gap-2">
										<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
											FOTO DA LOCALIZAÇÃO DA MONTAGEM DOS MÓDULOS
										</label>
										{files?.fotoLocalMontagemModulos ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
									</div>
									<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2">
										<div className="absolute">
											{files?.fotoLocalMontagemModulos ? (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block text-center font-normal text-primary/40">
														{typeof files.fotoLocalMontagemModulos.file != "string"
															? files.fotoLocalMontagemModulos.file?.name
															: formatLongString(files.fotoLocalMontagemModulos.file, 35)}
													</span>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block font-normal text-primary/40">Adicione o arquivo aqui...</span>
												</div>
											)}
										</div>
										<input
											onChange={(e) =>
												setFiles({
													...files,
													fotoLocalMontagemModulos: {
														title: "FOTO DA LOCALIZAÇÃO DA MONTAGEM DOS MÓDULOS",
														file: e.target.files ? e.target.files[0] : null,
													},
												})
											}
											className="h-full w-full opacity-0"
											type="file"
											accept=".png, .jpeg, .pdf"
										/>
									</div>
								</div>
								<div className="flex w-full flex-col items-center justify-center self-center">
									<div className="flex items-center gap-2">
										<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
											ARQUIVO DO ESTUDO DE CASO
										</label>
										{files?.estudoDeCaso ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
									</div>
									<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2">
										<div className="absolute">
											{files?.estudoDeCaso ? (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block text-center font-normal text-primary/40">
														{typeof files.estudoDeCaso.file != "string" ? files.estudoDeCaso.file?.name : formatLongString(files.estudoDeCaso.file, 35)}
													</span>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block font-normal text-primary/40">Adicione o arquivo aqui...</span>
												</div>
											)}
										</div>
										<input
											onChange={(e) =>
												setFiles({
													...files,
													estudoDeCaso: {
														title: "ARQUIVO DO ESTUDO DE CASO",
														file: e.target.files ? e.target.files[0] : null,
													},
												})
											}
											className="h-full w-full opacity-0"
											type="file"
											accept=".png, .jpeg, .pdf"
										/>
									</div>
								</div>
							</div>
						) : null}
						{/**FILES TO REMOTE URBAN */}
						{requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - URBANA" ? (
							<div className="grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
								<div className="flex w-full flex-col items-center justify-center self-center">
									<div className="flex items-center gap-2">
										<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
											FOTO DA ESTRUTURA DO TELHADO
										</label>
										{files?.fotoEstrutura ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
									</div>
									<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2">
										<div className="absolute">
											{files?.fotoEstrutura ? (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block text-center font-normal text-primary/40">
														{typeof files.fotoEstrutura.file != "string" ? files.fotoEstrutura.file?.name : formatLongString(files.fotoEstrutura.file, 35)}
													</span>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block font-normal text-primary/40">Adicione o arquivo aqui...</span>
												</div>
											)}
										</div>
										<input
											onChange={(e) =>
												setFiles({
													...files,
													fotoEstrutura: {
														title: "FOTO DA ESTRUTURA DO TELHADO",
														file: e.target.files ? e.target.files[0] : null,
													},
												})
											}
											className="h-full w-full opacity-0"
											type="file"
											accept=".png, .jpeg, .pdf"
										/>
									</div>
								</div>
								<div className="flex w-full flex-col items-center justify-center self-center">
									<div className="flex items-center gap-2">
										<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
											FOTO DAS TELHAS
										</label>
										{files?.fotoTelhas ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
									</div>
									<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2">
										<div className="absolute">
											{files?.fotoTelhas ? (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block text-center font-normal text-primary/40">
														{typeof files.fotoTelhas.file != "string" ? files.fotoTelhas.file?.name : formatLongString(files.fotoTelhas.file, 35)}
													</span>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block font-normal text-primary/40">Adicione o arquivo aqui...</span>
												</div>
											)}
										</div>
										<input
											onChange={(e) =>
												setFiles({
													...files,
													fotoTelhas: {
														title: "FOTO DAS TELHAS",
														file: e.target.files ? e.target.files[0] : null,
													},
												})
											}
											className="h-full w-full opacity-0"
											type="file"
											accept=".png, .jpeg, .pdf"
										/>
									</div>
								</div>
							</div>
						) : null}
					</>
				) : null}
			</div>

			<div className="mt-2 flex w-full items-end justify-between bg-background">
				<button onClick={() => goToPreviousStage()} className="rounded p-2 font-bold text-primary/70 duration-300 ease-in-out hover:scale-105">
					Voltar
				</button>
				<button
					onClick={() => {
						if (validateFields()) {
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
