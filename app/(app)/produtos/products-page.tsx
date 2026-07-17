"use client";
import { useState } from "react";
import type React from "react";
import Product from "@/components/Cards/Product";
import EditProduct from "@/components/Modals/Products/EditProduct";
import NewProduct from "@/components/Modals/Products/NewProduct";
import { Button } from "@/components/ui/button";
import { InteractiveFilter, type InteractiveFilterOption, type InteractiveFilterSortValue } from "@/components/ui/interactive-filter";
import { Input } from "@/components/ui/input";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import NotAuthorizedPage from "@/components/utils/NotAuthorizedPage";
import type { TUserSession } from "@/lib/auth/session";
import { formatInteractiveOptionSummary, formatInteractiveSortFieldSummary } from "@/lib/interactive-filter-formatting";
import type { UseComercialProductsFilters } from "@/utils/queries/products";
import { useComercialProducts } from "@/utils/queries/products";
import { ProductItemCategories } from "@/utils/select-options";
import { CheckCircle2, CircleSlash, ListFilter, Plus, Tags } from "lucide-react";

type ProductsPageProps = {
	session: TUserSession;
};
function ProductsPage({ session }: ProductsPageProps) {
	const { data: products, isLoading, isError, isSuccess, filters, setFilters } = useComercialProducts();
	const [newProductModalIsOpen, setNewProductModalIsOpen] = useState<boolean>(false);
	const [editProductModal, setEditProductModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	if (!session.user.permissoes.produtos.visualizar) return <NotAuthorizedPage session={session} />;
	return (
		<>
			<div className="flex w-full min-w-0 flex-col gap-4">
				<div className="flex flex-col items-center border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex flex-col gap-1">
							<p className="text-sm leading-none tracking-tight text-primary/70">
								{products?.length ? (products.length > 0 ? `${products.length} produtos cadastrados` : `${products.length} produto cadastrado`) : "..."}
							</p>
						</div>

						{session?.user.permissoes.produtos.criar ? (
							<Button type="button" onClick={() => setNewProductModalIsOpen(true)} className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								CRIAR PRODUTO
							</Button>
						) : null}
					</div>
					<div className="mt-3 flex w-full flex-col gap-2">
						<Input
							value={filters.search}
							placeholder="Pesquisar fabricante ou modelo..."
							onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
							className="w-full"
						/>
						<ProductsInlineFilters filters={filters} setFilters={setFilters} />
					</div>
				</div>
				<div className="flex flex-wrap justify-between gap-2 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar produtos..." /> : null}
					{isSuccess ? (
						products.length > 0 ? (
							products.map((product) => (
								<Product
									key={product._id}
									product={product}
									handleClick={(id) => setEditProductModal({ id: id, isOpen: true })}
									userHasEditPermission={session.user.permissoes.produtos.editar}
									userHasPricingViewPermission={session.user.permissoes.precos.editar}
								/>
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Nenhum produto encontrado.
							</p>
						)
					) : null}
				</div>
			</div>
			{newProductModalIsOpen ? <NewProduct session={session} closeModal={() => setNewProductModalIsOpen(false)} /> : null}
			{editProductModal.id && editProductModal.isOpen ? (
				<EditProduct session={session} productId={editProductModal.id} closeModal={() => setEditProductModal({ id: null, isOpen: false })} />
			) : null}
		</>
	);
}

export default ProductsPage;

type ProductsInlineFiltersProps = {
	filters: UseComercialProductsFilters;
	setFilters: React.Dispatch<React.SetStateAction<UseComercialProductsFilters>>;
};

const productStatusOptions: InteractiveFilterOption<"active" | "inactive">[] = [
	{ id: "active", label: "SOMENTE ATIVOS", value: "active" },
	{ id: "inactive", label: "SOMENTE INATIVOS", value: "inactive" },
];

const productSortOptions: InteractiveFilterOption<"price">[] = [{ id: "price", label: "PRECO", value: "price" }];

function ProductsInlineFilters({ filters, setFilters }: ProductsInlineFiltersProps) {
	const categoryOptions = ProductItemCategories as InteractiveFilterOption<string>[];
	const selectedStatus = filters.onlyActive ? "active" : filters.onlyInactive ? "inactive" : null;
	const hasCategory = filters.category.length > 0;
	const hasStatus = selectedStatus !== null;
	const hasSort = filters.priceOrder !== null;
	const sortValue: InteractiveFilterSortValue<"price"> = { field: "price", direction: filters.priceOrder === "DESC" ? "desc" : "asc" };

	return (
		<div className="flex w-full flex-wrap items-center gap-2">
			{hasCategory ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<Tags className="h-4 w-4" />
							<InteractiveFilter.Label>CATEGORIA</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{formatInteractiveOptionSummary(categoryOptions, filters.category)}</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => setFilters((prev) => ({ ...prev, category: [] }))} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.MultiContent
							options={categoryOptions}
							value={filters.category}
							onChange={(category) => setFilters((prev) => ({ ...prev, category }))}
							onClear={() => setFilters((prev) => ({ ...prev, category: [] }))}
							clearLabel="TODAS"
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
							options={productStatusOptions}
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
						<InteractiveFilter.Value>{formatInteractiveSortFieldSummary(productSortOptions, sortValue.field)}</InteractiveFilter.Value>
						<InteractiveFilter.SortDirectionToggle
							direction={sortValue.direction}
							onDirectionChange={(direction) => setFilters((prev) => ({ ...prev, priceOrder: direction === "asc" ? "ASC" : "DESC" }))}
						/>
						<InteractiveFilter.Clear onClear={() => setFilters((prev) => ({ ...prev, priceOrder: null }))} label="Limpar ordenação" />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.SortContent
							fieldOptions={productSortOptions}
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
						{!hasCategory ? (
							<InteractiveFilter.AddFilterItem id="category" label="CATEGORIA" icon={<Tags className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent
									options={categoryOptions}
									value={filters.category}
									onChange={(category) => setFilters((prev) => ({ ...prev, category }))}
									clearLabel="TODAS"
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasStatus ? (
							<InteractiveFilter.AddFilterItem id="status" label="STATUS" icon={<CheckCircle2 className="h-4 w-4" />}>
								<InteractiveFilter.SingleContent
									options={productStatusOptions}
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
									fieldOptions={productSortOptions}
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
