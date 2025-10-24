import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { editRevenue } from "@/utils/mutations/revenues";
import { useRevenueById } from "@/utils/queries/revenues";
import { TRevenue, TRevenueWithProjectDTO } from "@/utils/schemas/revenues.schema";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import RevenueCompositionInformationBlock from "./Blocks/CompositionInformationBlock";
import RevenueGeneralInformationBlock from "./Blocks/GeneralInformationBlock";
import RevenueProjectInformationBlockEdit from "./Blocks/ProjectInformationBlockEdit";
import RevenueReceiptInformationBlock from "./Blocks/ReceiptInformationBlock";

type EditRevenueProps = {
	revenueId: string;
	session: TUserSession;
	closeModal: () => void;
};
function EditRevenue({ revenueId, session, closeModal }: EditRevenueProps) {
	const queryClient = useQueryClient();
	const { data: revenue, isLoading, isError, isSuccess } = useRevenueById({ id: revenueId });
	const [infoHolder, setInfoHolder] = useState<TRevenueWithProjectDTO>({
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
		recebimentos: [],
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});

	const { mutate: handleEditRevenue, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-revenue", revenueId],
		mutationFn: editRevenue,
		queryClient: queryClient,
		affectedQueryKey: ["revenue-by-id", revenueId],
		callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ["revenues-by-personalized-filters"] }),
	});
	useEffect(() => {
		if (revenue) setInfoHolder(revenue);
	}, [revenue]);
	return (
		<div id="new-revenue" className="fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-primary  ">NOVA RECEITA</h3>
						<button
							onClick={() => closeModal()}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
						{isLoading ? <LoadingComponent /> : null}
						{isError ? <ErrorComponent /> : null}
						{isSuccess ? (
							<>
								<RevenueGeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TRevenue>>} />
								<RevenueProjectInformationBlockEdit
									infoHolder={infoHolder}
									setInfoHolder={setInfoHolder}
									session={session}
									// @ts-ignore
									handleUpdateRevenue={(changes) => handleEditRevenue({ id: revenueId, changes: changes })}
								/>
								<RevenueCompositionInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TRevenue>>} />
								<RevenueReceiptInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TRevenue>>} />
								<div className="flex w-full items-center justify-end p-2">
									<button
										disabled={isPending}
										// @ts-ignore
										onClick={() => handleEditRevenue({ id: revenueId, changes: infoHolder })}
										className="h-9 whitespace-nowrap rounded-sm bg-blue-800 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-blue-800 enabled:hover:text-primary-foreground"
									>
										ATUALIZAR RECEITA
									</button>
								</div>
							</>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}

export default EditRevenue;
