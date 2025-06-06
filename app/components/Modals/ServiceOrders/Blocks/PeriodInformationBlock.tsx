import DateTimeInput from "@/components/Inputs/DateTimeInput";
import { formatDateInputChange, formatDateTime } from "@/lib/methods/formatting";
import { TServiceOrder } from "@/utils/schemas/service-order.schema";
import React from "react";
import ExecutionLogsBlock from "./Utils/ExecutionLogsBlock";
import type { TUserSession } from "@/lib/auth/session";

type PeriodInformationBlockProps = {
	infoHolder: TServiceOrder;
	setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
	session: TUserSession;
};
function PeriodInformationBlock({ infoHolder, setInfoHolder, session }: PeriodInformationBlockProps) {
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">PERÍODO DE EXECUÇÃO</h1>
			<div className="flex w-full flex-col gap-1">
				<div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
					<div className="w-1/2 lg:w-full">
						<DateTimeInput
							label="INÍCIO DA EXECUÇÃO"
							value={formatDateTime(infoHolder.periodo.inicio)}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, periodo: { ...prev.periodo, inicio: formatDateInputChange(value) } }))}
							width="100%"
						/>
					</div>
					<div className="w-1/2 lg:w-full">
						<DateTimeInput
							label="FIM DA EXECUÇÃO"
							value={formatDateTime(infoHolder.periodo.fim)}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, periodo: { ...prev.periodo, fim: formatDateInputChange(value) } }))}
							width="100%"
						/>
					</div>
				</div>
				<ExecutionLogsBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} session={session} />
			</div>
		</div>
	);
}

export default PeriodInformationBlock;
