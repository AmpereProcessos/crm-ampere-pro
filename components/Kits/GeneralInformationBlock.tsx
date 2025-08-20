import { TKit, TKitDTO } from "@/utils/schemas/kits.schema";
import React from "react";
import CheckboxInput from "../Inputs/CheckboxInput";
import TextInput from "../Inputs/TextInput";
import SelectInput from "../Inputs/SelectInput";
import NumberInput from "../Inputs/NumberInput";
import MultipleSelectInput from "../Inputs/MultipleSelectInput";
import { TPricingMethodDTO } from "@/utils/schemas/pricing-method.schema";
import { StructureTypes } from "@/utils/select-options";
import { formatDateForInputValue } from "@/utils/methods";
import DateInput from "../Inputs/DateInput";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { TNewKit } from "../Modals/Kit/NewKit";
import { usePartnersSimplified } from "@/utils/queries/partners";
import SelectWithImages from "../Inputs/SelectWithImages";
import { usePaymentMethods } from "@/utils/queries/payment-methods";

type GeneralInformationBlockProps = {
	infoHolder: TKit;
	setInfoHolder: React.Dispatch<React.SetStateAction<TKit>>;
	pricingMethods: TPricingMethodDTO[];
};
function GeneralInformationBlock({ infoHolder, setInfoHolder, pricingMethods }: GeneralInformationBlockProps) {
	console.log("KIT", infoHolder);
	const { data: partners } = usePartnersSimplified();
	const { data: paymentMethods } = usePaymentMethods();
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES GERAIS</h1>
			<div className="flex w-full flex-col gap-1">
				<div className="flex w-full items-center justify-center gap-2">
					<div className="w-fit">
						<CheckboxInput
							checked={infoHolder.ativo}
							labelFalse="KIT DESATIVADO"
							labelTrue="KIT ATIVADO"
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, ativo: value }))}
							justify="justify-center"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NOME DO KIT"
							placeholder="Preencha aqui o nome a ser dado ao kit."
							value={infoHolder.nome}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="TOPOLOGIA"
							value={infoHolder.topologia ? infoHolder.topologia : null}
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									topologia: value,
								}))
							}
							onReset={() => setInfoHolder((prev) => ({ ...prev, topologia: "MICRO-INVERSOR" }))}
							resetOptionLabel="NÃO DEFINIDO"
							options={[
								{ id: 1, label: "INVERSOR", value: "INVERSOR" },
								{
									id: 2,
									label: "MICRO-INVERSOR",
									value: "MICRO-INVERSOR",
								},
							]}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="PREÇO"
							value={infoHolder.preco}
							placeholder="PREÇO DO KIT"
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, preco: Number(value) }))}
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
							onReset={() => setInfoHolder((prev) => ({ ...prev, idMetodologiaPrecificacao: "660dab0b0fcb72da4ed8c35e" }))}
							resetOptionLabel="NÃO DEFINIDO"
							options={pricingMethods?.map((method) => ({ id: method._id, label: method.nome, value: method._id })) || []}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
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
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<MultipleSelectInput
							label="ESTRUTURAS COMPATÍVEIS"
							selected={infoHolder.estruturasCompativeis}
							options={StructureTypes.map((type, index) => ({
								...type,
								id: index + 1,
							}))}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value: string[] | []) =>
								setInfoHolder((prev) => ({
									...prev,
									estruturasCompativeis: value,
								}))
							}
							onReset={() =>
								setInfoHolder((prev) => ({
									...prev,
									estruturasCompativeis: [],
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<DateInput
							label="DATA DE VALIDADE (SE HOUVER)"
							value={formatDateForInputValue(infoHolder.dataValidade)}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, dataValidade: formatDateOnInputChange(value) }))}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GeneralInformationBlock;
