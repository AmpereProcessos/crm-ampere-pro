import React, { useEffect, useState } from "react";
import type { TUserSession } from "@/lib/auth/session";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { VscChromeClose } from "react-icons/vsc";
import type { stateCities } from "../../../utils/estados_cidades";

import { useSearchClients } from "@/utils/queries/clients";
import { CustomersAcquisitionChannels } from "@/utils/select-options";
import { getCEPInfo } from "@/utils/methods";

import type { TUserDTOSimplified } from "@/utils/schemas/user.schema";
import type { TClient, TSimilarClientSimplifiedDTO } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TFunnelDTO } from "@/utils/schemas/funnel.schema";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";

import { createClientOpportunityAndFunnelReference } from "@/utils/mutations/opportunities";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";

import { useProjectTypes } from "@/utils/queries/project-types";
import SimilarClients from "@/components/Opportunities/SimilarClients";
import ResponsiblesInformationBlock from "@/components/Opportunities/Creation/ResponsiblesInformationBlock";
import GeneralInformationBlock from "@/components/Opportunities/Creation/GeneralInformationBlock";
import FunnelReferenceInformationBlock from "@/components/Opportunities/Creation/FunnelReferenceInformationBlock";
import OpportunityClientInformationBlock from "@/components/Opportunities/Creation/OpportunityClientInformationBlock";
import AddressInformationBlock from "@/components/Opportunities/Creation/AddressInformationBlock";
import { LoadingButton } from "@/components/Buttons/loading-button";

