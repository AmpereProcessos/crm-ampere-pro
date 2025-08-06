import TextInput from "@/components/Inputs/TextInput";
import { TProposal } from "@/utils/schemas/proposal.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineSafety } from "react-icons/ai";
import { MdDelete, MdMiscellaneousServices, MdOutlineMiscellaneousServices } from "react-icons/md";

type ServicesProps = {
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
};
function Services({ infoHolder, setInfoHolder }: ServicesProps) {
	return (
		<div className="flex w-full flex-col items-center gap-2">
			<h1 className="w-full rounded bg-[#fead41] p-2 text-center font-bold leading-none tracking-tighter">SERVIÇOS</h1>
			<div className="flex w-full flex-col gap-1">
				{infoHolder.servicos.length > 0 ? (
					infoHolder.servicos.map((service, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-300 p-2">
							<div className="flex w-full items-center justify-between gap-2">
								<div className="flex  items-center gap-1">
									<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
										<MdOutlineMiscellaneousServices />
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
								</div>
								<div className="flex  grow items-center justify-end gap-2 pl-2">
									<div className="flex items-center gap-1">
										<AiOutlineSafety size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{service.garantia} ANOS</p>
									</div>
								</div>
							</div>
						</div>
					))
				) : (
					<p className="w-full text-center text-sm italic text-gray-500">Nenhum serviço vinculado à proposta...</p>
				)}
			</div>
		</div>
	);
}

export default Services;
