import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { editExpense } from "@/utils/mutations/expenses";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useExpenseById } from "@/utils/queries/expenses";
import { TExpense, TExpenseDTOWithProject } from "@/utils/schemas/expenses.schema";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import CompositionInformationBlock from "./Blocks/CompositionInformationBlock";
import GeneralInformationBlock from "./Blocks/GeneralInformationBlock";
import PaymentsInformationBlock from "./Blocks/PaymentsInformationBlock";
import ProjectInformationBlock from "./Blocks/ProjectInformationBlock";

type EditExpenseProps = {
	expenseId: string;
	session: TUserSession;
	closeModal: () => void;
};
function EditExpense({ expenseId, session, closeModal }: EditExpenseProps) {
	const queryClient = useQueryClient();
	const { data: expense, isLoading, isError, isSuccess, error } = useExpenseById({ id: expenseId });
	const [infoHolder, setInfoHolder] = useState<TExpenseDTOWithProject>({
		_id: "id-holder",
		idParceiro: session.user.idParceiro,
		titulo: "",
		anotacoes: "",
		categorias: [],
		projeto: {},
		projetoDados: undefined,
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
	const { mutate: handleEditExpense, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-expense", expenseId],
		mutationFn: editExpense,
		queryClient: queryClient,
		affectedQueryKey: ["expense-by-id", expenseId],
		callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ["expenses-by-personalized-filters"] }),
	});

	const errorMsg = getErrorMessage(error);
	useEffect(() => {
		if (expense) setInfoHolder(expense);
	}, [expense]);
	return (
		<div id="edit-expense" className="fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-primary  ">EDITAR DESPESA</h3>
						<button
							onClick={() => closeModal()}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg={errorMsg} /> : null}
					{isSuccess ? (
						<>
							<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
								<GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TExpense>>} />
								<ProjectInformationBlock
									expenseId={expenseId}
									infoHolder={infoHolder}
									setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TExpense>>}
									session={session}
								/>
								<CompositionInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TExpense>>} />
								<PaymentsInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TExpense>>} />
							</div>
							<div className="flex w-full items-center justify-end p-2">
								<button
									disabled={isPending}
									// @ts-ignore
									onClick={() => handleEditExpense({ id: expenseId, changes: infoHolder })}
									className="h-9 whitespace-nowrap rounded-sm bg-blue-800 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-blue-800 enabled:hover:text-primary-foreground"
								>
									ATUALIZAR DESPESA
								</button>
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default EditExpense;
