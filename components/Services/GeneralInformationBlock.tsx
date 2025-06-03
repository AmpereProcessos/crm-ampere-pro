import React from "react";
import TextInput from "../Inputs/TextInput";
import { TService } from "@/utils/schemas/service.schema";
import NumberInput from "../Inputs/NumberInput";
import SelectInput from "../Inputs/SelectInput";
import { usePricingMethods } from "@/utils/queries/pricing-methods";
import CheckboxInput from "../Inputs/CheckboxInput";
import SelectWithImages from "../Inputs/SelectWithImages";
import { usePartnersSimplified } from "@/utils/queries/partners";
import { usePaymentMethods } from "@/utils/queries/payment-methods";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";

type GeneralInformationBlockProps = {
	infoHolder: TService;
	setInfoHolder: React.Dispatch<React.SetStateAction<TService>>;
};
function GeneralInformationBlock({ infoHolder, setInfoHolder }: GeneralInformationBlockProps) {
	const { data: pricingMethods } = usePricingMethods();
	const { data: partners } = usePartnersSimplified();
	const { data: paymentMethods } = usePaymentMethods();

	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES GERAIS</h1>
			<div className="flex w-full items-center justify-center gap-2 py-2">
				<div className="w-fit">
					<CheckboxInput
						checked={infoHolder.ativo}
						labelFalse="SERVIÇO ATIVADO"
						labelTrue="SERVIÇO ATIVADO"
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, ativo: value }))}
						justify="justify-center"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="DESCRIÇÃO DO SERVIÇO"
						placeholder="Preencha aqui o nome do fabricante do produto."
						value={infoHolder.descricao}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="VALOR BASE DO SERVIÇO"
						placeholder="Preencha aqui o valor base do serviço."
						value={infoHolder.preco || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, preco: value }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="GARANTIA DO SERVIÇO"
						placeholder="Preencha aqui o garantia do serviço."
						value={infoHolder.garantia || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, garantia: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<SelectInput
						label="METODOLOGIA DE PRECIFICAÇÃO"
						value={infoHolder.idMetodologiaPrecificacao ? infoHolder.idMetodologiaPrecificacao : null}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								idMetodologiaPrecificacao: value,
							}))
						}
						onReset={() =>
							// @ts-ignore
							setInfoHolder((prev) => ({ ...prev, idMetodologiaPrecificacao: "" }))
						}
						resetOptionLabel="NÃO DEFINIDO"
						options={pricingMethods?.map((method) => ({ id: method._id, label: method.nome, value: method._id })) || null}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
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
			</div>
		</div>
	);
}

export default GeneralInformationBlock;
