import { formatToMoney } from "@/lib/methods/formatting";
import { getPricingTotals, getProfitMargin } from "@/utils/pricing/methods";
import { TProposalDTO } from "@/utils/schemas/proposal.schema";
import React from "react";
import { TbMathFunction } from "react-icons/tb";

type ProposalViewPricingBlockProps = {
	userHasPricingViewPermission: boolean;
	pricing: TProposalDTO["precificacao"];
};
function ProposalViewPricingBlock({ userHasPricingViewPermission, pricing }: ProposalViewPricingBlockProps) {
	return (
		<>
			{userHasPricingViewPermission ? (
				<>
					{/**WEB PAGE STYLES */}
					<div className="mt-2 hidden w-full flex-col gap-1 rounded border border-gray-500 shadow-md lg:flex">
						<div className="flex w-full items-center rounded bg-cyan-500">
							<div className="flex w-6/12 items-center justify-center p-1">
								<h1 className="font-bold text-white">ITEM</h1>
							</div>
							<div className="flex w-2/12 items-center justify-center p-1">
								<h1 className="font-bold text-white">CUSTO</h1>
							</div>
							<div className="flex w-2/12 items-center justify-center p-1">
								<h1 className="font-bold text-white">LUCRO</h1>
							</div>
							<div className="flex w-2/12 items-center justify-center p-1">
								<h1 className="font-bold text-white">VENDA</h1>
							</div>
						</div>
						<div className="flex w-full flex-col rounded-md bg-[#fff] py-2">
							{pricing.map((priceItem, index) => {
								const { descricao, custoFinal, custoCalculado, margemLucro, valorCalculado, valorFinal } = priceItem;
								const profitMarginPercentage = margemLucro / 100;
								const calculatedProfitMargin = getProfitMargin(custoCalculado, valorCalculado);
								return (
									<div className={`flex w-full items-center rounded ${Math.abs(valorFinal - valorCalculado) > 1 ? "bg-orange-200" : ""}`} key={index}>
										<div className="flex w-6/12 items-center justify-center p-1">
											<h1 className="text-gray-500">{descricao}</h1>
										</div>
										<div className="flex w-2/12 flex-col items-center justify-center p-1">
											<h1 className="text-gray-500">{formatToMoney(custoFinal)}</h1>
											<div className="flex items-center gap-1">
												<TbMathFunction color={"rgb(6,182,212)"} />
												<h1 className="text-[0.65rem] text-gray-500">{formatToMoney(custoFinal)}</h1>
											</div>
										</div>
										<div className="flex w-2/12 flex-col items-center justify-center p-1">
											<h1 className="text-gray-500">{formatToMoney(valorFinal * profitMarginPercentage)}</h1>
											<div className="flex items-center gap-1">
												<TbMathFunction color={"rgb(6,182,212)"} />
												<h1 className="text-[0.65rem] text-gray-500">{formatToMoney(valorCalculado * calculatedProfitMargin)}</h1>
											</div>
										</div>
										<div className="flex w-2/12 flex-col items-center justify-center p-1">
											<h1 className="w-full text-center text-gray-500 lg:w-1/2">{formatToMoney(valorFinal)}</h1>
											<div className="flex items-center gap-1">
												<TbMathFunction color={"rgb(6,182,212)"} />
												<h1 className="text-[0.65rem] text-gray-500">{formatToMoney(valorCalculado)}</h1>
											</div>
										</div>
									</div>
								);
							})}
							<div className="flex w-full items-center rounded border-t border-gray-300 py-1">
								<div className="flex w-6/12 items-center justify-center p-1">
									<h1 className="font-bold text-gray-800">TOTAIS</h1>
								</div>
								<div className="flex w-2/12 flex-col items-center justify-center p-1">
									<h1 className="font-medium text-gray-800">{formatToMoney(getPricingTotals(pricing).cost)}</h1>
									<div className="flex items-center gap-1">
										<TbMathFunction color={"rgb(6,182,212)"} />
										<h1 className="text-[0.65rem] text-gray-500">{formatToMoney(getPricingTotals(pricing).costCalculated)}</h1>
									</div>
								</div>
								<div className="flex w-2/12 flex-col items-center justify-center p-1">
									<h1 className="font-medium text-gray-800">{formatToMoney(getPricingTotals(pricing).profit)}</h1>
									<div className="flex items-center gap-1">
										<TbMathFunction color={"rgb(6,182,212)"} />
										<h1 className="text-[0.65rem] text-gray-500">{formatToMoney(getPricingTotals(pricing).profitCalculated)}</h1>
									</div>
								</div>
								<div className="flex w-2/12 flex-col items-center justify-center p-1">
									<h1 className="font-medium text-gray-800">{formatToMoney(getPricingTotals(pricing).total)}</h1>
									<div className="flex items-center gap-1">
										<TbMathFunction color={"rgb(6,182,212)"} />
										<h1 className="text-[0.65rem] text-gray-500">{formatToMoney(getPricingTotals(pricing).totalCalculated)}</h1>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/**MOBILE STYLES */}
					<div className="mt-2 flex w-full flex-col gap-1 rounded border border-gray-500 shadow-md lg:hidden">
						<h1 className="rounded-tl-md rounded-tr-md bg-gray-500 p-2 text-center font-Raleway font-bold text-white">ITENS</h1>
						{pricing.map((priceItem, index) => {
							if (pricing) {
								const { descricao, custoFinal, margemLucro, valorCalculado, valorFinal } = priceItem;
								return (
									<div className="flex w-full flex-col items-center rounded px-4" key={index}>
										<div className="flex w-full items-center justify-center p-1">
											<h1 className="font-medium text-gray-800">{descricao}</h1>
										</div>
										<div className="grid w-full grid-cols-3  items-center gap-1">
											<div className="col-span-1 flex flex-col items-center justify-center p-1">
												<h1 className="text-sm font-thin text-gray-500">CUSTO</h1>
												<h1 className="text-center text-xs font-bold text-[#15599a]">{formatToMoney(custoFinal)}</h1>
											</div>
											<div className="col-span-1 flex flex-col items-center justify-center p-1">
												<h1 className="text-sm font-thin text-gray-500">LUCRO</h1>
												<h1 className="text-center text-xs font-bold text-[#15599a]">{formatToMoney(valorFinal * margemLucro)}</h1>
											</div>
											<div className="col-span-1 flex flex-col items-center justify-center p-1">
												<h1 className="text-sm font-thin text-gray-500">VENDA</h1>
												<h1 className="text-center text-xs font-bold text-[#fead41]">{formatToMoney(valorFinal)}</h1>
											</div>
										</div>
									</div>
								);
							}
						})}
						<h1 className="mt-4 bg-gray-800 p-2 text-center font-Raleway font-bold text-white">TOTAIS</h1>
						<div className="grid w-full grid-cols-3  items-center gap-1 p-2">
							<div className="col-span-1 flex flex-col items-center justify-center p-1">
								<h1 className="text-sm font-thin text-gray-500">CUSTO</h1>
								<h1 className="text-center text-xs font-bold text-[#15599a]">{formatToMoney(getPricingTotals(pricing).cost)}</h1>
							</div>
							<div className="col-span-1 flex flex-col items-center justify-center p-1">
								<h1 className="text-sm font-thin text-gray-500">LUCRO</h1>
								<h1 className="text-center text-xs font-bold text-[#15599a]">{formatToMoney(getPricingTotals(pricing).profit)}</h1>
							</div>
							<div className="col-span-1 flex flex-col items-center justify-center p-1">
								<h1 className="text-sm font-thin text-gray-500">VENDA</h1>
								<h1 className="text-center text-xs font-bold text-[#fead41]">{formatToMoney(getPricingTotals(pricing).total)}</h1>
							</div>
						</div>
					</div>
				</>
			) : (
				<div className="mt-2 flex w-full grow flex-col gap-1">
					<div className="flex w-full items-center rounded bg-cyan-500">
						<div className="flex w-full items-center justify-center p-1">
							<h1 className="font-bold text-white">ITEM</h1>
						</div>
					</div>
					{pricing.map((priceItem, index) => {
						const { descricao, valorCalculado, valorFinal } = priceItem;
						return (
							<div className={`flex w-full items-center rounded ${Math.abs(valorFinal - valorCalculado) > 1 ? "bg-orange-200" : ""}`} key={index}>
								<div className="flex w-full items-center justify-center p-1">
									<h1 className="text-gray-500">{descricao}</h1>
								</div>
							</div>
						);
					})}
					<div className="flex w-full items-center rounded border-t border-gray-300 py-1">
						<div className="flex w-8/12 items-center justify-center p-1">
							<h1 className="font-bold text-gray-800">TOTAIS</h1>
						</div>
						<div className="flex w-4/12 items-center justify-center p-1">
							<h1 className="font-medium text-gray-800">{formatToMoney(getPricingTotals(pricing).total)}</h1>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default ProposalViewPricingBlock;
