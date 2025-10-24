import ProposalService from "@/components/Cards/ProposalService";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { TPricingConditionData, TPricingVariableData, handlePricingCalculation } from "@/utils/pricing/methods";
import { useComercialServicesWithPricingMethod } from "@/utils/queries/services";
import { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import { TProposal, TProposalService } from "@/utils/schemas/proposal.schema";
import { TServiceDTOWithPricingMethod } from "@/utils/schemas/service.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { ImSad } from "react-icons/im";

type ServicesSelectionProps = {
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
	moveToNextStage: () => void;
	moveToPreviousStage: () => void;
	setApplicablePaymentMethodsIds: React.Dispatch<React.SetStateAction<string[]>>;

	session: TUserSession;
};
function ServicesSelection({
	opportunity,
	infoHolder,
	setInfoHolder,
	moveToNextStage,
	moveToPreviousStage,
	setApplicablePaymentMethodsIds,
	session,
}: ServicesSelectionProps) {
	const [selectedServices, setSelectedServices] = useState<(TServiceDTOWithPricingMethod & { valorFinal: number })[]>([]);
	const { data: services, isLoading, isError, isSuccess } = useComercialServicesWithPricingMethod();
	const userHasPricingView = session.user.permissoes.precos.visualizar;
	function selectService(service: TServiceDTOWithPricingMethod & { valorFinal: number }) {
		if (selectedServices.some((k) => k.idMetodologiaPrecificacao != service.idMetodologiaPrecificacao))
			return toast.error("Não é permitida a adição de serviços de diferentes metodologias de precificação.");
		const newSelectedServices = [...selectedServices];
		newSelectedServices.push(service);
		setSelectedServices([...newSelectedServices]);
		return toast.success("Serviço adicionado com sucesso !");
	}
	function handleProceed() {
		if (selectedServices.length == 0) return toast.error("Selecione ao menos um serviço para prosseguir.");
		const topology = infoHolder.premissas.topologia;
		const methodology = selectedServices[0].metodologia;
		const methodologyId = selectedServices[0].idMetodologiaPrecificacao;
		const paymentMethodsIds = [...new Set(selectedServices.flatMap((x) => x.idsMetodologiasPagamento))];

		const selectedServicesFormatted: TProposalService[] = selectedServices.map((service) => ({
			id: service._id,
			descricao: service.descricao,
			garantia: service.garantia,
			observacoes: service.observacoes,
			valor: service.valorFinal,
			preco: service.preco,
		}));
		const services = selectedServicesFormatted;
		const servicePrice = selectedServicesFormatted.reduce((acc, current) => acc + (current.preco || 0), 0);
		const conditionData: TPricingConditionData = {
			uf: opportunity.localizacao.uf,
			cidade: opportunity.localizacao.cidade,
			topologia: topology || "INVERSOR",
			tipoEstrutura: infoHolder.premissas.tipoEstrutura || "Fibrocimento",
			grupoInstalacao: infoHolder.premissas.grupoInstalacao || "RESIDENCIAL",
			faseamentoEletrico: infoHolder.premissas.faseamentoEletrico || "MONOFÁSICO",
			idParceiro: opportunity.idParceiro,
			numModulos: infoHolder.premissas.numModulos || 0,
			numInversores: infoHolder.premissas.numInversores || 0,
			potenciaPico: infoHolder.premissas.potenciaPico || 0,
			distancia: infoHolder.premissas.distancia || 0,
			valorReferencia: infoHolder.premissas.valorReferencia || 0,
			ativacaoReferencia: infoHolder.premissas.ativacaoReferencia || "NÃO",
		};
		const variableData: TPricingVariableData = {
			kit: 0,
			numModulos: infoHolder.premissas.numModulos || 0,
			product: 0,
			service: servicePrice,
			potenciaPico: infoHolder.premissas.potenciaPico || 0,
			distancia: infoHolder.premissas.distancia || 0,
			plan: 0,
			numInversores: infoHolder.premissas.numInversores || 0,
			valorReferencia: infoHolder.premissas.valorReferencia || 0,
			consumoEnergiaMensal: infoHolder.premissas.consumoEnergiaMensal || 0,
			tarifaEnergia: infoHolder.premissas.tarifaEnergia || 0,
			custosInstalacao: infoHolder.premissas.custosInstalacao || 0,
			custosPadraoEnergia: infoHolder.premissas.custosPadraoEnergia || 0,
			custosEstruturaInstalacao: infoHolder.premissas.custosEstruturaInstalacao || 0,
			custosOutros: infoHolder.premissas.custosOutros || 0,
		};

		const pricing = handlePricingCalculation({
			methodology: methodology,
			conditionData,
			variableData,
		});
		setApplicablePaymentMethodsIds(paymentMethodsIds);
		setInfoHolder((prev) => ({ ...prev, idMetodologiaPrecificacao: methodologyId, servicos: services, precificacao: pricing }));
		moveToNextStage();
	}
	console.log("SERVIÇOS SELECIONADOS", selectedServices);
	return (
		<div className="flex min-h-[400px] w-full flex-col gap-2 py-4">
			<div className="flex w-full items-center justify-center">
				<h1 className="text-center font-medium italic text-[#fead61]">
					Nessa etapa por favor escolha os serviços que melhor se adequem as necessidades desse projeto.
				</h1>
			</div>

			<div className="flex h-[600px] w-full grow overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				<div className="flex h-fit w-full flex-wrap items-stretch justify-center gap-2 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent /> : null}
					{isSuccess ? (
						services.length > 0 ? (
							services.map((service, index) => (
								<ProposalService
									index={index}
									selectedIds={selectedServices.map((s) => s._id)}
									key={service._id}
									service={service}
									opportunity={opportunity}
									proposal={infoHolder}
									handleSelect={(service) => selectService(service)}
									handleRemove={(index) => {
										const copy = [...selectedServices];
										copy.splice(index, 1);
										setSelectedServices(copy);
									}}
									userHasPricingView={userHasPricingView}
								/>
							))
						) : (
							<div className="flex flex-col items-center justify-center gap-4">
								<ImSad style={{ fontSize: "50px", color: "#fead61" }} />
								<p className="flex w-full items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
									Nenhum serviço encontrado.
								</p>
							</div>
						)
					) : null}
				</div>
			</div>
			<div className="flex w-full items-center justify-between gap-2 px-1">
				<button onClick={() => moveToPreviousStage()} className="rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105">
					Voltar
				</button>
				<button onClick={() => handleProceed()} className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground">
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default ServicesSelection;
