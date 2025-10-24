import { stateCities } from "@/utils/estados_cidades";
import { formatLongString, formatToCEP, getCEPInfo } from "@/utils/methods";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import React from "react";
import { toast } from "react-hot-toast";
import { BsCheckCircleFill } from "react-icons/bs";
import SelectInput from "../../Inputs/SelectInput";
import TextInput from "../../Inputs/TextInput";

type GeneralInfoProps = {
	requestInfo: TTechnicalAnalysis;
	setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	goToNextStage: () => void;
	requireFiles?: boolean;
	resetSolicitationType: () => void;
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
function GeneralInfo({ goToNextStage, resetSolicitationType, requestInfo, setRequestInfo, requireFiles = true, files, setFiles }: GeneralInfoProps) {
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
				setRequestInfo((prev) => ({
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
		if (requestInfo.nome.trim().length < 3) {
			toast.error("Preencha um nome de ao menos 3 letras para o cliente.");
			return false;
		}
		if (!requestInfo.localizacao.cep || requestInfo.localizacao.cep?.trim().length < 9) {
			toast.error("Preencha um cep válido para o cliente.");
			return false;
		}
		if (!requestInfo.localizacao.cidade) {
			toast.error("Preencha a cidade de instalação do cliente.");
			return false;
		}
		if (!requestInfo.localizacao.uf) {
			toast.error("Preencha o estado da instalação do cliente.");
			return false;
		}
		if (requestInfo.localizacao.bairro.trim().length < 3) {
			toast.error("Preencha um bairro de ao menos 3 letras.");
			return false;
		}
		if (requestInfo.localizacao.endereco.trim().length < 3) {
			toast.error("Preencha um logradouro de ao menos 3 letras.");
			return false;
		}
		if (requestInfo.localizacao.numeroOuIdentificador.trim().length == 0) {
			toast.error("Preencha o número da residência do cliente.");
			return false;
		}
		if (requireFiles && !files?.localizacao) {
			toast.error("Anexe um arquivo para identificação da localização.");
			return false;
		}
		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-background px-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS GERAIS</span>
			<div className="flex w-full grow flex-col gap-2">
				<div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
					<div className="w-full lg:w-[50%]">
						<TextInput
							label={"NOME DO CLIENTE"}
							placeholder="Digite aqui o nome do cliente..."
							width={"100%"}
							value={requestInfo.nome}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, nome: value }))}
						/>
					</div>
					<div className="w-full lg:w-[50%]">
						<TextInput
							label={"CEP"}
							placeholder="Digite aqui o CEP do cliente..."
							width={"100%"}
							value={requestInfo.localizacao.cep || ""}
							handleChange={(value) => {
								if (value.length == 9) {
									setAddressDataByCEP(value);
								}
								setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cep: formatToCEP(value) } }));
							}}
						/>
					</div>
				</div>

				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"UF"}
							editable={true}
							options={Object.keys(stateCities).map((state, index) => ({
								id: index + 1,
								label: state,
								value: state,
							}))}
							value={requestInfo.localizacao.uf}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: value } }))}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() => {
								setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: null } }));
							}}
						/>
					</div>
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<SelectInput
							width={"100%"}
							label={"CIDADE"}
							editable={true}
							value={requestInfo.localizacao.cidade}
							options={
								requestInfo.localizacao.uf
									? stateCities[requestInfo.localizacao.uf as keyof typeof stateCities].map((city, index) => {
											return {
												id: index,
												value: city,
												label: city,
											};
										})
									: null
							}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }))}
							onReset={() => {
								setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<TextInput
							label={"BAIRRO"}
							placeholder="Digite aqui o bairro do cliente.."
							width={"100%"}
							value={requestInfo.localizacao.bairro}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }))}
						/>
					</div>
					<div className="flex w-full items-center justify-center lg:w-[50%]">
						<TextInput
							label={"LOGRADOURO"}
							placeholder="Digite o logradouro do cliente..."
							width={"100%"}
							value={requestInfo.localizacao.endereco}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }))}
						/>
					</div>
				</div>
				<div className="flex w-full items-center justify-center">
					<div className="w-full lg:w-[450px]">
						<TextInput
							label={"NÚMERO OU IDENTIFICADOR"}
							placeholder="Digite aqui o número/identificador da residência..."
							width={"100%"}
							value={requestInfo.localizacao.numeroOuIdentificador}
							handleChange={(value) => {
								setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, numeroOuIdentificador: value } }));
							}}
						/>
					</div>
				</div>
				{requireFiles ? (
					<div className="flex w-full flex-col items-center justify-center self-center">
						<div className="flex items-center gap-2">
							<label className="ml-2 text-center text-sm font-bold text-[#15599a]" htmlFor="contaDeEnergia">
								CONFIRMAÇÃO DA SUA LOCALIZAÇÃO
							</label>
							{files?.localizacao ? <BsCheckCircleFill style={{ color: "rgb(34,197,94)" }} /> : null}
						</div>
						<div className="relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2">
							<div className="absolute">
								{files?.localizacao ? (
									<div className="flex flex-col items-center">
										<i className="fa fa-folder-open fa-4x text-blue-700"></i>
										<span className="block text-center font-normal text-primary/40">
											{typeof files.localizacao.file != "string" ? files.localizacao.file?.name : formatLongString(files.localizacao.file, 35)}
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
										localizacao: {
											title: "LOCALIZAÇÃO",
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

			<div className="mt-2 flex w-full justify-between">
				<button onClick={() => resetSolicitationType()} className="rounded p-2 font-bold text-primary/70 duration-300 ease-in-out hover:scale-105">
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

export default GeneralInfo;
