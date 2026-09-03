"use client";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsDownload } from "react-icons/bs";
import MultipleSelectInput from "@/components/Inputs/MultipleSelectInput";
import EditPromoter from "@/components/Modals/EditPromoter";
import CommercialPipelineBlock from "@/components/Stats/Results/CommercialPipelineBlock";
import OverallResults from "@/components/Stats/Results/Overall";

import RegionResults from "@/components/Stats/Results/Region";
import SalesTeamResults from "@/components/Stats/Results/SalesTeam";
import SDRTeamResults from "@/components/Stats/Results/SDRTeam";
import Sellers from "@/components/Stats/Results/Sellers";
import { InteractiveFilter } from "@/components/ui/interactive-filter";
import type { TUserSession } from "@/lib/auth/session";
import { formatInteractiveDateRangeSummary } from "@/lib/interactive-filter-formatting";
import { getErrorMessage } from "@/lib/methods/errors";
import { getExcelFromJSON } from "@/lib/methods/excel-utils";
import { useComercialResultsQueryOptions } from "@/utils/queries/stats";
import { fetchResultsExportsAll } from "@/utils/queries/stats/exports";
import type { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";

const firstDayOfMonth = dayjs().startOf("month").toISOString();
const lastDayOfMonth = dayjs().endOf("month").toISOString();

type TQueryFilters = {
	period: { after: string; before: string };
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};

type ComercialResultsProps = {
	session: TUserSession;
};
function ManagementComercialResults({ session }: ComercialResultsProps) {
	const [queryFilters, setQueryFilters] = useState<TQueryFilters>({
		period: { after: firstDayOfMonth, before: lastDayOfMonth },
		responsibles: null,
		partners: null,
		projectTypes: null,
	});

	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		promoter: TUserDTOWithSaleGoals | null;
	}>({
		isOpen: false,
		promoter: null,
	});
	const { data: queryOptions } = useComercialResultsQueryOptions();
	async function handleDataExport() {
		const loadingToastId = toast.loading("Carregando...");
		try {
			const results = await fetchResultsExportsAll({
				after: queryFilters.period.after,
				before: queryFilters.period.before,
				responsibles: queryFilters.responsibles ?? undefined,
				partners: queryFilters.partners ?? undefined,
				projectTypes: queryFilters.projectTypes ?? undefined,
				pageSize: 500,
			});
			getExcelFromJSON(results, "RESULTADOS_COMERCIAIS");
			toast.dismiss(loadingToastId);
			return toast.success("Exportação feita com sucesso !");
		} catch (error) {
			console.log(error);
			toast.dismiss(loadingToastId);
			const msg = getErrorMessage(error);
			return toast.error(msg);
		}
	}

	return (
		<>
			<div className="flex w-full min-w-0 flex-col gap-4">
				<div className="flex items-center gap-2 flex-col lg:flex-row w-full justify-end">
					<InteractiveFilter.Root className="w-full lg:w-fit">
						<InteractiveFilter.Trigger className="min-h-[46.6px] w-full justify-start gap-2 rounded-md border border-primary/20 bg-background p-3 text-sm font-normal text-primary shadow-md hover:bg-background hover:text-primary data-[state=open]:border-primary lg:w-auto">
							<InteractiveFilter.Icon className="gap-1.5">
								<Calendar className="h-4 w-4" />
								<InteractiveFilter.Label className="text-sm font-normal text-primary">PERÍODO</InteractiveFilter.Label>
							</InteractiveFilter.Icon>
							<InteractiveFilter.Value className="text-sm text-primary">{formatInteractiveDateRangeSummary(queryFilters.period.after, queryFilters.period.before)}</InteractiveFilter.Value>
						</InteractiveFilter.Trigger>
						<InteractiveFilter.Content className="w-auto p-0" align="end">
							<InteractiveFilter.DateRangeContent
								value={{
									from: new Date(queryFilters.period.after),
									to: new Date(queryFilters.period.before),
								}}
								onChange={(period) =>
									setQueryFilters((prev) => ({
										...prev,
										period: {
											after: period.from ? dayjs(period.from).startOf("day").toISOString() : prev.period.after,
											before: period.to ? dayjs(period.to).endOf("day").toISOString() : prev.period.before,
										},
									}))
								}
							/>
						</InteractiveFilter.Content>
					</InteractiveFilter.Root>
					<div className="w-full md:w-[250px]">
						<MultipleSelectInput
							label="USUÁRIOS"
							labelClassName="text-[0.6rem]"
							holderClassName="text-xs p-2 min-h-[34px]"
							showLabel={false}
							options={
								queryOptions?.salePromoters?.map((promoter) => ({
									id: promoter._id || "",
									label: promoter.nome,
									value: promoter._id,
								})) || null
							}
							selected={queryFilters.responsibles}
							handleChange={(value) =>
								setQueryFilters((prev) => ({
									...prev,
									responsibles: value as string[],
								}))
							}
							resetOptionLabel="TODOS"
							onReset={() => setQueryFilters((prev) => ({ ...prev, responsibles: null }))}
							width="100%"
						/>
					</div>
					<div className="w-full md:w-[250px]">
						<MultipleSelectInput
							label="PARCEIROS"
							labelClassName="text-[0.6rem]"
							holderClassName="text-xs p-2 min-h-[34px]"
							showLabel={false}
							options={
								queryOptions?.partners?.map((partner) => ({
									id: partner._id || "",
									label: partner.nome,
									value: partner._id,
								})) || null
							}
							selected={queryFilters.partners}
							handleChange={(value) =>
								setQueryFilters((prev) => ({
									...prev,
									partners: value as string[],
								}))
							}
							resetOptionLabel="TODOS"
							onReset={() => setQueryFilters((prev) => ({ ...prev, partners: null }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-[300px]">
						<MultipleSelectInput
							resetOptionLabel="TODOS OS PROJETOS"
							selected={queryFilters.projectTypes}
							options={
								queryOptions?.projectTypes?.map((resp) => ({
									id: resp._id || "",
									label: resp.nome || "",
									value: resp._id || "",
								})) || null
							}
							handleChange={(value) =>
								setQueryFilters((prev) => ({
									...prev,
									projectTypes: value as string[],
								}))
							}
							onReset={() => setQueryFilters((prev) => ({ ...prev, projectTypes: null }))}
							showLabel={false}
							label="TIPOS DE PROJETO"
							labelClassName="text-[0.6rem]"
							holderClassName="text-xs p-2 min-h-[34px]"
							width="100%"
						/>
					</div>
					<button
						type="button"
						onClick={() => handleDataExport()}
						className="flex w-full lg:w-fit min-h-[34px] items-center justify-center gap-2 rounded-md border bg-[#2c6e49] p-2 px-3 text-sm font-medium text-primary-foreground shadow-md duration-300 ease-in-out hover:scale-[1.02]"
					>
						<BsDownload className="w-3.5 h-3.5" />
					</button>
				</div>
				<OverallResults
					after={queryFilters.period.after}
					before={queryFilters.period.before}
					responsibles={queryFilters.responsibles}
					partners={queryFilters.partners}
					projectTypes={queryFilters.projectTypes}
				/>
				<CommercialPipelineBlock
					after={queryFilters.period.after}
					before={queryFilters.period.before}
					responsibleIds={queryFilters.responsibles}
				/>
				<SalesTeamResults
					after={queryFilters.period.after}
					before={queryFilters.period.before}
					responsibles={queryFilters.responsibles}
					promoters={queryOptions?.salePromoters}
					partners={queryFilters.partners}
					projectTypes={queryFilters.projectTypes}
				/>
				<SDRTeamResults
					after={queryFilters.period.after}
					before={queryFilters.period.before}
					responsibles={queryFilters.responsibles}
					promoters={queryOptions?.salePromoters}
					partners={queryFilters.partners}
					projectTypes={queryFilters.projectTypes}
				/>
				<Sellers session={session} after={queryFilters.period.after} before={queryFilters.period.before} />

				<RegionResults
					after={queryFilters.period.after}
					before={queryFilters.period.before}
					responsibles={queryFilters.responsibles}
					partners={queryFilters.partners}
					projectTypes={queryFilters.projectTypes}
				/>
			</div>
			{editModal.isOpen && editModal.promoter ? (
				<EditPromoter session={session} promoter={editModal.promoter} closeModal={() => setEditModal({ isOpen: false, promoter: null })} />
			) : null}
		</>
	);
}

export default ManagementComercialResults;
