import DocumentFileInput from "@/components/Inputs/DocumentFileInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatLongString } from "@/utils/methods";
import { ITechnicalAnalysis } from "@/utils/models";
import { TFileHolder } from "@/utils/schemas/file-reference.schema";
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
	infoHolder: TTechnicalAnalysis;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
	files: TFileHolder;
	setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
};
function PAInfo({ infoHolder, setInfoHolder, files, setFiles, goToNextStage, goToPreviousStage }: PAInfoProps) {
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
		const energyPAList = infoHolder.padrao ? [...infoHolder.padrao] : [];
		energyPAList.push(paInfoHolder);
		setInfoHolder((prev) => ({ ...prev, padrao: energyPAList }));
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
		const energyPAList = infoHolder.padrao ? [...infoHolder.padrao] : [];
		energyPAList.splice(index, 1);
		setInfoHolder((prev) => ({ ...prev, padrao: energyPAList }));
		return toast.success("Padrão removido com sucesso.");
	}
	function validateAndProceed() {
		if (infoHolder.padrao.length == 0) return toast.error("Por favor, adicione ao menos um padrão à lista.");

		// VALIDATING FILES
		if (!files["FOTO DO PADRÃO"]) return toast.error("Anexe uma foto do padrão da instalação.");

		if (!files["FOTO DO DISJUNTOR DO PADRÃO"]) return toast.error("Anexe uma foto do disjuntor do padrão da instalação.");

		if (!files["FOTO DOS CABOS DO PADRÃO"]) return toast.error("Anexe uma foto dos cabos do padrão da instalação.");

		if (!files["FOTO DO POSTE"]) return toast.error("Anexe uma foto do poste do padrão da instalação.");

		return goToNextStage();
	}
	return (
		<div className="flex w-full grow flex-col bg-[#fff] px-2">
			<h1 className="w-full rounded-md  bg-gray-700 p-1 text-center font-medium text-white">INFORMAÇÕES DO PADRÃO DE ENERGIA</h1>
			<div className="flex w-full grow flex-col gap-2">
				<p className="my-2 w-full self-center text-center text-sm leading-none tracking-tight text-gray-500 lg:w-[60%]">
					Preencha abaixo as informações do padrão de energia instalação e clique em <strong className="font-bold text-green-500">adicionar (+)</strong>. Se necessário, você pode
					adicionar mais de um padrão de energia à lista.
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

					<div className="w-full lg:w-1/4">
						<TextInput
							label={"CÓD.DO POSTE DE DERIVAÇÃO"}
							placeholder={"Preencha o código do poste de derivação..."}
							value={paInfoHolder.codigoPosteDerivacao || ""}
							handleChange={(value) => {
								setPaInfoHolder((prev) => ({ ...prev, codigoPosteDerivacao: value }));
							}}
							width={"100%"}
						/>
					</div>
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
							label="MODELO DA CAIXA DO MEDIDOR"
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
				<h1 className="mt-2 w-full text-start font-sans  font-bold text-cyan-500">LISTA DE PADRÕES</h1>
				<div className="mt-2 flex w-full flex-col flex-wrap items-start justify-around gap-2 lg:flex-row">
					{infoHolder.padrao.length > 0 ? (
						infoHolder.padrao.map((paInfo, index) => (
							<div key={index} className="flex w-[450px] flex-col rounded-md border border-gray-500 p-2 shadow-sm">
								<div className="flex w-full items-center justify-between gap-1">
									<div className="flex items-center gap-1">
										<h1 className="font-black leading-none tracking-tight">PADRÃO {paInfo.ligacao}</h1>
										<h1 className="rounded-full bg-gray-800 px-2 py-1 text-[0.65rem] font-medium text-white lg:text-xs">{paInfo.amperagem}</h1>
									</div>
									<button
										onClick={() => removeEnergyPA(index)}
										className="w-fit cursor-pointer text-[20px] text-red-500 opacity-40 duration-300 ease-in hover:scale-110 hover:text-red-500 hover:opacity-100"
									>
										<MdDelete />
									</button>
								</div>
								<div className="flex items-center gap-1">
									<TbCategory2 />
									<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{paInfo.tipo}</p>
								</div>
								<div className="mt-4 flex w-full items-center justify-between gap-2">
									<div className="flex items-center gap-1">
										<AiOutlineArrowDown />
										<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">
											<strong className="text-cyan-500">ENTRADA:</strong> {paInfo.tipoEntrada}
										</p>
									</div>
									<div className="flex items-center gap-1">
										<AiOutlineArrowUp />
										<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">
											<strong className="text-cyan-500">SAÍDA:</strong> {paInfo.tipoSaida}
										</p>
									</div>
								</div>
								<div className="mt-2 flex w-full items-center justify-between gap-2">
									<div className="flex items-center gap-1">
										<IoMdBarcode />
										<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">
											<strong className="text-cyan-500">Nº DO MEDIDOR:</strong> {paInfo.codigoMedidor}
										</p>
									</div>
									<div className="flex items-center gap-1">
										<TbBoxModel2 />
										<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">
											<strong className="text-cyan-500">MODELO DA CAIXA:</strong>: {paInfo.modeloCaixaMedidor || "NÃO DEFINIDO"}
										</p>
									</div>
								</div>
								<div className="mt-2 flex w-full flex-wrap items-center justify-around">
									{paInfo.codigoPosteDerivacao ? (
										<div className="flex w-1/2 items-center gap-2 lg:w-fit">
											<IoMdBarcode />
											<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">
												<strong className="text-cyan-500">Nº DO POSTE DE DERIVAÇÃO:</strong> {paInfo.codigoPosteDerivacao}
											</p>
										</div>
									) : null}
								</div>
							</div>
						))
					) : (
						<p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhum padrão de energia adicionado à lista.</p>
					)}
				</div>

				<h1 className="mt-2 w-full text-start font-sans  font-bold text-cyan-500">ARQUIVOS</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<DocumentFileInput label="FOTO DO PADRÃO" value={files["FOTO DO PADRÃO"]} handleChange={(value) => setFiles((prev) => ({ ...prev, ["FOTO DO PADRÃO"]: value }))} />
					</div>
					<div className="w-full lg:w-1/2">
						<DocumentFileInput
							label="FOTO DO DISJUNTOR DO PADRÃO"
							value={files["FOTO DO DISJUNTOR DO PADRÃO"]}
							handleChange={(value) => setFiles((prev) => ({ ...prev, ["FOTO DO DISJUNTOR DO PADRÃO"]: value }))}
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<DocumentFileInput
							label="FOTO DOS CABOS DO PADRÃO"
							value={files["FOTO DOS CABOS DO PADRÃO"]}
							handleChange={(value) => setFiles((prev) => ({ ...prev, ["FOTO DOS CABOS DO PADRÃO"]: value }))}
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<DocumentFileInput label="FOTO DO POSTE" value={files["FOTO DO POSTE"]} handleChange={(value) => setFiles((prev) => ({ ...prev, ["FOTO DO POSTE"]: value }))} />
					</div>
				</div>
			</div>

			<div className="mt-2 flex w-full items-end justify-between bg-[#fff]">
				<button onClick={() => goToPreviousStage()} className="rounded p-2 font-bold text-gray-500 duration-300 ease-in-out hover:scale-105">
					Voltar
				</button>
				<button
					onClick={() => {
						validateAndProceed();
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
