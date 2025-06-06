import type { TUserSession } from "@/lib/auth/session";
import React from "react";
import RDStationIntegrationBlock from "../Integrations/RDStationIntegrationBlock";
import { NextPageContext } from "next";
import { useUsers } from "@/utils/queries/users";

type IntegrationsProps = {
	session: TUserSession;
};
function Integrations({ session }: IntegrationsProps) {
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full items-center justify-between border-b border-gray-200 pb-2">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold`}>Controle de Integrações</h1>
					<p className="text-sm text-[#71717A]">Gerencie e configure as integrações</p>
				</div>
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				<RDStationIntegrationBlock session={session} />
			</div>
		</div>
	);
}

export default Integrations;
