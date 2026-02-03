import { Code2, Database, FileText, Hash, ListChecks, Plus, Settings, ToggleLeft } from "lucide-react";
import { useState } from "react";
import { BsCalendarPlus } from "react-icons/bs";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { useCustomFields } from "@/utils/queries/custom-fields";
import type { TCustomField } from "@/utils/schemas/custom-fields.schema";
import { EditCustomField } from "../CustomFields/EditCustomField";
import { NewCustomField } from "../CustomFields/NewCustomField";
import { Button } from "../ui/button";
import Avatar from "../utils/Avatar";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";

// Helper function to get the appropriate icon for a field type
function getFieldTypeIcon(tipo: TCustomField["tipo"]) {
	// Text types
	if (["TEXTO", "TEXTO_LONGO", "EMAIL", "TELEFONE", "URL", "CPF", "CNPJ", "DOCUMENTO"].includes(tipo)) {
		return <FileText className="w-4 h-4 min-w-4 min-h-4" />;
	}
	// Numeric types
	if (["NÚMERO_INTEIRO", "NÚMERO_DECIMAL", "MOEDA", "PERCENTUAL"].includes(tipo)) {
		return <Hash className="w-4 h-4 min-w-4 min-h-4" />;
	}
	// Selection types
	if (["SELEÇÃO_ÚNICA", "SELEÇÃO_MÚLTIPLA"].includes(tipo)) {
		return <ListChecks className="w-4 h-4 min-w-4 min-h-4" />;
	}
	// Boolean
	if (tipo === "BOOLEAN") {
		return <ToggleLeft className="w-4 h-4 min-w-4 min-h-4" />;
	}
	// Date types
	if (["DATA", "DATA_HORA", "HORA"].includes(tipo)) {
		return <BsCalendarPlus className="w-4 h-4 min-w-4 min-h-4" />;
	}
	// Reference
	if (tipo === "REFERÊNCIA") {
		return <Code2 className="w-4 h-4 min-w-4 min-h-4" />;
	}
	// File types and others
	return <Settings className="w-4 h-4 min-w-4 min-h-4" />;
}

// Helper function to get field type display name
function getFieldTypeLabel(tipo: TCustomField["tipo"]) {
	const labels: Record<TCustomField["tipo"], string> = {
		TEXTO: "Texto",
		TEXTO_LONGO: "Texto Longo",
		EMAIL: "Email",
		TELEFONE: "Telefone",
		URL: "URL",
		CPF: "CPF",
		CNPJ: "CNPJ",
		DOCUMENTO: "Documento",
		NÚMERO_INTEIRO: "Número Inteiro",
		NÚMERO_DECIMAL: "Número Decimal",
		MOEDA: "Moeda",
		PERCENTUAL: "Percentual",
		SELEÇÃO_ÚNICA: "Seleção Única",
		SELEÇÃO_MÚLTIPLA: "Seleção Múltipla",
		BOOLEAN: "Sim/Não",
		DATA: "Data",
		DATA_HORA: "Data e Hora",
		HORA: "Hora",
		ARQUIVO: "Arquivo",
		IMAGEM: "Imagem",
		COR: "Cor",
		AVALIAÇÃO: "Avaliação",
		REFERÊNCIA: "Referência",
	};
	return labels[tipo] || tipo;
}

// Entity label helper
function getEntityLabel(entity: string) {
	const labels: Record<string, string> = {
		CLIENTES: "Clientes",
		OPORTUNIDADES: "Oportunidades",
		PROPOSTAS: "Propostas",
	};
	return labels[entity] || entity;
}

type CustomFieldsProps = {
	session: TUserSession;
};