type NewOpportunityProps = {
	session: TUserSession;
	opportunityCreators: TUserDTOSimplified[];
	funnels: TFunnelDTO[];
	closeModal: () => void;
};
function NewOpportunity({ session, closeModal, opportunityCreators, funnels }: NewOpportunityProps) {
	const queryClient = useQueryClient();
	const { data: projectTypes } = useProjectTypes();
	const [similarClient, setSimilarClient] = useState<TSimilarClientSimplifiedDTO | null>(null);
	const [newClient, setNewClient] = useState<TClient & { _id?: string | null }>({
		_id: null,
		nome: "",
		idParceiro: session.user.idParceiro || "",
		cpfCnpj: null,
		telefonePrimario: "",
		telefoneSecundario: "",
		email: "",
		cep: null,
		uf: "",
		cidade: "",
		bairro: null,
		endereco: null,
		numeroOuIdentificador: null,
		complemento: null,
		dataNascimento: undefined,
		profissao: undefined,
		canalAquisicao: CustomersAcquisitionChannels[0].value,
		dataInsercao: new Date().toISOString(),
		idMarketing: undefined,
		indicador: {
			contato: null,
			nome: null,
		},
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
	});
	const [newOpportunity, setNewOpportunity] = useState<TOpportunity>({
		nome: "",
		idParceiro: session.user.idParceiro || "",
		tipo: {
			id: "6615785ddcb7a6e66ede9785",
			titulo: "SISTEMA FOTOVOLTAICO",
		},
		categoriaVenda: "KIT",
		descricao: "",
		identificador: "",
		responsaveis: [],
		segmento: "RESIDENCIAL",
		idCliente: "",
		cliente: {
			nome: "",
			cpfCnpj: "",
			telefonePrimario: "",
			email: "",
			canalAquisicao: CustomersAcquisitionChannels[0].value,
		},
		localizacao: {
			cep: null,
			uf: "",
			cidade: "",
			bairro: undefined,
			endereco: undefined,
			numeroOuIdentificador: undefined,
			complemento: undefined,
			// distancia: z.number().optional().nullable(),
		},
		perda: {
			idMotivo: undefined,
			descricaoMotivo: undefined,
			data: undefined,
		},
		ganho: {
			idProjeto: undefined,
			data: undefined,
		},
		instalacao: {
			concessionaria: null,
			numero: undefined,
			grupo: undefined,
			tipoLigacao: undefined,
			tipoTitular: undefined,
			nomeTitular: undefined,
		},
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
		// adicionar contrato e solicitação de contrato futuramente
	});
	const [newFunnelReference, setNewFunnelReference] = useState<TFunnelReference>({
		idParceiro: session.user.idParceiro || "",
		idOportunidade: "id-holder",
		idFunil: "",
		idEstagioFunil: "",
		estagios: {},
		dataInsercao: new Date().toISOString(),
	});

	const {
		data: similarClients,
		isSuccess: clientsSuccess,
		isLoading: clientsLoading,
		isError: clientsError,
		refetch,
	} = useSearchClients({
		cpfCnpj: newClient.cpfCnpj || "",
		email: newClient.email || "",
		phoneNumber: newClient.telefonePrimario,
		enabled: false,
	});
	const [createdProjectId, setCreateProjectId] = useState<string | null>(null);

	async function handleOpportunityCreation() {
		try {
			const insertedOpportunityId = await createClientOpportunityAndFunnelReference({
				clientId: similarClient?._id || null,
				client: newClient,
				opportunity: newOpportunity,
				funnelReference: newFunnelReference,
				returnId: true,
			});
			setCreateProjectId(insertedOpportunityId);
			return "Oportunidade criada com sucesso !";
		} catch (error) {
			console.log("Error creating the opportunity");
			throw error;
		}
	}
	const { mutate, isPending, isSuccess } = useMutationWithFeedback({
		mutationKey: ["create-project"],
		mutationFn: handleOpportunityCreation,
		queryClient: queryClient,
		affectedQueryKey: ["opportunities"],
	});

	function handleSelectSimilarClient(client: TSimilarClientSimplifiedDTO) {
		setSimilarClient(client);
		const { nome, telefonePrimario, email, autor, cpfCnpj, dataInsercao, cep, uf, cidade, bairro, endereco, numeroOuIdentificador, complemento } = client;
		const location = { cep, uf, cidade, bairro, endereco, numeroOuIdentificador, complemento };
		setNewOpportunity((prev) => ({ ...prev, localizacao: location }));
		setNewClient((prev) => ({ ...prev, nome, telefonePrimario, email, cpfCnpj, autor }));
		return toast.success("Cliente vinculado com sucesso !");
	}
	useEffect(() => {
		const getData = setTimeout(() => {
			refetch();
		}, 2000);
		return () => clearTimeout(getData);
	}, [newClient.cpfCnpj, newClient.email, newClient.telefonePrimario]);
	console.log("OPORTUNIDADE", newOpportunity);
	return (
		<div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[90%] w-[95%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVA OPORTUNIDADE</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto border-b border-gray-300 py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 lg:flex-row">
						<div className="flex w-full flex-col gap-2 px-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 lg:h-full lg:max-h-full lg:w-[60%] lg:overflow-y-auto">
							<ResponsiblesInformationBlock session={session} opportunity={newOpportunity} setOpportunity={setNewOpportunity} opportunityCreators={opportunityCreators} />
							<GeneralInformationBlock opportunity={newOpportunity} setOpportunity={setNewOpportunity} projectTypes={projectTypes} session={session} />
							<FunnelReferenceInformationBlock funnelReference={newFunnelReference} setFunnelReference={setNewFunnelReference} funnels={funnels || []} />
							<OpportunityClientInformationBlock
								opportunity={newOpportunity}
								setOpportunity={setNewOpportunity}
								client={newClient}
								setClient={setNewClient}
								similarClient={similarClient}
								setSimilarClient={setSimilarClient}
								similarClients={similarClients || []}
							/>
							<AddressInformationBlock opportunity={newOpportunity} setOpportunity={setNewOpportunity} client={newClient} setClient={setNewClient} />
						</div>
						<div className="flex w-full lg:w-[40%]">
							<SimilarClients
								clients={similarClients || []}
								isSuccess={clientsSuccess}
								isLoading={clientsLoading}
								isError={clientsError}
								selectedClientId={similarClient?._id || null}
								handleSelectSimilarClient={handleSelectSimilarClient}
							/>
						</div>
					</div>
					<div className="my-2 flex w-full flex-col items-center justify-center gap-4 px-4 lg:flex-row lg:justify-end">
						{createdProjectId ? (
							<Link href={`/comercial/oportunidades/id/${createdProjectId}`}>
								<button type="button" className="rounded bg-green-500 px-2 py-1 text-xs font-medium tracking-tight text-white duration-300 ease-in-out hover:bg-green-600 lg:text-base">
									IR PARA O PROJETO CRIADO
								</button>
							</Link>
						) : null}
						{!createdProjectId ? (
							<LoadingButton
								loading={isPending}
								onClick={() =>
									// @ts-ignore
									mutate()
								}
							>
								CRIAR OPORTUNIDADE
							</LoadingButton>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewOpportunity;
