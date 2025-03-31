import EnergyConsortiumForm from "@/components/ContractRequest/EnergyConsortiumForm";
import GenericForm from "@/components/ContractRequest/GenericForm";
import HomologationForm from "@/components/ContractRequest/HomologationForm";
import MonitoringForm from "@/components/ContractRequest/MonitoringForm";
import OeMForm from "@/components/ContractRequest/OeMForm";
import SolarSystemForm from "@/components/ContractRequest/SolarSystemForm";
import SolarSystemInsuranceForm from "@/components/ContractRequest/SolarSystemInsuranceForm";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatToPhone } from "@/utils/methods";
import { useOpportunityCreators } from "@/utils/queries/users";
import type { TClientDTO } from "@/utils/schemas/client.schema";
import type { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProposalDTOWithOpportunity } from "@/utils/schemas/proposal.schema";
import type { TUserDTOSimplified } from "@/utils/schemas/user.schema";
import type { Session } from "next-auth";
import React, { useEffect, useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import { TypeAcquisition } from "typescript";

type GetRequestObjectByProjectTypeArguments = {
	propose: TProposalDTOWithOpportunity;
	projectType?: TOpportunity["tipo"]["titulo"];
	responsible?: TUserDTOSimplified;
	client?: TClientDTO;
};
function getRequestObjectByProjectType({ propose, projectType, responsible, client }: GetRequestObjectByProjectTypeArguments): TContractRequest {
	const seller = propose.oportunidadeDados?.responsaveis.find((r) => r.papel === "VENDEDOR");
	const sdr = propose.oportunidadeDados?.responsaveis.find((r) => r.papel === "SDR");
	return {
		nomeVendedor: seller?.nome || sdr?.nome || "",
		nomeDoProjeto: propose.oportunidadeDados?.nome ? propose.oportunidadeDados?.nome : "",
		idParceiro: propose.oportunidadeDados?.idParceiro,
		telefoneVendedor: seller?.telefone || sdr?.telefone || "",
		tipoDeServico: propose.oportunidadeDados.tipo.titulo ? propose.oportunidadeDados.tipo.titulo : "SISTEMA FOTOVOLTAICO",
		nomeDoContrato: propose.oportunidadeDados?.nome ? propose.oportunidadeDados?.nome : "",
		telefone: client?.telefonePrimario || "",
		cpf_cnpj: client?.cpfCnpj || "",
		rg: client?.rg || "",
		dataDeNascimento: client?.dataNascimento || null,
		cep: client?.cep || "",
		cidade: client?.cidade || "",
		uf: client?.uf || "",
		enderecoCobranca: client?.endereco || "",
		numeroResCobranca: client?.numeroOuIdentificador || "",
		bairro: client?.bairro || "",
		pontoDeReferencia: "",
		segmento: undefined,
		formaAssinatura: "FISICO",
		codigoSVB: propose.oportunidadeDados?.identificador ? propose.oportunidadeDados.identificador : "",
		estadoCivil: client?.estadoCivil,
		email: client?.email || "",
		profissao: client?.profissao || "",
		ondeTrabalha: "",
		possuiDeficiencia: "NÃO",
		qualDeficiencia: "",
		canalVenda: client?.canalAquisicao,
		nomeIndicador: client?.indicador.nome || "",
		telefoneIndicador: "",
		comoChegouAoCliente: "",
		nomeContatoJornadaUm: "",
		telefoneContatoUm: "",
		nomeContatoJornadaDois: "",
		telefoneContatoDois: "",
		cuidadosContatoJornada: "",
		nomeTitularProjeto: propose.oportunidadeDados?.instalacao.nomeTitular || "",
		tipoDoTitular:
			propose.oportunidadeDados?.instalacao.tipoTitular === "PESSOA FÍSICA"
				? "PESSOA FISICA"
				: propose.oportunidadeDados?.instalacao.tipoTitular === "PESSOA JURÍDICA"
					? "PESSOA JURIDICA"
					: null,
		tipoDaLigacao: propose.oportunidadeDados?.instalacao.tipoLigacao,
		tipoDaInstalacao: propose.oportunidadeDados?.instalacao.grupo === "RURAL" ? "RURAL" : "URBANO",
		cepInstalacao: propose.oportunidadeDados?.localizacao.cep || "",
		enderecoInstalacao: propose.oportunidadeDados?.localizacao.endereco || "",
		numeroResInstalacao: propose.oportunidadeDados?.localizacao.numeroOuIdentificador || "",
		numeroInstalacao: propose.oportunidadeDados?.instalacao.numero || "",
		bairroInstalacao: propose.oportunidadeDados?.localizacao.bairro || "",
		cidadeInstalacao: propose.oportunidadeDados?.localizacao.cidade || "",
		ufInstalacao: propose.oportunidadeDados?.localizacao.uf || "",
		pontoDeReferenciaInstalacao: "",
		loginCemigAtende: "",
		senhaCemigAtende: "",
		latitude: "",
		longitude: "",
		potPico: propose.potenciaPico || 0,
		geracaoPrevista: 0,
		topologia: propose.premissas.topologia ? (propose.premissas.topologia === "INVERSOR" ? "INVERSOR" : "MICRO-INVERSOR") : null,
		marcaInversor:
			propose.produtos.length > 0
				? propose.produtos
						.filter((p) => p.categoria === "INVERSOR")
						.map((inv) => `${inv.fabricante}-${inv.modelo}`)
						.join("/")
				: "",
		qtdeInversor: propose.produtos
			? propose.produtos
					.filter((p) => p.categoria === "INVERSOR")
					.map((inv) => inv.qtde)
					.join("/")
			: "",
		potInversor: propose.produtos
			? propose.produtos
					.filter((p) => p.categoria === "INVERSOR")
					.map((inv) => inv.potencia)
					.join("/")
			: "",
		marcaModulos: propose.produtos
			? propose.produtos
					.filter((p) => p.categoria === "MÓDULO")
					.map((mod) => `(${mod.fabricante}) ${mod.modelo}`)
					.join("/")
			: "",
		qtdeModulos: propose.produtos
			? propose.produtos
					.filter((p) => p.categoria === "MÓDULO")
					.map((mod) => mod.qtde)
					.join("/")
			: "",
		potModulos: propose.produtos
			? propose.produtos
					.filter((p) => p.categoria === "MÓDULO")
					.map((mod) => mod.potencia)
					.join("/")
			: "",
		produtos: propose.produtos,
		servicos: propose.servicos,
		tipoEstrutura: propose.premissas.tipoEstrutura ? propose.premissas.tipoEstrutura : "",
		materialEstrutura: null,
		estruturaAmpere: "NÃO",
		responsavelEstrutura: "NÃO SE APLICA",
		formaPagamentoEstrutura: null,
		valorEstrutura: 0,
		possuiOeM: propose.oportunidadeDados.tipo.titulo === "OPERAÇÃO E MANUTENÇÃO" ? "SIM" : "NÃO",
		planoOeM: propose.oportunidadeDados.tipo.titulo === "OPERAÇÃO E MANUTENÇÃO" ? (propose.planos[0]?.nome as TContractRequest["planoOeM"]) : "NÃO SE APLICA",
		clienteSegurado: "NÃO",
		valorSeguro: propose.precificacao.find((p) => p.descricao.toUpperCase().includes("SEGURO"))?.valorFinal || 0,
		tempoSegurado: "NÃO SE APLICA",
		formaPagamentoOeMOuSeguro: "NÃO SE APLICA",
		valorOeMOuSeguro: null,
		aumentoDeCarga: "NÃO",
		caixaConjugada: "NÃO",
		tipoDePadrao: null,
		aumentoDisjuntor: null,
		respTrocaPadrao: null,
		formaPagamentoPadrao: null,
		valorPadrao: 0,
		nomePagador: "",
		contatoPagador: "",
		necessidaInscricaoRural: null,
		inscriçãoRural: "",
		cpf_cnpjNF: "",
		localEntrega: null,
		entregaIgualCobranca: null,
		restricoesEntrega: null,
		valorContrato: propose.valor,
		origemRecurso: null,
		numParcelas: 0,
		valorParcela: 0,
		credor: null,
		nomeGerente: "",
		contatoGerente: "",
		necessidadeNFAdiantada: null,
		necessidadeCodigoFiname: null,
		formaDePagamento: null,
		descricaoNegociacao: "",
		possuiDistribuicao: null,
		realizarHomologacao: true,
		distribuicoes: [],
		dataSolicitacao: new Date().toISOString(),
	};
}

type ContractRequestProps = {
	proposeInfo: TProposalDTOWithOpportunity;
	client: TClientDTO;
	responsible: TUserDTOSimplified;
	session: Session;
	closeModal: () => void;
};
function NewContractRequest({ closeModal, proposeInfo, client, session, responsible }: ContractRequestProps) {
	const { data: responsibles } = useOpportunityCreators();
	// Data for contract request
	const [requestInfo, setRequestInfo] = useState<TContractRequest>(
		getRequestObjectByProjectType({
			propose: proposeInfo,
			client: client,
			projectType: proposeInfo.oportunidadeDados?.tipo.titulo,
			responsible: responsible,
		}),
	);
	return (
		<div id="ContractRequest" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-black">SOLICITAÇÃO DE CONTRATO</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>

					<div className="flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<div className="my-1 flex w-full flex-wrap items-center justify-center gap-2">
							<SelectInput
								label="VENDEDOR"
								value={requestInfo.nomeVendedor}
								options={
									responsibles?.map((responsible, index) => {
										return {
											id: index + 1,
											value: responsible.nome,
											label: responsible.nome,
										};
									}) || []
								}
								handleChange={(value) => setRequestInfo((prev) => ({ ...prev, nomeVendedor: value }))}
								selectedItemLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										nomeVendedor: undefined,
									}))
								}
							/>
							<TextInput
								label="TELEFONE DO VENDEDOR"
								value={requestInfo.telefoneVendedor}
								placeholder="Preencha aqui o telefone do vendedor."
								handleChange={(value) =>
									setRequestInfo((prev) => ({
										...prev,
										telefoneVendedor: formatToPhone(value),
									}))
								}
							/>
						</div>
						<GenericForm requestInfo={requestInfo} setRequestInfo={setRequestInfo} proposal={proposeInfo} />
						{/* {!["OPERAÇÃO E MANUTENÇÃO", "HOMOLOGAÇÃO", "SEGURO DE SISTEMA FOTOVOLTAICO", "CONSÓRCIO DE ENERGIA", "MONITORAMENTO"].includes(proposeInfo?.oportunidadeDados.tipo.titulo) ? (
							<GenericForm requestInfo={requestInfo} setRequestInfo={setRequestInfo} proposal={proposeInfo} />
						) : null}
						{proposeInfo?.oportunidadeDados.tipo.titulo === "OPERAÇÃO E MANUTENÇÃO" ? (
							<OeMForm requestInfo={requestInfo} setRequestInfo={setRequestInfo} proposeInfo={proposeInfo} />
						) : null}
						{proposeInfo?.oportunidadeDados.tipo.titulo === "HOMOLOGAÇÃO" ? (
							<HomologationForm
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								proposeInfo={proposeInfo}
								// @ts-ignore
								session={session}
								client={client}
							/>
						) : null}
						{proposeInfo.oportunidadeDados.tipo.titulo === "SEGURO DE SISTEMA FOTOVOLTAICO" ? (
							<SolarSystemInsuranceForm requestInfo={requestInfo} setRequestInfo={setRequestInfo} proposeInfo={proposeInfo} closeForm={() => closeModal()} />
						) : null}
						{proposeInfo?.oportunidadeDados.tipo.titulo === "CONSÓRCIO DE ENERGIA" ? (
							<EnergyConsortiumForm requestInfo={requestInfo} setRequestInfo={setRequestInfo} proposeInfo={proposeInfo} closeForm={() => closeModal()} />
						) : null}
						{proposeInfo.oportunidadeDados.tipo.titulo === "MONITORAMENTO" ? (
							<MonitoringForm requestInfo={requestInfo} setRequestInfo={setRequestInfo} proposeInfo={proposeInfo} closeForm={() => closeModal()} />
						) : null} */}
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewContractRequest;
