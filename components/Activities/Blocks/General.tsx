import DateTimeInput from "@/components/Inputs/DateTimeInput";
import TextareaInput from "@/components/Inputs/TextareaInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatDateInputChange, formatDateTime } from "@/lib/methods/formatting";
import type { TActivity } from "@/utils/schemas/activities.schema";
import { useActivityStore } from "@/utils/stores/activity-store";
import { ListTodo } from "lucide-react";

function ActivityGeneralBlock() {
	const title = useActivityStore((s) => s.activity.titulo);
	const description = useActivityStore((s) => s.activity.descricao);
	const deadline = useActivityStore((s) => s.activity.dataVencimento);
	const conclusion = useActivityStore((s) => s.activity.dataConclusao);
	const updateActivity = useActivityStore((s) => s.updateActivity);

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
				<ListTodo size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES GERAIS</h1>
			</div>
			<div className="flex w-full flex-col gap-3">
				<TextInput
					label="TÍTULO DA ATIVIDADE"
					value={title}
					handleChange={(value) => updateActivity({ titulo: value })}
					placeholder="Preencha aqui o titulo a ser dado à atividade..."
					width="100%"
				/>

				<TextareaInput
					label="DESCRIÇÃO DA ATIVIDADE"
					value={description}
					handleChange={(value) => updateActivity({ descricao: value })}
					placeholder="Preencha aqui uma descrição mais específica da atividade a ser feita..."
				/>
				<DateTimeInput
					label="DATA DE VENCIMENTO"
					value={formatDateTime(deadline)}
					handleChange={(value) => updateActivity({ dataVencimento: formatDateInputChange(value, "string", false) as string })}
					width="100%"
				/>
				<DateTimeInput
					label="DATA DE CONCLUSÃO"
					value={formatDateTime(conclusion)}
					handleChange={(value) => updateActivity({ dataConclusao: formatDateInputChange(value, "string", false) as string })}
					width="100%"
				/>
			</div>
		</div>
	);
}

export default ActivityGeneralBlock;
