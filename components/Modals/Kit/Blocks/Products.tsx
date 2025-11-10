import { Cpu, Package, Pencil, Plus, Settings, ShieldCheck, Trash, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TUseKitStateHook } from "@/hooks/use-kit-state-hook";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaIndustry, FaSolarPanel } from "react-icons/fa";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import { useEquipments } from "@/utils/queries/utils";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import toast from "react-hot-toast";

type KitProductsBlockProps = {
	products: TUseKitStateHook["state"]["kit"]["produtos"];
	addKitProduct: TUseKitStateHook["addKitProduct"];
	updateKitProduct: TUseKitStateHook["updateKitProduct"];
	removeKitProduct: TUseKitStateHook["removeKitProduct"];
};

export default function KitProductsBlock({ products, addKitProduct, updateKitProduct, removeKitProduct }: KitProductsBlockProps) {
	const [newProductMenuIsOpen, setNewProductMenuIsOpen] = useState<boolean>(false);
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="PRODUTOS DO KIT" sectionTitleIcon={<Package size={15} />}>
			{products.length > 0 ? (
				products.map((product, index) => (
					<ProductItem
						key={`${product.id}-${index.toString()}`}
						product={product}
						handleUpdateKit={(changes) => updateKitProduct(index, changes)}
						handleRemoveKitProduct={() => removeKitProduct(index)}
					/>
				))
			) : (
				<p className="text-center text-sm font-light text-primary/70">Nenhum produto adicionado ao kit...</p>
			)}
			<div className="flex items-center justify-center">
				<Button onClick={() => setNewProductMenuIsOpen(true)} size="fit" variant="ghost" className="flex items-center gap-2 px-2 py-1 rounded-lg">
					<Plus className="w-4 h-4 min-w-4 min-h-4" />
					ADICIONAR PRODUTO
				</Button>
			</div>
			{newProductMenuIsOpen ? <NewProductMenu addKitProduct={addKitProduct} closeMenu={() => setNewProductMenuIsOpen(false)} /> : null}
		</ResponsiveDialogDrawerSection>
	);
}

type ProductItemProps = {
	product: TUseKitStateHook["state"]["kit"]["produtos"][number];
	handleUpdateKit: (changes: Partial<TUseKitStateHook["state"]["kit"]["produtos"][number]>) => void;
	handleRemoveKitProduct: () => void;
};
function ProductItem({ product, handleUpdateKit, handleRemoveKitProduct }: ProductItemProps) {
	const [editProductItemMenuIsOpen, setEditProductItemMenuIsOpen] = useState<boolean>(false);
	return (
		<>
			<div className={cn("bg-card border-primary/20 flex w-full items-center gap-1 rounded-xl border px-3 py-4 shadow-xs")}>
				<div className="flex items-center justify-center p-2 rounded-full bg-primary text-primary-foreground w-8 h-8">
					{renderCategoryIcon(product.categoria, 15)}
				</div>
				<div className="grow flex items-center justify-between gap-2">
					<div className="flex flex-col gap-1">
						<div className="flex items-start gap-2">
							<h1 className="text-xs font-bold tracking-tight uppercase">{`${product.qtde} x ${product.modelo}`}</h1>
							<div className="flex items-center gap-1">
								<FaIndustry className="w-4 h-4 min-w-4 min-h-4" />
								<p className="text-[0.7rem] font-medium text-primary/80">
									{product.fabricante}
								</p>
							</div>
							<div className="flex items-center gap-1">
								<Zap className="w-4 h-4 min-w-4 min-h-4" />
								<p className="text-[0.7rem] font-medium text-primary/80">{product.potencia} W</p>
							</div>
							<div className="flex items-center gap-1">
								<ShieldCheck className="w-4 h-4 min-w-4 min-h-4" />
								<p className="text-[0.7rem] font-medium text-primary/80">
									{product.garantia} {product.garantia > 1 ? "ANOS" : "ANO"}
								</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							onClick={() => setEditProductItemMenuIsOpen(true)}
							size="fit"
							variant={"ghost"}
							className="rounded-full p-2 flex items-center justify-center hover:bg-blue-200 duration-300 ease-in-out"
						>
							<Pencil className="w-4 h-4 min-w-4 min-h-4" />
						</Button>
						<Button
							onClick={() => handleRemoveKitProduct()}
							size={"fit"}
							variant={"ghost"}
							className="rounded-full p-2 flex items-center justify-center hover:bg-red-200 duration-300 ease-in-out"
						>
							<Trash className="w-4 h-4 min-w-4 min-h-4" />
						</Button>
					</div>
				</div>
			</div>
			{editProductItemMenuIsOpen ? (
				<EditProductMenu initialProduct={product} updateKitProduct={handleUpdateKit} closeMenu={() => setEditProductItemMenuIsOpen(false)} />
			) : null}
		</>
	);
}

