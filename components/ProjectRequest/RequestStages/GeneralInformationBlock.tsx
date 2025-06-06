import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { TProject } from "@/utils/schemas/project.schema";
import { ComercialSegments, SigningForms } from "@/utils/select-options";
import React from "react";
import ProjectObservations from "./Utils/ProjectObservations";
import type { TUserSession } from "@/lib/auth/session";
import { formatToCEP, formatToPhone, getCEPInfo } from "@/utils/methods";
import TextareaInput from "@/components/Inputs/TextareaInput";
import toast from "react-hot-toast";
import { stateCities } from "@/utils/estados_cidades";

type GeneralInformationBlockProps = {
	infoHolder: TProject;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProject>>;
	moveToNextStage: () => void;
	session: TUserSession;
};
function GeneralInformationBlock({ infoHolder, setInfoHolder, session, moveToNextStage }: GeneralInformationBlockProps) {
	function validateAndProceed() {
		// Validating obrigatory fields
		if (infoHolder.nome.trim().length < 5) return toast.error("Preencha um nome de ao menos 5 letras para o projeto.");
		if (infoHolder.contatos.email.trim().length < 5) return toast.error("Preencha um email válido.");
		if (infoHolder.contatos.nomePrimario.trim().length < 5) return toast.error("Preencha uma nome válido para o contato primário.");
		if (infoHolder.contatos.telefonePrimario.trim().length < 10) return toast.error("Preencha uma telefone válido para o contato primário.");

		// Setting name to uppercase by default
		setInfoHolder((prev) => ({ ...prev, nome: prev.nome.toUpperCase() }));

		return moveToNextStage();
	}
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
	return (
		<div className="flex w-full grow flex-col gap-2">
			<h1 className="w-full rounded bg-gray-800 p-1 text-center font-bold text-white">INFORMAÇÕES GERAIS</h1>
			<div className="flex w-full grow flex-col gap-2">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NOME DO PROJETO"
							value={infoHolder.nome}
							placeholder="Preencha aqui o nome do projeto."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="SEGMENTO"
							value={infoHolder.segmento}
							options={ComercialSegments}
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									segmento: value as TProject["segmento"],
								}));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() =>
								setInfoHolder((prev) => ({
									...prev,
									segmento: "RESIDENCIAL",
								}))
							}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="EMAIL"
							value={infoHolder.contatos.email}
							placeholder="Preencha aqui o email no contrato, comunicações oficiais, etc."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, email: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="FORMA DE ASSINATURA"
							resetOptionLabel="NÃO DEFINIDO"
							options={SigningForms}
							value={infoHolder.contrato.formaAssinatura}
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									contrato: { ...prev.contrato, formaAssinatura: value },
								}))
							}
							onReset={() => {
								setInfoHolder((prev) => ({
									...prev,
									contrato: { ...prev.contrato, formaAssinatura: "FÍSICA" },
								}));
							}}
							width="100%"
						/>
					</div>
				</div>
				<ProjectObservations session={session} infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
				<h1 className="w-full rounded-md bg-blue-500 p-1 text-center text-sm font-bold text-white">INFORMAÇÕES PARA CONTATO</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NOME DO CONTATO PRIMÁRIO"
							value={infoHolder.contatos.nomePrimario}
							placeholder="Preencha aqui o nome do contato primário."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, nomePrimario: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="TELEFONE DO CONTATO PRIMÁRIO"
							value={infoHolder.contatos.telefonePrimario}
							placeholder="Preencha aqui o telefone do contato primário."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, telefonePrimario: formatToPhone(value) } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NOME DO CONTATO SECUNDÁRIO"
							value={infoHolder.contatos.nomeSecundario}
							placeholder="Preencha aqui o nome do contato secundário."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, nomeSecundario: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="TELEFONE DO CONTATO SECUNDÁRIO"
							value={infoHolder.contatos.telefoneSecundario || ""}
							placeholder="Preencha aqui o telefone do contato secundário."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, telefoneSecundario: formatToPhone(value) } }))}
							width="100%"
						/>
					</div>
				</div>
				<TextareaInput
					label="OBSERVAÇÕES PARA O CONTATO"
					placeholder="Preencha aqui informações relevantes em relação ao contato com o cliente. Melhores horários para contato, preferência por áudio ou texto, etc."
					value={infoHolder.contatos.observacoes || ""}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, observacoes: value } }))}
				/>
				<h1 className="w-full rounded-md bg-blue-500 p-1 text-center text-sm font-bold text-white">LOCALIZAÇÃO DO PROJETO</h1>
				<div className="my-1 flex w-full flex-col">
					<p className="w-full text-center text-sm font-light tracking-tighter text-gray-700">Preencha abaixo a localização de execução do projeto.</p>
					<p className="w-full text-center text-sm font-light tracking-tighter text-gray-700">
						Em casos em que não seja requerido a execução física do serviço, preencha o endereço do cliente.
					</p>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<TextInput
							label="CEP"
							value={infoHolder.localizacao.cep || ""}
							placeholder="Preencha aqui o CEP da instalação..."
							handleChange={(value) => {
								if (value.length == 9) {
									setAddressDataByCEP(value);
								}
								setInfoHolder((prev) => ({
									...prev,
									localizacao: {
										...prev.localizacao,
										cep: formatToCEP(value),
									},
								}));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="ESTADO"
							value={infoHolder.localizacao.uf}
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									localizacao: { ...prev.localizacao, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string },
								}))
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: "", cidade: "" } }))}
							options={Object.keys(stateCities).map((state, index) => ({
								id: index + 1,
								label: state,
								value: state,
							}))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="CIDADE"
							value={infoHolder.localizacao.cidade}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }))}
							options={
								infoHolder.localizacao.uf
									? stateCities[infoHolder.localizacao.uf as keyof typeof stateCities].map((city, index) => ({
											id: index + 1,
											value: city,
											label: city,
										}))
									: null
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: "" } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="BAIRRO"
							value={infoHolder.localizacao.bairro || ""}
							placeholder="Preencha aqui o bairro do instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="LOGRADOURO/RUA"
							value={infoHolder.localizacao.endereco || ""}
							placeholder="Preencha aqui o logradouro da instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NÚMERO/IDENTIFICADOR"
							value={infoHolder.localizacao.numeroOuIdentificador || ""}
							placeholder="Preencha aqui o número ou identificador da residência da instalação..."
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									localizacao: { ...prev.localizacao, numeroOuIdentificador: value },
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="COMPLEMENTO"
							value={infoHolder.localizacao.complemento || ""}
							placeholder="Preencha aqui algum complemento do endereço..."
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									localizacao: { ...prev.localizacao, complemento: value },
								}))
							}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="LATITUDE"
							value={infoHolder.localizacao.latitude || ""}
							placeholder="Preencha aqui a latitude da instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, latitude: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="LONGITUDE"
							value={infoHolder.localizacao.longitude || ""}
							placeholder="Preencha aqui a longitude da instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, longitude: value } }))}
							width="100%"
						/>
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-end">
				<button onClick={() => validateAndProceed()} className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700">
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default GeneralInformationBlock;
