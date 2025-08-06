import React, { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { MdDelete } from "react-icons/md";

import TextInput from "../Inputs/TextInput";

import { TFunnel } from "@/utils/schemas/funnel.schema";
import { TAuthor } from "@/utils/schemas/user.schema";

import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createFunnel } from "@/utils/mutations/onboarding";

type FunnelProps = {
	partnerId: string;
	author: TAuthor;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
};
function Funnel({ partnerId, author, goToNextStage, goToPreviousStage }: FunnelProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TFunnel>({
		nome: "",
		descricao: "",
		etapas: [],
		idParceiro: partnerId,
		autor: author,
		dataInsercao: new Date().toISOString(),
	});
	const [stageHolder, setStageHolder] = useState("");

	function addStage() {
		if (stageHolder.trim().length < 3) return toast.error("Preencha um nome de ao menos 3 caracteres para a etapa.");
		const stageArrCopy = [...infoHolder.etapas];
		stageArrCopy.push({ id: infoHolder.etapas.length + 1, nome: stageHolder.trim().toUpperCase() });
		setInfoHolder((prev) => ({ ...prev, etapas: stageArrCopy }));
		setStageHolder("");
		return;
	}
	function removeStage(index: number) {
		const stageArrCopy = [...infoHolder.etapas];
		stageArrCopy.splice(index, 1);
		return setInfoHolder((prev) => ({ ...prev, etapas: stageArrCopy }));
	}
	async function handleCreateFunnel() {
		try {
			await createFunnel({ info: infoHolder });
			goToNextStage();
			return "Funil criado com sucesso !";
		} catch (error) {
			throw error;
		}
	}
	const { mutate, isPending } = useMutationWithFeedback({
		mutationKey: ["create-funnel"],
		mutationFn: handleCreateFunnel,
		queryClient,
		affectedQueryKey: ["funnels"],
	});
	return (
		<div className="flex grow flex-col gap-y-2">
			<h1 className="mt-4 w-full text-center text-lg tracking-tight text-gray-500">Para gerenciar o relacionamento com os seus clientes, precisamos estabelecer os funis de venda.</h1>
			<h1 className="mb-4 w-full text-center text-lg tracking-tight text-gray-500">Nessa etapa, defina um funil inicial e suas etapas.</h1>
			<h1 className="w-full bg-[#fead41] p-1 text-center font-bold text-white">FUNIL DE VENDAS</h1>
			<div className="flex w-full flex-col items-center gap-2 px-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NOME DO FUNIL"
						value={infoHolder.nome}
						placeholder="Preencha aqui o nome do funil..."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								nome: value,
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="DESCRIÇÃO DO FUNIL"
						value={infoHolder.descricao}
						placeholder="Preencha aqui a descrição do funil..."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								descricao: value,
							}))
						}
						width="100%"
					/>
				</div>
			</div>
			<h1 className="w-full pt-4 text-center text-sm font-medium">ETAPAS DO FUNIL</h1>
			<div className="w-full px-2">
				<TextInput
					label="NOME DA ETAPA"
					placeholder="Preencha o nome a ser dado a etapa do funil..."
					value={stageHolder}
					handleChange={(value) => setStageHolder(value)}
					width="100%"
				/>
			</div>
			<div className="flex w-full items-center justify-end px-2">
				<button
					onClick={addStage}
					className="whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
				>
					ADICIONAR ETAPA
				</button>
			</div>
			<div className="flex w-full flex-col gap-2 px-2">
				{infoHolder.etapas.length > 0 ? (
					infoHolder.etapas.map((stage, index) => (
						<div key={stage.id} className="flex w-full items-center justify-between rounded-md border border-gray-300 p-2">
							<div className="flex grow items-center gap-1">
								<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
									<h1 className="text-sm font-bold">{index + 1}</h1>
								</div>
								<p className="text-sm font-medium leading-none tracking-tight">{stage.nome}</p>
							</div>
							<button
								onClick={() => removeStage(index)}
								type="button"
								className="flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
							>
								<MdDelete size={15} />
							</button>
						</div>
					))
				) : (
					<p className="w-full py-4 text-center text-sm italic text-gray-500">Sem etapas adicionadas...</p>
				)}
			</div>
			<div className="flex w-full items-center justify-end px-2">
				<button
					className="rounded bg-black p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out disabled:bg-gray-400 disabled:text-black enabled:hover:bg-gray-600"
					disabled={isPending}
					onClick={() => mutate()}
				>
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default Funnel;
