import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { usePricingMethods } from "@/utils/queries/pricing-methods";
import { TSignaturePlan } from "@/utils/schemas/signature-plans.schema";
import React, { useState } from "react";

type PricingInformationProps = {
	infoHolder: TSignaturePlan;
	setInfoHolder: React.Dispatch<React.SetStateAction<TSignaturePlan>>;
};
function PricingInformation({ infoHolder, setInfoHolder }: PricingInformationProps) {
	const initialMode = infoHolder.preco != null ? "VALOR FIXO" : "CALCULADO";
	const [mode, setMode] = useState<"VALOR FIXO" | "CALCULADO">(initialMode);

	const { data: pricingMethods } = usePricingMethods();
	return (
		<div className="flex w-full flex-col gap-1">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">PRECIFICAÇÃO</h1>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="PREÇO BASE DO PLANO"
						placeholder="Preencha o valor fixo do plano..."
						value={infoHolder.preco || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, preco: value }))}
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
						onReset={() => setInfoHolder((prev) => ({ ...prev, idMetodologiaPrecificacao: "660de08225fee32a2237fa37" }))}
						resetOptionLabel="NÃO DEFINIDO"
						options={pricingMethods?.map((method) => ({ id: method._id, label: method.nome, value: method._id })) || null}
						width="100%"
					/>
				</div>
			</div>
		</div>
	);
}

export default PricingInformation;
