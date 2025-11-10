import { Pencil, Plus, ShieldCheck, Trash, Wrench } from "lucide-react";
import { useState } from "react";
import NumberInput from "@/components/Inputs/NumberInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TUseKitStateHook } from "@/hooks/use-kit-state-hook";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import toast from "react-hot-toast";
import { MdOutlineMiscellaneousServices } from "react-icons/md";

type KitServicesBlockProps = {
	services: TUseKitStateHook["state"]["kit"]["servicos"];
	addKitService: TUseKitStateHook["addKitService"];
	updateKitService: TUseKitStateHook["updateKitService"];
	removeKitService: TUseKitStateHook["removeKitService"];
};

export default function KitServicesBlock({ services, addKitService, updateKitService, removeKitService }: KitServicesBlockProps) {
	const [newServiceMenuIsOpen, setNewServiceMenuIsOpen] = useState<boolean>(false);

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="SERVIÇOS DO KIT" sectionTitleIcon={<Wrench size={15} />}>
			{services.length > 0 ? (
				services.map((service, index) => (
					<ServiceItem
						key={`${service.id}-${index.toString()}`}
						service={service}
						handleUpdateKitService={(changes) => updateKitService(index, changes)}
						handleRemoveKitService={() => removeKitService(index)}
					/>
				))
			) : (
				<p className="text-center text-sm font-light text-primary/70">Nenhum serviço adicionado ao kit...</p>
			)}
			<div className="flex items-center justify-center">
				<Button onClick={() => setNewServiceMenuIsOpen(true)} size="fit" variant="ghost" className="flex items-center gap-2 px-2 py-1 rounded-lg">
					<Plus className="w-4 h-4 min-w-4 min-h-4" />
					ADICIONAR SERVIÇO
				</Button>
			</div>
			{newServiceMenuIsOpen ? <NewServiceMenu addKitService={addKitService} closeMenu={() => setNewServiceMenuIsOpen(false)} /> : null}
		</ResponsiveDialogDrawerSection>
	);
}

type ServiceItemProps = {
	service: TUseKitStateHook["state"]["kit"]["servicos"][number];
	handleUpdateKitService: (changes: Partial<TUseKitStateHook["state"]["kit"]["servicos"][number]>) => void;
	handleRemoveKitService: () => void;
};

function ServiceItem({ service, handleUpdateKitService, handleRemoveKitService }: ServiceItemProps) {
	const [editServiceItemMenuIsOpen, setEditServiceItemMenuIsOpen] = useState<boolean>(false);

	return (
		<>
			<div className={cn("bg-card border-primary/20 flex w-full items-center gap-1 rounded-xl border px-3 py-4 shadow-xs")}>
				<div className="flex items-center justify-center p-2 rounded-full bg-primary text-primary-foreground w-8 h-8">
					<MdOutlineMiscellaneousServices size={15} />
				</div>
				<div className="grow flex items-center justify-between gap-2">
					<div className="flex flex-col gap-1">
						<div className="flex items-start gap-2">
							<h1 className="text-xs font-bold tracking-tight uppercase">{service.descricao}</h1>
							<div className="flex items-center gap-1">
								<ShieldCheck className="w-4 h-4 min-w-4 min-h-4" />
								<p className="text-[0.65rem] font-medium text-primary/80">
									{service.garantia} {service.garantia > 1 ? "ANOS" : "ANO"}
								</p>
							</div>
						</div>

						<p className="text-[0.7rem] font-light text-primary/90 line-clamp-2">{service.observacoes}</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							onClick={() => setEditServiceItemMenuIsOpen(true)}
							size="fit"
							variant={"ghost"}
							className="rounded-full p-2 flex items-center justify-center hover:bg-blue-200 duration-300 ease-in-out"
						>
							<Pencil className="w-4 h-4 min-w-4 min-h-4" />
						</Button>
						<Button
							onClick={() => handleRemoveKitService()}
							size={"fit"}
							variant={"ghost"}
							className="rounded-full p-2 flex items-center justify-center hover:bg-red-200 duration-300 ease-in-out"
						>
							<Trash className="w-4 h-4 min-w-4 min-h-4" />
						</Button>
					</div>
				</div>
			</div>
			{editServiceItemMenuIsOpen ? (
				<EditServiceMenu initialService={service} updateKitService={handleUpdateKitService} closeMenu={() => setEditServiceItemMenuIsOpen(false)} />
			) : null}
		</>
	);
}

type NewServiceMenuProps = {
	addKitService: TUseKitStateHook["addKitService"];
	closeMenu: () => void;
};

