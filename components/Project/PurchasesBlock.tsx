import type { TUserSession } from "@/lib/auth/session";
import { usePurchasesByProjectId } from "@/utils/queries/purchases";
import { TProjectDTO } from "@/utils/schemas/project.schema";
import { useState } from "react";
import ProjectPurchaseCard from "../Cards/ProjectPurchaseCard";
import ErrorComponent from "../utils/ErrorComponent";
import NewPurchaseMenu from "./Purchase/NewPurchaseMenu";

type PurchasesBlockProps = {
	project: TProjectDTO;
	session: TUserSession;
};
function PurchasesBlock({ project, session }: PurchasesBlockProps) {
	const [newPurchaseMenuIsOpen, setNewPurchaseMenuIsOpen] = useState<boolean>(false);

	const { data: purchases, isLoading, isError, isSuccess } = usePurchasesByProjectId({ projectId: project._id });
	return (
		<div className="flex w-full flex-col gap-2 rounded-sm border border-primary/80">
			<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">COMPRAS</h1>
			<div className="flex w-full grow flex-col gap-2 p-2">
				{isLoading ? <h1 className="w-full animate-pulse text-center font-medium text-primary/70">Buscando registros de compra</h1> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar registros de compra." /> : null}
				{isSuccess ? (
					purchases.length > 0 ? (
						purchases.map((purchase) => (
							<div className="w-full self-center lg:w-[50%]">
								<ProjectPurchaseCard key={purchase._id} purchase={purchase} />
							</div>
						))
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
							Sem registros de compra vinculados a esse projeto.
						</p>
					)
				) : null}
				<div className="flex w-full items-center justify-end">
					{!newPurchaseMenuIsOpen ? (
						<button
							onClick={() => setNewPurchaseMenuIsOpen(true)}
							className="rounded border border-green-500 bg-green-50 p-1 text-xs text-green-500 duration-300 ease-in-out hover:border-green-700 hover:text-green-700"
						>
							NOVA COMPRA
						</button>
					) : null}
				</div>
				{newPurchaseMenuIsOpen ? <NewPurchaseMenu project={project} closeMenu={() => setNewPurchaseMenuIsOpen(false)} session={session} /> : null}
			</div>
		</div>
	);
}

export default PurchasesBlock;
