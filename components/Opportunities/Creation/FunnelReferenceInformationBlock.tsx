import DropdownSelect from "@/components/Inputs/DropdownSelect";
import SelectInput from "@/components/Inputs/SelectInput";
import { TGetOpportunitiesQueryDefinitionsOutput } from "@/pages/api/opportunities/query-definitions";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TFunnelDTO } from "@/utils/schemas/funnel.schema";
import React, { type Dispatch, type SetStateAction } from "react";
import { BsFillFunnelFill } from "react-icons/bs";
function getCurrentActiveFunnelOptions(funnelId: number | string, funnels: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterOptions"]["funnels"]) {
	const funnel = funnels.filter((funnel) => funnel.id === funnelId)[0];
	return funnel?.stages.map((stage) => ({
		id: stage.id,
		label: stage.label,
		value: stage.id,
	})) ?? [];
}

type FunnelReferenceInformationBlockProps = {
	funnelReference: TFunnelReference;
	setFunnelReference: Dispatch<SetStateAction<TFunnelReference>>;
	funnels: TGetOpportunitiesQueryDefinitionsOutput["data"]["filterOptions"]["funnels"];
};
function FunnelReferenceInformationBlock({ funnelReference, setFunnelReference, funnels }: FunnelReferenceInformationBlockProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<BsFillFunnelFill size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DO FUNIL</h1>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<SelectInput
						label="FUNIL"
						options={funnels.map((funnel) => ({
							id: funnel.id,
							label: funnel.label,
							value: funnel.id,
						}))}
						value={funnelReference.idFunil || null}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(selected) => {
							const selectedFunnel = funnels.find((f) => f.id === selected);
							const firstStage = selectedFunnel?.stages[0].id || "";
							setFunnelReference((prev) => ({ ...prev, idFunil: selected, idEstagioFunil: firstStage.toString() }));
						}}
						onReset={() => setFunnelReference((prev) => ({ ...prev, idFunil: "" }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<SelectInput
						label="ETAPA"
						options={funnelReference.idFunil ? getCurrentActiveFunnelOptions(funnelReference.idFunil, funnels) : null}
						value={funnelReference.idEstagioFunil || null}
						resetOptionLabel="ETAPA NÃO DEFINIDA"
						handleChange={(selected) => {
							setFunnelReference((prev) => ({ ...prev, idEstagioFunil: selected.toString() }));
						}}
						onReset={() => setFunnelReference((prev) => ({ ...prev, idEstagioFunil: "" }))}
						width="100%"
					/>
					{/* <DropdownSelect
          categoryName="ETAPA"
          resetOptionLabel="ETAPA NÃO DEFINIDA"
          options={funnelReference.idFunil ? getCurrentActiveFunnelOptions(funnelReference.idFunil, funnels) : null}
          value={funnelReference.idEstagioFunil || null}
          onChange={(selected) => setFunnelReference((prev) => ({ ...prev, idEstagioFunil: selected.value.toString() }))}
          onReset={() => setFunnelReference((prev) => ({ ...prev, idEstagioFunil: '' }))}
          width="100%"
        /> */}
				</div>
			</div>
		</div>
	);
}

export default FunnelReferenceInformationBlock;
