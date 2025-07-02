"use client";
import type { TBulkUpdateComissionsRouteInput, TGetComissionsRouteOutput } from "@/app/api/opportunities/comissions/route";
import { Sidebar } from "@/components/Sidebar";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { useOwnComissions } from "@/utils/queries/opportunities";
import Link from "next/link";
import { BsFunnel } from "react-icons/bs";
import { FaDiamond } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BadgeDollarSign, Percent, Calendar, BadgeCheck, Users } from "lucide-react";
import { formatDateAsLocale, formatDecimalPlaces, formatToMoney } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import { LoadingButton } from "@/components/Buttons/loading-button";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { BulkUpdateComissionsInputSchema } from "@/app/api/opportunities/comissions/input";
import { bulkUpdateComissions } from "@/utils/mutations/opportunities";
import { VscDiffAdded } from "react-icons/vsc";
import DateIntervalInput from "@/components/ui/DateIntervalInput";
import { useState } from "react";

type ComissionsPageProps = {
	session: TUserSession;
};
function ComissionsPage({ session }: ComissionsPageProps) {
	const queryClient = useQueryClient();
	const { data: comissions, isLoading, isError, isSuccess, queryParams, updateQueryParams } = useOwnComissions();

	function handleBulkUpdateComission(comissions: TGetComissionsRouteOutput["data"]) {
		const bulkUpdates: TBulkUpdateComissionsRouteInput = comissions.map((c) => {
			return {
				projectId: c.appId,
			};
		});
		return handleBulkUpdateComissionMutation({
			comissions: bulkUpdates,
		});
	}
	const [period, setPeriod] = useState<{ after?: Date; before?: Date }>({});
	function getStats(info: TGetComissionsRouteOutput["data"]) {
		return {
			totalComissionableProjects: info.length,
			totalComissionValue: info.reduce((acc, c) => acc + c.comissao.valorComissionavel * (c.comissao.comissaoPorcentagem / 100), 0),
			totalComissionsValidated: info.filter((c) => c.comissao.dataValidacao).length,
			totalComissionsNotValidated: info.filter((c) => !c.comissao.dataValidacao).length,
		};
	}
	const { mutate: handleBulkUpdateComissionMutation, isPending: isBulkUpdateComissionPending } = useMutationWithFeedback({
		mutationKey: ["bulk-update-comissions"],
		mutationFn: bulkUpdateComissions,
		queryClient,
		affectedQueryKey: ["own-comissions", queryParams],
	});
	const stats = getStats(comissions || []);
	const areExistingOpportunitiesMissingValidation = comissions?.some((c) => !c.comissao.dataValidacao);
	console.log(queryParams);
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
						<div className="flex flex-col items-center gap-1 lg:flex-row">
							<div className="flex flex-col items-center gap-1">
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">COMISSÕES</h1>
							</div>
						</div>
						<DateIntervalInput
							label="Período"
							labelClassName="text-xs font-medium leading-none tracking-tight"
							className="border-none p-0 px-2 h-fit py-0.5 shadow-none"
							value={{
								after: queryParams.after ? new Date(queryParams.after) : undefined,
								before: queryParams.before ? new Date(queryParams.before) : undefined,
							}}
							handleChange={(v) => {
								updateQueryParams({
									after: v.after ? v.after.toISOString() : undefined,
									before: v.before ? v.before.toISOString() : undefined,
								});
							}}
						/>
					</div>
				</div>
				<div className="flex flex-col justify-between gap-4 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar comissões." /> : null}
					{isSuccess ? (
						<>
							<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
								<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] px-6 py-3 shadow-sm lg:w-1/2">
									<div className="flex items-center justify-between">
										<h1 className="text-sm font-medium uppercase tracking-tight">Projetos Comissionáveis</h1>
										<VscDiffAdded />
									</div>
									<div className="mt-2 flex w-full flex-col">
										<div className="text-xl font-bold text-[#15599a]">{stats.totalComissionableProjects}</div>
									</div>
								</div>
								<div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] px-6 py-3 shadow-sm lg:w-1/2">
									<div className="flex items-center justify-between">
										<h1 className="text-sm font-medium uppercase tracking-tight">Comissão total</h1>
										<BadgeDollarSign />
									</div>
									<div className="mt-2 flex w-full flex-col">
										<div className="text-xl font-bold text-[#15599a]">{formatToMoney(stats.totalComissionValue)}</div>
									</div>
								</div>
							</div>
							<div className="w-full flex items-center justify-center gap-2 flex-wrap">
								<div className={cn("flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80 bg-green-100 text-green-700")}>
									<BadgeCheck className={cn("w-4 h-4 min-w-4 min-h-4")} />
									<p className={cn("font-medium text-sm")}>{stats.totalComissionsValidated} validadas</p>
								</div>
								<div className={cn("flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80 bg-orange-100 text-orange-700")}>
									<BadgeCheck className={cn("w-4 h-4 min-w-4 min-h-4")} />
									<p className={cn("font-medium text-sm")}>{stats.totalComissionsNotValidated} não validadas</p>
								</div>
							</div>
							<div className="w-full flex items-center justify-end">
								{areExistingOpportunitiesMissingValidation ? (
									<LoadingButton loading={isBulkUpdateComissionPending} onClick={() => handleBulkUpdateComission(comissions)}>
										VALIDAR COMISSÕES PENDENTES
									</LoadingButton>
								) : null}
							</div>
							{comissions.length > 0 ? (
								comissions.map((opportunity) => (
									<ComissionCard key={opportunity._id} opportunity={opportunity} queryClient={queryClient} affectedQueryKey={["own-comissions", queryParams]} />
								))
							) : (
								<p className="w-full text-center italic text-gray-500">Nenhuma comissão para o período selecionado encontrada...</p>
							)}
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default ComissionsPage;

