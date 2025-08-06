import { TExpense } from "@/utils/schemas/expenses.schema";
import { useQueryClient } from "@tanstack/react-query";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import GeneralInformationBlock from "./Blocks/GeneralInformationBlock";
import ProjectInformationBlock from "./Blocks/ProjectInformationBlock";
import CompositionInformationBlock from "./Blocks/CompositionInformationBlock";
import PaymentsInformationBlock from "./Blocks/PaymentsInformationBlock";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createExpense } from "@/utils/mutations/expenses";

type NewExpenseProps = {
	session: TUserSession;
	closeModal: () => void;
};
function NewExpense({ session, closeModal }: NewExpenseProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TExpense>({
		idParceiro: session.user.idParceiro,
		titulo: "",
		anotacoes: "",
		categorias: [],
		projeto: {},
		composicao: [],
		total: 0,
		dataCompetencia: new Date().toISOString(),
		pagamentos: [],
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});

	const { mutate: handleCreateExpense, isPending } = useMutationWithFeedback({
		mutationKey: ["create-expense"],
		mutationFn: createExpense,
		queryClient: queryClient,
		affectedQueryKey: ["expenses-by-personalized-filters"],
	});
	return (
		<div id="new-expense" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVA DESPESA</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<ProjectInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} session={session} />
						<CompositionInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<PaymentsInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
						<div className="flex w-full items-center justify-end p-2">
							<button
								disabled={isPending}
								// @ts-ignore
								onClick={() => handleCreateExpense({ info: infoHolder })}
								className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
							>
								CRIAR DESPESA
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewExpense;
