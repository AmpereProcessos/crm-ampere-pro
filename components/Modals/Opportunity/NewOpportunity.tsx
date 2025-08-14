import React, { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import type { TUserSession } from "@/lib/auth/session";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import { useSearchClients } from "@/utils/queries/clients";
import { CustomersAcquisitionChannels } from "@/utils/select-options";

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
import { useMediaQuery } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import createHttpError from "http-errors";

type NewOpportunityProps = {
	session: TUserSession;
	opportunityCreators: TUserDTOSimplified[];
	funnels: TFunnelDTO[];
	closeModal: () => void;
};
function NewOpportunity({ session, closeModal, opportunityCreators, funnels }: NewOpportunityProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const queryClient = useQueryClient();
	const { data: projectTypes } = useProjectTypes();
	const [similarClient, setSimilarClient] = useState<TSimilarClientSimplifiedDTO | null>(null);
	const initialClient = {
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
	};
	const initialOpportunity: TOpportunity = {
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
	};
	const initialFunnelReference = {
		idParceiro: session.user.idParceiro || "",
		idOportunidade: "id-holder",
		idFunil: "",
		idEstagioFunil: "",
		estagios: {},
		dataInsercao: new Date().toISOString(),
	};
	const [newClient, setNewClient] = useState<TClient & { _id?: string | null }>(initialClient);
	const [newOpportunity, setNewOpportunity] = useState<TOpportunity>(initialOpportunity);
	const [newFunnelReference, setNewFunnelReference] = useState<TFunnelReference>(initialFunnelReference);

	const [createdProjectId, setCreateProjectId] = useState<string | null>(null);

	async function handleOpportunityCreation() {
		try {
			if (newClient.telefonePrimario.trim().length < 14 && newClient.cpfCnpj && newClient.cpfCnpj?.trim().length < 14) {
				throw new createHttpError.BadRequest("Telefone ou CPF/CNPJ são obrigatórios.");
			}
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
	const {
		mutate,
		isPending,
		isSuccess,
		reset: resetMutation,
	} = useMutationWithFeedback({
		mutationKey: ["create-project"],
		mutationFn: handleOpportunityCreation,
		queryClient: queryClient,
		affectedQueryKey: ["opportunities"],
	});

	const MENU_TITLE = "NOVA OPORTUNIDADE";
	const MENU_DESCRIPTION = "Preencha os campos abaixo para criar uma nova oportunidade.";
	const BUTTON_TEXT = "CADASTRAR";
	return isDesktop ? (
		<Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DialogContent className="flex flex-col h-fit min-h-[60vh] max-h-[80vh] dark:bg-white min-w-[80vw]">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>
				{!isSuccess ? (
					<>
						<div className="flex-1 overflow-auto">
							<NewOpportunityContent
								session={session}
								clientHolder={newClient}
								setClientHolder={setNewClient}
								opportunityHolder={newOpportunity}
								setOpportunityHolder={setNewOpportunity}
								funnelReferenceHolder={newFunnelReference}
								setFunnelReferenceHolder={setNewFunnelReference}
								similarClientHolder={similarClient}
								setSimilarClientHolder={setSimilarClient}
								opportunityCreators={opportunityCreators}
								funnels={funnels || []}
							/>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DialogClose>
							<LoadingButton
								onClick={() =>
									// @ts-ignore
									mutate()
								}
								loading={isPending}
							>
								{BUTTON_TEXT}
							</LoadingButton>
						</DialogFooter>
					</>
				) : (
					<div className="grow w-full flex flex-col items-center justify-center gap-2">
						<div className="flex flex-col gap-1 items-center">
							<BadgeCheck className="w-10 h-10 lg:w-20 lg:h-20 min-w-10 min-h-10 text-green-500" />
							<h1 className="text-lg font-bold text-primary tracking-tight text-center">Oportunidade criada com sucesso!</h1>
						</div>
						<div className="flex items-center gap-2 flex-col lg:flex-row">
							<Button
								variant={"secondary"}
								onClick={() => {
									setNewClient(initialClient);
									setNewOpportunity(initialOpportunity);
									setNewFunnelReference(initialFunnelReference);
									setSimilarClient(null);
									setCreateProjectId(null);
									resetMutation();
								}}
							>
								NOVA OPORTUNIDADE
							</Button>
							<Link href={`/comercial/oportunidades/id/${createdProjectId}`}>
								<Button>VISUALIZAR OPORTUNIDADE</Button>
							</Link>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	) : (
		<Drawer open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DrawerContent className="h-fit max-h-[70vh] flex flex-col">
				<DrawerHeader className="text-left">
					<DrawerTitle>{MENU_TITLE}</DrawerTitle>
					<DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
				</DrawerHeader>
				{!isSuccess ? (
					<>
						<div className="flex-1 overflow-auto">
							<NewOpportunityContent
								session={session}
								clientHolder={newClient}
								setClientHolder={setNewClient}
								opportunityHolder={newOpportunity}
								setOpportunityHolder={setNewOpportunity}
								funnelReferenceHolder={newFunnelReference}
								setFunnelReferenceHolder={setNewFunnelReference}
								similarClientHolder={similarClient}
								setSimilarClientHolder={setSimilarClient}
								opportunityCreators={opportunityCreators}
								funnels={funnels || []}
							/>
						</div>
						<DrawerFooter>
							<DrawerClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DrawerClose>
							<LoadingButton
								onClick={() =>
									// @ts-ignore
									mutate()
								}
								loading={isPending}
							>
								{BUTTON_TEXT}
							</LoadingButton>
						</DrawerFooter>
					</>
				) : (
					<div className="grow w-full flex flex-col items-center justify-center gap-2">
						<div className="flex flex-col gap-1 items-center">
							<BadgeCheck className="w-10 h-10 lg:w-20 lg:h-20 min-w-10 min-h-10 text-green-500" />
							<h1 className="text-lg font-bold text-primary tracking-tight text-center">Oportunidade criada com sucesso!</h1>
						</div>
						<div className="flex items-center gap-2 flex-col lg:flex-row">
							<Button
								variant={"secondary"}
								onClick={() => {
									setNewClient(initialClient);
									setNewOpportunity(initialOpportunity);
									setNewFunnelReference(initialFunnelReference);
									setSimilarClient(null);
									setCreateProjectId(null);
									resetMutation();
								}}
							>
								NOVA OPORTUNIDADE
							</Button>
							<Link href={`/comercial/oportunidades/id/${createdProjectId}`}>
								<Button>VISUALIZAR OPORTUNIDADE</Button>
							</Link>
						</div>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
}

export default NewOpportunity;

type NewOpportunityContentProps = {
	opportunityCreators: TUserDTOSimplified[];
	funnels: TFunnelDTO[];
	session: TUserSession;
	clientHolder: TClient;
	setClientHolder: Dispatch<SetStateAction<TClient>>;
	opportunityHolder: TOpportunity;
	setOpportunityHolder: Dispatch<SetStateAction<TOpportunity>>;
	funnelReferenceHolder: TFunnelReference;
	setFunnelReferenceHolder: Dispatch<SetStateAction<TFunnelReference>>;
	similarClientHolder: TSimilarClientSimplifiedDTO | null;
	setSimilarClientHolder: Dispatch<SetStateAction<TSimilarClientSimplifiedDTO | null>>;
};
function NewOpportunityContent({
	session,
	clientHolder,
	setClientHolder,
	opportunityHolder,
	setOpportunityHolder,
	funnelReferenceHolder,
	setFunnelReferenceHolder,
	similarClientHolder,
	setSimilarClientHolder,
	opportunityCreators,
	funnels,
}: NewOpportunityContentProps) {
	const { data: projectTypes } = useProjectTypes();
	const {
		data: similarClients,
		isSuccess: clientsSuccess,
		isLoading: clientsLoading,
		isError: clientsError,
		refetch,
	} = useSearchClients({
		cpfCnpj: clientHolder.cpfCnpj || "",
		email: clientHolder.email || "",
		phoneNumber: clientHolder.telefonePrimario,
		enabled: false,
	});
	function handleSelectSimilarClient(client: TSimilarClientSimplifiedDTO) {
		setSimilarClientHolder(client);
		const { nome, telefonePrimario, email, autor, cpfCnpj, dataInsercao, cep, uf, cidade, bairro, endereco, numeroOuIdentificador, complemento } = client;
		const location = { cep, uf, cidade, bairro, endereco, numeroOuIdentificador, complemento };
		setOpportunityHolder((prev) => ({ ...prev, localizacao: location }));
		setClientHolder((prev) => ({ ...prev, nome, telefonePrimario, email, cpfCnpj, autor }));
		return toast.success("Cliente vinculado com sucesso !");
	}
	useEffect(() => {
		const getData = setTimeout(() => {
			refetch();
		}, 2000);
		return () => clearTimeout(getData);
	}, [clientHolder.cpfCnpj, clientHolder.email, clientHolder.telefonePrimario]);
	return (
		<div className="flex h-full w-full flex-col gap-6 px-4 lg:flex-row lg:px-0">
			<div className="flex w-full flex-col gap-2 px-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 lg:h-full lg:max-h-full lg:w-[60%] lg:overflow-y-auto">
				<ResponsiblesInformationBlock session={session} opportunity={opportunityHolder} setOpportunity={setOpportunityHolder} opportunityCreators={opportunityCreators} />
				<GeneralInformationBlock opportunity={opportunityHolder} setOpportunity={setOpportunityHolder} projectTypes={projectTypes} session={session} />
				<FunnelReferenceInformationBlock funnelReference={funnelReferenceHolder} setFunnelReference={setFunnelReferenceHolder} funnels={funnels || []} />
				<OpportunityClientInformationBlock
					opportunity={opportunityHolder}
					setOpportunity={setOpportunityHolder}
					client={clientHolder}
					setClient={setClientHolder}
					similarClient={similarClientHolder}
					setSimilarClient={setSimilarClientHolder}
					similarClients={similarClients || []}
				/>
				<AddressInformationBlock opportunity={opportunityHolder} setOpportunity={setOpportunityHolder} client={clientHolder} setClient={setClientHolder} />
			</div>
			<div className="flex w-full lg:w-[40%]">
				<SimilarClients
					clients={similarClients || []}
					isSuccess={clientsSuccess}
					isLoading={clientsLoading}
					isError={clientsError}
					selectedClientId={similarClientHolder?._id || null}
					handleSelectSimilarClient={handleSelectSimilarClient}
				/>
			</div>
		</div>
	);
}
