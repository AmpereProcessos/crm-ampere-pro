import type { TUserSession } from "@/lib/auth/session";
import { renderProposalPremisseField } from "@/premisses";
import { useDistanceData } from "@/utils/queries/utils";
import { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import { TProjectTypeDTO } from "@/utils/schemas/project-types.schema";
import { TProposal, TProposalPremisses } from "@/utils/schemas/proposal.schema";
import React, { useEffect } from "react";
import TechnicalAnalysisVinculation from "../TechnicalAnalysisVinculation";
type GeneralSizingProps = {
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	projectTypes: TProjectTypeDTO[];
	session: TUserSession;
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
	moveToNextStage: () => void;
};
function GeneralSizing({ opportunity, projectTypes, session, infoHolder, setInfoHolder, moveToNextStage }: GeneralSizingProps) {
	const userHasPricingEditPermission = session.user.permissoes.precos.editar;
	// Using the vinculated opportunity partner location reference as the origin city and uf
	const originCity = opportunity.parceiro?.localizacao.cidade || "ITUIUTABA";
	const originUF = opportunity.parceiro?.localizacao.uf || "MG";
	// Using the opportunity city and uf
	const destinationCity = opportunity.localizacao.cidade;
	const destinationUF = opportunity.localizacao.uf;
	const { data: distance } = useDistanceData({
		originCity: originCity,
		originUF: originUF,
		destinationCity: destinationCity,
		destinationUF: destinationUF,
	});
	function validateFields() {
		if (!userHasPricingEditPermission) setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, distancia: distance } }));
		return moveToNextStage();
	}
	useEffect(() => {
		if (distance) return setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, distancia: distance } }));
	}, [distance]);
	return (
		<>
			<div className="flex w-full flex-col gap-4 py-4">
				<div className="flex w-full flex-col gap-4">
					<div className="flex w-full items-center justify-center">
						<h1 className="text-center text-xs font-medium italic text-[#fead61] lg:text-base">
							Nessa etapa, por favor preencha informações que nos possibilitarão a realizar uma análise primária das necessidades e especificidades técnicas do
							projeto.
						</h1>
					</div>
					{projectTypes
						?.find((type) => type._id == opportunity.tipo.id)
						?.dimensionamento.map((category, categoryIndex) => (
							<div key={categoryIndex} className="flex w-full flex-col gap-1">
								<h1 className="justify-center text-center text-sm font-bold text-[#15599a]">{category.titulo}</h1>
								<div className="flex w-full flex-col flex-wrap items-center justify-center gap-2 lg:flex-row">
									{category.campos.map((field) => (
										<div className="flex w-full items-center justify-center lg:w-[48%]">
											{renderProposalPremisseField({
												field: field as keyof TProposalPremisses,
												value: infoHolder.premissas[field as keyof TProposalPremisses],
												handleChange: (value) => setInfoHolder((prev) => ({ ...prev, premissas: { ...prev.premissas, [field]: value } })),
											})}
										</div>
									))}
								</div>
							</div>
						))}

					<TechnicalAnalysisVinculation
						infoHolder={infoHolder}
						setInfoHolder={setInfoHolder}
						opportunityId={opportunity._id}
						userHasPricingViewPermission={session.user.permissoes.precos.visualizar}
					/>
				</div>
			</div>
			<div className="flex w-full items-center justify-end gap-2 px-1">
				<button onClick={() => validateFields()} className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground">
					Prosseguir
				</button>
			</div>
		</>
	);
}

export default GeneralSizing;
