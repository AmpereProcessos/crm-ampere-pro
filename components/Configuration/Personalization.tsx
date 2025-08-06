import React from "react";
import CreditorsBlock from "../Personalization/CreditorsBlock";
import type { TUserSession } from "@/lib/auth/session";
import EquipmentsBlock from "../Personalization/EquipmentsBlock";
import ProjectJourneyTypesBlock from "../Personalization/ProjectJourneyTypesBlock";
import AcquisitionChannelsBlock from "../Personalization/AcquisitionChannelsBlock";

type PersonalizationProps = {
	session: TUserSession;
};
function Personalization({ session }: PersonalizationProps) {
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full items-center justify-between border-b border-gray-300 pb-2">
				<div className="flex flex-col">
					<h1 className={"text-lg font-bold"}>Controle de personalizações</h1>
					<p className="text-sm text-[#71717A]">Gerencie e configure as equipamentos, credores, etc.</p>
				</div>
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				<AcquisitionChannelsBlock session={session} />
				<CreditorsBlock session={session} />
				<EquipmentsBlock session={session} />
				<ProjectJourneyTypesBlock session={session} />
			</div>
		</div>
	);
}

export default Personalization;
