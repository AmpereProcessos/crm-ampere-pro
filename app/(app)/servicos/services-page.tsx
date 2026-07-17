"use client";
import { useState } from "react";
import type React from "react";
import Service from "@/components/Cards/Service";
import EditService from "@/components/Modals/Services/EditService";
import NewService from "@/components/Modals/Services/NewService";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { InteractiveFilter, type InteractiveFilterOption, type InteractiveFilterSortValue } from "@/components/ui/interactive-filter";
import { Input } from "@/components/ui/input";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import NotAuthorizedPage from "@/components/utils/NotAuthorizedPage";
import type { TUserSession } from "@/lib/auth/session";
import { formatInteractiveSortFieldSummary } from "@/lib/interactive-filter-formatting";
import type { UseComercialServicesFilters } from "@/utils/queries/services";
import { useComercialServices } from "@/utils/queries/services";
import { CheckCircle2, CircleSlash, ListFilter, Plus } from "lucide-react";

type ServicesPageProps = {
	session: TUserSession;
};

function ServicesPage({ session }: ServicesPageProps) {
	const { data: services, isLoading, isError, isSuccess, filters, setFilters } = useComercialServices();
	const [newServiceModalIsOpen, setNewServiceModalIsOpen] = useState<boolean>(false);
	const [editServiceModal, setEditServiceModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

	if (!session.user.permissoes.servicos.visualizar) return <NotAuthorizedPage session={session} />;

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex flex-col items-center border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex flex-col gap-1">
							<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">BANCO DE SERVIÇOS</h1>
							<p className="text-sm leading-none tracking-tight text-primary/70">
								{services?.length ? (services.length > 0 ? `${services.length} serviços cadastrados` : `${services.length} serviço cadastrado`) : "..."}
							</p>
						</div>
						{session?.user.permissoes.servicos.criar ? (
							<Button onClick={() => setNewServiceModalIsOpen(true)} className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								CRIAR SERVIÇO
							</Button>
						) : null}
					</div>
					<div className="mt-3 flex w-full flex-col gap-2">
						<Input
							value={filters.search}
							placeholder="Pesquisar serviço..."
							onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
							className="w-full"
						/>
						<ServicesInlineFilters filters={filters} setFilters={setFilters} />
					</div>
				</div>
				<div className="flex flex-wrap justify-between gap-2 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar serviços..." /> : null}
					{isSuccess ? (
						services.length > 0 ? (
							services.map((service) => (
								<Service
									key={service._id}
									service={service}
									handleClick={(id) => setEditServiceModal({ id: id, isOpen: true })}
									userHasEditPermission={session.user.permissoes.servicos.editar}
									userHasPricingViewPermission={session.user.permissoes.precos.visualizar}
								/>
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Nenhum serviço encontrado.
							</p>
						)
					) : null}
				</div>
			</div>
			{newServiceModalIsOpen ? <NewService session={session} closeModal={() => setNewServiceModalIsOpen(false)} /> : null}
			{editServiceModal.id && editServiceModal.isOpen ? (
				<EditService session={session} serviceId={editServiceModal.id} closeModal={() => setEditServiceModal({ id: null, isOpen: false })} />
			) : null}
		</div>
	);
}

export default ServicesPage;

type ServicesInlineFiltersProps = {
	filters: UseComercialServicesFilters;
	setFilters: React.Dispatch<React.SetStateAction<UseComercialServicesFilters>>;
};

const serviceStatusOptions: InteractiveFilterOption<"active" | "inactive">[] = [
	{ id: "active", label: "SOMENTE ATIVOS", value: "active" },
	{ id: "inactive", label: "SOMENTE INATIVOS", value: "inactive" },
];

const serviceSortOptions: InteractiveFilterOption<"price">[] = [{ id: "price", label: "PREÇO", value: "price" }];

function ServicesInlineFilters({ filters, setFilters }: ServicesInlineFiltersProps) {
	const selectedStatus = filters.onlyActive ? "active" : filters.onlyInactive ? "inactive" : null;
	const hasStatus = selectedStatus !== null;
	const hasSort = filters.priceOrder !== null;
	const sortValue: InteractiveFilterSortValue<"price"> = { field: "price", direction: filters.priceOrder === "DESC" ? "desc" : "asc" };

	return (
		<div className="flex w-full flex-wrap items-center gap-2">
			{hasStatus ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							{selectedStatus === "active" ? <CheckCircle2 className="h-4 w-4" /> : <CircleSlash className="h-4 w-4" />}
							<InteractiveFilter.Label>STATUS</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{selectedStatus === "active" ? "SOMENTE ATIVOS" : "SOMENTE INATIVOS"}</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => setFilters((prev) => ({ ...prev, onlyActive: false, onlyInactive: false }))} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.SingleContent
							options={serviceStatusOptions}
							value={selectedStatus}
							onChange={(value) => setFilters((prev) => ({ ...prev, onlyActive: value === "active", onlyInactive: value === "inactive" }))}
							onClear={() => setFilters((prev) => ({ ...prev, onlyActive: false, onlyInactive: false }))}
							clearLabel="TODOS"
						/>
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
			{hasSort ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<ListFilter className="h-4 w-4" />
							<InteractiveFilter.Label>ORDENAR POR</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{formatInteractiveSortFieldSummary(serviceSortOptions, sortValue.field)}</InteractiveFilter.Value>
						<InteractiveFilter.SortDirectionToggle
							direction={sortValue.direction}
							onDirectionChange={(direction) => setFilters((prev) => ({ ...prev, priceOrder: direction === "asc" ? "ASC" : "DESC" }))}
						/>
						<InteractiveFilter.Clear onClear={() => setFilters((prev) => ({ ...prev, priceOrder: null }))} label="Limpar ordenação" />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.SortContent
							fieldOptions={serviceSortOptions}
							value={sortValue}
							onChange={({ direction }) => setFilters((prev) => ({ ...prev, priceOrder: direction === "asc" ? "ASC" : "DESC" }))}
						/>
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
			<InteractiveFilter.AddFilterRoot className="w-fit">
				<InteractiveFilter.AddFilterTrigger>
					<ListFilter className="h-4 w-4" />
					<InteractiveFilter.Label>ADICIONAR FILTRO</InteractiveFilter.Label>
				</InteractiveFilter.AddFilterTrigger>
				<InteractiveFilter.AddFilterContent>
					<InteractiveFilter.AddFilterSection heading="Filtros">
						{!hasStatus ? (
							<InteractiveFilter.AddFilterItem id="status" label="STATUS" icon={<CheckCircle2 className="h-4 w-4" />}>
								<InteractiveFilter.SingleContent
									options={serviceStatusOptions}
									value={selectedStatus}
									onChange={(value) => setFilters((prev) => ({ ...prev, onlyActive: value === "active", onlyInactive: value === "inactive" }))}
									onClear={() => setFilters((prev) => ({ ...prev, onlyActive: false, onlyInactive: false }))}
									clearLabel="TODOS"
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasSort ? (
							<InteractiveFilter.AddFilterItem id="sort" label="ORDENAR POR" icon={<ListFilter className="h-4 w-4" />}>
								<InteractiveFilter.SortContent
									fieldOptions={serviceSortOptions}
									value={sortValue}
									onChange={({ direction }) => setFilters((prev) => ({ ...prev, priceOrder: direction === "asc" ? "ASC" : "DESC" }))}
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
					</InteractiveFilter.AddFilterSection>
				</InteractiveFilter.AddFilterContent>
			</InteractiveFilter.AddFilterRoot>
		</div>
	);
}
