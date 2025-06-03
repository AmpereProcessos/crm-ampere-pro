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

type EditClientModalProps = {
	user: {
		id: string;
		nome: string;
	};
	client: IClient;
	representatives: IRepresentative[] | null;
	updateInfo?: any;
	closeModal: () => void;
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
function EditClient({ user, client, representatives, closeModal, updateInfo }: EditClientModalProps) {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [clientInfo, setClientInfo] = useState({
		representante: null,
		nome: "",
		cpfCnpj: "",
		telefonePrimario: "",
		telefoneSecundario: "",
		email: "",
		cep: "",
		bairro: "",
		endereco: "",
		numeroOuIdentificador: "",
		complemento: "",
		uf: null,
		cidade: "",
	});
	const [newProject, setNewProject] = useState<NewProjectInfo>({
		isOpen: false,
		nome: undefined,
		tipoProjeto: undefined,
		descricao: undefined,
		funis: [],
	});

	const { mutate } = useMutation({
		mutationKey: ["editClient"],
		mutationFn: async () => {
			try {
				const { data } = await axios.put(`/api/clients?id=${clientInfo._id}`, {
					changes: clientInfo,
				});
				queryClient.invalidateQueries({ queryKey: ["clients"] });
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
	const { mutate: addProject } = useMutation({
		mutationKey: ["addProject"],
		mutationFn: async () => {
			let insertObj = {
				nome: newProject.nome,
				responsavel: user,
				representante: client.representante,
				tipoProjeto: newProject.tipoProjeto,
				clienteId: client._id,
				descricao: newProject.descricao,
				funis: newProject.funis,
			};
			try {
				const { data } = await axios.post("/api/projects", insertObj);
				if (data.message) toast.success(data.message);
				setNewProject({
					isOpen: false,
					nome: undefined,
					descricao: undefined,
					funis: [],
				});
				// queryClient.invalidateQueries({ queryKey: ["clients"] });
				if (updateInfo) updateInfo();
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
			<div className="fixed left-[50%] top-[50%] z-[100] h-[93%] w-[93%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR CLIENTE</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>

					<div className="flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto border-b border-gray-200 py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<div className="flex flex-col border-b border-[#15599a] px-2 pb-4 pt-2">
							{newProject.isOpen ? (
								<div className="flex w-full flex-col gap-2">
									<div className="flex w-full items-center justify-end">
										<button
											onClick={() =>
												setNewProject((prev) => ({
													isOpen: false,
													nome: "",
													descricao: "",
													funis: [],
												}))
											}
											className="font-medium text-red-500"
										>
											FECHAR
										</button>
									</div>
									<div className="flex w-full flex-col gap-1">
										<p className="font-Raleway font-bold text-gray-800">NOME</p>
										<input
											type={"text"}
											value={newProject.nome}
											onChange={(e) =>
												setNewProject((prev) => ({
													...prev,
													nome: e.target.value,
												}))
											}
											placeholder="Digite o nome para identificação do projeto."
											className="w-full rounded-sm border border-gray-300 p-2 text-center text-sm text-gray-600 outline-none focus:border-blue-300 focus:ring focus:ring-[1]"
										/>
									</div>
									<div className="flex w-full flex-col gap-1">
										<SelectInput
											label="TIPO DO PROJETO"
											value={newProject.tipoProjeto}
											options={projectTypes.map((projectType, index) => {
												return { id: index + 1, ...projectType };
											})}
											handleChange={(value) => {
												setNewProject((prev) => ({
													...prev,
													tipoProjeto: value,
												}));
											}}
											resetOptionLabel="NÃO DEFINIDO"
											onReset={() =>
												setNewProject((prev) => ({
													...prev,
													tipoProjeto: "SISTEMA FOTOVOLTAICO",
												}))
											}
											width="100%"
										/>
									</div>
									<div className="flex w-full flex-col gap-1">
										<p className="font-Raleway font-bold text-gray-800">DESCRIÇÃO</p>
										<textarea
											value={newProject.descricao}
											onChange={(e) =>
												setNewProject((prev) => ({
													...prev,
													descricao: e.target.value,
												}))
											}
											placeholder="Descreva aqui peculiaridades do cliente, da negociação, ou outras informações relevantes acerca desse cliente."
											className="w-full resize-none rounded-sm border border-gray-300 p-2 text-center text-sm text-gray-600 outline-none focus:border-blue-300 focus:ring focus:ring-[1]"
										/>
									</div>
									<div className="flex w-full items-center gap-1">
										<div className="w-[50%]">
											<DropdownSelect
												categoryName="FUNIL"
												resetOptionLabel="FUNIL NÃO DEFINIDO"
												options={funnels.map((funnel) => {
													return {
														id: funnel.id,
														label: funnel.nome,
														value: funnel.id,
													};
												})}
												value={newProject.funis[0] ? newProject.funis[0].id : null}
												onChange={(selected) =>
													setNewProject((prev) => ({
														...prev,
														funis: [{ id: selected.value, etapaId: 1 }],
													}))
												}
												onReset={() => setNewProject((prev) => ({ ...prev, funis: [] }))}
												width="100%"
											/>
										</div>
										<div className="w-[50%]">
											<DropdownSelect
												categoryName="ETAPA"
												resetOptionLabel="ETAPA NÃO DEFINIDA"
												options={newProject.funis[0]?.id ? getCurrentActiveFunnelOptions(newProject.funis[0].id, funnels) : null}
												value={newProject.funis[0]?.id ? newProject.funis[0].etapaId : null}
												onChange={(selected) =>
													setNewProject((prev) => ({
														...prev,
														funis: [{ id: prev.funis[0].id, etapaId: selected.value }],
													}))
												}
												onReset={() => setNewProject((prev) => ({ ...prev, funis: [] }))}
												width="100%"
											/>
										</div>
									</div>
									<div className="flex w-full items-center justify-end">
										<button onClick={() => addProject()} className="font-Poppins font-bold text-green-500 duration-300 ease-in hover:scale-105">
											ADICIONAR PROJETO
										</button>
									</div>
								</div>
							) : (
								<>
									{clientInfo.projetos?.length && clientInfo.projetos.length > 0 ? (
										<div className="flex w-full flex-col">
											<h1 className="mb-2 font-bold text-[#15599a]">PROJETO VINCULADOS</h1>
											<div className="flex w-full items-center rounded-tl-md rounded-tr-md bg-black p-1 text-white">
												<div className="w-[30%] text-center">NOME</div>
												<div className="w-[25%] text-center">RESPONSÁVEL</div>
												<div className="w-[25%] text-center">REPRESENTANTE</div>
												<div className="w-[20%] text-center">CRIAÇÃO</div>
											</div>
											{clientInfo.projetos.map((projeto, index) => (
												<div key={index} className="flex w-full items-center">
													<div className="w-[30%] py-1 text-center">{projeto.nome}</div>
													<div className="w-[25%] py-1 text-center">{projeto.responsavel.nome}</div>
													<div className="w-[25%] py-1 text-center">{projeto.representante.nome}</div>
													<div className="w-[20%] py-1 text-center">{projeto.dataInsercao ? new Date(projeto.dataInsercao).toLocaleDateString() : "-"}</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-center text-sm italic text-gray-500">Sem projetos vinculados...</p>
									)}
									{session?.user.permissoes.projetos.serResponsavel ? (
										<button onClick={() => setNewProject((prev) => ({ ...prev, isOpen: true }))} className="mt-4 justify-self-end bg-transparent font-Poppins font-bold text-green-500">
											NOVO PROJETO
										</button>
									) : null}
								</>
							)}
						</div>
						<div className="grid grid-cols-1 px-2">
							<div className="flex w-full flex-col gap-1">
								<label htmlFor="representante" className="font-sans font-bold  text-[#353432]">
									REPRESENTANTE
								</label>
								<DropdownSelect
									resetOptionLabel="A SELECIONAR"
									categoryName="REPRESENTANTE"
									value={clientInfo.representante ? clientInfo.representante.id : null}
									editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
									options={
										representatives
											? representatives.map((representative) => {
													return {
														id: representative.id,
														value: representative,
														label: representative.nome,
													};
												})
											: null
									}
									onChange={(selectedItem) =>
										setClientInfo((prev) => ({
											...prev,
											representante: selectedItem.value,
										}))
									}
									onReset={() =>
										setClientInfo((prev) => ({
											...prev,
											representante: null,
										}))
									}
									width="%100"
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="NOME"
								value={clientInfo.nome}
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
								placeholder="Preencha aqui o nome do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, nome: value }))}
								width="100%"
							/>
							<TextInput
								label="CPF/CNPJ"
								value={clientInfo.cpfCnpj ? clientInfo.cpfCnpj : ""}
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
								placeholder="Preencha aqui o email do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, email: value }))}
								width="100%"
							/>

							<TextInput
								label="CEP"
								value={clientInfo.cep ? clientInfo.cep : ""}
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
								placeholder="Preencha aqui o bairro do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, bairro: value }))}
								width="100%"
							/>
							<TextInput
								label="LOGRADOURO/RUA"
								value={clientInfo.endereco ? clientInfo.endereco : ""}
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
								placeholder="Preencha aqui o logradouro do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, endereco: value }))}
								width="100%"
							/>
						</div>
						<div className="mb-2 grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="NÚMERO/IDENTIFICADOR"
								value={clientInfo.numeroOuIdentificador ? clientInfo.numeroOuIdentificador : ""}
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
								editable={session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar}
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
					</div>
					{session?.user.id == clientInfo.representante?.id || session?.user.permissoes.clientes.editar ? (
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

export default EditClient;
