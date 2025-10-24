import type { TUserSession } from "@/lib/auth/session";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createProjectJourneyType } from "@/utils/mutations/project-journey-types";
import { TProjectJourneyType } from "@/utils/schemas/project-journey-types";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import TextInput from "../Inputs/TextInput";
import TextareaInput from "../Inputs/TextareaInput";

type NewProjectJourneyTypeMenuProps = {
	session: TUserSession;
};
function NewProjectJourneyTypeMenu({ session }: NewProjectJourneyTypeMenuProps) {
	const queryClient = useQueryClient();

	const [infoHolder, setInfoHolder] = useState<TProjectJourneyType>({
		nome: "",
		descricao: "",
		etapas: [],
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	const [stageHolder, setStageHolder] = useState<TProjectJourneyType["etapas"][number] & { index: number | null }>({
		index: null,
		titulo: "",
		descricao: "",
	});
	function addStage(stage: TProjectJourneyType["etapas"][number]) {
		const stages = [...infoHolder.etapas];
		stages.push(stage);
		setStageHolder({ index: null, titulo: "", descricao: "" });
		setInfoHolder((prev) => ({ ...prev, etapas: stages }));
	}
	function removeStage(index: number) {
		const stages = [...infoHolder.etapas];
		stages.splice(index, 1);
		setInfoHolder((prev) => ({ ...prev, etapas: stages }));
	}
	const { mutate: handleCreateProjectJourneyType, isPending } = useMutationWithFeedback({
		mutationKey: ["create-project-journey-type"],
		mutationFn: createProjectJourneyType,
		queryClient: queryClient,
		affectedQueryKey: ["project-journey-types"],
	});
	return (
		<motion.div
			key={"editor"}
			variants={GeneralVisibleHiddenExitMotionVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="flex w-full flex-col gap-2"
		>
			<h1 className="w-full rounded-bl rounded-br bg-[#fead41] p-1 text-center text-xs font-bold text-primary-foreground">CADASTRO</h1>
			<div className="flex w-full flex-col gap-2 p-2">
				<TextInput
					label="NOME DO TIPO DE JORNADA"
					placeholder="Preencha aqui o nome a ser dado ao tipo de jornada..."
					value={infoHolder.nome}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
					width="100%"
				/>
				<TextareaInput
					label="DESCRIÇÃO DO TIPO DE JORNADA"
					placeholder="Preencha uma descrição ao tipo de jornada."
					value={infoHolder.descricao}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
				/>
				<h1 className="mt-2 w-full text-start text-xs font-black text-blue-500">ETAPAS</h1>
				<div className="flex w-[90%] flex-col gap-2 self-center">
					<TextInput
						label="NOME DO TIPO DE JORNADA"
						placeholder="Preencha aqui o nome a ser dado ao tipo de jornada..."
						value={stageHolder.titulo}
						handleChange={(value) => setStageHolder((prev) => ({ ...prev, titulo: value }))}
						width="100%"
					/>
					<TextareaInput
						label="DESCRIÇÃO DO TIPO DE JORNADA"
						placeholder="Preencha uma descrição ao tipo de jornada."
						value={stageHolder.descricao}
						handleChange={(value) => setStageHolder((prev) => ({ ...prev, descricao: value }))}
					/>
					<div className="flex items-center justify-end">
						<button
							className="rounded bg-blue-600 p-1 px-4 text-xs font-medium text-primary-foreground duration-300 ease-in-out hover:bg-blue-800"
							onClick={() => addStage({ titulo: stageHolder.titulo, descricao: stageHolder.descricao })}
						>
							CADASTRAR ETAPA
						</button>
					</div>
				</div>
				<div className="flex w-full flex-wrap items-start justify-around gap-2">
					{infoHolder.etapas.map((stage, stageIndex) => (
						<div key={stageIndex} className="flex w-[350px] items-center justify-between rounded-md border border-primary/30 p-2">
							<div className="flex grow items-center gap-1">
								<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
									<h1 className="text-sm font-bold">{stageIndex + 1}</h1>
								</div>
								<p className="text-xs font-medium leading-none tracking-tight">{stage.titulo}</p>
							</div>
							<button
								onClick={() => removeStage(stageIndex)}
								type="button"
								className="flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
							>
								<MdDelete size={15} />
							</button>
						</div>
					))}
				</div>
				<div className="flex w-full items-center justify-end p-2">
					<button
						disabled={isPending}
						onClick={() => {
							// @ts-ignore
							handleCreateProjectJourneyType({ info: infoHolder });
						}}
						className="rounded bg-black px-4 py-1 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70"
					>
						CADASTRAR TIPO
					</button>
				</div>
			</div>
		</motion.div>
	);
}

export default NewProjectJourneyTypeMenu;
