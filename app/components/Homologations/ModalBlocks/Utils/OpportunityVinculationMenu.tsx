import { useOpportunitiesUltraSimplified } from "@/utils/queries/opportunities";
import { THomologation } from "@/utils/schemas/homologation.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import SelectInputVirtualized from "@/components/Inputs/SelectInputVirtualized";
import { FaLink } from "react-icons/fa";
import { TOpportunitySimplifiedDTO } from "@/utils/schemas/opportunity.schema";
type OpportunityVinculationMenuProps = {
	vinculatedId?: string | null;
	infoHolder: THomologation;
	setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
	closeMenu: () => void;
};
function OpportunityVinculationMenu({ vinculatedId, infoHolder, setInfoHolder, closeMenu }: OpportunityVinculationMenuProps) {
	const [selectedOpportunityId, setSelectedOpportunityId] = useState(vinculatedId);
	const { data: opportunities } = useOpportunitiesUltraSimplified();

	async function handleVinculation({ id, opportunities }: { id?: string | null; opportunities?: TOpportunitySimplifiedDTO[] }) {
		if (!opportunities) return;
		if (!id) return toast.error("Selecione uma oportunidade para prosseguir com a vinculação.");
		if (id.length != 24) return toast.error("Preencha um ID válido.");
		const opportunity = opportunities.find((p) => p._id == id);
		if (!opportunity) return;

		setInfoHolder((prev) => ({
			...prev,
			idParceiro: opportunity.idParceiro,
			oportunidade: { id: opportunity?._id, nome: opportunity?.nome },
		}));
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
			className="flex w-[90%] flex-col gap-2 self-center rounded border border-gray-500 p-6"
		>
			<SelectInputVirtualized
				label="OPORTUNIDADES"
				options={opportunities?.map((opportunity) => ({ id: opportunity._id, label: `(${opportunity.identificador}) ${opportunity.nome}`, value: opportunity._id })) || []}
				value={selectedOpportunityId}
				handleChange={(value) => setSelectedOpportunityId(value)}
				resetOptionLabel="NÃO DEFINIDO"
				onReset={() => setSelectedOpportunityId(null)}
				width="100%"
			/>
			<div className="mt-1 flex w-full items-center justify-end">
				<button
					onClick={() => handleVinculation({ id: selectedOpportunityId, opportunities })}
					className="flex items-center gap-1 rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
				>
					<FaLink />
					<p>VINCULAR</p>
				</button>
			</div>
		</motion.div>
	);
}
export default OpportunityVinculationMenu;
