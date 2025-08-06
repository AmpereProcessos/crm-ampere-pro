import GeneralInformationBlock from "@/components/Services/GeneralInformationBlock";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createService } from "@/utils/mutations/services";
import { TService } from "@/utils/schemas/service.schema";
import { useQueryClient } from "@tanstack/react-query";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";

type NewServiceProps = {
	session: TUserSession;
	closeModal: () => void;
};
function NewService({ session, closeModal }: NewServiceProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TService>({
		idParceiro: session.user.idParceiro || "",
		idMetodologiaPrecificacao: "",
		idsMetodologiasPagamento: ["661ec619e03128a48f94b4db"],
		ativo: true,
		descricao: "",
		observacoes: "",
		garantia: 0,
		preco: 0,
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	const { mutate: handleCreateService, isPending } = useMutationWithFeedback({
		mutationKey: ["create-service"],
		mutationFn: createService,
		queryClient: queryClient,
		affectedQueryKey: ["services"],
	});
	return (
		<div id="new-product" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[60%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[80%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVO SERVIÇO</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<div className="my-5 flex flex-col">
							<p className="w-full text-center text-gray-500">Crie aqui um serviço pra ser utilizado na composição de suas propostas comerciais.</p>
						</div>
						<GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<div className="flex w-full flex-col">
							<h1 className="w-full rounded-tl-sm rounded-tr-sm bg-gray-500 p-1 text-center font-bold text-white">OBSERVAÇÕES</h1>
							<textarea
								placeholder="SEM OBSERVAÇÕES PREENCHIDA..."
								value={infoHolder.observacoes || ""}
								onChange={(e) => {
									setInfoHolder((prev) => ({
										...prev,
										observacoes: e.target.value,
									}));
								}}
								className="min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-gray-100 p-3 text-center text-xs font-medium text-gray-600 outline-none"
							/>
						</div>
					</div>
					<div className="mt-1 flex w-full items-end justify-end">
						<button
							disabled={isPending}
							//@ts-ignore
							onClick={() => handleCreateService({ info: infoHolder })}
							className="h-9 whitespace-nowrap rounded bg-green-800 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-800 enabled:hover:text-white"
						>
							CRIAR SERVIÇO
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewService;
