import type { TUserSession } from "@/lib/auth/session";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";

import { VscChromeClose } from "react-icons/vsc";

import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";

import AccessInformation from "@/app/components/Homologations/ModalBlocks/AccessInformation";
import ActivitiesInformation from "@/app/components/Homologations/ModalBlocks/ActivitiesInformation";
import ApplicantBlock from "@/app/components/Homologations/ModalBlocks/ApplicantBlock";
import DocumentationInformation from "@/app/components/Homologations/ModalBlocks/DocumentationInformation";
import EquipmentsComposition from "@/app/components/Homologations/ModalBlocks/EquipmentsComposition";
import HomologationFiles from "@/app/components/Homologations/ModalBlocks/Files";
import HolderInformation from "@/app/components/Homologations/ModalBlocks/HolderInformation";
import InstallationInformation from "@/app/components/Homologations/ModalBlocks/InstallationInformation";
import LocationInformation from "@/app/components/Homologations/ModalBlocks/LocationInformation";
import StatusInformation from "@/app/components/Homologations/ModalBlocks/StatusInformation";
import UpdatesInformation from "@/app/components/Homologations/ModalBlocks/UpdatesInformation";
import VistoryInformation from "@/app/components/Homologations/ModalBlocks/VistoryInformation";

import { getErrorMessage } from "@/lib/methods/errors";

import type {
	THomologation,
	THomologationDTO,
} from "@/utils/schemas/homologation.schema";

import { useHomologationById } from "@/utils/queries/homologations";

import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { editHomologation } from "@/utils/mutations/homologations";
import OpportunityInformationBlock from "../../Homologations/ModalBlocks/OpportunityInformationBlock";
import PendenciesInformation from "../../Homologations/ModalBlocks/PendenciesInformation";

type ControlHomologationProps = {
	homologationId: string;
	session: TUserSession;
	closeModal: () => void;
};
function ControlHomologation({
	homologationId,
	session,
	closeModal,
}: ControlHomologationProps) {
	const queryClient = useQueryClient();
	const {
		data: homologation,
		isLoading,
		isError,
		isSuccess,
		error,
	} = useHomologationById({ id: homologationId });
	const [infoHolder, setInfoHolder] = useState<THomologationDTO>({
		_id: "id-holder",
		status: "PENDENTE",
		distribuidora: "",
		pendencias: {},
		idParceiro: session.user.idParceiro || "",
		oportunidade: {
			id: "",
			nome: "",
		},
		requerente: {
			id: session.user.id,
			nome: session.user.nome,
			apelido: session.user.nome,
			contato: session.user.telefone || "",
			avatar_url: session.user.avatar_url,
		},
		titular: {
			nome: "",
			identificador: "",
			contato: "",
		},
		equipamentos: [],
		localizacao: {
			cep: null,
			uf: "",
			cidade: "",
			bairro: null,
			endereco: null,
			numeroOuIdentificador: null,
			complemento: null,
			// distancia: z.number().optional().nullable(),
		},
		instalacao: {
			numeroInstalacao: "",
			numeroCliente: "",
			grupo: "RESIDENCIAL",
			dependentes: [],
		},
		documentacao: {
			formaAssinatura: "FÍSICA",
			dataLiberacao: null,
			dataAssinatura: null,
		},
		acesso: {
			codigo: "",
			dataSolicitacao: null,
			dataResposta: null,
		},
		atualizacoes: [],
		vistoria: {
			dataSolicitacao: null,
			dataEfetivacao: null,
		},
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});

	const { mutate: handleUpdateHomologation, isPending } =
		useMutationWithFeedback({
			mutationKey: ["edit-homologation", homologationId],
			mutationFn: editHomologation,
			queryClient: queryClient,
			affectedQueryKey: ["homologations"],
		});
	useEffect(() => {
		if (homologation) setInfoHolder(homologation);
	}, [homologation]);

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR HOMOLOGAÇÃO"
			menuDescription="Preencha os campos abaixo para atualizar a homologação."
			menuActionButtonText="ATUALIZAR HOMOLOGAÇÃO"
			menuCancelButtonText="FECHAR"
			closeMenu={closeModal}
			actionFunction={() =>
				handleUpdateHomologation({ id: homologationId, changes: infoHolder })
			}
			actionIsLoading={isPending}
			stateIsLoading={isLoading}
			stateError={isError ? getErrorMessage(error) : null}
			dialogVariant="lg"
		>
			<StatusInformation
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			{homologation ? (
				<ActivitiesInformation
					session={session}
					homologation={homologation}
					opportunity={homologation.oportunidade}
				/>
			) : null}
			<UpdatesInformation
				session={session}
				infoHolder={infoHolder}
				setInfoHolder={setInfoHolder}
			/>
			<PendenciesInformation
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			<OpportunityInformationBlock
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			<ApplicantBlock
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			<HolderInformation
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			<HomologationFiles session={session} homologationId={homologationId} />
			<InstallationInformation
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			<LocationInformation
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			<EquipmentsComposition
				infoHolder={infoHolder}
				setInfoHolder={
					setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>
				}
			/>
			<DocumentationInformation
				infoHolder={infoHolder}
				setInfoHolder={setInfoHolder}
			/>
			<AccessInformation
				infoHolder={infoHolder}
				setInfoHolder={setInfoHolder}
			/>
			<VistoryInformation
				infoHolder={infoHolder}
				setInfoHolder={setInfoHolder}
			/>
		</ResponsiveDialogDrawer>
	);
}

export default ControlHomologation;
