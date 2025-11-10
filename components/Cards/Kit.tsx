import { FaIndustry, FaTag } from "react-icons/fa";
import { TbTopologyFull } from "react-icons/tb";

import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { formatToMoney } from "@/utils/methods";
import { TKitDTO } from "@/utils/schemas/kits.schema";
import dayjs from "dayjs";
import { BsCalendarEvent, BsCalendarPlus } from "react-icons/bs";
import Image from "next/image";
import { BadgeDollarSign, Pencil, ShieldCheck, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

function getStatusTag({ active, expiryDate }: { active: boolean; expiryDate?: string | null }) {
	if (!active) return <h1 className="rounded-full bg-primary/60 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs">INATIVO</h1>;
	if (expiryDate && dayjs(expiryDate).isBefore(new Date()))
		return <h1 className="rounded-full bg-orange-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs">VENCIDO</h1>;
	return <h1 className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs">ATIVO</h1>;
}
type KitCardProps = {
	kit: TKitDTO;
	handleClick: (info: TKitDTO) => void;
	userHasEditPermission: boolean;
	userHasPricingViewPermission: boolean;
};
function Kit({ kit, handleClick, userHasEditPermission, userHasPricingViewPermission }: KitCardProps) {
	return (
		<div className="flex w-full flex-col rounded-md border border-primary/50 bg-background p-4 gap-2 sm:flex-row">
			<div className="flex items-center justify-center">
				<div className="relative h-36 max-h-36 min-h-36 w-36 max-w-36 min-w-36 overflow-hidden rounded-lg">
					{kit.imagemCapaUrl ? (
						<Image src={kit.imagemCapaUrl} alt="Imagem de capa do kit" fill={true} objectFit="cover" />
					) : (
						<div className="bg-primary/50 text-primary-foreground flex h-full w-full items-center justify-center">
							<FaTag className="h-6 w-6" />
						</div>
					)}
				</div>
			</div>
			<div className="flex h-full grow flex-col gap-2">
				<div className="flex w-full flex-col-reverse lg:flex-row items-center justify-between gap-2">
					<div className="flex items-start gap-2 flex-wrap">
						<h1 className="text-sm font-bold leading-none tracking-tight">{kit.nome}</h1>
						{userHasPricingViewPermission ? (
							<div className="flex items-center gap-1">
								<BadgeDollarSign className="w-4 h-4 min-w-4 min-h-4" />
								<p className="text-[0.7rem] font-medium text-primary/80">{formatToMoney(kit.preco)}</p>
							</div>
						) : null}

						<div className="flex items-center gap-1">
							<Zap className="w-4 h-4 min-w-4 min-h-4" />
							<p className="text-[0.7rem] font-medium text-primary/80">{kit.potenciaPico} kW</p>
						</div>
						<div className="flex items-center gap-1">
							<TbTopologyFull className="w-4 h-4 min-w-4 min-h-4" />
							<p className="text-[0.7rem] font-medium text-primary/80">{kit.topologia}</p>
						</div>
					</div>
					{getStatusTag({ active: kit.ativo, expiryDate: kit.dataValidade })}
				</div>

				<div className="flex w-full grow flex-col gap-1">
					<div className="w-full flex flex-col">
						<h1 className="text-xs tracking-tight">PRODUTOS</h1>
						<div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
							{kit.produtos.map((product, index) => (
								<div key={index} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10">
									<div className="flex items-start gap-2">
										<h1 className="text-xs font-bold tracking-tight uppercase">{`${product.qtde} x ${product.modelo}`}</h1>
										<div className="hidden md:flex items-center gap-1">
											<FaIndustry className="w-4 h-4 min-w-4 min-h-4" />
											<p className="text-[0.7rem] font-medium text-primary/80">{product.fabricante}</p>
										</div>
										<div className="hidden md:flex items-center gap-1">
											<Zap className="w-4 h-4 min-w-4 min-h-4" />
											<p className="text-[0.7rem] font-medium text-primary/80">{product.potencia} W</p>
										</div>
										<div className="hidden md:flex items-center gap-1">
											<ShieldCheck className="w-4 h-4 min-w-4 min-h-4" />
											<p className="text-[0.7rem] font-medium text-primary/80">
												{product.garantia} {product.garantia > 1 ? "ANOS" : "ANO"}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="w-full flex flex-col">
						<h1 className="text-xs tracking-tight">SERVIÇOS</h1>
						<div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
							{kit.servicos.map((service, index) => (
								<div key={index} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10">
									<div className="flex items-start gap-2">
										<h1 className="text-xs font-bold tracking-tight uppercase">{service.descricao}</h1>

										<div className="hidden md:flex items-center gap-1">
											<ShieldCheck className="w-4 h-4 min-w-4 min-h-4" />
											<p className="text-[0.7rem] font-medium text-primary/80">
												{service.garantia} {service.garantia > 1 ? "ANOS" : "ANO"}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="w-full flex items-center gap-2 flex-col md:flex-row justify-center md:justify-end">
					{kit.dataValidade ? (
						<div className={`flex items-center gap-2 text-primary/70`}>
							<BsCalendarEvent />
							<p className="text-[0.65rem] font-medium text-primary/70">
								Valido até: <strong className="text-orange-500">{formatDateAsLocale(kit.dataValidade)}</strong>{" "}
							</p>
						</div>
					) : null}
					<div className={`flex items-center gap-1`}>
						<BsCalendarPlus className="w-4 h-4 min-w-4 min-h-4" />
						<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(kit.dataInsercao, true)}</p>
					</div>
					<div className="flex items-center gap-1">
						<Avatar className="w-5 h-5 min-w-5 min-h-5">
							<AvatarImage src={kit.autor.avatar_url || undefined} alt={kit.autor.nome} />
							<AvatarFallback className="text-xs">{formatNameAsInitials(kit.autor.nome)}</AvatarFallback>
						</Avatar>
						<p className="text-[0.65rem] font-medium text-primary/70">{kit.autor.nome}</p>
					</div>
					{userHasEditPermission ? (
						<Button onClick={() => handleClick(kit)} variant="ghost" size="fit" className="flex items-center gap-1 px-2 py-1 text-xs">
							<Pencil className="w-4 h-4 min-w-4 min-h-4" />
							EDITAR
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default Kit;
