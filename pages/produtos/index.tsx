import Product from "@/components/Cards/Product";
import EditProduct from "@/components/Modals/Products/EditProduct";
import NewProduct from "@/components/Modals/Products/NewProduct";
import FiltersMenu from "@/components/Products/FiltersMenu";
import { Sidebar } from "@/components/Sidebar";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import LoadingPage from "@/components/utils/LoadingPage";
import NotAuthorizedPage from "@/components/utils/NotAuthorizedPage";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import { useComercialProducts } from "@/utils/queries/products";
import React, { useState } from "react";
import { AiOutlineSafety } from "react-icons/ai";
import { FaIndustry } from "react-icons/fa";
import { ImPower } from "react-icons/im";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { useSession } from "@/app/providers/SessionProvider";

function ProductsPage() {
	const { session, status } = useSession({ required: true });
	const { data: products, isLoading, isError, isSuccess, filters, setFilters } = useComercialProducts();
	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);
	const [newProductModalIsOpen, setNewProductModalIsOpen] = useState<boolean>(false);
	const [editProductModal, setEditProductModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	if (status !== "authenticated") return <LoadingPage />;
	if (!session.user.permissoes.produtos.visualizar) return <NotAuthorizedPage session={session} />;
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
				<div className="flex flex-col items-center border-b border-[#000] pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex items-center gap-1">
							{filterMenuIsOpen ? (
								<div className="cursor-pointer text-gray-600 hover:text-blue-400">
									<IoMdArrowDropupCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(false)} />
								</div>
							) : (
								<div className="cursor-pointer text-gray-600 hover:text-blue-400">
									<IoMdArrowDropdownCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(true)} />
								</div>
							)}
							<div className="flex flex-col gap-1">
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">BANCO DE PRODUTOS</h1>
								<p className="text-sm leading-none tracking-tight text-gray-500">
									{products?.length ? (products.length > 0 ? `${products.length} produtos cadastrados` : `${products.length} produto cadastrado`) : "..."}
								</p>
							</div>
						</div>

						{session?.user.permissoes.produtos.criar ? (
							<button
								type="button"
								onClick={() => setNewProductModalIsOpen(true)}
								className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
							>
								CRIAR PRODUTO
							</button>
						) : null}
					</div>
					{filterMenuIsOpen ? <FiltersMenu filters={filters} setFilters={setFilters} /> : null}
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
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">Nenhum produto encontrado.</p>
						)
					) : null}
				</div>
			</div>
			{newProductModalIsOpen ? <NewProduct session={session} closeModal={() => setNewProductModalIsOpen(false)} /> : null}
			{editProductModal.id && editProductModal.isOpen ? (
				<EditProduct session={session} productId={editProductModal.id} closeModal={() => setEditProductModal({ id: null, isOpen: false })} />
			) : null}
		</div>
	);
}

export default ProductsPage;
