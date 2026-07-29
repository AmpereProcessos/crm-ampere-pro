"use client";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, ListFilter, Plus, UserRound } from "lucide-react";
import { useState } from "react";
import type React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TGetClientsByFiltersRouteInput } from "@/app/api/clients/search/route";
import { Button } from "@/components/ui/button";
import { InteractiveFilter, type InteractiveFilterOption } from "@/components/ui/interactive-filter";
import { Input } from "@/components/ui/input";
import type { TUserSession } from "@/lib/auth/session";
import { formatInteractiveOptionSummary } from "@/lib/interactive-filter-formatting";
import { useClientsByPersonalizedFilters } from "@/utils/queries/clients";
import { useUsers } from "@/utils/queries/users";
import type { TUserDTO } from "@/utils/schemas/user.schema";
import StatesAndCities from "@/utils/json-files/cities.json";
import EditClient from "../Modals/Client/EditClient";
import NewClient from "../Modals/Client/NewClient";
import ViewClient from "../Modals/Client/ViewClient";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import ClientCard from "./ClientCard";
import ClientsPagination from "./Pagination";

const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));
const AllStates = StatesAndCities.map((e) => e.sigla).map((c, index) => ({ id: index + 1, label: c, value: c }));

type ClientsPageProps = {
	session: TUserSession;
};

function ClientsPage({ session }: ClientsPageProps) {
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [newClientModalIsOpen, setNewClientModalIsOpen] = useState(false);
	const [editClient, setEditClient] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
	const deepLinkedClientId = searchParams?.get("clientId") ?? null;
	const activeClientId = deepLinkedClientId ?? (editClient.isOpen ? editClient.id : null);
	const { data: authorOptions } = useUsers();
	const { data, queryKey, isLoading, isError, isSuccess, filters, updateFilters } = useClientsByPersonalizedFilters({});
	const clients = data?.clients;
	const clientsMatched = data?.clientsMatched;
	const totalPages = data?.totalPages;

	const handleOnMutate = async () => await queryClient.cancelQueries({ queryKey });
	const handleOnSettle = async () => await queryClient.invalidateQueries({ queryKey });
	function closeClient() {
		if (deepLinkedClientId) {
			const nextSearchParams = new URLSearchParams(searchParams?.toString() ?? "");
			nextSearchParams.delete("clientId");
			const queryString = nextSearchParams.toString();
			const currentPathname = pathname || "/clientes";
			router.replace(queryString ? `${currentPathname}?${queryString}` : currentPathname);
		}
		setEditClient({ isOpen: false, id: null });
	}

	return (
		<>
			<div className="flex w-full min-w-0 flex-col gap-4">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						{session?.user.permissoes.clientes.criar ? (
							<Button type="button" onClick={() => setNewClientModalIsOpen(true)} className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								CRIAR CLIENTE
							</Button>
						) : null}
					</div>
					<Input
						value={filters.search ?? ""}
						placeholder="Pesquisar cliente..."
						onChange={(event) => updateFilters({ search: event.target.value, page: 1 })}
						className="w-full"
					/>
					<ClientsInlineFilters filters={filters} updateFilters={updateFilters} authorsOptions={authorOptions ?? []} session={session} />
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
									callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
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
					callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
				/>
			) : null}
			{activeClientId && session.user.permissoes.clientes.editar ? (
				<EditClient
					clientId={activeClientId}
					session={session}
					partnerId={session.user.idParceiro || ""}
					closeModal={closeClient}
					callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
				/>
			) : null}
			{activeClientId && !session.user.permissoes.clientes.editar ? <ViewClient clientId={activeClientId} closeModal={closeClient} /> : null}
		</>
	);
}

export default ClientsPage;

type ClientsInlineFiltersProps = {
	filters: TGetClientsByFiltersRouteInput;
	updateFilters: (filters: Partial<TGetClientsByFiltersRouteInput>) => void;
	authorsOptions: TUserDTO[];
	session: TUserSession;
};

