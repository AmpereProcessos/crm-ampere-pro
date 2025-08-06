"use client";
import { TServiceOrder, TServiceOrderWithProjectAndAnalysis } from "@/utils/schemas/service-order.schema";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import GeneralInformationBlock from "./Blocks/GeneralInformationBlock";
import ResponsibleInformationBlock from "./Blocks/ResponsibleInformationBlock";
import FavoredInformationBlock from "./Blocks/FavoredInformationBlock";
import ProjectInformationBlock from "./Blocks/ProjectInformationBlock";
import LocationInformationBlock from "./Blocks/LocationInformationBlock";
import MaterialsInformationBlock from "./Blocks/MaterialsInformationBlock";
import TechnicalAnalysisBlock from "./Blocks/TechnicalAnalysisBlock";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createServiceOrder } from "@/utils/mutations/service-orders";
import { useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import PeriodInformationBlock from "./Blocks/PeriodInformationBlock";
import ReportInformationBlock from "./Blocks/ReportInformationBlock";

type NewServiceOrderProps = {
	session: TUserSession;
	closeModal: () => void;
};
function NewServiceOrder({ session, closeModal }: NewServiceOrderProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TServiceOrderWithProjectAndAnalysis>({
		idParceiro: "",
		categoria: "OUTROS",
		descricao: "",
		urgencia: "URGENTE",
		favorecido: {
			nome: "",
			contato: "",
		},
		projeto: {},
		responsaveis: [],
		observacoes: [],
		localizacao: {
			cep: "",
			uf: "",
			cidade: "",
			bairro: "",
			endereco: "",
			numeroOuIdentificador: "",
		},
		periodo: {},
		registros: [],
		materiais: {
			disponiveis: [],
			retiraveis: [],
		},
		anotacoes: "",
		relatorio: {
			aplicavel: false,
			secoes: [],
		},
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});

	const { mutate: handleCreateServiceOrder, isPending } = useMutationWithFeedback({
		mutationKey: ["create-new-service-order"],
		mutationFn: createServiceOrder,
		queryClient: queryClient,
		affectedQueryKey: ["service-orders-by-personalized-filters"],
	});
	return (
		<Dialog.Root open onOpenChange={closeModal}>
			<Dialog.Overlay className="fixed inset-0 z-[100] bg-[rgba(0,0,0,.85)] backdrop-blur-sm" />
			<Dialog.Content className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVA ORDEM DE SERVIÇO</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<FavoredInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<ProjectInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} session={session} />
						<TechnicalAnalysisBlock analysis={infoHolder.analiseTecnicaDados} />
						<ResponsibleInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<LocationInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<MaterialsInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<PeriodInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>} session={session} />
						<ReportInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<div className="flex w-full items-center justify-end p-2">
							<button
								disabled={isPending}
								onClick={() => {
									// @ts-ignore
									handleCreateServiceOrder({ info: infoHolder });
								}}
								className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
							>
								CRIAR ORDEM DE SERVIÇO
							</button>
						</div>
					</div>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	);
}

export default NewServiceOrder;
