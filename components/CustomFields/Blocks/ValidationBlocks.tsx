import { Code, FileText, Hash, ListChecks, Plus, Settings, Trash2 } from "lucide-react";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import ColorInput from "@/components/Inputs/ColorInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TCustomField, TSelectOption } from "@/utils/schemas/custom-fields.schema";
import { ENTITY_OPTIONS } from "./EntityConfigBlock";

// Helper functions to determine field categories
export const isTextType = (tipo: TCustomField["tipo"]) => ["TEXTO", "TEXTO_LONGO", "EMAIL", "TELEFONE", "URL", "CPF", "CNPJ", "DOCUMENTO"].includes(tipo);

export const isNumericType = (tipo: TCustomField["tipo"]) => ["NÚMERO_INTEIRO", "NÚMERO_DECIMAL", "MOEDA", "PERCENTUAL"].includes(tipo);

export const isSelectionType = (tipo: TCustomField["tipo"]) => ["SELEÇÃO_ÚNICA", "SELEÇÃO_MÚLTIPLA"].includes(tipo);

export const isDateType = (tipo: TCustomField["tipo"]) => ["DATA", "DATA_HORA", "HORA"].includes(tipo);

export const isFileType = (tipo: TCustomField["tipo"]) => ["ARQUIVO", "IMAGEM"].includes(tipo);

export const isReferenceType = (tipo: TCustomField["tipo"]) => tipo === "REFERÊNCIA";

// Validation state types
export type TTextValidation = {
	minCaracteres: number | undefined;
	maxCaracteres: number | undefined;
	padrao: string | undefined;
	mascara: string | undefined;
};

export type TNumberValidation = {
	minimo: number | undefined;
	maximo: number | undefined;
	casasDecimais: number | undefined;
	permitirNegativo: boolean;
};

export type TDateValidation = {
	permitirPassado: boolean;
	permitirFuturo: boolean;
};

export type TFileValidation = {
	tamanhoMaximoMB: number;
	multiplosArquivos: boolean;
	maxArquivos: number;
};

export type TSelectionValidation = {
	permitirOutros: boolean;
	minSelecoes: number | undefined;
	maxSelecoes: number | undefined;
};

export type TReferenceValidation = {
	entidadeReferenciada: "CLIENTES" | "OPORTUNIDADES" | "PROPOSTAS";
	multiplosValores: boolean;
};

export type TSelectionOptionWithId = TSelectOption & { _internalId: string };

// --- Text Validation Block ---
type TextValidationBlockProps = {
	validation: TTextValidation;
	setValidation: React.Dispatch<React.SetStateAction<TTextValidation>>;
};

export function TextValidationBlock({ validation, setValidation }: TextValidationBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="VALIDAÇÃO DE TEXTO" sectionTitleIcon={<FileText className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
				<NumberInput
					label="MÍNIMO DE CARACTERES"
					value={validation.minCaracteres ?? null}
					placeholder="Ex: 3"
					handleChange={(value) => setValidation((prev) => ({ ...prev, minCaracteres: value || undefined }))}
					width="100%"
				/>
				<NumberInput
					label="MÁXIMO DE CARACTERES"
					value={validation.maxCaracteres ?? null}
					placeholder="Ex: 100"
					handleChange={(value) => setValidation((prev) => ({ ...prev, maxCaracteres: value || undefined }))}
					width="100%"
				/>
			</div>
			{/* <TextInput
				label="PADRÃO (REGEX)"
				value={validation.padrao || ""}
				placeholder="Ex: ^[A-Z].*"
				handleChange={(value) => setValidation((prev) => ({ ...prev, padrao: value || undefined }))}
				width="100%"
			/>
			<TextInput
				label="MÁSCARA"
				value={validation.mascara || ""}
				placeholder="Ex: (##) #####-####"
				handleChange={(value) => setValidation((prev) => ({ ...prev, mascara: value || undefined }))}
				width="100%"
			/> */}
		</ResponsiveDialogDrawerSection>
	);
}

// --- Number Validation Block ---
type NumberValidationBlockProps = {
	validation: TNumberValidation;
	setValidation: React.Dispatch<React.SetStateAction<TNumberValidation>>;
};

