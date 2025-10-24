import { formatDateAsLocale } from "@/lib/methods/formatting";
import { formatToMoney } from "@/utils/methods";
import { TPricingConditionData, TPricingVariableData, getPricingTotal, handlePricingCalculation } from "@/utils/pricing/methods";
import { TOpportunityDTO } from "@/utils/schemas/opportunity.schema";
import { TPricingItem, TProposal } from "@/utils/schemas/proposal.schema";
import { TSignaturePlanDTOWithPricingMethod } from "@/utils/schemas/signature-plans.schema";
import { AiOutlineSafety } from "react-icons/ai";
import { BsCalendarPlus } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { MdAttachMoney, MdOutlineMiscellaneousServices, MdOutlineRemove, MdReplay, MdSell } from "react-icons/md";

function getBarColor({ active }: { active: boolean }) {
	if (!active) return "bg-primary/50";
	return "bg-blue-500";
}
function getStatusTag({ planId, selectedIds }: { planId: string; selectedIds: string[] }) {
	if (selectedIds.includes(planId))
		return <h1 className="rounded-full bg-green-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs">SELECIONADO</h1>;
	return <h1 className="rounded-full bg-primary/60 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs">NÃO SELECIONADO</h1>;
}
type ProposalSignaturePlanProps = {
	index: number;
	selectedIds: string[];
	plan: TSignaturePlanDTOWithPricingMethod;
	proposal: TProposal;
	opportunity: TOpportunityDTO;
	handleSelect: (id: TSignaturePlanDTOWithPricingMethod & { valorFinal: number; precificacao: TPricingItem[] }) => void;
	handleRemove: (index: number) => void;
	userHasPricingView: boolean;
};
function ProposalSignaturePlan({
	index,
	selectedIds,
	plan,
	proposal,
	opportunity,
	handleSelect,
	handleRemove,
	userHasPricingView,
}: ProposalSignaturePlanProps) {
	// Getting proposal total preview
	const conditionData: TPricingConditionData = {
		uf: opportunity.localizacao.uf,
		cidade: opportunity.localizacao.cidade,
		topologia: proposal.premissas.topologia || "INVERSOR",
		grupoInstalacao: proposal.premissas.grupoInstalacao || "RESIDENCIAL",
		tipoEstrutura: proposal.premissas.tipoEstrutura || "Fibrocimento",
		faseamentoEletrico: proposal.premissas.faseamentoEletrico || "MONOFÁSICO",
		idParceiro: opportunity.idParceiro,
		numModulos: proposal.premissas.numModulos || 0,
		numInversores: proposal.premissas.numInversores || 0,
		potenciaPico: proposal.premissas.potenciaPico || 0,
		distancia: proposal.premissas.distancia || 0,
		valorReferencia: proposal.premissas.valorReferencia || 0,
		ativacaoReferencia: proposal.premissas.ativacaoReferencia || "NÃO",
	};
	const variableData: TPricingVariableData = {
		kit: 0,
		plan: plan.preco,
		numModulos: proposal.premissas.numModulos || 0,
		product: 0,
		service: 0,
		numInversores: proposal.premissas.numInversores || 0,
		potenciaPico: proposal.premissas.potenciaPico || 0,
		distancia: proposal.premissas.distancia || 0,
		valorReferencia: proposal.premissas.valorReferencia || 0,
		consumoEnergiaMensal: proposal.premissas.consumoEnergiaMensal || 0,
		tarifaEnergia: proposal.premissas.tarifaEnergia || 0,
		custosInstalacao: proposal.premissas.custosInstalacao || 0,
		custosPadraoEnergia: proposal.premissas.custosPadraoEnergia || 0,
		custosEstruturaInstalacao: proposal.premissas.custosEstruturaInstalacao || 0,
		custosOutros: proposal.premissas.custosOutros || 0,
	};
	const pricing = handlePricingCalculation({
		methodology: plan.metodologia,
		plan: { name: plan.nome, price: plan.preco, tax: 0, profitMargin: 12 },
		conditionData,
		variableData,
	});
	const proposalTotalPreview = getPricingTotal({ pricing: pricing });

	return (
		<div key={plan._id} className="flex min-h-[250px] w-full gap-2 rounded-md border border-primary/30 shadow-md lg:w-[800px]">
			<div className={`h-full w-[7px] ${getBarColor({ active: plan.ativo })} rounded-bl-md rounded-tl-md`}></div>
			<div className="flex w-full grow flex-col p-3">
				<div className="flex w-full grow flex-col">
					<div className="flex w-full items-center justify-between gap-2">
						<h1 className="grow  text-center text-sm font-black leading-none tracking-tight lg:text-start">{plan.nome || "NÃO DEFINIDO"}</h1>
						{getStatusTag({ planId: plan._id, selectedIds: selectedIds })}
					</div>
					<div className="mt-2 flex w-full items-center gap-2">
						<div className="flex items-center gap-1 text-green-500">
							<MdSell />
							<p className="text-[0.65rem] font-bold lg:text-sm">{formatToMoney(proposalTotalPreview)}</p>
						</div>
						{userHasPricingView ? (
							<div className="flex items-center gap-1 text-yellow-500">
								<MdAttachMoney />
								<p className="text-[0.65rem] font-bold lg:text-sm">{formatToMoney(plan.preco)}</p>
							</div>
						) : null}

						<div className="flex items-center gap-1">
							<MdReplay />
							<p className="text-[0.65rem] font-light lg:text-sm">{plan.intervalo.tipo}</p>
						</div>
					</div>
					<div className="flex w-full grow flex-col">
						{/* <h1 className="my-2 mb-0 text-xs font-bold leading-none tracking-tight text-primary/70 lg:text-sm">PRODUTOS</h1>
            {plan.produtos.length > 0 ? (
              plan.produtos.map((product, index) => (
                <div key={index} className="mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2">
                  <div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-1">
                      <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
                        {renderCategoryIcon(product.categoria)}
                      </div>
                      <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
                        <strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
                      </p>
                    </div>
                    <div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
                      <div className="flex items-center gap-1">
                        <FaIndustry size={12} />
                        <p className="text-[0.6rem] font-light text-primary/70">{product.fabricante}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ImPower size={12} />
                        <p className="text-[0.6rem] font-light text-primary/70">{product.potencia} W</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <AiOutlineSafety size={12} />
                        <p className="text-[0.6rem] font-light text-primary/70">{product.garantia} ANOS</p>
                      </div>
                    </div>
                  </div>
                </div>
                // <ProductItem product={module} index={index} removeProductFromKit={(index) => console.log()} showRemoveButton={false} />
              ))
            ) : (
              <p className="flex w-full grow items-center justify-center py-2 text-center text-[0.6rem] font-medium italic tracking-tight text-primary/70 lg:text-xs">
                Sem produtos vinculados ao plano
              </p>
            )} */}
						<h1 className="my-2 mb-0 text-xs font-bold leading-none tracking-tight text-primary/70 lg:text-sm">SERVIÇOS</h1>
						<div className="flex w-full flex-wrap items-center gap-2">
							{plan.servicos.map((service, index) => (
								<div key={index} className="mt-1 flex flex-col gap-1 rounded-md border border-primary/30 p-2">
									<div className="flex w-full items-center justify-between gap-2">
										<div className="flex items-center gap-1">
											<div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1">
												<MdOutlineMiscellaneousServices />
											</div>
											<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
										</div>
									</div>
									<div className="flex w-full items-center justify-end gap-1">
										<AiOutlineSafety size={12} />
										<p className="text-[0.6rem] font-light text-primary/70">{service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`} </p>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="mt-2 flex w-full items-center justify-end gap-2">
						<div className={`flex items-center gap-2`}>
							<div className="ites-center flex gap-1">
								<BsCalendarPlus />
								<p className={`text-xs font-medium text-primary/70`}>{formatDateAsLocale(plan.dataInsercao)}</p>
							</div>
						</div>
						{!selectedIds.includes(plan._id) ? (
							<button
								onClick={() => handleSelect({ ...plan, valorFinal: proposalTotalPreview, precificacao: pricing })}
								className="rounded-full border border-cyan-500 p-1 text-cyan-500 duration-300 ease-in-out hover:bg-cyan-500 hover:text-primary-foreground"
							>
								<IoMdAdd />
							</button>
						) : (
							<button
								onClick={() => handleRemove(index)}
								className="rounded-full border border-red-500 p-1 text-red-500 duration-300 ease-in-out hover:bg-red-500 hover:text-primary-foreground"
							>
								<MdOutlineRemove />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProposalSignaturePlan;
