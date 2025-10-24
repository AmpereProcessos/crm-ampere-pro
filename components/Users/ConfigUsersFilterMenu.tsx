import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { formatDateForInputValue } from "@/utils/methods";
import type { TUsersQueryFilters } from "@/utils/schemas/user.schema";
import { useState } from "react";
import CheckboxInput from "../Inputs/CheckboxInput";
import DateInput from "../Inputs/DateInput";
import SelectInput from "../Inputs/SelectInput";
import TextInput from "../Inputs/TextInput";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";

type ConfigUsersFilterMenuProps = {
	queryParams: TUsersQueryFilters;
	updateQueryParams: (params: Partial<TUsersQueryFilters>) => void;
	closeMenu: () => void;
};
function ConfigUsersFilterMenu({ queryParams, updateQueryParams, closeMenu }: ConfigUsersFilterMenuProps) {
	const [queryParamsHolder, setQueryParamsHolder] = useState<TUsersQueryFilters>(queryParams);
	return (
		<Sheet open onOpenChange={closeMenu}>
			<SheetContent>
				<div className="flex h-full w-full flex-col">
					<SheetHeader>
						<SheetTitle>FILTRAR USUÁRIOS</SheetTitle>
						<SheetDescription>Escolha aqui parâmetros para filtrar os usuários.</SheetDescription>
					</SheetHeader>

					<div className="flex h-full flex-col gap-y-4 overflow-y-auto overscroll-y-auto p-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
						<div className="flex w-full flex-col gap-2">
							<TextInput
								label="NOME"
								value={queryParamsHolder.name}
								placeholder={"Preenha aqui o nome do usuário para filtro."}
								handleChange={(value) => setQueryParamsHolder((prev) => ({ ...prev, name: value }))}
								width={"100%"}
							/>
							<TextInput
								label="EMAIL"
								value={queryParamsHolder.email}
								placeholder={"Preenha aqui o email do usuário para filtro."}
								handleChange={(value) => setQueryParamsHolder((prev) => ({ ...prev, email: value }))}
								width={"100%"}
							/>
						</div>
						<div className="flex w-full flex-col gap-2">
							<h1 className="w-full text-center text-[0.65rem] tracking-tight text-primary/80">FILTRO POR PENDÊNCIAS</h1>
							<div className="w-fit self-center">
								<CheckboxInput
									labelTrue="SOMENTE USUÁRIOS ATIVOS"
									labelFalse="SOMENTE USUÁRIOS ATIVOS"
									checked={queryParamsHolder.activeOnly}
									handleChange={(value) => setQueryParamsHolder((prev) => ({ ...prev, activeOnly: value }))}
								/>
							</div>
							<div className="w-fit self-center">
								<CheckboxInput
									labelTrue="SOMENTE USUÁRIOS NÃO DELETADOS"
									labelFalse="SOMENTE USUÁRIOS NÃO DELETADOS"
									checked={queryParamsHolder.nonDeletedOnly}
									handleChange={(value) => setQueryParamsHolder((prev) => ({ ...prev, nonDeletedOnly: value }))}
								/>
							</div>
						</div>
						<div className="flex w-full flex-col gap-2">
							<h1 className="w-full text-center text-[0.65rem] tracking-tight text-primary/80">FILTRO POR PERÍODO</h1>
							<DateInput
								label="DEPOIS DE"
								value={formatDateForInputValue(queryParamsHolder.period.after)}
								handleChange={(value) =>
									setQueryParamsHolder((prev) => ({ ...prev, period: { ...prev.period, after: formatDateOnInputChange(value) as string } }))
								}
								width="100%"
							/>
							<DateInput
								label="ANTES DE"
								value={formatDateForInputValue(queryParamsHolder.period.before)}
								handleChange={(value) =>
									setQueryParamsHolder((prev) => ({ ...prev, period: { ...prev.period, before: formatDateOnInputChange(value) as string } }))
								}
								width="100%"
							/>
							<SelectInput
								label="PARÂMETRO"
								value={queryParamsHolder.period.field}
								options={[
									{ id: 1, label: "DATA DE INSERÇÃO", value: "dataInsercao" },
									{ id: 2, label: "DATA DE INÍCIO DO AGENDAMENTO", value: "agendamentoInicio" },
									{ id: 3, label: "DATA DE FIM DO AGENDAMENTO", value: "agendamentoFim" },
									{ id: 4, label: "DATA DE INÍCIO DA EXECUÇÃO", value: "execucaoInicio" },
									{ id: 5, label: "DATA DE FIM DA EXECUÇÃO", value: "execucaoFim" },
									{ id: 6, label: "DATA DE CONCLUSÃO", value: "dataEfetivacao" },
								]}
								handleChange={(value) => setQueryParamsHolder((prev) => ({ ...prev, period: { ...prev.period, field: value } }))}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => setQueryParamsHolder((prev) => ({ ...prev, period: { ...prev.period, field: null } }))}
								width={"100%"}
							/>
						</div>
					</div>
					<Button
						onClick={() => {
							updateQueryParams({ ...queryParamsHolder, page: 1 });
							closeMenu();
						}}
					>
						FILTRAR
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}

export default ConfigUsersFilterMenu;
