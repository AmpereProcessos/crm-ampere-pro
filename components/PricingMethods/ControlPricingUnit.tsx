import { TPricingMethod, TPricingMethodItemResultItem } from "@/utils/schemas/pricing-method.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { MdContentCopy, MdDelete, MdEdit } from "react-icons/md";
import NewPricingUnit from "./NewPricingUnit";

import { formatFormulaItem, renderConditionPhrase } from "@/utils/pricing/helpers";
import { usePartnersSimplified } from "@/utils/queries/partners";
import EditPricingUnit from "./EditPricingUnit";

type ControlPricingUnitProps = {
	methodology: TPricingMethod;
	setMethodology: React.Dispatch<React.SetStateAction<TPricingMethod>>;
};
function ControlPricingUnit({ methodology, setMethodology }: ControlPricingUnitProps) {
	const { data: partners } = usePartnersSimplified();
	const [newPriceUnitMenuIsOpen, setNewPriceUnitMenuIsOpen] = useState<boolean>(true);
	const [editPriceUnitMenu, setEditPriceUnitMenu] = useState<{ index: number | null; info: TPricingMethod["itens"][number] | null }>({
		index: null,
		info: null,
	});
	const [pricingHolder, setPricingHolder] = useState<TPricingMethod["itens"][number]>({
		nome: "",
		resultados: [],
	});
	const [resultHolder, setResultHolder] = useState<TPricingMethodItemResultItem>({
		condicao: {
			aplicavel: false,
			variavel: null,
			igual: null,
		},
		faturavel: false,
		margemLucro: 0,
		formulaArr: [],
	});
	function deletePricingUnit(index: number) {
		const items = [...methodology.itens];
		items.splice(index, 1);
		setMethodology((prev) => ({ ...prev, itens: items }));
	}
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="mt-2 w-full rounded-md bg-primary/70 p-1 text-center text-sm font-bold text-primary-foreground">UNIDADES DE PREÇO</h1>
			{newPriceUnitMenuIsOpen ? (
				<NewPricingUnit
					pricingHolder={pricingHolder}
					setPricingHolder={setPricingHolder}
					resultHolder={resultHolder}
					setResultHolder={setResultHolder}
					methodology={methodology}
					setMethodology={setMethodology}
					partners={partners}
					closeMenu={() => setNewPriceUnitMenuIsOpen(false)}
				/>
			) : (
				<div className="flex w-full items-center justify-end">
					<button
						className="rounded bg-green-500 p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-green-600"
						onClick={() => setNewPriceUnitMenuIsOpen(true)}
					>
						NOVA UNIDADE DE PREÇO
					</button>
				</div>
			)}
			{editPriceUnitMenu.index != null ? (
				<EditPricingUnit
					index={editPriceUnitMenu.index}
					pricingHolder={pricingHolder}
					setPricingHolder={setPricingHolder}
					resultHolder={resultHolder}
					setResultHolder={setResultHolder}
					methodology={methodology}
					setMethodology={setMethodology}
					partners={partners}
					closeMenu={() => setEditPriceUnitMenu({ index: null, info: null })}
				/>
			) : null}
			<h1 className="my-4 text-sm font-bold leading-none tracking-tight text-[#E25E3E]">LISTA DE UNIDADES DE PREÇO</h1>
			{methodology.itens.length > 0 ? (
				methodology.itens.map((item, index) => (
					<div key={index} className="flex w-full flex-col gap-2 rounded-md border border-primary/50 p-3 shadow-md">
						<div className="flex w-full items-center justify-between gap-2">
							<h1 className="mb-2 text-sm font-black leading-none tracking-tight">{item.nome}</h1>
							<div className="flex items-center gap-1">
								<button
									onClick={() => {
										setNewPriceUnitMenuIsOpen(false);
										setEditPriceUnitMenu({ index: index, info: item });
										setPricingHolder(item);
									}}
									className="flex items-center justify-center rounded-lg p-1 text-orange-500 duration-300 ease-linear hover:scale-105 hover:bg-orange-200"
								>
									<MdEdit />
								</button>
								<button
									onClick={() => deletePricingUnit(index)}
									type="button"
									className="flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
								>
									<MdDelete style={{ color: "red" }} />
								</button>
							</div>
						</div>

						<div className="flex flex-col">
							{item.resultados.map((result, index2) => (
								<div key={index2} className="mb-1 flex w-full items-center gap-2 rounded-md border border-[#A0E9FF] p-1">
									<div className="flex flex-col">
										{renderConditionPhrase({ condition: result.condicao, partners: partners || [] })}
										{/* <h1 className="text-start text-sm font-bold leading-none tracking-tight text-cyan-500">
                      {!result.condicao.aplicavel
                        ? 'FÓRMULA GERAL:'
                        : `SE ${formatCondition(result.condicao.variavel || '')} FOR IGUAL A ${result.condicao.igual}:`}
                    </h1> */}
										<div className="flex items-center gap-2 font-Inter">
											<div className="flex items-center gap-1">
												<p className="text-xs text-primary/70">MARGEM: </p>
												<p className="text-xs font-bold text-[#FFBB5C]">{result.margemLucro}%</p>
											</div>
											<div className="flex items-center gap-1">
												<p className="text-xs text-primary/70">FATURÁVEL: </p>
												<p className="text-xs font-bold text-[#FFBB5C]">{result.faturavel ? "SIM" : "NÃO"}</p>
											</div>
										</div>
										<button
											onClick={() => {
												setResultHolder((prev) => ({ ...prev, formulaArr: [...prev.formulaArr, ...result.formulaArr] }));
												return toast.success("Formula adicionada a área de trabalho");
											}}
											className="flex w-fit items-center gap-1 rounded-md bg-primary/90 px-2 py-1 text-primary-foreground hover:bg-primary/80"
										>
											<MdContentCopy size={15} />
											<p className="text-[0.6rem] tracking-tight">COPIAR PARA ÁREA DE TRABALHO</p>
										</button>
									</div>
									<div className="flex  grow flex-wrap items-center justify-center gap-1 p-1">
										{result.formulaArr.map((y) => (
											<p className={`text-[0.7rem] ${y.includes("[") ? "rounded-sm bg-blue-500 p-1 text-primary-foreground" : ""}`}>{formatFormulaItem(y)}</p>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				))
			) : (
				<h1 className="w-full text-center text-xs font-medium italic">Sem unidades de preço cadastradas...</h1>
			)}
		</div>
	);
}

export default ControlPricingUnit;
