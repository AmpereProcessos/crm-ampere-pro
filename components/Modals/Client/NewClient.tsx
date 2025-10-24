import DateInput from "@/components/Inputs/DateInput";
import SelectInput from "@/components/Inputs/SelectInput";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { formatDateForInputValue, formatPhoneAsBase, formatToCEP, formatToCPForCNPJ, formatToPhone, getCEPInfo } from "@/utils/methods";
import { createClient } from "@/utils/mutations/clients";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useAcquisitionChannels } from "@/utils/queries/utils";
import type { TClient } from "@/utils/schemas/client.schema";
import { MaritalStatus } from "@/utils/select-options";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { VscChromeClose } from "react-icons/vsc";
import { stateCities } from "../../../utils/estados_cidades";
import TextInput from "../../Inputs/TextInput";

type NewClientModalProps = {
	session: TUserSession;
	partnerId: string;
	closeModal: () => void;
};

function NewClient({ session, partnerId, closeModal }: NewClientModalProps) {
	const queryClient = useQueryClient();

	const { data: acquisitionChannels } = useAcquisitionChannels();
	const [clientInfo, setClientInfo] = useState<TClient>({
		nome: "",
		idParceiro: partnerId,
		cpfCnpj: "",
		telefonePrimario: "",
		telefoneSecundario: null,
		email: "",
		cep: "",
		uf: "",
		cidade: "",
		bairro: "",
		endereco: "",
		numeroOuIdentificador: "",
		complemento: "",
		dataNascimento: null,
		profissao: null,
		estadoCivil: null,
		canalAquisicao: "",
		idMarketing: null,
		indicador: {
			nome: "",
			contato: "",
		},
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
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
				setClientInfo((prev) => ({
					...prev,
					endereco: addressInfo.logradouro,
					bairro: addressInfo.bairro,
					uf: addressInfo.uf as keyof typeof stateCities,
					cidade: addressInfo.localidade.toUpperCase(),
				}));
			}
		}, 1000);
	}

	function resetClient() {
		setClientInfo({
			nome: "",
			idParceiro: partnerId,
			cpfCnpj: "",

			telefonePrimario: "",
			telefoneSecundario: null,
			email: "",
			cep: "",
			uf: "",
			cidade: "",
			bairro: "",
			endereco: "",
			numeroOuIdentificador: "",
			complemento: "",
			dataNascimento: null,
			profissao: null,
			estadoCivil: null,
			canalAquisicao: "",
			idMarketing: null,
			indicador: {
				nome: "",
				contato: "",
			},
			autor: {
				id: session.user.id,
				nome: session.user.nome,
				avatar_url: session.user.avatar_url,
			},
			dataInsercao: new Date().toISOString(),
		});
	}
	const { mutate: handleCreateClient, isPending } = useMutationWithFeedback({
		mutationKey: ["create-client"],
		mutationFn: createClient,
		queryClient: queryClient,
		affectedQueryKey: ["clients"],
		callbackFn: () => resetClient(),
	});
	return (
		<div id="newClient" className="fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-100 h-[80%] w-[93%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-primary  ">NOVO CLIENTE</h3>
						<button
							onClick={closeModal}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto border-b border-primary/30 py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
						<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">INFORMAÇÕES PESSOAIS</h1>
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-1/2">
								<TextInput
									label="NOME (*)"
									value={clientInfo.nome}
									placeholder="Preencha aqui o nome do cliente."
									handleChange={(value) => setClientInfo((prev) => ({ ...prev, nome: value }))}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/2">
								<TextInput
									label="CPF/CNPJ"
									value={clientInfo.cpfCnpj || ""}
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
						</div>
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-1/3">
								<DateInput
									label={"DATA DE NASCIMENTO"}
									editable={true}
									value={clientInfo.dataNascimento ? formatDateForInputValue(clientInfo.dataNascimento) : undefined}
									handleChange={(value) =>
										setClientInfo((prev) => ({
											...prev,
											dataNascimento: formatDateOnInputChange(value, "string") as string,
										}))
									}
									width={"100%"}
								/>
							</div>
							<div className="w-full lg:w-1/3">
								<TextInput
									label="PROFISSÃO"
									value={clientInfo.profissao || ""}
									placeholder="Preencha aqui a profissão do cliente."
									handleChange={(value) =>
										setClientInfo((prev) => ({
											...prev,
											profissao: value,
										}))
									}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/3">
								<SelectInput
									label="ESTADO CIVIL"
									value={clientInfo.estadoCivil}
									options={MaritalStatus}
									handleChange={(value) =>
										setClientInfo((prev) => ({
											...prev,
											estadoCivil: value,
										}))
									}
									onReset={() =>
										setClientInfo((prev) => ({
											...prev,
											estadoCivil: null,
										}))
									}
									resetOptionLabel="NÃO DEFINIDO"
									width="100%"
								/>
							</div>
						</div>
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-1/3">
								<SelectInput
									label="CANAL DE AQUISIÇÃO"
									value={clientInfo.canalAquisicao}
									options={
										acquisitionChannels?.map((c) => ({
											id: c._id,
											label: c.valor,
											value: c.valor,
										})) || []
									}
									handleChange={(value) =>
										setClientInfo((prev) => ({
											...prev,
											canalAquisicao: value,
										}))
									}
									onReset={() =>
										setClientInfo((prev) => ({
											...prev,
											canalAquisicao: "",
										}))
									}
									resetOptionLabel="NÃO DEFINIDO"
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/3">
								<TextInput
									label="NOME DO INDICADOR (SE INDICAÇÃO)"
									value={clientInfo.indicador.nome || ""}
									placeholder="Preencha aqui o nome do indicador..."
									handleChange={(value) =>
										setClientInfo((prev) => ({
											...prev,
											indicador: { ...prev.indicador, nome: value },
										}))
									}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/3">
								<TextInput
									label="TELEFONE DO INDICADOR (SE INDICAÇÃO)"
									value={clientInfo.indicador.contato || ""}
									placeholder="Preencha aqui o contato do indicador..."
									handleChange={(value) =>
										setClientInfo((prev) => ({
											...prev,
											indicador: {
												...prev.indicador,
												contato: formatToPhone(value),
											},
										}))
									}
									width="100%"
								/>
							</div>
						</div>
						<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">INFORMAÇÕES DE CONTATO</h1>
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-1/3">
								<TextInput
									label="TELEFONE PRIMÁRIO (*)"
									value={clientInfo.telefonePrimario}
									placeholder="Preencha aqui o telefone primário do cliente."
									handleChange={(value) =>
										setClientInfo((prev) => ({
											...prev,
											telefonePrimario: formatToPhone(value),
											telefonePrimarioBase: formatPhoneAsBase(value),
										}))
									}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/3">
								<TextInput
									label="TELEFONE SECUNDÁRIO"
									value={clientInfo.telefoneSecundario || ""}
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
							<div className="w-full lg:w-1/3">
								<TextInput
									label="EMAIL"
									value={clientInfo.email || ""}
									placeholder="Preencha aqui o email do cliente."
									handleChange={(value) => setClientInfo((prev) => ({ ...prev, email: value }))}
									width="100%"
								/>
							</div>
						</div>
						<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">INFORMAÇÕES DE ENDEREÇO</h1>
						<div className="grid grid-cols-1 grid-rows-3 items-center gap-6 px-2 lg:grid-cols-3 lg:grid-rows-1">
							<TextInput
								label="CEP"
								value={clientInfo.cep || ""}
								placeholder="Preencha aqui o CEP do cliente."
								handleChange={(value) => {
									if (value.length === 9) {
										setAddressDataByCEP(value);
									}
									setClientInfo((prev) => ({
										...prev,
										cep: formatToCEP(value),
									}));
								}}
								width="100%"
							/>
							<SelectInput
								label="ESTADO"
								value={clientInfo.uf}
								handleChange={(value) =>
									setClientInfo((prev) => ({
										...prev,
										uf: value,
										cidade: stateCities[value as keyof typeof stateCities][0] as string,
									}))
								}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => setClientInfo((prev) => ({ ...prev, uf: "", cidade: "" }))}
								options={Object.keys(stateCities).map((state, index) => ({
									id: index + 1,
									label: state,
									value: state,
								}))}
								width="100%"
							/>
							<SelectInput
								label="CIDADE"
								value={clientInfo.cidade}
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, cidade: value }))}
								options={
									clientInfo.uf
										? stateCities[clientInfo.uf as keyof typeof stateCities].map((city, index) => ({
												id: index + 1,
												value: city,
												label: city,
											}))
										: null
								}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => setClientInfo((prev) => ({ ...prev, cidade: "" }))}
								width="100%"
							/>
						</div>
						<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="BAIRRO"
								value={clientInfo.bairro || ""}
								placeholder="Preencha aqui o bairro do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, bairro: value }))}
								width="100%"
							/>
							<TextInput
								label="LOGRADOURO/RUA"
								value={clientInfo.endereco || ""}
								placeholder="Preencha aqui o logradouro do cliente."
								handleChange={(value) => setClientInfo((prev) => ({ ...prev, endereco: value }))}
								width="100%"
							/>
						</div>
						<div className="mb-2 grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
							<TextInput
								label="NÚMERO/IDENTIFICADOR"
								value={clientInfo.numeroOuIdentificador || ""}
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
								value={clientInfo.complemento || ""}
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
					<div className="my-2 flex w-full items-center justify-end px-4">
						<button
							type="button"
							disabled={isPending}
							// @ts-ignore
							onClick={() => handleCreateClient({ info: clientInfo })}
							className="rounded bg-green-500 px-4 py-1 text-sm font-medium text-primary-foreground duration-300 ease-in-out disabled:bg-primary/50 disabled:text-primary enabled:hover:bg-green-700"
						>
							CRIAR
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewClient;
