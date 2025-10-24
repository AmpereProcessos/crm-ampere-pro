import type { TUserSession } from "@/lib/auth/session";
import { useFunnels } from "@/utils/queries/funnels";
import { useState } from "react";
import { BsFunnelFill } from "react-icons/bs";
import EditFunnel from "../Modals/Funnels/EditFunnel";
import NewFunnel from "../Modals/Funnels/NewFunnel";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";

type FunnelsProps = {
	session: TUserSession;
};
function Funnels({ session }: FunnelsProps) {
	const [newFunnelModalIsOpen, setNewFunnelModalIsOpen] = useState<boolean>(false);
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	const { data: funnels, isSuccess, isLoading, isError } = useFunnels();
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-primary/30 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold uppercase`}>Controle de funis</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite os funis existentes</p>
				</div>
				<button
					onClick={() => setNewFunnelModalIsOpen(true)}
					className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					NOVO FUNIL
				</button>
			</div>
			{newFunnelModalIsOpen ? <NewFunnel session={session} closeModal={() => setNewFunnelModalIsOpen(false)} /> : null}
			<div className="flex w-full flex-col gap-2 py-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar funis" /> : null}
				{isSuccess &&
					funnels.map((funnel, index: number) => (
						<div key={funnel._id.toString()} className="flex w-full flex-col rounded-md border border-primary/30 p-2">
							<div className="flex grow items-center gap-1">
								<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
									<BsFunnelFill />
								</div>
								<p
									onClick={() => setEditModal({ id: funnel._id, isOpen: true })}
									className="cursor-pointer text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
								>
									{funnel.nome}
								</p>
							</div>
							<div className="flex w-full flex-col gap-2">
								<h1 className='"w-full mt-2 text-start text-xs font-medium'>ETAPAS</h1>
								<div className="flex w-full items-center justify-start gap-2">
									{funnel.etapas.map((stage) => (
										<div key={stage.id} className="rounded-lg border border-primary/30 bg-primary/20 px-2 py-1 text-[0.57rem] font-medium">
											{stage.nome}
										</div>
									))}
								</div>
							</div>
						</div>
					))}
			</div>
			{editModal.id && editModal.isOpen ? (
				<EditFunnel funnelId={editModal.id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} />
			) : null}
		</div>
	);
}

export default Funnels;
