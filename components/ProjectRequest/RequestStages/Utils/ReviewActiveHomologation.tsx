import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import { useHomologationById } from "@/utils/queries/homologations";
import ActiveHomologation from "./ActiveHomologation";

function getTagColor(status: string) {
	if (status == "PENDENTE") return "bg-primary/80";
	if (status == "ELABORANDO DOCUMENTAÇÕES") return "bg-blue-500";
	if (["AGUARDANDO ASSINATURA", "AGUARDANDO FATURAMENTO", "AGUARDANDO PENDÊNCIAS"].includes(status)) return "bg-orange-500";
	if (status == "REPROVADO COM REDUÇÃO") return "bg-orange-700";
	if (["APROVADO COM OBRAS", "APROVADO COM REDUÇÃO"].includes(status)) return "bg-green-700";
	if (status == "APROVADO") return "bg-green-500";
	return "bg-primary/80";
}
function getStatusTag(status: string) {
	if (status == "PENDENTE")
		return <h1 className={`w-fit self-center rounded-sm border border-primary/50 p-1 text-center text-[0.6rem] font-black text-primary/70`}>{status}</h1>;
	if (status == "ELABORANDO DOCUMENTAÇÕES")
		return <h1 className={`w-fit self-center rounded-sm border border-blue-500 p-1 text-center text-[0.6rem] font-black text-blue-500`}>{status}</h1>;
	if (["AGUARDANDO ASSINATURA", "AGUARDANDO FATURAMENTO", "AGUARDANDO PENDÊNCIAS"].includes(status))
		return <h1 className={`w-fit self-center rounded-sm border border-orange-500 p-1 text-center text-[0.6rem] font-black text-orange-500`}>{status}</h1>;
	if (status == "REPROVADO COM REDUÇÃO")
		return <h1 className={`w-fit self-center rounded-sm border border-orange-700 p-1 text-center text-[0.6rem] font-black text-orange-700`}>{status}</h1>;
	if (["APROVADO COM OBRAS", "APROVADO COM REDUÇÃO"].includes(status))
		return <h1 className={`w-fit self-center rounded-sm border border-green-700 p-1 text-center text-[0.6rem] font-black text-green-700`}>{status}</h1>;
	if (status == "APROVADO")
		return <h1 className={`w-fit self-center rounded-sm border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500`}>{status}</h1>;
	return <h1 className={`w-fit self-center rounded-sm border border-primary/50 p-1 text-center text-[0.6rem] font-black text-primary/70`}>{status}</h1>;
}
type ReviewActiveHomologationProps = {
	homologationId: string;
};
function ReviewActiveHomologation({ homologationId }: ReviewActiveHomologationProps) {
	const { data: homologation, isLoading, isError, isSuccess } = useHomologationById({ id: homologationId });
	return (
		<div className="flex w-full flex-col gap-2">
			<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">INFORMAÇÕES DA HOMOLOGAÇÃO</h1>
			<div className="flex w-full flex-col gap-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar informações da homologação escolhida." /> : null}
				{isSuccess ? (
					<div className="mb-6 flex w-full flex-col items-center justify-center rounded-sm border border-green-500">
						<h1 className="w-full rounded-md rounded-tl rounded-tr bg-green-500 p-1 text-center text-sm font-bold text-primary-foreground">
							HOMOLOGAÇÃO ATIVA
						</h1>
						<div className="flex w-full items-center justify-center p-2">
							<ActiveHomologation homologation={homologation} />
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default ReviewActiveHomologation;