type NewProductMenuProps = {
	addKitProduct: TUseKitStateHook["addKitProduct"];
	closeMenu: () => void;
};
function NewProductMenu({ addKitProduct, closeMenu }: NewProductMenuProps) {
	const [type, setType] = useState<"modules" | "inverters" | "personalized">("modules");
	const [productHolder, setProductHolder] = useState<TUseKitStateHook["state"]["kit"]["produtos"][number]>({
		categoria: "MÓDULO",
		fabricante: "",
		modelo: "",
		qtde: 1,
		garantia: 10,
		potencia: 0,
	});

	function updateProductHolder(changes: Partial<TUseKitStateHook["state"]["kit"]["produtos"][number]>) {
		setProductHolder((prev) => ({ ...prev, ...changes }));
	}
	function updateType(newType: "modules" | "inverters" | "personalized") {
		setType(newType);
		if (newType === "modules") {
			return setProductHolder((prev) => ({ ...prev, categoria: "MÓDULO" }));
		}
		if (newType === "inverters") {
			return setProductHolder((prev) => ({ ...prev, categoria: "INVERSOR" }));
		}
		if (newType === "personalized") {
			return setProductHolder((prev) => ({ ...prev, categoria: "OUTROS" }));
		}
		return;
	}

	function handleAddProduct(product: TUseKitStateHook["state"]["kit"]["produtos"][number]) {
		if (!product.id || product.id.trim().length <= 1) return toast.error("Selecione um produto válido.");
		if (!product.fabricante || product.fabricante.trim().length <= 1) return toast.error("Preencha um fabricante válido.");
		if (!product.modelo || product.modelo.trim().length <= 1) return toast.error("Preencha um modelo válido.");
		if (product.qtde <= 0) return toast.error("Preencha uma quantidade válida.");
		addKitProduct(product);
		return closeMenu();
	}

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO PRODUTO"
			menuDescription="Selecione o tipo de produto que deseja adicionar ao kit."
			menuActionButtonText="ADICIONAR PRODUTO"
			menuCancelButtonText="CANCELAR"
			actionFunction={() => handleAddProduct(productHolder)}
			actionIsLoading={false}
			stateIsLoading={false}
			closeMenu={closeMenu}
		>
			<div className="w-full flex items-center justify-center flex-wrap gap-x-2 gap-y-1">
				<Button
					size={"fit"}
					variant={type === "modules" ? "default" : "ghost"}
					className="flex items-center gap-1 text-xs px-2 py-1"
					onClick={() => updateType("modules")}
				>
					<FaSolarPanel className="w-4 h-4 min-w-4 min-h-4" />
					MÓDULO
				</Button>
				<Button
					size={"fit"}
					variant={type === "inverters" ? "default" : "ghost"}
					className="flex items-center gap-1 text-xs px-2 py-1"
					onClick={() => updateType("inverters")}
				>
					<Cpu className="w-4 h-4 min-w-4 min-h-4" />
					INVERSOR
				</Button>
				<Button
					size={"fit"}
					variant={type === "personalized" ? "default" : "ghost"}
					className="flex items-center gap-1 text-xs px-2 py-1"
					onClick={() => updateType("personalized")}
				>
					<Settings className="w-4 h-4 min-w-4 min-h-4" />
					PERSONALIZADO
				</Button>
			</div>
			{type === "modules" ? <ModulesMenu module={productHolder} updateModule={updateProductHolder} /> : null}
			{type === "inverters" && <InvertersMenu inverter={productHolder} updateInverter={updateProductHolder} />}
			{type === "personalized" && <PersonalizedMenu personalized={productHolder} updatePersonalized={updateProductHolder} />}
		</ResponsiveDialogDrawer>
	);
}
type EditProductMenuProps = {
	initialProduct: TUseKitStateHook["state"]["kit"]["produtos"][number];
	updateKitProduct: (changes: Partial<TUseKitStateHook["state"]["kit"]["produtos"][number]>) => void;
	closeMenu: () => void;
};
function EditProductMenu({ initialProduct, updateKitProduct, closeMenu }: EditProductMenuProps) {
	const [type, setType] = useState<"modules" | "inverters" | "personalized">(
		initialProduct.categoria === "MÓDULO" ? "modules" : initialProduct.categoria === "INVERSOR" ? "inverters" : "personalized",
	);
	const [productHolder, setProductHolder] = useState<TUseKitStateHook["state"]["kit"]["produtos"][number]>(initialProduct);

	function updateProductHolder(changes: Partial<TUseKitStateHook["state"]["kit"]["produtos"][number]>) {
		setProductHolder((prev) => ({ ...prev, ...changes }));
	}
	function updateType(newType: "modules" | "inverters" | "personalized") {
		setType(newType);
		if (newType === "modules") {
			return setProductHolder((prev) => ({ ...prev, categoria: "MÓDULO" }));
		}
		if (newType === "inverters") {
			return setProductHolder((prev) => ({ ...prev, categoria: "INVERSOR" }));
		}
		if (newType === "personalized") {
			return setProductHolder((prev) => ({ ...prev, categoria: "OUTROS" }));
		}
		return;
	}

	function handleUpdateProduct(product: TUseKitStateHook["state"]["kit"]["produtos"][number]) {
		if (!product.id || product.id.trim().length <= 1) return toast.error("Selecione um produto válido.");
		if (!product.fabricante || product.fabricante.trim().length <= 1) return toast.error("Preencha um fabricante válido.");
		if (!product.modelo || product.modelo.trim().length <= 1) return toast.error("Preencha um modelo válido.");
		if (product.qtde <= 0) return toast.error("Preencha uma quantidade válida.");
		updateKitProduct(product);
		return closeMenu();
	}

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR PRODUTO"
			menuDescription="Selecione o tipo de produto que deseja editar."
			menuActionButtonText="ATUALIZAR PRODUTO"
			menuCancelButtonText="CANCELAR"
			actionFunction={() => handleUpdateProduct(productHolder)}
			actionIsLoading={false}
			stateIsLoading={false}
			closeMenu={closeMenu}
		>
			<div className="w-full flex items-center justify-center flex-wrap gap-x-2 gap-y-1">
				<Button
					size={"fit"}
					variant={type === "modules" ? "default" : "ghost"}
					className="flex items-center gap-1 text-xs px-2 py-1"
					onClick={() => updateType("modules")}
				>
					<FaSolarPanel className="w-4 h-4 min-w-4 min-h-4" />
					MÓDULO
				</Button>
				<Button
					size={"fit"}
					variant={type === "inverters" ? "default" : "ghost"}
					className="flex items-center gap-1 text-xs px-2 py-1"
					onClick={() => updateType("inverters")}
				>
					<Cpu className="w-4 h-4 min-w-4 min-h-4" />
					INVERSOR
				</Button>
				<Button
					size={"fit"}
					variant={type === "personalized" ? "default" : "ghost"}
					className="flex items-center gap-1 text-xs px-2 py-1"
					onClick={() => updateType("personalized")}
				>
					<Settings className="w-4 h-4 min-w-4 min-h-4" />
					PERSONALIZADO
				</Button>
			</div>
			{type === "modules" ? <ModulesMenu module={productHolder} updateModule={updateProductHolder} /> : null}
			{type === "inverters" && <InvertersMenu inverter={productHolder} updateInverter={updateProductHolder} />}
			{type === "personalized" && <PersonalizedMenu personalized={productHolder} updatePersonalized={updateProductHolder} />}
		</ResponsiveDialogDrawer>
	);
}

