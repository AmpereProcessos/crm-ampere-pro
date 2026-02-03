import type { TCustomField } from "@/utils/schemas/custom-fields.schema";
import CheckboxInput from "../Inputs/CheckboxInput";
import ColorInput from "../Inputs/ColorInput";
import DateInput from "../Inputs/DateInput";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import NumberInput from "../Inputs/NumberInput";
import SelectInput from "../Inputs/SelectInput";
import TextareaInput from "../Inputs/TextareaInput";
import TextInput from "../Inputs/TextInput";

type CustomFieldInputProps = {
	customField: TCustomField & { _id: string };
	value: unknown;
	onChange: (value: unknown) => void;
	editable?: boolean;
	showLabel?: boolean;
};

/**
 * Renders the appropriate input component based on the custom field type
 */
export function CustomFieldInput({ customField, value, onChange, editable = true, showLabel = true }: CustomFieldInputProps) {
	const { tipo, nome, validacao } = customField;

	// Text types
	if (["TEXTO", "EMAIL", "TELEFONE", "URL", "CPF", "CNPJ", "DOCUMENTO"].includes(tipo)) {
		return (
			<TextInput
				label={nome}
				showLabel={showLabel}
				value={typeof value === "string" ? value : ""}
				handleChange={(v) => onChange(v)}
				placeholder={customField.placeholder || `Digite ${nome.toLowerCase()}...`}
				editable={editable}
			/>
		);
	}

	// Long text type
	if (tipo === "TEXTO_LONGO") {
		return (
			<TextareaInput
				label={nome}
				value={typeof value === "string" ? value : ""}
				handleChange={(v) => onChange(v)}
				placeholder={customField.placeholder || `Digite ${nome.toLowerCase()}...`}
				editable={editable}
			/>
		);
	}

	// Numeric types
	if (["NÚMERO_INTEIRO", "NÚMERO_DECIMAL", "MOEDA", "PERCENTUAL"].includes(tipo)) {
		return (
			<NumberInput
				label={nome}
				showLabel={showLabel}
				value={typeof value === "number" ? value : value === "" ? null : null}
				handleChange={(v) => onChange(v)}
				placeholder={customField.placeholder || `Digite ${nome.toLowerCase()}...`}
				editable={editable}
			/>
		);
	}

	// Single selection type
	if (tipo === "SELEÇÃO_ÚNICA") {
		const options = validacao?.tipo === "selecao" ? validacao.opcoes : [];
		return (
			<SelectInput
				label={nome}
				showLabel={showLabel}
				value={typeof value === "string" ? value : null}
				handleChange={(v) => onChange(v)}
				resetOptionLabel="Selecione..."
				onReset={() => onChange(null)}
				editable={editable}
				options={options.map((opt) => ({
					id: opt.valor,
					label: opt.rotulo,
					value: opt.valor,
				}))}
			/>
		);
	}

	// Multiple selection type
	if (tipo === "SELEÇÃO_MÚLTIPLA") {
		const options = validacao?.tipo === "selecao" ? validacao.opcoes : [];
		const selectedValues = Array.isArray(value) ? (value as string[]) : [];
		return (
			<MultipleSelectInput
				label={nome}
				showLabel={showLabel}
				selected={selectedValues}
				handleChange={(newSelected: string[]) => onChange(newSelected)}
				onReset={() => onChange([])}
				editable={editable}
				resetOptionLabel="Selecione..."
				options={options.map((opt) => ({
					id: opt.valor,
					label: opt.rotulo,
					value: opt.valor,
				}))}
			/>
		);
	}

	// Boolean type
	if (tipo === "BOOLEAN") {
		return (
			<div className="flex flex-col gap-1">
				{showLabel && <span className="text-sm font-medium text-primary/80 tracking-tight">{nome}</span>}
				<CheckboxInput
					labelTrue="Sim"
					labelFalse="Não"
					checked={typeof value === "boolean" ? value : false}
					handleChange={(v) => onChange(v)}
					editable={editable}
				/>
			</div>
		);
	}

	// Date types
	if (["DATA", "DATA_HORA"].includes(tipo)) {
		return (
			<DateInput
				label={nome}
				showLabel={showLabel}
				value={typeof value === "string" ? value : undefined}
				handleChange={(v) => onChange(v)}
				editable={editable}
			/>
		);
	}

	// Color type
	if (tipo === "COR") {
		return (
			<ColorInput
				label={nome}
				showLabel={showLabel}
				value={typeof value === "string" ? value : ""}
				handleChange={(newValue) => onChange(newValue)}
				editable={editable}
			/>
		);
	}

	// Rating type (1-5 stars)
	if (tipo === "AVALIAÇÃO") {
		const ratingValue = typeof value === "number" ? value : 0;
		const inputId = `rating-${customField._id}`;
		return (
			<div className="flex flex-col gap-1">
				{showLabel && (
					<label htmlFor={inputId} className="text-sm font-medium text-primary/80 tracking-tight">
						{nome}
					</label>
				)}
				<div className="flex items-center gap-1" id={inputId}>
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							type="button"
							onClick={() => editable && onChange(star)}
							className={`text-2xl ${ratingValue >= star ? "text-yellow-500" : "text-gray-300"} ${editable ? "cursor-pointer hover:text-yellow-400" : ""}`}
							disabled={!editable}
						>
							★
						</button>
					))}
				</div>
			</div>
		);
	}

	// Default fallback - text input
	return (
		<TextInput
			label={nome}
			showLabel={showLabel}
			value={typeof value === "string" ? value : String(value ?? "")}
			handleChange={(v) => onChange(v)}
			placeholder={customField.placeholder || `Digite ${nome.toLowerCase()}...`}
			editable={editable}
		/>
	);
}

export default CustomFieldInput;
