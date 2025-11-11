import { useQueryClient } from "@tanstack/react-query";
import { Plus, Send, Zap } from "lucide-react";
import { useState } from "react";
import { BsCalendarPlus } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import type { TGetAutomationsOutputDefault } from "@/app/api/automations/route";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { useAutomations } from "@/utils/queries/automations";
import { AutomationConfigurationActionTypes, AutomationConfigurationTriggerTypes } from "@/utils/select-options";
import UserGroup from "../Cards/UserGroup";
import EditAutomation from "../Modals/Automation/EditAutomation";
import NewAutomation from "../Modals/Automation/NewAutomation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import ErrorComponent from "../utils/ErrorComponent";
import GeneralQueryPaginationMenu from "../utils/GeneralQueryPaginationMenu";
import LoadingComponent from "../utils/LoadingComponent";

type AutomationsProps = {
	session: TUserSession;
};
function Automations({ session }: AutomationsProps) {
	const queryClient = useQueryClient();
	const [newAutomationModalIsOpen, setNewAutomationModalIsOpen] = useState<boolean>(false);
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	const { data: automationsResult, queryKey, isLoading, isSuccess, isError, filters, updateFilters } = useAutomations();

	const automations = automationsResult?.automations ?? [];
	const totalPages = automationsResult?.totalPages ?? 0;
	const automationsMatched = automationsResult?.automationsMatched ?? 0;
	const automationsShowing = automations.length;

	const handleOnMutate = async () => await queryClient.cancelQueries({ queryKey: queryKey });
	const handleOnSettle = async () => await queryClient.invalidateQueries({ queryKey: queryKey });
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-primary/30 pb-2 lg:flex-row gap-2">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold uppercase`}>Controle de automações</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite as automações.</p>
				</div>
				<Button onClick={() => setNewAutomationModalIsOpen(true)} size={"xs"} className="flex items-center gap-1">
					<Plus className="w-4 h-4 min-w-4 min-h-4" />
					NOVO AUTOMAÇÃO
				</Button>
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				<GeneralQueryPaginationMenu
					activePage={filters.page}
					selectPage={(page) => updateFilters({ page })}
					totalPages={totalPages}
					queryLoading={isLoading}
					itemsMatched={automationsMatched}
					itemsShowing={automationsShowing}
				/>
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar automações." /> : null}
				{isSuccess
					? automations.map((automation) => (
							<AutomationCard key={automation._id} automation={automation} openModal={(id) => setEditModal({ id: id, isOpen: true })} />
						))
					: null}
			</div>
			{newAutomationModalIsOpen ? (
				<NewAutomation
					session={session}
					closeModal={() => setNewAutomationModalIsOpen(false)}
					callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
				/>
			) : null}
			{editModal.id && editModal.isOpen ? (
				<EditAutomation
					session={session}
					automationId={editModal.id}
					closeModal={() => setEditModal({ id: null, isOpen: false })}
					callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
				/>
			) : null}
		</div>
	);
}

export default Automations;

function AutomationCard({ automation, openModal }: { automation: TGetAutomationsOutputDefault["automations"][number]; openModal: (id: string) => void }) {
	function getTriggerTypeLabel(triggerType: TGetAutomationsOutputDefault["automations"][number]["gatilho"]["tipo"]) {
		return AutomationConfigurationTriggerTypes.find((type) => type.value === triggerType)?.label;
	}
	function getActionTypeLabel(actionType: TGetAutomationsOutputDefault["automations"][number]["acao"]["tipo"]) {
		return AutomationConfigurationActionTypes.find((type) => type.value === actionType)?.label;
	}
	const triggerTypeLabel = getTriggerTypeLabel(automation.gatilho.tipo);
	const actionTypeLabel = getActionTypeLabel(automation.acao.tipo);
	return (
		<div className="flex w-full flex-col rounded-md border border-primary/30 p-2">
			<div className="flex w-full items-center justify-between gap-2 flex-col sm:flex-row">
				<div className="flex items-center gap-1">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
						<Zap className="w-4 h-4 min-w-4 min-h-4" />
					</div>
					<button
						onClick={() => openModal(automation._id)}
						type="button"
						className="cursor-pointer text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
					>
						{automation.titulo}
					</button>
				</div>
				<div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
					<div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10">
						<Zap className="w-3 h-3 min-w-3 min-h-3" />
						<p className="text-[0.7rem] font-medium text-primary/80">{triggerTypeLabel}</p>
					</div>
					<div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10">
						<Send className="w-3 h-3 min-w-3 min-h-3" />
						<p className="text-[0.7rem] font-medium text-primary/80">{actionTypeLabel}</p>
					</div>
				</div>
			</div>

			<div className="my-2 text-start text-xs tracking-tight text-primary/70">{automation.descricao || "NENHUMA DESCRIÇÃO DEFINIDA."}</div>

			<div className="flex w-full items-center justify-end gap-2">
				<div className="flex items-center gap-1">
					<Avatar className="h-6 min-h-6 w-6 min-w-6">
						<AvatarImage src={automation.autor.avatar_url || undefined} />
						<AvatarFallback>{formatNameAsInitials(automation.autor.nome)}</AvatarFallback>
					</Avatar>
					<p className="text-[0.65rem] font-medium text-primary/70">{automation.autor.nome}</p>
				</div>
			</div>
		</div>
	);
}
