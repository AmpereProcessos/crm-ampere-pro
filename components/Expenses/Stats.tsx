import { getPeriodDateParamsByReferenceDate } from "@/lib/methods/dates";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { useExpenseStats } from "@/utils/queries/stats/expenses";
import { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";
import { AnimatePresence, motion } from "framer-motion";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import DateInput from "../Inputs/DateInput";
import { formatDateForInputValue } from "@/utils/methods";
import { formatDateOnInputChange, formatToMoney } from "@/lib/methods/formatting";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import { TbAlertTriangle, TbSum } from "react-icons/tb";
import { BsCalendarEvent, BsPatchCheck } from "react-icons/bs";
import PeriodPaymentsGraph from "./Utils/PeriodPaymentsGraph";

const currentDate = new Date().toISOString();

const periodParams = getPeriodDateParamsByReferenceDate({ reference: currentDate });
const firstDayOfMonth = periodParams.start.toISOString();
const lastDayOfMonth = periodParams.end.toISOString();
type ExpenseStatsProps = {
	session: TUserSession;
	partnerOptions: TPartnerSimplifiedDTO[];
};
function ExpenseStats({ session, partnerOptions }: ExpenseStatsProps) {
	const userPartnerScope = session.user.permissoes.parceiros.escopo;
	const [partners, setParners] = useState<string[] | null>(userPartnerScope || null);
	const [projectTypes, setProjectTypes] = useState(null);
	const [period, setPeriod] = useState<{ after: string; before: string }>({ after: firstDayOfMonth, before: lastDayOfMonth });

	const { data: stats, isLoading, isError, isSuccess } = useExpenseStats({ after: period.after, before: period.before, partners, projectTypes });
	return (
		<AnimatePresence>
			<motion.div
				key={"editor"}
				variants={GeneralVisibleHiddenExitMotionVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
				className="mt-2 flex w-full flex-col gap-2 rounded-md border border-gray-300 bg-[#fff] p-2"
			>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex items-center gap-2">
						<h1 className="text-sm font-bold tracking-tight">ESTÁTISTICAS DE DESPESAS</h1>
					</div>
					<div className="flex w-full flex-col items-center gap-2 md:flex-row lg:w-fit">
						<div className="w-full md:w-[150px]">
							<DateInput
								showLabel={false}
								label="PERÍODO"
								value={formatDateForInputValue(period.after)}
								handleChange={(value) =>
									setPeriod((prev) => ({
										...prev,
										after: formatDateOnInputChange(value) || firstDayOfMonth,
									}))
								}
								width="100%"
							/>
						</div>
						<div className="w-full md:w-[150px]">
							<DateInput
								showLabel={false}
								label="PERÍODO"
								value={formatDateForInputValue(period.before)}
								handleChange={(value) =>
									setPeriod((prev) => ({
										...prev,
										before: formatDateOnInputChange(value) || lastDayOfMonth,
									}))
								}
								width="100%"
							/>
						</div>
					</div>
				</div>
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar estatísticas de despesas." /> : null}
				{isSuccess ? (
					<div className="flex w-full flex-col gap-2">
						<div className="flex w-full grow flex-col items-center justify-around gap-3 lg:flex-row">
							<div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
								<div className="flex items-center gap-1">
									<TbSum color="#1f2937" />
									<h1 className="text-xs font-medium uppercase tracking-tight">TOTAL FATURADO</h1>
								</div>
								<h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.total)}</h1>
							</div>
							<div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
								<div className="flex items-center gap-1">
									<BsPatchCheck color="#16a34a" />
									<h1 className="text-xs font-medium uppercase tracking-tight">TOTAL PAGO</h1>
								</div>
								<h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.totalPago)}</h1>
							</div>
							<div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
								<div className="flex items-center gap-1">
									<BsCalendarEvent color="#ca8a04" />
									<h1 className="text-xs font-medium uppercase tracking-tight">TOTAL A PAGAR</h1>
								</div>
								<div className="flex flex-col items-end">
									<h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.totalAPagar)}</h1>
									<h1 className="text-[0.6rem]  uppercase tracking-tight">{formatToMoney(stats.totalAPagarHoje)} para hoje</h1>
								</div>
							</div>
							<div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
								<div className="flex items-center gap-1">
									<TbAlertTriangle color="#dc2626" />
									<h1 className="text-xs font-medium uppercase tracking-tight">TOTAL EM ATRASO</h1>
								</div>
								<h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.totalAPagarEmAtraso)}</h1>
							</div>
						</div>
						<div className="flex w-full flex-col gap-3">
							<PeriodPaymentsGraph dailyData={stats.diario} />
						</div>
					</div>
				) : null}
			</motion.div>
		</AnimatePresence>
	);
}

export default ExpenseStats;
