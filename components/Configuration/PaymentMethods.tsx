import { useState } from "react";
import { BsCalendarPlus } from "react-icons/bs";
import { MdPayment } from "react-icons/md";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { usePaymentMethods } from "@/utils/queries/payment-methods";
import EditPaymentMethod from "../Modals/PaymentMethods/EditPaymentMethod";
import NewPaymentMethod from "../Modals/PaymentMethods/NewPaymentMethod";
import Avatar from "../utils/Avatar";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";

type PaymentMethodsProps = {
	session: TUserSession;
};
function PaymentMethods({ session }: PaymentMethodsProps) {
	const { data: paymentMethods, isLoading, isSuccess, isError } = usePaymentMethods();
	const [newPaymentMethodModalIsOpen, setNewPaymentMethodModalIsOpen] = useState<boolean>(false);
	const [editPaymentMethodModal, setEditPaymentMethodModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full items-center justify-between border-b border-primary/30 pb-2">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold uppercase`}>Controle de métodos de pagamento</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite os métodos de pagamento</p>
				</div>
				<button
					onClick={() => setNewPaymentMethodModalIsOpen(true)}
					className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					NOVO MÉTODO
				</button>
			</div>

			<div className="flex w-full flex-col gap-2 py-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar metodologias de precificação" /> : null}
				{isSuccess
					? paymentMethods.map((method) => (
							<div
								onClick={() => setEditPaymentMethodModal({ id: method._id, isOpen: true })}
								key={method._id.toString()}
								className="flex w-full flex-col rounded-md border border-primary/30 p-2"
							>
								<div className="flex grow items-center gap-1">
									<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
										<MdPayment size={13} />
									</div>
									<p className="cursor-pointer text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500">{method.nome}</p>
								</div>
								<div className="flex w-full flex-col gap-2">
									<h1 className='"w-full mt-2 text-start text-xs font-medium'>FRACIONAMENTO</h1>
									<div className="flex w-full flex-wrap items-center justify-start gap-2">
										{method.fracionamento.map((item, itemIndex) => (
											<div key={itemIndex} className="rounded-lg border border-primary/30 bg-primary/20 px-2 py-1 text-[0.57rem] font-medium">
												{item.porcentagem}% {item.metodo}
											</div>
										))}
									</div>
								</div>
								<div className="mt-2 flex w-full items-center justify-end gap-2">
									<div className={`flex items-center gap-2`}>
										<div className="ites-center flex gap-1">
											<BsCalendarPlus />
											<p className={`text-xs font-medium text-primary/70`}>{formatDateAsLocale(method.dataInsercao, true)}</p>
										</div>
									</div>
									<div className="flex items-center justify-center gap-1">
										<Avatar fallback={"U"} height={20} width={20} url={method.autor?.avatar_url || undefined} />
										<p className="text-xs font-medium text-primary/70">{method.autor?.nome}</p>
									</div>
								</div>
							</div>
						))
					: null}
			</div>
			{newPaymentMethodModalIsOpen ? <NewPaymentMethod closeModal={() => setNewPaymentMethodModalIsOpen(false)} session={session} /> : null}
			{editPaymentMethodModal.id && editPaymentMethodModal.isOpen ? (
				<EditPaymentMethod
					session={session}
					paymentMethodId={editPaymentMethodModal.id}
					closeModal={() => setEditPaymentMethodModal({ id: null, isOpen: false })}
				/>
			) : null}
		</div>
	);
}

export default PaymentMethods;
