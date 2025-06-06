import Avatar from "@/components/utils/Avatar";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import { getErrorMessage } from "@/lib/methods/errors";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { useSalePromoterResultsById } from "@/utils/queries/stats/sellers";
import dayjs from "dayjs";
import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import PowerSoldTracking from "./Blocks/PowerSoldTracking";
import ValueSoldTracking from "./Blocks/ValueSoldTracking";
import ProjectsSoldTracking from "./Blocks/SoldProjectsTrackign";
import CreatedProjectsTracking from "./Blocks/CreatedProjectsTracking";
import SentProjectsTracking from "./Blocks/SentProjectsTracking";
import SelectInput from "@/components/Inputs/SelectInput";
import GoalsMenu from "./Blocks/GoalsMenu";
import type { TUserSession } from "@/lib/auth/session";

const initialFirstPeriodAfter = dayjs().subtract(1, "year").startOf("year").toISOString(); // dayjs().startOf('year').toISOString()
const initialFirstPeriodBefore = dayjs().subtract(1, "year").endOf("year").toISOString(); //dayjs().endOf('year').toISOString()
const initialSecondPeriodAfter = dayjs().startOf("year").toISOString();
const initialSecondPeriodBefore = dayjs().endOf("year").toISOString();
type EditSalePromoterProps = {
	promoterId: string;
	session: TUserSession;
	closeModal: () => void;
};
function EditSalePromoter({ promoterId, session, closeModal }: EditSalePromoterProps) {
	const [queryParams, setQueryParams] = useState({
		firstPeriodAfter: initialFirstPeriodAfter,
		firstPeriodBefore: initialFirstPeriodBefore,
		secondPeriodAfter: initialSecondPeriodAfter,
		secondPeriodBefore: initialSecondPeriodBefore,
	});
	const { data: promoter, isLoading, isError, isSuccess, error } = useSalePromoterResultsById({ id: promoterId, ...queryParams });
	return (
		<div id="new-revenue" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">PROMOTOR DE VENDAS</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
					{isSuccess ? (
						<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
							<div className="flex w-full flex-col items-center justify-center gap-2">
								<Avatar height={50} width={50} url={promoter.avatar_url || undefined} fallback={formatNameAsInitials(promoter.nome)} />
								<h1 className="w-full text-center font-bold leading-none tracking-tight">{promoter.nome}</h1>
							</div>
							<h1 className="w-full rounded bg-cyan-500 p-1 text-center text-xs font-medium text-white">RESULTADOS</h1>
							<div className="flex w-full items-center justify-between gap-2">
								<SelectInput
									label="ANO DO PRIMEIRO PERÍODO"
									value={dayjs(queryParams.firstPeriodAfter).get("year").toString()}
									options={[
										{ id: 1, label: "2022", value: "2022" },
										{ id: 2, label: "2023", value: "2023" },
										{ id: 3, label: "2024", value: "2024" },
									]}
									handleChange={(value) => {
										const periodStart = dayjs(`01/01/${value}`).startOf("year").toISOString();
										const periodEnd = dayjs(`12/31/${value}`).endOf("year").subtract(3, "hour").toISOString();
										setQueryParams((prev) => ({ ...prev, firstPeriodAfter: periodStart, firstPeriodBefore: periodEnd }));
									}}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => setQueryParams((prev) => ({ ...prev, firstPeriodAfter: initialFirstPeriodAfter, firstPeriodBefore: initialFirstPeriodBefore }))}
								/>
								<SelectInput
									label="ANO DO SEGUNDO PERÍODO"
									value={dayjs(queryParams.secondPeriodAfter).get("year").toString()}
									options={[
										{ id: 1, label: "2022", value: "2022" },
										{ id: 2, label: "2023", value: "2023" },
										{ id: 3, label: "2024", value: "2024" },
									]}
									handleChange={(value) => {
										const periodStart = dayjs(`01/01/${value}`).startOf("year").toISOString();
										const periodEnd = dayjs(`12/31/${value}`).endOf("year").subtract(3, "hour").toISOString();
										setQueryParams((prev) => ({ ...prev, secondPeriodAfter: periodStart, secondPeriodBefore: periodEnd }));
									}}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => setQueryParams((prev) => ({ ...prev, secondPeriodAfter: initialSecondPeriodAfter, firstPeriodBefore: initialSecondPeriodBefore }))}
								/>
							</div>
							<CreatedProjectsTracking
								data={promoter}
								firstPeriodAfter={queryParams.firstPeriodAfter}
								firstPeriodBefore={queryParams.firstPeriodBefore}
								secondPeriodAfter={queryParams.secondPeriodAfter}
								secondPeriodBefore={queryParams.secondPeriodBefore}
							/>
							<ProjectsSoldTracking
								data={promoter}
								firstPeriodAfter={queryParams.firstPeriodAfter}
								firstPeriodBefore={queryParams.firstPeriodBefore}
								secondPeriodAfter={queryParams.secondPeriodAfter}
								secondPeriodBefore={queryParams.secondPeriodBefore}
							/>
							<ValueSoldTracking
								data={promoter}
								firstPeriodAfter={queryParams.firstPeriodAfter}
								firstPeriodBefore={queryParams.firstPeriodBefore}
								secondPeriodAfter={queryParams.secondPeriodAfter}
								secondPeriodBefore={queryParams.secondPeriodBefore}
							/>
							<PowerSoldTracking
								data={promoter}
								firstPeriodAfter={queryParams.firstPeriodAfter}
								firstPeriodBefore={queryParams.firstPeriodBefore}
								secondPeriodAfter={queryParams.secondPeriodAfter}
								secondPeriodBefore={queryParams.secondPeriodBefore}
							/>
							<SentProjectsTracking
								data={promoter}
								firstPeriodAfter={queryParams.firstPeriodAfter}
								firstPeriodBefore={queryParams.firstPeriodBefore}
								secondPeriodAfter={queryParams.secondPeriodAfter}
								secondPeriodBefore={queryParams.secondPeriodBefore}
							/>
							<GoalsMenu promoter={{ id: promoter.id, nome: promoter.nome, avatar_url: promoter.avatar_url }} session={session} />
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default EditSalePromoter;
