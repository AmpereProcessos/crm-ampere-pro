import { formatDecimalPlaces } from "@/lib/methods/formatting";
import { formatToMoney } from "@/utils/methods";
import { useOverallSalesResults } from "@/utils/queries/stats/overall";
import { AiOutlineCloseCircle } from "react-icons/ai";
import {
	BsFileEarmarkText,
	BsPatchCheck,
	BsTicketPerforated,
} from "react-icons/bs";
import { FaPercent } from "react-icons/fa6";
import { VscDiffAdded } from "react-icons/vsc";
import AcquisitionChannels from "../general/AcquisitionChannels";
import CreditorsResults from "../general/Creditors";
import LossesByReason from "../general/LossesByReason";

type OverallResultsProps = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};
function OverallResults({
	after,
	before,
	responsibles,
	partners,
	projectTypes,
}: OverallResultsProps) {
	const { data: stats } = useOverallSalesResults({
		after,
		before,
		responsibles,
		partners,
		projectTypes,
	});

	return (
		<div className="flex w-full flex-col">
			<h1 className="mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white">
				GERAL
			</h1>
			<div className="mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
				<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:w-1/6">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Projetos Criados
						</h1>
						<VscDiffAdded />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{stats?.projetosCriados?.total || 0}
						</div>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosCriados.inbound || 0} INBOUND
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosCriados.outboundVendedor} OUTBOUND (VENDEDOR)
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosCriados.outboundSdr} OUTBOUND (SDR)
						</p>
					</div>
				</div>
				<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:w-1/6">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Projetos Ganhos
						</h1>
						<BsPatchCheck />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{stats?.projetosGanhos?.total || 0}
						</div>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosGanhos.inbound} INBOUND
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosGanhos.outboundVendedor} OUTBOUND (VENDEDOR)
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosGanhos.outboundSdr} OUTBOUND (SDR)
						</p>
					</div>
				</div>
				<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:w-1/6">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Projetos Perdidos
						</h1>
						<AiOutlineCloseCircle size={"20px"} />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{stats?.projetosPerdidos?.total || 0}
						</div>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosPerdidos.inbound} INBOUND
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosPerdidos.outboundVendedor} OUTBOUND (VENDEDOR)
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.projetosPerdidos.outboundSdr} OUTBOUND (SDR)
						</p>
					</div>
				</div>
				<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:w-1/6">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Total Vendido
						</h1>
						<BsFileEarmarkText />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{stats?.totalVendido
								? formatToMoney(stats?.totalVendido.total)
								: 0}
						</div>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.totalVendido.inbound
								? formatToMoney(stats?.totalVendido.inbound)
								: 0}{" "}
							INBOUND
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.totalVendido.outboundVendedor
								? formatToMoney(stats?.totalVendido.outboundVendedor)
								: 0}{" "}
							OUTBOUND (VENDEDOR)
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.totalVendido.outboundSdr
								? formatToMoney(stats?.totalVendido.outboundSdr)
								: 0}{" "}
							OUTBOUND (SDR)
						</p>
					</div>
				</div>
				<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:w-1/6">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Ticket Médio
						</h1>
						<BsTicketPerforated />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{stats?.totalVendido
								? formatToMoney(
										stats?.totalVendido.total / stats?.projetosGanhos.total,
									)
								: 0}
						</div>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.totalVendido.inbound
								? formatToMoney(
										stats?.totalVendido.inbound / stats?.projetosGanhos.inbound,
									)
								: 0}{" "}
							INBOUND
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.totalVendido.outboundVendedor
								? formatToMoney(
										stats?.totalVendido.outboundVendedor /
											stats?.projetosGanhos.outboundVendedor,
									)
								: 0}{" "}
							OUTBOUND (VENDEDOR)
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.totalVendido.outboundSdr
								? formatToMoney(
										stats?.totalVendido.outboundSdr /
											stats?.projetosGanhos.outboundSdr,
									)
								: 0}{" "}
							OUTBOUND (SDR)
						</p>
					</div>
				</div>
				<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:w-1/6">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Conversão
						</h1>
						<FaPercent />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{stats?.conversao.ganho.total
								? formatDecimalPlaces(
										(stats?.conversao.ganho.total * 100) /
											stats?.conversao.criado.total,
									)
								: 0}
							%
						</div>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.conversao.ganho.inbound
								? formatDecimalPlaces(
										(stats?.conversao.ganho.inbound * 100) /
											stats?.conversao.criado.inbound,
									)
								: 0}
							% INBOUND
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.conversao.ganho.outboundVendedor
								? formatDecimalPlaces(
										(stats?.conversao.ganho.outboundVendedor * 100) /
											stats?.conversao.criado.outboundVendedor,
									)
								: 0}
							% OUTBOUND (VENDEDOR)
						</p>
						<p className="text-[0.65rem] font-medium text-primary/80">
							{stats?.conversao.ganho.outboundSdr
								? formatDecimalPlaces(
										(stats?.conversao.ganho.outboundSdr * 100) /
											stats?.conversao.criado.outboundSdr,
									)
								: 0}
							% OUTBOUND (SDR)
						</p>
					</div>
				</div>
			</div>
			<CreditorsResults
				after={after}
				before={before}
				responsibles={responsibles}
				partners={partners}
				projectTypes={projectTypes}
			/>
			<LossesByReason stats={stats} />
			<AcquisitionChannels stats={stats?.porCanalAquisicao || {}} />
		</div>
	);
}

export default OverallResults;