function ClientsInlineFilters({ filters, updateFilters, authorsOptions, session }: ClientsInlineFiltersProps) {
	const userClientsScope = session.user.permissoes.clientes.escopo;
	const authorSelectableOptions = (userClientsScope ? authorsOptions.filter((a) => userClientsScope.includes(a._id)) : authorsOptions).map((author) => ({
		id: author._id,
		label: author.nome,
		value: author._id,
	}));
	const hasCities = (filters.cities ?? []).length > 0;
	const hasStates = (filters.ufs ?? []).length > 0;
	const hasAuthors = (filters.authorIds ?? []).length > 0;

	return (
		<div className="flex w-full flex-wrap items-center gap-2">
			{hasCities ? (
				<ClientsMultiFilter
					label="CIDADES"
					icon={<MapPin className="h-4 w-4" />}
					options={AllCities}
					value={filters.cities ?? []}
					onChange={(cities) => updateFilters({ cities, page: 1 })}
					onClear={() => updateFilters({ cities: [], page: 1 })}
				/>
			) : null}
			{hasStates ? (
				<ClientsMultiFilter
					label="UFS"
					icon={<MapPin className="h-4 w-4" />}
					options={AllStates}
					value={filters.ufs ?? []}
					onChange={(ufs) => updateFilters({ ufs, page: 1 })}
					onClear={() => updateFilters({ ufs: [], page: 1 })}
				/>
			) : null}
			{hasAuthors ? (
				<ClientsMultiFilter
					label="AUTORES"
					icon={<UserRound className="h-4 w-4" />}
					options={authorSelectableOptions}
					value={filters.authorIds ?? []}
					onChange={(authorIds) => updateFilters({ authorIds, page: 1 })}
					onClear={() => updateFilters({ authorIds: [], page: 1 })}
				/>
			) : null}
			<InteractiveFilter.AddFilterRoot className="w-fit">
				<InteractiveFilter.AddFilterTrigger>
					<ListFilter className="h-4 w-4" />
					<InteractiveFilter.Label>ADICIONAR FILTRO</InteractiveFilter.Label>
				</InteractiveFilter.AddFilterTrigger>
				<InteractiveFilter.AddFilterContent>
					<InteractiveFilter.AddFilterSection heading="Filtros">
						{!hasCities ? (
							<InteractiveFilter.AddFilterItem id="cities" label="CIDADES" icon={<MapPin className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={AllCities} value={filters.cities ?? []} onChange={(cities) => updateFilters({ cities, page: 1 })} clearLabel="TODAS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasStates ? (
							<InteractiveFilter.AddFilterItem id="ufs" label="UFS" icon={<MapPin className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={AllStates} value={filters.ufs ?? []} onChange={(ufs) => updateFilters({ ufs, page: 1 })} clearLabel="TODAS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasAuthors ? (
							<InteractiveFilter.AddFilterItem id="authors" label="AUTORES" icon={<UserRound className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent
									options={authorSelectableOptions}
									value={filters.authorIds ?? []}
									onChange={(authorIds) => updateFilters({ authorIds, page: 1 })}
									clearLabel="TODOS"
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
					</InteractiveFilter.AddFilterSection>
				</InteractiveFilter.AddFilterContent>
			</InteractiveFilter.AddFilterRoot>
		</div>
	);
}

function ClientsMultiFilter({
	label,
	icon,
	options,
	value,
	onChange,
	onClear,
}: {
	label: string;
	icon: React.ReactNode;
	options: InteractiveFilterOption<string>[];
	value: string[];
	onChange: (value: string[]) => void;
	onClear: () => void;
}) {
	return (
		<InteractiveFilter.Root className="w-fit">
			<InteractiveFilter.Trigger>
				<InteractiveFilter.Icon>
					{icon}
					<InteractiveFilter.Label>{label}</InteractiveFilter.Label>
				</InteractiveFilter.Icon>
				<InteractiveFilter.Value>{formatInteractiveOptionSummary(options, value)}</InteractiveFilter.Value>
				<InteractiveFilter.Clear onClear={onClear} />
			</InteractiveFilter.Trigger>
			<InteractiveFilter.Content className="w-72 p-0">
				<InteractiveFilter.MultiContent options={options} value={value} onChange={onChange} onClear={onClear} clearLabel="TODOS" />
			</InteractiveFilter.Content>
		</InteractiveFilter.Root>
	);
}
