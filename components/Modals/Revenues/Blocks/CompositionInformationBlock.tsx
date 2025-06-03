import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { TRevenue, TRevenueCompositionItem } from "@/utils/schemas/revenues.schema";
import { Units } from "@/utils/select-options";
import React, { useState } from "react";
import toast from "react-hot-toast";
import RevenueCompositionTable from "./Utils/CompositionTable";

type RevenueCompositionInformationBlockProps = {
	infoHolder: TRevenue;
	setInfoHolder: React.Dispatch<React.SetStateAction<TRevenue>>;
};
function RevenueCompositionInformationBlock({ infoHolder, setInfoHolder }: RevenueCompositionInformationBlockProps) {
	const [compositionItem, setCompositionItem] = useState<TRevenueCompositionItem>({
		idProduto: null,
		idServico: null,
		descricao: "",
		qtde: 0,
		unidade: "UN",
		valor: 0,
	});
	function addItem(item: TRevenueCompositionItem) {
		const items = [...infoHolder.composicao];
		items.push(item);
		// Calculating new total
		const total = items.reduce((acc, current) => acc + current.qtde * current.valor, 0);
		setInfoHolder((prev) => ({ ...prev, composicao: items, total: total }));
		setCompositionItem({
			idProduto: null,
			idServico: null,
			descricao: "",
			qtde: 0,
			unidade: "UN",
			valor: 0,
		});
		return toast.success("Item adicionado !", { duration: 500 });
	}

	const compositionItemsTotal = infoHolder.composicao.reduce((acc, current) => acc + current.qtde * current.valor, 0);
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">COMPOSIÇÃO DA RECEITA</h1>
			<div className="flex w-full flex-col gap-1">
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-[40%]">
							<TextInput
								label="DESCRIÇÃO"
								placeholder="Preencha a descrição do item..."
								value={compositionItem.descricao}
								handleChange={(value) => setCompositionItem((prev) => ({ ...prev, descricao: value }))}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[20%]">
							<SelectInput
								label="UNIDADE"
								resetOptionLabel="NÃO DEFINIDO"
								options={Units}
								value={compositionItem.unidade}
								handleChange={(value) =>
									setCompositionItem((prev) => ({
										...prev,
										unidade: value,
									}))
								}
								onReset={() => {
									setCompositionItem((prev) => ({
										...prev,
										unidade: "UN",
									}));
								}}
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[20%]">
							<NumberInput
								label="QTDE"
								value={compositionItem.qtde}
								handleChange={(value) =>
									setCompositionItem((prev) => ({
										...prev,
										qtde: value,
									}))
								}
								placeholder="Preencha a quantidade do item..."
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[20%]">
							<NumberInput
								label="VALOR UNITÁRIO"
								value={compositionItem.valor}
								handleChange={(value) =>
									setCompositionItem((prev) => ({
										...prev,
										valor: value,
									}))
								}
								placeholder="Preencha o valor do item..."
								width="100%"
							/>
						</div>
					</div>
					<div className="flex items-center justify-end">
						<button className="rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700" onClick={() => addItem(compositionItem)}>
							ADICIONAR ITEM
						</button>
					</div>
				</div>
				<RevenueCompositionTable infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
				{compositionItemsTotal > infoHolder.total ? (
					<p className="w-full rounded border border-orange-400 bg-orange-50 p-1 text-center text-xs italic tracking-tight text-orange-400">
						Por favor, ajuste os valores dos itens da composição. A somatória dos itens atuais excede o valor total estabelecido para a receita.
					</p>
				) : null}
				<div className="flex w-full items-end justify-center">
					<NumberInput
						label="TOTAL DA RECEITA"
						placeholder="Preencha o valor total da receita..."
						value={infoHolder.total}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, total: value }))}
					/>
				</div>
			</div>
		</div>
	);
}

export default RevenueCompositionInformationBlock;
