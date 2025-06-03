import React, { useEffect, useState } from "react";
import TextInput from "../Inputs/TextInput";
import DropdownSelect from "../Inputs/DropdownSelect";
import { stateCities } from "@/utils/estados_cidades";
import { VscChromeClose } from "react-icons/vsc";
import { Funnel, IClient, IRepresentative, IUsuario } from "@/utils/models";
import { formatToCEP, formatToCPForCNPJ, formatToPhone } from "@/utils/methods";
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { funnels, projectTypes } from "@/utils/constants";
import { useSession } from "next-auth/react";
import SelectInput from "../Inputs/SelectInput";

type EditClientSimplifiedModalProps = {
	client: IClient;
	representatives: IRepresentative[] | null;
	closeModal: () => void;
	projectId: string;
	editPermission: boolean;
	responsibleId: string;
};

type Funil = {
	id: number;
	etapaId: number;
};

type NewProjectInfo = {
	isOpen: boolean;
	nome?: string;
	tipoProjeto?: (typeof projectTypes)[number]["value"];
	descricao?: string;
	funis: [] | Funil[];
};

function getCurrentActiveFunnelOptions(funnelId: number, funnels: Funnel[]) {
	let funnel = funnels.filter((funnel) => funnel.id == funnelId)[0];
	return funnel.etapas.map((stage) => {
		return {
			id: stage.id,
			label: stage.nome,
			value: stage.id,
		};
	});
}
function EditClientSimplified({ client, representatives, closeModal, projectId, editPermission, responsibleId }: EditClientSimplifiedModalProps) {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [clientInfo, setClientInfo] = useState(client);

	const { mutate } = useMutation({
		mutationKey: ["editClient"],
		mutationFn: async () => {
			try {
				const { data } = await axios.put(`/api/clients?id=${clientInfo._id}&projectId=${projectId}`, {
					changes: clientInfo,
				});
				// queryClient.invalidateQueries({ queryKey: ["clients"] });
				queryClient.invalidateQueries({ queryKey: ["project-by-id", projectId] });
				if (data.message) toast.success(data.message);
			} catch (error) {
				if (error instanceof AxiosError) {
					let errorMsg = error.response?.data.error.message;
					toast.error(errorMsg);
					return;
				}
				if (error instanceof Error) {
					let errorMsg = error.message;
					toast.error(errorMsg);
					return;
				}
			}
		},
	});

	useEffect(() => {
		setClientInfo(client);
	}, [client]);

	return (
		<div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[70%] w-[60%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR CLIENTE</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>

					<div className="flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto border-b border-gray-200 py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="NOME"
								value={clientInfo.nome}
								editable={editPermission}
								placeholder="Preencha aqui o nome do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, nome: value }))}
								width="100%"
							/>
							<TextInput
								label="CPF/CNPJ"
								value={clientInfo.cpfCnpj ? clientInfo.cpfCnpj : ""}
								editable={editPermission}
								placeholder="Preencha aqui o CPF ou CNPJ do cliente."
								handleChange={(value) =>
									setClientInfo((prev) => ({
										...prev,
										cpfCnpj: formatToCPForCNPJ(value),
									}))
								}
								width="100%"
							/>
						</div>
						<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="TELEFONE PRIMÁRIO"
								value={clientInfo.telefonePrimario}
								editable={editPermission}
								placeholder="Preencha aqui o telefone primário do cliente."
								handleChange={(value) =>
									setClientInfo((prev) => ({
										...prev,
										telefonePrimario: formatToPhone(value),
									}))
								}
								width="100%"
							/>

							<TextInput
								label="TELEFONE SECUNDÁRIO"
								value={clientInfo.telefoneSecundario ? clientInfo.telefoneSecundario : ""}
								editable={editPermission}
								placeholder="Preencha aqui o telefone secundário do cliente."
								handleChange={(value) =>
									setClientInfo((prev) => ({
										...prev,
										telefoneSecundario: formatToPhone(value),
									}))
								}
								width="100%"
							/>
						</div>
						<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="EMAIL"
								value={clientInfo.email ? clientInfo.email : ""}
								editable={editPermission}
								placeholder="Preencha aqui o email do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, email: value }))}
								width="100%"
							/>

							<TextInput
								label="CEP"
								value={clientInfo.cep ? clientInfo.cep : ""}
								editable={editPermission}
								placeholder="Preencha aqui o CEP do cliente."
								handleChange={(value) =>
									setClientInfo((prev) => ({
										...prev,
										cep: formatToCEP(value),
									}))
								}
								width="100%"
							/>
						</div>
						<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<DropdownSelect
								resetOptionLabel="ESTADO"
								categoryName="ESTADO"
								value={clientInfo.uf ? Object.keys(stateCities).indexOf(clientInfo.uf) + 1 : null}
								editable={editPermission}
								options={Object.keys(stateCities).map((state, index) => ({
									id: index + 1,
									label: state,
									value: state,
								}))}
								onChange={(selectedItem) => {
									const value = selectedItem.value as keyof typeof stateCities;
									setClientInfo({ ...clientInfo, uf: value });
								}}
								onReset={() => {
									setClientInfo((prev) => ({
										...prev,
										uf: null,
										cidade: null,
									}));
								}}
								width="100%"
							/>
							<DropdownSelect
								resetOptionLabel="CIDADE"
								categoryName="CIDADE"
								value={clientInfo.cidade && clientInfo.uf ? stateCities[clientInfo.uf].indexOf(clientInfo.cidade) : null}
								editable={editPermission}
								options={
									clientInfo.uf
										? stateCities[clientInfo.uf].map((city, index) => {
												return {
													id: index,
													value: city,
													label: city,
												};
											})
										: null
								}
								onChange={(selectedItem) =>
									setClientInfo((prev) => ({
										...prev,
										cidade: selectedItem.value,
									}))
								}
								width="100%"
								onReset={() => {
									setClientInfo((prev) => ({ ...prev, cidade: "" }));
								}}
							/>
						</div>
						<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="BAIRRO"
								value={clientInfo.bairro ? clientInfo.bairro : ""}
								editable={editPermission}
								placeholder="Preencha aqui o bairro do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, bairro: value }))}
								width="100%"
							/>
							<TextInput
								label="LOGRADOURO/RUA"
								value={clientInfo.endereco ? clientInfo.endereco : ""}
								editable={editPermission}
								placeholder="Preencha aqui o logradouro do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, endereco: value }))}
								width="100%"
							/>
						</div>
						<div className="mb-2 grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="NÚMERO/IDENTIFICADOR"
								value={clientInfo.numeroOuIdentificador ? clientInfo.numeroOuIdentificador : ""}
								editable={editPermission}
								placeholder="Preencha aqui o número ou identificador da residência do cliente."
								handleChange={(value) =>
									setClientInfo((prev) => ({
										...prev,
										numeroOuIdentificador: value,
									}))
								}
								width="100%"
							/>
							<TextInput
								label="COMPLEMENTO"
								value={clientInfo.complemento ? clientInfo.complemento : ""}
								editable={editPermission}
								placeholder="Preencha aqui algum complemento do endereço."
								handleChange={(value) =>
									setClientInfo((prev) => ({
										...prev,
										complemento: value,
									}))
								}
								width="100%"
							/>
						</div>
						<div className="flex w-full items-center justify-center">
							<TextInput
								label="INDICADOR"
								value={clientInfo.indicador ? clientInfo.indicador : ""}
								placeholder="Digite aqui o nome do indicador..."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, indicador: value }))}
								width="50%"
							/>
						</div>
					</div>
					{editPermission ? (
						<div className="my-2 flex w-full items-center justify-end px-4">
							<button onClick={() => mutate()} className="font-medium text-[#15599a] duration-300 ease-in-out hover:scale-110">
								SALVAR
							</button>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default EditClientSimplified;
