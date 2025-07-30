import { TUserDTO, TUserEntity } from "@/utils/schemas/user.schema";
import { easeBackInOut } from "d3-ease";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Avatar from "../utils/Avatar";
import { formatNameAsInitials, formatWithoutDiacritics } from "@/lib/methods/formatting";
import { VscChromeClose } from "react-icons/vsc";
import { useKey } from "@/lib/hooks";
import { cn, useMediaQuery } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
const variants = {
	hidden: {
		opacity: 0.2,
		scale: 0.95, // Scale down slightly
		backgroundColor: "rgba(255, 255, 255, 0.9)", // Adjust the color and alpha as needed
		transition: {
			duration: 0.5,
			ease: easeBackInOut, // Use an easing function
		},
	},
	visible: {
		opacity: 1,
		scale: 1, // Scale down slightly
		backgroundColor: "rgba(255, 255, 255, 1)", // Normal background color
		transition: {
			duration: 0.5,
			ease: easeBackInOut, // Use an easing function
		},
	},
	exit: {
		opacity: 0,
		scale: 1.05, // Scale down slightly
		backgroundColor: "rgba(255, 255, 255, 0.5)", // Fading background color
		transition: {
			duration: 0.01,
			ease: easeBackInOut, // Use an easing function
		},
	},
};

function validateIsSelected({ id, selected }: { id: string; selected?: string[] | null }) {
	if (!selected) return false;
	return selected.includes(id);
}
function getInitialMode({ referenceId, selected }: { referenceId: string | null; selected?: string[] | null }) {
	if (!selected) return "GERAL";
	if (selected.length === 0 || (selected.length === 1 && selected[0] === referenceId)) return "PRÓPRIO";
	return "PERSONALIZADO";
}

type TScopeOption = {
	id: string;
	label: string;
	image_url?: string | null;
};

type ScopeSelectionProps = {
	referenceId: string | null;
	options: TScopeOption[];
	selected?: string[] | null;
	handleScopeSelection: (info: string[] | null) => void;
};
function ScopeSelection({ referenceId, options, selected, handleScopeSelection }: ScopeSelectionProps) {
	const [mode, setMode] = useState<"PRÓPRIO" | "GERAL" | "PERSONALIZADO">(getInitialMode({ referenceId, selected }));
	const [selectMenuIsOpen, setSelectMenuIsOpen] = useState<boolean>(false);
	useKey("Escape", () => setSelectMenuIsOpen(false));
	useEffect(() => {
		setMode(getInitialMode({ referenceId, selected }));
	}, [selected, referenceId]);
	return (
		<div className="relative flex flex-col">
			<div className="flex flex-col lg:flex-row items-center gap-1">
				<p className="text-[0.65rem] lg:text-xs text-gray-500">ESCOPO</p>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => {
							setMode("PRÓPRIO");
							if (referenceId) handleScopeSelection([referenceId]);
							else handleScopeSelection([]);
						}}
						className={`${mode === "PRÓPRIO" ? "opacity-100" : "opacity-40"} rounded-md border border-cyan-400 bg-cyan-50 p-1 text-[0.57rem] font-medium text-cyan-400`}
					>
						PRÓPRIO
					</button>
					<button
						type="button"
						onClick={() => {
							setMode("GERAL");
							handleScopeSelection(null);
						}}
						className={`${mode === "GERAL" ? "opacity-100" : "opacity-40"} rounded-md border border-yellow-400 bg-yellow-50 p-1 text-[0.57rem] font-medium text-yellow-400`}
					>
						GERAL
					</button>
					<button
						type="button"
						onClick={() => {
							setMode("PERSONALIZADO");
							setSelectMenuIsOpen(true);
						}}
						className={`${mode === "PERSONALIZADO" ? "opacity-100" : "opacity-40"} rounded-md border border-gray-400 bg-gray-50 p-1 text-[0.57rem] font-medium text-gray-400`}
					>
						PERSONALIZADO
					</button>
				</div>
			</div>
			{mode === "PERSONALIZADO" && selectMenuIsOpen ? (
				<PersonalizedScopeSelectionMenu options={options} selected={selected} handleScopeSelection={handleScopeSelection} closeMenu={() => setSelectMenuIsOpen(false)} />
			) : null}
		</div>
	);
}

export default ScopeSelection;
type ScopeSelectionMenuProps = {
	options: TScopeOption[];
	selected?: string[] | null;
	handleScopeSelection: (selected: string[] | null) => void;
	closeMenu: () => void;
};
function PersonalizedScopeSelectionMenu({ options, selected, handleScopeSelection, closeMenu }: ScopeSelectionMenuProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const MENU_TITLE = "ESCOLHA O ESCOPO DE ACESSO";
	const MENU_DESCRIPTION = "Selecione o escopo de acesso para o usuário.";

	function ScopeSelectionMenuContent() {
		const [search, setSearch] = useState<string>("");

		const filteredOptions = options.filter((option) =>
			search.trim().length > 0 ? formatWithoutDiacritics(option.label, true).includes(formatWithoutDiacritics(search, true)) : true,
		);
		return (
			<div className="w-full h-full flex flex-col gap-6">
				<input
					className="w-full h-fit outline-none ring-0 border-none bg-transparent text-xs placeholder:italic"
					placeholder="Pesquise por uma opção..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<div className="w-full flex flex-col gap-2">
					{filteredOptions.map((option, index) => (
						<button
							type="button"
							key={`${option.id}-${index}`}
							onClick={() => {
								const selectedArr = selected ? [...selected] : [];
								if (selectedArr.includes(option.id.toString())) selectedArr.splice(index, 1);
								else selectedArr.push(option.id.toString());
								handleScopeSelection(selectedArr);
							}}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-md border bg-gray-50 p-1",
								validateIsSelected({ id: option.id.toString(), selected }) ? " border-cyan-400" : "border-gray-400 opacity-40",
							)}
						>
							<Avatar url={option.image_url || undefined} height={20} width={20} fallback={formatNameAsInitials(option.label)} />
							<p className="text-primary/80 text-xs font-medium">{option.label}</p>
						</button>
					))}
				</div>
			</div>
		);
	}
	return isDesktop ? (
		<Dialog open onOpenChange={(v) => (!v ? closeMenu() : null)}>
			<DialogContent className="flex flex-col h-fit min-h-[60vh] max-h-[60vh] dark:bg-white">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-auto">
					<ScopeSelectionMenuContent />
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	) : (
		<Drawer open onOpenChange={(v) => (!v ? closeMenu() : null)}>
			<DrawerContent className="h-fit max-h-[70vh] flex flex-col">
				<DrawerHeader className="text-left">
					<DrawerTitle>{MENU_TITLE}</DrawerTitle>
					<DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-auto">
					<ScopeSelectionMenuContent />
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
