import DateInput from "@/components/Inputs/DateInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { stateCities } from "@/utils/estados_cidades";
import { formatDateForInputValue, formatToCEP, formatToCPForCNPJ, formatToPhone, getCEPInfo } from "@/utils/methods";
import { TChangesControl, TProjectDTOWithReferences } from "@/utils/schemas/project.schema";
import { CustomersAcquisitionChannels, MaritalStatus } from "@/utils/select-options";
import React from "react";
import toast from "react-hot-toast";

type ClientBlockProps = {
	infoHolder: TProjectDTOWithReferences;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>;
	changes: TChangesControl;
	setChanges: React.Dispatch<React.SetStateAction<TChangesControl>>;
	userHasClientEditPermission: boolean;
};
function ClientBlock({ infoHolder, setInfoHolder, changes, setChanges, userHasClientEditPermission }: ClientBlockProps) {
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
					clienteDados: {
						...prev.clienteDados,
						endereco: addressInfo.logradouro,
						bairro: addressInfo.bairro,
						uf: addressInfo.uf as keyof typeof stateCities,
						cidade: addressInfo.localidade.toUpperCase(),
					},
				}));
				setChanges((prev) => ({
					...prev,
					client: {
						...prev.client,
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
		<div className="flex w-full flex-col gap-2 rounded border border-gray-800">
			<h1 className="w-full rounded bg-gray-800 p-1 text-center font-bold text-white">INFORMAÇÕES DO CLIENTE</h1>
			<div className="flex w-full grow flex-col gap-2 p-2">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NOME (*)"
							value={infoHolder.clienteDados.nome}
							placeholder="Preencha aqui o nome do cliente."
							handleChange={(value) => {
								setInfoHolder((prev) => ({ ...prev, clienteDados: { ...prev.clienteDados, nome: value } }));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, nome: value } }));
							}}
							editable={userHasClientEditPermission}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="CPF/CNPJ"
							value={infoHolder.clienteDados.cpfCnpj || ""}
							placeholder="Preencha aqui o CPF ou CNPJ do cliente."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										cpfCnpj: formatToCPForCNPJ(value),
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, cpfCnpj: value } }));
							}}
							editable={userHasClientEditPermission}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<DateInput
							label={"DATA DE NASCIMENTO"}
							editable={userHasClientEditPermission}
							value={infoHolder.clienteDados.dataNascimento ? formatDateForInputValue(infoHolder.clienteDados.dataNascimento) : undefined}
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: { ...prev.clienteDados, dataNascimento: formatDateOnInputChange(value) },
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, dataNascimento: value } }));
							}}
							width={"100%"}
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="PROFISSÃO"
							editable={userHasClientEditPermission}
							value={infoHolder.clienteDados.profissao || ""}
							placeholder="Preencha aqui a profissão do cliente."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										profissao: value,
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, profissao: value } }));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="ONDE TRABALHA"
							editable={userHasClientEditPermission}
							value={infoHolder.clienteDados.ondeTrabalha || ""}
							placeholder="Preencha aqui o lugar de trabalho do cliente."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										ondeTrabalha: value,
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, ondeTrabalha: value } }));
							}}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="DEFICIÊNCIA (SE HOUVER)"
							value={infoHolder.clienteDados.deficiencia || ""}
							editable={userHasClientEditPermission}
							placeholder="Preencha aqui, se o cliente possuir alguma deficiência, a deficiência em questão. Ex: Auditiva, visual, etc..."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										deficiencia: value,
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, deficiencia: value } }));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="ESTADO CIVIL"
							value={infoHolder.clienteDados.estadoCivil}
							editable={userHasClientEditPermission}
							options={MaritalStatus}
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										estadoCivil: value,
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, estadoCivil: value } }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										estadoCivil: null,
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, estadoCivil: null } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="CANAL DE AQUISIÇÃO"
							value={infoHolder.clienteDados.canalAquisicao}
							editable={userHasClientEditPermission}
							options={CustomersAcquisitionChannels}
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										canalAquisicao: value,
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, canalAquisicao: value } }));
							}}
							onReset={() => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										canalAquisicao: "",
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, canalAquisicao: "" } }));
							}}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="NOME DO INDICADOR (SE INDICAÇÃO)"
							value={infoHolder.clienteDados.indicador.nome || ""}
							editable={userHasClientEditPermission}
							placeholder="Preencha aqui o nome do indicador..."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										indicador: { ...prev.clienteDados.indicador, nome: value },
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, "indicador.nome": value } }));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="TELEFONE DO INDICADOR (SE INDICAÇÃO)"
							value={infoHolder.clienteDados.indicador.contato || ""}
							editable={userHasClientEditPermission}
							placeholder="Preencha aqui o contato do indicador..."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										indicador: { ...prev.clienteDados.indicador, contato: formatToPhone(value) },
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, "indicador.contato": formatToPhone(value) } }));
							}}
							width="100%"
						/>
					</div>
				</div>
				<h1 className="w-full rounded-md bg-blue-500 p-1 text-center text-sm font-bold text-white">INFORMAÇÕES DE CONTATO</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<TextInput
							label="TELEFONE PRIMÁRIO (*)"
							value={infoHolder.clienteDados.telefonePrimario}
							editable={userHasClientEditPermission}
							placeholder="Preencha aqui o telefone primário do cliente."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										telefonePrimario: formatToPhone(value),
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, telefonePrimario: formatToPhone(value) } }));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="TELEFONE SECUNDÁRIO"
							value={infoHolder.clienteDados.telefoneSecundario || ""}
							editable={userHasClientEditPermission}
							placeholder="Preencha aqui o telefone secundário do cliente."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										telefoneSecundario: formatToPhone(value),
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, telefoneSecundario: formatToPhone(value) } }));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TextInput
							label="EMAIL"
							value={infoHolder.clienteDados.email || ""}
							editable={userHasClientEditPermission}
							placeholder="Preencha aqui o email do cliente."
							handleChange={(value) => {
								setInfoHolder((prev) => ({
									...prev,
									clienteDados: {
										...prev.clienteDados,
										email: value,
									},
								}));
								setChanges((prev) => ({ ...prev, client: { ...prev.client, email: value } }));
							}}
							width="100%"
						/>
					</div>
				</div>
				<h1 className="w-full rounded-md bg-blue-500 p-1 text-center text-sm font-bold text-white">INFORMAÇÕES DE ENDEREÇO</h1>
				<div className="my-1 flex w-full flex-col">
					<p className="w-full text-center text-sm font-light tracking-tighter text-gray-700">Preencha abaixo o endereço de correspondência do cliente.</p>
				</div>
				<div className="grid grid-cols-1 grid-rows-3 items-center gap-6 px-2 lg:grid-cols-3 lg:grid-rows-1">
					<TextInput
						label="CEP"
						value={infoHolder.clienteDados.cep || ""}
						editable={userHasClientEditPermission}
						placeholder="Preencha aqui o CEP do cliente."
						handleChange={(value) => {
							if (value.length == 9) {
								setAddressDataByCEP(value);
							}
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									cep: formatToCEP(value),
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, cep: formatToCEP(value) } }));
						}}
						width="100%"
					/>
					<SelectInput
						label="ESTADO"
						value={infoHolder.clienteDados.uf}
						editable={userHasClientEditPermission}
						handleChange={(value) => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									uf: value,
									cidade: stateCities[value as keyof typeof stateCities][0] as string,
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string } }));
						}}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									uf: "",
									cidade: "",
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, uf: "", cidade: "" } }));
						}}
						options={Object.keys(stateCities).map((state, index) => ({
							id: index + 1,
							label: state,
							value: state,
						}))}
						width="100%"
					/>
					<SelectInput
						label="CIDADE"
						value={infoHolder.clienteDados.cidade}
						editable={userHasClientEditPermission}
						handleChange={(value) => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									cidade: value,
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, cidade: value } }));
						}}
						options={
							infoHolder.clienteDados.uf ? stateCities[infoHolder.clienteDados.uf as keyof typeof stateCities].map((city, index) => ({ id: index + 1, value: city, label: city })) : null
						}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									cidade: "",
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, cidade: "" } }));
						}}
						width="100%"
					/>
				</div>
				<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
					<TextInput
						label="BAIRRO"
						value={infoHolder.clienteDados.bairro || ""}
						editable={userHasClientEditPermission}
						placeholder="Preencha aqui o bairro do cliente."
						handleChange={(value) => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									bairro: value,
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, bairro: value } }));
						}}
						width="100%"
					/>
					<TextInput
						label="LOGRADOURO/RUA"
						value={infoHolder.clienteDados.endereco || ""}
						editable={userHasClientEditPermission}
						placeholder="Preencha aqui o logradouro do cliente."
						handleChange={(value) => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									endereco: value,
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, endereco: value } }));
						}}
						width="100%"
					/>
				</div>
				<div className="mb-2 grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
					<TextInput
						label="NÚMERO/IDENTIFICADOR"
						value={infoHolder.clienteDados.numeroOuIdentificador || ""}
						editable={userHasClientEditPermission}
						placeholder="Preencha aqui o número ou identificador da residência do cliente."
						handleChange={(value) => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									numeroOuIdentificador: value,
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, numeroOuIdentificador: value } }));
						}}
						width="100%"
					/>
					<TextInput
						label="COMPLEMENTO"
						value={infoHolder.clienteDados.complemento || ""}
						editable={userHasClientEditPermission}
						placeholder="Preencha aqui algum complemento do endereço."
						handleChange={(value) => {
							setInfoHolder((prev) => ({
								...prev,
								clienteDados: {
									...prev.clienteDados,
									complemento: value,
								},
							}));
							setChanges((prev) => ({ ...prev, client: { ...prev.client, complemento: value } }));
						}}
						width="100%"
					/>
				</div>
			</div>
		</div>
	);
}

export default ClientBlock;
