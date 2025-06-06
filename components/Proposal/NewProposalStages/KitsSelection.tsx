import React, { useState } from "react";
import type { TUserSession } from "@/lib/auth/session";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";

import ProposalKit from "../../Cards/ProposalKit";
import LoadingComponent from "../../utils/LoadingComponent";
import FilterMenu from "@/components/Kits/FilterMenu";

import { VscFilter, VscFilterFilled } from "react-icons/vsc";

import { MdAttachMoney, MdOutlineMiscellaneousServices } from "react-icons/md";
import { useKitsByQuery } from "@/utils/queries/kits";

import { ImPower, ImSad } from "react-icons/im";
import { FaBolt, FaIndustry } from "react-icons/fa";
import { TbTopologyFull } from "react-icons/tb";
import { AiOutlineSafety } from "react-icons/ai";

import { formatDecimalPlaces, formatToMoney } from "@/lib/methods/formatting";
import { combineUniqueProducts, combineUniqueServices } from "@/lib/methods/array-manipulation";
import { getInverterQty, getModulesPeakPotByProducts } from "@/lib/methods/extracting";
import { renderCategoryIcon } from "@/lib/methods/rendering";

import { TOpportunityDTOWithClient, TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import { TProposal } from "@/utils/schemas/proposal.schema";
import { TKitDTOWithPricingMethod } from "@/utils/schemas/kits.schema";

import { TPricingConditionData, TPricingVariableData, getPricingTotal, handlePricingCalculation } from "@/utils/pricing/methods";
import { getModulesQty, useKitQueryPipelines } from "@/utils/methods";
import { GeneralVisibleHiddenExitMotionVariants, orientations } from "@/utils/constants";
import genFactors from "../../../utils/json-files/generationFactors.json";
import CreateProposalKit from "@/components/Modals/Kit/CreateProposalKit";
import AccessGrantingWarning from "../Utils/AccessGrantingWarning";
import { TrendingDown, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type QueryTypes = "KITS POR PREMISSA" | "TODOS OS KITS";

type GetIdealPowerIntervalParams = {
	consumption: number;
	city: string | undefined | null;
	uf: string | undefined | null;
	orientation: (typeof orientations)[number];
};
function getIdealPowerInterval({ consumption, city, uf, orientation }: GetIdealPowerIntervalParams): { max: number; min: number; ideal: number } {
	if (!city || !uf)
		return {
			max: 400 + consumption / 127,
			min: -400 + consumption / 127,
			ideal: consumption / 127,
		};

	const cityFactor = genFactors.find((genFactor) => genFactor.CIDADE == city && genFactor.UF == uf);

	if (!cityFactor)
		return {
			max: 400 + consumption / 127,
			min: -400 + consumption / 127,
			ideal: consumption / 127,
		};
	const factor = cityFactor[orientation];
	return {
		max: 0.4 + consumption / factor,
		min: -0.4 + consumption / factor,
		ideal: consumption / factor,
	};
}

type KitsSelectionProps = {
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
	moveToNextStage: () => void;
	moveToPreviousStage: () => void;
	setApplicablePaymentMethodsIds: React.Dispatch<React.SetStateAction<string[]>>;

	session: TUserSession;
};
function KitsSelection({ opportunity, infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage, setApplicablePaymentMethodsIds, session }: KitsSelectionProps) {
	const userHasKitEditPermission = session.user.permissoes.kits.editar;
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const [queryType, setQueryType] = useState<QueryTypes>("KITS POR PREMISSA");
	const [showFilters, setShowFilters] = useState(false);
	const [createProposalKitModalIsOpen, setCreateProposalKitModalIsOpen] = useState<boolean>(false);
	// Getting peak power measures based on params
	const { max, min, ideal } = getIdealPowerInterval({
		consumption: infoHolder.premissas.consumoEnergiaMensal || 0,
		uf: opportunity.localizacao.uf,
		city: opportunity.localizacao.cidade,
		orientation: infoHolder.premissas.orientacao || "NORTE",
	});

	const queryPipeline = useKitQueryPipelines(
		queryType,
		{
			...getIdealPowerInterval({
				consumption: infoHolder.premissas.consumoEnergiaMensal || 0,
				uf: opportunity.localizacao.uf,
				city: opportunity.localizacao.cidade,
				orientation: infoHolder.premissas.orientacao || "NORTE",
			}),
			structure: infoHolder.premissas.tipoEstrutura,
		},
		partnerQuery,
	);

	const {
		data: kits,
		isSuccess: kitsSuccess,
		isLoading: kitsLoading,
		isError: kitsError,
		filters,
		setFilters,
	} = useKitsByQuery({ enabled: true, queryType: queryType, pipeline: queryPipeline });

	const [selectedKits, setSelectedKits] = useState<(TKitDTOWithPricingMethod & { valorFinal: number })[]>([]);

	function selectKit(kit: TKitDTOWithPricingMethod & { valorFinal: number }) {
		if (selectedKits.some((k) => k.topologia != kit.topologia)) return toast.error("Não é permitida a adição de kits de diferentes topologias.");
		if (selectedKits.some((k) => k.idMetodologiaPrecificacao != kit.idMetodologiaPrecificacao))
			return toast.error("Não é permitida a adição de kits de diferentes metodologias de precificação.");

		const newSelectedKits = [...selectedKits];
		newSelectedKits.push(kit);
		setSelectedKits([...newSelectedKits]);
		return toast.success("Kit adicionado com sucesso !");
	}

	function getSystemCompositionData() {
		if (selectedKits.length == 0) return null;
		const kitName = selectedKits.map((s) => s.nome).join(" + ");
		const topology = selectedKits[0].topologia;

		const methodology = selectedKits[0].metodologia;
		const selectedProducts = selectedKits.flatMap((k) => k.produtos);
		const selectedServices = selectedKits.flatMap((k) => k.servicos);

		const products = combineUniqueProducts(selectedProducts);
		const services = combineUniqueServices(selectedServices);
		const kitPrice = selectedKits.reduce((acc, current) => acc + (current.preco || 0), 0);
		const moduleQty = getModulesQty(products);
		const inverterQty = getInverterQty(products);
		const modulePeakPower = getModulesPeakPotByProducts(products);
		const conditionData: TPricingConditionData = {
			uf: opportunity.localizacao.uf,
			cidade: opportunity.localizacao.cidade,
			topologia: topology,
			tipoEstrutura: infoHolder.premissas.tipoEstrutura || "Fibrocimento",
			grupoInstalacao: infoHolder.premissas.grupoInstalacao || "RESIDENCIAL",
			faseamentoEletrico: infoHolder.premissas.faseamentoEletrico || "MONOFÁSICO",
			idParceiro: opportunity.idParceiro,
			numModulos: moduleQty,
			numInversores: inverterQty,
			potenciaPico: modulePeakPower,
			distancia: infoHolder.premissas.distancia || 0,
			valorReferencia: infoHolder.premissas.valorReferencia || 0,
			ativacaoReferencia: infoHolder.premissas.ativacaoReferencia || "NÃO",
		};
		const variableData: TPricingVariableData = {
			kit: kitPrice,
			numModulos: moduleQty,
			product: 0,
			service: 0,
			potenciaPico: modulePeakPower,
			distancia: infoHolder.premissas.distancia || 0,
			plan: 0,
			numInversores: inverterQty,
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
			kit: { name: kitName, price: kitPrice, tax: 0, profitMargin: 12 },
			conditionData,
			variableData,
		});

		const totalPrice = getPricingTotal({ pricing });

		return {
			nome: kitName,
			topologia: topology,
			produtos: products,
			servicos: services,
			valor: totalPrice,
			potenciaPico: modulePeakPower,
		};
	}
	function renderSystemCompostion() {
		const data = getSystemCompositionData();
		if (!data) return <p className="w-full text-center text-xs italic text-gray-500">Nenhum kit selecionado para a composição do sistema...</p>;
		const { nome, topologia, produtos, servicos, valor, potenciaPico } = data;
		return (
			<AnimatePresence>
				<motion.div variants={GeneralVisibleHiddenExitMotionVariants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-1">
					<h1 className="font-bold leading-none tracking-tight">{nome}</h1>
					<div className="mt-2 flex w-full items-center gap-2">
						<div className="flex items-center gap-1 text-green-500">
							<MdAttachMoney />
							<p className="text-[0.65rem] font-bold lg:text-sm">{formatToMoney(valor)}</p>
						</div>
						<div className="flex items-center gap-1 text-red-500">
							<ImPower color="rgb(239,68,68)" />
							<p className="text-[0.65rem] font-bold lg:text-sm">{potenciaPico} kW</p>
						</div>
						<div className="flex items-center gap-1">
							<TbTopologyFull />
							<p className="text-[0.65rem] font-light lg:text-sm">{topologia}</p>
						</div>
					</div>
					<h1 className="mb-0 mt-2 text-xs font-bold leading-none tracking-tight text-gray-500 lg:text-sm">PRODUTOS</h1>
					{produtos.map((product, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
							<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
								<div className="flex items-center gap-1">
									<div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1 text-[15px]">{renderCategoryIcon(product.categoria)}</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
										<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
									</p>
								</div>
								<div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
									<div className="flex items-center gap-1">
										<FaIndustry size={12} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.fabricante}</p>
									</div>
									<div className="flex items-center gap-1">
										<ImPower size={12} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.potencia} W</p>
									</div>
									<div className="flex items-center gap-1">
										<AiOutlineSafety size={12} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.garantia} ANOS</p>
									</div>
								</div>
							</div>
						</div>
					))}
					<h1 className="my-2 mb-0 text-xs font-bold leading-none tracking-tight text-gray-500 lg:text-sm">SERVIÇOS</h1>
					{servicos.map((service, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
							<div className="flex w-full items-center justify-between gap-2">
								<div className="flex  items-center gap-1">
									<div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1">
										<MdOutlineMiscellaneousServices />
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
								</div>
							</div>
						</div>
					))}
				</motion.div>
			</AnimatePresence>
		);
	}
	function renderPowerComparison({ achieved, expected }: { achieved: number; expected: number }) {
		if (achieved > expected)
			return (
				<div className="flex items-center gap-1 rounded-lg bg-green-500 px-2 py-1 lg:py-2">
					<TrendingUp size={15} color="white" />
					<h1 className="text-[0.7rem] font-bold text-white">{formatDecimalPlaces(achieved - expected)} kWp acima do esperado</h1>
				</div>
			);

		return (
			<div className="flex items-center gap-1 rounded-lg bg-orange-500 px-2 py-1 lg:py-2">
				<TrendingDown size={15} color="white" />
				<h1 className="text-[0.7rem] font-bold text-white">{formatDecimalPlaces(expected - achieved)} kWp abaixo do esperado</h1>
			</div>
		);
	}
	function getSelectedKitsTotalPower(kits: TKitDTOWithPricingMethod[]) {
		const total = kits.reduce((acc, current) => {
			const currentPower = getModulesPeakPotByProducts(current.produtos);
			return acc + currentPower;
		}, 0);
		return total;
	}
	function handleProceed() {
		if (selectedKits.length == 0) return toast.error("Selecione ao menos um kit para prosseguir.");
		const proposalKits: TProposal["kits"] = selectedKits.map((s) => ({ id: s._id, nome: s.nome, preco: s.preco, valor: s.valorFinal }));
		const kitIds = selectedKits.map((s) => s._id);
		const kitName = selectedKits.map((s) => s.nome).join(" + ");
		const paymentMethodsIds = [...new Set(selectedKits.flatMap((x) => x.idsMetodologiasPagamento))];

		const topology = selectedKits[0].topologia;
		const methodology = selectedKits[0].metodologia;
		const methodologyId = selectedKits[0].idMetodologiaPrecificacao;
		const selectedProducts = selectedKits.flatMap((k) => k.produtos);
		const selectedServices = selectedKits.flatMap((k) => k.servicos);

		const products = combineUniqueProducts(selectedProducts);
		const services = combineUniqueServices(selectedServices);
		const price = selectedKits.reduce((acc, current) => acc + (current.preco || 0), 0);
		const moduleQty = getModulesQty(products);
		const inverterQty = getInverterQty(products);
		const modulePeakPower = getModulesPeakPotByProducts(products);
		const conditionData: TPricingConditionData = {
			uf: opportunity.localizacao.uf,
			cidade: opportunity.localizacao.cidade,
			topologia: topology,
			grupoInstalacao: infoHolder.premissas.grupoInstalacao || "RESIDENCIAL",
			tipoEstrutura: infoHolder.premissas.tipoEstrutura || "Fibrocimento",
			faseamentoEletrico: infoHolder.premissas.faseamentoEletrico || "MONOFÁSICO",
			idParceiro: opportunity.idParceiro,
			numModulos: moduleQty,
			numInversores: inverterQty,
			potenciaPico: modulePeakPower,
			distancia: infoHolder.premissas.distancia || 0,
			valorReferencia: infoHolder.premissas.valorReferencia || 0,
			ativacaoReferencia: infoHolder.premissas.ativacaoReferencia || "NÃO",
		};
		const variableData: TPricingVariableData = {
			kit: price,
			numModulos: moduleQty,
			product: 0,
			service: 0,
			potenciaPico: modulePeakPower,
			distancia: infoHolder.premissas.distancia || 0,
			plan: 0,
			numInversores: inverterQty,
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
		setInfoHolder((prev) => ({
			...prev,
			premissas: {
				...prev.premissas,
				potenciaPico: modulePeakPower,
				numModulos: moduleQty,
				numInversores: inverterQty,
			},
			idMetodologiaPrecificacao: methodologyId,
			kits: proposalKits,
			produtos: products,
			servicos: services,
			precificacao: pricing,
			potenciaPico: modulePeakPower,
		}));
		moveToNextStage();
	}

	return (
		<div className="flex min-h-[400px] w-full flex-col gap-2 py-4">
			<div className="flex w-full items-center justify-center">
				<h1 className="text-center text-xs font-medium italic text-[#fead61] lg:text-base">Nessa etapa por favor escolha o kit que melhor se adeque as necessidades desse projeto.</h1>
			</div>
			<div className="flex w-full flex-col items-center justify-center">
				<h1 className="text-center font-light italic text-gray-500">
					Calculamos, com base nas premissas preenchidas, que a potência pico ideal para esse projeto é de aproximadamente:
				</h1>
				<h1 className="text-center font-medium italic text-gray-800">{formatDecimalPlaces(ideal)} kWp</h1>
			</div>
			<AccessGrantingWarning proposal={infoHolder} opportunity={opportunity} type="warn" projectTypeId={opportunity.tipo.id} />
			<div className="flex w-full flex-col rounded-md border border-gray-200 p-3">
				<div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
					<h1 className="font-bold leading-none tracking-tight">COMPOSIÇÃO DO SISTEMA</h1>
					<div className="flex flex-col-reverse items-center gap-1 lg:flex-row lg:gap-2">
						{renderPowerComparison({ expected: ideal, achieved: getSelectedKitsTotalPower(selectedKits) })}
						<div className="flex items-center gap-1 rounded-lg bg-cyan-500 px-2 py-1 lg:py-2">
							<FaBolt size={12} color="white" />
							<h1 className="text-[0.7rem] font-black text-white">{formatDecimalPlaces(getSelectedKitsTotalPower(selectedKits), 2)} kWp</h1>
						</div>
					</div>
				</div>
				<div className="mt-2 flex w-full flex-col gap-1">{renderSystemCompostion()}</div>
			</div>
			<div className="flex h-[600px] w-full flex-col rounded-md border border-gray-200 p-3">
				<div className="flex w-full flex-col border-b border-gray-200 pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<h1 className="font-bold leading-none tracking-tight">KITS DISPONÍVEIS ({kits ? kits.length : "..."})</h1>
						<div className="flex w-full flex-col items-center gap-2 lg:w-fit lg:flex-row">
							{userHasKitEditPermission ? (
								<button
									onClick={() => setCreateProposalKitModalIsOpen(true)}
									className={`w-full rounded border border-black bg-black px-2 py-1 font-bold tracking-tight text-white hover:bg-gray-800 lg:w-fit`}
								>
									CRIAR KIT PARA PROPOSTA
								</button>
							) : null}

							<button
								onClick={() => setQueryType("KITS POR PREMISSA")}
								className={cn(
									"w-full rounded border border-[#fead61] px-2 py-1 font-bold tracking-tight lg:w-fit",
									queryType == "KITS POR PREMISSA" ? "bg-[#fead61] text-white hover:bg-transparent hover:text-[#fead61]" : "text-[#fead61] hover:bg-[#fead61] hover:text-white",
								)}
							>
								MOSTRAR KITS IDEAIS
							</button>
							<button
								onClick={() => setQueryType("TODOS OS KITS")}
								className={cn(
									"w-full rounded border border-[#15599a] px-2 py-1  font-bold tracking-tight lg:w-fit",
									queryType == "TODOS OS KITS" ? "bg-[#15599a] text-white hover:bg-transparent hover:text-[#15599a]" : "text-[#15599a] hover:bg-[#15599a] hover:text-white",
								)}
							>
								MOSTRAR TODOS OS KITS
							</button>
							<button
								onClick={() => setShowFilters((prev) => !prev)}
								className={cn(
									"flex w-full items-center justify-center rounded border border-[#15599a] px-2 py-1 lg:w-fit",
									showFilters ? "bg-[#15599a] text-white" : "bg-white text-[#15599a]",
								)}
							>
								{showFilters ? <VscFilterFilled style={{ fontSize: "22px" }} /> : <VscFilter style={{ fontSize: "22px" }} />}
							</button>
						</div>
					</div>
					{showFilters ? <FilterMenu filters={filters} setFilters={setFilters} /> : null}
				</div>
				<div className="flex w-full grow flex-wrap justify-around gap-2 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
					<div className="flex w-full flex-wrap items-start justify-around gap-2">
						{kitsLoading ? <LoadingComponent /> : null}
						{kitsError ? (
							<div className="flex flex-col items-center justify-center gap-4">
								<ImSad style={{ fontSize: "50px", color: "#fead61" }} />
								<p className="w-full text-center text-sm italic text-gray-600 lg:w-[50%]">
									Houve um erro na busca dos kits. Por favor, tente
									<strong className="text-[#15599a]">"Mostrar todos os kits"</strong>. Se o erro persistir, tente recarregar a página.
								</p>
							</div>
						) : null}
						{kitsSuccess ? (
							kits.length > 0 ? (
								kits?.map((infoKit, index) => (
									<ProposalKit
										key={`${infoKit._id} - ${index}`}
										kit={infoKit}
										handleClick={(selectedKit) => selectKit(selectedKit)}
										opportunity={opportunity}
										proposal={infoHolder}
										userHasPricingView={session.user.permissoes.precos.visualizar}
									/>
								))
							) : (
								<div className="flex flex-col items-center justify-center gap-4">
									<ImSad style={{ fontSize: "50px", color: "#fead61" }} />
									<p className="w-full text-center text-sm italic text-gray-600 lg:w-[50%]">
										Oops, parece que não há kits cadastrados pra essa faixa de potência ou pros filtros que você selecionou. Contate o setor responsável ou, se desejar, busque os demais kits
										clicando em <strong className="text-[#15599a]">"Mostrar todos os kits"</strong>.
									</p>
								</div>
							)
						) : null}
					</div>
				</div>
			</div>
			{createProposalKitModalIsOpen ? (
				<CreateProposalKit
					session={session}
					opportunity={opportunity}
					proposal={infoHolder}
					setProposal={setInfoHolder}
					setApplicablePaymentMethodsIds={setApplicablePaymentMethodsIds}
					closeModal={() => setCreateProposalKitModalIsOpen(false)}
					goToNextStage={() => moveToNextStage()}
				/>
			) : null}
			<div className="flex w-full items-center justify-between gap-2 px-1">
				<button onClick={() => moveToPreviousStage()} className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105">
					Voltar
				</button>
				<button onClick={() => handleProceed()} className="rounded p-2 font-bold hover:bg-black hover:text-white">
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default KitsSelection;