function NewServiceMenu({ addKitService, closeMenu }: NewServiceMenuProps) {
	const [serviceHolder, setServiceHolder] = useState<TUseKitStateHook["state"]["kit"]["servicos"][number]>({
		descricao: "",
		observacoes: "",
		garantia: 10,
	});

	function updateServiceHolder(changes: Partial<TUseKitStateHook["state"]["kit"]["servicos"][number]>) {
		setServiceHolder((prev) => ({ ...prev, ...changes }));
	}

	function handleAddService(service: TUseKitStateHook["state"]["kit"]["servicos"][number]) {
		if (!service.descricao || service.descricao.trim().length <= 0) return toast.error("Preencha uma descrição válida.");
		if (!service.observacoes || service.observacoes.trim().length <= 0) return toast.error("Preencha observações válidas.");
		if (service.garantia < 0) return toast.error("Preencha uma garantia válida.");
		addKitService(service);
		return closeMenu();
	}

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO SERVIÇO"
			menuDescription="Preencha os dados do serviço que deseja adicionar ao kit."
			menuActionButtonText="ADICIONAR SERVIÇO"
			menuCancelButtonText="CANCELAR"
			actionFunction={() => handleAddService(serviceHolder)}
			actionIsLoading={false}
			stateIsLoading={false}
			closeMenu={closeMenu}
		>
			<div className="w-full flex flex-col gap-3">
				<TextInput
					label="DESCRIÇÃO DO SERVIÇO (*)"
					placeholder="Ex: Instalação completa"
					value={serviceHolder.descricao}
					handleChange={(value) => updateServiceHolder({ descricao: value })}
					width="100%"
				/>
				<TextInput
					label="OBSERVAÇÕES (*)"
					placeholder="Ex: Inclui mão de obra e materiais"
					value={serviceHolder.observacoes}
					handleChange={(value) => updateServiceHolder({ observacoes: value })}
					width="100%"
				/>
				<NumberInput
					label="GARANTIA (ANOS) (*)"
					placeholder="Preencha a garantia do serviço..."
					value={serviceHolder.garantia}
					handleChange={(value) => updateServiceHolder({ garantia: Number(value) })}
					width="100%"
				/>
				{serviceHolder.valor !== undefined && (
					<NumberInput
						label="VALOR (R$)"
						placeholder="Preencha o valor do serviço..."
						value={serviceHolder.valor}
						handleChange={(value) => updateServiceHolder({ valor: value ? Number(value) : undefined })}
						width="100%"
					/>
				)}
			</div>
		</ResponsiveDialogDrawer>
	);
}

type EditServiceMenuProps = {
	initialService: TUseKitStateHook["state"]["kit"]["servicos"][number];
	updateKitService: (changes: Partial<TUseKitStateHook["state"]["kit"]["servicos"][number]>) => void;
	closeMenu: () => void;
};

function EditServiceMenu({ initialService, updateKitService, closeMenu }: EditServiceMenuProps) {
	const [serviceHolder, setServiceHolder] = useState<TUseKitStateHook["state"]["kit"]["servicos"][number]>(initialService);

	function updateServiceHolder(changes: Partial<TUseKitStateHook["state"]["kit"]["servicos"][number]>) {
		setServiceHolder((prev) => ({ ...prev, ...changes }));
	}

	function handleUpdateService(service: TUseKitStateHook["state"]["kit"]["servicos"][number]) {
		if (!service.descricao || service.descricao.trim().length <= 0) return toast.error("Preencha uma descrição válida.");
		if (!service.observacoes || service.observacoes.trim().length <= 0) return toast.error("Preencha observações válidas.");
		if (service.garantia < 0) return toast.error("Preencha uma garantia válida.");
		updateKitService(service);
		return closeMenu();
	}

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR SERVIÇO"
			menuDescription="Atualize os dados do serviço."
			menuActionButtonText="ATUALIZAR SERVIÇO"
			menuCancelButtonText="CANCELAR"
			actionFunction={() => handleUpdateService(serviceHolder)}
			actionIsLoading={false}
			stateIsLoading={false}
			closeMenu={closeMenu}
		>
			<div className="w-full flex flex-col gap-3">
				<TextInput
					label="DESCRIÇÃO DO SERVIÇO (*)"
					placeholder="Ex: Instalação completa"
					value={serviceHolder.descricao}
					handleChange={(value) => updateServiceHolder({ descricao: value })}
					width="100%"
				/>
				<TextInput
					label="OBSERVAÇÕES (*)"
					placeholder="Ex: Inclui mão de obra e materiais"
					value={serviceHolder.observacoes}
					handleChange={(value) => updateServiceHolder({ observacoes: value })}
					width="100%"
				/>
				<NumberInput
					label="GARANTIA (ANOS) (*)"
					placeholder="Preencha a garantia do serviço..."
					value={serviceHolder.garantia}
					handleChange={(value) => updateServiceHolder({ garantia: Number(value) })}
					width="100%"
				/>
				<NumberInput
					label="VALOR (R$)"
					placeholder="Preencha o valor do serviço..."
					value={serviceHolder.valor}
					handleChange={(value) => updateServiceHolder({ valor: value ? Number(value) : undefined })}
					width="100%"
				/>
			</div>
		</ResponsiveDialogDrawer>
	);
}
