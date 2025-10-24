import Avatar from "@/components/utils/Avatar";
import { formatDateAsLocale, formatLocation, formatNameAsInitials } from "@/lib/methods/formatting";
import { TServiceOrderDTO } from "@/utils/schemas/service-order.schema";
import { BsCalendarCheck, BsCalendarPlus } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { TbUrgent } from "react-icons/tb";

function getStatusTag(effectivationDate: string | null) {
	if (!effectivationDate)
		return <h1 className="rounded-md bg-primary/50 px-2 py-0.5 text-xxs font-medium text-primary-foreground lg:text-[0.6rem]">PENDENTE</h1>;

	return <h1 className="rounded-md bg-green-500 px-2 py-0.5 text-xxs font-medium text-primary-foreground lg:text-[0.6rem]">CONCLUÍDA</h1>;
}
function getUrgencyTag(urgency: TServiceOrderDTO["urgencia"]) {
	if (urgency == "EMERGÊNCIA")
		return (
			<div className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-0.5 text-primary-foreground">
				<TbUrgent size={16} />
				<p className="text-[0.6rem] font-medium leading-none tracking-tight">{urgency}</p>
			</div>
		);
	if (urgency == "URGENTE")
		return (
			<div className="flex items-center gap-1 rounded-lg bg-orange-600 px-2 py-0.5 text-primary-foreground">
				<TbUrgent size={16} />
				<p className="text-[0.6rem] font-medium leading-none tracking-tight">{urgency}</p>
			</div>
		);
	if (urgency == "POUCO URGENTE")
		return (
			<div className="flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-0.5 text-primary-foreground">
				<TbUrgent size={16} />
				<p className="text-[0.6rem] font-medium leading-none tracking-tight">{urgency}</p>
			</div>
		);
	if (!urgency)
		return (
			<div className="flex items-center gap-1 rounded-lg bg-primary/60 px-2 py-0.5 text-primary-foreground">
				<TbUrgent size={16} />
				<p className="text-[0.6rem] font-medium leading-none tracking-tight">URGÊNCIA INDEFINIDA</p>
			</div>
		);
}
type ServiceOrderProps = {
	serviceOrder: TServiceOrderDTO;
	handleClick: (id: string) => void;
};
function ServiceOrder({ serviceOrder, handleClick }: ServiceOrderProps) {
	return (
		<div className="flex w-full flex-col gap-2 rounded-md border border-primary/50 bg-background p-2">
			<div className="flex w-full flex-col-reverse items-center justify-between gap-2 lg:flex-row">
				<div className="flex w-full flex-wrap items-center justify-start gap-1 lg:w-fit">
					{getStatusTag(serviceOrder.dataEfetivacao || null)}
					{true ? (
						<h1
							onClick={() => handleClick(serviceOrder._id)}
							className="cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
						>
							{serviceOrder.favorecido.nome}
						</h1>
					) : (
						<h1 className="text-sm font-black leading-none tracking-tight">{serviceOrder.favorecido.nome}</h1>
					)}
					{getUrgencyTag(serviceOrder.urgencia)}
				</div>
				<h1 className="rounded-lg bg-black px-2 py-0.5 text-center text-[0.65rem] font-bold text-primary-foreground lg:py-1">{serviceOrder.categoria}</h1>
			</div>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex grow flex-col items-center gap-2 lg:flex-row">
					<div className="flex flex-wrap items-center gap-1">
						<FaLocationDot size={12} />
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">LOCALIZAÇÃO:</p>
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">
							{formatLocation({ location: serviceOrder.localizacao, includeCity: true, includeUf: true })}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-1">
						<FaUser size={12} />
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">RESPONSÁVEIS:</p>
						{serviceOrder.responsaveis.map((responsible, index) => (
							<div key={index} className="flex items-center gap-2 rounded-sm border border-primary/50 bg-[#f8f8f8] px-2 py-0.5 shadow-md">
								<Avatar fallback={formatNameAsInitials(responsible.nome)} url={responsible.avatar_url || undefined} height={15} width={15} />
								<p className="text-[0.6rem] font-medium leading-none tracking-tight">{responsible.nome}</p>
							</div>
						))}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{serviceOrder.dataEfetivacao ? (
						<div className={`flex items-center gap-1`}>
							<BsCalendarCheck color="rgb(34,197,94)" />
							<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(serviceOrder.dataEfetivacao, true)}</p>
						</div>
					) : null}
					<div className={`flex items-center gap-1`}>
						<BsCalendarPlus />
						<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(serviceOrder.dataInsercao, true)}</p>
					</div>
					<div className="flex items-center gap-1">
						<Avatar fallback={"R"} url={serviceOrder.autor.avatar_url || undefined} height={20} width={20} />
						<p className="text-[0.65rem] font-medium text-primary/70">{serviceOrder.autor.nome}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ServiceOrder;
