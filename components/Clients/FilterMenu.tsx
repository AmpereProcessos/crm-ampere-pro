import { AnimatePresence, motion } from "framer-motion";
import type { TGetClientsByFiltersRouteInput } from "@/app/api/clients/search/route";
import type { TUserSession } from "@/lib/auth/session";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import StatesAndCities from "@/utils/json-files/cities.json";

import type { TUserDTO } from "@/utils/schemas/user.schema";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import MultipleSelectInputVirtualized from "../Inputs/MultipleSelectInputVirtualized";
import TextInput from "../Inputs/TextInput";

const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));
const AllStates = StatesAndCities.map((e) => e.sigla).map((c, index) => ({ id: index + 1, label: c, value: c }));
type FilterMenuProps = {
	filters: TGetClientsByFiltersRouteInput;
	updateFilters: (filters: Partial<TGetClientsByFiltersRouteInput>) => void;
	authorsOptions: TUserDTO[];
	session: TUserSession;
	queryLoading: boolean;
};
function FilterMenu({ filters, updateFilters, authorsOptions, session }: FilterMenuProps) {
	const userClientsScope = session.user.permissoes.clientes.escopo;
	const authorSelectableOptions = authorsOptions ? (userClientsScope ? authorsOptions.filter((a) => userClientsScope.includes(a._id)) : authorsOptions) : [];

	return (
		<AnimatePresence>
			<motion.div
				key={"editor"}
				variants={GeneralVisibleHiddenExitMotionVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
				className="mt-2 flex w-full flex-col gap-2 rounded-md border border-primary/30 bg-background p-2"
			>
				<h1 className="text-sm font-bold tracking-tight">FILTROS</h1>
				<div className="flex w-full flex-col flex-wrap items-center justify-start gap-2 lg:flex-row">
					<TextInput
						label="PESQUISA"
						value={filters.search ?? ""}
						handleChange={(value) => {
							updateFilters({ search: value, page: 1 });
						}}
						placeholder="Filtre pelo nome do cliente..."
						labelClassName="text-xs font-medium tracking-tight text-primary"
					/>

					<div className="w-full lg:w-[200px]">
						<MultipleSelectInputVirtualized
							label="CIDADES"
							selected={filters.cities ?? []}
							options={AllCities}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => {
								updateFilters({ cities: value as string[], page: 1 });
							}}
							onReset={() => {
								updateFilters({ cities: [], page: 1 });
							}}
							width="100%"
							labelClassName="text-xs font-medium tracking-tight text-primary"
						/>
					</div>
					<div className="w-full lg:w-[200px]">
						<MultipleSelectInputVirtualized
							label="UFS"
							selected={filters.ufs ?? []}
							options={AllStates}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => {
								updateFilters({ ufs: value as string[], page: 1 });
							}}
							onReset={() => {
								updateFilters({ ufs: [], page: 1 });
							}}
							width="100%"
							labelClassName="text-xs font-medium tracking-tight text-primary"
						/>
					</div>

					<div className="w-full md:w-[250px]">
						<MultipleSelectInput
							label="AUTORES"
							options={authorSelectableOptions?.map((promoter) => ({ id: promoter._id || "", label: promoter.nome, value: promoter._id })) || null}
							selected={filters.authorIds ?? []}
							handleChange={(value) => updateFilters({ authorIds: value as string[], page: 1 })}
							resetOptionLabel="TODOS"
							onReset={() => updateFilters({ authorIds: [], page: 1 })}
							labelClassName="text-xs font-medium tracking-tight text-primary"
							width="100%"
						/>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}

export default FilterMenu;
