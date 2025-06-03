import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { TPersonalizedServiceOrderFilter } from "@/utils/schemas/service-order.schema";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import TextInput from "../Inputs/TextInput";
import DateInput from "../Inputs/DateInput";
import { formatDateForInput } from "@/utils/methods";
import { formatDateInputChange } from "@/lib/methods/formatting";
import SelectInput from "../Inputs/SelectInput";
import MultipleSelectInputVirtualized from "../Inputs/MultipleSelectInputVirtualized";
import { ServiceOrderCategories } from "@/utils/select-options";
import CheckboxInput from "../Inputs/CheckboxInput";
import StatesAndCities from "@/utils/json-files/cities.json";

const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));

type ServiceOrdersFilterMenuProps = {
	updateFilters: (filters: TPersonalizedServiceOrderFilter) => void;
	queryLoading: boolean;
	resetSelectedPage: () => void;
};

function ServiceOrdersFilterMenu({ updateFilters, queryLoading, resetSelectedPage }: ServiceOrdersFilterMenuProps) {
	const [filtersHolder, setFiltersHolder] = useState<TPersonalizedServiceOrderFilter>({
		name: "",
		state: [],
		city: [],
		category: [],
		urgency: [],
		period: {
			after: null,
			before: null,
			field: null,
		},
		pending: true,
	});
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
						label="PESQUISA"
						value={filtersHolder.name}
						handleChange={(value) => {
							setFiltersHolder((prev) => ({ ...prev, name: value }));
						}}
						placeholder="Filtre pelo nome do favorecido..."
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<div className="flex w-full flex-col gap-2 lg:w-fit lg:flex-row">
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
									/>
								</div>
							</div>
							<div className="w-full lg:w-[250px]">
								<SelectInput
									width={"100%"}
									label={"CAMPO DE FILTRO"}
									value={filtersHolder.period.field}
									options={[
										{ id: 1, label: "DATA CRIAÇÃO", value: "dataInsercao" },
										{ id: 2, label: "DATA DE FINALIZAÇÃO", value: "dataEfetivacao" },
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
								/>
							</div>
						</div>
					</div>
					<div className="w-full lg:w-[250px]">
						<MultipleSelectInputVirtualized
							label="CIDADE"
							selected={filtersHolder.city}
							options={AllCities}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => {
								setFiltersHolder((prev) => ({
									...prev,
									city: value as string[],
								}));
							}}
							onReset={() => {
								setFiltersHolder((prev) => ({
									...prev,
									city: [],
								}));
							}}
							width="100%"
							labelClassName="text-xs font-medium tracking-tight text-black"
						/>
					</div>
					<div className="w-full lg:w-[250px]">
						<MultipleSelectInputVirtualized
							label="CATEGORIA"
							selected={filtersHolder.category}
							options={ServiceOrderCategories}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => {
								setFiltersHolder((prev) => ({
									...prev,
									category: value as string[],
								}));
							}}
							onReset={() => {
								setFiltersHolder((prev) => ({
									...prev,
									category: [],
								}));
							}}
							width="100%"
							labelClassName="text-xs font-medium tracking-tight text-black"
						/>
					</div>
					<div className="w-full lg:w-[250px]">
						<MultipleSelectInputVirtualized
							label="URGÊNCIA"
							selected={filtersHolder.urgency}
							options={[
								{ id: 1, label: "POUCO URGENTE", value: "POUCO URGENTE" },
								{ id: 2, label: "URGENTE", value: "URGENTE" },
								{ id: 3, label: "EMERGÊNCIA", value: "EMERGÊNCIA" },
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => {
								setFiltersHolder((prev) => ({
									...prev,
									urgency: value as string[],
								}));
							}}
							onReset={() => {
								setFiltersHolder((prev) => ({
									...prev,
									urgency: [],
								}));
							}}
							width="100%"
							labelClassName="text-xs font-medium tracking-tight text-black"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col flex-wrap items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-wrap items-center gap-2">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="SOMENTE PENDENTES"
								labelTrue="SOMENTE PENDENTES"
								checked={filtersHolder.pending}
								handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, pending: value }))}
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

export default ServiceOrdersFilterMenu;
