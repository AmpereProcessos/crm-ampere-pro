import type { TUserSession } from "@/lib/auth/session";
import { useState } from "react";
import { Sidebar } from "../Sidebar";

import NewRevenue from "../Modals/Revenues/NewRevenue";

import ReceiptsBlock from "./ReceiptsBlock";
import RevenuesBlock from "./RevenuesBlock";
import RevenueStats from "./Stats";

type RevenuesPageProps = {
	session: TUserSession;
};
function RevenuesPage({ session }: RevenuesPageProps) {
	const [newRevenueModalIsOpen, setNewRevenueModalIsOpen] = useState<boolean>(false);
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col gap-6 overflow-x-hidden bg-background p-6">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex items-center gap-1">
							<div className="flex flex-col gap-1">
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">CONTROLE DE RECEITAS</h1>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setNewRevenueModalIsOpen(true)}
								className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
							>
								CRIAR RECEITA
							</button>
						</div>
					</div>

					{/* <RevenueStats session={session} partnerOptions={partnersOptions || []} closeMenu={() => setStatsBlockIsOpen(false)} /> */}
				</div>
				<RevenueStats session={session} partnerOptions={[]} />
				<div className="flex w-full grow flex-col items-start gap-4 lg:flex-row">
					<div className="h-full w-full lg:w-[40%]">
						<ReceiptsBlock />
					</div>
					<div className="h-full w-full lg:w-[60%]">
						<RevenuesBlock session={session} />
					</div>
				</div>
			</div>
			{newRevenueModalIsOpen ? <NewRevenue session={session} closeModal={() => setNewRevenueModalIsOpen(false)} /> : null}
		</div>
	);
}

export default RevenuesPage;
