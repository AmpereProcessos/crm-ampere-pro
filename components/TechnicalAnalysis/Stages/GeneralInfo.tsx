import { ITechnicalAnalysis } from "@/utils/models";
import React, { useState } from "react";
import TextInput from "../../Inputs/TextInput";
import { formatLongString, formatToCEP, formatToPhone, getCEPInfo } from "@/utils/methods";
import { toast } from "react-hot-toast";
import SelectInput from "../../Inputs/SelectInput";
import { stateCities } from "@/utils/estados_cidades";
import { BsCheckCircleFill } from "react-icons/bs";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { TFileHolder } from "@/utils/schemas/file-reference.schema";
import DocumentFileInput from "@/components/Inputs/DocumentFileInput";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import AnalysisVinculationMenu from "../AnalysisVinculationMenu";

type GeneralInfoProps = {
	infoHolder: TTechnicalAnalysis;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	goToNextStage: () => void;
	resetSolicitationType: () => void;
	files: TFileHolder;
	setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
};
function GeneralInfo({ goToNextStage, resetSolicitationType, infoHolder, setInfoHolder, files, setFiles }: GeneralInfoProps) {
	const [vinculationMenuIsOpen, setVinculationMenuIsOpen] = useState<boolean>(false);
	async function setAddressDataByCEP(cep: string) {
		const addressInfo = await getCEPInfo(cep);
		const toastID = toast.loading("Buscando informações sobre o CEP...", {
			duration: 2000,
		});
		setTimeout(() => {
			if (addressInfo) {
				toast.dismiss(toastID);
				toast.success("Dados do CEP buscados com sucesso.", {
					duration: 1000,
				});
				setInfoHolder((prev) => ({
					...prev,
					localizacao: {
						...prev.localizacao,
						endereco: addressInfo.logradouro,
						bairro: addressInfo.bairro,
						uf: addressInfo.uf as keyof typeof stateCities,
						cidade: addressInfo.localidade.toUpperCase(),
					},
				}));
			}
		}, 1000);
	}
	function validateFields() {
		if (infoHolder.nome.trim().length < 3) {
			return toast.error("Preencha um nome de ao menos 3 letras para o cliente.");
		}
		if (!infoHolder.localizacao.cep || infoHolder.localizacao.cep?.trim().length < 9) {
			return toast.error("Preencha um cep válido para o cliente.");
		}
		if (!infoHolder.localizacao.cidade) {
			return toast.error("Preencha a cidade de instalação do cliente.");
		}
		if (!infoHolder.localizacao.uf) {
			return toast.error("Preencha o estado da instalação do cliente.");
		}
		if (infoHolder.localizacao.bairro.trim().length < 3) {
			return toast.error("Preencha um bairro de ao menos 3 letras.");
		}
		if (infoHolder.localizacao.endereco.trim().length < 3) {
			return toast.error("Preencha um logradouro de ao menos 3 letras.");
		}
		if (infoHolder.localizacao.numeroOuIdentificador.trim().length == 0) {
			return toast.error("Preencha o número da residência do cliente.");
		}
		if (!files["COMPROVANTE DE LOCALIZAÇÃO"]) {
			return toast.error("Anexe um arquivo para identificação da localização.");
		}
		return goToNextStage();
	}
	return (
		<div className="flex w-full grow flex-col bg-[#fff] px-2">
			<h1 className="w-full rounded-md  bg-gray-700 p-1 text-center font-medium text-white">INFORMAÇÕES GERAIS</h1>
			<div className="flex w-full grow flex-col gap-2">
				<div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
					<TextInput
						label={"NOME DO CLIENTE"}
						placeholder="Digite aqui o nome do cliente..."
						width={"100%"}
						value={infoHolder.nome}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
					/>
				</div>
				<p className="my-2 w-full text-center text-sm leading-none tracking-tight text-gray-500">
					Preencha abaixo a localização de <strong className="text-cyan-500">instalação</strong> do sistema fotovoltaico.
				</p>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<TextInput
							label={"CEP"}
							placeholder="Digite aqui o CEP do cliente..."
							width={"100%"}
							value={infoHolder.localizacao.cep || ""}
							handleChange={(value) => {
								if (value.length == 9) {
									setAddressDataByCEP(value);
								}
								setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cep: formatToCEP(value) } }));
							}}
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							width={"100%"}
							label={"UF"}
							editable={true}
							options={Object.keys(stateCities).map((state, index) => ({
								id: index + 1,
								label: state,
								value: state,
							}))}
							value={infoHolder.localizacao.uf}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: value } }))}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: null } }));
							}}
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							width={"100%"}
							label={"CIDADE"}
							editable={true}
							value={infoHolder.localizacao.cidade}
							options={
								infoHolder.localizacao.uf
									? stateCities[infoHolder.localizacao.uf as keyof typeof stateCities].map((city, index) => {
											return {
												id: index,
												value: city,
												label: city,
											};
										})
									: null
							}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }))}
							onReset={() => {
								setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<TextInput
							label={"BAIRRO"}
							placeholder="Digite aqui o bairro do cliente.."
							width={"100%"}
							value={infoHolder.localizacao.bairro}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }))}
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label={"LOGRADOURO"}
							placeholder="Digite o logradouro do cliente..."
							width={"100%"}
							value={infoHolder.localizacao.endereco}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }))}
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label={"NÚMERO OU IDENTIFICADOR"}
							placeholder="Digite aqui o número/identificador da residência..."
							width={"100%"}
							value={infoHolder.localizacao.numeroOuIdentificador}
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, numeroOuIdentificador: value } }));
							}}
						/>
					</div>
				</div>
				<DocumentFileInput
					label="COMPROVANTE DE LOCALIZAÇÃO"
					value={files["COMPROVANTE DE LOCALIZAÇÃO"]}
					handleChange={(value) => setFiles((prev) => ({ ...prev, ["COMPROVANTE DE LOCALIZAÇÃO"]: value }))}
				/>
				<div className="flex w-full flex-col gap-1 rounded border border-orange-700 p-2">
					<p className="my-2 w-full text-center text-sm leading-none tracking-tight text-gray-500">
						Deseja utilizar uma <strong className="text-orange-700">análise técnica existente de referência</strong>, para alterações ou afins ? Marque a opção abaixo para abrir o menu
						de seleção.
					</p>
					<div className="flex w-full items-center justify-center">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="UTILIZAR ANÁLISE TÉCNICA DE REFERÊNCIA"
								labelTrue="UTILIZAR ANÁLISE TÉCNICA DE REFERÊNCIA"
								checked={vinculationMenuIsOpen}
								handleChange={(value) => setVinculationMenuIsOpen(value)}
							/>
						</div>
					</div>
					{vinculationMenuIsOpen ? <AnalysisVinculationMenu infoHolder={infoHolder} setInfoHolder={setInfoHolder} closeMenu={() => setVinculationMenuIsOpen(false)} /> : null}
				</div>
			</div>

			<div className="mt-2 flex w-full justify-between">
				<button onClick={() => resetSolicitationType()} className="rounded p-2 font-bold text-gray-500 duration-300 ease-in-out hover:scale-105">
					Voltar
				</button>
				<button
					onClick={() => {
						validateFields();
					}}
					className="rounded p-2 font-bold hover:bg-black hover:text-white"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default GeneralInfo;
