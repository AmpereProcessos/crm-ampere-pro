import { TRevenue } from "@/utils/schemas/revenues.schema";
import type { TUserSession } from "@/lib/auth/session";
import React, { useEffect, useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import RevenueGeneralInformationBlock from "./Blocks/GeneralInformationBlock";
import RevenueProjectVinculationMenu from "./Blocks/Utils/ProjectVinculationMenu";
import RevenueCompositionInformationBlock from "./Blocks/CompositionInformationBlock";
import ProjectInformationBlock from "./Blocks/ProjectInformationBlockNew";
import ReceiptInformationBlock from "./Blocks/ReceiptInformationBlock";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { createRevenue } from "@/utils/mutations/revenues";

type NewRevenueProps = {
	session: TUserSession;
	closeModal: () => void;
};
function NewRevenue({ session, closeModal }: NewRevenueProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TRevenue>({
		idParceiro: session.user.idParceiro,
		titulo: "",
		anotacoes: "",
		categorias: [],
		projeto: {},
		composicao: [],
		total: 0,
		dataCompetencia: new Date().toISOString(),
		recebimentos: [],
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	const { mutate: handleCreateRevenue, isPending } = useMutationWithFeedback({
		mutationKey: ["create-revenue"],
		mutationFn: createRevenue,
		queryClient: queryClient,
		affectedQueryKey: ["revenues-by-personalized-filters"],
	});
	return (
		<div id="new-revenue" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVA RECEITA</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<RevenueGeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<ProjectInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<RevenueCompositionInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<ReceiptInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
					</div>
					<div className="flex w-full items-center justify-end p-2">
						<button
							disabled={isPending}
							onClick={() => {
								// @ts-ignore
								handleCreateRevenue({ info: infoHolder });
							}}
							className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
						>
							CRIAR RECEITA
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewRevenue;
