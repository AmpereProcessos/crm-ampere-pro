import PPSCall from "@/components/Cards/PPSCall";
import type { TUserSession } from "@/lib/auth/session";
import { usePPSCalls } from "@/utils/queries/pps-calls";
import { GiBugleCall } from "react-icons/gi";

type PPSOpenCallsBlockProps = {
	session: TUserSession;
};
function PPSOpenCallsBlock({ session }: PPSOpenCallsBlockProps) {
	const scope = session.user.permissoes.oportunidades.escopo;
	const { data: calls } = usePPSCalls({ applicantId: scope ? session.user.id : null, openOnly: true });

	return (
		<div className="bg-card border-primary/20 flex h-[650px] lg:h-[450px] w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs">
			<div className="flex min-h-[42px] w-full flex-col">
				<div className="flex items-center justify-between">
					<h1 className="text-xs font-medium tracking-tight uppercase">Chamados</h1>
					<div className="flex items-center gap-2">
						<GiBugleCall className="h-4 w-4" />
					</div>
				</div>
				<div className="flex items-center justify-between">
					<p className="text-sm text-primary/70">{calls?.length || 0} em aberto</p>
				</div>
			</div>
			<div className="flex grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{calls?.map((call, index: number) => (
					<PPSCall key={call._id} call={call} />
				))}
			</div>
		</div>
	);
}

export default PPSOpenCallsBlock;
