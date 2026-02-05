import { ArrowDown, ArrowUp, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { useCustomFields } from "@/utils/queries/custom-fields";
import { DEFAULT_KANBAN_CARD_BLOCKS, type TKanbanCardBlock, type TKanbanCardNativeBlockKey } from "@/utils/schemas/funnel.schema";

const NATIVE_BLOCK_LABELS: Record<TKanbanCardNativeBlockKey, string> = {
	TIPO_OPORTUNIDADE: "TIPO DE OPORTUNIDADE",
	PROPOSTA_ATIVA: "PROPOSTA ATIVA",
	RESPONSAVEIS_E_DATA: "RESPONSAVEIS E DATA",
	INFO_CLIENTE: "INFO DO CLIENTE",
	LOCALIZACAO: "LOCALIZACAO",
	SEGMENTO: "SEGMENTO",
};

const ALL_NATIVE_KEYS: TKanbanCardNativeBlockKey[] = ["TIPO_OPORTUNIDADE", "PROPOSTA_ATIVA", "RESPONSAVEIS_E_DATA", "INFO_CLIENTE", "LOCALIZACAO", "SEGMENTO"];

type FunnelCardConfigSectionProps = {
	blocks: TKanbanCardBlock[];
	setBlocks: React.Dispatch<React.SetStateAction<TKanbanCardBlock[]>>;
};

export default function FunnelCardConfigSection({ blocks, setBlocks }: FunnelCardConfigSectionProps) {
	const { data: customFieldsData } = useCustomFields({ initialFilters: { entities: ["OPORTUNIDADES"] } });
	const customFields = customFieldsData ?? [];

	function toggleBlock(index: number) {
		setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, ativo: !b.ativo } : b)));
	}

	function moveBlock(index: number, direction: "up" | "down") {
		setBlocks((prev) => {
			const arr = [...prev];
			const targetIndex = direction === "up" ? index - 1 : index + 1;
			if (targetIndex < 0 || targetIndex >= arr.length) return prev;
			[arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
			return arr.map((b, i) => ({ ...b, ordem: i }));
		});
	}

	function removeBlock(index: number) {
		setBlocks((prev) => {
			const arr = prev.filter((_, i) => i !== index);
			return arr.map((b, i) => ({ ...b, ordem: i }));
		});
	}

	function addNativeBlock(chave: TKanbanCardNativeBlockKey) {
		setBlocks((prev) => [...prev, { tipo: "NATIVO" as const, chave, ativo: true, ordem: prev.length }]);
	}

	function addCustomFieldBlock(fieldId: string) {
		setBlocks((prev) => [...prev, { tipo: "CAMPO_PERSONALIZADO" as const, campoPersonalizadoId: fieldId, ativo: true, ordem: prev.length }]);
	}

	const usedNativeKeys = blocks.filter((b): b is Extract<TKanbanCardBlock, { tipo: "NATIVO" }> => b.tipo === "NATIVO").map((b) => b.chave);
	const availableNativeKeys = ALL_NATIVE_KEYS.filter((k) => !usedNativeKeys.includes(k));

	const usedCustomFieldIds = blocks
		.filter((b): b is Extract<TKanbanCardBlock, { tipo: "CAMPO_PERSONALIZADO" }> => b.tipo === "CAMPO_PERSONALIZADO")
		.map((b) => b.campoPersonalizadoId);
	const availableCustomFields = customFields.filter((cf) => !usedCustomFieldIds.includes(cf._id));

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="CONFIGURACAO DO CARTAO" sectionTitleIcon={<LayoutDashboard className="w-4 h-4 min-w-4 min-h-4" />}>
			<p className="text-xs text-primary/60">Reordene, ative ou desative os blocos que aparecem nos cartoes do kanban.</p>

			{/* Configured blocks */}
			{blocks.length === 0 ? (
				<p className="text-xs italic text-primary/50 py-2 text-center">Nenhum bloco configurado.</p>
			) : (
				<div className="flex flex-col gap-1">
					{blocks.map((block, index) => {
						const label =
							block.tipo === "NATIVO"
								? NATIVE_BLOCK_LABELS[block.chave]
								: customFields.find((cf) => cf._id === block.campoPersonalizadoId)?.nome || block.campoPersonalizadoId;
						const typeLabel = block.tipo === "NATIVO" ? "Nativo" : "Campo Personalizado";

						return (
							<div
								key={block.tipo === "NATIVO" ? block.chave : block.campoPersonalizadoId}
								className="flex items-center justify-between rounded-md border border-primary/20 p-2 gap-2"
							>
								<div className="flex items-center gap-2 min-w-0 flex-1">
									<div className="flex flex-col gap-0.5 min-w-0">
										<p className="text-xs font-medium truncate">{label}</p>
										<p className="text-[0.6rem] text-primary/50">{typeLabel}</p>
									</div>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<button
										type="button"
										onClick={() => moveBlock(index, "up")}
										disabled={index === 0}
										className="p-1 rounded hover:bg-primary/10 disabled:opacity-30"
										title="Mover para cima"
									>
										<ArrowUp className="w-3.5 h-3.5" />
									</button>
									<button
										type="button"
										onClick={() => moveBlock(index, "down")}
										disabled={index === blocks.length - 1}
										className="p-1 rounded hover:bg-primary/10 disabled:opacity-30"
										title="Mover para baixo"
									>
										<ArrowDown className="w-3.5 h-3.5" />
									</button>
									<button
										type="button"
										onClick={() => toggleBlock(index)}
										className={`px-2 py-0.5 rounded text-[0.65rem] font-medium transition-colors ${
											block.ativo ? "bg-green-500/20 text-green-700 hover:bg-green-500/30" : "bg-red-500/20 text-red-700 hover:bg-red-500/30"
										}`}
									>
										{block.ativo ? "Ativo" : "Inativo"}
									</button>
									<button type="button" onClick={() => removeBlock(index)} className="p-1 rounded text-red-500 hover:bg-red-100" title="Remover bloco">
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Available native blocks */}
			{availableNativeKeys.length > 0 ? (
				<div className="flex flex-col gap-1.5">
					<p className="text-[0.65rem] font-medium text-primary/60 uppercase">Blocos nativos disponiveis</p>
					<div className="flex flex-wrap gap-1">
						{availableNativeKeys.map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => addNativeBlock(key)}
								className="flex items-center gap-1 px-2 py-1 rounded-md border border-primary/20 text-xs hover:bg-primary/10 transition-colors"
							>
								<Plus className="w-3 h-3" />
								{NATIVE_BLOCK_LABELS[key]}
							</button>
						))}
					</div>
				</div>
			) : null}

			{/* Available custom fields */}
			{availableCustomFields.length > 0 ? (
				<div className="flex flex-col gap-1.5">
					<p className="text-[0.65rem] font-medium text-primary/60 uppercase">Campos personalizados</p>
					<div className="flex flex-col gap-1">
						{availableCustomFields.map((cf) => (
							<div key={cf._id} className="flex items-center justify-between rounded-md border border-primary/10 p-2">
								<div className="flex flex-col gap-0.5 min-w-0">
									<p className="text-xs font-medium truncate">{cf.nome}</p>
									<p className="text-[0.6rem] text-primary/50">{cf.tipo}</p>
								</div>
								<button
									type="button"
									onClick={() => addCustomFieldBlock(cf._id)}
									className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-primary/10 hover:bg-primary/20 transition-colors shrink-0"
								>
									<Plus className="w-3 h-3" />
									Adicionar
								</button>
							</div>
						))}
					</div>
				</div>
			) : null}
		</ResponsiveDialogDrawerSection>
	);
}
