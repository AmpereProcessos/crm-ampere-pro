import { LoadingButton } from "@/components/Buttons/loading-button";
import AddressInformationBlock from "@/components/Opportunities/Creation/AddressInformationBlock";
import FunnelReferenceInformationBlock from "@/components/Opportunities/Creation/FunnelReferenceInformationBlock";
import GeneralInformationBlock from "@/components/Opportunities/Creation/GeneralInformationBlock";
import OpportunityClientInformationBlock from "@/components/Opportunities/Creation/OpportunityClientInformationBlock";
import ResponsiblesInformationBlock from "@/components/Opportunities/Creation/ResponsiblesInformationBlock";
import SimilarClients from "@/components/Opportunities/SimilarClients";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { TUserSession } from "@/lib/auth/session";
import { useMediaQuery } from "@/lib/utils";
import { TGetOpportunitiesQueryDefinitionsOutput } from "@/pages/api/opportunities/query-definitions";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createClientOpportunityAndFunnelReference } from "@/utils/mutations/opportunities";
import { useSearchClients } from "@/utils/queries/clients";
import { useProjectTypes } from "@/utils/queries/project-types";
import { useOpportunityCreators } from "@/utils/queries/users";
import type { TClient, TSimilarClientSimplifiedDTO } from "@/utils/schemas/client.schema";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TFunnelDTO } from "@/utils/schemas/funnel.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TUserDTOSimplified } from "@/utils/schemas/user.schema";
import { CustomersAcquisitionChannels } from "@/utils/select-options";
import { useQueryClient } from "@tanstack/react-query";
import createHttpError from "http-errors";
import { BadgeCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type NewOpportunityProps = {
	session: TUserSession;
	opportunityCreators: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterOptions"]["responsibles"];
	funnels: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterOptions"]["funnels"];
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
		queryClient,
		affectedQueryKey: ["opportunities"],
	});

	const MENU_TITLE = "NOVA OPORTUNIDADE";
	const MENU_DESCRIPTION = "Preencha os campos abaixo para criar uma nova oportunidade.";
	const BUTTON_TEXT = "CADASTRAR";
	return isDesktop ? (
		<Dialog onOpenChange={(v) => (v ? null : closeModal())} open>
			<DialogContent className="flex h-fit max-h-[80vh] min-h-[60vh] min-w-[80vw] flex-col dark:bg-background">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>
				{isSuccess ? (
					<div className="flex w-full grow flex-col items-center justify-center gap-2">
						<div className="flex flex-col items-center gap-1">
							<BadgeCheck className="h-10 min-h-10 w-10 min-w-10 text-green-500 lg:h-20 lg:w-20" />
							<h1 className="text-center font-bold text-lg text-primary tracking-tight">Oportunidade criada com sucesso!</h1>
						</div>
						<div className="flex flex-col items-center gap-2 lg:flex-row">
							<Button
								onClick={() => {
									setNewClient(initialClient);
									setNewOpportunity(initialOpportunity);
									setNewFunnelReference(initialFunnelReference);
									setSimilarClient(null);
									setCreateProjectId(null);
									resetMutation();
								}}
								variant={"secondary"}
							>
								NOVA OPORTUNIDADE
							</Button>
							<Link href={`/comercial/oportunidades/id/${createdProjectId}`}>
								<Button>VISUALIZAR OPORTUNIDADE</Button>
							</Link>
						</div>
					</div>
				) : (
					<>
						<div className="flex-1 overflow-auto">
							<NewOpportunityContent
								clientHolder={newClient}
								funnelReferenceHolder={newFunnelReference}
								funnels={funnels || []}
								opportunityHolder={newOpportunity}
								session={session}
								setClientHolder={setNewClient}
								setFunnelReferenceHolder={setNewFunnelReference}
								setOpportunityHolder={setNewOpportunity}
								setSimilarClientHolder={setSimilarClient}
								similarClientHolder={similarClient}
							/>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DialogClose>
							<LoadingButton
								loading={isPending}
								onClick={() =>
									// @ts-expect-error
									mutate()
								}
							>
								{BUTTON_TEXT}
							</LoadingButton>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	) : (
		<Drawer onOpenChange={(v) => (v ? null : closeModal())} open>
			<DrawerContent className="flex h-fit max-h-[70vh] flex-col">
				<DrawerHeader className="text-left">
					<DrawerTitle>{MENU_TITLE}</DrawerTitle>
					<DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
				</DrawerHeader>
				{isSuccess ? (
					<div className="flex w-full grow flex-col items-center justify-center gap-2">
						<div className="flex flex-col items-center gap-1">
							<BadgeCheck className="h-10 min-h-10 w-10 min-w-10 text-green-500 lg:h-20 lg:w-20" />
							<h1 className="text-center font-bold text-lg text-primary tracking-tight">Oportunidade criada com sucesso!</h1>
						</div>
						<div className="flex flex-col items-center gap-2 lg:flex-row">
							<Button
								onClick={() => {
									setNewClient(initialClient);
									setNewOpportunity(initialOpportunity);
									setNewFunnelReference(initialFunnelReference);
									setSimilarClient(null);
									setCreateProjectId(null);
									resetMutation();
								}}
								variant={"secondary"}
							>
								NOVA OPORTUNIDADE
							</Button>
							<Link href={`/comercial/oportunidades/id/${createdProjectId}`}>
								<Button>VISUALIZAR OPORTUNIDADE</Button>
							</Link>
						</div>
					</div>
				) : (
					<>
						<div className="flex-1 overflow-auto">
							<NewOpportunityContent
								clientHolder={newClient}
								funnelReferenceHolder={newFunnelReference}
								funnels={funnels || []}
								opportunityHolder={newOpportunity}
								session={session}
								setClientHolder={setNewClient}
								setFunnelReferenceHolder={setNewFunnelReference}
								setOpportunityHolder={setNewOpportunity}
								setSimilarClientHolder={setSimilarClient}
								similarClientHolder={similarClient}
							/>
						</div>
						<DrawerFooter>
							<DrawerClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DrawerClose>
							<LoadingButton
								loading={isPending}
								onClick={() =>
									// @ts-expect-error
									mutate()
								}
							>
								{BUTTON_TEXT}
							</LoadingButton>
						</DrawerFooter>
					</>
				)}
			</DrawerContent>
		</Drawer>
	);
}

export default NewOpportunity;

type NewOpportunityContentProps = {
	funnels: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterOptions"]["funnels"];
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
	funnels,
}: NewOpportunityContentProps) {
	const { data: projectTypes } = useProjectTypes();
	const { data: opportunityCreators } = useOpportunityCreators();
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [similarDrawerOpen, setSimilarDrawerOpen] = useState(false);
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
		const {
			nome,
			telefonePrimario,
			telefonePrimarioBase,
			email,
			autor,
			cpfCnpj,
			dataInsercao,
			cep,
			uf,
			cidade,
			bairro,
			endereco,
			numeroOuIdentificador,
			complemento,
		} = client;
		const location = {
			cep,
			uf,
			cidade,
			bairro,
			endereco,
			numeroOuIdentificador,
			complemento,
		};
		setOpportunityHolder((prev) => ({ ...prev, localizacao: location }));
		setClientHolder((prev) => ({
			...prev,
			nome,
			telefonePrimario,
			telefonePrimarioBase,
			email,
			cpfCnpj,
			autor,
		}));
		if (!isDesktop) setSimilarDrawerOpen(false);
		return toast.success("Cliente vinculado com sucesso !");
	}
	useEffect(() => {
		const getData = setTimeout(() => {
			refetch();
		}, 2000);
		return () => clearTimeout(getData);
	}, [clientHolder.cpfCnpj, clientHolder.email, clientHolder.telefonePrimario, refetch]);
	return (
		<div className="flex h-full w-full flex-col gap-6 px-4 lg:flex-row lg:px-0 relative">
			{/* Mobile floating bubble and nested drawer */}
			{!isDesktop && clientsSuccess && (similarClients?.length || 0) > 0 ? (
				<>
					<Button
						className="sticky top-0 right-5 z-100 lg:hidden shadow-md flex items-center gap-1 bg-[#15599a] text-white text-xs"
						onClick={() => setSimilarDrawerOpen(true)}
						variant="default"
						size={"xs"}
					>
						<UsersRound className="h-4 w-4" />
						{`${similarClients?.length ?? 0} CLIENTES ENCONTRADOS`}
					</Button>
					<Drawer open={similarDrawerOpen} onOpenChange={setSimilarDrawerOpen}>
						<DrawerContent className="flex max-h-[70vh] flex-col">
							<DrawerHeader className="text-left">
								<DrawerTitle>Clientes semelhantes</DrawerTitle>
								<DrawerDescription>Selecione um cliente para vincular à oportunidade.</DrawerDescription>
							</DrawerHeader>
							<div className="flex-1 overflow-auto px-2 pb-2">
								<SimilarClients
									clients={similarClients || []}
									handleSelectSimilarClient={handleSelectSimilarClient}
									isError={clientsError}
									isLoading={clientsLoading}
									isSuccess={clientsSuccess}
									selectedClientId={similarClientHolder?._id || null}
								/>
							</div>
						</DrawerContent>
					</Drawer>
				</>
			) : null}
			<div className="scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30 flex w-full flex-col gap-2 px-2 lg:h-full lg:max-h-full lg:w-[60%] lg:overflow-y-auto">
				<ResponsiblesInformationBlock
					opportunity={opportunityHolder}
					opportunityCreators={opportunityCreators || []}
					session={session}
					setOpportunity={setOpportunityHolder}
				/>
				<GeneralInformationBlock opportunity={opportunityHolder} projectTypes={projectTypes} session={session} setOpportunity={setOpportunityHolder} />
				<FunnelReferenceInformationBlock funnelReference={funnelReferenceHolder} funnels={funnels || []} setFunnelReference={setFunnelReferenceHolder} />
				<OpportunityClientInformationBlock
					client={clientHolder}
					opportunity={opportunityHolder}
					setClient={setClientHolder}
					setOpportunity={setOpportunityHolder}
					setSimilarClient={setSimilarClientHolder}
					similarClient={similarClientHolder}
					similarClients={similarClients || []}
				/>
				<AddressInformationBlock client={clientHolder} opportunity={opportunityHolder} setClient={setClientHolder} setOpportunity={setOpportunityHolder} />
			</div>
			<div className="hidden lg:flex w-full lg:w-[40%] sticky top-0">
				<SimilarClients
					clients={similarClients || []}
					handleSelectSimilarClient={handleSelectSimilarClient}
					isError={clientsError}
					isLoading={clientsLoading}
					isSuccess={clientsSuccess}
					selectedClientId={similarClientHolder?._id || null}
				/>
			</div>
		</div>
	);
}
