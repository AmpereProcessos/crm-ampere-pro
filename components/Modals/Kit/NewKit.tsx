import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TUserSession } from "@/lib/auth/session";

import { VscChromeClose } from "react-icons/vsc";

import { Optional } from "@/utils/models";
import { TKit } from "@/utils/schemas/kits.schema";

import { usePricingMethods } from "@/utils/queries/pricing-methods";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createKit } from "@/utils/mutations/kits";
import { getModulesPeakPotByProducts } from "@/lib/methods/extracting";

import GeneralInformationBlock from "@/components/Kits/GeneralInformationBlock";
import ProductCompositionBlock from "@/components/Kits/ProductCompositionBlock";
import ServicesCompositionBlock from "@/components/Kits/ServicesCompositionBlock";

export type TNewKit = Optional<TKit, "idMetodologiaPrecificacao">;

type ModalNewKitProps = {
	isOpen: boolean;
	session: TUserSession;
	closeModal: () => void;
};
function ModalNewKit({ session, closeModal }: ModalNewKitProps) {
	const queryClient = useQueryClient();
	const { data: pricingMethods } = usePricingMethods();
	const [kitInfo, setKitInfo] = useState<TKit>({
		nome: "",
		idParceiro: session.user.idParceiro || "",
		idMetodologiaPrecificacao: "660dab0b0fcb72da4ed8c35e",
		idsMetodologiasPagamento: ["661ec619e03128a48f94b4db"],
		ativo: true,
		topologia: "MICRO-INVERSOR",
		potenciaPico: 0,
		preco: 0,
		estruturasCompativeis: [],
		produtos: [],
		servicos: [],
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	const { mutate: handleCreateKit, isPending } = useMutationWithFeedback({
		mutationKey: ["create-kit"],
		mutationFn: createKit,
		queryClient: queryClient,
		affectedQueryKey: ["kits"],
	});

	console.log(kitInfo);
	return (
		<div id="new-kit" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVO KIT</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<GeneralInformationBlock infoHolder={kitInfo} setInfoHolder={setKitInfo} pricingMethods={pricingMethods || []} />
						<ProductCompositionBlock infoHolder={kitInfo} setInfoHolder={setKitInfo} />
						<ServicesCompositionBlock infoHolder={kitInfo} setInfoHolder={setKitInfo} />
						<div className="flex w-full items-center justify-end p-2">
							<button
								disabled={isPending}
								onClick={() => {
									const peakPower = getModulesPeakPotByProducts(kitInfo.produtos);
									// @ts-ignore
									handleCreateKit({ info: { ...kitInfo, potenciaPico: peakPower } });
								}}
								className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
							>
								CRIAR KIT
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ModalNewKit;
