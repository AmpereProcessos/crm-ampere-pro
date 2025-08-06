import { usePartners } from "@/utils/queries/partners";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";

import EditPartner from "../Modals/Partner/EditPartner";
import NewPartner from "../Modals/Partner/NewPartner";
import Partner from "../Cards/Partner";

type PartnersProps = {
	session: TUserSession;
};
function Partners({ session }: PartnersProps) {
	const { data: partners, isLoading, isError, isSuccess } = usePartners();
	const isAllowedToCreatePartner = session.user.permissoes.parceiros.criar;
	const isAllowedToEditPartner = session.user.permissoes.parceiros.criar;
	const scope = session.user.permissoes.parceiros.escopo;

	const [newPartnerModalIsOpen, setNewPartnerModalIsOpen] = useState<boolean>(false);
	const [editPartnerModal, setEditPartnerModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-gray-300 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold`}>Controle de parceiros</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite parceiros</p>
				</div>
				{isAllowedToCreatePartner ? (
					<button
						onClick={() => setNewPartnerModalIsOpen(true)}
						className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
					>
						NOVO PARCEIRO
					</button>
				) : null}
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Houve um erro ao buscar informações dos parceiros." /> : null}
				{isSuccess && partners ? (
					<div className="flex w-full flex-col gap-3 py-2">
						{partners.map((partner, key) => (
							<Partner key={partner._id} partner={partner} handleClick={(id) => setEditPartnerModal({ id: id, isOpen: true })} />
						))}
					</div>
				) : null}
			</div>
			{editPartnerModal.id && editPartnerModal.isOpen ? <EditPartner partnerId={editPartnerModal.id} closeModal={() => setEditPartnerModal({ id: null, isOpen: false })} /> : null}
			{newPartnerModalIsOpen ? <NewPartner closeModal={() => setNewPartnerModalIsOpen(false)} /> : null}
		</div>
	);
}

export default Partners;
