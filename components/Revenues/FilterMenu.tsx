import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";
import { TPersonalizedRevenuesFilters } from "@/utils/schemas/revenues.schema";
import { AnimatePresence, motion } from "framer-motion";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import TextInput from "../Inputs/TextInput";
import NumberInput from "../Inputs/NumberInput";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import DateInput from "../Inputs/DateInput";
import { formatDateForInput } from "@/utils/methods";
import { formatDateInputChange } from "@/lib/methods/formatting";
import SelectInput from "../Inputs/SelectInput";
import CheckboxInput from "../Inputs/CheckboxInput";

type RevenuesFilterMenuProps = {
	updateFilters: (filters: TPersonalizedRevenuesFilters) => void;
	selectedPartners: string[] | null;
	setSelectedPartners: (partners: string[] | null) => void;
	partnersOptions?: TPartnerSimplifiedDTO[];
	session: TUserSession;
	queryLoading: boolean;
	resetSelectedPage: () => void;
};
function RevenuesFilterMenu({ updateFilters, selectedPartners, setSelectedPartners, partnersOptions, session, queryLoading, resetSelectedPage }: RevenuesFilterMenuProps) {
	const [filtersHolder, setFiltersHolder] = useState<TPersonalizedRevenuesFilters>({
		title: "",
		category: "",
		total: {
			greater: null,
			less: null,
		},
		period: { after: null, before: null, field: null },
		pendingPartialReceipt: false,
		pendingTotalReceipt: false,
	});

	const userPartnerScope = session.user.permissoes.parceiros.escopo;
	const partnersSelectableOptions = partnersOptions ? (userPartnerScope ? partnersOptions.filter((a) => userPartnerScope.includes(a._id)) : partnersOptions) : [];
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
				<h1 className="text-sm font-bold tracking-tight">FILTROS</h1>
				<div className="flex w-full flex-col flex-wrap items-center justify-start gap-2 lg:flex-row">
					<TextInput
						label="TÍTULO DA RECEITA"
						placeholder="Filtre pelo título da receita..."
						value={filtersHolder.title}
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, title: value }))}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<TextInput
						label="CATEGORIA DA RECEITA"
						placeholder="Filtre pela categoria da receita..."
						value={filtersHolder.category}
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, category: value }))}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<NumberInput
						label="TOTAL > QUE"
						value={filtersHolder.total.greater || null}
						placeholder="Preenche o valor de total mínimo para filtro..."
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, total: { ...prev.total, greater: value } }))}
					/>
					<NumberInput
						label="TOTAL < QUE"
						value={filtersHolder.total.less || null}
						placeholder="Preenche o valor de total máximo para filtro..."
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, total: { ...prev.total, less: value } }))}
					/>
					<div className="flex w-full flex-col gap-2 lg:w-fit lg:flex-row">
						<div className="flex items-center justify-center gap-x-2">
							<div className="w-full lg:w-[250px]">
								<DateInput
									width={"100%"}
									label={"DEPOIS DE"}
									value={filtersHolder.period.after ? formatDateForInput(filtersHolder.period.after) : undefined}
									handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, period: { ...prev.period, after: formatDateInputChange(value) } }))}
									labelClassName="text-xs font-medium tracking-tight text-black"
								/>
							</div>
							<div className="w-full lg:w-[250px]">
								<DateInput
									width={"100%"}
									label={"ANTES DE"}
									value={filtersHolder.period.before ? formatDateForInput(filtersHolder.period.before) : undefined}
									handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, period: { ...prev.period, before: formatDateInputChange(value) } }))}
									labelClassName="text-xs font-medium tracking-tight text-black"
								/>
							</div>
						</div>
						<div className="w-full lg:w-[350px]">
							<SelectInput
								width={"100%"}
								label={"CAMPO DE FILTRO"}
								value={filtersHolder.period.field}
								options={[
									{ id: 1, label: "DATA DE INSERÇÃO", value: "dataInsercao" },
									{ id: 2, label: "DATA DE COMPETÊNCIA", value: "dataCompetencia" },
									{ id: 3, label: "DATA DE FATURAMENTO", value: "faturamento.data" },
									{ id: 4, label: "DATA/PREVISÃO DE RECEBIMENTO", value: "recebimentos.dataRecebimento" },
								]}
								resetOptionLabel={"SEM FILTRO"}
								handleChange={(value) =>
									setFiltersHolder((prev) => ({
										...prev,
										period: {
											...prev.period,
											field: value,
										},
									}))
								}
								onReset={() =>
									setFiltersHolder((prev) => ({
										...prev,
										period: {
											...prev.period,
											field: null,
										},
									}))
								}
								labelClassName="text-xs font-medium tracking-tight text-black"
							/>
						</div>
					</div>
					<div className="w-full md:w-[250px]">
						<MultipleSelectInput
							label="PARCEIROS"
							options={partnersSelectableOptions?.map((promoter) => ({ id: promoter._id || "", label: promoter.nome, value: promoter._id })) || null}
							selected={selectedPartners}
							handleChange={(value) => setSelectedPartners(value as string[])}
							resetOptionLabel="TODOS"
							onReset={() => setSelectedPartners(null)}
							labelClassName="text-xs font-medium tracking-tight text-black"
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col flex-wrap items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-wrap items-center gap-2">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="SOMENTE RECEBIMENTO PARCIAL PENDENTE"
								labelTrue="SOMENTE RECEBIMENTO PARCIAL PENDENTE"
								checked={filtersHolder.pendingPartialReceipt}
								handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, pendingPartialReceipt: value }))}
							/>
						</div>
						<div className="w-fit">
							<CheckboxInput
								labelFalse="SOMENTE RECEBIMENTO TOTAL PENDENTE"
								labelTrue="SOMENTE RECEBIMENTO TOTAL PENDENTE"
								checked={filtersHolder.pendingTotalReceipt}
								handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, pendingTotalReceipt: value }))}
							/>
						</div>
					</div>
					<button
						disabled={queryLoading}
						onClick={() => {
							resetSelectedPage();
							updateFilters(filtersHolder);
						}}
						className="h-9 whitespace-nowrap rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-700 enabled:hover:text-white"
					>
						PESQUISAR
					</button>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}

export default RevenuesFilterMenu;
