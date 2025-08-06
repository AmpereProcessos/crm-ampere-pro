import TextInput from "@/components/Inputs/TextInput";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import { TProposal } from "@/utils/schemas/proposal.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineSafety } from "react-icons/ai";
import { FaIndustry } from "react-icons/fa";
import { ImPower } from "react-icons/im";
import { MdDelete, MdMiscellaneousServices, MdOutlineMiscellaneousServices } from "react-icons/md";

type ProductsProps = {
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
};
function Products({ infoHolder, setInfoHolder }: ProductsProps) {
	return (
		<div className="flex w-full flex-col items-center gap-2">
			<h1 className="w-full rounded bg-[#fead41] p-2 text-center font-bold leading-none tracking-tighter">PRODUTOS</h1>
			<div className="flex w-full flex-col gap-1">
				{infoHolder.produtos.length > 0 ? (
					infoHolder.produtos.map((product, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-300 p-2">
							<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
								<div className="flex items-center gap-1">
									<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]">{renderCategoryIcon(product.categoria)}</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
										<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
									</p>
								</div>
								<div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
									<div className="flex items-center gap-1">
										<FaIndustry size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.fabricante}</p>
									</div>
									<div className="flex items-center gap-1">
										<ImPower size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.potencia} W</p>
									</div>
									<div className="flex items-center gap-1">
										<AiOutlineSafety size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.garantia} ANOS</p>
									</div>
								</div>
							</div>
						</div>
					))
				) : (
					<p className="w-full text-center text-sm italic text-gray-500">Nenhum produto vinculado à proposta...</p>
				)}
			</div>
		</div>
	);
}

export default Products;
