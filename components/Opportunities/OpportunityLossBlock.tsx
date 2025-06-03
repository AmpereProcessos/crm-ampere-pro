import React, { useState } from "react";
import DropdownSelect from "../Inputs/DropdownSelect";
import { leadLoseJustification } from "@/utils/constants";
import { VscChromeClose } from "react-icons/vsc";
import { TiCancel } from "react-icons/ti";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";

import { AiFillCloseCircle } from "react-icons/ai";
import dayjs from "dayjs";
import { RxReload } from "react-icons/rx";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { updateOpportunity } from "@/utils/mutations/opportunities";
import { updateRDOpportunity } from "@/utils/mutations/rd-opportunities";
import SelectInput from "../Inputs/SelectInput";
import { LoadingButton } from "../Buttons/loading-button";
import { BsCalendarX } from "react-icons/bs";
import { formatDateAsLocale } from "@/lib/methods/formatting";

type LoseProjectProps = {
	opportunityId: string;
	opportunityIsLost: boolean;
	opportunityLossDate?: string | null;
	opportunityEmail?: string | null;
	idMarketing?: string | null;
};
type ReactivationBlockProps = {
	lossDate: string;
};
function OpportunityLossBlock({ opportunityId, opportunityIsLost, opportunityLossDate, opportunityEmail, idMarketing }: LoseProjectProps) {
	const queryClient = useQueryClient();
	const [menuIsOpen, setMenuIsOpen] = useState(false);
	const [cause, setCause] = useState<string | null>(null);
	const { mutate: handleOpportunityUpdate, isPending } = useMutationWithFeedback({
		mutationKey: ["update-opportunity", opportunityId],
		mutationFn: updateOpportunity,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-by-id", opportunityId],
	});
	async function handleLoseProject() {
		// In case opportunity came from RD station TODO
		if (idMarketing && opportunityEmail) await updateRDOpportunity({ operation: "OPPORTUNITY_LOST", email: opportunityEmail || "", reason: cause || "" });

		// @ts-ignore
		handleOpportunityUpdate({ id: opportunityId, changes: { "perda.data": new Date().toISOString(), "perda.descricaoMotivo": cause } });
	}
	function handleReactiveProject() {
		// @ts-ignore
		handleOpportunityUpdate({ id: opportunityId, changes: { "perda.data": null, "perda.descricaoMotivo": null } });
	}

	function ReactivationBlock({ lossDate }: ReactivationBlockProps) {
		return (
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-4 rounded-lg bg-red-500 px-4 py-1 text-white">
					<h1 className="text-center font-Raleway text-xs font-bold tracking-tight">PERDIDO</h1>
					<div className="flex items-center gap-1">
						<BsCalendarX size={12} />
						<p className="text-center text-xs font-bold tracking-tight">{formatDateAsLocale(lossDate, true)}</p>
					</div>
				</div>
				<button
					disabled={isPending}
					onClick={() => handleReactiveProject()}
					className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1 text-white duration-300 ease-in-out hover:bg-blue-800"
				>
					<h1 className="text-center font-Raleway text-xs font-bold tracking-tight">RESETAR</h1>
					<RxReload size={12} />
				</button>
			</div>
		);
	}
	function LoseProjectBlock() {
		return (
			<div className="flex w-fit items-center justify-center">
				<button
					onClick={() => setMenuIsOpen(true)}
					className="flex min-w-fit items-center justify-center gap-2 rounded bg-red-500 px-2 py-0.5 text-[0.6rem] font-medium text-white duration-300 hover:bg-red-700"
				>
					PERDER PROJETO
				</button>
				{menuIsOpen && <OpportunityLossMenu opportunityId={opportunityId} idMarketing={idMarketing} opportunityEmail={opportunityEmail} closeModal={() => setMenuIsOpen(false)} />}
			</div>
		);
	}
	if (!opportunityLossDate) return <LoseProjectBlock />;
	else return <ReactivationBlock lossDate={opportunityLossDate} />;
}

export default OpportunityLossBlock;

type OpportunityLossMenuProps = {
	opportunityId: string;
	idMarketing?: string | null;
	opportunityEmail?: string | null;
	closeModal: () => void;
};
function OpportunityLossMenu({ opportunityId, idMarketing, opportunityEmail, closeModal }: OpportunityLossMenuProps) {
	const queryClient = useQueryClient();
	const [cause, setCause] = useState<string | null>(null);

	const { mutate: handleOpportunityUpdate, isPending } = useMutationWithFeedback({
		mutationKey: ["update-opportunity", opportunityId],
		mutationFn: updateOpportunity,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-by-id", opportunityId],
	});
	async function handleLoseProject() {
		// In case opportunity came from RD station TODO
		if (idMarketing && opportunityEmail) await updateRDOpportunity({ operation: "OPPORTUNITY_LOST", email: opportunityEmail || "", reason: cause || "" });

		// @ts-ignore
		handleOpportunityUpdate({ id: opportunityId, changes: { "perda.data": new Date().toISOString(), "perda.descricaoMotivo": cause } });
	}
	function handleReactiveProject() {
		// @ts-ignore
		handleOpportunityUpdate({ id: opportunityId, changes: { "perda.data": null, "perda.descricaoMotivo": null } });
	}

	return (
		<div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-fit w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[30%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">PERDER OPORTUNIDADE</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>

					<div className="flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<SelectInput
							label="MOTIVO DA PERDA"
							value={cause}
							options={Object.keys(leadLoseJustification).map((justification, index) => {
								return {
									id: index + 1,
									label: justification,
									value: justification,
								};
							})}
							handleChange={(value) => setCause(value)}
							onReset={() => setCause(null)}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="mt-2 flex w-full items-center justify-end">
						<LoadingButton loading={isPending} onClick={() => handleLoseProject()} type="button">
							PERDER PROJETO
						</LoadingButton>
					</div>
				</div>
			</div>
		</div>
	);
}
