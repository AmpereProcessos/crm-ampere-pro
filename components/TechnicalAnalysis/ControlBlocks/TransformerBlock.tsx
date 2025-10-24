import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { AiFillCloseCircle, AiFillEdit } from "react-icons/ai";

import { easeBackInOut } from "d3-ease";

import NumberInput from "@/components/Inputs/NumberInput";
import TextInput from "@/components/Inputs/TextInput";
import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import { ImPower } from "react-icons/im";
import { IoMdBarcode } from "react-icons/io";
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

type TransformerBlockProps = {
	infoHolder: TTechnicalAnalysisDTO;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
	changes: object;
	setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function TransformerBlock({ infoHolder, setInfoHolder, changes, setChanges }: TransformerBlockProps) {
	const [editEnabled, setEditEnabled] = useState(false);
	return (
		<div className="mt-4 flex w-full flex-col">
			<div className="flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2">
				<h1 className="font-bold text-primary-foreground">TRANSFORMADOR</h1>
				<button onClick={() => setEditEnabled((prev) => !prev)}>{!editEnabled ? <AiFillEdit color="white" /> : <AiFillCloseCircle color="#ff1736" />}</button>
			</div>
			<AnimatePresence>
				{editEnabled ? (
					<motion.div key={"editor"} variants={variants} initial="hidden" animate="visible" exit="exit" className="mt-2 flex w-full flex-col gap-2">
						<div className="flex w-full flex-col gap-2 lg:flex-row">
							<div className="w-full lg:w-1/2">
								<NumberInput
									label={"POTÊNCIA DO TRANSFORMADOR"}
									placeholder={"Preencha a potência do transformador..."}
									value={infoHolder.transformador.potencia}
									handleChange={(value) => {
										setInfoHolder((prev) => ({
											...prev,
											transformador: {
												...prev.transformador,
												potencia: value,
											},
										}));
										setChanges((prev) => ({ ...prev, "transformador.potencia": value }));
									}}
									width={"100%"}
								/>
							</div>
							<div className="w-full lg:w-1/2">
								<TextInput
									label={"NÚMERO DO TRANSFORMADOR"}
									placeholder={"Preencha o número do transformador..."}
									value={infoHolder.transformador.codigo || ""}
									handleChange={(value) => {
										setInfoHolder((prev) => ({
											...prev,
											transformador: { ...prev.transformador, codigo: value },
										}));
										setChanges((prev) => ({ ...prev, "transformador.codigo": value }));
									}}
									width={"100%"}
								/>
							</div>
						</div>
					</motion.div>
				) : (
					<motion.div key={"readOnly"} variants={variants} initial="hidden" animate="visible" exit="exit" className="mt-2 flex w-full flex-col gap-2">
						<div className="mt-4 flex w-full flex-col items-center justify-center gap-2 md:flex-row lg:gap-4">
							<div className="flex items-center gap-2">
								<ImPower size={"20px"} color="rgb(31,41,55)" />
								<p className="font-raleway text-sm font-medium">{infoHolder.transformador.potencia}W</p>
							</div>
							<div className="flex items-center gap-2">
								<IoMdBarcode size={"20px"} color="rgb(31,41,55)" />
								<p className="font-raleway text-sm font-medium">{infoHolder.transformador.codigo || "CÓDIGO NÃO PREENCHIDO"}</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default TransformerBlock;
