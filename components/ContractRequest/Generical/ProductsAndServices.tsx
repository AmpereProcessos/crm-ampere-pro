import type { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import { FaBolt, FaIndustry } from "react-icons/fa";
import { AiOutlineSafety } from "react-icons/ai";
import { MdDelete, MdEdit, MdOutlineMiscellaneousServices } from "react-icons/md";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import SelectInput from "@/components/Inputs/SelectInput";
import { ProductItemCategories } from "@/utils/select-options";
import TextInput from "@/components/Inputs/TextInput";
import NumberInput from "@/components/Inputs/NumberInput";
import TextareaInput from "@/components/Inputs/TextareaInput";
import { cn } from "@/lib/utils";
import { BsCart } from "react-icons/bs";
import toast from "react-hot-toast";
import SelectInputVirtualized from "@/components/Inputs/SelectInputVirtualized";
import { useEquipments } from "@/utils/queries/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Settings } from "lucide-react";
type ProductsAndServicesProps = {
	editable: boolean;
	requestInfo: TContractRequest;
	setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
	showActions: boolean;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function ProductsAndServices({ editable, requestInfo, setRequestInfo, showActions, goToPreviousStage, goToNextStage }: ProductsAndServicesProps) {
	const [newScopeItemMenuState, setNewScopeItemMenuState] = useState<"product" | "service" | null>(null);

	function addProduct(product: TContractRequest["produtos"][number]) {
		setRequestInfo((prev) => ({
			...prev,
			produtos: [...prev.produtos, product],
		}));
	}
	function updateProduct({ index, item }: { index: number; item: TContractRequest["produtos"][number] }) {
		setRequestInfo((prev) => ({ ...prev, produtos: prev.produtos.map((product, i) => (i === index ? item : product)) }));
	}
	function removeProduct(index: number) {
		setRequestInfo((prev) => ({ ...prev, produtos: prev.produtos.filter((_, i) => i !== index) }));
	}

	function addService(service: TContractRequest["servicos"][number]) {
		setRequestInfo((prev) => ({
			...prev,
			servicos: [...prev.servicos, service],
		}));
	}
	function updateService({ index, item }: { index: number; item: TContractRequest["servicos"][number] }) {
		setRequestInfo((prev) => ({ ...prev, servicos: prev.servicos.map((service, i) => (i === index ? item : service)) }));
	}
	function removeService(index: number) {
		setRequestInfo((prev) => ({ ...prev, servicos: prev.servicos.filter((_, i) => i !== index) }));
	}
	function handleValidateAndProcceed() {
		if (requestInfo.produtos.length <= 0 && requestInfo.servicos.length <= 0) {
			toast.error("Adicione pelo menos um produto ou serviço.");
			return;
		}

		setRequestInfo((prev) => ({
			...prev,
			marcaInversor:
				requestInfo.produtos.length > 0
					? requestInfo.produtos
							.filter((p) => p.categoria === "INVERSOR")
							.map((inv) => `${inv.fabricante}-${inv.modelo}`)
							.join("/")
					: "",
			qtdeInversor: requestInfo.produtos
				? requestInfo.produtos
						.filter((p) => p.categoria === "INVERSOR")
						.map((inv) => inv.qtde)
						.join("/")
				: "",
			potInversor: requestInfo.produtos
				? requestInfo.produtos
						.filter((p) => p.categoria === "INVERSOR")
						.map((inv) => inv.potencia)
						.join("/")
				: "",
			marcaModulos: requestInfo.produtos
				? requestInfo.produtos
						.filter((p) => p.categoria === "MÓDULO")
						.map((mod) => `(${mod.fabricante}) ${mod.modelo}`)
						.join("/")
				: "",
			qtdeModulos: requestInfo.produtos
				? requestInfo.produtos
						.filter((p) => p.categoria === "MÓDULO")
						.map((mod) => mod.qtde)
						.join("/")
				: "",
			potModulos: requestInfo.produtos
				? requestInfo.produtos
						.filter((p) => p.categoria === "MÓDULO")
						.map((mod) => mod.potencia)
						.join("/")
				: "",
		}));
		return goToNextStage();
	}
	return (
		<div className="flex w-full flex-col bg-[#fff] pb-2 gap-6 grow">
			<div className="w-full flex items-center justify-center gap-2">
				<Settings size={15} />
				<span className="text-sm tracking-tight font-bold">ESCOPO - PRODUTOS E SERVIÇOS</span>
			</div>
			<div className="flex w-full flex-col grow gap-4">
				<SelectInput
					label="TOPOLOGIA"
					options={[
						{ id: 1, label: "MICRO-INVERSOR", value: "MICRO-INVERSOR" },
						{ id: 2, label: "INVERSOR", value: "INVERSOR" },
					]}
					value={requestInfo.topologia}
					handleChange={(value) => {
						setRequestInfo((prev) => ({ ...prev, topologia: value }));
					}}
					onReset={() => {
						setRequestInfo((prev) => ({ ...prev, topologia: null }));
					}}
					selectedItemLabel="NÃO DEFINIDO"
					width="100%"
				/>
				{editable ? (
					<div className="w-full flex items-center justify-end gap-2 flex-wrap">
						<div className="flex w-full items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => setNewScopeItemMenuState((prev) => (prev === "service" ? null : "service"))}
								className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-black duration-300 ease-in-out", {
									"bg-gray-300  hover:bg-red-300": newScopeItemMenuState === "service",
									"bg-green-300  hover:bg-green-400": newScopeItemMenuState !== "service",
								})}
							>
								<MdOutlineMiscellaneousServices />
								<h1 className="text-xs font-medium tracking-tight">{newScopeItemMenuState !== "service" ? "ABRIR MENU DE NOVO SERVIÇO" : "FECHAR MENU DE NOVO SERVIÇO"}</h1>
							</button>
							<button
								type="button"
								onClick={() => setNewScopeItemMenuState((prev) => (prev === "product" ? null : "product"))}
								className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-black duration-300 ease-in-out", {
									"bg-gray-300  hover:bg-red-300": newScopeItemMenuState === "product",
									"bg-green-300  hover:bg-green-400": newScopeItemMenuState !== "product",
								})}
							>
								<BsCart />
								<h1 className="text-xs font-medium tracking-tight">{newScopeItemMenuState !== "product" ? "ABRIR MENU DE NOVO PRODUTO" : "FECHAR MENU DE NOVO PRODUTO"}</h1>
							</button>
						</div>
					</div>
				) : null}

				<AnimatePresence>
					{newScopeItemMenuState === "product" ? <NewProductMenu addProduct={addProduct} /> : null}
					{newScopeItemMenuState === "service" ? <NewServiceMenu addSaleService={addService} /> : null}
				</AnimatePresence>
				<div className="w-full flex flex-col gap-2">
					<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
						<ChevronRight size={15} />
						<h1 className="text-xs tracking-tight font-medium text-start w-fit">PRODUTOS</h1>
					</div>
					{requestInfo.produtos.length > 0 ? (
						requestInfo.produtos.map((product, index) => (
							<ProductItem
								editable={editable}
								key={`${index}-${product.modelo}`}
								product={product}
								handleUpdate={(info) => updateProduct({ index: index, item: info })}
								handleRemove={() => removeProduct(index)}
							/>
						))
					) : (
						<div className="w-full text-center text-sm font-medium tracking-tight text-primary/80">Nenhum produto adicionado</div>
					)}
				</div>
				<div className="w-full flex flex-col gap-2">
					<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
						<ChevronRight size={15} />
						<h1 className="text-xs tracking-tight font-medium text-start w-fit">SERVIÇOS</h1>
					</div>
					{requestInfo.servicos.length > 0 ? (
						requestInfo.servicos.map((service, index) => (
							<ServiceItem
								editable={editable}
								key={`${index}-${service.descricao}`}
								service={service}
								handleUpdate={(info) => updateService({ index: index, item: info })}
								handleRemove={() => removeService(index)}
							/>
						))
					) : (
						<div className="w-full text-center text-sm font-medium tracking-tight text-primary/80">Nenhum serviço adicionado</div>
					)}
				</div>
			</div>
			{showActions ? (
				<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
					<button
						type="button"
						onClick={() => {
							goToPreviousStage();
						}}
						className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
					>
						Voltar
					</button>
					<button
						type="button"
						onClick={() => {
							handleValidateAndProcceed();
						}}
						className="rounded p-2 font-bold hover:bg-black hover:text-white"
					>
						Prosseguir
					</button>
				</div>
			) : null}
		</div>
	);
}

