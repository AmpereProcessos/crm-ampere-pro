import CheckboxInput from "@/components/Inputs/CheckboxInput";
import { TRevenue } from "@/utils/schemas/revenues.schema";
import { AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import RevenueProjectVinculationMenu from "./Utils/ProjectVinculationMenu";

type RevenueProjectInformationBlockNewProps = {
	infoHolder: TRevenue;
	setInfoHolder: React.Dispatch<React.SetStateAction<TRevenue>>;
};
function RevenueProjectInformationBlockNew({ infoHolder, setInfoHolder }: RevenueProjectInformationBlockNewProps) {
	const [vinculationMenuIsOpen, setVinculationMenuIsOpen] = useState<boolean>(false);
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground">INFORMAÇÕES DO PROJETO</h1>
			<div className="flex w-full flex-col gap-1">
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
						<RevenueProjectVinculationMenu
							vinculatedId={infoHolder.projeto.id}
							infoHolder={infoHolder}
							setInfoHolder={setInfoHolder}
							closeMenu={() => setVinculationMenuIsOpen(false)}
						/>
					) : null}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default RevenueProjectInformationBlockNew;
