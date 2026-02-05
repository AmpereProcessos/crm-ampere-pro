import { Info } from "lucide-react";
import type { TCreateCustomFieldInput } from "@/app/api/custom-fields/route";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextareaInput from "@/components/Inputs/TextareaInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { formatToSlug } from "@/lib/methods/formatting";

// Field type categories for organized display
export const FIELD_TYPE_OPTIONS = [
	// Text types
	{ id: "TEXTO", value: "TEXTO", label: "TEXTO" },
	{ id: "TEXTO_LONGO", value: "TEXTO_LONGO", label: "TEXTO LONGO" },
	{ id: "EMAIL", value: "EMAIL", label: "EMAIL" },
	{ id: "TELEFONE", value: "TELEFONE", label: "TELEFONE" },
	{ id: "URL", value: "URL", label: "URL" },
	{ id: "CPF", value: "CPF", label: "CPF" },
	{ id: "CNPJ", value: "CNPJ", label: "CNPJ" },
	{ id: "DOCUMENTO", value: "DOCUMENTO", label: "DOCUMENTO (CPF/CNPJ)" },
	// Numeric types
	{ id: "NÚMERO_INTEIRO", value: "NÚMERO_INTEIRO", label: "NÚMERO INTEIRO" },
	{ id: "NÚMERO_DECIMAL", value: "NÚMERO_DECIMAL", label: "NÚMERO DECIMAL" },
	{ id: "MOEDA", value: "MOEDA", label: "MOEDA" },
	{ id: "PERCENTUAL", value: "PERCENTUAL", label: "PERCENTUAL" },
	// Selection types
	{ id: "SELEÇÃO_ÚNICA", value: "SELEÇÃO_ÚNICA", label: "SELEÇÃO ÚNICA" },
	{ id: "SELEÇÃO_MÚLTIPLA", value: "SELEÇÃO_MÚLTIPLA", label: "SELEÇÃO MÚLTIPLA" },
	{ id: "BOOLEAN", value: "BOOLEAN", label: "SIM/NÃO" },
	// Date types
	{ id: "DATA", value: "DATA", label: "DATA" },
	{ id: "DATA_HORA", value: "DATA_HORA", label: "DATA HORA" },
	{ id: "HORA", value: "HORA", label: "HORA" },
	// File types
	{ id: "ARQUIVO", value: "ARQUIVO", label: "ARQUIVO" },
	{ id: "IMAGEM", value: "IMAGEM", label: "IMAGEM" },
	// Special types
	{ id: "COR", value: "COR", label: "COR" },
	{ id: "AVALIAÇÃO", value: "AVALIAÇÃO", label: "AVALIAÇÃO (ESTRELAS)" },
	{ id: "REFERÊNCIA", value: "REFERÊNCIA", label: "REFERÊNCIA" },
];

type BasicInfoBlockProps = {
	infoHolder: TCreateCustomFieldInput["customField"];
	updateInfoHolder: (updates: Partial<TCreateCustomFieldInput["customField"]>) => void;
};

export default function BasicInfoBlock({ infoHolder, updateInfoHolder }: BasicInfoBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="INFORMAÇÕES BÁSICAS" sectionTitleIcon={<Info className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="flex w-full items-center justify-center">
				<CheckboxInput
					labelTrue="CAMPO ATIVO"
					labelFalse="CAMPO INATIVO"
					checked={infoHolder.ativo}
					handleChange={(value) => updateInfoHolder({ ativo: value })}
				/>
			</div>

			<div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
				<TextInput
					label="NOME EXIBIDO (*)"
					value={infoHolder.nome}
					placeholder="ex: Data do Contrato"
					handleChange={(value) => updateInfoHolder({ nome: value, identificador: formatToSlug(value) })}
					width="100%"
				/>
				<TextInput
					label="IDENTIFICADOR (*)"
					value={infoHolder.identificador}
					placeholder="ex: data_contrato"
					handleChange={(value) => updateInfoHolder({ identificador: formatToSlug(value) })}
					width="100%"
				/>
			</div>

			<SelectInput
				label="TIPO DO CAMPO (*)"
				value={infoHolder.tipo}
				options={FIELD_TYPE_OPTIONS}
				handleChange={(value) => updateInfoHolder({ tipo: value })}
				onReset={() => updateInfoHolder({ tipo: "TEXTO" })}
				resetOptionLabel="TEXTO"
				width="100%"
			/>

			<TextareaInput
				label="DESCRIÇÃO"
				value={infoHolder.descricao || ""}
				placeholder="Descreva o propósito deste campo..."
				handleChange={(value) => updateInfoHolder({ descricao: value || undefined })}
			/>

			<TextInput
				label="PLACEHOLDER"
				value={infoHolder.placeholder || ""}
				placeholder="Texto de ajuda exibido no campo vazio..."
				handleChange={(value) => updateInfoHolder({ placeholder: value || undefined })}
				width="100%"
			/>
		</ResponsiveDialogDrawerSection>
	);
}
