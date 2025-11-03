"use client";
import { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import SignaturePlanCard from "@/components/Cards/SignaturePlan";
import EditPlan from "@/components/Modals/SignaturePlans/EditPlan";
import NewPlan from "@/components/Modals/SignaturePlans/NewPlan";
import { Sidebar } from "@/components/Sidebar";
import FiltersMenu from "@/components/SignaturePlans/FiltersMenu";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { useSignaturePlans } from "@/utils/queries/signature-plans";

type PlansPageProps = {
	session: TUserSession;
};
function PlansPage({ session }: PlansPageProps) {
	const { data: plans, isLoading, isError, isSuccess, filters, setFilters } = useSignaturePlans();
	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);
	const [newPlanModalIsOpen, setNewPlanModalIsOpen] = useState<boolean>(false);
	const [editPlanModal, setEditPlanModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex flex-col items-center border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex items-center gap-1">
							{filterMenuIsOpen ? (
								<div className="cursor-pointer text-primary/60 hover:text-blue-400">
									<IoMdArrowDropupCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(false)} />
								</div>
							) : (
								<div className="cursor-pointer text-primary/60 hover:text-blue-400">
									<IoMdArrowDropdownCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(true)} />
								</div>
							)}
							<div className="flex flex-col gap-1">
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">CONTROLE DE PLANOS DE ASSINATURA</h1>
								<p className="text-sm leading-none tracking-tight text-primary/70">
									{plans?.length ? (plans.length > 0 ? `${plans.length} planos cadastrados` : `${plans.length} plano cadastrado`) : "..."}
								</p>
							</div>
						</div>

						{session?.user.permissoes.kits.editar ? (
							<button
								type="button"
								onClick={() => setNewPlanModalIsOpen(true)}
								className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
							>
								CRIAR PLANO
							</button>
						) : null}
					</div>
					{filterMenuIsOpen ? <FiltersMenu filters={filters} setFilters={setFilters} /> : null}
				</div>
				<div className="flex flex-wrap justify-start gap-4 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent /> : null}
					{isSuccess ? (
						plans.length > 0 ? (
							plans.map((plan) => (
								<SignaturePlanCard
									key={plan._id}
									plan={plan}
									handleOpenModal={(id) => setEditPlanModal({ id: id, isOpen: true })}
									userHasEditPermission={session.user.permissoes.planos.editar}
									userHasPricingViewPermission={session.user.permissoes.precos.visualizar}
								/>
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Sem planos cadastrados.
							</p>
						)
					) : null}
				</div>
			</div>
			{editPlanModal.id && editPlanModal.isOpen ? (
				<EditPlan signaturePlanId={editPlanModal.id} session={session} closeModal={() => setEditPlanModal({ id: null, isOpen: false })} />
			) : null}
			{newPlanModalIsOpen ? <NewPlan session={session} closeModal={() => setNewPlanModalIsOpen(false)} /> : null}
		</div>
	);
}

export default PlansPage;
