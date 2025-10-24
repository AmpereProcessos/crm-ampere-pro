import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { stateCities } from "@/utils/estados_cidades";
import { getCEPInfo } from "@/utils/methods";
import { TProject } from "@/utils/schemas/project.schema";
import { ConsumerUnitGroups, ConsumerUnitHolderType, ConsumerUnitLigationType } from "@/utils/select-options";
import React from "react";
import toast from "react-hot-toast";

type ConsumerUnitProps = {
	requestInfo: TProject;
	setRequestInfo: React.Dispatch<React.SetStateAction<TProject>>;
	goToNextState: () => void;
};
function ConsumerUnit({ requestInfo, setRequestInfo, goToNextState }: ConsumerUnitProps) {
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
	function validateAndProceed() {
		if (requestInfo.unidadeConsumidora.concessionaria.trim().length < 3) return toast.error("Concessionária inválida ou não informada.");
		if (requestInfo.unidadeConsumidora.numero.trim().length < 9) return toast.error("Número da instalação inválido ou não informado.");
		if (!requestInfo.unidadeConsumidora.grupo) return toast.error("Grupo inválido ou não fornecido.");
		if (!requestInfo.unidadeConsumidora.tipoLigacao) return toast.error("Tipo de ligação inválido ou não fornecido.");
		if (!requestInfo.unidadeConsumidora.tipoTitular) return toast.error("Tipo do titular inválido ou não fornecido.");
		if (requestInfo.unidadeConsumidora.nomeTitular.trim().length < 3) return toast.error("Nome do titular inválido ou não fornecido.");

		return goToNextState();
	}
	return (
		<div className="flex w-full grow flex-col gap-2">
			<div className="flex w-full grow flex-col gap-2">
				<h1 className="w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-primary-foreground">UNIDADE CONSUMIDORA</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<TextInput
							label="CONCESSIONÁRIA"
							placeholder="Preencha aqui a concessionária..."
							value={requestInfo.unidadeConsumidora.concessionaria}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, concessionaria: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="Nº DA INSTALAÇÃO"
							placeholder="Preencha aqui o número da instalação..."
							value={requestInfo.unidadeConsumidora.numero || ""}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, numero: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="GRUPO DA UNIDADE"
							value={requestInfo.unidadeConsumidora.grupo}
							resetOptionLabel="NÃO DEFINIDO"
							options={ConsumerUnitGroups}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, grupo: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, grupo: "URBANO" } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="TIPO DA LIGAÇÃO"
							value={requestInfo.unidadeConsumidora.tipoLigacao}
							resetOptionLabel="NÃO DEFINIDO"
							options={ConsumerUnitLigationType}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, tipoLigacao: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, tipoLigacao: "EXISTENTE" } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="TIPO DO TITULAR"
							value={requestInfo.unidadeConsumidora.tipoTitular}
							resetOptionLabel="NÃO DEFINIDO"
							options={ConsumerUnitHolderType}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, tipoTitular: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, tipoTitular: "PESSOA FÍSICA" } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="NOME DO TITULAR"
							placeholder="Preencha aqui o nome do titular da instalação..."
							value={requestInfo.unidadeConsumidora.nomeTitular || ""}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, unidadeConsumidora: { ...prev.unidadeConsumidora, nomeTitular: value } }))}
							width="100%"
						/>
					</div>
				</div>
				<h1 className="w-full rounded-md bg-primary/80 p-0.5 text-center text-xs font-medium text-primary-foreground">ENDEREÇO</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<TextInput
							label="CEP"
							value={requestInfo.localizacao.cep || ""}
							placeholder="Preencha aqui o CEP da instalação..."
							handleChange={(value) => {
								if (value.length == 9) {
									setAddressDataByCEP(value);
								}
								setRequestInfo((prev) => ({
									...prev,
									localizacao: {
										...prev.localizacao,
										cep: value,
									},
								}));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="ESTADO"
							value={requestInfo.localizacao.uf}
							handleChange={(value) =>
								setRequestInfo((prev) => ({
									...prev,
									localizacao: { ...prev.localizacao, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string },
								}))
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() =>
								setRequestInfo((prev) => ({
									...prev,
									localizacao: { ...prev.localizacao, uf: null, cidade: null },
								}))
							}
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
							value={requestInfo.localizacao.cidade}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }))}
							options={
								requestInfo.localizacao.uf
									? stateCities[requestInfo.localizacao.uf as keyof typeof stateCities].map((city, index) => ({
											id: index + 1,
											value: city,
											label: city,
										}))
									: null
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: null } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="BAIRRO"
							value={requestInfo.localizacao.bairro || ""}
							placeholder="Preencha aqui o bairro da instalação..."
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="LOGRADOURO/RUA"
							value={requestInfo.localizacao.endereco || ""}
							placeholder="Preencha aqui o logradouro da instalação..."
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NÚMERO/IDENTIFICADOR"
							value={requestInfo.localizacao.numeroOuIdentificador || ""}
							placeholder="Preencha aqui o número ou identificador da residência da instalação..."
							handleChange={(value) =>
								setRequestInfo((prev) => ({
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
							value={requestInfo.localizacao.complemento || ""}
							placeholder="Preencha aqui algum complemento do endereço."
							handleChange={(value) =>
								setRequestInfo((prev) => ({
									...prev,
									localizacao: { ...prev.localizacao, complemento: value },
								}))
							}
							width="100%"
						/>
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-end">
				<button
					onClick={() => validateAndProceed()}
					className="rounded bg-black px-4 py-1 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70"
				>
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default ConsumerUnit;
