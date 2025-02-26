import CheckboxInput from "@/components/Inputs/CheckboxInput";
import type { TFileReference, TFileReferenceVinculations } from "@/utils/schemas/file-reference.schema";
import React from "react";
type FileReferencesVinculationsProps = {
	data: {
		idCliente?: TFileReference["idCliente"];
		idOportunidade?: TFileReference["idOportunidade"];
		idAnaliseTecnica?: TFileReference["idAnaliseTecnica"];
		idHomologacao?: TFileReference["idHomologacao"];
		idProjeto?: TFileReference["idProjeto"];
		idCompra?: TFileReference["idCompra"];
		idReceita?: TFileReference["idReceita"];
		idDespesa?: TFileReference["idDespesa"];
		idOrdemServico?: TFileReference["idOrdemServico"];
	};
	vinculations: TFileReferenceVinculations;
	updateReference: (info: Partial<TFileReference>) => void;
};
function FileReferencesVinculations({ data, vinculations, updateReference }: FileReferencesVinculationsProps) {
	console.log("VINCULATIONS", vinculations);
	console.log("DATA", data);
	return (
		<div className="flex w-full flex-wrap items-center justify-center gap-2">
			{vinculations?.clientId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR AO CLIENTE"
						labelTrue="VINCULAR AO CLIENTE"
						checked={!!data.idCliente}
						editable={!vinculations.clientId?.blocked}
						handleChange={(value) =>
							updateReference({
								idCliente: value ? vinculations.clientId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.opportunityId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR À OPORTUNIDADE"
						labelTrue="VINCULAR À OPORTUNIDADE"
						checked={!!data.idOportunidade}
						editable={!vinculations.opportunityId?.blocked}
						handleChange={(value) =>
							updateReference({
								idOportunidade: value ? vinculations.opportunityId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.technicalAnalysisId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR À ANÁLISE TÉCNICA"
						labelTrue="VINCULAR À ANÁLISE TÉCNICA"
						checked={!!data.idAnaliseTecnica}
						editable={!vinculations.technicalAnalysisId?.blocked}
						handleChange={(value) =>
							updateReference({
								idAnaliseTecnica: value ? vinculations.technicalAnalysisId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.homologationId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR À HOMOLOGAÇÃO"
						labelTrue="VINCULAR À HOMOLOGAÇÃO"
						checked={!!data.idHomologacao}
						editable={!vinculations.homologationId?.blocked}
						handleChange={(value) =>
							updateReference({
								idHomologacao: value ? vinculations.homologationId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.projectId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR AO PROJETO"
						labelTrue="VINCULAR AO PROJETO"
						checked={!!data.idProjeto}
						editable={!vinculations.projectId?.blocked}
						handleChange={(value) =>
							updateReference({
								idProjeto: value ? vinculations.projectId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.purchaseId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR À COMPRA"
						labelTrue="VINCULAR À COMPRA"
						checked={!!data.idCompra}
						editable={!vinculations.purchaseId?.blocked}
						handleChange={(value) =>
							updateReference({
								idCompra: value ? vinculations.purchaseId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.revenueId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR À RECEITA"
						labelTrue="VINCULAR À RECEITA"
						checked={!!data.idReceita}
						editable={!vinculations.revenueId?.blocked}
						handleChange={(value) =>
							updateReference({
								idReceita: value ? vinculations.revenueId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.expenseId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR À DESPESA"
						labelTrue="VINCULAR À DESPESA"
						checked={!!data.idDespesa}
						editable={!vinculations.expenseId?.blocked}
						handleChange={(value) =>
							updateReference({
								idDespesa: value ? vinculations.expenseId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
			{vinculations?.serviceOrderId ? (
				<div className="w-fit">
					<CheckboxInput
						labelFalse="VINCULAR À ORDEM DE SERVIÇO"
						labelTrue="VINCULAR À ORDEM DE SERVIÇO"
						checked={!!data.idOrdemServico}
						editable={!vinculations.serviceOrderId?.blocked}
						handleChange={(value) =>
							updateReference({
								idOrdemServico: value ? vinculations.serviceOrderId?.value : undefined,
							})
						}
					/>
				</div>
			) : null}
		</div>
	);
}

export default FileReferencesVinculations;
