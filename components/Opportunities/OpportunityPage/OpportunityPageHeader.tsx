import { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { deleteOpportunity } from "@/utils/mutations/opportunities";
import { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import { useMutation } from "@tanstack/react-query";
import { Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { BsCalendarPlus, BsCalendarX, BsCode, BsFillMegaphoneFill } from "react-icons/bs";
import OpportunityContractRequestedFlag from "./OpportunityContractRequestedFlag";
import OpportunityWonFlag from "./OpportunityWonFlag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OpportunityLossBlock from "./OpportunityLossBlock";

type OpportunityPageHeaderProps = {
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	session: TUserSession;
	handleOnMutate: () => void;
	handleOnSettled: () => void;
};

export default function OpportunityPageHeader({ opportunity, session, handleOnMutate, handleOnSettled }: OpportunityPageHeaderProps) {
	const { mutate: mutateDeleteOpportunity, isPending } = useMutation({
		mutationKey: ["delete-opportunity", opportunity._id],
		mutationFn: deleteOpportunity,
		onMutate: async () => {
			await handleOnMutate();
			return;
		},
		onSuccess: async (data) => {
			await handleOnSettled();
			return toast.success(data);
		},
		onSettled: async () => {
			await handleOnSettled();
			return;
		},
		onError: async (error) => {
			toast.error(getErrorMessage(error));
			return;
		},
	});
	return (
		<div className="flex w-full flex-col gap-2 border-b border-primary/80 pb-2">
			<div className="flex w-full flex-col justify-center gap-2 lg:flex-row lg:justify-between">
				<div className="flex flex-col items-center gap-2 lg:flex-row">
					<div className="flex items-center gap-1 rounded-sm bg-[#15599a] px-2 py-1 text-primary-foreground">
						<BsCode className="w-4 h-4 min-w-4 min-h4" />
						<h1 className="text-sm font-black">{opportunity.identificador}</h1>
					</div>
					<h1 className="flex text-center font-Raleway text-2xl font-bold leading-none tracking-tight text-primary lg:text-start">{opportunity.nome}</h1>
					{session.user.permissoes.oportunidades.excluir ? (
						opportunity.dataExclusao ? null : (
							<button
								type="button"
								disabled={isPending}
								className="p-2 rounded-full flex items-center justify-center bg-red-500 text-primary-foreground"
								onClick={() =>
									mutateDeleteOpportunity({
										id: opportunity._id,
									})
								}
							>
								<Trash2 className="w-4 h-4 min-w-4 min-h4" />
							</button>
						)
					) : null}
					{opportunity.dataExclusao ? (
						<div className={"flex items-center gap-2"}>
							<p className="text-[0.65rem] font-medium text-primary/70">EXCLUÍDA EM:</p>
							<BsCalendarX className="w-4 h-4 min-w-4 min-h4 text-red-500" />
							<p className="text-[0.65rem] font-medium text-red-500">{formatDateAsLocale(opportunity.dataExclusao, true)}</p>
						</div>
					) : null}
					{opportunity.idMarketing ? (
						<div className="flex items-center gap-1 rounded-sm border border-[#3e53b2] p-1 text-[#3e53b2]">
							<BsFillMegaphoneFill className="w-4 h-4 min-w-4 min-h4 text-[#3e53b2]" />
							<p className="text-sm font-bold italic leading-none tracking-tight">VINDO DE MARKETING</p>
						</div>
					) : null}
					{opportunity.idIndicacao ? (
						<div className="flex items-center gap-1 rounded-sm border border-cyan-500 p-1 text-cyan-500">
							<Share2 className="w-4 h-4 min-w-4 min-h4 text-cyan-500" />
							<p className="text-sm font-bold italic leading-none tracking-tight">VINDO DE INDICAÇÃO</p>
						</div>
					) : null}
				</div>
				<OpportunityContractRequestedFlag requestDate={opportunity.ganho.dataSolicitacao} />
				<OpportunityWonFlag wonDate={opportunity.ganho.data} />
			</div>

			{opportunity.descricao ? (
				<div className="flex w-full flex-col gap-1 rounded-lg bg-primary/10 p-2">
					<h1 className="block text-[0.6rem] font-medium tracking-tight lg:hidden">ANOTAÇÕES</h1>
					<p className="text-center text-xs italic text-primary/70 lg:text-start whitespace-pre-wrap">{opportunity.descricao}</p>
				</div>
			) : null}
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex w-full flex-wrap items-center justify-start gap-2 lg:grow">
					<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80 ">RESPONSÁVEIS</h1>
					{opportunity.responsaveis.map((resp) => (
						<div key={resp.id} className="flex items-center gap-1">
							<Avatar className="h-5 w-5 min-w-5 min-h-5">
								<AvatarImage src={resp.avatar_url || undefined} alt={resp.nome} />
								<AvatarFallback className="text-xs">{formatNameAsInitials(resp.nome)}</AvatarFallback>
							</Avatar>
							<p className="text-xs font-medium leading-none tracking-tight text-primary/70">{resp.nome}</p>{" "}
							<p className="ml-1 rounded-md border border-cyan-400 p-1 text-xxs font-bold text-cyan-400">{resp.papel}</p>
						</div>
					))}
				</div>
				<div className="flex w-full flex-col items-center justify-center gap-2 lg:min-w-fit lg:flex-row lg:justify-end">
					<div className={"flex items-center gap-2"}>
						<p className="text-[0.65rem] font-medium text-primary/70">CRIADA EM:</p>
						<BsCalendarPlus className="w-4 h-4 min-w-4 min-h4 text-primary/70" />
						<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(opportunity.dataInsercao, true)}</p>
					</div>
					{opportunity.ganho.data ? null : (
						<OpportunityLossBlock
							opportunityId={opportunity._id}
							opportunityLossDate={opportunity.perda.data || undefined}
							callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettled }}
						/>
					)}
				</div>
			</div>
			{opportunity.perda.descricaoMotivo ? (
				<div className="w-fit self-center flex flex-col items-center justify-center border-[#F31559] bg-[#F31559]/20 p-2 rounded-lg gap-1">
					<h3 className="text-[0.65rem] leading-none tracking-tight">MOTIVO DA PERDA</h3>
					<h1 className="w-full text-center font-bold text-[#F31559] text-xs tracking-tight leading-none">{opportunity.perda.descricaoMotivo}</h1>
				</div>
			) : null}
		</div>
	);
}
