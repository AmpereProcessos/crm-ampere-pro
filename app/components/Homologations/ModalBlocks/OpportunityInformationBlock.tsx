import CheckboxInput from "@/components/Inputs/CheckboxInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { THomologation } from "@/utils/schemas/homologation.schema";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { FaTag } from "react-icons/fa";
import { MdCode } from "react-icons/md";
import OpportunityVinculationMenu from "./Utils/OpportunityVinculationMenu";

type OpportunityInformationBlockProps = {
	infoHolder: THomologation;
	setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};
function OpportunityInformationBlock({
	infoHolder,
	setInfoHolder,
}: OpportunityInformationBlockProps) {
	const [vinculationMenuIsOpen, setVinculationMenuIsOpen] = useState(false);

	return (
		<ResponsiveDialogDrawerSection
			sectionTitleText="OPORTUNIDADE"
			sectionTitleIcon={<FaTag className="w-4 h-4 min-w-4 min-h-4" />}
		>
			{infoHolder.oportunidade.id ? (
				<Link
					href={`/comercial/oportunidades/id/${infoHolder.oportunidade.id}`}
				>
					<div className="flex items-center gap-1 rounded-lg bg-cyan-500 px-2 py-1 text-primary-foreground hover:bg-blue-500">
						<MdCode />
						<p className="cursor-pointer text-sm font-bold tracking-tight">
							{infoHolder.oportunidade.nome}
						</p>
					</div>
				</Link>
			) : null}
			<div className="flex w-full items-center justify-center py-2">
				<div className="w-fit">
					<CheckboxInput
						labelFalse="ABRIR MENU DE VINCULAÇÃO"
						labelTrue="ABRIR MENU DE VINCULAÇÃO"
						checked={vinculationMenuIsOpen}
						handleChange={(value) => setVinculationMenuIsOpen(value)}
					/>
				</div>
			</div>
			<AnimatePresence>
				{vinculationMenuIsOpen ? (
					<OpportunityVinculationMenu
						vinculatedId={infoHolder.oportunidade.id}
						infoHolder={infoHolder}
						setInfoHolder={setInfoHolder}
						closeMenu={() => setVinculationMenuIsOpen(false)}
					/>
				) : null}
			</AnimatePresence>
		</ResponsiveDialogDrawerSection>
	);
}

export default OpportunityInformationBlock;
