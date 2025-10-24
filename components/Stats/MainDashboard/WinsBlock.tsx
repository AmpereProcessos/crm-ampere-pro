import type { TGetStatsRouteOutput } from "@/app/api/stats/route";
import Avatar from "@/components/utils/Avatar";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale, formatToMoney } from "@/lib/methods/formatting";
import { formatLongString } from "@/utils/methods";
import Link from "next/link";
import { BsCalendarCheck, BsCode, BsFillMegaphoneFill } from "react-icons/bs";
import { MdOutlineAttachMoney, MdSell } from "react-icons/md";

type WinsBlockProps = {
	data: TGetStatsRouteOutput["data"]["ganhos"];
	session: TUserSession;
};
function WinsBlock({ data, session }: WinsBlockProps) {
	return (
		<div className="bg-card border-primary/20 flex h-[650px] lg:h-[450px] w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs">
			<div className="flex min-h-[42px] w-full flex-col">
				<div className="flex items-center justify-between">
					<h1 className="text-xs font-medium tracking-tight uppercase">Projetos ganhos</h1>
					<div className="flex items-center gap-2">
						<MdSell className="h-4 w-4" />
					</div>
				</div>
				<div className="flex items-center justify-between">
					<p className="text-sm text-primary/70">{data ? data.length : 0} projetos ganhos</p>
				</div>
			</div>
			<div className="flex grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{data.length > 0 ? (
					data.map((win, index: number) => (
						<div key={`${win._id}`} className="flex w-full flex-col items-center justify-between border-b  border-primary/30 p-2 md:flex-row md:border-b-0">
							<div className="flex w-full items-start gap-4 md:grow">
								<div className="flex h-[30px] min-h-[30px] w-[30px] min-w-[30px] items-center justify-center rounded-full border border-black">
									<MdOutlineAttachMoney />
								</div>
								<div className="flex grow flex-col items-start">
									<Link href={`/comercial/proposta/${win.idPropostaAtiva}`}>
										<h1 className="w-full text-start text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500">
											{formatLongString(win?.proposta?.nome.toUpperCase() || "", 30)}
										</h1>
									</Link>

									<div className="mt-1 flex w-full items-center justify-start gap-2">
										<Link href={`/comercial/oportunidades/id/${win._id}`} className="text-primary/70 duration-300 ease-in-out hover:text-cyan-500">
											<div className="flex items-center gap-1">
												<BsCode />
												<p className="text-xs">#{win.nome}</p>
											</div>
										</Link>
										{win.idMarketing ? (
											<div className="flex items-center justify-center rounded-full border border-[#3e53b2] p-1 text-[#3e53b2]">
												<BsFillMegaphoneFill size={10} />
											</div>
										) : null}
										{win.responsaveis.map((resp) => (
											<div key={resp.id} className="flex items-center gap-2">
												<Avatar fallback={"R"} url={resp?.avatar_url || undefined} height={20} width={20} />
												<p className="text-xs text-primary/70">{resp.nome}</p>
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="flex min-w-fit items-center lg:items-end justify-center lg:justify-end flex-col gap-1">
								<p className="font-medium">{win.proposta?.valor ? formatToMoney(win.proposta.valor) : "N/A"}</p>
								<div className="flex items-center gap-1 text-green-800 dark:text-green-500">
									<BsCalendarCheck className="w-4 h-4 min-w-4 min-h-4" />
									<p className="text-xs">{formatDateAsLocale(win.dataGanho || "")}</p>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="flex grow items-center justify-center">
						<p className="text-center text-sm italic text-primary/70">Sem projetos ganhos no período.</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default WinsBlock;
