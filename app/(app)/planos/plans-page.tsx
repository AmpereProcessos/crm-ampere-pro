"use client";
import { useState } from "react";
import type React from "react";
import SignaturePlanCard from "@/components/Cards/SignaturePlan";
import EditPlan from "@/components/Modals/SignaturePlans/EditPlan";
import NewPlan from "@/components/Modals/SignaturePlans/NewPlan";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { InteractiveFilter, type InteractiveFilterOption, type InteractiveFilterSortValue } from "@/components/ui/interactive-filter";
import { Input } from "@/components/ui/input";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { formatInteractiveSingleOptionSummary, formatInteractiveSortFieldSummary } from "@/lib/interactive-filter-formatting";
import type { UseSignaturePlansFilters } from "@/utils/queries/signature-plans";
import { useSignaturePlans } from "@/utils/queries/signature-plans";
import { SignaturePlanIntervalTypes } from "@/utils/select-options";
import { CheckCircle2, CircleSlash, Clock3, ListFilter, Plus } from "lucide-react";

type PlansPageProps = {
	session: TUserSession;
};

function PlansPage({ session }: PlansPageProps) {
	const { data: plans, isLoading, isError, isSuccess, filters, setFilters } = useSignaturePlans();
	const [newPlanModalIsOpen, setNewPlanModalIsOpen] = useState<boolean>(false);
	const [editPlanModal, setEditPlanModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex flex-col items-center border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex flex-col gap-1">
							<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">CONTROLE DE PLANOS DE ASSINATURA</h1>
							<p className="text-sm leading-none tracking-tight text-primary/70">
								{plans?.length ? (plans.length > 0 ? `${plans.length} planos cadastrados` : `${plans.length} plano cadastrado`) : "..."}
							</p>
						</div>

						{session?.user.permissoes.kits.editar ? (
							<Button type="button" onClick={() => setNewPlanModalIsOpen(true)} className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								CRIAR PLANO
							</Button>
						) : null}
					</div>
					<div className="mt-3 flex w-full flex-col gap-2">
						<Input
							value={filters.search}
							placeholder="Pesquisar plano..."
							onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
							className="w-full"
						/>
						<PlansInlineFilters filters={filters} setFilters={setFilters} />
					</div>
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

type PlansInlineFiltersProps = {
	filters: UseSignaturePlansFilters;
	setFilters: React.Dispatch<React.SetStateAction<UseSignaturePlansFilters>>;
};

const planStatusOptions: InteractiveFilterOption<"active" | "inactive">[] = [
	{ id: "active", label: "SOMENTE ATIVOS", value: "active" },
	{ id: "inactive", label: "SOMENTE INATIVOS", value: "inactive" },
];

const planSortOptions: InteractiveFilterOption<"price">[] = [{ id: "price", label: "PREÇO", value: "price" }];

function PlansInlineFilters({ filters, setFilters }: PlansInlineFiltersProps) {
	const intervalOptions = SignaturePlanIntervalTypes as InteractiveFilterOption<NonNullable<UseSignaturePlansFilters["intervalType"]>>[];
	const selectedStatus = filters.onlyActive ? "active" : filters.onlyInactive ? "inactive" : null;
	const hasStatus = selectedStatus !== null;
	const hasInterval = filters.intervalType !== null;
	const hasSort = filters.priceOrder !== null;
	const sortValue: InteractiveFilterSortValue<"price"> = { field: "price", direction: filters.priceOrder === "DESC" ? "desc" : "asc" };

	return (
		<div className="flex w-full flex-wrap items-center gap-2">
			{hasInterval ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<Clock3 className="h-4 w-4" />
							<InteractiveFilter.Label>INTERVALO</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{formatInteractiveSingleOptionSummary(intervalOptions, filters.intervalType)}</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => setFilters((prev) => ({ ...prev, intervalType: null }))} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.SingleContent
							options={intervalOptions}
							value={filters.intervalType}
							onChange={(intervalType) => setFilters((prev) => ({ ...prev, intervalType }))}
							onClear={() => setFilters((prev) => ({ ...prev, intervalType: null }))}
							clearLabel="TODOS"
						/>
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
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
							options={planStatusOptions}
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
						<InteractiveFilter.Value>{formatInteractiveSortFieldSummary(planSortOptions, sortValue.field)}</InteractiveFilter.Value>
						<InteractiveFilter.SortDirectionToggle
							direction={sortValue.direction}
							onDirectionChange={(direction) => setFilters((prev) => ({ ...prev, priceOrder: direction === "asc" ? "ASC" : "DESC" }))}
						/>
						<InteractiveFilter.Clear onClear={() => setFilters((prev) => ({ ...prev, priceOrder: null }))} label="Limpar ordenação" />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.SortContent
							fieldOptions={planSortOptions}
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
						{!hasInterval ? (
							<InteractiveFilter.AddFilterItem id="interval" label="INTERVALO" icon={<Clock3 className="h-4 w-4" />}>
								<InteractiveFilter.SingleContent
									options={intervalOptions}
									value={filters.intervalType}
									onChange={(intervalType) => setFilters((prev) => ({ ...prev, intervalType }))}
									onClear={() => setFilters((prev) => ({ ...prev, intervalType: null }))}
									clearLabel="TODOS"
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasStatus ? (
							<InteractiveFilter.AddFilterItem id="status" label="STATUS" icon={<CheckCircle2 className="h-4 w-4" />}>
								<InteractiveFilter.SingleContent
									options={planStatusOptions}
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
									fieldOptions={planSortOptions}
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
