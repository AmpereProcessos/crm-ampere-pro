"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import type { TUserSession } from "@/lib/auth/session";
import { useClientsByPersonalizedFilters } from "@/utils/queries/clients";
import { useUsers } from "@/utils/queries/users";
import EditClient from "../Modals/Client/EditClient";
import NewClient from "../Modals/Client/NewClient";
import { Sidebar } from "../Sidebar";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import ClientCard from "./ClientCard";
import FilterMenu from "./FilterMenu";
import ClientsPagination from "./Pagination";

type ClientsPageProps = {
	session: TUserSession;
};
function ClientsPage({ session }: ClientsPageProps) {
	const queryClient = useQueryClient();
	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);
	const [newClientModalIsOpen, setNewClientModalIsOpen] = useState(false);
	const [editClient, setEditClient] = useState<{
		isOpen: boolean;
		id: string | null;
	}>({ isOpen: false, id: null });

	const { data: authorOptions } = useUsers();
	const { data, queryKey, isLoading, isError, isSuccess, filters, updateFilters } = useClientsByPersonalizedFilters({});
	const clients = data?.clients;
	const clientsMatched = data?.clientsMatched;
	const totalPages = data?.totalPages;

	const handleOnMutate = async () =>
		await queryClient.cancelQueries({
			queryKey,
		});
	const handleOnSettle = async () =>
		await queryClient.invalidateQueries({
			queryKey,
		});

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
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
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">BANCO DE CLIENTES</h1>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{session?.user.permissoes.clientes.criar ? (
								<button
									type="button"
									onClick={() => setNewClientModalIsOpen(true)}
									className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
								>
									CRIAR CLIENTE
								</button>
							) : null}
						</div>
					</div>
					{filterMenuIsOpen ? (
						<FilterMenu updateFilters={updateFilters} filters={filters} authorsOptions={authorOptions ?? []} queryLoading={isLoading} session={session} />
					) : null}
				</div>
				<ClientsPagination
					activePage={filters.page}
					totalPages={totalPages || 0}
					selectPage={(x) => updateFilters({ page: x })}
					queryLoading={isLoading}
					clientsMatched={clientsMatched}
					clientsShowing={clients?.length}
				/>
				<div className="flex flex-wrap justify-between gap-2 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Houve um erro ao buscar clientes." /> : null}
					{isSuccess && clients ? (
						clients.length > 0 ? (
							clients.map((client) => (
								<ClientCard
									key={client._id}
									client={client}
									openModal={(id) => setEditClient({ isOpen: true, id: id })}
									callbacks={{
										onMutate: handleOnMutate,
										onSettled: handleOnSettle,
									}}
								/>
							))
						) : (
							<p className="w-full text-center italic text-primary/70">Nenhum cliente encontrado...</p>
						)
					) : null}
				</div>
			</div>
			{newClientModalIsOpen ? (
				<NewClient
					session={session}
					partnerId={session.user.idParceiro || ""}
					closeModal={() => setNewClientModalIsOpen(false)}
					callbacks={{
						onMutate: handleOnMutate,
						onSettled: handleOnSettle,
					}}
				/>
			) : null}
			{editClient.isOpen && editClient.id ? (
				<EditClient
					clientId={editClient.id}
					session={session}
					partnerId={session.user.idParceiro || ""}
					closeModal={() => setEditClient({ isOpen: false, id: null })}
					callbacks={{
						onMutate: handleOnMutate,
						onSettled: handleOnSettle,
					}}
				/>
			) : null}
		</div>
	);
}

export default ClientsPage;
