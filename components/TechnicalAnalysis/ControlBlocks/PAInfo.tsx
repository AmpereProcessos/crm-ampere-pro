import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatLongString } from "@/utils/methods";
import { ITechnicalAnalysis } from "@/utils/models";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { AmperageOptions, EnergyMeterBoxModels, EnergyPAConnectionTypes, EnergyPATypes } from "@/utils/select-options";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillDelete, AiOutlineArrowDown, AiOutlineArrowUp, AiOutlinePlus } from "react-icons/ai";
import { BsCheckCircleFill } from "react-icons/bs";
import { IoMdBarcode } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { TbBoxModel2, TbCategory2 } from "react-icons/tb";
type PAInfoProps = {
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
function PAInfo({ requestInfo, setRequestInfo, requireFiles = true, files, setFiles, goToNextStage, goToPreviousStage }: PAInfoProps) {
	const [paInfoHolder, setPaInfoHolder] = useState<TTechnicalAnalysis["padrao"][number]>({
		alteracao: false,
		tipo: "CONTRA À REDE",
		tipoEntrada: "AÉREO",
		tipoSaida: "AÉREO",
		amperagem: "",
		ligacao: "",
		novaAmperagem: null,
		novaLigacao: null,
		codigoMedidor: "",
		modeloCaixaMedidor: null,
		codigoPosteDerivacao: null,
	});
	function addEnergyPA() {
		if (!paInfoHolder.ligacao) return toast.error("Por favor, preencha o tipo de ligação do padrão.");
		if (!paInfoHolder.amperagem) return toast.error("Por favor, preencha a amperagem do padrão.");
		if (paInfoHolder.codigoMedidor.trim().length < 5) return toast.error("Por favor, preencha um código de medidor válido.");
		const energyPAList = requestInfo.padrao ? [...requestInfo.padrao] : [];
		energyPAList.push(paInfoHolder);
		setRequestInfo((prev) => ({ ...prev, padrao: energyPAList }));
		setPaInfoHolder({
			alteracao: false,
			tipo: "CONTRA À REDE",
			tipoEntrada: "AÉREO",
			tipoSaida: "AÉREO",
			amperagem: "",
			ligacao: "",
			novaAmperagem: null,
			novaLigacao: null,
			codigoMedidor: "",
			modeloCaixaMedidor: null,
			codigoPosteDerivacao: null,
		});
		return toast.success("Padrão adicionado com sucesso.");
	}
	function removeEnergyPA(index: number) {
		const energyPAList = requestInfo.padrao ? [...requestInfo.padrao] : [];
		energyPAList.splice(index, 1);
		setRequestInfo((prev) => ({ ...prev, padrao: energyPAList }));
		return toast.success("Padrão removido com sucesso.");
	}
	function validateFields() {
		if (requestInfo.padrao.length == 0) {
			toast.error("Por favor, adicione ao menos um padrão à lista.");
			return false;
		}
		if (requireFiles) {
			if (!files?.fotoPadrao) {
				toast.error("Anexe uma foto do padrão do cliente.");
				return false;
			}
			if (!files.fotoDisjuntor) {
				toast.error("Anexe uma foto do disjuntor do padrão.");
				return false;
			}
			if (!files.fotoCabosPadrao) {
				toast.error("Anexe uma foto dos cabos do padrão.");
				return false;
			}
			if (requestInfo.localizacao.uf == "GO" && !files.fotoPoste) {
				toast.error("Anexe uma foto do poste do padrão.");
				return false;
			}
			if (requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - RURAL") {
				if (!files.fotoLocalizacaoPadraoAntigo) {
					toast.error("Anexe uma foto da localização do padrão antigo.");
					return false;
				}
				if (!files.fotoLocalizacaoPadraoNovo) {
					toast.error("Anexe uma foto da localização do padrão novo.");
					return false;
				}
			}
		}

		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-[#fff] px-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DO PADRÃO</span>

			<div className="flex w-full grow flex-col gap-2">
				<p className="text-center text-xs italic text-gray-500">Você agora pode adicionar múltiplos padrões, em caso de caixa conjugada.</p>
				<p className="text-center text-sm font-medium text-gray-500">
					Preencha as informações e clique em <strong className="font-bold text-green-500">adicionar (+)</strong>.
				</p>
				<div className="flex w-full flex-col justify-around gap-2 lg:flex-row">
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="LIGAÇÃO"
							options={[
								{ id: 1, label: "MONOFÁSICO", value: "MONOFÁSICO" },
								{ id: 2, label: "BIFÁSICO", value: "BIFÁSICO" },
								{ id: 3, label: "TRIFÁSICO", value: "TRIFÁSICO" },
							]}
							value={paInfoHolder.ligacao}
							handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, ligacao: value }))}
							onReset={() => setPaInfoHolder((prev) => ({ ...prev, ligacao: "" }))}
							resetOptionLabel="NÃO DEFINIDO"
							width={"100%"}
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="AMPERAGEM"
							options={AmperageOptions}
							value={paInfoHolder.amperagem}
							handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, amperagem: value }))}
							onReset={() => setPaInfoHolder((prev) => ({ ...prev, amperagem: "" }))}
							resetOptionLabel="NÃO DEFINIDO"
							width={"100%"}
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="TIPO"
							options={EnergyPATypes}
							value={paInfoHolder.tipo}
							handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipo: value }))}
							onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipo: "CONTRA À REDE" }))}
							resetOptionLabel="NÃO DEFINIDO"
							width={"100%"}
						/>
					</div>
					{requestInfo.localizacao?.uf == "GO" ? (
						<div className="w-full lg:w-1/4">
							<TextInput
								label={"CÓDIGO DO POSTE DE DERIVAÇÃO"}
								placeholder={"Preencha o código do poste de derivação..."}
								value={paInfoHolder.codigoPosteDerivacao || ""}
								handleChange={(value) => {
									setPaInfoHolder((prev) => ({ ...prev, codigoPosteDerivacao: value }));
								}}
								width={"100%"}
							/>
						</div>
					) : null}
				</div>
				<div className="flex w-full flex-col justify-around gap-2 lg:flex-row">
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="TIPO DO RAMAL DE ENTRADA"
							options={EnergyPAConnectionTypes}
							value={paInfoHolder.tipoEntrada}
							handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: value }))}
							onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: "AÉREO" }))}
							resetOptionLabel="NÃO DEFINIDO"
							width={"100%"}
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="TIPO DO RAMAL DE SAÍDA"
							options={EnergyPAConnectionTypes}
							value={paInfoHolder.tipoSaida}
							handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: value }))}
							onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: "AÉREO" }))}
							resetOptionLabel="NÃO DEFINIDO"
							width={"100%"}
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<TextInput
							label={"CÓDIGO DO MEDIDOR"}
							placeholder={"Preencha o código do medidor de energia..."}
							value={paInfoHolder.codigoMedidor || ""}
							handleChange={(value) => {
								setPaInfoHolder((prev) => ({ ...prev, codigoMedidor: value }));
							}}
							width={"100%"}
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<SelectInput
							label="MODELO DA CAIXA DO INVERSOR"
							options={EnergyMeterBoxModels}
							value={paInfoHolder.modeloCaixaMedidor}
							handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: value }))}
							onReset={() => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: null }))}
							resetOptionLabel="NÃO DEFINIDO"
							width={"100%"}
						/>
					</div>
				</div>
				<div className="mt-2 flex w-full items-center justify-end">
					<button onClick={addEnergyPA} className="rounded border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-white">
						ADICIONAR ITEM
					</button>
				</div>
				<div className="mt-2 flex w-full flex-col gap-2">
					{requestInfo.padrao.map((paInfo, index) => (
						<div key={index} className="flex w-full flex-col border border-gray-200 p-2 shadow-sm">
							<div className="flex w-full items-center justify-between">
								<h1 className="font-medium leading-none tracking-tight text-gray-500">
									PADRÃO <strong className="text-[#fead41]">{paInfo.ligacao} </strong> de <strong className="text-[#fead41]">{paInfo.amperagem}</strong>
								</h1>
								<button
									onClick={() => removeEnergyPA(index)}
									className="w-fit cursor-pointer text-[20px] text-red-500 opacity-40 duration-300 ease-in hover:scale-110 hover:text-red-500 hover:opacity-100"
								>
									<MdDelete />
								</button>
							</div>

							<div className="mt-2 flex w-full flex-wrap items-center justify-around">
								<div className="flex w-1/2 items-center gap-2 lg:w-fit">
									<TbCategory2 />
									<p className="text-xs lg:text-sm">
										<strong className="text-cyan-500">TIPO:</strong> {paInfo.tipo}
									</p>
								</div>
								<div className="flex w-1/2 items-center gap-2 lg:w-fit">
									<AiOutlineArrowDown />
									<p className="text-xs lg:text-sm">
										<strong className="text-cyan-500">ENTRADA:</strong> {paInfo.tipoEntrada}
									</p>
								</div>
								<div className="flex w-1/2 items-center gap-2 lg:w-fit">
									<AiOutlineArrowUp />
									<p className="text-xs lg:text-sm">
										<strong className="text-cyan-500">SAÍDA:</strong> {paInfo.tipoSaida}
									</p>
								</div>
								<div className="flex w-1/2 items-center gap-2 lg:w-fit">
									<IoMdBarcode />
									<p className="text-xs lg:text-sm">
										<strong className="text-cyan-500">Nº DO MEDIDOR:</strong> {paInfo.codigoMedidor}
									</p>
								</div>
								<div className="flex w-1/2 items-center gap-2 lg:w-fit">
									<TbBoxModel2 />
									<p className="text-xs lg:text-sm">
										<strong className="text-cyan-500">MODELO DA CAIXA:</strong>: {paInfo.modeloCaixaMedidor || "NÃO DEFINIDO"}
									</p>
								</div>
								{paInfo.codigoPosteDerivacao ? (
									<div className="flex w-1/2 items-center gap-2 lg:w-fit">
										<IoMdBarcode />
										<p className="text-xs lg:text-sm">
											<strong className="text-cyan-500">Nº DO POSTE DE DERIVAÇÃO:</strong> {paInfo.codigoPosteDerivacao}
										</p>
									</div>
								) : null}
							</div>
						</div>
					))}
				</div>
				{requireFiles ? (
					<>
						<div className="grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
							<div className="flex w-full flex-col items-center justify-center self-center">
								<div className="flex items-center gap-2">
									<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
										FOTO DO PADRÃO
									</label>
									{files?.fotoPadrao ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
								</div>
								<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-gray-100 p-2">
									<div className="absolute">
										{files?.fotoPadrao ? (
											<div className="flex flex-col items-center">
												<i className="fa fa-folder-open fa-4x text-blue-700"></i>
												<span className="block text-center font-normal text-gray-400">
													{typeof files.fotoPadrao.file != "string" ? files.fotoPadrao.file?.name : formatLongString(files.fotoPadrao.file, 35)}
												</span>
											</div>
										) : (
											<div className="flex flex-col items-center">
												<i className="fa fa-folder-open fa-4x text-blue-700"></i>
												<span className="block font-normal text-gray-400">Adicione o arquivo aqui...</span>
											</div>
										)}
									</div>
									<input
										onChange={(e) =>
											setFiles({
												...files,
												fotoPadrao: {
													title: "FOTO DO PADRÃO",
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
										FOTO DO DISJUNTOR DO PADRÃO
									</label>
									{files?.fotoDisjuntor ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
								</div>
								<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-gray-100 p-2">
									<div className="absolute">
										{files?.fotoDisjuntor ? (
											<div className="flex flex-col items-center">
												<i className="fa fa-folder-open fa-4x text-blue-700"></i>
												<span className="block text-center font-normal text-gray-400">
													{typeof files.fotoDisjuntor.file != "string" ? files.fotoDisjuntor.file?.name : formatLongString(files.fotoDisjuntor.file, 35)}
												</span>
											</div>
										) : (
											<div className="flex flex-col items-center">
												<i className="fa fa-folder-open fa-4x text-blue-700"></i>
												<span className="block font-normal text-gray-400">Adicione o arquivo aqui...</span>
											</div>
										)}
									</div>
									<input
										onChange={(e) =>
											setFiles({
												...files,
												fotoDisjuntor: {
													title: "FOTO DO DISJUNTOR DO PADRÃO",
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
						<div className="flex w-full items-center justify-center gap-2">
							<div className="flex w-full grow flex-col items-center justify-center self-center">
								<div className="flex items-center gap-2">
									<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
										FOTO DOS CABOS DO PADRÃO
									</label>
									{files?.fotoCabosPadrao ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
								</div>
								<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-gray-100 p-2">
									<div className="absolute">
										{files?.fotoCabosPadrao ? (
											<div className="flex flex-col items-center">
												<i className="fa fa-folder-open fa-4x text-blue-700"></i>
												<span className="block text-center font-normal text-gray-400">
													{typeof files.fotoCabosPadrao.file != "string" ? files.fotoCabosPadrao.file?.name : formatLongString(files.fotoCabosPadrao.file, 35)}
												</span>
											</div>
										) : (
											<div className="flex flex-col items-center">
												<i className="fa fa-folder-open fa-4x text-blue-700"></i>
												<span className="block font-normal text-gray-400">Adicione o arquivo aqui...</span>
											</div>
										)}
									</div>
									<input
										onChange={(e) =>
											setFiles({
												...files,
												fotoCabosPadrao: {
													title: "FOTO DO CABOS DO PADRÃO",
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
							{requestInfo.localizacao.uf == "GO" ? (
								<div className="flex w-full grow flex-col items-center justify-center self-center">
									<div className="flex items-center gap-2">
										<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
											FOTO DO POSTE
										</label>
										{files?.fotoPoste ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
									</div>
									<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-gray-100 p-2">
										<div className="absolute">
											{files?.fotoPoste ? (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block text-center font-normal text-gray-400">
														{typeof files.fotoPoste.file != "string" ? files.fotoPoste.file?.name : formatLongString(files.fotoPoste.file, 35)}
													</span>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block font-normal text-gray-400">Adicione o arquivo aqui...</span>
												</div>
											)}
										</div>
										<input
											onChange={(e) =>
												setFiles({
													...files,
													fotoPoste: {
														title: "FOTO DO POSTE",
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
							) : null}
						</div>
						{requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - RURAL" ? (
							<div className="grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
								<div className="flex w-full flex-col items-center justify-center self-center">
									<div className="flex items-center gap-2">
										<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="laudo">
											FOTO DO LOCALIZAÇÃO DO PADRÃO ANTIGO
										</label>
										{files?.fotoLocalizacaoPadraoAntigo ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
									</div>
									<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-gray-100 p-2">
										<div className="absolute">
											{files?.fotoLocalizacaoPadraoAntigo ? (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block text-center font-normal text-gray-400">
														{typeof files.fotoLocalizacaoPadraoAntigo.file != "string"
															? files.fotoLocalizacaoPadraoAntigo.file?.name
															: formatLongString(files.fotoLocalizacaoPadraoAntigo.file, 35)}
													</span>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block font-normal text-gray-400">Adicione o arquivo aqui...</span>
												</div>
											)}
										</div>
										<input
											onChange={(e) =>
												setFiles({
													...files,
													fotoLocalizacaoPadraoAntigo: {
														title: "FOTO DO LOCALIZAÇÃO DO PADRÃO ANTIGO",
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
											FOTO DO LOCALIZAÇÃO DO PADRÃO NOVO
										</label>
										{files?.fotoLocalizacaoPadraoNovo ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
									</div>
									<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-gray-100 p-2">
										<div className="absolute">
											{files?.fotoLocalizacaoPadraoNovo ? (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block text-center font-normal text-gray-400">
														{typeof files.fotoLocalizacaoPadraoNovo.file != "string" ? files.fotoLocalizacaoPadraoNovo.file?.name : formatLongString(files.fotoLocalizacaoPadraoNovo.file, 35)}
													</span>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<i className="fa fa-folder-open fa-4x text-blue-700"></i>
													<span className="block font-normal text-gray-400">Adicione o arquivo aqui...</span>
												</div>
											)}
										</div>
										<input
											onChange={(e) =>
												setFiles({
													...files,
													fotoLocalizacaoPadraoNovo: {
														title: "FOTO DO LOCALIZAÇÃO DO PADRÃO NOVO",
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

			<div className="mt-2 flex w-full items-end justify-between bg-[#fff]">
				<button onClick={() => goToPreviousStage()} className="rounded p-2 font-bold text-gray-500 duration-300 ease-in-out hover:scale-105">
					Voltar
				</button>
				<button
					onClick={() => {
						if (validateFields()) {
							goToNextStage();
						}
					}}
					className=" rounded p-2 font-bold hover:bg-black hover:text-white"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default PAInfo;
