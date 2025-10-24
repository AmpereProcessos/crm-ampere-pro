import Budgeting from "@/components/TechnicalAnalysis/Solicitations/Budgeting";
import Drawing from "@/components/TechnicalAnalysis/Solicitations/Drawing";
import Inloco from "@/components/TechnicalAnalysis/Solicitations/InLoco";
import RemoteRural from "@/components/TechnicalAnalysis/Solicitations/RemoteRural";
import RemoteUrban from "@/components/TechnicalAnalysis/Solicitations/RemoteUrban";
import SolicitationTypeSelection from "@/components/TechnicalAnalysis/Stages/SolicitationTypeSelection";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { uploadFile } from "@/lib/methods/firebase";
import { storage } from "@/services/firebase/storage-config";
import { fileTypes } from "@/utils/constants";
import { createManyFileReferences } from "@/utils/mutations/file-references";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createTechnicalAnalysis } from "@/utils/mutations/technical-analysis";
import { TFileHolder, TFileReference } from "@/utils/schemas/file-reference.schema";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { useQueryClient } from "@tanstack/react-query";
import { getMetadata, ref } from "firebase/storage";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsFillClipboardCheckFill } from "react-icons/bs";
import { VscChromeClose } from "react-icons/vsc";

type NewTechnicalAnalysisProps = {
	session: TUserSession;
	opportunity: TOpportunityDTOWithClient;
	closeModal: () => void;
};
function NewTechnicalAnalysis({ session, opportunity, closeModal }: NewTechnicalAnalysisProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TTechnicalAnalysis>({
		idParceiro: session.user.idParceiro || "",
		nome: opportunity.nome,
		status: "PENDENTE", // create a list of options
		complexidade: null,
		arquivosAuxiliares: "", // link de fotos do drone, por exemplo
		pendencias: [],
		anotacoes: "", // anotações gerais para auxilio ao analista
		tipoSolicitacao: "",
		analista: null,
		requerente: {
			id: session?.user.id,
			nome: session?.user.nome,
			apelido: "",
			avatar_url: session?.user.avatar_url,
			contato: "", // telefone
		},
		oportunidade: {
			id: opportunity._id,
			nome: opportunity.nome,
			identificador: opportunity.identificador,
		},
		localizacao: {
			cep: opportunity.localizacao?.cep || "",
			uf: opportunity.localizacao?.uf,
			cidade: opportunity.localizacao?.cidade,
			bairro: opportunity.localizacao?.bairro || "",
			endereco: opportunity.localizacao?.endereco || "",
			numeroOuIdentificador: opportunity.localizacao?.numeroOuIdentificador || "",
		},
		equipamentosAnteriores: [],
		equipamentos: [],
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
	const [files, setFiles] = useState<TFileHolder>({});
	async function handleUploadFiles({ files, analysisId }: { files: TFileHolder; analysisId: string }) {
		var links: TFileReference[] = [];
		try {
			const uploadPromises = Object.entries(files).map(async ([key, value]) => {
				const file = value;
				if (!file) return;
				if (typeof file == "string") {
					const fileRef = ref(storage, file);
					const metaData = await getMetadata(fileRef);
					const format = metaData.contentType && fileTypes[metaData.contentType] ? fileTypes[metaData.contentType].title : "INDEFINIDO";
					const link: TFileReference = {
						idParceiro: session.user.idParceiro || "",
						idAnaliseTecnica: analysisId,
						idOportunidade: opportunity._id,
						titulo: key,
						formato: format,
						url: file,
						tamanho: metaData.size,
						autor: {
							id: session.user.id,
							nome: session.user.nome,
							avatar_url: session.user.avatar_url,
						},
						dataInsercao: new Date().toISOString(),
					};
					links.push(link);
				}
				if (typeof file != "string") {
					const formattedFileName = key.toLowerCase().replaceAll(" ", "_");
					const vinculationId = analysisId;
					// Uploading file to Firebase and getting url and format
					const { url, format, size } = await uploadFile({ file: file, fileName: formattedFileName, vinculationId: vinculationId });
					const link: TFileReference = {
						idParceiro: session.user.idParceiro || "",
						idAnaliseTecnica: analysisId,
						titulo: key,
						formato: format,
						url: url,
						tamanho: size,
						autor: {
							id: session.user.id,
							nome: session.user.nome,
							avatar_url: session.user.avatar_url,
						},
						dataInsercao: new Date().toISOString(),
					};
					links.push(link);
				}
			});
			await Promise.all(uploadPromises);
			return links;
		} catch (error) {
			throw error;
		}
	}
	async function requestAnalysis({ info, files }: { info: TTechnicalAnalysis; files: TFileHolder }) {
		try {
			// Creating the technical analysis document in db via api call
			const creationLoadingToastId = toast.loading("Criando análise técnica...");
			const insertedAnalysisId = await createTechnicalAnalysis({ info, returnId: true });
			toast.dismiss(creationLoadingToastId);

			const fileUploadLoadingToastId = toast.loading("Subindo arquivos...");
			const links = await handleUploadFiles({ files: files, analysisId: insertedAnalysisId });
			const insertFileReferencesResponse = await createManyFileReferences({ info: links });
			toast.dismiss(fileUploadLoadingToastId);

			return "Análise técnica requisitada com sucesso !";
		} catch (error) {
			throw error;
		}
	}
	const {
		mutate: handleRequestAnalysis,
		isPending,
		isError,
		isSuccess,
	} = useMutationWithFeedback({
		mutationKey: ["create-technical-analysis"],
		mutationFn: requestAnalysis,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-technical-analysis", opportunity._id],
	});

	return (
		<div id="new-technical-analysis" className="fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]">
			<div className="relative left-[50%] top-[50%] z-100 h-[80%] max-h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-background p-[10px] lg:w-[80%]">
				<div className="flex h-full w-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-primary  ">NOVA ANÁLISE TÉCNICA</h3>
						<button
							onClick={() => closeModal()}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex h-full max-h-full overflow-y-auto">
						{isPending ? <LoadingComponent /> : null}
						{isError ? <ErrorComponent msg="Oops, houve um erro ao criar a análise técnica." /> : null}
						{isSuccess ? (
							<div className="flex w-full grow flex-col items-center justify-center gap-2 text-green-500">
								<BsFillClipboardCheckFill color="rgb(34,197,94)" size={35} />
								<p className="text-lg font-medium tracking-tight text-primary/70">Análise técnica requisitada com sucesso !</p>
							</div>
						) : null}
						{!isPending && !isError && !isSuccess ? (
							<>
								{!infoHolder.tipoSolicitacao ? (
									<SolicitationTypeSelection
										selectType={(value) =>
											setInfoHolder((prev) => ({
												...prev,
												tipoSolicitacao: value,
											}))
										}
									/>
								) : null}
								{infoHolder.tipoSolicitacao == "ANÁLISE TÉCNICA REMOTA URBANA" || infoHolder.tipoSolicitacao == "ANÁLISE TÉCNICA REMOTA" ? (
									<RemoteUrban
										session={session}
										activeProposalId={opportunity.idPropostaAtiva}
										infoHolder={infoHolder}
										setInfoHolder={setInfoHolder}
										resetSolicitationType={() =>
											setInfoHolder((prev) => ({
												...prev,
												tipoSolicitacao: "",
											}))
										}
										files={files}
										setFiles={setFiles}
										// @ts-ignore
										handleRequestAnalysis={handleRequestAnalysis}
									/>
								) : null}
								{infoHolder.tipoSolicitacao == "ANÁLISE TÉCNICA REMOTA RURAL" ? (
									<RemoteRural
										session={session}
										activeProposalId={opportunity.idPropostaAtiva}
										infoHolder={infoHolder}
										setInfoHolder={setInfoHolder}
										resetSolicitationType={() =>
											setInfoHolder((prev) => ({
												...prev,
												tipoSolicitacao: "",
											}))
										}
										files={files}
										setFiles={setFiles}
										// @ts-ignore
										handleRequestAnalysis={handleRequestAnalysis}
									/>
								) : null}
								{infoHolder.tipoSolicitacao == "ANÁLISE TÉCNICA IN LOCO" ? (
									<Inloco
										session={session}
										infoHolder={infoHolder}
										activeProposalId={opportunity.idPropostaAtiva}
										setInfoHolder={setInfoHolder}
										resetSolicitationType={() =>
											setInfoHolder((prev) => ({
												...prev,
												tipoSolicitacao: "",
											}))
										}
										files={files}
										setFiles={setFiles}
										// @ts-ignore
										handleRequestAnalysis={handleRequestAnalysis}
									/>
								) : null}
								{infoHolder.tipoSolicitacao == "DESENHO PERSONALIZADO" ? (
									<Drawing
										session={session}
										activeProposalId={opportunity.idPropostaAtiva}
										infoHolder={infoHolder}
										setInfoHolder={setInfoHolder}
										resetSolicitationType={() =>
											setInfoHolder((prev) => ({
												...prev,
												tipoSolicitacao: "",
											}))
										}
										files={files}
										setFiles={setFiles}
										// @ts-ignore
										handleRequestAnalysis={handleRequestAnalysis}
									/>
								) : null}
								{infoHolder.tipoSolicitacao == "ORÇAMENTAÇÃO" ? (
									<Budgeting
										session={session}
										activeProposalId={opportunity.idPropostaAtiva}
										infoHolder={infoHolder}
										setInfoHolder={setInfoHolder}
										resetSolicitationType={() =>
											setInfoHolder((prev) => ({
												...prev,
												tipoSolicitacao: "",
											}))
										}
										files={files}
										setFiles={setFiles}
										// @ts-ignore
										handleRequestAnalysis={handleRequestAnalysis}
									/>
								) : null}
							</>
						) : null}

						{/* {infoHolder.tipoSolicitacao == 'VISITA TÉCNICA IN LOCO - URBANA' || infoHolder.tipoSolicitacao == 'VISITA TÉCNICA IN LOCO - RURAL' ? (
              <InLocoUrban
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                resetSolicitationType={() =>
                  setInfoHolder((prev) => ({
                    ...prev,
                    tipoSolicitacao: undefined,
                  }))
                }
                projectCode={project.identificador}
                projectId={project._id}
              />
            ) : null}
            {infoHolder.tipoSolicitacao == 'DESENHO PERSONALIZADO' ? (
              <Drawing
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                resetSolicitationType={() =>
                  setInfoHolder((prev) => ({
                    ...prev,
                    tipoSolicitacao: undefined,
                  }))
                }
                projectCode={project.identificador}
                projectId={project._id}
              />
            ) : null}
            {infoHolder.tipoSolicitacao == 'ORÇAMENTAÇÃO' ? (
              <Budgeting
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                resetSolicitationType={() =>
                  setInfoHolder((prev) => ({
                    ...prev,
                    tipoSolicitacao: undefined,
                  }))
                }
                projectCode={project.identificador}
                projectId={project._id}
              />
            ) : null}
            {infoHolder.tipoSolicitacao == 'ALTERAÇÃO DE PROJETO' ? (
              <ProjectAlteration
                proposal={proposal}
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                resetSolicitationType={() => setInfoHolder((prev) => ({ ...prev, tipoSolicitacao: undefined }))}
                projectId={project._id}
              />
            ) : null}
            {infoHolder.tipoSolicitacao == 'AUMENTO DE SISTEMA' ? (
              <Ampliation
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                resetSolicitationType={() => setInfoHolder((prev) => ({ ...prev, tipoSolicitacao: undefined }))}
                projectId={project._id}
              />
            ) : null} */}
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewTechnicalAnalysis;
