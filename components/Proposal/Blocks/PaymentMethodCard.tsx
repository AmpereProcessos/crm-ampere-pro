import { formatToMoney, isEmpty } from "@/utils/methods";
import { getFractionnementValue, getPaymentMethodFinalValue } from "@/utils/payment";
import { TFractionnementItem, TPaymentMethodDTO } from "@/utils/schemas/payment-methods";
import { TProposalPaymentMethodItem } from "@/utils/schemas/proposal.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsCheck, BsCircleHalf } from "react-icons/bs";
import { FaPercentage } from "react-icons/fa";
import { MdPayment } from "react-icons/md";

type PaymentMethodCardProps = {
	index: number;
	selectedMethods: TProposalPaymentMethodItem[];
	updateSelectedMethods: (methods: TProposalPaymentMethodItem[]) => void;
	selectMethod: (id: TProposalPaymentMethodItem) => void;
	removeMethod: (id: string) => void;
	method: TPaymentMethodDTO;
	proposalValue: number;
	isSelectable?: boolean;
	fractionnementWidth?: string;
};
function PaymentMethodCard({
	index,
	selectedMethods,
	updateSelectedMethods,
	selectMethod,
	removeMethod,
	method,
	proposalValue,
	isSelectable = true,
	fractionnementWidth,
}: PaymentMethodCardProps) {
	function getInitialHolderState({ method, selectedMethods }: { method: TPaymentMethodDTO; selectedMethods: TProposalPaymentMethodItem[] }) {
		const selectedEquivalent = selectedMethods.find((m) => m.id == method._id);
		if (!selectedEquivalent) return { id: method._id, nome: method.nome, descricao: method.descricao, fracionamento: method.fracionamento };
		return {
			id: selectedEquivalent.id,
			nome: selectedEquivalent.nome,
			descricao: selectedEquivalent.descricao,
			fracionamento: selectedEquivalent.fracionamento,
		};
	}
	const [methodHolder, setMethodHolder] = useState<TProposalPaymentMethodItem>(getInitialHolderState({ method, selectedMethods }));
	const isSelected = selectedMethods.map((m) => m.id).includes(methodHolder.id);

	return (
		<div className="flex w-full flex-col rounded-md border border-gray-300 p-2">
			<div className="flex grow items-center justify-between gap-2">
				<div className="flex items-center gap-1">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
						<MdPayment size={13} />
					</div>
					<p className="text-sm font-medium leading-none tracking-tight">{methodHolder.nome}</p>
				</div>
				{isSelectable ? (
					<button
						onClick={() => {
							if (isSelected) removeMethod(methodHolder.id);
							else selectMethod({ id: methodHolder.id, nome: methodHolder.nome, descricao: methodHolder.descricao, fracionamento: methodHolder.fracionamento });
						}}
						className={`flex h-[20px] ${isSelected ? "bg-blue-500" : ""} w-[20px] items-center rounded-full border-2 border-blue-500`}
					>
						{isSelected ? <BsCheck style={{ color: "white" }} /> : null}
					</button>
				) : null}
			</div>

			<h1 className='"w-full mt-2 text-start text-xs font-medium'>FRACIONAMENTO</h1>
			<div className="flex w-full flex-wrap items-center justify-start gap-2">
				{methodHolder.fracionamento.map((fractionnement, itemIndex) => (
					<div key={itemIndex} className={`flex w-full flex-col rounded-md border border-gray-500 p-2 shadow-md lg:w-[${fractionnementWidth ? fractionnementWidth : "450px"}]`}>
						<div className="flex w-full items-center justify-between gap-2">
							<h1 className="text-xs font-black leading-none tracking-tight lg:text-sm">FRAÇÃO DE {fractionnement.porcentagem}%</h1>
							<h1 className="rounded-full bg-gray-800 px-2 py-1 text-[0.65rem] font-medium text-white lg:text-xs">
								{formatToMoney(getFractionnementValue({ fractionnement, proposalValue }))}
							</h1>
						</div>
						<div className="mt-2 flex w-full flex-wrap items-center justify-between">
							<div className="flex items-center gap-2">
								<MdPayment color={"#76c893"} />
								<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{fractionnement.metodo}</p>
							</div>
							<div className="flex items-center gap-2">
								<BsCircleHalf color="#ed174c" />
								<input
									value={!isEmpty(fractionnement.parcelas) ? fractionnement.parcelas?.toString() : ""}
									onChange={(e) => {
										const value = Number(e.target.value);
										const fractionnements = [...methodHolder.fracionamento];

										if (value > fractionnement.maximoParcelas) {
											fractionnements[itemIndex].parcelas = fractionnement.maximoParcelas;
											setMethodHolder((prev) => ({ ...prev, fracionamento: fractionnements }));
											return toast.error("Oops, valor preenchido excede o máximo de parcelas.");
										}
										fractionnements[itemIndex].parcelas = value;
										setMethodHolder((prev) => ({ ...prev, fracionamento: fractionnements }));
										if (isSelected) {
											const selectedMethodIndex = selectedMethods.map((s) => s.id).indexOf(method._id);
											const selectedMethodsCopy = [...selectedMethods];
											selectedMethodsCopy[selectedMethodIndex].fracionamento[itemIndex].parcelas = value;
											updateSelectedMethods(selectedMethodsCopy);
										}
									}}
									type="number"
									className="w-[40px] rounded-lg border border-gray-300 p-1 text-center text-[0.6rem] tracking-tight text-gray-500 shadow-md outline-none placeholder:italic"
								/>
								<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">
									{(fractionnement.parcelas || 0) > 1 ? "PARCELAS" : "PARCELA"} ({fractionnement.maximoParcelas} MÁX)
								</p>
							</div>
							{fractionnement.taxaJuros ? (
								<div className="flex items-center gap-2">
									<FaPercentage />
									<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{fractionnement.taxaJuros} DE JUROS</p>
								</div>
							) : null}
							{fractionnement.taxaUnica ? (
								<div className="flex items-center gap-2">
									<FaPercentage />
									<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{fractionnement.taxaUnica} DE USO</p>
								</div>
							) : null}
						</div>
					</div>
				))}
			</div>
			<div className="mt-2 flex w-full items-center justify-end">
				<h1 className="text-sm text-gray-500">
					VALOR FINAL DE: <strong className="text-black">{formatToMoney(getPaymentMethodFinalValue({ method: methodHolder, proposalValue }))}</strong>
				</h1>
			</div>
		</div>
	);
}

export default PaymentMethodCard;
