import CheckboxInput from "@/components/Inputs/CheckboxInput";
import MultipleSelectInput from "@/components/Inputs/MultipleSelectInput";
import SelectInput from "@/components/Inputs/SelectInput";
import SelectWithImages from "@/components/Inputs/SelectWithImages";
import TextInput from "@/components/Inputs/TextInput";
import { usePartnersSimplified } from "@/utils/queries/partners";
import { usePaymentMethods } from "@/utils/queries/payment-methods";
import { TSignaturePlan } from "@/utils/schemas/signature-plans.schema";
import { SignaturePlanIntervalTypes } from "@/utils/select-options";
import React from "react";

type GeneralInformationProps = {
	infoHolder: TSignaturePlan;
	setInfoHolder: React.Dispatch<React.SetStateAction<TSignaturePlan>>;
};
function GeneralInformation({ infoHolder, setInfoHolder }: GeneralInformationProps) {
	const { data: partners } = usePartnersSimplified();
	const { data: paymentMethods } = usePaymentMethods();

	return (
		<div className="flex w-full flex-col gap-1">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES GERAIS</h1>
			<div className="my-2 flex w-full items-center justify-center gap-2">
				<div className="w-fit">
					<CheckboxInput
						checked={infoHolder.ativo}
						labelFalse="PLANO ATIVADO"
						labelTrue="PLANO ATIVADO"
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, ativo: value }))}
						justify="justify-center"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="NOME DO PLANO"
						placeholder="Preencha o nome do plano..."
						value={infoHolder.nome}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="DESCRIÇÃO DO PLANO"
						placeholder="Preencha uma descrição para proposta..."
						value={infoHolder.descricao}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="TIPO DE RECORRÊNCIA"
						options={SignaturePlanIntervalTypes}
						value={infoHolder.intervalo.tipo}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, intervalo: { ...prev.intervalo, tipo: value } }))}
						resetOptionLabel="PADRÃO"
						onReset={() => setInfoHolder((prev) => ({ ...prev, intervalo: { ...prev.intervalo, tipo: "MENSAL" } }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<SelectWithImages
						label="VISIBILIDADE DE PARCEIRO"
						value={infoHolder.idParceiro || null}
						options={partners?.map((p) => ({ id: p._id, value: p._id, label: p.nome, url: p.logo_url || undefined })) || []}
						resetOptionLabel="TODOS"
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								idParceiro: value,
							}))
						}
						onReset={() =>
							setInfoHolder((prev) => ({
								...prev,
								idParceiro: null,
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<MultipleSelectInput
						label="MÉTODOS DE PAGAMENTO"
						selected={infoHolder.idsMetodologiasPagamento}
						options={
							paymentMethods?.map((type, index) => ({
								id: type._id,
								label: type.nome,
								value: type._id,
							})) || []
						}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value: string[] | []) =>
							setInfoHolder((prev) => ({
								...prev,
								idsMetodologiasPagamento: value,
							}))
						}
						onReset={() =>
							setInfoHolder((prev) => ({
								...prev,
								idsMetodologiasPagamento: [],
							}))
						}
						width="100%"
					/>
				</div>
			</div>
		</div>
	);
}

export default GeneralInformation;
