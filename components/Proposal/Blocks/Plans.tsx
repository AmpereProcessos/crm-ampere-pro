import { TProposal } from "@/utils/schemas/proposal.schema";
import React from "react";
import { BsBookmarksFill } from "react-icons/bs";

type PlansProps = {
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
};
function Plans({ infoHolder, setInfoHolder }: PlansProps) {
	return (
		<div className="flex w-full flex-col items-center gap-2">
			<h1 className="w-full rounded-sm bg-[#fead41] p-2 text-center font-bold leading-none tracking-tighter">PLANOS DE ASSINATURA</h1>
			<div className="flex w-full flex-col gap-1">
				{infoHolder.planos.length > 0 ? (
					infoHolder.planos.map((plan, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2">
							<div className="flex grow items-center justify-between gap-2">
								<div className="flex items-center gap-1">
									<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
										<BsBookmarksFill size={13} />
									</div>
									<p className="text-sm font-medium leading-none tracking-tight">{plan.nome}</p>
								</div>
							</div>
						</div>
					))
				) : (
					<p className="w-full text-center text-sm italic text-primary/70">Nenhum plano vinculado à proposta...</p>
				)}
			</div>
		</div>
	);
}

export default Plans;
