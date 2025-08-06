import { TPartnerDTO, TPartnerDTOWithUsers } from "@/utils/schemas/partner.schema";
import React from "react";
import Avatar from "../utils/Avatar";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { BsCalendarPlus, BsTelephone } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { Optional } from "@/utils/models";

type PartnerProps = {
	partner: Optional<TPartnerDTOWithUsers, "usuarios">;
	handleClick: (id: string) => void;
};
function Partner({ partner, handleClick }: PartnerProps) {
	return (
		<div className="flex w-full gap-2 rounded-md border border-gray-300 bg-[#fff] font-Inter shadow-md">
			<div className={`flex h-full min-h-[100%] min-w-[6px] rounded-bl-md rounded-tl-md bg-blue-500`}></div>
			<div className="flex h-full grow flex-col p-3">
				<div className="flex w-full items-center gap-2">
					<Avatar width={40} height={40} url={partner.logo_url || undefined} fallback={formatNameAsInitials(partner.nome)} backgroundColor="black" />
					<h1 onClick={() => handleClick(partner._id)} className="cursor-pointer font-bold leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500">
						{partner.nome}
					</h1>
				</div>
				<div className="flex w-full grow flex-col">
					<div className="flex w-full items-center gap-2">
						<div className="flex items-center gap-2">
							<BsTelephone size={12} />
							<p className="text-xs font-light text-gray-500">{partner.contatos.telefonePrimario}</p>
						</div>
						<div className="flex items-center gap-2">
							<MdOutlineEmail size={15} />
							<p className="text-xs font-light text-gray-500">{partner.contatos.email}</p>
						</div>
					</div>
					{partner.usuarios ? (
						<>
							<div className="mt-2 flex w-full items-center justify-start gap-2">
								<div className="flex items-center gap-1 text-blue-500">
									<FaRegUserCircle />
									<h1 className="font-Inter text-xs font-bold">{partner.usuarios.length}</h1>
								</div>
								<h1 className="font-Inter text-xs text-gray-500">USUÁRIOS</h1>
							</div>
							<div className="mt-2 flex w-full flex-wrap items-start justify-start gap-2">
								{partner.usuarios.map((user, index) => {
									if (index < 10)
										return (
											<div key={user._id} className="flex items-center gap-1">
												<Avatar url={user.avatar_url || undefined} fallback={formatNameAsInitials(user.nome)} height={15} width={15} />
												<p className="font-Inter text-xs font-medium text-gray-500">{user.nome}</p>
											</div>
										);
								})}
								{partner.usuarios.length > 10 ? <p className="font-Inter text-xs font-medium text-gray-500">E MAIS...</p> : null}
							</div>
						</>
					) : null}
				</div>
				<div className="mt-2 flex w-full items-center justify-end gap-2">
					<BsCalendarPlus />
					<p className="text-sm font-light text-gray-500">{formatDateAsLocale(partner.dataInsercao)}</p>
				</div>
			</div>
		</div>
	);
}

export default Partner;
