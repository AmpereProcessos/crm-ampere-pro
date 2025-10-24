"use client";
import FilterMenu from "@/app/components/Homologations/Page/FilterMenu";
import HomologationCard from "@/components/Cards/Homologation";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { useHomologations } from "@/utils/queries/homologations";
import { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import ControlHomologation from "../../Modals/Homologations/ControlHomologation";
import NewHomologation from "../../Modals/Homologations/NewHomologation";
import { Sidebar } from "../../Sidebar";

type HomologationsControlPageProps = {
	session: TUserSession;
};
function HomologationsControlPage({ session }: HomologationsControlPageProps) {
	const { data: homologations, isLoading, isError, isSuccess, filters, setFilters } = useHomologations();
	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);

	const [newHomologationModalIsOpen, setNewHomologationModalIsOpen] = useState<boolean>(false);
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

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
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">CONTROLE DE HOMOLOGAÇÕES</h1>
								<p className="text-sm leading-none tracking-tight text-primary/70">
									{homologations?.length
										? homologations.length > 0
											? `${homologations.length} homologações contabilizadas`
											: `${homologations.length} homologação contabilizada`
										: "..."}
								</p>
							</div>
						</div>
						<button
							onClick={() => setNewHomologationModalIsOpen(true)}
							className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
						>
							CRIAR HOMOLOGAÇÃO
						</button>
					</div>
					{filterMenuIsOpen ? <FilterMenu filters={filters} setFilters={setFilters} /> : null}
				</div>
				<div className="flex flex-wrap justify-between gap-2 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar homologações." /> : null}
					{isSuccess ? (
						homologations.length > 0 ? (
							homologations.map((homologation) => (
								<HomologationCard
									key={homologation._id}
									homologation={homologation}
									handleClick={(id) => setEditModal({ id: id, isOpen: true })}
									userHasEditPermission={session.user.permissoes.homologacoes.editar}
								/>
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Não foram encontradas homologações...
							</p>
						)
					) : null}
				</div>
			</div>
			{newHomologationModalIsOpen ? (
				<NewHomologation session={session} affectedQueryKey={["homologations"]} closeModal={() => setNewHomologationModalIsOpen(false)} />
			) : null}
			{editModal.isOpen && editModal.id ? (
				<ControlHomologation session={session} homologationId={editModal.id} closeModal={() => setEditModal({ id: null, isOpen: false })} />
			) : null}
		</div>
	);
}

export default HomologationsControlPage;
