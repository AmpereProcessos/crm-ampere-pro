import { Settings } from "lucide-react";
import type { TCreateCustomFieldInput } from "@/app/api/custom-fields/route";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { isNumericType, isSelectionType, isTextType, type TSelectionOptionWithId } from "./ValidationBlocks";

type DefaultValueBlockProps = {
	infoHolder: TCreateCustomFieldInput["customField"];
	updateInfoHolder: (updates: Partial<TCreateCustomFieldInput["customField"]>) => void;
	selectionOptions: TSelectionOptionWithId[];
};

export default function DefaultValueBlock({ infoHolder, updateInfoHolder, selectionOptions }: DefaultValueBlockProps) {
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="VALOR PADRÃO" sectionTitleIcon={<Settings className="w-4 h-4 min-w-4 min-h-4" />}>
			{isTextType(infoHolder.tipo) && (
				<TextInput
					label="VALOR PADRÃO"
					value={(infoHolder.valorPadrao as string) || ""}
					placeholder="Valor inicial do campo..."
					handleChange={(value) => updateInfoHolder({ valorPadrao: value || undefined })}
					width="100%"
				/>
			)}
			{isNumericType(infoHolder.tipo) && (
				<NumberInput
					label="VALOR PADRÃO"
					value={infoHolder.valorPadrao as number | null}
					placeholder="Ex: 0"
					handleChange={(value) => updateInfoHolder({ valorPadrao: value })}
					width="100%"
				/>
			)}
			{infoHolder.tipo === "BOOLEAN" && (
				<CheckboxInput
					labelTrue="VALOR PADRÃO: SIM"
					labelFalse="VALOR PADRÃO: NÃO"
					checked={(infoHolder.valorPadrao as boolean) || false}
					handleChange={(value) => updateInfoHolder({ valorPadrao: value })}
					justify="justify-start"
				/>
			)}
			{isSelectionType(infoHolder.tipo) && selectionOptions.length > 0 && (
				<SelectInput
					label="VALOR PADRÃO"
					value={(infoHolder.valorPadrao as string) || null}
					options={selectionOptions.map((opt) => ({ id: opt.valor, value: opt.valor, label: opt.rotulo }))}
					handleChange={(value) => updateInfoHolder({ valorPadrao: value })}
					onReset={() => updateInfoHolder({ valorPadrao: undefined })}
					resetOptionLabel="NENHUM"
					width="100%"
				/>
			)}
			{!isTextType(infoHolder.tipo) && !isNumericType(infoHolder.tipo) && infoHolder.tipo !== "BOOLEAN" && !isSelectionType(infoHolder.tipo) && (
				<p className="text-sm italic text-primary/50">Valor padrão não disponível para este tipo de campo.</p>
			)}
		</ResponsiveDialogDrawerSection>
	);
}
