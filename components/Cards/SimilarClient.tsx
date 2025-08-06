import { IClient, IResponsible, IUsuario } from "@/utils/models";
import React from "react";
import Avatar from "../utils/Avatar";
import { getUserAvatarUrl } from "@/lib/methods/extracting";
import { formatDateAsLocale, formatLocation, formatNameAsInitials } from "@/lib/methods/formatting";
import { AiFillPhone } from "react-icons/ai";
import { MdEmail, MdLocationPin } from "react-icons/md";

import { BsCalendarPlus, BsCheck2Circle } from "react-icons/bs";
import { TSimilarClientSimplifiedDTO } from "@/utils/schemas/client.schema";
import { FaPhone, FaUser } from "react-icons/fa";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { FaRegIdCard } from "react-icons/fa6";
type SimilarClientProps = {
	client: TSimilarClientSimplifiedDTO;
	selectedClientId: string | null;
	handleSelectSimilarClient: (client: TSimilarClientSimplifiedDTO) => void;
};
function SimilarClient({ client, selectedClientId, handleSelectSimilarClient }: SimilarClientProps) {
	const isSelected = client._id == selectedClientId;
	const location: TOpportunity["localizacao"] = {
		cep: client.cep,
		uf: client.uf,
		cidade: client.cidade,
		bairro: client.bairro,
		endereco: client.endereco,
		numeroOuIdentificador: client.numeroOuIdentificador,
		complemento: client.complemento,
	};
	return (
		<div className="flex  w-full flex-col gap-2 rounded-md border border-gray-500 bg-[#fff] p-4 font-Inter shadow-md">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex  items-center gap-1">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
						<FaUser />
					</div>
					<p className="text-sm font-black leading-none tracking-tight">{client.nome}</p>
				</div>
				{isSelected ? (
					<h1 className="rounded-full bg-green-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">SELECIONADO</h1>
				) : (
					<button onClick={() => handleSelectSimilarClient(client)} className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">
						SELECIONAR
					</button>
				)}
			</div>
			<div className="mt-2 flex w-full flex-wrap items-center justify-between">
				<div className="flex items-center gap-2">
					<MdLocationPin />
					<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{formatLocation({ location, includeCity: true, includeUf: true })}</p>
				</div>
				<div className="flex items-center gap-2">
					<FaPhone />
					<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{client.telefonePrimario}</p>
				</div>
			</div>
			<div className="flex w-full flex-wrap items-center justify-between">
				<div className="flex items-center gap-2">
					<MdEmail />
					<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{client.email || "NÃO PREENCHIDO"}</p>
				</div>
				<div className="flex items-center gap-2">
					<FaRegIdCard />
					<p className="text-[0.65rem] font-medium leading-none tracking-tight text-gray-500 lg:text-xs">{client.cpfCnpj || "NÃO PREENCHIDO"}</p>
				</div>
			</div>
			<div className="mt-2 flex w-full items-center justify-start gap-2">
				<div className={`flex items-center gap-2`}>
					<BsCalendarPlus />
					<p className="text-xs font-medium text-gray-500">{formatDateAsLocale(client.dataInsercao)}</p>
				</div>
				<div className="flex items-center justify-center gap-2">
					<Avatar fallback={"U"} height={25} width={25} url={client.autor?.avatar_url || undefined} />
					<p className="text-xs font-medium text-gray-500">{client.autor?.nome}</p>
				</div>
			</div>
		</div>
	);
}
// <h1 className="font-bold leading-none tracking-tight">{client.nome}</h1>
// <div className="mt-2 flex w-full items-center justify-between">
//   <div className="flex items-center gap-2">
//     <AiFillPhone color="rgb(22, 104, 238)" />
//     <p className="text-sm text-gray-500">{client.telefonePrimario || 'N/A'}</p>
//   </div>
//   <div className="flex items-center gap-2">
//     <MdEmail color="rgb(59,130,246)" />
//     <p className="text-sm text-gray-500">{client.email || 'N/A'}</p>
//   </div>
// </div>
// <div className="mt-1 flex w-full items-center justify-between">
//   <div className="mt-1 flex items-center gap-2">
//     <Avatar height={25} width={25} fallback={formatNameAsInitials(client.autor?.nome || 'VENDEDOR')} url={client.autor.avatar_url || undefined} />
//     <p className="text-sm text-gray-500">{client.autor?.nome || ''}</p>
//   </div>
//   {isSelected ? (
//     <div className="flex items-center justify-center gap-2 text-green-500">
//       <BsCheck2Circle />
//       <p className="text-xs">SELECIONADO</p>
//     </div>
//   ) : (
//     <button
//       onClick={() => handleSelectSimilarClient(client)}
//       className="rounded border border-cyan-500 p-1 text-xs font-medium text-cyan-500 duration-300 ease-in-out hover:bg-cyan-500 hover:text-white"
//     >
//       UTILIZAR CLIENTE
//     </button>
//   )}
// </div>
export default SimilarClient;