type ModulesMenuProps = {
	module: TUseKitStateHook["state"]["kit"]["produtos"][number];
	updateModule: (changes: Partial<TUseKitStateHook["state"]["kit"]["produtos"][number]>) => void;
};
function ModulesMenu({ module, updateModule }: ModulesMenuProps) {
	const { data: modules } = useEquipments({ category: "MÓDULO" });
	return (
		<div className="w-full flex flex-col gap-3">
			<SelectInput
				label="MÓDULO"
				value={module.id}
				handleChange={(value) => {
					const equipment = modules?.find((m) => m._id === value);
					if (equipment) {
						return updateModule({
							id: equipment._id,
							fabricante: equipment.fabricante,
							modelo: equipment.modelo,
							potencia: equipment.potencia || 0,
						});
					}
					return;
				}}
				onReset={() => updateModule({ ...module, id: "", fabricante: "", modelo: "", potencia: 0 })}
				options={
					modules?.map((module) => ({
						id: module._id,
						label: `${module.fabricante} - ${module.modelo}`,
						value: module._id,
					})) ?? []
				}
				resetOptionLabel="NÃO DEFINIDO"
				width="100%"
			/>
			<NumberInput
				label="QTDE"
				placeholder="Preencha aqui a quantidade de módulos que deseja adicionar ao kit."
				value={module.qtde}
				handleChange={(value) => updateModule({ ...module, qtde: Number(value) })}
				width="100%"
			/>
			<NumberInput
				label="GARANTIA"
				placeholder="Preencha aqui a garantia do módulo que deseja adicionar ao kit."
				value={module.garantia}
				handleChange={(value) => updateModule({ ...module, garantia: Number(value) })}
				width="100%"
			/>
		</div>
	);
}

