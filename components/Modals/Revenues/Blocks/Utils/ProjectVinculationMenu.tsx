import SelectInputVirtualized from "@/components/Inputs/SelectInputVirtualized";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { useProjectsUltraSimplified } from "@/utils/queries/project";
import { TProjectUltraSimplifiedDTO } from "@/utils/schemas/project.schema";
import { TRevenue } from "@/utils/schemas/revenues.schema";
import { motion } from "framer-motion";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaLink } from "react-icons/fa";

type RevenueProjectVinculationMenuProps = {
	vinculatedId?: string | null;
	infoHolder: TRevenue;
	setInfoHolder: React.Dispatch<React.SetStateAction<TRevenue>>;
	closeMenu: () => void;
	handleUpdateRevenue?: (revenue: TRevenue) => void;
};
function RevenueProjectVinculationMenu({ vinculatedId, infoHolder, setInfoHolder, closeMenu, handleUpdateRevenue }: RevenueProjectVinculationMenuProps) {
	const [selectedProjectId, setSelectedProjectId] = useState(vinculatedId);
	const { data: projects } = useProjectsUltraSimplified();
	function handleVinculation({ id, projects }: { id?: string | null; projects?: TProjectUltraSimplifiedDTO[] }) {
		if (!projects) return;
		if (!id) return toast.error("Selecione um projeto para prosseguir com a vinculação.");
		const project = projects.find((p) => p._id == id);
		if (!project) return;
		setInfoHolder((prev) => ({
			...prev,
			idParceiro: project.idParceiro,
			projeto: {
				id: project?._id,
				nome: project?.nome,
				tipo: project?.tipo.titulo,
				indexador: project?.indexador,
				identificador: project?.identificador,
			},
		}));
		if (!!handleUpdateRevenue)
			handleUpdateRevenue({
				...infoHolder,
				idParceiro: project.idParceiro,
				projeto: {
					id: project?._id,
					nome: project?.nome,
					tipo: project?.tipo.titulo,
					indexador: project?.indexador,
					identificador: project?.identificador,
				},
			});
		closeMenu();
		return toast.success("Vinculação feita com sucesso !", { duration: 500 });
	}
	return (
		<motion.div
			key={"menu-open"}
			variants={GeneralVisibleHiddenExitMotionVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="flex w-[90%] flex-col gap-2 self-center rounded-sm border border-primary/50 p-6"
		>
			<SelectInputVirtualized
				label="PROJETOS"
				options={projects?.map((project) => ({ id: project._id, label: `(${project.indexador}) ${project.nome}`, value: project._id })) || []}
				value={selectedProjectId}
				handleChange={(value) => setSelectedProjectId(value)}
				resetOptionLabel="NÃO DEFINIDO"
				onReset={() => setSelectedProjectId(null)}
				width="100%"
			/>
			<div className="mt-1 flex w-full items-center justify-end">
				<button
					onClick={() => handleVinculation({ id: selectedProjectId, projects })}
					className="flex items-center gap-1 rounded-sm bg-black px-4 py-1 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70"
				>
					<FaLink />
					<p>VINCULAR</p>
				</button>
			</div>
		</motion.div>
	);
}

export default RevenueProjectVinculationMenu;
