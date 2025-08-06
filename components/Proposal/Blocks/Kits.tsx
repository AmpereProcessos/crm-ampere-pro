import { TProposal } from "@/utils/schemas/proposal.schema";
import React from "react";
import { SlEnergy } from "react-icons/sl";

type KitsProps = {
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
};
function Kits({ infoHolder, setInfoHolder }: KitsProps) {
	return (
		<div className="flex w-full flex-col items-center gap-2">
			<h1 className="w-full rounded bg-[#fead41] p-2 text-center font-bold leading-none tracking-tighter">KITS</h1>
			<div className="flex w-full flex-col gap-1">
				{infoHolder.kits.length > 0 ? (
					infoHolder.kits.map((kit, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-300 p-2">
							<div className="flex grow items-center justify-between gap-2">
								<div className="flex items-center gap-1">
									<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
										<SlEnergy size={13} />
									</div>
									<p className="text-sm font-medium leading-none tracking-tight">{kit.nome}</p>
								</div>
							</div>
						</div>
					))
				) : (
					<p className="w-full text-center text-sm italic text-gray-500">Nenhum kit vinculado à proposta...</p>
				)}
			</div>
		</div>
	);
}

export default Kits;
