import { TUserDTO, TUserEntity } from "@/utils/schemas/user.schema";
import { easeBackInOut } from "d3-ease";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Avatar from "../utils/Avatar";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { VscChromeClose } from "react-icons/vsc";
import { useKey } from "@/lib/hooks";
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
				<AnimatePresence>
					<motion.div
						key={"editor"}
						variants={variants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="absolute -top-[160px] right-0 z-[1000] flex h-[150px] w-[270px] flex-col  gap-2 self-center rounded-sm border border-gray-200 bg-[#fff] p-2 py-2 shadow-sm"
					>
						<div className="mb-1 flex w-full items-center justify-between border-b border-gray-200">
							<h1 className="text-center font-Raleway text-[0.57rem] font-bold leading-none tracking-tight">ESCOPO DO USUÁRIO SE ESTENDE A:</h1>
							<button
								onClick={() => setSelectMenuIsOpen(false)}
								type="button"
								className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
							>
								<VscChromeClose size={10} style={{ color: "red" }} />
							</button>
						</div>
						<div className="overscroll-y flex w-full flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
							{options.map((user, index) => (
								<button
									type="button"
									key={`${user.id}-${index}`}
									onClick={() => {
										const selectedArr = selected ? [...selected] : [];
										if (selectedArr.includes(user.id.toString())) selectedArr.splice(index, 1);
										else selectedArr.push(user.id.toString());
										handleScopeSelection(selectedArr);
									}}
									className={`${
										validateIsSelected({ id: user.id.toString(), selected }) ? " border-cyan-400" : "border-gray-400 opacity-40"
									} flex w-full cursor-pointer items-center gap-2 rounded-md border bg-gray-50 p-1`}
								>
									<Avatar url={user.image_url || undefined} height={20} width={20} fallback={formatNameAsInitials(user.label)} />
									<p className="text-primary/80 text-xs font-medium">{user.label}</p>
								</button>
							))}
						</div>
					</motion.div>
				</AnimatePresence>
			) : null}
		</div>
	);
}

export default ScopeSelection;
