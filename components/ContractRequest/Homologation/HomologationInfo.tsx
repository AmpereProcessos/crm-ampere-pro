import EquipmentsComposition from "@/app/components/Homologations/ModalBlocks/EquipmentsComposition";
import HolderInformation from "@/app/components/Homologations/ModalBlocks/HolderInformation";
import InstallationInformation from "@/app/components/Homologations/ModalBlocks/InstallationInformation";
import LocationInformation from "@/app/components/Homologations/ModalBlocks/LocationInformation";
import { getErrorMessage } from "@/lib/methods/errors";
import { editHomologation } from "@/utils/mutations/homologations";
import { useHomologationById } from "@/utils/queries/homologations";
import { TClientDTO } from "@/utils/schemas/client.schema";

import { TContractRequest } from "@/utils/schemas//contract-request.schema";
import { THomologation } from "@/utils/schemas/homologation.schema";
import { TOpportunityDTO } from "@/utils/schemas/opportunity.schema";

import type { TUserSession } from "@/lib/auth/session";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type HomologationInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	session: TUserSession;
	opportunity: TOpportunityDTO;
	client?: TClientDTO;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function HomologationInfo({ requestInfo, setRequestInfo, session, opportunity, client, goToPreviousStage, goToNextStage }: HomologationInfoProps) {
	const { data: homologation } = useHomologationById({ id: homologationId });
	const [infoHolder, setInfoHolder] = useState<THomologation>({
		status: "PENDENTE",
		idParceiro: session.user.idParceiro || "",
		oportunidade: {
			id: opportunity._id,
			nome: opportunity.nome,
		},
		titular: {
			nome: opportunity.instalacao.nomeTitular || "",
			identificador: client?.cpfCnpj || "",
			contato: client?.telefonePrimario || "",
		},
		requerente: {
			id: session.user.id,
			nome: session.user.nome,
			apelido: session.user.nome,
			contato: session.user.telefone || "",
			avatar_url: session.user.avatar_url,
		},
		potencia: 0,
		distribuidora: "",
		equipamentos: [],
		localizacao: {
			cep: opportunity.localizacao.cep,
			uf: opportunity.localizacao.uf,
			cidade: opportunity.localizacao.cidade,
			bairro: opportunity.localizacao.bairro,
			endereco: opportunity.localizacao.endereco,
			numeroOuIdentificador: opportunity.localizacao.numeroOuIdentificador,
			complemento: opportunity.localizacao.complemento,
			// distancia: z.number().optional().nullable(),
		},
		instalacao: {
			numeroInstalacao: opportunity.instalacao.numero || "",
			numeroCliente: "",
			grupo: opportunity.instalacao.grupo || "RESIDENCIAL",
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
	async function handleProceed() {
		try {
			// updating homologation object information with new data
			const updateResponse = await editHomologation({ id: homologationId, changes: { ...infoHolder, dataLiberacao: new Date().toISOString() } });
			// updating contract request formulary based on homologation information
			setRequestInfo((prev) => ({
				...prev,
				nomeTitularProjeto: infoHolder.titular.nome,
				tipoDoTitular: infoHolder.titular.identificador.length > 15 ? "PESSOA JURIDICA" : "PESSOA FISICA",
				tipoDaLigacao: "EXISTENTE",
				tipoDaInstalacao: infoHolder.instalacao.grupo == "RURAL" ? "RURAL" : "URBANO",
				cepInstalacao: infoHolder.localizacao.cep || "",
				ufInstalacao: infoHolder.localizacao.uf,
				cidadeInstalacao: infoHolder.localizacao.cidade,
				enderecoInstalacao: infoHolder.localizacao.endereco || "",
				bairroInstalacao: infoHolder.localizacao.bairro || "",
				numeroResInstalacao: infoHolder.localizacao.numeroOuIdentificador || "",
				numeroInstalacao: infoHolder.instalacao.numeroInstalacao,
			}));
			// proceeding to next stage
			goToNextStage();
		} catch (error) {
			const msg = getErrorMessage(error);
			toast.error(msg);
			throw error;
		}
	}

	useEffect(() => {
		if (homologation) setInfoHolder(homologation);
	}, [homologation]);
	return (
		<div className="flex w-full grow flex-col bg-background pb-2">
			<span className="mb-2 py-2 text-center text-sm font-bold uppercase text-[#15599a]">DADOS DE HOMOLOGAÇÃO</span>
			<HolderInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			<InstallationInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			<LocationInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			<EquipmentsComposition infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
				<button
					onClick={() => {
						goToPreviousStage();
					}}
					className="rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105"
				>
					Voltar
				</button>
				<button
					onClick={async () => {
						await handleProceed();
					}}
					className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default HomologationInfo;
