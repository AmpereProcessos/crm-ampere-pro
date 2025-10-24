import { useSession } from "@/app/providers/SessionProvider";
import EditPartner from "@/components/Modals/Partner/EditPartner";
import NewPartner from "@/components/Modals/Partner/NewPartner";
import Avatar from "@/components/utils/Avatar";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import LoadingPage from "@/components/utils/LoadingPage";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { usePartners } from "@/utils/queries/partners";
import type { TPartnerDTOWithUsers } from "@/utils/schemas/partner.schema";
import { useState } from "react";
import { BsCalendarPlus, BsTelephone } from "react-icons/bs";
import { FaRegUserCircle, FaUser } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { VscDiffAdded } from "react-icons/vsc";

function getBarColor(active: boolean) {
	// if (!active) return 'bg-primary/50'
	return "bg-blue-500";
}

function PartnersControlPannel() {
	const { session, status } = useSession({ required: true });
	const [newPartnerModalIsOpen, setNewPartnerModalIsOpen] = useState<boolean>(false);
	const [editParnetModal, setEditPartnerModal] = useState<{ partnerId: string | null; isOpen: boolean }>({
		partnerId: null,
		isOpen: false,
	});
	const { data: partners, isSuccess, isLoading, isError } = usePartners();

	function getStats({ info }: { info?: TPartnerDTOWithUsers[] }) {
		if (!info)
			return {
				parceiros: 0,
				usuarios: 0,
			};
		const partners = info.length;
		const users = info.reduce((acc, current) => acc + current.usuarios.length, 0);
		return {
			parceiros: partners,
			usuarios: users,
		};
	}
	if (status !== "authenticated") return <LoadingPage />;
	if (!session?.user.administrador) return <ErrorComponent msg="Seu usuário não possui  permissão para acessar essa área." />;
	return (
		<div className="flex h-full flex-col md:flex-row">
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
					<div className="flex w-full items-center justify-between">
						<h1 className="font-Inter text-3xl font-black md:text-2xl">PAINEL DE PARCEIROS</h1>
						<button
							type="button"
							onClick={() => setNewPartnerModalIsOpen(true)}
							className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
						>
							CRIAR PARCEIRO
						</button>
					</div>
					<div className="my-2 flex w-full flex-col items-center justify-center gap-3 lg:flex-row">
						<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-3 shadow-md lg:w-1/4">
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-medium uppercase tracking-tight">Nº DE PARCEIROS</h1>
								<VscDiffAdded />
							</div>
							<div className="mt-2 flex w-full flex-col">
								<div className="text-2xl font-bold text-[#15599a]">{getStats({ info: partners }).parceiros}</div>
							</div>
						</div>
						<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-3 shadow-md lg:w-1/4">
							<div className="flex items-center justify-between">
								<h1 className="text-sm font-medium uppercase tracking-tight">Nº DE USUÁRIOS</h1>
								<FaUser />
							</div>
							<div className="mt-2 flex w-full flex-col">
								<div className="text-2xl font-bold text-[#15599a]">{getStats({ info: partners }).usuarios}</div>
							</div>
						</div>
					</div>
				</div>

				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Houve um erro ao buscar informações dos parceiros." /> : null}
				{isSuccess && partners ? (
					<div className="flex w-full flex-col gap-3 py-2">
						{partners.map((partner, key) => (
							<div key={partner._id} className="flex w-full gap-2 rounded-md border border-primary/30 bg-background font-Inter shadow-md">
								<div className={`flex h-full min-h-full min-w-[6px] ${getBarColor(partner.ativo)} rounded-bl-md rounded-tl-md`} />
								<div className="flex h-full grow flex-col p-3">
									<div className="flex w-full items-center gap-2">
										<Avatar width={40} height={40} url={partner.logo_url || undefined} fallback={formatNameAsInitials(partner.nome)} />
										<button
											type="button"
											onClick={() => setEditPartnerModal({ isOpen: true, partnerId: partner._id })}
											className="cursor-pointer font-bold leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
										>
											{partner.nome}
										</button>
									</div>
									<div className="flex w-full grow flex-col">
										<div className="flex w-full items-center gap-2">
											<div className="flex items-center gap-2">
												<BsTelephone size={12} />
												<p className="text-xs font-light text-primary/70">{partner.contatos.telefonePrimario}</p>
											</div>
											<div className="flex items-center gap-2">
												<MdOutlineEmail size={15} />
												<p className="text-xs font-light text-primary/70">{partner.contatos.email}</p>
											</div>
										</div>
										<div className="mt-2 flex w-full items-center justify-start gap-2">
											<div className="flex items-center gap-1 text-blue-500">
												<FaRegUserCircle />
												<h1 className="font-Inter text-xs font-bold">{partner.usuarios.length}</h1>
											</div>
											<h1 className="font-Inter text-xs text-primary/70">USUÁRIOS</h1>
										</div>
										<div className="mt-2 flex w-full flex-wrap items-start justify-start gap-2">
											{partner.usuarios.map((user, index) => {
												if (index < 10)
													return (
														<div key={user._id} className="flex items-center gap-1">
															<Avatar url={user.avatar_url || undefined} fallback={formatNameAsInitials(user.nome)} height={15} width={15} />
															<p className="font-Inter text-xs font-medium text-primary/70">{user.nome}</p>
														</div>
													);
											})}
											{partner.usuarios.length > 10 ? <p className="font-Inter text-xs font-medium text-primary/70">E MAIS...</p> : null}
										</div>
									</div>
									<div className="mt-2 flex w-full items-center justify-end gap-2">
										<BsCalendarPlus />
										<p className="text-sm font-light text-primary/70">{formatDateAsLocale(partner.dataInsercao)}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				) : null}
			</div>
			{newPartnerModalIsOpen ? <NewPartner closeModal={() => setNewPartnerModalIsOpen(false)} /> : null}
			{editParnetModal.isOpen && editParnetModal.partnerId ? (
				<EditPartner partnerId={editParnetModal.partnerId} closeModal={() => setEditPartnerModal({ isOpen: false, partnerId: null })} />
			) : null}
		</div>
	);
}

export default PartnersControlPannel;
