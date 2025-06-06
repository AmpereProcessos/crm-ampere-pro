import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { UseTechnicalAnalysisFilters } from "@/utils/queries/technical-analysis";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import TextInput from "../Inputs/TextInput";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import { TechnicalAnalysisComplexity, TechnicalAnalysisSolicitationTypes, TechnicalAnalysisStatus } from "@/utils/select-options";
import SelectWithImages from "../Inputs/SelectWithImages";
import { TUserDTO, TUserDTOSimplified } from "@/utils/schemas/user.schema";
import { TPersonalizedTechnicalAnalysisFilter } from "@/utils/schemas/technical-analysis.schema";
import { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";
import StatesAndCities from "@/utils/json-files/cities.json";

import type { TUserSession } from "@/lib/auth/session";
import SelectInput from "../Inputs/SelectInput";
import MultipleSelectInputVirtualized from "../Inputs/MultipleSelectInputVirtualized";
import CheckboxInput from "../Inputs/CheckboxInput";

const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));
const AllStates = StatesAndCities.map((e) => e.sigla).map((c, index) => ({ id: index + 1, label: c, value: c }));
type FilterMenuProps = {
	updateFilters: (filtersHolder: TPersonalizedTechnicalAnalysisFilter) => void;
	selectedApplicants: string[] | null;
	setApplicants: (authors: string[] | null) => void;
	selectedAnalysts: string[] | null;
	setAnalysts: (authors: string[] | null) => void;
	applicantsOptions?: TUserDTO[];
	analystsOptions?: TUserDTOSimplified[];
	session: TUserSession;
	queryLoading: boolean;
	resetSelectedPage: () => void;
};
function FilterMenu({
	updateFilters,
	selectedApplicants,
	setApplicants,
	selectedAnalysts,
	setAnalysts,
	applicantsOptions,
	analystsOptions,
	session,
	queryLoading,
	resetSelectedPage,
}: FilterMenuProps) {
	const userAnalysisScope = session.user.permissoes.analisesTecnicas.escopo;
	const applicantSelectableOptions = applicantsOptions ? (userAnalysisScope ? applicantsOptions.filter((a) => userAnalysisScope.includes(a._id)) : applicantsOptions) : [];

	const [filtersHolder, setFiltersHolder] = useState<TPersonalizedTechnicalAnalysisFilter>({
		name: "",
		status: [],
		complexity: null,
		city: [],
		state: [],
		type: [],
		pending: false,
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
						label="NOME DA ANÁLISE"
						placeholder="Filtre pelo nome da análise..."
						value={filtersHolder.name}
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, name: value }))}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<MultipleSelectInput
						label={"STATUS"}
						resetOptionLabel={"NÃO DEFINIDO"}
						selected={filtersHolder.status}
						options={TechnicalAnalysisStatus}
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, status: value as string[] }))}
						onReset={() => setFiltersHolder((prev) => ({ ...prev, status: [] }))}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<div className="w-full lg:w-[200px]">
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
					<div className="w-full lg:w-[200px]">
						<MultipleSelectInputVirtualized
							label="ESTADO"
							selected={filtersHolder.state}
							options={AllStates}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => {
								setFiltersHolder((prev) => ({
									...prev,
									state: value as string[],
								}));
							}}
							onReset={() => {
								setFiltersHolder((prev) => ({
									...prev,
									state: [],
								}));
							}}
							width="100%"
							labelClassName="text-xs font-medium tracking-tight text-black"
						/>
					</div>
					<MultipleSelectInput
						label="TIPO DE SOLICITAÇÃO"
						selected={filtersHolder.type}
						options={TechnicalAnalysisSolicitationTypes}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, type: value as string[] }))}
						onReset={() => setFiltersHolder((prev) => ({ ...prev, type: [] }))}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<SelectInput
						label={"COMPLEXIDADE"}
						resetOptionLabel={"NÃO DEFINIDO"}
						value={filtersHolder.complexity}
						options={TechnicalAnalysisComplexity}
						handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, complexity: value }))}
						onReset={() => setFiltersHolder((prev) => ({ ...prev, complexity: null }))}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<MultipleSelectInput
						label="ANALISTA"
						selected={selectedAnalysts}
						options={analystsOptions?.map((a) => ({ id: a._id, label: a.nome, value: a._id, url: a.avatar_url || undefined })) || []}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value) => setAnalysts(value as string[])}
						onReset={() => setAnalysts(null)}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
					<MultipleSelectInput
						label="REQUERENTE"
						selected={selectedApplicants}
						options={applicantSelectableOptions?.map((a) => ({ id: a._id, label: a.nome, value: a._id, url: a.avatar_url || undefined })) || []}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value) => setApplicants(value as string[])}
						onReset={() => setApplicants(null)}
						labelClassName="text-xs font-medium tracking-tight text-black"
					/>
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

export default FilterMenu;
