import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale, formatLocation } from "@/lib/methods/formatting";
import type { TClientDTO } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { Accessibility, BriefcaseBusiness, Building2, Cake, Edit, Filter, Phone, User, UserRound } from "lucide-react";
import { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BsCalendarPlus } from "react-icons/bs";
import { FaRing } from "react-icons/fa";
import { FaLocationDot, FaRegIdCard } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import EditClient from "../Modals/Client/EditClient";
import Avatar from "../utils/Avatar";
import { Button } from "../ui/button";

type OpportunityClientProps = {
	client: TClientDTO;
	responsibles: TOpportunity["responsaveis"];
	session: TUserSession;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};
function OpportunityClient({ client, responsibles, session, callbacks }: OpportunityClientProps) {
	const [editModalIsOpen, setEditModalIsOpen] = useState<boolean>(false);
	const userScope = session.user.permissoes.clientes.escopo;
	const userHasClientEditPermission = !userScope || userScope.includes(client.autor.id) || responsibles.some((r) => userScope.includes(r.id));
	return (
		<div className={"bg-card border-primary/20 flex w-full h-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold tracking-tight uppercase">DADOS DO CLIENTE</h1>
				<div className="flex items-center gap-2">
					{userHasClientEditPermission ? (
						<Button onClick={() => setEditModalIsOpen(true)} variant="ghost" size={"xs"} className="flex items-center gap-1">
							<Edit className="h-4 w-4 min-h-4 min-w-4" />
							<p className="text-xs font-medium">EDITAR</p>
						</Button>
					) : null}
				</div>
			</div>
			<div className="flex w-full grow flex-col gap-2">
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-col items-center gap-1 lg:items-start">
						<p className="text-[0.65rem] font-medium text-primary/70">GERAIS</p>
						<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
							<div className="flex items-center gap-1">
								<UserRound size={15} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.nome}</p>
							</div>
							<div className="flex items-center gap-1">
								<FaRegIdCard size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.cpfCnpj ?? "NÃO DEFINIDO"}</p>
							</div>
							<div className="flex items-center gap-1">
								<Cake size={15} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">
									{client.dataNascimento ? formatDateAsLocale(client.dataNascimento) : "NÃO DEFINIDO"}
								</p>
							</div>
							<div className="flex items-center gap-1">
								<FaRing size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.estadoCivil || "NÃO DEFINIDO"}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-col items-center gap-1 lg:items-start">
						<p className="text-[0.65rem] font-medium text-primary/70">CONTATOS</p>
						<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
							<div className="flex items-center gap-1">
								<Phone size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.telefonePrimario}</p>
							</div>
							<div className="flex items-center gap-1">
								<MdEmail size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.email || "NÃO DEFINIDO"}</p>
							</div>
						</div>
					</div>
					<div className="flex flex-col items-center gap-1 lg:items-end">
						<p className="text-[0.65rem] font-medium text-primary/70">AQUISIÇÃO</p>
						<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
							<div className="flex items-center gap-1">
								<Filter size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.canalAquisicao}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-col items-center gap-1 lg:items-start">
						<p className="text-[0.65rem] font-medium text-primary/70">LOCALIZAÇÃO</p>
						<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
							<div className="flex items-center gap-1">
								<FaLocationDot size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">
									{formatLocation({
										location: {
											cep: client.cep,
											uf: client.uf,
											cidade: client.cidade,
											bairro: client.bairro,
											endereco: client.endereco,
											numeroOuIdentificador: client.numeroOuIdentificador,
											complemento: client.complemento,
										},
										includeCity: true,
										includeUf: true,
									}) ?? "NÃO DEFINIDO"}
								</p>
							</div>
						</div>
					</div>
					<div className="flex flex-col items-center gap-1 lg:items-end">
						<p className="text-[0.65rem] font-medium text-primary/70">ESTADO CIVIL</p>
						<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
							<div className="flex items-center gap-1">
								<FaRing size={15} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.estadoCivil}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-col items-center gap-1 lg:items-start">
						<p className="text-[0.65rem] font-medium text-primary/70">TRABALHO</p>
						<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
							<div className="flex items-center gap-1">
								<BriefcaseBusiness size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.profissao || "NÃO DEFINIDO"}</p>
							</div>
							<div className="flex items-center gap-1">
								<Building2 size={12} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.ondeTrabalha || "NÃO DEFINIDO"}</p>
							</div>
						</div>
					</div>
					<div className="flex flex-col items-center gap-1 lg:items-end">
						<p className="text-[0.65rem] font-medium text-primary/70">DEFICIÊNCIA</p>
						<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
							<div className="flex items-center gap-1">
								<Accessibility size={15} />
								<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.deficiencia || "N/A"}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col items-center gap-1">
					<p className="text-[0.65rem] font-medium text-primary/70">INDICAÇÃO</p>
					<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-center">
						{client.indicador.nome ? (
							<>
								<div className="flex items-center gap-1">
									<User size={15} />
									<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.indicador.nome}</p>
								</div>
								<div className="flex items-center gap-1">
									<Phone size={15} />
									<p className="text-[0.75rem] font-medium leading-none tracking-tight">{client.indicador.contato || "NÃO DEFINIDO"}</p>
								</div>
							</>
						) : (
							<p className="text-[0.75rem] font-medium leading-none tracking-tight">NÃO APLICÁVEL</p>
						)}
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-end gap-2">
				<div className={"flex items-center gap-1"}>
					<BsCalendarPlus />
					<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(client.dataInsercao, true)}</p>
				</div>
				<div className="flex items-center gap-1">
					<Avatar fallback={"R"} url={client.autor.avatar_url || undefined} height={20} width={20} />
					<p className="text-[0.65rem] font-medium text-primary/70">{client.autor.nome}</p>
				</div>
			</div>
			{editModalIsOpen ? (
				<EditClient clientId={client._id} session={session} partnerId={client.idParceiro} closeModal={() => setEditModalIsOpen(false)} callbacks={callbacks} />
			) : null}
		</div>
	);
}

export default OpportunityClient;