export default ProductsAndServices;

type NewProductMenuProps = {
	addProduct: (info: TContractRequest["produtos"][number]) => void;
};
function NewProductMenu({ addProduct }: NewProductMenuProps) {
	const { data: equipments, isLoading, isError, isSuccess } = useEquipments({ category: null });

	const inverters = equipments?.filter((e) => e.categoria === "INVERSOR") || [];
	const modules = equipments?.filter((e) => e.categoria === "MÓDULO") || [];

	const inverterOptions = inverters.map((inverter) => ({
		id: inverter._id,
		label: `${inverter.fabricante} - ${inverter.modelo}`,
		value: inverter.modelo,
	}));

	const modulesOptions = modules.map((product) => ({
		id: product._id,
		label: `${product.fabricante} - ${product.modelo}`,
		value: product.modelo,
	}));

	const [inverterHolder, setInverterHolder] = useState<TContractRequest["produtos"][number]>({
		categoria: "INVERSOR",
		fabricante: "",
		modelo: "",
		qtde: 1,
		garantia: 10,
		potencia: 0,
	});
	const [moduleHolder, setModuleHolder] = useState<TContractRequest["produtos"][number]>({
		categoria: "MÓDULO",
		fabricante: "",
		modelo: "",
		qtde: 1,
		garantia: 10,
		potencia: 0,
	});
	const [personalizedProductHolder, setPersonalizedProductHolder] = useState<TContractRequest["produtos"][number]>({
		categoria: "OUTROS",

		fabricante: "",
		modelo: "",
		qtde: 1,
		garantia: 10,
		potencia: 0,
	});
	function handleAddProduct(product: TContractRequest["produtos"][number]) {
		if (product.fabricante.trim().length <= 1) return toast.error("Preencha um fabricante válido.");
		if (product.modelo.trim().length <= 1) return toast.error("Preencha um modelo válido.");
		if (product.qtde <= 0) return toast.error("Preencha uma quantidade válida.");
		addProduct(product);
	}
	return (
		<motion.div
			key={"menu-open"}
			variants={GeneralVisibleHiddenExitMotionVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="flex w-full flex-col gap-2 rounded border border-green-600 bg-[#fff] shadow-sm"
		>
			<h1 className="rounded-tl rounded-tr bg-green-600 p-1 text-center text-xs text-white">NOVO PRODUTO</h1>
			<div className="flex w-full flex-col gap-2 p-3">
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-2/4">
							<SelectInputVirtualized
								label="INVERSOR"
								value={inverterHolder.id}
								handleChange={(value) => {
									const inverter = inverters?.find((i) => i._id === value);
									if (!inverter) return;
									setInverterHolder((prev) => ({
										...prev,
										fabricante: inverter.fabricante,
										modelo: inverter.modelo,
										potencia: inverter.potencia || 0,
										garantia: inverter.garantia || 0,
									}));
								}}
								onReset={() =>
									setInverterHolder({
										categoria: "INVERSOR",
										fabricante: "",
										modelo: "",
										qtde: 1,
										garantia: 10,
										potencia: 0,
									})
								}
								selectedItemLabel="NÃO DEFINIDO"
								options={inverterOptions}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-1/4">
							<NumberInput
								label="QTDE"
								value={inverterHolder.qtde}
								handleChange={(value) =>
									setInverterHolder((prev) => ({
										...prev,
										qtde: Number(value),
									}))
								}
								placeholder="QTDE"
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-1/4">
							<NumberInput
								label="GARANTIA"
								value={inverterHolder.garantia || null}
								handleChange={(value) =>
									setInverterHolder((prev) => ({
										...prev,
										garantia: Number(value),
									}))
								}
								placeholder="GARANTIA"
								width="100%"
							/>
						</div>
					</div>
					<div className="flex items-center justify-end">
						<Button onClick={() => handleAddProduct(inverterHolder)} size={"sm"} type="button">
							ADICIONAR INVERSOR
						</Button>
					</div>
				</div>
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-2/4">
							<SelectInputVirtualized
								label="MÓDULO"
								value={moduleHolder.id}
								handleChange={(value) => {
									const pvModule = modules.find((m) => m._id === value);
									if (!pvModule) return;
									setModuleHolder((prev) => ({
										...prev,
										fabricante: pvModule.fabricante,
										modelo: pvModule.modelo,
										potencia: pvModule.potencia || 0,
										garantia: pvModule.garantia || 0,
									}));
								}}
								onReset={() =>
									setModuleHolder({
										categoria: "MÓDULO",

										fabricante: "",
										modelo: "",
										qtde: 1,
										garantia: 10,
										potencia: 0,
									})
								}
								selectedItemLabel="NÃO DEFINIDO"
								options={modulesOptions}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-1/4">
							<NumberInput
								label="QTDE"
								value={moduleHolder.qtde}
								handleChange={(value) =>
									setModuleHolder((prev) => ({
										...prev,
										qtde: Number(value),
									}))
								}
								placeholder="QTDE"
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-1/4">
							<NumberInput
								label="GARANTIA"
								value={moduleHolder.garantia || null}
								handleChange={(value) =>
									setModuleHolder((prev) => ({
										...prev,
										garantia: Number(value),
									}))
								}
								placeholder="GARANTIA"
								width="100%"
							/>
						</div>
					</div>
					<div className="flex items-center justify-end">
						<Button onClick={() => handleAddProduct(moduleHolder)} size={"sm"} type="button">
							ADICIONAR MÓDULO
						</Button>
					</div>
				</div>
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-[20%]">
							<SelectInput
								label="CATEGORIA"
								selectedItemLabel="NÃO DEFINIDO"
								options={ProductItemCategories}
								value={personalizedProductHolder.categoria}
								handleChange={(value) =>
									setPersonalizedProductHolder((prev) => ({
										...prev,
										categoria: value,
									}))
								}
								onReset={() => {
									setPersonalizedProductHolder((prev) => ({
										...prev,
										categoria: "OUTROS",
									}));
								}}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[20%]">
							<TextInput
								label="FABRICANTE"
								placeholder="FABRICANTE"
								value={personalizedProductHolder.fabricante}
								handleChange={(value) =>
									setPersonalizedProductHolder((prev) => ({
										...prev,
										fabricante: value,
									}))
								}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[30%]">
							<TextInput
								label="MODELO"
								placeholder="MODELO"
								value={personalizedProductHolder.modelo}
								handleChange={(value) =>
									setPersonalizedProductHolder((prev) => ({
										...prev,
										modelo: value,
									}))
								}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[10%]">
							<NumberInput
								label="POTÊNCIA"
								value={personalizedProductHolder.potencia || null}
								handleChange={(value) =>
									setPersonalizedProductHolder((prev) => ({
										...prev,
										potencia: Number(value),
									}))
								}
								placeholder="POTÊNCIA"
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[10%]">
							<NumberInput
								label="QTDE"
								value={personalizedProductHolder.qtde}
								handleChange={(value) =>
									setPersonalizedProductHolder((prev) => ({
										...prev,
										qtde: Number(value),
									}))
								}
								placeholder="QTDE"
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[10%]">
							<NumberInput
								label="GARANTIA"
								value={personalizedProductHolder.garantia}
								handleChange={(value) =>
									setPersonalizedProductHolder((prev) => ({
										...prev,
										garantia: Number(value),
									}))
								}
								placeholder="GARANTIA"
								width="100%"
							/>
						</div>
					</div>

					<div className="flex items-center justify-end">
						<Button onClick={() => handleAddProduct(personalizedProductHolder)} size={"sm"} type="button">
							ADICIONAR PRODUTO PERSONALIZADO
						</Button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
function ProductItem({
	product,
	editable,
	handleUpdate,
	handleRemove,
}: {
	product: TContractRequest["produtos"][number];
	editable: boolean;
	handleUpdate: (info: TContractRequest["produtos"][number]) => void;
	handleRemove: () => void;
}) {
	const [itemHolder, setItemHolder] = useState<TContractRequest["produtos"][number]>(product);
	const [editMenuIsOpen, setEditMenuIsOpen] = useState<boolean>(false);
	return (
		<>
			<AnimatePresence>
				<div className="flex w-full flex-col gap-1 rounded border border-primary bg-[#fff] p-2">
					<div className="flex w-full items-center gap-2">
						<div className="flex items-center gap-1">
							<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">{renderCategoryIcon(product.categoria, 15)}</div>
							<p className="text-sm font-bold leading-none tracking-tight">
								<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
							</p>
						</div>
						<div className="flex grow items-center gap-2">
							<div className="flex items-center gap-1">
								<FaIndustry size={12} />
								<p className="text-[0.6rem] font-light text-primary/50 lg:text-xs">{product.fabricante}</p>
							</div>
							{product.potencia ? (
								<div className="flex items-center gap-1">
									<FaBolt size={12} />
									<p className="text-[0.6rem] font-light text-primary/50 lg:text-xs">{product.potencia} W</p>
								</div>
							) : null}
							<div className="flex items-center gap-1">
								<AiOutlineSafety size={12} />
								<p className="text-[0.6rem] font-light text-primary/50 lg:text-xs">
									{product.garantia} {product.garantia && product.garantia > 0 ? "ANOS" : "ANO"}
								</p>
							</div>
						</div>
					</div>
					{editable ? (
						<div className="flex w-full items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => setEditMenuIsOpen((prev) => !prev)}
								className="flex items-center gap-1 rounded-lg bg-orange-600 px-2 py-1 text-[0.6rem] text-white hover:bg-orange-500"
							>
								<MdEdit width={10} height={10} />
								<p>EDITAR</p>
							</button>
							<button type="button" onClick={() => handleRemove()} className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-white hover:bg-red-500">
								<MdDelete width={10} height={10} />
								<p>REMOVER</p>
							</button>
						</div>
					) : null}
				</div>
				{editMenuIsOpen ? (
					<motion.div variants={GeneralVisibleHiddenExitMotionVariants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-1 p-3">
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-[20%]">
								<SelectInput
									label="CATEGORIA"
									labelClassName="text-[0.6rem]"
									inputClassName="text-xs p-2 min-h-[34px]"
									selectedItemLabel="NÃO DEFINIDO"
									options={ProductItemCategories.map((item) => ({
										id: item.id,
										label: item.label,
										value: item.value,
									}))}
									value={itemHolder.categoria}
									handleChange={(value) =>
										setItemHolder((prev) => ({
											...prev,
											categoria: value,
										}))
									}
									onReset={() => {
										setItemHolder((prev) => ({
											...prev,
											categoria: "OUTROS",
										}));
									}}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[20%]">
								<TextInput
									label="FABRICANTE"
									labelClassName="text-[0.6rem]"
									inputClassName="text-xs p-2 min-h-[34px]"
									placeholder="FABRICANTE"
									value={itemHolder.fabricante}
									handleChange={(value) =>
										setItemHolder((prev) => ({
											...prev,
											fabricante: value,
										}))
									}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[30%]">
								<TextInput
									label="MODELO"
									labelClassName="text-[0.6rem]"
									inputClassName="text-xs p-2 min-h-[34px]"
									placeholder="MODELO"
									value={itemHolder.modelo}
									handleChange={(value) =>
										setItemHolder((prev) => ({
											...prev,
											modelo: value,
										}))
									}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[10%]">
								<NumberInput
									label="POTÊNCIA"
									labelClassName="text-[0.6rem]"
									inputClassName="text-xs p-2 min-h-[34px]"
									value={itemHolder.potencia || null}
									handleChange={(value) =>
										setItemHolder((prev) => ({
											...prev,
											potencia: Number(value),
										}))
									}
									placeholder="POTÊNCIA"
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[10%]">
								<NumberInput
									label="QTDE"
									labelClassName="text-[0.6rem]"
									inputClassName="text-xs p-2 min-h-[34px]"
									value={itemHolder.qtde}
									handleChange={(value) =>
										setItemHolder((prev) => ({
											...prev,
											qtde: Number(value),
										}))
									}
									placeholder="QTDE"
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[10%]">
								<NumberInput
									label="GARANTIA"
									labelClassName="text-[0.6rem]"
									inputClassName="text-xs p-2 min-h-[34px]"
									value={itemHolder.garantia}
									handleChange={(value) =>
										setItemHolder((prev) => ({
											...prev,
											garantia: Number(value),
										}))
									}
									placeholder="GARANTIA"
									width="100%"
								/>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => {
									setEditMenuIsOpen(false);
								}}
								className="rounded bg-red-800 p-1 px-4 text-[0.6rem] font-medium text-white duration-300 ease-in-out hover:bg-red-700"
							>
								FECHAR
							</button>
							<button
								type="button"
								onClick={() => {
									handleUpdate(itemHolder);
									setEditMenuIsOpen(false);
								}}
								className="rounded bg-blue-800 p-1 px-4 text-[0.6rem] font-medium text-white duration-300 ease-in-out hover:bg-blue-700"
							>
								ATUALIZAR ITEM
							</button>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}

type NewServiceMenuProps = {
	addSaleService: (info: TContractRequest["servicos"][number]) => void;
};
function NewServiceMenu({ addSaleService }: NewServiceMenuProps) {
	const [serviceHolder, setServiceHolder] = useState<TContractRequest["servicos"][number]>({
		descricao: "",
		observacoes: "",
		garantia: 0,
	});
	function handleAddService(service: TContractRequest["servicos"][number]) {
		if (service.descricao.trim().length <= 1) return toast.error("Preencha uma descrição válida.");
		addSaleService(service);
		setServiceHolder({
			descricao: "",
			observacoes: "",
			garantia: 0,
		});
	}
	return (
		<motion.div
			key={"menu-open"}
			variants={GeneralVisibleHiddenExitMotionVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="flex w-full flex-col gap-2 rounded border border-green-600 bg-[#fff] shadow-sm"
		>
			<h1 className="rounded-tl rounded-tr bg-green-600 p-1 text-center text-xs text-white">NOVO SERVIÇO</h1>
			<div className="flex w-full flex-col gap-2 p-3">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-3/4">
						<TextInput
							label="DESCRIÇÃO"
							placeholder="Preencha a descrição do serviço..."
							value={serviceHolder.descricao}
							handleChange={(value) => setServiceHolder((prev) => ({ ...prev, descricao: value }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/4">
						<NumberInput
							label="GARANTIA"
							placeholder="Preencha a garantia do serviço..."
							value={serviceHolder.garantia || null}
							handleChange={(value) => setServiceHolder((prev) => ({ ...prev, garantia: value }))}
							width="100%"
						/>
					</div>
				</div>
				<TextareaInput
					label="OBSERVAÇÕES DO SERVIÇO"
					value={serviceHolder.observacoes || ""}
					handleChange={(value) => setServiceHolder((prev) => ({ ...prev, observacoes: value }))}
					placeholder="Preencha aqui uma descrição acerca do serviço..."
				/>
				<div className="flex items-center justify-end">
					<Button onClick={() => handleAddService(serviceHolder)} size={"sm"} type="button">
						ADICIONAR SERVIÇO
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
function ServiceItem({
	service,
	editable,
	handleUpdate,
	handleRemove,
}: {
	service: TContractRequest["servicos"][number];
	editable: boolean;
	handleUpdate: (info: TContractRequest["servicos"][number]) => void;
	handleRemove: () => void;
}) {
	const [itemHolder, setItemHolder] = useState<TContractRequest["servicos"][number]>(service);
	const [editMenuIsOpen, setEditMenuIsOpen] = useState<boolean>(false);
	return (
		<>
			<AnimatePresence>
				<div className="flex w-full flex-col gap-1 rounded border border-primary bg-[#fff] p-2">
					<div className="flex w-full items-center justify-between gap-2">
						<div className="flex items-center gap-1">
							<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
								<MdOutlineMiscellaneousServices />
							</div>
							<p className="text-sm font-bold leading-none tracking-tight">{service.descricao}</p>
						</div>
						<div className="flex grow items-center gap-2">
							<div className="flex items-center gap-1">
								<AiOutlineSafety size={12} />
								<p className="text-[0.6rem] font-light text-primary/50 lg:text-xs">
									{service.garantia} {service.garantia && service.garantia > 0 ? "ANOS" : "ANO"}
								</p>
							</div>
						</div>
					</div>
					<div className="flex w-full items-center justify-center">
						<div className="flex w-full items-center justify-center rounded bg-primary/10 p-2">
							<h1 className="whitespace-pre-line text-[0.6rem] font-medium">{service.observacoes || "OBSERVAÇÕES NÃO DEFINIDAS"}</h1>
						</div>
					</div>
					{editable ? (
						<div className="flex w-full items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => setEditMenuIsOpen((prev) => !prev)}
								className="flex items-center gap-1 rounded-lg bg-orange-600 px-2 py-1 text-[0.6rem] text-white hover:bg-orange-500"
							>
								<MdEdit width={10} height={10} />
								<p>EDITAR</p>
							</button>
							<button type="button" onClick={() => handleRemove()} className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-white hover:bg-red-500">
								<MdDelete width={10} height={10} />
								<p>REMOVER</p>
							</button>
						</div>
					) : null}
				</div>
				{editMenuIsOpen ? (
					<motion.div variants={GeneralVisibleHiddenExitMotionVariants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-1 p-3">
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
							<div className="w-full lg:w-3/4">
								<TextInput
									label="DESCRIÇÃO"
									labelClassName="text-[0.6rem]"
									placeholder="Preencha a descrição do serviço..."
									inputClassName="text-xs p-2 min-h-[34px]"
									value={itemHolder.descricao}
									handleChange={(value) => setItemHolder((prev) => ({ ...prev, descricao: value }))}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/4">
								<NumberInput
									label="GARANTIA"
									labelClassName="text-[0.6rem]"
									placeholder="Preencha a garantia do serviço..."
									inputClassName="text-xs p-2 min-h-[34px]"
									value={itemHolder.garantia || null}
									handleChange={(value) => setItemHolder((prev) => ({ ...prev, garantia: value }))}
									width="100%"
								/>
							</div>
						</div>
						<TextareaInput
							label="OBSERVAÇÕES DO SERVIÇO"
							inputClassName="p-2 min-h-[50px] lg:min-h-[45px]"
							value={itemHolder.observacoes || ""}
							handleChange={(value) => setItemHolder((prev) => ({ ...prev, observacoes: value }))}
							placeholder="Preencha aqui uma descrição acerca do serviço..."
						/>
						<div className="flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => {
									setEditMenuIsOpen(false);
								}}
								className="rounded bg-red-800 p-1 px-4 text-[0.6rem] font-medium text-white duration-300 ease-in-out hover:bg-red-700"
							>
								FECHAR
							</button>
							<button
								type="button"
								onClick={() => {
									handleUpdate(itemHolder);
									setEditMenuIsOpen(false);
								}}
								className="rounded bg-blue-800 p-1 px-4 text-[0.6rem] font-medium text-white duration-300 ease-in-out hover:bg-blue-700"
							>
								ATUALIZAR ITEM
							</button>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}
