import CheckboxInput from "@/components/Inputs/CheckboxInput";
import DateInput from "@/components/Inputs/DateInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { getInverterPeakPowerByProducts, getInverterQty, getModulesPeakPotByProducts, getModulesQty } from "@/lib/methods/extracting";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import { structureTypes } from "@/utils/constants";

import { stateCities } from "@/utils/estados_cidades";
import { formatDateForInput, formatToCEP, formatToCPForCNPJ, formatToMoney, formatToPhone, getPeakPotByModules } from "@/utils/methods";

import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { getOeMPrices } from "@/utils/pricing/oem/methods";
import { useCreditors } from "@/utils/queries/utils";
import { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import { TProposalDTOWithOpportunity } from "@/utils/schemas/proposal.schema";

import { CustomersAcquisitionChannels } from "@/utils/select-options";

import { useQueryClient } from "@tanstack/react-query";

import React, { useState } from "react";

import { AiFillCloseCircle, AiOutlineSafety } from "react-icons/ai";
import { BsBookmarksFill, BsPatchCheckFill } from "react-icons/bs";
import { FaIndustry, FaSolarPanel } from "react-icons/fa";
import { ImAttachment, ImPower, ImPriceTag } from "react-icons/im";
import { MdAttachFile, MdAttachMoney, MdOutlineMiscellaneousServices } from "react-icons/md";
import { TbTopologyFull, TbTopologyFullHierarchy } from "react-icons/tb";
type ReviewInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	modulesQty: number;
	distance: number;
	activePlanId?: number;
	projectId?: string;
	proposeInfo: TProposalDTOWithOpportunity;
	documentsFile: { [key: string]: File | string | null };
	handleRequestContract: () => void;
};
function ReviewInfo({ requestInfo, setRequestInfo, modulesQty, distance, activePlanId, projectId, proposeInfo, documentsFile, handleRequestContract }: ReviewInfoProps) {
	const [pricing, setPricing] = useState(getOeMPrices({ modulesQty, distance }));
	const queryClient = useQueryClient();

	const { data: creditors } = useCreditors();

	const { mutate, isPending, isSuccess } = useMutationWithFeedback({
		queryClient: queryClient,
		mutationKey: ["create-ufv-contract-request"],
		mutationFn: handleRequestContract,
		affectedQueryKey: ["propose", proposeInfo?._id],
	});

	function requestContract() {
		const proposeId = proposeInfo?._id || "";
		const projectResponsibleId = proposeInfo?.oportunidadeDados?.responsaveis.find((r) => r.papel == "VENDEDOR")?.id;
		const kitCost = proposeInfo?.precificacao?.find((c) => c.descricao.includes("KIT"))?.custoFinal;
		const opportunityId = proposeInfo?.oportunidadeDados?.idMarketing;
		const clientEmail = requestInfo.email;
		// @ts-ignore
		mutate({
			requestInfo,
			projectId,
			proposeId,
			projectResponsibleId,
			kitCost,
			opportunityId,
			clientEmail,
		});
	}
	return (
		<div className="flex w-full grow flex-col bg-[#fff] pb-2">
			<span className="py-2 text-center text-xl font-bold uppercase text-green-500">REVISÃO DAS INFORMAÇÕES</span>
			<div className="flex w-full grow flex-col">
				<div className="flex w-full flex-col  bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS PARA CONTRATO</span>
					<div className="flex flex-col flex-wrap justify-around gap-2 p-2 lg:grid lg:grid-cols-3">
						<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE O CLIENTE</h1>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"NOME/RAZÃO SOCIAL"}
								placeholder="Digite o nome do contrato."
								value={requestInfo.nomeDoContrato}
								editable={true}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										nomeDoContrato: value.toUpperCase(),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"TELEFONE"}
								editable={true}
								placeholder="Digite aqui o telefone do cliente."
								value={requestInfo.telefone}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										telefone: formatToPhone(value),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"CPF/CNPJ"}
								editable={true}
								value={requestInfo.cpf_cnpj}
								placeholder="Digite aqui o CPF ou CNPJ para o contrato."
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										cpf_cnpj: formatToCPForCNPJ(value),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"RG"}
								editable={true}
								placeholder="Digite aqui o RG do cliente."
								value={requestInfo.rg}
								handleChange={(value) => setRequestInfo({ ...requestInfo, rg: value })}
							/>
						</div>
						<div className="flex items-center justify-center">
							<DateInput
								width={"450px"}
								label={"DATA DE NASCIMENTO"}
								editable={true}
								value={requestInfo.dataDeNascimento ? formatDateForInput(requestInfo.dataDeNascimento) : undefined}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										dataDeNascimento: value,
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								width={"450px"}
								label={"ESTADO CIVIL"}
								options={[
									{
										id: 1,
										label: "CASADO(A)",
										value: "CASADO(A)",
									},
									{
										id: 2,
										label: "SOLTEIRO(A)",
										value: "SOLTEIRO(A)",
									},
									{
										id: 3,
										label: "UNIÃO ESTÁVEL",
										value: "UNIÃO ESTÁVEL",
									},
									{
										id: 4,
										label: "DIVORCIADO(A)",
										value: "DIVORCIADO(A)",
									},
									{
										id: 5,
										label: "VIUVO(A)",
										value: "VIUVO(A)",
									},
									{
										id: 6,
										label: "NÃO DEFINIDO",
										value: "NÃO DEFINIDO",
									},
								]}
								editable={true}
								value={requestInfo.estadoCivil}
								handleChange={(value) => setRequestInfo({ ...requestInfo, estadoCivil: value })}
								onReset={() => {
									setRequestInfo((prev) => ({
										...prev,
										estadoCivil: undefined,
									}));
								}}
								resetOptionLabel="NÃO DEFINIDO"
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"EMAIL"}
								editable={true}
								placeholder="Preencha aqui o email do cliente."
								value={requestInfo.email}
								handleChange={(value) => setRequestInfo({ ...requestInfo, email: value })}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"PROFISSÃO"}
								editable={true}
								placeholder="Preencha aqui a profissão do cliente."
								value={requestInfo.profissao}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										profissao: value.toUpperCase(),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"ONDE TRABALHA"}
								placeholder="Preencha aqui onde o cliente trabalha."
								editable={true}
								value={requestInfo.ondeTrabalha}
								handleChange={(value) => setRequestInfo({ ...requestInfo, ondeTrabalha: value })}
							/>
						</div>
						{requestInfo.tipoDeServico != "SISTEMA FOTOVOLTAICO" && (
							<div className="col-span-3 flex items-center justify-center">
								<SelectInput
									label={"TIPO DO CLIENTE"}
									width={"450px"}
									editable={true}
									value={requestInfo.tipoDoTitular}
									handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDoTitular: value })}
									options={[
										{
											id: 1,
											label: "PESSOA FISICA",
											value: "PESSOA FISICA",
										},
										{
											id: 2,
											label: "PESSOA JURIDICA",
											value: "PESSOA JURIDICA",
										},
									]}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => {
										setRequestInfo((prev) => ({
											...prev,
											tipoDoTitular: null,
										}));
									}}
								/>
							</div>
						)}
						<div className="col-span-3 flex items-center justify-center gap-2">
							<SelectInput
								width={"450px"}
								label={"POSSUI ALGUMA DEFICIÊNCIA"}
								editable={true}
								value={requestInfo.possuiDeficiencia}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										possuiDeficiencia: value,
									})
								}
								options={[
									{
										id: 1,
										label: "SIM",
										value: "SIM",
									},
									{
										id: 2,
										label: "NÃO",
										value: "NÃO",
									},
								]}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										possuiDeficiencia: "NÃO",
									}))
								}
							/>
							{requestInfo.possuiDeficiencia == "SIM" && (
								<>
									<TextInput
										width={"450px"}
										label={"SE SIM, QUAL ?"}
										editable={true}
										placeholder="Preencha aqui a deficiência do cliente em questão."
										value={requestInfo.qualDeficiencia}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												qualDeficiencia: value,
											})
										}
									/>
								</>
							)}
						</div>
						<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">ENDEREÇO</h1>
						<div className="flex flex-wrap items-center justify-center gap-2">
							<TextInput
								width={"450px"}
								label={"CEP"}
								editable={true}
								placeholder="Preencha aqui o CEP do cliente."
								value={requestInfo.cep}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										cep: formatToCEP(value),
									})
								}
							/>
							{/* <button
                    // onClick={() => findCPF("enderecoCobranca")}
                    className="flex h-[30px] items-center rounded bg-[#fead61] p-1"
                  >
                    <AiOutlineSearch />
                  </button> */}
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								width={"450px"}
								label={"CIDADE"}
								editable={true}
								value={requestInfo.cidade}
								options={
									requestInfo.uf
										? stateCities[requestInfo.uf as keyof typeof stateCities].map((city, index) => {
												return {
													id: index,
													value: city,
													label: city,
												};
											})
										: null
								}
								handleChange={(value) => setRequestInfo({ ...requestInfo, cidade: value })}
								onReset={() => {
									setRequestInfo((prev) => ({
										...prev,
										cidade: undefined,
									}));
								}}
								resetOptionLabel="NÃO DEFINIDO"
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								width={"450px"}
								label={"UF"}
								editable={true}
								options={Object.keys(stateCities).map((state, index) => ({
									id: index + 1,
									label: state,
									value: state,
								}))}
								value={requestInfo.uf}
								handleChange={(value) => setRequestInfo({ ...requestInfo, uf: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({ ...prev, uf: null }));
								}}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"ENDEREÇO DE COBRANÇA"}
								placeholder="Preencha aqui o endereço de cobrança (correspondências) do cliente."
								editable={true}
								value={requestInfo.enderecoCobranca}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										enderecoCobranca: value.toUpperCase(),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"Nº"}
								placeholder="Preencha aqui o número/identificador do endereço de cobrança (correspondências) do cliente."
								value={requestInfo.numeroResCobranca}
								editable={true}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										numeroResCobranca: value,
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"BAIRRO"}
								editable={true}
								placeholder="Preencha aqui o bairro do cliente."
								value={requestInfo.bairro}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										bairro: value.toUpperCase(),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								width={"450px"}
								label={"PONTO DE REFERÊNCIA"}
								placeholder="Preencha aqui o nome de um ponto de referência para o endereço do cliente."
								editable={true}
								value={requestInfo.pontoDeReferencia}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										pontoDeReferencia: value,
									})
								}
							/>
						</div>
						<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">CONTRATO/VENDA</h1>
						<div className="flex items-center justify-center">
							<SelectInput
								width={"450px"}
								label={"SEGMENTO"}
								value={requestInfo.segmento}
								editable={true}
								options={[
									{ id: 1, label: "RESIDENCIAL", value: "RESIDENCIAL" },
									{ id: 2, label: "COMERCIAL", value: "COMERCIAL" },
									{ id: 3, label: "RURAL", value: "RURAL" },
									{ id: 4, label: "INDUSTRIAL", value: "INDUSTRIAL" },
								]}
								handleChange={(value) => setRequestInfo({ ...requestInfo, segmento: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({
										...prev,
										segmento: undefined,
									}));
								}}
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								width={"450px"}
								label={"FORMA DE ASSINATURA"}
								editable={true}
								value={requestInfo.formaAssinatura}
								options={[
									{ id: 1, label: "FISICA", value: "FISICA" },
									{ id: 2, label: "DIGITAL", value: "DIGITAL" },
								]}
								handleChange={(value) => setRequestInfo({ ...requestInfo, formaAssinatura: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({
										...prev,
										formaAssinatura: undefined,
									}));
								}}
							/>
						</div>
						<div className="flex w-full items-center justify-center">
							<SelectInput
								label={"CANAL DE VENDA"}
								editable={true}
								value={requestInfo.canalVenda}
								handleChange={(value) => setRequestInfo({ ...requestInfo, canalVenda: value })}
								options={CustomersAcquisitionChannels.map((value) => value)}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({
										...prev,
										canalVenda: null,
									}));
								}}
							/>
						</div>
						{requestInfo.canalVenda == "INDICAÇÃO DE AMIGO" && (
							<div className="col-span-3 flex w-full flex-wrap items-center justify-center gap-2">
								<div className="flex  grow items-center justify-center">
									<TextInput
										width="100%"
										label={"NOME INDICADOR"}
										editable={true}
										placeholder="Preencha aqui o nomo do indicador"
										value={requestInfo.nomeIndicador}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												nomeIndicador: value.toUpperCase(),
											})
										}
									/>
								</div>
								<div className="flex grow items-center justify-center">
									<TextInput
										width="100%"
										label={"TELEFONE INDICADOR"}
										editable={true}
										placeholder="Preencha aqui o contato do indicador."
										value={requestInfo.telefoneIndicador}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												telefoneIndicador: formatToPhone(value),
											})
										}
									/>
								</div>
							</div>
						)}
					</div>
					<div className="mt-2 flex w-full flex-col items-center self-center px-2">
						<span className="font-raleway text-center text-sm font-bold uppercase">COMO VOCÊ CHEGOU A ESSE CLIENTE?</span>
						<textarea
							placeholder={"Descreva aqui como esse cliente chegou até voce.."}
							value={requestInfo.comoChegouAoCliente}
							onChange={(e) =>
								setRequestInfo({
									...requestInfo,
									comoChegouAoCliente: e.target.value,
								})
							}
							className="block h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						/>
					</div>
					<div className="mt-2 flex w-full flex-col items-center self-center px-2">
						<span className="font-raleway text-center text-sm font-bold uppercase">OBSERVAÇÃO ADICIONAL ACERCA DO SERVIÇO PRESTADO</span>
						<textarea
							placeholder={
								"Preencha aqui, se houver, observações acerca desse contrato. Peculiaridades desse serviço (ex: somente instalação/equipamentos), detalhes e esclarecimentos para financiamento, entre outras informações relevantes."
							}
							value={requestInfo.obsComercial}
							onChange={(e) =>
								setRequestInfo({
									...requestInfo,
									obsComercial: e.target.value,
								})
							}
							className="block h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS PARA CONTATO</span>
					<div className="flex grow flex-col gap-2 p-2">
						<div className="grid w-full grid-cols-2 gap-2">
							<div className="w-full">
								<TextInput
									width="100%"
									label={"NOME DO CONTATO 1"}
									placeholder="Preencha aqui o nome do contato primário para a jornada do cliente."
									editable={true}
									value={requestInfo.nomeContatoJornadaUm}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											nomeContatoJornadaUm: value,
										})
									}
								/>
							</div>
							<div className="w-full">
								<TextInput
									width="100%"
									label={"TELEFONE DO CONTATO 1"}
									placeholder="Preencha aqui o telefone do contato primário para a jornada do cliente."
									editable={true}
									value={requestInfo.telefoneContatoUm}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											telefoneContatoUm: formatToPhone(value),
										})
									}
								/>
							</div>
						</div>
						<div className="grid w-full grid-cols-2 gap-2">
							<div className="w-full">
								<TextInput
									width="100%"
									label={"NOME DO CONTATO 2"}
									placeholder="Preencha aqui o nome do contato secundário para a jornada do cliente."
									editable={true}
									value={requestInfo.nomeContatoJornadaDois}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											nomeContatoJornadaDois: value.toUpperCase(),
										})
									}
								/>
							</div>
							<div className="w-full">
								<TextInput
									width="100%"
									label={"TELEFONE DO CONTATO 2"}
									placeholder="Preencha aqui o telefone do contato secundário para a jornada do cliente."
									editable={true}
									value={requestInfo.telefoneContatoDois}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											telefoneContatoDois: formatToPhone(value),
										})
									}
								/>
							</div>
						</div>

						<div className="mt-2 flex w-full flex-col items-center self-center px-2">
							<span className="font-raleway text-center text-sm font-bold uppercase">CUIDADOS PARA CONTATO COM O CLIENTE</span>
							<textarea
								placeholder={"Descreva aqui cuidados em relação ao contato do cliente durante a jornada. Melhores horários para contato, texto ou aúdio, etc..."}
								value={requestInfo.cuidadosContatoJornada}
								onChange={(e) =>
									setRequestInfo({
										...requestInfo,
										cuidadosContatoJornada: e.target.value,
									})
								}
								className="block h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS PARA ENTRADA NA CONCESSIONÁRIA</span>
					<div className="flex flex-col gap-2 p-2 lg:grid lg:grid-cols-3">
						<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">INFORMAÇÕES DA INSTALAÇÃO DO CLIENTE</h1>
						<div className="col-span-3 flex w-full items-center justify-center gap-2">
							<TextInput
								label={"NOME DO TITULAR DO PROJETO"}
								placeholder="Preencha o nome do titular do projeto junto a concessionária."
								value={requestInfo.nomeTitularProjeto ? requestInfo.nomeTitularProjeto : ""}
								editable={true}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										nomeTitularProjeto: value.toUpperCase(),
									})
								}
							/>

							<TextInput
								label={"Nº DA INSTALAÇÃO"}
								editable={true}
								placeholder="Preencha aqui o número de instalação junto a concessionária."
								value={requestInfo.numeroInstalacao ? requestInfo.numeroInstalacao : ""}
								handleChange={(value) => setRequestInfo({ ...requestInfo, numeroInstalacao: value })}
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								label={"TIPO DO TITULAR"}
								editable={true}
								value={requestInfo.tipoDoTitular}
								handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDoTitular: value })}
								options={[
									{
										id: 1,
										label: "PESSOA FISICA",
										value: "PESSOA FISICA",
									},
									{
										id: 2,
										label: "PESSOA JURIDICA",
										value: "PESSOA JURIDICA",
									},
								]}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoDoTitular: undefined,
									}))
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								label={"TIPO DA LIGAÇÃO"}
								editable={true}
								value={requestInfo.tipoDaLigacao}
								handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDaLigacao: value })}
								options={[
									{
										id: 1,
										label: "NOVA",
										value: "NOVA",
									},
									{
										id: 2,
										label: "EXISTENTE",
										value: "EXISTENTE",
									},
								]}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoDaLigacao: undefined,
									}))
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								label={"TIPO DA INSTALAÇÃO"}
								editable={true}
								value={requestInfo.tipoDaInstalacao}
								handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDaInstalacao: value })}
								options={[
									{
										id: 1,
										label: "RURAL",
										value: "RURAL",
									},
									{
										id: 2,
										label: "URBANO",
										value: "URBANO",
									},
								]}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoDaInstalacao: undefined,
									}))
								}
							/>
						</div>
						<h1 className="col-span-3 pt-2 text-center font-bold text-[#fead61]">ENDEREÇO DA INSTALAÇÃO</h1>
						<div className="flex flex-wrap items-center justify-center gap-x-2">
							<TextInput
								editable={true}
								label={"CEP INSTALAÇÃO"}
								placeholder="Preencha aqui o CEP do local de instalação do sistema."
								value={requestInfo.cepInstalacao}
								handleChange={(value) => {
									//   if (value.length == 9) {
									//     setAddressDataByCEP(value);
									//   }
									setRequestInfo({
										...requestInfo,
										cepInstalacao: formatToCEP(value),
									});
								}}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								label={"ENDEREÇO DE INSTALAÇÃO"}
								editable={true}
								placeholder="Preencha aqui o endereço do local de instalação do sistema."
								value={requestInfo.enderecoInstalacao}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										enderecoInstalacao: value.toUpperCase(),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								label={"Nº"}
								editable={true}
								placeholder="Preencha o número/identificador do local de instalação do sistema."
								value={requestInfo.numeroResInstalacao ? requestInfo.numeroResInstalacao : ""}
								handleChange={(value) => setRequestInfo({ ...requestInfo, numeroResInstalacao: value })}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								label={"BAIRRO"}
								placeholder="Preencha aqui o bairro do local de instalação do sistema."
								editable={true}
								value={requestInfo.bairroInstalacao}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										bairroInstalacao: value.toUpperCase(),
									})
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								width={"450px"}
								label={"UF"}
								editable={true}
								options={Object.keys(stateCities).map((state, index) => ({
									id: index + 1,
									label: state,
									value: state,
								}))}
								value={requestInfo.ufInstalacao}
								handleChange={(value) => setRequestInfo({ ...requestInfo, ufInstalacao: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({ ...prev, ufInstalacao: null }));
								}}
							/>
						</div>
						<div className="flex items-center justify-center">
							<SelectInput
								label={"CIDADE"}
								editable={true}
								value={requestInfo.cidadeInstalacao}
								options={
									requestInfo.ufInstalacao
										? stateCities[requestInfo.ufInstalacao as keyof typeof stateCities].map((city, index) => {
												return {
													id: index,
													value: city,
													label: city,
												};
											})
										: null
								}
								handleChange={(value) => setRequestInfo({ ...requestInfo, cidadeInstalacao: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										cidadeInstalacao: undefined,
									}))
								}
							/>
						</div>
						<div className="flex items-center justify-center">
							<TextInput
								label={"PONTO DE REFERÊNCIA DA INSTALAÇÃO"}
								placeholder="Preencha aqui um ponto de referência do local de instalação."
								editable={true}
								value={requestInfo.pontoDeReferenciaInstalacao}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										pontoDeReferenciaInstalacao: value,
									})
								}
							/>
						</div>
						<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
							<TextInput
								label={"LATITUDE"}
								value={requestInfo.latitude}
								placeholder="Preencha aqui a latitude do local de instalação."
								editable={true}
								handleChange={(value) => setRequestInfo({ ...requestInfo, latitude: value })}
							/>
							<TextInput
								label={"LONGITUDE"}
								editable={true}
								value={requestInfo.longitude}
								placeholder="Preencha aqui a longitude do local de instalação."
								handleChange={(value) => setRequestInfo({ ...requestInfo, longitude: value })}
							/>
						</div>

						<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">INFORMAÇÕES DA CONTA DE CEMIG ATENDE</h1>
						<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
							<TextInput
								label={"LOGIN(CEMIG ATENDE)"}
								editable={true}
								placeholder="Preencha aqui o login do CEMIG ATENDE do cliente."
								value={requestInfo.loginCemigAtende}
								handleChange={(value) => setRequestInfo({ ...requestInfo, loginCemigAtende: value })}
							/>
							<TextInput
								label={"SENHA(CEMIG ATENDE)"}
								placeholder="Preencha aqui a senha do CEMIG ATENDE do cliente."
								editable={true}
								value={requestInfo.senhaCemigAtende}
								handleChange={(value) => setRequestInfo({ ...requestInfo, senhaCemigAtende: value })}
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full grow flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DO SISTEMA</span>
					<div className="mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
						<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-4 shadow-sm lg:w-1/4 lg:p-6">
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-medium uppercase tracking-tight">POTÊNCIA DE MÓDULOS</h1>
								<ImPower />
							</div>
							<div className="mt-2 flex w-full flex-col">
								<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{getModulesPeakPotByProducts(proposeInfo.produtos)} kWp</div>
							</div>
						</div>
						<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-4 shadow-sm lg:w-1/4 lg:p-6">
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-medium uppercase tracking-tight">POTÊNCIA DE INVERSORES</h1>
								<ImPower />
							</div>
							<div className="mt-2 flex w-full flex-col">
								<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{getInverterPeakPowerByProducts(proposeInfo.produtos)} kWp</div>
							</div>
						</div>
						<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-4 shadow-sm lg:w-1/4 lg:p-6">
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-medium uppercase tracking-tight">NÚMERO DE MÓDULOS</h1>
								<FaSolarPanel />
							</div>
							<div className="mt-2 flex w-full flex-col">
								<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{getModulesQty(proposeInfo.produtos)}</div>
							</div>
						</div>
						<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-4 shadow-sm lg:w-1/4 lg:p-6">
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-medium uppercase tracking-tight">NÚMERO DE INVERSORES</h1>
								<TbTopologyFull />
							</div>
							<div className="mt-2 flex w-full flex-col">
								<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{getInverterQty(proposeInfo.produtos)}</div>
							</div>
						</div>
					</div>
					<h1 className="w-full text-start font-medium text-gray-500">LISTA DE EQUIPAMENTOS</h1>
					<div className="flex w-full flex-col flex-wrap justify-around gap-2 lg:flex-row">
						{proposeInfo.produtos.map((product, index) => (
							<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
								<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
									<div className="flex items-center gap-1">
										<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]">{renderCategoryIcon(product.categoria)}</div>
										<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
											<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
										</p>
									</div>
									<div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
										<div className="flex items-center gap-1">
											<FaIndustry size={15} />
											<p className="text-[0.6rem] font-light text-gray-500">{product.fabricante}</p>
										</div>
										<div className="flex items-center gap-1">
											<ImPower size={15} />
											<p className="text-[0.6rem] font-light text-gray-500">{product.potencia} W</p>
										</div>
										<div className="flex items-center gap-1">
											<AiOutlineSafety size={15} />
											<p className="text-[0.6rem] font-light text-gray-500">{product.garantia} ANOS</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
					<h1 className="w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-white">SERVIÇOS</h1>
					<h1 className="w-full text-start font-medium text-gray-500">LISTA DE SERVIÇOS</h1>
					<div className="flex w-full flex-col flex-wrap justify-around gap-2 lg:flex-row">
						{proposeInfo.servicos.map((service, index) => (
							<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
								<div className="flex w-full items-center justify-between gap-2">
									<div className="flex  items-center gap-1">
										<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
											<MdOutlineMiscellaneousServices />
										</div>
										<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
									</div>
									<div className="flex  grow items-center justify-end gap-2 pl-2">
										<div className="flex items-center gap-1">
											<AiOutlineSafety size={15} />
											<p className="text-[0.6rem] font-light text-gray-500">{service.garantia} ANOS</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="flex w-full flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DA ESTRUTURA DE MONTAGEM</span>
					<div className="flex w-full grow flex-col items-center gap-2">
						<div className="grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
							<SelectInput
								label={"TIPO DA ESTRUTURA"}
								editable={true}
								options={structureTypes.map((type, index) => {
									return {
										id: index + 1,
										label: type.label,
										value: type.value,
									};
								})}
								value={requestInfo.tipoEstrutura}
								handleChange={(value) => setRequestInfo({ ...requestInfo, tipoEstrutura: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({ ...prev, tipoEstrutura: "" }));
								}}
								width="100%"
							/>
							<SelectInput
								label={"MATERIAL DA ESTRUTURA"}
								editable={true}
								options={[
									{ id: 1, label: "MADEIRA", value: "MADEIRA" },
									{ id: 2, label: "FERRO", value: "FERRO" },
								]}
								value={requestInfo.materialEstrutura}
								handleChange={(value) => setRequestInfo({ ...requestInfo, materialEstrutura: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										materialEstrutura: null,
									}))
								}
								width="100%"
							/>
						</div>
						<div className="grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
							<SelectInput
								label={"INCLUSO VENDA DE NOVA (OU ADEQUAÇÃO) DE ESTRUTURA"}
								editable={true}
								options={[
									{
										id: 1,
										label: "NÃO",
										value: "NÃO",
									},
									{
										id: 2,
										label: "SIM",
										value: "SIM",
									},
								]}
								value={requestInfo.estruturaAmpere}
								handleChange={(value) => setRequestInfo({ ...requestInfo, estruturaAmpere: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({
										...prev,
										estruturaAmpere: "NÃO",
									}));
								}}
								width="100%"
							/>
							<SelectInput
								label={"RESPONSÁVEL PELA ESTRUTURA"}
								editable={true}
								options={[
									{
										id: 1,
										label: "AMPERE",
										value: "AMPERE",
									},
									{
										id: 2,
										label: "CLIENTE",
										value: "CLIENTE",
									},
									{
										id: 3,
										label: "NÃO SE APLICA",
										value: "NÃO SE APLICA",
									},
								]}
								value={requestInfo.responsavelEstrutura}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										responsavelEstrutura: value,
									})
								}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										responsavelEstrutura: "NÃO SE APLICA",
									}))
								}
								width="100%"
							/>
						</div>
						{requestInfo.responsavelEstrutura && requestInfo.responsavelEstrutura != "NÃO SE APLICA" && (
							<>
								<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">PAGAMENTO DA ESTRUTURA</h1>
								<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
									<SelectInput
										label={"FORMA DE PAGAMENTO"}
										editable={true}
										options={[
											{
												id: 1,
												label: "INCLUSO NO FINANCIAMENTO",
												value: "INCLUSO NO FINANCIAMENTO",
											},
											{
												id: 2,
												label: "DIRETO PRO FORNECEDOR",
												value: "DIRETO PRO FORNECEDOR",
											},
											{
												id: 3,
												label: "A VISTA PARA AMPÈRE",
												value: "A VISTA PARA AMPÈRE",
											},
											{
												id: 4,
												label: "NÃO SE APLICA",
												value: "NÃO SE APLICA",
											},
										]}
										value={requestInfo.formaPagamentoEstrutura}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												formaPagamentoEstrutura: value,
											})
										}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() =>
											setRequestInfo((prev) => ({
												...prev,
												formaPagamentoEstrutura: null,
											}))
										}
									/>
									<NumberInput
										label={"VALOR DA ESTRUTURA"}
										editable={true}
										value={requestInfo.valorEstrutura ? requestInfo.valorEstrutura : null}
										placeholder="Preencha aqui o valor da estrutura"
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												valorEstrutura: Number(value),
											})
										}
									/>
								</div>
							</>
						)}
					</div>
				</div>
				<div className="flex w-full flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">AUMENTO DE CARGA</span>
					<div className="flex w-full grow flex-col">
						<div className="mt-2 flex justify-center p-2">
							<SelectInput
								label={"HAVERÁ TROCA DE PADRÃO/AUMENTO DE CARGA?"}
								editable={true}
								options={[
									{
										id: 1,
										label: "NÃO",
										value: "NÃO",
									},
									{
										id: 2,
										label: "SIM",
										value: "SIM",
									},
								]}
								value={requestInfo.aumentoDeCarga}
								handleChange={(value) => setRequestInfo({ ...requestInfo, aumentoDeCarga: value })}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => setRequestInfo((prev) => ({ ...prev, aumentoDeCarga: null }))}
							/>
						</div>
						{requestInfo.aumentoDeCarga == "SIM" ? (
							<div className="col-span-3 flex items-center justify-center">
								<SelectInput
									label={"RESPONSÁVEL PELA TROCA"}
									editable={true}
									value={requestInfo.respTrocaPadrao}
									handleChange={(value) => setRequestInfo({ ...requestInfo, respTrocaPadrao: value })}
									options={[
										{
											id: 1,
											label: "AMPERE",
											value: "AMPERE",
										},
										{
											id: 2,
											label: "CLIENTE",
											value: "CLIENTE",
										},
										{
											id: 3,
											label: "NÃO SE APLICA",
											value: "NÃO SE APLICA",
										},
									]}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => {
										setRequestInfo((prev) => ({
											...prev,
											respTrocaPadrao: null,
										}));
									}}
								/>
							</div>
						) : null}

						{requestInfo.aumentoDeCarga == "SIM" && (
							<div className="flex flex-col gap-2 p-2 lg:grid lg:grid-cols-3">
								<div className="flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"TIPO DO PADRÃO"}
										editable={true}
										value={requestInfo.tipoDePadrao}
										handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDePadrao: value })}
										options={[
											{
												label: "MONO 40A",
												value: "MONO 40A",
											},
											{
												label: "MONO 63A",
												value: "MONO 63A",
											},
											{
												label: "BIFASICO 63A",
												value: "BIFASICO 63A",
											},
											{
												label: "BIFASICO 70A",
												value: "BIFASICO 70A",
											},
											{
												label: "BIFASICO 100A",
												value: "BIFASICO 100A",
											},
											{
												label: "BIFASICO 125A",
												value: "BIFASICO 125A",
											},
											{
												label: "BIFASICO 150A",
												value: "BIFASICO 150A",
											},
											{
												label: "BIFASICO 200A",
												value: "BIFASICO 200A",
											},
											{
												label: "TRIFASICO 63A",
												value: "TRIFASICO 63A",
											},
											{
												label: "TRIFASICO 100A",
												value: "TRIFASICO 100A",
											},
											{
												label: "TRIFASICO 125A",
												value: "TRIFASICO 125A",
											},
											{
												label: "TRIFASICO 150A",
												value: "TRIFASICO 150A",
											},
											{
												label: "TRIFASICO 200A",
												value: "TRIFASICO 200A",
											},
										].map((type, index) => {
											return {
												id: index + 1,
												label: type.label,
												value: type.value,
											};
										})}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												tipoDePadrao: null,
											}));
										}}
									/>
								</div>
								<div className="flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"HAVERÁ AUMENTO DO DISJUNTOR?"}
										editable={true}
										value={requestInfo.aumentoDisjuntor}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												aumentoDisjuntor: value,
											})
										}
										options={[
											{
												id: 1,
												label: "SIM",
												value: "SIM",
											},
											{
												id: 2,
												label: "NÃO",
												value: "NÃO",
											},
										]}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												aumentoDisjuntor: null,
											}));
										}}
									/>
								</div>
								<div className="flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"CAIXA CONJUGADA?"}
										editable={true}
										options={[
											{
												id: 1,
												label: "NÃO",
												value: "NÃO",
											},
											{
												id: 2,
												label: "SIM",
												value: "SIM",
											},
										]}
										value={requestInfo.caixaConjugada}
										handleChange={(value) => setRequestInfo({ ...requestInfo, caixaConjugada: value })}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												caixaConjugada: null,
											}));
										}}
									/>
								</div>
								<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">PAGAMENTO</h1>
								<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
									<SelectInput
										width={"450px"}
										label={"PAGAMENTO DO PADRÃO"}
										editable={true}
										value={requestInfo.formaPagamentoPadrao}
										options={[
											{
												id: 1,
												label: "CLIENTE IRÁ COMPRAR EM SEPARADO",
												value: "CLIENTE IRÁ COMPRAR EM SEPARADO",
											},
											{
												id: 2,
												label: "CLIENTE PAGAR POR FORA",
												value: "CLIENTE PAGAR POR FORA",
											},
											{
												id: 2,
												label: "INCLUSO NO CONTRATO",
												value: "INCLUSO NO CONTRATO",
											},
											{
												id: 3,
												label: "NÃO HAVERA TROCA PADRÃO",
												value: "NÃO HAVERA TROCA PADRÃO",
											},
										]}
										handleChange={(value) => {
											setRequestInfo({
												...requestInfo,
												formaPagamentoPadrao: value,
											});
										}}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() =>
											setRequestInfo((prev) => ({
												...prev,
												formaPagamentoPadrao: null,
											}))
										}
									/>
									<NumberInput
										width={"450px"}
										label={"VALOR DO PADRÃO"}
										editable={true}
										value={requestInfo.valorPadrao ? requestInfo.valorPadrao : null}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												valorPadrao: Number(value),
											})
										}
										placeholder="Preencha aqui o valor do padrão."
									/>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="flex w-full flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">PLANO INTEGRADO DE OPERAÇÃO E MANUTENÇÃO</span>
					<p className="text-center text-sm italic text-gray-500">Escolha, se houver, o plano de Operação & Manutenção incluso no projeto.</p>
					<div className="flex w-full items-center justify-center p-2">
						{requestInfo.possuiOeM == "SIM" ? (
							<div className="flex w-[350px] flex-col items-center rounded border border-gray-500 p-3">
								<div className="flex w-full items-center gap-2">
									<div className="flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1">
										<BsBookmarksFill />
									</div>
									<h1 className="text-sm font-black leading-none tracking-tight">{requestInfo.planoOeM}</h1>
								</div>
								<div className="flex w-full items-center justify-end">
									<h1 className="rounded-full bg-black px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">{formatToMoney(requestInfo.valorOeMOuSeguro || 0)}</h1>
								</div>
							</div>
						) : (
							<p className="text-sm tracking-tight text-gray-500">PLANO NÃO DEFINIDO</p>
						)}
					</div>
				</div>
				<div className="flex w-full grow flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">SEGURO</span>
					<div className="flex grow flex-col gap-2 p-2">
						<div className="flex w-full items-center justify-center">
							<div className="w-fit">
								<CheckboxInput
									labelFalse="CLIENTE SEGURADO"
									labelTrue="CLIENTE SEGURO"
									checked={requestInfo.clienteSegurado == "SIM"}
									handleChange={(value) => setRequestInfo((prev) => ({ ...prev, clienteSegurado: !!value ? "SIM" : "NÃO" }))}
								/>
							</div>
						</div>
						{requestInfo.clienteSegurado == "SIM" ? (
							<div className="flex w-[70%] flex-col items-center gap-2 self-center lg:flex-row">
								<div className="w-[50%] lg:w-full">
									<NumberInput
										label="VALOR DO SEGURO"
										value={requestInfo.valorSeguro}
										placeholder="Preencha o valor do seguro..."
										handleChange={(value) => setRequestInfo((prev) => ({ ...prev, valorSeguro: value }))}
										width="100%"
									/>
								</div>
								<div className="w-[50%] lg:w-full">
									<SelectInput
										label="TEMPO SEGURADO"
										value={requestInfo.tempoSegurado}
										options={[
											{ id: 1, value: "1 ANO", label: "1 ANO" },
											{ id: 2, value: "NÃO SE APLICA", label: "NÃO SE APLICA" },
										]}
										handleChange={(value) => setRequestInfo((prev) => ({ ...prev, tempoSegurado: value }))}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => setRequestInfo((prev) => ({ ...prev, tempoSegurado: "NÃO SE APLICA" }))}
									/>
								</div>
							</div>
						) : null}
					</div>
				</div>
				<div className="flex w-full flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS FINANCEIROS E NEGOCIAÇÃO</span>
					<div className="flex w-full grow flex-col">
						<div className="mt-2 flex flex-col gap-2 p-2 lg:grid lg:grid-cols-3">
							<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">DADOS DO PAGADOR</h1>
							<div className="flex items-center justify-center">
								<TextInput
									width={"450px"}
									label={"NOME DO PAGADOR"}
									placeholder="Preencha aqui o nome da pessoa/empresa que realizará o pagamento"
									editable={true}
									value={requestInfo.nomePagador}
									handleChange={(value) => setRequestInfo({ ...requestInfo, nomePagador: value })}
								/>
							</div>
							<div className="flex items-center justify-center">
								<TextInput
									width={"450px"}
									label={"CONTATO DO PAGADOR"}
									placeholder="Preencha aqui o contato da pessoa que realizará o pagamento"
									editable={true}
									value={requestInfo.contatoPagador}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											contatoPagador: formatToPhone(value),
										})
									}
								/>
							</div>
							<div className="flex items-center justify-center">
								<TextInput
									width={"450px"}
									label={"CPF/CNPJ PARA NF"}
									placeholder="Preencha aqui o CPF/CNPJ para faturamento do serviço/equipamentos."
									editable={true}
									value={requestInfo.cpf_cnpjNF}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											cpf_cnpjNF: formatToCPForCNPJ(value),
										})
									}
								/>
							</div>
						</div>
						<div className="flex flex-col p-2">
							<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE N.F</h1>
							<div className="mt-2 flex flex-wrap justify-around gap-2">
								<SelectInput
									width={"450px"}
									label={"NECESSIDADE N.F ADIANTADA"}
									editable={true}
									value={requestInfo.necessidadeNFAdiantada}
									options={[
										{
											id: 1,
											label: "NÃO",
											value: "NÃO",
										},
										{
											id: 2,
											label: "SIM",
											value: "SIM",
										},
									]}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											necessidadeNFAdiantada: value,
										})
									}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => {
										setRequestInfo((prev) => ({
											...prev,
											necessidadeNFAdiantada: null,
										}));
									}}
								/>
								<SelectInput
									width={"450px"}
									label={"NECESSIDADE DE INSCRIÇÃO RURAL NA N.F?"}
									editable={true}
									value={requestInfo.necessidaInscricaoRural}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											necessidaInscricaoRural: value,
										})
									}
									options={[
										{
											id: 1,
											label: "NÃO",
											value: "NÃO",
										},
										{
											id: 2,
											label: "SIM",
											value: "SIM",
										},
									]}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => {
										setRequestInfo((prev) => ({
											...prev,
											necessidaInscricaoRural: null,
										}));
									}}
								/>
								{requestInfo.necessidaInscricaoRural == "SIM" && (
									<TextInput
										width={"450px"}
										label={"INSCRIÇÃO RURAL"}
										placeholder="Preencha aqui a inscrição rural do cliente."
										editable={true}
										value={requestInfo.inscriçãoRural}
										handleChange={(value) => setRequestInfo({ ...requestInfo, inscriçãoRural: value })}
									/>
								)}
							</div>
						</div>
						<div className="flex flex-col p-2">
							<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE A ENTREGA</h1>
							<div className="mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-2">
								<div className="col-span-2 flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"LOCAL DE ENTREGA"}
										options={[
											{
												id: 1,
												label: "MESMO DO PROJETO",
												value: "MESMO DO PROJETO",
											},
											{
												id: 2,
												label: "LOCAL DIFERENTE DA INSTALAÇÃO (DESCRITO NAS OBSERVAÇÕES)",
												value: "LOCAL DIFERENTE DA INSTALAÇÃO (DESCRITO NAS OBSERVAÇÕES)",
											},
											{
												id: 3,
												label: "ENTREGAR NA AMPÈRE(SOMENTE COM AUTORIZAÇÃO DO GERENTE COMERCIAL)",
												value: "ENTREGAR NA AMPÈRE(SOMENTE COM AUTORIZAÇÃO DO GERENTE COMERCIAL)",
											},
										]}
										editable={true}
										value={requestInfo.localEntrega}
										handleChange={(value) => setRequestInfo({ ...requestInfo, localEntrega: value })}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												localEntrega: null,
											}));
										}}
									/>
								</div>
								<div className="flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"END. ENTREGA IGUAL COBRANÇA?"}
										editable={true}
										value={requestInfo.entregaIgualCobranca}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												entregaIgualCobranca: value,
											})
										}
										options={[
											{
												id: 1,
												label: "SIM",
												value: "SIM",
											},
											{
												id: 2,
												label: "NÃO",
												value: "NÃO",
											},
										]}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() =>
											setRequestInfo((prev) => ({
												...prev,
												entregaIgualCobranca: null,
											}))
										}
									/>
								</div>
								<div className="flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"HÁ RESTRIÇÕES PARA ENTREGA?"}
										editable={true}
										value={requestInfo.restricoesEntrega}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												restricoesEntrega: value,
											})
										}
										options={[
											{
												id: 1,
												label: "SOMENTE HORARIO COMERCIAL",
												value: "SOMENTE HORARIO COMERCIAL",
											},
											{
												id: 2,
												label: "NÃO HÁ RESTRIÇÕES",
												value: "NÃO HÁ RESTRIÇÕES",
											},
											{
												id: 3,
												label: "CASA EM CONSTRUÇÃO",
												value: "CASA EM CONSTRUÇÃO",
											},
											{
												id: 4,
												label: "NÃO PODE RECEBER EM HORARIO COMERCIAL",
												value: "NÃO PODE RECEBER EM HORARIO COMERCIAL",
											},
										]}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												restricoesEntrega: null,
											}));
										}}
									/>
								</div>
							</div>
						</div>
						<div className="flex flex-col p-2">
							<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE O PAGAMENTO</h1>
							<div className="mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-3">
								<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
									<NumberInput
										width={"450px"}
										label={"VALOR DO CONTRATO FOTOVOLTAICO(SEM CUSTOS ADICIONAIS)"}
										editable={true}
										value={requestInfo.valorContrato || null}
										placeholder={"Preencha aqui o valor do contrato (sem custos adicionais de estrutura/padrão/O&M, etc..."}
										handleChange={(value) =>
											setRequestInfo((prev) => ({
												...prev,
												valorContrato: Number(value),
											}))
										}
									/>
									<SelectInput
										width={"450px"}
										label={"ORIGEM DO RECURSO"}
										editable={true}
										value={requestInfo.origemRecurso}
										handleChange={(value) => setRequestInfo({ ...requestInfo, origemRecurso: value })}
										options={[
											{
												id: 1,
												label: "FINANCIAMENTO",
												value: "FINANCIAMENTO",
											},
											{
												id: 2,
												label: "CAPITAL PRÓPRIO",
												value: "CAPITAL PRÓPRIO",
											},
										]}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												origemRecurso: null,
											}));
										}}
									/>
								</div>
								{requestInfo.origemRecurso == "FINANCIAMENTO" && (
									<div className="col-span-3 mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-3">
										<div className="flex items-center justify-center">
											<SelectInput
												width={"450px"}
												label={"CREDOR"}
												options={creditors?.map((c) => ({ id: c._id, label: c.valor, value: c.valor })) || []}
												value={requestInfo.credor}
												handleChange={(value) => setRequestInfo({ ...requestInfo, credor: value })}
												resetOptionLabel="NÃO DEFINIDO"
												onReset={() => {
													setRequestInfo((prev) => ({ ...prev, credor: null }));
												}}
											/>
										</div>
										<div className="flex items-center justify-center">
											<TextInput
												width={"450px"}
												label={"NOME DO GERENTE"}
												placeholder="Preencha aqui o nome do gerente."
												editable={true}
												value={requestInfo.nomeGerente}
												handleChange={(value) => setRequestInfo({ ...requestInfo, nomeGerente: value })}
											/>
										</div>
										<div className="flex items-center justify-center">
											<TextInput
												width={"450px"}
												label={"CONTATO DO GERENTE"}
												placeholder="Preencha aqui o contato de telefone do gerente."
												editable={true}
												value={requestInfo.contatoGerente}
												handleChange={(value) =>
													setRequestInfo({
														...requestInfo,
														contatoGerente: formatToPhone(value),
													})
												}
											/>
										</div>
									</div>
								)}
								<div className="flex items-center justify-center">
									<NumberInput
										width={"450px"}
										label={"SE CARTÃO OU CHEQUE, QUANTAS PARCELAS?"}
										placeholder="Preencha aqui o número de parcelas."
										editable={true}
										value={requestInfo.numParcelas || null}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												numParcelas: Number(value),
												valorParcela: requestInfo.valorContrato ? Number((requestInfo.valorContrato / Number(value)).toFixed(2)) : 0,
											})
										}
									/>
								</div>
								<div className="flex items-center justify-center">
									<NumberInput
										width={"450px"}
										label={"VALOR DA PARCELA"}
										placeholder="Preencha aqui o valor das parcelas."
										editable={true}
										value={requestInfo.valorParcela || null}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												valorParcela: Number(value),
											})
										}
									/>
								</div>
								<div className="flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"NECESSIDADE CÓDIGO FINAME?"}
										editable={true}
										value={requestInfo.necessidadeCodigoFiname}
										options={[
											{
												id: 1,
												label: "NÃO",
												value: "NÃO",
											},
											{
												id: 2,
												label: "SIM",
												value: "SIM",
											},
										]}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												necessidadeCodigoFiname: value,
											})
										}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												necessidadeCodigoFiname: null,
											}));
										}}
									/>
								</div>
								<div className="col-span-3 flex items-center justify-center">
									<SelectInput
										width={"450px"}
										label={"FORMA DE PAGAMENTO"}
										editable={true}
										options={[
											{
												id: 1,
												label: "80% A VISTA NA ENTRADA + 20% NA FINALIZAÇÃO DA INSTALAÇÃO",
												value: "80% A VISTA NA ENTRADA + 20% NA FINALIZAÇÃO DA INSTALAÇÃO",
											},
											{
												id: 2,
												label: "100% A VISTA ATRAVÉS DE FINANCIAMENTO BANCÁRIO",
												value: "100% A VISTA ATRAVÉS DE FINANCIAMENTO BANCÁRIO",
											},
											{
												id: 3,
												label: "NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)",
												value: "NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)",
											},
										]}
										value={requestInfo.formaDePagamento}
										handleChange={(value) =>
											setRequestInfo({
												...requestInfo,
												formaDePagamento: value,
											})
										}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												formaDePagamento: null,
											}));
										}}
									/>
								</div>
							</div>
						</div>
						<div className="mt-2 flex w-full flex-col items-center self-center px-2">
							<span className="font-raleway text-center text-sm font-bold uppercase">DESCRIÇÃO DA NEGOCIAÇÃO</span>
							<textarea
								placeholder={"Descreva aqui a negociação"}
								value={requestInfo.descricaoNegociacao}
								onChange={(e) =>
									setRequestInfo({
										...requestInfo,
										descricaoNegociacao: e.target.value,
									})
								}
								className="block h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full grow flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-sm font-bold uppercase text-[#15599a]">DISTRIBUIÇÃO DE CRÉDITOS</span>
					<div className="mt-2 flex justify-center p-2">
						<SelectInput
							label={"POSSUI DISTRIBUIÇÕES DE CRÉDITOS?"}
							value={requestInfo.possuiDistribuicao}
							editable={true}
							options={[
								{
									id: 1,
									label: "NÃO",
									value: "NÃO",
								},
								{
									id: 2,
									label: "SIM",
									value: "SIM",
								},
							]}
							handleChange={(value) => setRequestInfo({ ...requestInfo, possuiDistribuicao: value })}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() => {
								setRequestInfo((prev) => ({
									...prev,
									possuiDistribuicao: null,
								}));
							}}
						/>
					</div>
					{requestInfo.possuiDistribuicao == "SIM" && (
						<>
							{requestInfo.distribuicoes?.length > 0 && (
								<div className="mt-4 flex flex-col gap-2">
									{requestInfo.distribuicoes.map((distribuicao, index) => (
										<div key={index} className="flex flex-wrap justify-around">
											<p className="text-sm font-bold text-gray-600">INSTALAÇÃO Nº{distribuicao.numInstalacao}</p>
											<p className="text-sm font-bold text-gray-600">{distribuicao.excedente}%</p>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</div>
				<div className="flex w-full grow flex-col bg-[#fff] pb-2">
					<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DOCUMENTAÇÃO</span>
					<div className="flex w-full flex-wrap items-start justify-around gap-2">
						{Object.entries(documentsFile).map(([key, value]) => (
							<div className="flex items-center gap-1 rounded-md bg-blue-800 px-2 py-1 text-white">
								<MdAttachFile />
								<p className="text-sm">{key}</p>
							</div>
						))}
					</div>
				</div>
				<div className="mt-2 flex w-full flex-wrap justify-end  gap-2">
					{/* <button
            onClick={() => {
              goToPreviousStage();
            }}
            className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
          >
            Voltar
          </button> */}
					<button
						onClick={() => {
							requestContract();
						}}
						disabled={isPending || isSuccess}
						className="rounded p-2 font-bold hover:bg-black hover:text-white"
					>
						{isPending ? "Criando solicitação..." : null}
						{isSuccess ? "Criação concluida!" : null}
						{!isPending && !isSuccess ? "Criar solicitação" : null}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ReviewInfo;
