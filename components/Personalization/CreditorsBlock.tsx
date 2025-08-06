import { useCreditors } from "@/utils/queries/utils";
import React, { useState } from "react";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import CreditorUtil from "../Cards/CreditorUtil";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { createUtil } from "@/utils/mutations/utils";
import type { TUserSession } from "@/lib/auth/session";
import type { TCreditor } from "@/utils/schemas/utils";

type CreditorsBlockProps = {
	session: TUserSession;
};
function CreditorsBlock({ session }: CreditorsBlockProps) {
	const queryClient = useQueryClient();
	const [creditorHolder, setCreditorHolder] = useState<string>("");
	const { data: creditors, isLoading, isError, isSuccess } = useCreditors();
	const { mutate: handleCreateCreditor, isPending } = useMutationWithFeedback({
		mutationKey: ["create-creditor"],
		mutationFn: createUtil,
		queryClient: queryClient,
		affectedQueryKey: ["creditors"],
		callbackFn: () => setCreditorHolder(""),
	});
	return (
		<div className="flex min-h-[450px] w-full flex-col rounded border border-blue-500">
			<h1 className="w-full rounded-tl rounded-tr bg-blue-500 p-1 text-center text-sm font-bold text-white">CREDORES</h1>
			<div className="my-1 flex w-full flex-col">
				<p className="w-full text-center text-sm font-light tracking-tighter text-gray-700">
					Os credores aqui cadastrados serão utilizados como opção na solicitação de projeto em casos de financiamento, por exemplo.
				</p>
				<p className="w-full text-center text-sm font-light tracking-tighter text-gray-700">Se necessário, cadastre um novo credor no menu inferior.</p>
			</div>
			<div className="flex w-full grow flex-wrap items-start justify-around gap-2 p-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar credores." /> : null}
				{isSuccess ? (
					creditors.length > 0 ? (
						creditors.map((creditor) => (
							<div key={creditor._id} className="w-full lg:w-[350px]">
								<CreditorUtil creditor={creditor} />
							</div>
						))
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">Nenhum credor encontrado.</p>
					)
				) : null}
			</div>
			<div className="flex w-full flex-col gap-2">
				<h1 className="w-full rounded-bl rounded-br bg-[#fead41] p-1 text-center text-xs font-bold text-white">CADASTRO DE CREDOR</h1>
				<div className="flex w-full items-center gap-4 p-3">
					<input
						value={creditorHolder}
						onChange={(e) => {
							setCreditorHolder(e.target.value);
						}}
						type="text"
						placeholder="Preencha um nome para o credor..."
						className="grow rounded border border-gray-300 p-1 text-center text-xs tracking-tight text-gray-500 shadow-md outline-none placeholder:italic"
					/>
					<button
						type="button"
						disabled={isPending}
						onClick={() => {
							const util: TCreditor = {
								identificador: "CREDITOR",
								valor: creditorHolder.toUpperCase(),
								autor: {
									id: session.user.id,
									nome: session.user.nome,
									avatar_url: session.user.avatar_url,
								},
								dataInsercao: new Date().toISOString(),
							};
							// @ts-ignore
							handleCreateCreditor({ info: util });
						}}
						className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
					>
						CADASTRAR
					</button>
				</div>
			</div>
		</div>
	);
}

export default CreditorsBlock;
