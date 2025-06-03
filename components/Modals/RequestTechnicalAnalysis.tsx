import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { VscChromeClose } from "react-icons/vsc";

import { IProject, IResponsible, ITechnicalAnalysis } from "@/utils/models";
import { formatToPhone, useResponsibles } from "@/utils/methods";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";

import TextInput from "../Inputs/TextInput";
import SelectWithImages from "../Inputs/SelectWithImages";
import SolicitationTypeSelection from "../TechnicalAnalysisRequest/Blocks/SolicitationTypeSelection";
import RemoteUrban from "../TechnicalAnalysisRequest/RemoteUrban";
import RemoteRural from "../TechnicalAnalysisRequest/RemoteRural";
import InLocoUrban from "../TechnicalAnalysisRequest/InLoco";
import Drawing from "../TechnicalAnalysisRequest/Drawing";
import Budgeting from "../TechnicalAnalysisRequest/Budgeting";
import SelectInput from "../Inputs/SelectInput";
import ProjectAlteration from "../TechnicalAnalysisRequest/ProjectAlteration";
import Ampliation from "../TechnicalAnalysisRequest/Ampliation";

type RequestTechnicalAnalysisProps = {
	closeModal: () => void;
	project: IProject;
};
function getSellerContact(responsibles?: IResponsible[], responsibleId?: string) {
	if (responsibleId && responsibles) {
		const responsible = responsibles.filter((resp) => resp.id == responsibleId)[0];

		return responsible?.telefone ? responsible.telefone : "";
	} else {
		return "";
	}
}
function RequestTechnicalAnalysis({ closeModal, project }: RequestTechnicalAnalysisProps) {
	const { data: session } = useSession();
	const { data: responsibles } = useResponsibles();

	const [requestInfo, setRequestInfo] = useState<TTechnicalAnalysis>({
		nome: project.nome,
		status: "PENDENTE", // create a list of options
		complexidade: "SIMPLES",
		arquivosAuxiliares: "", // link de fotos do drone, por exemplo
		pendencias: [],
		anotacoes: "", // anotações gerais para auxilio ao analista
		tipoSolicitacao: null,
		analista: null,
		requerente: {
			idCRM: session?.user.id,
			nomeCRM: session?.user.nome,
			apelido: "",
			avatar_url: session?.user.image,
			contato: "", // telefone
		},
		projeto: {
			id: project._id,
			nome: project.nome,
			identificador: project.identificador,
		},
		localizacao: {
			cep: project.cliente?.cep,
			uf: project.cliente?.uf,
			cidade: project.cliente?.cidade,
			bairro: project.cliente?.bairro || "",
			endereco: project.cliente?.endereco || "",
			numeroOuIdentificador: project.cliente?.numeroOuIdentificador || "",
			distancia: 0,
		},
		equipamentos: {
			modulos: {
				modelo: "",
				qtde: "",
				potencia: "",
			},
			inversor: {
				modelo: "",
				qtde: "",
				potencia: "",
			},
		},
		padrao: [],
		transformador: {
			acopladoPadrao: false,
			codigo: "",
			potencia: 0,
		},
		execucao: {
			observacoes: "",
			memorial: null,
			espacoQGBT: false,
		},
		descritivo: [],
		servicosAdicionais: {
			alambrado: null,
			britagem: null,
			casaDeMaquinas: null,
			barracao: null,
			roteador: null,
			limpezaLocal: null,
			redeReligacao: null,
			terraplanagem: null,
			realimentar: false,
		},
		detalhes: {
			concessionaria: "",
			topologia: "MICRO-INVERSOR",
			materialEstrutura: null,
			tipoEstrutura: null,
			tipoTelha: null,
			fixacaoInversores: null,
			imagensDrone: false,
			imagensFachada: false,
			imagensSatelite: false,
			medicoes: false,
			orientacao: "",
			telhasReservas: null,
		},
		distancias: {
			conexaoInternet: "",
			cabeamentoCA: "", // inversor ao padrão
			cabeamentoCC: "", // modulos ao inversor
		},
		locais: {
			aterramento: "",
			inversor: "", // instalação do inversor, varannda, garagem, etc
			modulos: "", // instalação dos módulos, telhado, solo em x, solo em y, etc
		},
		custos: [],
		arquivos: [],
		alocacaoModulos: {
			leste: null,
			nordeste: null,
			noroeste: null,
			norte: null,
			oeste: null,
			sudeste: null,
			sudoeste: null,
			sul: null,
		},
		desenho: {
			observacoes: "",
			tipo: "", //
			url: "",
		},
		suprimentos: {
			observacoes: "",
			itens: [],
		},
		conclusao: {
			// UTILIZADO PELOS VENDEDORES
			observacoes: "",
			espaco: false, // possui espaço pra execução
			inclinacao: false, // necessitará estrutura de inclinação
			sombreamento: false, // possui sombra
			padrao: null,
			estrutura: null,
		},
		dataInsercao: new Date().toISOString(),
	});
	console.log("VISITA TÉCNIC", requestInfo);
	return (
		<div id="ContractRequest" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[90%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full w-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">SOLICITAÇÃO DE CONTRATO DE SISTEMA FOTOVOLTAICO</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto border-b border-gray-200 py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 ">
						<div className="my-1 flex w-full flex-wrap items-center justify-center gap-2">
							<SelectWithImages
								label="NOME DO REQUERENTE"
								options={responsibles?.map((resp) => ({ id: resp.id, label: resp.nome, value: resp, url: resp.avatar_url, fallback: "R" })) || []}
								value={requestInfo.requerente.idCRM}
								handleChange={(value) =>
									setRequestInfo((prev) => ({
										...prev,
										requerente: { ...prev.requerente, idCRM: value.id, nomeCRM: value.nome, avatar_url: value.avatar_url },
									}))
								}
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										requerente: {
											idCRM: session?.user.id,
											nomeCRM: session?.user.nome,
											apelido: "",
											avatar_url: session?.user.image,
											contato: "", // telefone
										},
									}))
								}
								resetOptionLabel="NÃO DEFINIDO"
							/>
							<TextInput
								label="TELEFONE DO VENDEDOR"
								value={requestInfo.requerente.contato || ""}
								placeholder="Preencha aqui o telefone do vendedor."
								handleChange={(value) =>
									setRequestInfo((prev) => ({
										...prev,
										requerente: { ...prev.requerente, contato: value },
									}))
								}
							/>
						</div>
						<div className="flex w-full flex-col items-center justify-around gap-2 px-2 lg:flex-row ">
							<div
								onClick={() => setRequestInfo((prev) => ({ ...prev, complexidade: "SIMPLES" }))}
								className={`cursor-pointer rounded border border-gray-500 p-2 font-Raleway font-bold ${
									requestInfo.complexidade == "SIMPLES" ? "bg-gray-500 text-white" : "bg-transparent text-gray-500"
								} `}
							>
								ESTUDO SIMPLES (36 HORAS)
							</div>
							<div
								onClick={() => setRequestInfo((prev) => ({ ...prev, complexidade: "INTERMEDIÁRIO" }))}
								className={`cursor-pointer rounded border border-gray-800 p-2 font-Raleway font-bold ${
									requestInfo.complexidade == "INTERMEDIÁRIO" ? "bg-gray-800 text-white" : "bg-transparent text-gray-800"
								} `}
							>
								ESTUDO INTERMEDIÁRIO (48 HORAS)
							</div>
							<div
								onClick={() => setRequestInfo((prev) => ({ ...prev, complexidade: "COMPLEXO" }))}
								className={`cursor-pointer rounded border border-blue-800 p-2 font-Raleway font-bold ${
									requestInfo.complexidade == "COMPLEXO" ? "bg-blue-800 text-white" : "bg-transparent text-blue-800"
								} `}
							>
								ESTUDO COMPLEXO (72 HORAS)
							</div>
						</div>
						{!requestInfo.tipoSolicitacao ? (
							<SolicitationTypeSelection
								selectType={(value) =>
									setRequestInfo((prev) => ({
										...prev,
										tipoSolicitacao: value,
									}))
								}
							/>
						) : null}
						{requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - URBANA" ? (
							<RemoteUrban
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								resetSolicitationType={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoSolicitacao: undefined,
									}))
								}
								projectId={project._id}
							/>
						) : null}
						{requestInfo.tipoSolicitacao == "VISITA TÉCNICA REMOTA - RURAL" ? (
							<RemoteRural
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								resetSolicitationType={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoSolicitacao: undefined,
									}))
								}
								projectId={project._id}
							/>
						) : null}
						{requestInfo.tipoSolicitacao == "VISITA TÉCNICA IN LOCO - URBANA" || requestInfo.tipoSolicitacao == "VISITA TÉCNICA IN LOCO - RURAL" ? (
							<InLocoUrban
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								resetSolicitationType={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoSolicitacao: undefined,
									}))
								}
								projectCode={project.identificador}
								projectId={project._id}
							/>
						) : null}
						{requestInfo.tipoSolicitacao == "DESENHO PERSONALIZADO" ? (
							<Drawing
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								resetSolicitationType={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoSolicitacao: undefined,
									}))
								}
								projectCode={project.identificador}
								projectId={project._id}
							/>
						) : null}
						{requestInfo.tipoSolicitacao == "ORÇAMENTAÇÃO" ? (
							<Budgeting
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								resetSolicitationType={() =>
									setRequestInfo((prev) => ({
										...prev,
										tipoSolicitacao: undefined,
									}))
								}
								projectCode={project.identificador}
								projectId={project._id}
							/>
						) : null}
						{requestInfo.tipoSolicitacao == "ALTERAÇÃO DE PROJETO" ? (
							<ProjectAlteration
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								resetSolicitationType={() => setRequestInfo((prev) => ({ ...prev, tipoSolicitacao: undefined }))}
								projectId={project._id}
							/>
						) : null}
						{requestInfo.tipoSolicitacao == "AUMENTO DE SISTEMA" ? (
							<Ampliation
								requestInfo={requestInfo}
								setRequestInfo={setRequestInfo}
								resetSolicitationType={() => setRequestInfo((prev) => ({ ...prev, tipoSolicitacao: undefined }))}
								projectId={project._id}
							/>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}

export default RequestTechnicalAnalysis;