type ComissionCardProps = {
	opportunity: TGetComissionsRouteOutput["data"][number];
	queryClient: QueryClient;
	affectedQueryKey: any[];
};
function ComissionCard({ opportunity, queryClient, affectedQueryKey }: ComissionCardProps) {
	function getDateParams(opportunity: TGetComissionsRouteOutput["data"][number]) {
		if (["SISTEMA FOTOVOLTAICO", "AUMENTO DE SISTEMA FOTOVOLTAICO"].includes(opportunity.appTipo)) {
			return opportunity.appDataRecebimentoParcial;
		}
		return opportunity.appDataAssinatura;
	}
	function handleValidateComission(opportunity: TGetComissionsRouteOutput["data"][number]) {
		const bulkUpdates: TBulkUpdateComissionsRouteInput = [{ projectId: opportunity.appId }];
		return handleBulkUpdateComissionMutation({
			comissions: bulkUpdates,
		});
	}

	const { mutate: handleBulkUpdateComissionMutation, isPending: isBulkUpdateComissionPending } = useMutationWithFeedback({
		mutationKey: ["bulk-update-comissions"],
		mutationFn: bulkUpdateComissions,
		queryClient,
		affectedQueryKey,
	});
	return (
		<div className="flex w-full flex-col gap-1 rounded border border-primary bg-[#fff] p-2 shadow-sm">
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex items-center gap-1 text-center text-xs font-bold italic text-black/80">
						<MdDashboard size={12} />
						<p className="text-xs">{opportunity.appIdentificador}</p>
					</div>
					<p className="text-sm font-bold leading-none tracking-tight">{opportunity.appNome}</p>
					<Link href={`/comercial/oportunidades/id/${opportunity._id}`} target="_blank" rel="noreferrer">
						<div className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80">
							<BsFunnel size={12} />
							<p>{opportunity.identificador}</p>
						</div>
					</Link>
					<div className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80">
						<FaDiamond size={12} />
						<p>{opportunity.appTipo}</p>
					</div>
					<HoverCard>
						<HoverCardTrigger asChild>
							<div className="flex items-center gap-1  text-center text-[0.57rem] font-bold italic text-black/80">
								<Calendar className="w-3.5 h-3.5 min-w-3.5 min-h-3.5" />
								<p>{formatDateAsLocale(getDateParams(opportunity))}</p>
							</div>
						</HoverCardTrigger>
						<HoverCardContent className="min-w-80 w-fit">
							<div className="space-y-1">
								<div className="w-full flex items-center justify-between gap-2">
									<p className="text-sm font-semibold text-black/80">DATA DE ASSINATURA:</p>
									<p className="text-sm font-semibold text-black/80">{formatDateAsLocale(opportunity.appDataAssinatura) || "N/A"}</p>
								</div>
								<div className="w-full flex items-center justify-between gap-2">
									<p className="text-sm font-semibold text-black/80">DATA DE PAGAMENTO PARCIAL: </p>
									<p className="text-sm font-semibold text-black/80">{formatDateAsLocale(opportunity.appDataRecebimentoParcial) || "N/A"}</p>
								</div>
							</div>
						</HoverCardContent>
					</HoverCard>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 px-2 py-1">
						<Percent className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-sm font-semibold text-black/80">{formatDecimalPlaces(opportunity.comissao.comissaoPorcentagem)}%</p>
					</div>
					<div className="flex items-center gap-1 px-2 py-1">
						<BadgeDollarSign className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-sm font-semibold text-black/80">{formatToMoney(opportunity.comissao.comissaoValor)}</p>
					</div>
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex w-full flex-wrap items-center justify-center gap-2 lg:grow lg:justify-start">
					<div className="flex items-center gap-1">
						<Users className={cn("w-3 h-3 min-w-3 min-h-3")} />
						<div className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80">
							<p>FUNÇÃO: </p>
							<p className="text-[#15599a] font-black text-[0.57rem]">{opportunity.comissao.comissionadoPapel}</p>
						</div>
					</div>
					<div
						className={cn("flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80", {
							"bg-orange-100 text-orange-700": !opportunity.comissao.comissaoEfetivada,
							"bg-green-100 text-green-700": opportunity.comissao.comissaoEfetivada,
						})}
					>
						<BadgeCheck className={cn("w-3 h-3 min-w-3 min-h-3")} />
						<p className={cn("font-medium text-[0.57rem]")}>{opportunity.comissao.comissaoEfetivada ? "COMISSÕES DEFINIDAS" : "COMISSÕES NÃO DEFINIDAS"}</p>
					</div>
					<div
						className={cn("flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80", {
							"bg-orange-100 text-orange-700": !opportunity.comissao.comissaoPagamentoRealizado,
							"bg-green-100 text-green-700": opportunity.comissao.comissaoPagamentoRealizado,
						})}
					>
						<BadgeDollarSign className={cn("w-3 h-3 min-w-3 min-h-3")} />
						<p className={cn("font-medium text-[0.57rem]")}>{opportunity.comissao.comissaoPagamentoRealizado ? "PAGAMENTO REALIZADO" : "PAGAMENTO NÃO REALIZADO"}</p>
					</div>
					<div
						className={cn("flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-[0.5rem] font-bold italic text-black/80", {
							"bg-orange-100 text-orange-700": !opportunity.comissao.dataValidacao,
							"bg-green-100 text-green-700": opportunity.comissao.dataValidacao,
						})}
					>
						<BadgeCheck className={cn("w-3 h-3 min-w-3 min-h-3")} />
						<p className={cn("font-medium text-[0.57rem]")}>
							{opportunity.comissao.dataValidacao ? `VALIDO COMO ${opportunity.comissao.comissionadoPapel} EM ${formatDateAsLocale(opportunity.comissao.dataValidacao)}` : "NÃO VALIDADO"}
						</p>
					</div>
				</div>
				{!opportunity.comissao.dataValidacao ? (
					<LoadingButton
						size={"fit"}
						className="px-2 py-1 text-xs font-bold"
						variant={"ghost"}
						loading={isBulkUpdateComissionPending}
						onClick={() => handleValidateComission(opportunity)}
					>
						VALIDAR COMISSÃO
					</LoadingButton>
				) : null}
			</div>
		</div>
	);
}
