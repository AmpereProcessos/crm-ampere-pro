import { useProjectById } from "@/utils/queries/project";
import { TChangesControl, TProjectDTOWithReferences } from "@/utils/schemas/project.schema";
import type { TUserSession } from "@/lib/auth/session";
import React, { useEffect, useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import ClientBlock from "./Blocks/ClientBlock";
import LoadingComponent from "@/components/utils/LoadingComponent";
import ErrorComponent from "@/components/utils/ErrorComponent";
import GeneralInformationBlock from "./Blocks/GeneralInformationBlock";
import ActiveHomologationBlock from "./Blocks/ActiveHomologationBlock";
import ActiveTechnicalAnalysisBlock from "./Blocks/ActiveTechnicalAnalysisBlock";
import SaleCompositionBlock from "./Blocks/SaleCompositionBlock";
import PaymentInformationBlock from "./Blocks/PaymentInformationBlock";
import DocumentsBlock from "./Blocks/DocumentsBlock";
import EntityReferencesBlock from "./Blocks/EntityReferencesBlock";
import ProjectProcessFlowBlock from "./Blocks/ProcessFlowBlock";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { editProjectRelatedEntities } from "@/utils/mutations/projects";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import PurchasesBlock from "@/components/Project/PurchasesBlock";

type GeneralControlModalProps = {
	projectId: string;
	session: TUserSession;
	closeModal: () => void;
};
function GeneralControlModal({ projectId, session, closeModal }: GeneralControlModalProps) {
	const queryClient = useQueryClient();
	const userHasClientEditPermission = session.user.permissoes.clientes.editar;
	const userHasPricingViewPermission = session.user.permissoes.precos.visualizar;
	const { data: project, isLoading, isError, isSuccess } = useProjectById({ id: projectId });
	const [infoHolder, setInfoHolder] = useState<TProjectDTOWithReferences | null>(null);
	const [changes, setChanges] = useState<TChangesControl>({
		project: {},
		client: {},
	});

	const {
		mutate: handleUpdates,
		isPending: updatesLoading,
		isSuccess: updatesSuccess,
	} = useMutationWithFeedback({
		queryClient,
		mutationKey: ["edit-project-related-entities", projectId, project?.cliente.id],
		mutationFn: editProjectRelatedEntities,
		affectedQueryKey: ["project-by-id", projectId],
	});

	useEffect(() => {
		if (project) setInfoHolder(project);
	}, [project]);
	return (
		<div id="project-general-control" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[85%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">CONTROLE GERAL DO PROJETO</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Houve um erro ao buscar informações do projeto." /> : null}
					{isSuccess && !!infoHolder ? (
						<>
							<div className="flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
								<EntityReferencesBlock project={project} />
								<GeneralInformationBlock
									session={session}
									infoHolder={infoHolder}
									setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
									changes={changes}
									setChanges={setChanges}
								/>
								<ClientBlock
									infoHolder={infoHolder}
									setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
									changes={changes}
									setChanges={setChanges}
									userHasClientEditPermission={userHasClientEditPermission}
								/>
								<ActiveHomologationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>} />
								<ActiveTechnicalAnalysisBlock
									infoHolder={infoHolder}
									setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
									userHasPricingViewPermission={userHasPricingViewPermission}
								/>
								<SaleCompositionBlock
									infoHolder={infoHolder}
									setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
									changes={changes}
									setChanges={setChanges}
								/>
								<PaymentInformationBlock
									infoHolder={infoHolder}
									setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
									changes={changes}
									setChanges={setChanges}
								/>
								<PurchasesBlock project={project} session={session} />
								<DocumentsBlock
									projectId={projectId}
									clientId={infoHolder.cliente.id}
									opportunityId={infoHolder.oportunidade.id}
									analysisId={infoHolder.idAnaliseTecnica}
									homologationId={infoHolder.idHomologacao}
									session={session}
								/>
								<ProjectProcessFlowBlock projectId={projectId} />
							</div>
							<div className="flex w-full items-center justify-end pt-2">
								<button
									onClick={() => {
										const clientId = project.cliente.id;
										const projectChanges = changes.project;
										const clientChanges = changes.client;
										// @ts-ignore
										handleUpdates({ projectId, clientId, projectChanges, clientChanges });
									}}
									className="h-9 whitespace-nowrap rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-800 enabled:hover:text-white"
								>
									ATUALIZAR
								</button>
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default GeneralControlModal;
