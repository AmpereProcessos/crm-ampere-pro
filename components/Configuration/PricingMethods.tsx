import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import NewPricingMethod from "../Modals/PricingMethods/NewPricingMethod";
import { usePricingMethods } from "@/utils/queries/pricing-methods";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import { MdPriceChange } from "react-icons/md";
import { ImPriceTag } from "react-icons/im";
import EditPricingMethod from "../Modals/PricingMethods/EditPricingMethod";
import { BsCalendarPlus } from "react-icons/bs";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import Avatar from "../utils/Avatar";

const FixedPricingMethod = ["660dab0b0fcb72da4ed8c35e", "660de08225fee32a2237fa37", "661400485ce24a96d0c62c30", "661455bf6eaecfde21b552a7"];

type PricingMethodsProps = {
	session: TUserSession;
};
function PricingMethods({ session }: PricingMethodsProps) {
	const [newPricingMethodModalIsOpen, setNewPricingMethodModalIsOpen] = useState<boolean>(false);
	const { data: pricingMethods, isSuccess, isLoading, isError } = usePricingMethods();
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-gray-300 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold`}>Controle de metodologias de precificação</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite os metodologias de precificação</p>
				</div>
				<button
					onClick={() => setNewPricingMethodModalIsOpen(true)}
					className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
				>
					NOVA METODOLOGIA
				</button>
			</div>

			{newPricingMethodModalIsOpen ? <NewPricingMethod session={session} closeModal={() => setNewPricingMethodModalIsOpen(false)} /> : null}
			<div className="flex w-full flex-col gap-2 py-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar metodologias de precificação" /> : null}
				{isSuccess
					? pricingMethods.map((method) => (
							<div key={method._id.toString()} className="flex w-full flex-col rounded-md border border-gray-300 p-2">
								<div className="flex w-full items-center justify-between gap-2">
									<div className="flex grow items-center gap-1">
										<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
											<ImPriceTag size={13} />
										</div>
										{!FixedPricingMethod.includes(method._id) ? (
											<p
												onClick={() => setEditModal({ id: method._id, isOpen: true })}
												className="cursor-pointer text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
											>
												{method.nome}
											</p>
										) : (
											<p className="text-sm font-medium leading-none tracking-tight">{method.nome}</p>
										)}
									</div>
									{FixedPricingMethod.includes(method._id) ? null : <h1 className="rounded-full bg-black px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">FIXO</h1>}
								</div>

								<h1 className='"w-full mt-2 text-start text-xs font-medium'>UNIDADES DE PREÇO</h1>
								<div className="flex w-full flex-wrap items-center justify-start gap-2">
									{method.itens.map((item, itemIndex) => (
										<div key={itemIndex} className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-[0.57rem] font-medium">
											{item.nome}
										</div>
									))}
								</div>
								<div className="mt-2 flex w-full items-center justify-end gap-2">
									{!FixedPricingMethod.includes(method._id) ? (
										<>
											<div className={`flex items-center gap-2`}>
												<div className="ites-center flex gap-1">
													<BsCalendarPlus />
													<p className={`text-xs font-medium text-gray-500`}>{formatDateAsLocale(method.dataInsercao, true)}</p>
												</div>
											</div>
											<div className="flex items-center justify-center gap-1">
												<Avatar fallback={"U"} height={20} width={20} url={method.autor?.avatar_url || undefined} />
												<p className="text-xs font-medium text-gray-500">{method.autor?.nome}</p>
											</div>
										</>
									) : null}
								</div>
							</div>
						))
					: null}
			</div>
			{editModal.id && editModal.isOpen ? <EditPricingMethod pricingMethodId={editModal.id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} /> : null}
		</div>
	);
}

export default PricingMethods;
