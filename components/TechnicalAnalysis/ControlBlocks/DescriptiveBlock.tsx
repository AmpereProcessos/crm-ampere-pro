import React, { useState } from "react";

import TextInput from "@/components/Inputs/TextInput";
import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import toast from "react-hot-toast";
import { MdDelete, MdTopic } from "react-icons/md";

type DescriptiveBlockProps = {
	infoHolder: TTechnicalAnalysisDTO;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
	changes: object;
	setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function DescriptiveBlock({ infoHolder, setInfoHolder, changes, setChanges }: DescriptiveBlockProps) {
	const [descriptiveHolder, setDescriptiveHolder] = useState({
		topico: "",
		descricao: "",
	});
	function addDescriptiveItem() {
		if (descriptiveHolder.topico.trim().length < 2) return toast.error("Preencha um tópico de ao menos 2 caracteres.");
		if (descriptiveHolder.descricao.trim().length < 3) return toast.error("Preencha um tópico de ao menos 3 caracteres.");
		const itemsList = infoHolder.descritivo ? [...infoHolder.descritivo] : [];
		itemsList.push(descriptiveHolder);
		setInfoHolder((prev) => ({ ...prev, descritivo: itemsList }));
		setChanges((prev) => ({ ...prev, descritivo: itemsList }));
		setDescriptiveHolder({
			topico: "",
			descricao: "",
		});
		return toast.success("Item adicionado com sucesso !");
	}
	function removeDescriptiveItem(index: number) {
		const itemsList = infoHolder.descritivo ? [...infoHolder.descritivo] : [];
		itemsList.splice(index, 1);
		setInfoHolder((prev) => ({ ...prev, descritivo: itemsList }));
		setChanges((prev) => ({ ...prev, descritivo: itemsList }));
		return toast.success("Item removido com sucesso !");
	}

	return (
		<div className="mt-4 flex w-full flex-col">
			<div className="flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2">
				<h1 className="font-bold text-primary-foreground">DESCRITIVO</h1>
			</div>
			<div className="mt-2 flex w-full flex-col gap-2">
				<div className="w-full self-center lg:w-[500px]">
					<TextInput
						label="TÓPICO"
						placeholder="Preencha o tópico do item de descritivo..."
						value={descriptiveHolder.topico}
						handleChange={(value) => setDescriptiveHolder((prev) => ({ ...prev, topico: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full ">
					<TextInput
						label="DESCRIÇÃO"
						placeholder="Preencha o descrição do item de descritivo..."
						value={descriptiveHolder.descricao}
						handleChange={(value) => setDescriptiveHolder((prev) => ({ ...prev, descricao: value }))}
						width="100%"
					/>
				</div>
				<div className="mb-2 flex w-full items-center justify-end">
					<button
						onClick={addDescriptiveItem}
						className="rounded border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-primary-foreground"
					>
						ADICIONAR ITEM
					</button>
				</div>
			</div>
			{infoHolder.descritivo?.length > 0 ? (
				infoHolder.descritivo.map((item, index) => (
					<div key={index} className="mb-1 flex w-full flex-col rounded-sm border border-primary/30 p-2 shadow-md">
						<div className="flex w-full items-center justify-between">
							<div className="flex w-full items-center justify-center gap-2">
								<MdTopic />
								<h1 className=" text-lg font-bold leading-none tracking-tight text-[#15599a]">{item.topico}</h1>
							</div>
							<button
								onClick={() => removeDescriptiveItem(index)}
								className="w-fit cursor-pointer text-[20px] text-red-500 opacity-40 duration-300 ease-in hover:scale-110 hover:text-red-500 hover:opacity-100"
							>
								<MdDelete />
							</button>
						</div>

						<p className="mt-1 w-full text-center text-sm text-primary/70">{item.descricao}</p>
					</div>
				))
			) : (
				<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
					Nenhum item adicionado à lista...
				</p>
			)}
		</div>
	);
}

export default DescriptiveBlock;
