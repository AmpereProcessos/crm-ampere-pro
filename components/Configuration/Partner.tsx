import { usePartnerOwnInfo } from "@/utils/queries/partners";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import Avatar from "../utils/Avatar";
import { formatLocation, formatNameAsInitials } from "@/lib/methods/formatting";
import { MdOutlineEmail } from "react-icons/md";
import { BsTelephone } from "react-icons/bs";
import { GiBrazil } from "react-icons/gi";
import { FaCity } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import EditPartnerOwn from "../Modals/Partner/EditPartnerOwn";
type PartnerProps = {
	session: TUserSession;
};
function Partner({ session }: PartnerProps) {
	const [editModalIsOpen, setEditModalIsOpen] = useState<boolean>(false);
	const partnerId = session.user.idParceiro || "";
	const { data: partner, isLoading, isError, isSuccess } = usePartnerOwnInfo({ id: partnerId });
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-gray-200 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold`}>Informações da Empresa</h1>
					<p className="text-sm text-[#71717A]">Gerencie e configure informações e personalizações da empresa</p>
				</div>
				<button
					onClick={() => setEditModalIsOpen(true)}
					className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
				>
					EDITAR
				</button>
			</div>

			{isLoading ? <LoadingComponent /> : null}
			{isError ? <ErrorComponent msg="Erro ao buscar informações da empresa." /> : null}
			{isSuccess ? (
				<div className="flex w-full grow flex-col gap-2 py-6">
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="flex min-w-[150px] flex-col items-center gap-2">
							<Avatar url={partner?.logo_url || undefined} fallback={formatNameAsInitials(partner.nome || "")} height={100} width={100} />
						</div>
						<div className="flex grow flex-col">
							<h1 className="text-lg font-bold leading-none tracking-tight">{partner.nome}</h1>
							<h1 className="mt-2 text-xs font-medium text-gray-800">DESCRIÇÃO</h1>
							<p className="text-sm text-gray-500">{partner.descricao || "Descrição ainda não preenchida."}</p>
						</div>
					</div>
					<div className="flex w-full flex-col">
						<h1 className="mt-2 text-sm font-medium text-gray-800">CONTATOS</h1>
						<div className="mt-1 flex flex-col items-center gap-2 lg:flex-row">
							<div className="flex items-center gap-1">
								<MdOutlineEmail size={18} />
								<p className="text-sm text-gray-500">{partner.contatos.email || "NÃO POSSUI"}</p>
							</div>
							<div className="flex items-center gap-1">
								<BsTelephone size={14} />
								<p className="text-sm text-gray-500">
									{partner.contatos.telefonePrimario} {partner.contatos.telefoneSecundario ? ` e/ou ${partner.contatos.telefoneSecundario}` : null}
								</p>
							</div>
						</div>
						<h1 className="mt-2 text-sm font-medium text-gray-800">LOCALIZAÇÃO</h1>
						<div className="mt-1 flex flex-col items-center gap-2 lg:flex-row">
							<div className="flex items-center gap-1">
								<GiBrazil size={16} />
								<p className="text-sm text-gray-500">{partner.localizacao.uf || "NÃO PREENCHIDO"}</p>
							</div>
							<div className="flex items-center gap-1">
								<FaCity size={14} />
								<p className="text-sm text-gray-500">{partner.localizacao.cidade}</p>
							</div>
							<div className="flex items-center gap-1">
								<IoLocationSharp size={14} />
								<p className="text-sm text-gray-500">{formatLocation({ location: partner.localizacao })}</p>
							</div>
						</div>
					</div>
				</div>
			) : null}
			{editModalIsOpen ? <EditPartnerOwn partnerId={partnerId} session={session} closeModal={() => setEditModalIsOpen(false)} /> : null}
		</div>
	);
}

export default Partner;