type InvertersMenuProps = {
	inverter: TUseKitStateHook["state"]["kit"]["produtos"][number];
	updateInverter: (changes: Partial<TUseKitStateHook["state"]["kit"]["produtos"][number]>) => void;
};
function InvertersMenu({ inverter, updateInverter }: InvertersMenuProps) {
	const { data: inverters } = useEquipments({ category: "INVERSOR" });

	return (
		<div className="w-full flex flex-col gap-3">
			<SelectInput
				label="INVERSOR"
				value={inverter.id}
				handleChange={(value) => {
					const equipment = inverters?.find((i) => i._id === value);
					if (equipment) {
						return updateInverter({
							id: equipment._id,
							fabricante: equipment.fabricante,
							modelo: equipment.modelo,
							potencia: equipment.potencia || 0,
						});
					}
					return;
				}}
				onReset={() => updateInverter({ id: "", fabricante: "", modelo: "", potencia: 0 })}
				options={
					inverters?.map((inverter) => ({
						id: inverter._id,
						label: `${inverter.fabricante} - ${inverter.modelo}`,
						value: inverter._id,
					})) ?? []
				}
				resetOptionLabel="NÃO DEFINIDO"
				width="100%"
			/>
			<NumberInput
				label="QTDE"
				placeholder="Preencha aqui a quantidade de inversores que deseja adicionar ao kit."
				value={inverter.qtde}
				handleChange={(value) => updateInverter({ qtde: Number(value) })}
				width="100%"
			/>
			<NumberInput
				label="GARANTIA"
				placeholder="Preencha aqui a garantia do inversor que deseja adicionar ao kit."
				value={inverter.garantia}
				handleChange={(value) => updateInverter({ garantia: Number(value) })}
				width="100%"
			/>
		</div>
	);
}

type PersonalizedMenuProps = {
	personalized: TUseKitStateHook["state"]["kit"]["produtos"][number];
	updatePersonalized: (changes: Partial<TUseKitStateHook["state"]["kit"]["produtos"][number]>) => void;
};
function PersonalizedMenu({ personalized, updatePersonalized }: PersonalizedMenuProps) {
	return (
		<div className="w-full flex flex-col gap-3">
			<TextInput
				label="FABRICANTE"
				placeholder="Preencha aqui o modelo do produto que deseja adicionar ao kit."
				value={personalized.fabricante}
				handleChange={(value) => updatePersonalized({ fabricante: value })}
				width="100%"
			/>
			<TextInput
				label="MODELO"
				placeholder="Preencha aqui o modelo do produto que deseja adicionar ao kit."
				value={personalized.modelo}
				handleChange={(value) => updatePersonalized({ modelo: value })}
				width="100%"
			/>
			<NumberInput
				label="POTÊNCIA"
				placeholder="Preencha aqui a potência do produto que deseja adicionar ao kit."
				value={personalized.potencia}
				handleChange={(value) => updatePersonalized({ potencia: Number(value) })}
				width="100%"
			/>
			<NumberInput
				label="QTDE"
				placeholder="Preencha aqui a quantidade do produto que deseja adicionar ao kit."
				value={personalized.qtde}
				handleChange={(value) => updatePersonalized({ qtde: Number(value) })}
				width="100%"
			/>
			<NumberInput
				label="GARANTIA"
				placeholder="Preencha aqui a garantia do produto que deseja adicionar ao kit."
				value={personalized.garantia}
				handleChange={(value) => updatePersonalized({ garantia: Number(value) })}
				width="100%"
			/>
		</div>
	);
}
