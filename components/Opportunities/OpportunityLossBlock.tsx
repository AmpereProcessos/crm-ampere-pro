import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Diamond } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsCalendarX } from "react-icons/bs";
import { VscChromeClose } from "react-icons/vsc";
import { getErrorMessage } from "@/lib/methods/errors";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import { leadLoseJustification } from "@/utils/constants";
import { updateOpportunity } from "@/utils/mutations/opportunities";
import { LoadingButton } from "../Buttons/loading-button";
import SelectInput from "../Inputs/SelectInput";
import { Button } from "../ui/button";
import ResponsiveDialogDrawer from "../utils/ResponsiveDialogDrawer";

type LoseProjectProps = {
	opportunityId: string;
	opportunityLossDate?: string | null;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};

function OpportunityLossBlock({ opportunityId, opportunityLossDate, callbacks }: LoseProjectProps) {
	if (!opportunityLossDate) return <LoseProjectBlock opportunityId={opportunityId} callbacks={callbacks} />;
	return <ReactivationBlock opportunityId={opportunityId} lossDate={opportunityLossDate} callbacks={callbacks} />;
}

export default OpportunityLossBlock;

type ReactivationBlockProps = {
	opportunityId: string;
	lossDate: string;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};
function ReactivationBlock({ opportunityId, lossDate, callbacks }: ReactivationBlockProps) {
	const { mutate: handleOpportunityUpdate, isPending } = useMutation({
		mutationKey: ["update-opportunity-reactivation", opportunityId],
		mutationFn: updateOpportunity,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
	});
	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-4 rounded-lg bg-red-500 px-4 py-1 text-primary-foreground">
				<h1 className="text-center font-Raleway text-xs font-bold tracking-tight">PERDIDO</h1>
				<div className="flex items-center gap-1">
					<BsCalendarX size={12} />
					<p className="text-center text-xs font-bold tracking-tight">{formatDateAsLocale(lossDate, true)}</p>
				</div>
			</div>
			<LoadingButton
				variant="ghost"
				loading={isPending}
				onClick={() => handleOpportunityUpdate({ id: opportunityId, changes: { "perda.data": null, "perda.descricaoMotivo": null } })}
				className="px-2 py-1 rounded-lg"
				size="fit"
			>
				RESETAR
			</LoadingButton>
		</div>
	);
}

type LoseProjectBlockProps = {
	opportunityId: string;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};
function LoseProjectBlock({ opportunityId, callbacks }: LoseProjectBlockProps) {
	const [menuIsOpen, setMenuIsOpen] = useState(false);

	return (
		<div className="flex w-fit items-center justify-center">
			<Button type="button" variant="destructive" size="fit" onClick={() => setMenuIsOpen(true)} className="px-2 py-1 rounded-lg">
				PERDER PROJETO
			</Button>
			{menuIsOpen && <OpportunityLossMenu opportunityId={opportunityId} closeModal={() => setMenuIsOpen(false)} callbacks={callbacks} />}
		</div>
	);
}

type OpportunityLossMenuProps = {
	opportunityId: string;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};
function OpportunityLossMenu({ opportunityId, closeModal, callbacks }: OpportunityLossMenuProps) {
	const [cause, setCause] = useState<string>("");

	function handleLoseOpportunity(cause: string) {
		if (!cause || cause.length < 3) throw new Error("Selecione um motivo para perder a oportunidade.");
		return updateOpportunity({ id: opportunityId, changes: { "perda.data": new Date().toISOString(), "perda.descricaoMotivo": cause } });
	}
	const { mutate: handleOpportunityUpdateMutation, isPending } = useMutation({
		mutationKey: ["update-opportunity-loss", opportunityId],
		mutationFn: handleLoseOpportunity,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			toast.success(data);
			return closeModal();
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
	});

	return (
		<ResponsiveDialogDrawer
			menuTitle="PERDER OPORTUNIDADE"
			menuDescription="Selecione o motivo da perda da oportunidade."
			menuActionButtonText="PERDER PROJETO"
			menuActionButtonClassName="bg-red-500 text-primary-foreground"
			menuCancelButtonText="CANCELAR"
			actionFunction={() => handleOpportunityUpdateMutation(cause)}
			closeMenu={closeModal}
			stateIsLoading={isPending}
			stateError={null}
			actionIsLoading={isPending}
		>
			<h1 className="text-sm tracking-tight text-primary">DEFINA O MOTIVO DA PERDA</h1>
			<div className="flex flex-col gap-2">
				{Object.keys(leadLoseJustification).map((justification, index) => (
					<Button
						size="sm"
						key={`${justification}-${index.toString()}`}
						variant={justification === cause ? "default" : "ghost"}
						onClick={() => setCause(justification)}
						className={cn("w-full flex items-center justify-start gap-2 hover:bg-red-100 hover:text-red-500", {
							"bg-red-200 text-red-600": justification === cause,
						})}
					>
						<Diamond className="w-4 h-4" />
						<p className="text-sm tracking-tight">{justification}</p>
					</Button>
				))}
			</div>
		</ResponsiveDialogDrawer>
	);
	// return (
	// 	<Dialog.Root open onOpenChange={closeModal}>
	// 		<Dialog.Overlay className="fixed inset-0 z-100 bg-[rgba(0,0,0,.85)] backdrop-blur-xs" />
	// 		<Dialog.Content className="fixed left-[50%] top-[50%] z-100 h-fit w-[80%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[40%]">
	// 			<div className="flex h-full flex-col">
	// 				<div className="flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row">
	// 					<h3 className="text-xl font-bold text-primary  ">PERDER OPORTUNIDADE</h3>
	// 					<Dialog.Close asChild>
	// 						<button type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
	// 							<VscChromeClose style={{ color: "red" }} />
	// 						</button>
	// 					</Dialog.Close>
	// 				</div>

	// 				<div className="flex grow flex-col gap-y-2 pb-36 overflow-y-auto overscroll-y-auto px-2  scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">

	// 				</div>
	// 				<div className="mt-2 flex w-full items-center justify-end">
	// 					<LoadingButton
	// 						loading={isPending}
	// 						onClick={() =>
	// 							handleOpportunityUpdate({ id: opportunityId, changes: { "perda.data": new Date().toISOString(), "perda.descricaoMotivo": cause } })
	// 						}
	// 						type="button"
	// 					>
	// 						PERDER PROJETO
	// 					</LoadingButton>
	// 				</div>
	// 			</div>
	// 		</Dialog.Content>
	// 	</Dialog.Root>
	// );
}
