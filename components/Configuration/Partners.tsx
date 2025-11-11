import { Plus } from "lucide-react";
import { useState } from "react";
import type { TUserSession } from "@/lib/auth/session";
import { usePartners } from "@/utils/queries/partners";
import Partner from "../Cards/Partner";
import EditPartner from "../Modals/Partner/EditPartner";
import NewPartner from "../Modals/Partner/NewPartner";
import { Button } from "../ui/button";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";

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
			<div className="flex w-full flex-col items-center justify-between border-b border-primary/30 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold uppercase`}>Controle de parceiros</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite parceiros</p>
				</div>
				{isAllowedToCreatePartner ? (
					<Button onClick={() => setNewPartnerModalIsOpen(true)} size={"xs"} className="flex items-center gap-1">
						<Plus className="w-4 h-4 min-w-4 min-h-4" />
						NOVO PARCEIRO
					</Button>
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
			{editPartnerModal.id && editPartnerModal.isOpen ? (
				<EditPartner partnerId={editPartnerModal.id} closeModal={() => setEditPartnerModal({ id: null, isOpen: false })} />
			) : null}
			{newPartnerModalIsOpen ? <NewPartner closeModal={() => setNewPartnerModalIsOpen(false)} /> : null}
		</div>
	);
}

export default Partners;
