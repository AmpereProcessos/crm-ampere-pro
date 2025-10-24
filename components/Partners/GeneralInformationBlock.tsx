import { formatToCPForCNPJ } from "@/utils/methods";
import { TPartner } from "@/utils/schemas/partner.schema";
import React from "react";
import TextInput from "../Inputs/TextInput";

type GeneralInformationBlockProps = {
	infoHolder: TPartner;
	setInfoHolder: React.Dispatch<React.SetStateAction<TPartner>>;
};
function GeneralInformationBlock({ infoHolder, setInfoHolder }: GeneralInformationBlockProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NOME DO PARCEIRO"
						placeholder="Preencha aqui o nome do novo parceiro..."
						value={infoHolder.nome}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="CPF/CNPJ DO PARCEIRO"
						placeholder="Preencha aqui o CPF ou CNPJ do novo parceiro..."
						value={infoHolder.cpfCnpj}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, cpfCnpj: formatToCPForCNPJ(value) }))}
						width="100%"
					/>
				</div>
			</div>
			<div className={`flex w-full flex-col gap-1`}>
				<label htmlFor={"description"} className={"font-sans font-bold  text-primary"}>
					DESCRIÇÃO DE APRESENTAÇÃO
				</label>

				<textarea
					value={infoHolder.descricao}
					onChange={(e) => setInfoHolder((prev) => ({ ...prev, descricao: e.target.value }))}
					id={"description"}
					placeholder={"Preencha um texto de apresentação do parceiro (a ser usado na proposta)..."}
					className="h-[125px] w-full resize-none rounded-md border border-primary/30 p-3 text-center text-sm outline-hidden placeholder:italic"
				/>
			</div>
			<TextInput
				label="SLOGAN"
				placeholder="Preencha aqui o slogan da empresa (a ser usado na proposta)..."
				value={infoHolder.slogan}
				handleChange={(value) => setInfoHolder((prev) => ({ ...prev, slogan: value }))}
				width="100%"
			/>
		</div>
	);
}

export default GeneralInformationBlock;
