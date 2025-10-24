import type { TGetStatsRouteOutput } from "@/app/api/stats/route";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { formatLongString, formatToMoney } from "@/utils/methods";
import Link from "next/link";
import { BsCalendarPlus, BsFillMegaphoneFill } from "react-icons/bs";
import { FaSignature } from "react-icons/fa";
import Avatar from "../../utils/Avatar";

type PendingWinsBlockProps = {
	data: TGetStatsRouteOutput["data"]["ganhosPendentes"];
	session: TUserSession;
};

function PendingWinsBlock({ data, session }: PendingWinsBlockProps) {
	function getIdleMoney(list: TGetStatsRouteOutput["data"]["ganhosPendentes"]) {
		if (!list) return 0;
		const total = list.reduce((acc, current) => {
			const proposalValue = current.proposta?.valor || 0;
			return acc + proposalValue;
		}, 0);
		return total;
	}
	return (
		<div className="bg-card border-primary/20 flex h-[450px] w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs">
			<div className="flex min-h-[42px] w-full flex-col">
				<div className="flex items-center justify-between">
					<h1 className="text-xs font-medium tracking-tight uppercase">Contratos para Assinar</h1>
					<div className="flex items-center gap-2">
						<FaSignature className="h-4 w-4" />
					</div>
				</div>
				<div className="flex items-center justify-between">
					<p className="text-sm text-primary/70">{data ? data.length : 0} assinaturas para coletar</p>
					<p className="text-sm text-primary/70">{formatToMoney(getIdleMoney(data))}</p>
				</div>
			</div>
			<div className="flex w-full grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{data ? (
					data?.length > 0 ? (
						data?.map((opportunity, index: number) => (
							<div
								key={`${opportunity._id}`}
								className="flex w-full flex-col items-center justify-between border-b  border-primary/30 p-2 md:flex-row md:border-b-0"
							>
								<div className="flex w-full items-start gap-4 md:grow">
									<div className="flex grow flex-col items-start gap-2">
										<div className="flex items-start lg:items-center gap-2 flex-col lg:flex-row">
											<Link href={`/comercial/oportunidades/id/${opportunity._id}`}>
												<h1 className="w-full text-start text-sm font-medium leading-none tracking-tight hover:text-cyan-500">
													{formatLongString(opportunity?.nome.toUpperCase() || "", 30)}
												</h1>
											</Link>
										</div>
										<div className="flex w-full items-center justify-start gap-2">
											{opportunity.idMarketing ? (
												<div className="flex items-center justify-center rounded-full border border-[#3e53b2] p-1 text-[#3e53b2]">
													<BsFillMegaphoneFill size={10} />
												</div>
											) : null}
											{opportunity.responsaveis.map((resp) => (
												<div key={resp.id} className="flex items-center gap-2">
													<Avatar fallback={"R"} url={resp?.avatar_url || undefined} height={20} width={20} />

													<p className="text-xs text-primary/70">{resp?.nome}</p>
												</div>
											))}
										</div>
									</div>
								</div>
								<div className="flex min-w-[120px] items-center lg:items-end justify-center gap-1 lg:justify-end flex-col">
									<p className="font-medium">{opportunity?.proposta?.valor ? formatToMoney(opportunity.proposta?.valor) : "N/A"}</p>
									<div className="flex items-center gap-1">
										<BsCalendarPlus className="w-4 h-4 min-w-4 min-h-4" />
										<p className="text-xs text-primary/70">{formatDateAsLocale(opportunity?.dataSolicitacao || "", true)}</p>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="flex grow items-center justify-center">
							<p className="text-center text-sm italic text-primary/70">Sem assinaturas pendentes...</p>
						</div>
					)
				) : null}
			</div>
		</div>
	);
}

export default PendingWinsBlock;
