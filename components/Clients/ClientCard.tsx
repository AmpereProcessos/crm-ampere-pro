import { copyToClipboard } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/methods/errors";
import { formatDateAsLocale, formatLocation } from "@/lib/methods/formatting";
import { createConectaInvite } from "@/utils/mutations/conecta-invites";
import type { TClientDTOSimplified } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { useMutation } from "@tanstack/react-query";
import { Pencil, Send, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { BsCalendarPlus } from "react-icons/bs";
import { FaPhone } from "react-icons/fa";
import { FaLocationDot, FaRegIdCard } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import Avatar from "../utils/Avatar";

type ClientCard = {
	client: TClientDTOSimplified;
	openModal: (id: string) => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function ClientCard({ client, openModal, callbacks }: ClientCard) {
	const location: TOpportunity["localizacao"] = {
		cep: client.cep,
		uf: client.uf,
		cidade: client.cidade,
		bairro: client.bairro,
		endereco: client.endereco,
		numeroOuIdentificador: client.numeroOuIdentificador,
		complemento: client.complemento,
	};
	const { mutate: handleCreateConectaInvite, isPending } = useMutation({
		mutationKey: ["create-conecta-invite"],
		mutationFn: createConectaInvite,
		onMutate: () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: (data) => {
			toast.success(data.message);
			if (callbacks?.onSuccess) callbacks.onSuccess();
			copyToClipboard(`https://conecta-ampere.vercel.app/invites/id/${data.data.inviteId}`);
		},
		onSettled: () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: (error) => {
			const msg = getErrorMessage(error);
			toast.error(msg);
		},
	});
	function renderConectaTag() {
		const clientConecta = client.conecta;

		if (clientConecta?.conviteDataAceite) {
			return (
				<div className="flex items-center gap-1 text-xxs text-green-500 font-bold leading-none tracking-tight">
					<Share2 size={12} />
					<h1>CONECTA ATIVO</h1>
				</div>
			);
		}
		if (clientConecta?.conviteId) {
			return (
				<div className="flex items-center gap-1 text-xxs text-orange-500 font-bold leading-none tracking-tight">
					<Share2 size={12} />
					<h1>CONECTA ENVIADO</h1>
				</div>
			);
		}
		return (
			<div className="flex items-center gap-1 text-xxs font-bold leading-none tracking-tight">
				<Share2 size={12} />
				<h1>CONECTA INATIVO</h1>
				<button
					disabled={isPending}
					onClick={() => handleCreateConectaInvite({ clientId: client._id })}
					type="button"
					className="flex items-center justify-center gap-1 p-1 rounded-xl bg-cyan-500 text-primary-foreground disabled:bg-primary/30"
				>
					<Send size={10} />
					<p className="tracking-tight leading-none">ENVIAR CONVITE</p>
				</button>
			</div>
		);
	}
	return (
		<div className="flex w-full flex-col rounded-md border border-primary/50 bg-background p-4 gap-2">
			<div className="flex w-full flex-col lg:flex-row items-center justify-between gap-2">
				<div className="flex items-center gap-1">
					<h1 className="text-sm font-bold leading-none tracking-tight">{client.nome}</h1>
				</div>
				{renderConectaTag()}
			</div>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex w-full flex-wrap items-center justify-center gap-2 lg:grow lg:justify-start">
					<div className="flex items-center gap-1">
						<FaRegIdCard width={10} height={10} />
						<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80">{client.cpfCnpj || "CPF/CNPJ NÃO DEFINIDO"}</h1>
					</div>
					<div className="flex items-center gap-1">
						<FaPhone width={10} height={10} />
						<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80">{client.telefonePrimario}</h1>
					</div>
					<div className="flex items-center gap-1">
						<MdEmail width={10} height={10} />
						<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80">{client.email || "EMAIL NÃO DEFINIDO"}</h1>
					</div>
				</div>
				<div className="flex w-full flex-wrap items-center justify-center gap-2 lg:min-w-fit lg:justify-end">
					<div className="flex items-center gap-1">
						<FaLocationDot width={10} height={10} />
						<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80">LOCALIZAÇÃO</h1>
						<h1 className="py-0.5 text-center text-[0.6rem] font-bold  text-primary">{formatLocation({ location }) || "NÃO DEFINIDA"}</h1>
					</div>
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-1">
						<BsCalendarPlus />
						<p className="text-[0.65rem] font-medium text-primary/80">{formatDateAsLocale(client.dataInsercao, true)}</p>
					</div>
					<div className="flex items-center gap-1">
						<Avatar fallback={"R"} url={client.autor.avatar_url || undefined} height={20} width={20} />
						<p className="text-[0.65rem] font-medium text-primary/80">{client.autor.nome}</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => openModal(client._id)}
					className="flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-[0.6rem] text-secondary"
				>
					<Pencil width={10} height={10} />
					<p>EDITAR</p>
				</button>
			</div>
		</div>
	);
}

export default ClientCard;
