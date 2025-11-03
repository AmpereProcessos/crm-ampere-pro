import { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import Service from "@/components/Cards/Service";
import EditService from "@/components/Modals/Services/EditService";
import NewService from "@/components/Modals/Services/NewService";
import FiltersMenu from "@/components/Services/FiltersMenu";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import NotAuthorizedPage from "@/components/utils/NotAuthorizedPage";
import type { TUserSession } from "@/lib/auth/session";
import { useComercialServices } from "@/utils/queries/services";

type ServicesPageProps = {
	session: TUserSession;
};
function ServicesPage({ session }: ServicesPageProps) {
	const { data: services, isLoading, isError, isSuccess, filters, setFilters } = useComercialServices();
	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);
	const [newServiceModalIsOpen, setNewServiceModalIsOpen] = useState<boolean>(false);
	const [editServiceModal, setEditServiceModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

	if (!session.user.permissoes.servicos.visualizar) return <NotAuthorizedPage session={session} />;

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex flex-col items-center border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex items-center gap-1">
							{filterMenuIsOpen ? (
								<div className="cursor-pointer text-primary/60 hover:text-blue-400">
									<IoMdArrowDropupCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(false)} />
								</div>
							) : (
								<div className="cursor-pointer text-primary/60 hover:text-blue-400">
									<IoMdArrowDropdownCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(true)} />
								</div>
							)}
							<div className="flex flex-col gap-1">
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">BANCO DE SERVIÇOS</h1>
								<p className="text-sm leading-none tracking-tight text-primary/70">
									{services?.length ? (services.length > 0 ? `${services.length} serviços cadastrados` : `${services.length} serviço cadastrado`) : "..."}
								</p>
							</div>
						</div>
						{session?.user.permissoes.servicos.criar ? <Button onClick={() => setNewServiceModalIsOpen(true)}>CRIAR SERVIÇO</Button> : null}
					</div>
					{filterMenuIsOpen ? <FiltersMenu filters={filters} setFilters={setFilters} /> : null}
				</div>
				<div className="flex flex-wrap justify-between gap-2 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar serviços..." /> : null}
					{isSuccess ? (
						services.length > 0 ? (
							services.map((service) => (
								<Service
									key={service._id}
									service={service}
									handleClick={(id) => setEditServiceModal({ id: id, isOpen: true })}
									userHasEditPermission={session.user.permissoes.servicos.editar}
									userHasPricingViewPermission={session.user.permissoes.precos.visualizar}
								/>
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Nenhum serviço encontrado.
							</p>
						)
					) : null}
				</div>
			</div>
			{newServiceModalIsOpen ? <NewService session={session} closeModal={() => setNewServiceModalIsOpen(false)} /> : null}
			{editServiceModal.id && editServiceModal.isOpen ? (
				<EditService session={session} serviceId={editServiceModal.id} closeModal={() => setEditServiceModal({ id: null, isOpen: false })} />
			) : null}
		</div>
	);
}

export default ServicesPage;
