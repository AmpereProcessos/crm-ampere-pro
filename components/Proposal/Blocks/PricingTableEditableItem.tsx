import { formatDecimalPlaces, formatToMoney } from "@/lib/methods/formatting";
import { formatFormulaItem } from "@/utils/pricing/helpers";
import { TProposal } from "@/utils/schemas/proposal.schema";
import { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { MdSignalCellularAlt } from "react-icons/md";
import { TbMathFunction, TbPercentage } from "react-icons/tb";
import { VscChromeClose } from "react-icons/vsc";

type PricingTableEditableItemProps = {
	pricingItem: TProposal["precificacao"][number];
	userHasPricingEditPermission: boolean;
	showOnlyNonZero: boolean;
	editPricingItem: () => void;
};
function PricingTableEditableItem({ pricingItem, userHasPricingEditPermission, showOnlyNonZero, editPricingItem }: PricingTableEditableItemProps) {
	const [showFormula, setShowFormula] = useState<boolean>(false);
	const { descricao, custoCalculado, faturavel, custoFinal, margemLucro, valorCalculado, valorFinal, formulaArr } = pricingItem;
	const profitMarginPercentage = margemLucro / 100;
	if (showOnlyNonZero && valorFinal == 0) return null;
	return (
		<>
			{/**WEB */}
			<div className="hidden w-full flex-col lg:flex">
				<div className={`flex w-full items-center rounded-sm ${Math.abs(valorFinal - valorCalculado) > 1 ? "bg-orange-200" : ""}`}>
					<div className="flex w-6/12 flex-col items-center justify-center p-1">
						<h1 className="text-primary/70">{descricao}</h1>
						<div className="flex w-full items-center justify-center gap-2">
							<div className="flex items-center gap-1 px-1 py-0.5">
								<TbPercentage color="rgb(34,197,94)" />
								<p className="text-[0.55rem] tracking-tight text-primary/70">MARGEM DE {formatDecimalPlaces(margemLucro)}%</p>
							</div>
							<div className="flex items-center gap-1 px-1 py-0.5">
								<MdSignalCellularAlt color={"#fead41"} />
								<p className="text-[0.55rem] tracking-tight text-primary/70">{faturavel ? "FATURÁVEL" : "NÃO FATURÁVEL"}</p>
							</div>
							{formulaArr ? (
								<button
									onClick={() => setShowFormula((prev) => !prev)}
									className="group flex items-center gap-1 rounded-sm px-1 py-0.5 duration-300 hover:bg-cyan-50"
								>
									<TbMathFunction color={"rgb(6,182,212)"} />
									<p className="text-[0.55rem] tracking-tight text-primary/70 duration-300 group-hover:text-cyan-500">FÓRMULA</p>
								</button>
							) : null}
						</div>
					</div>
					<div className="flex w-2/12 items-center justify-center p-1">
						<h1 className="text-primary/70">{formatToMoney(custoFinal)}</h1>
					</div>
					<div className="flex w-2/12 items-center justify-center p-1">
						<h1 className="text-primary/70">{formatToMoney(valorFinal * profitMarginPercentage)}</h1>
					</div>
					<div className="flex w-2/12 items-center justify-center gap-4 p-1">
						<h1 className="w-full text-center text-primary/70 lg:w-1/2">{formatToMoney(valorFinal)}</h1>
						{userHasPricingEditPermission ? (
							<button onClick={() => editPricingItem()} className="text-md text-primary/40 hover:text-[#fead61]">
								<AiFillEdit />
							</button>
						) : null}
					</div>
				</div>
				{showFormula ? (
					<div className="flex w-fit min-w-[300px] flex-col self-center rounded-xs border border-primary/50 p-2">
						<div className="flex w-full items-center justify-between gap-2">
							<h1 className="text-[0.58rem] font-medium tracking-tight text-cyan-500">FÓRMULA UTILIZADA</h1>
							<button onClick={() => setShowFormula(false)} className="text-xs text-red-500">
								<VscChromeClose />
							</button>
						</div>

						<div className="flex w-full flex-wrap items-center justify-center gap-1 p-1">
							{formulaArr?.map((y, index2) => (
								<p key={index2} className={`text-[0.6rem] ${y.includes("[") ? "rounded-sm bg-blue-500 p-1 text-primary-foreground" : ""}`}>
									{formatFormulaItem(y)}
								</p>
							))}
						</div>
					</div>
				) : null}
			</div>
			{/**MOBILE */}
			<div className={`flex w-full flex-col rounded-md border border-primary/50 p-2 lg:hidden`}>
				<div className="flex items-center justify-between gap-2">
					<h1 className="text-sm font-black leading-none tracking-tight">{descricao}</h1>
					{userHasPricingEditPermission ? (
						<button onClick={() => editPricingItem()} className="text-md min-w-fit text-primary/40 hover:text-[#fead61]">
							<AiFillEdit />
						</button>
					) : null}
				</div>
				<div className="flex w-full items-center gap-2">
					<div className="flex items-center gap-1">
						<TbPercentage color="rgb(34,197,94)" />
						<p className="text-[0.6rem] tracking-tight text-primary/70">MARGEM DE {formatDecimalPlaces(margemLucro)}%</p>
					</div>
					<div className="flex items-center gap-1">
						<MdSignalCellularAlt color={"#fead41"} />
						<p className="text-[0.6rem] tracking-tight text-primary/70">{faturavel ? "FATURÁVEL" : "NÃO FATURÁVEL"}</p>
					</div>
					{formulaArr ? (
						<button
							onClick={() => setShowFormula((prev) => !prev)}
							className="group flex items-center gap-1 rounded-sm px-1 py-0.5 duration-300 hover:bg-cyan-50"
						>
							<TbMathFunction color={"rgb(6,182,212)"} />
							<p className="text-[0.55rem] tracking-tight text-primary/70 duration-300 group-hover:text-cyan-500">FÓRMULA</p>
						</button>
					) : null}
				</div>
				{showFormula ? (
					<div className="my-2 flex w-[80%] flex-col self-center rounded-xs border border-primary/50 p-2">
						<div className="flex w-full items-center justify-between gap-2">
							<h1 className="text-[0.58rem] font-medium tracking-tight text-cyan-500">FÓRMULA UTILIZADA</h1>
							<button onClick={() => setShowFormula(false)} className="text-xs text-red-500">
								<VscChromeClose />
							</button>
						</div>

						<div className="flex w-full flex-wrap items-center justify-center gap-1 p-1">
							{formulaArr?.map((y, index2) => (
								<p key={index2} className={`text-[0.6rem] ${y.includes("[") ? "rounded-sm bg-blue-500 p-1 text-primary-foreground" : ""}`}>
									{formatFormulaItem(y)}
								</p>
							))}
						</div>
					</div>
				) : null}
				<div className="mt-1 flex w-full items-center justify-around gap-2">
					<div className="flex flex-col items-center rounded-md border border-primary/50 px-2 py-1">
						<h1 className="text-[0.48rem] tracking-tight text-primary/70">CUSTO</h1>
						<h1 className="text-xxs font-medium tracking-tight text-primary/70">{formatToMoney(custoFinal)}</h1>
					</div>
					<div className="flex flex-col items-center rounded-md border border-green-500 px-2 py-1">
						<h1 className="text-[0.48rem] tracking-tight text-green-500">LUCRO</h1>
						<h1 className="text-xxs font-medium tracking-tight text-green-500">{formatToMoney(profitMarginPercentage * valorFinal)}</h1>
					</div>
					<div className="flex flex-col items-center rounded-md border border-blue-500 px-2 py-1">
						<h1 className="text-[0.48rem] tracking-tight text-blue-500">VALOR FINAL</h1>
						<h1 className="text-xxs font-medium tracking-tight text-blue-500">{formatToMoney(valorFinal)}</h1>
					</div>
				</div>
			</div>
		</>
	);
}

export default PricingTableEditableItem;