export function NumberValidationBlock({ validation, setValidation }: NumberValidationBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="VALIDAÇÃO NUMÉRICA" sectionTitleIcon={<Hash className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
				<NumberInput
					label="VALOR MÍNIMO"
					value={validation.minimo ?? null}
					placeholder="Ex: 0"
					handleChange={(value) => setValidation((prev) => ({ ...prev, minimo: value }))}
					width="100%"
				/>
				<NumberInput
					label="VALOR MÁXIMO"
					value={validation.maximo ?? null}
					placeholder="Ex: 1000"
					handleChange={(value) => setValidation((prev) => ({ ...prev, maximo: value }))}
					width="100%"
				/>
			</div>
			<div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
				<NumberInput
					label="CASAS DECIMAIS"
					value={validation.casasDecimais ?? null}
					placeholder="Ex: 2"
					handleChange={(value) => setValidation((prev) => ({ ...prev, casasDecimais: value }))}
					width="100%"
				/>
				<div className="flex items-end pb-2">
					<CheckboxInput
						labelTrue="PERMITIR NEGATIVOS"
						labelFalse="NÃO PERMITIR NEGATIVOS"
						checked={validation.permitirNegativo}
						handleChange={(value) => setValidation((prev) => ({ ...prev, permitirNegativo: value }))}
						justify="justify-start"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

// --- Selection Options Block ---
type SelectionOptionsBlockProps = {
	tipo: TCustomField["tipo"];
	options: TSelectionOptionWithId[];
	addOption: () => void;
	updateOption: (id: string, updates: Partial<TSelectOption>) => void;
	removeOption: (id: string) => void;
	validation: TSelectionValidation;
	setValidation: React.Dispatch<React.SetStateAction<TSelectionValidation>>;
};

export function SelectionOptionsBlock({ tipo, options, addOption, updateOption, removeOption, validation, setValidation }: SelectionOptionsBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="OPÇÕES DE SELEÇÃO" sectionTitleIcon={<ListChecks className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="flex flex-col gap-3">
				{options.map((option) => (
					<div key={option._internalId} className="flex items-start gap-2 rounded-md border border-primary/20 p-3">
						<div className="flex-1 grid grid-cols-1 gap-2 lg:grid-cols-3">
							<TextInput
								label="VALOR"
								value={option.valor}
								placeholder="valor_interno"
								handleChange={(value) => updateOption(option._internalId, { valor: value })}
								width="100%"
							/>
							<TextInput
								label="RÓTULO"
								value={option.rotulo}
								placeholder="Texto Exibido"
								handleChange={(value) => updateOption(option._internalId, { rotulo: value })}
								width="100%"
							/>
							<ColorInput
								label="COR"
								value={option.cor || ""}
								handleChange={(value) => updateOption(option._internalId, { cor: value || undefined })}
								width="100%"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-100"
							onClick={() => removeOption(option._internalId)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				))}

				<Button type="button" variant="ghost" className="w-full" onClick={addOption}>
					<Plus className="mr-2 h-4 w-4" />
					ADICIONAR OPÇÃO
				</Button>
			</div>

			<div className="mt-3 flex flex-col gap-2 rounded-md border border-primary/20 p-3">
				<p className="text-xs font-medium text-primary/70">CONFIGURAÇÕES ADICIONAIS</p>
				<CheckboxInput
					labelTrue="PERMITIR VALORES PERSONALIZADOS"
					labelFalse="PERMITIR VALORES PERSONALIZADOS"
					checked={validation.permitirOutros}
					handleChange={(value) => setValidation((prev) => ({ ...prev, permitirOutros: value }))}
					justify="justify-start"
					padding="0"
				/>
				{tipo === "SELEÇÃO_MÚLTIPLA" && (
					<div className="grid grid-cols-1 gap-2 lg:grid-cols-2 mt-2">
						<NumberInput
							label="MÍNIMO DE SELEÇÕES"
							value={validation.minSelecoes ?? null}
							placeholder="Ex: 1"
							handleChange={(value) => setValidation((prev) => ({ ...prev, minSelecoes: value || undefined }))}
							width="100%"
						/>
						<NumberInput
							label="MÁXIMO DE SELEÇÕES"
							value={validation.maxSelecoes ?? null}
							placeholder="Ex: 5"
							handleChange={(value) => setValidation((prev) => ({ ...prev, maxSelecoes: value || undefined }))}
							width="100%"
						/>
					</div>
				)}
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

// --- Date Validation Block ---
type DateValidationBlockProps = {
	validation: TDateValidation;
	setValidation: React.Dispatch<React.SetStateAction<TDateValidation>>;
};

export function DateValidationBlock({ validation, setValidation }: DateValidationBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="VALIDAÇÃO DE DATA" sectionTitleIcon={<Settings className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="flex flex-wrap gap-4">
				<CheckboxInput
					labelTrue="PERMITIR DATAS PASSADAS"
					labelFalse="NÃO PERMITIR DATAS PASSADAS"
					checked={validation.permitirPassado}
					handleChange={(value) => setValidation((prev) => ({ ...prev, permitirPassado: value }))}
					justify="justify-start"
				/>
				<CheckboxInput
					labelTrue="PERMITIR DATAS FUTURAS"
					labelFalse="NÃO PERMITIR DATAS FUTURAS"
					checked={validation.permitirFuturo}
					handleChange={(value) => setValidation((prev) => ({ ...prev, permitirFuturo: value }))}
					justify="justify-start"
				/>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

// --- File Validation Block ---
type FileValidationBlockProps = {
	validation: TFileValidation;
	setValidation: React.Dispatch<React.SetStateAction<TFileValidation>>;
};

export function FileValidationBlock({ validation, setValidation }: FileValidationBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="VALIDAÇÃO DE ARQUIVO" sectionTitleIcon={<FileText className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
				<NumberInput
					label="TAMANHO MÁXIMO (MB)"
					value={validation.tamanhoMaximoMB}
					placeholder="Ex: 10"
					handleChange={(value) => setValidation((prev) => ({ ...prev, tamanhoMaximoMB: value || 10 }))}
					width="100%"
				/>
				<NumberInput
					label="MÁXIMO DE ARQUIVOS"
					value={validation.maxArquivos}
					placeholder="Ex: 5"
					handleChange={(value) => setValidation((prev) => ({ ...prev, maxArquivos: value || 5 }))}
					width="100%"
				/>
			</div>
			<CheckboxInput
				labelTrue="PERMITIR MÚLTIPLOS ARQUIVOS"
				labelFalse="APENAS UM ARQUIVO"
				checked={validation.multiplosArquivos}
				handleChange={(value) => setValidation((prev) => ({ ...prev, multiplosArquivos: value }))}
				justify="justify-start"
			/>
		</ResponsiveDialogDrawerSection>
	);
}

// --- Reference Config Block ---
type ReferenceConfigBlockProps = {
	validation: TReferenceValidation;
	setValidation: React.Dispatch<React.SetStateAction<TReferenceValidation>>;
};

export function ReferenceConfigBlock({ validation, setValidation }: ReferenceConfigBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="CONFIGURAÇÃO DE REFERÊNCIA" sectionTitleIcon={<Code className="w-4 h-4 min-w-4 min-h-4" />}>
			<SelectInput
				label="ENTIDADE REFERENCIADA"
				value={validation.entidadeReferenciada}
				options={ENTITY_OPTIONS}
				handleChange={(value) => setValidation((prev) => ({ ...prev, entidadeReferenciada: value }))}
				onReset={() => setValidation((prev) => ({ ...prev, entidadeReferenciada: "CLIENTES" }))}
				resetOptionLabel="CLIENTES"
				width="100%"
			/>
			<CheckboxInput
				labelTrue="PERMITIR MÚLTIPLAS REFERÊNCIAS"
				labelFalse="APENAS UMA REFERÊNCIA"
				checked={validation.multiplosValores}
				handleChange={(value) => setValidation((prev) => ({ ...prev, multiplosValores: value }))}
				justify="justify-start"
			/>
		</ResponsiveDialogDrawerSection>
	);
}
