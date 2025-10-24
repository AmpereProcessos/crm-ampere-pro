import TextareaInput from "@/components/Inputs/TextareaInput";
import TextInput from "@/components/Inputs/TextInput";
import { TRevenue } from "@/utils/schemas/revenues.schema";
import React from "react";
import RevenueCategoriesMenu from "./Utils/CategoriesMenu";

type RevenueGeneralInformationBlockProps = {
	infoHolder: TRevenue;
	setInfoHolder: React.Dispatch<React.SetStateAction<TRevenue>>;
};
function RevenueGeneralInformationBlock({ infoHolder, setInfoHolder }: RevenueGeneralInformationBlockProps) {
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground">INFORMAÇÕES GERAIS</h1>
			<div className="flex w-full flex-col gap-1">
				<TextInput
					label="TÍTULO DA RECEITA"
					placeholder="Preencha aqui o título a ser dado à receita..."
					value={infoHolder.titulo}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titulo: value }))}
					width="100%"
				/>
				<TextareaInput
					label="ANOTAÇÕES"
					placeholder="Preencha aqui, se necessário, anotações e informações relevantes, peculiaridades e observações acerca da receita..."
					value={infoHolder.anotacoes}
					handleChange={(value) => setInfoHolder((prev) => ({ ...prev, anotacoes: value }))}
				/>
				<RevenueCategoriesMenu infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			</div>
		</div>
	);
}

export default RevenueGeneralInformationBlock;