function CustomFields({ session }: CustomFieldsProps) {
	// TODO: Add dedicated camposPersonalizados permission to the schema
	// For now, reusing tiposProjeto as it's a similar configuration-level permission
	const userHasCustomFieldEditingPermission = session.user.permissoes.configuracoes.tiposProjeto;
	const [newCustomFieldModalIsOpen, setNewCustomFieldModalIsOpen] = useState<boolean>(false);
	const { data: customFields, isSuccess, isLoading, isError } = useCustomFields();
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-primary/30 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className="text-lg font-bold uppercase">Campos Personalizados</h1>
					<p className="text-sm text-[#71717A]">Adicione campos personalizados para clientes, oportunidades e propostas</p>
				</div>
				{userHasCustomFieldEditingPermission && (
					<Button onClick={() => setNewCustomFieldModalIsOpen(true)} size={"xs"} className="flex items-center gap-1">
						<Plus className="w-4 h-4 min-w-4 min-h-4" />
						NOVO CAMPO
					</Button>
				)}
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar campos personalizados." /> : null}
				{isSuccess ? (
					customFields && customFields.length > 0 ? (
						customFields.map((field) => (
							<CustomFieldCard
								key={field._id.toString()}
								field={field}
								hasEditPermission={userHasCustomFieldEditingPermission}
								onEdit={() => setEditModal({ id: field._id, isOpen: true })}
							/>
						))
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
							Nenhum campo personalizado encontrado.
						</p>
					)
				) : null}
			</div>
			{newCustomFieldModalIsOpen ? <NewCustomField sessionUser={session.user} closeModal={() => setNewCustomFieldModalIsOpen(false)} /> : null}
			{editModal.isOpen && editModal.id ? (
				<EditCustomField sessionUser={session.user} customFieldId={editModal.id} closeModal={() => setEditModal({ id: null, isOpen: false })} />
			) : null}
		</div>
	);
}

export default CustomFields;

type CustomFieldCardProps = {
	field: TCustomField & { _id: string };
	hasEditPermission: boolean;
	onEdit: () => void;
};

function CustomFieldCard({ field, hasEditPermission, onEdit }: CustomFieldCardProps) {
	return (
		<div className="flex w-full flex-col rounded-md border border-primary/30 p-3">
			{/* Header */}
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex grow items-center gap-2">
					<div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black p-1">{getFieldTypeIcon(field.tipo)}</div>
					<div className="flex flex-col">
						{hasEditPermission ? (
							<button
								type="button"
								onClick={onEdit}
								className="cursor-pointer text-sm font-bold leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500 text-start"
							>
								{field.nome}
							</button>
						) : (
							<p className="text-sm font-bold leading-none tracking-tight">{field.nome}</p>
						)}
						<p className="text-xs text-primary/60 font-mono">{field.identificador}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{!field.ativo && <span className="rounded-full bg-red-500/20 px-2 py-1 text-[0.65rem] font-bold text-red-600 lg:text-xs">INATIVO</span>}
					<span className="rounded-full bg-primary/10 px-2 py-1 text-[0.65rem] font-medium text-primary lg:text-xs">{getFieldTypeLabel(field.tipo)}</span>
				</div>
			</div>

			{/* Description */}
			{field.descricao && <p className="mt-2 text-xs text-primary/70">{field.descricao}</p>}

			{/* Entities */}
			<div className="mt-2 flex w-full flex-col gap-1">
				<h2 className="text-xs font-medium text-primary/70">ENTIDADES</h2>
				<div className="flex w-full items-center justify-start gap-2 flex-wrap">
					{field.entidades.map((entity) => (
						<div key={entity} className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1">
							<Database className="w-3 h-3" />
							<span className="text-[0.65rem] font-medium">{getEntityLabel(entity)}</span>
							{field.obrigatorio?.[entity] && <span className="text-[0.55rem] text-orange-600 font-bold">*</span>}
						</div>
					))}
				</div>
			</div>

			{/* Footer */}
			<div className="mt-3 flex w-full items-center justify-between gap-2 border-t border-primary/10 pt-2">
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<BsCalendarPlus className="w-3 h-3" />
						<p className="text-xs font-medium text-primary/70">{formatDateAsLocale(field.dataInsercao, true)}</p>
					</div>
				</div>
				<div className="flex items-center justify-center gap-1">
					<Avatar fallback={"U"} height={20} width={20} url={field.autor?.avatar_url || undefined} />
					<p className="text-xs font-medium text-primary/70">{field.autor?.nome}</p>
				</div>
			</div>
		</div>
	);
}
