import { getInverterPeakPowerByProducts, getModulesPeakPotByProducts } from "@/lib/methods/extracting";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { THomologationDTO } from "@/utils/schemas/homologation.schema";
import { TProductItem } from "@/utils/schemas/kits.schema";
import { BsCalendarCheck, BsCalendarPlus, BsCode } from "react-icons/bs";
import { FaSolarPanel } from "react-icons/fa";
import { ImPower } from "react-icons/im";
import Avatar from "../utils/Avatar";

function getStatusTag(status: string) {
	if (status == "PENDENTE")
		return <h1 className={`rounded-full bg-primary/80 px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
	if (status == "ELABORANDO DOCUMENTAÇÕES")
		return <h1 className={`rounded-full bg-blue-500 px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
	if (["AGUARDANDO ASSINATURA", "AGUARDANDO FATURAMENTO", "AGUARDANDO PENDÊNCIAS"].includes(status))
		return <h1 className={`rounded-full bg-orange-500 px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
	if (status == "REPROVADO COM REDUÇÃO")
		return <h1 className={`rounded-full bg-orange-700 px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
	if (["APROVADO COM OBRAS", "APROVADO COM REDUÇÃO"].includes(status))
		return <h1 className={`rounded-full bg-green-700 px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
	if (status == "APROVADO")
		return <h1 className={`rounded-full bg-green-500 px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
	return <h1 className={`rounded-full bg-primary/80 px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
}

type HomologationCardProps = {
	homologation: THomologationDTO;
	handleClick: (id: string) => void;
	userHasEditPermission: boolean;
};
function HomologationCard({ homologation, handleClick, userHasEditPermission }: HomologationCardProps) {
	return (
		<div className="flex w-full flex-col items-center rounded-md border border-primary/50 bg-background p-4 lg:w-[450px]">
			<div className="flex w-full items-start justify-between">
				<div className="flex grow flex-col">
					{userHasEditPermission ? (
						<h1
							onClick={() => handleClick(homologation._id)}
							className="cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
						>
							{homologation.titular.nome}
						</h1>
					) : (
						<h1 className="text-sm font-black leading-none tracking-tight">{homologation.titular.nome}</h1>
					)}

					<div className="flex items-center gap-1">
						<BsCode />
						<p className="text-xs font-medium tracking-tight text-primary/70">INSTALAÇÃO Nº {homologation.instalacao.numeroInstalacao}</p>
					</div>
				</div>
				{getStatusTag(homologation.status)}
			</div>
			<div className="mt-2 flex w-full items-center justify-start gap-2">
				<div className="flex items-center gap-1">
					<FaSolarPanel />
					<p className="text-xs font-medium tracking-tight text-primary/70">
						{getModulesPeakPotByProducts(homologation.equipamentos as TProductItem[])} kWp EM MÓDULOS
					</p>
				</div>
				<div className="flex items-center gap-1">
					<ImPower />
					<p className="text-xs font-medium tracking-tight text-primary/70">
						{getInverterPeakPowerByProducts(homologation.equipamentos as TProductItem[])} kWp EM INVERSORES
					</p>
				</div>
			</div>
			<div className="mt-2 flex w-full items-center justify-start gap-2">
				<Avatar
					url={homologation.requerente.avatar_url || undefined}
					fallback={formatNameAsInitials(homologation.requerente.nome || "U")}
					width={20}
					height={20}
				/>
				<p className="text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs">
					REQUERIDO POR <strong className="text-cyan-500">{homologation.requerente.nome?.toUpperCase() || "NÃO DEFINIDO"}</strong>
				</p>
			</div>
			<div className="flex w-full items-center justify-between gap-2">
				{homologation.dataEfetivacao ? (
					<div className="flex items-center gap-1">
						<BsCalendarCheck />
						<p className="text-xs font-medium tracking-tight">{formatDateAsLocale(homologation.dataEfetivacao, true)}</p>
					</div>
				) : (
					<div></div>
				)}
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<BsCalendarPlus />
						<p className="text-xs font-medium tracking-tight">{formatDateAsLocale(homologation.dataInsercao, true)}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default HomologationCard;
