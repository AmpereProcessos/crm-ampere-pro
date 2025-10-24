import React, { useState } from "react";
import genFactors from "../../../utils/json-files/generationFactors.json";

import LoadingComponent from "../../utils/LoadingComponent";

import { getModulesQty, useKitQueryPipelines } from "@/utils/methods";
import { toast } from "react-hot-toast";
import { ImPower, ImSad } from "react-icons/im";
import { VscFilter, VscFilterFilled } from "react-icons/vsc";
import ProposalKit from "../../Cards/ProposalKit";

import FilterMenu from "@/components/Kits/FilterMenu";
import { combineUniqueProducts, combineUniqueServices } from "@/lib/methods/array-manipulation";
import { getInverterQty, getModulesPeakPotByProducts } from "@/lib/methods/extracting";
import { formatDecimalPlaces, formatToMoney } from "@/lib/methods/formatting";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import { orientations } from "@/utils/constants";
import { TPricingConditionData, TPricingVariableData, getPricingTotal, handlePricingCalculation } from "@/utils/pricing/methods";
import { useKitsByQuery } from "@/utils/queries/kits";
import { TKitDTOWithPricingMethod } from "@/utils/schemas/kits.schema";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { TProposal } from "@/utils/schemas/proposal.schema";
import { AiOutlineSafety } from "react-icons/ai";
import { FaIndustry } from "react-icons/fa";
import { MdAttachMoney, MdOutlineMiscellaneousServices } from "react-icons/md";
import { TbTopologyFull } from "react-icons/tb";

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

type SystemProps = {
	opportunity: TOpportunityDTOWithClient;
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
	moveToNextStage: () => void;
	moveToPreviousStage: () => void;
};
function System({ opportunity, infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage }: SystemProps) {
	const [queryType, setQueryType] = useState<QueryTypes>("TODOS OS KITS");
	const [showFilters, setShowFilters] = useState(false);
	// Getting peak power measures based on params
	const { max, min, ideal } = getIdealPowerInterval({
		consumption: infoHolder.premissas.consumoEnergiaMensal || 0,
		uf: opportunity.localizacao.uf,
		city: opportunity.localizacao.cidade,
		orientation: infoHolder.premissas.orientacao || "NORTE",
	});

	const queryPipeline = useKitQueryPipelines(queryType, {
		...getIdealPowerInterval({
			consumption: infoHolder.premissas.consumoEnergiaMensal || 0,
			uf: opportunity.localizacao.uf,
			city: opportunity.localizacao.cidade,
			orientation: infoHolder.premissas.orientacao || "NORTE",
		}),

		structure: infoHolder.premissas.tipoEstrutura,
	});

	const {
		data: kits,
		isSuccess: kitsSuccess,
		isLoading: kitsLoading,
		isError: kitsError,
		filters,
		setFilters,
	} = useKitsByQuery({ enabled: true, queryType: queryType, pipeline: queryPipeline });

	const [selectedKits, setSelectedKits] = useState<TKitDTOWithPricingMethod[]>([]);

	function selectKit(kit: TKitDTOWithPricingMethod) {
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
		const price = selectedKits.reduce((acc, current) => acc + current.preco, 0);
		const moduleQty = getModulesQty(products);
		const inverterQty = getInverterQty(products);
		const modulePeakPower = getModulesPeakPotByProducts(products);
		const conditionData: TPricingConditionData = {
			uf: opportunity.localizacao.uf,
			cidade: opportunity.localizacao.cidade,
			topologia: topology,
			tipoEstrutura: infoHolder.premissas.tipoEstrutura || undefined,
		};
		const variableData: TPricingVariableData = {
			kit: price,
			numModulos: moduleQty,
			potenciaPico: modulePeakPower,
			distancia: infoHolder.premissas.distancia || 0,
			plan: 0,
			numInversores: inverterQty,
		};
		const pricing = handlePricingCalculation({
			methodology: methodology,
			kit: { name: kitName, price: price, tax: 0, profitMargin: 12 },
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
		if (!data) return <p className="w-full text-center text-xs italic text-primary/70">Nenhum kit selecionado para a composição do sistema...</p>;
		const { nome, topologia, produtos, servicos, valor, potenciaPico } = data;
		return (
			<div className="flex w-full flex-col gap-1">
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
				<h1 className="mb-0 mt-2 text-xs font-bold leading-none tracking-tight text-primary/70 lg:text-sm">PRODUTOS</h1>
				{produtos.map((product, index) => (
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
				))}
				<h1 className="my-2 mb-0 text-xs font-bold leading-none tracking-tight text-primary/70 lg:text-sm">SERVIÇOS</h1>
				{servicos.map((service, index) => (
					<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2">
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
			</div>
		);
	}
	function getSelectedKitsTotalPower(kits: TKitDTOWithPricingMethod[]) {
		const total = kits.reduce((acc, current) => {
			const currentPower = getModulesPeakPotByProducts(current.produtos);
			return acc + currentPower;
		}, 0);
		return formatDecimalPlaces(total, 2);
	}
	function handleProceed() {
		if (selectedKits.length == 0) return toast.error("Selecione ao menos um kit para prosseguir.");
		const kitIds = selectedKits.map((s) => s._id);
		const kitName = selectedKits.map((s) => s.nome).join(" + ");
		const topology = selectedKits[0].topologia;
		const methodology = selectedKits[0].metodologia;
		const methodologyId = selectedKits[0].idMetodologiaPrecificacao;
		const selectedProducts = selectedKits.flatMap((k) => k.produtos);
		const selectedServices = selectedKits.flatMap((k) => k.servicos);

		const products = combineUniqueProducts(selectedProducts);
		const services = combineUniqueServices(selectedServices);
		const price = selectedKits.reduce((acc, current) => acc + current.preco, 0);
		const moduleQty = getModulesQty(products);
		const inverterQty = getInverterQty(products);
		const modulePeakPower = getModulesPeakPotByProducts(products);
		const conditionData: TPricingConditionData = {
			uf: opportunity.localizacao.uf,
			cidade: opportunity.localizacao.cidade,
			topologia: topology,
		};
		const variableData: TPricingVariableData = {
			kit: price,
			numModulos: moduleQty,
			potenciaPico: modulePeakPower,
			distancia: infoHolder.premissas.distancia || 0,
			plan: 0,
			numInversores: inverterQty,
		};

		const pricing = handlePricingCalculation({
			methodology: methodology,
			kit: { name: kitName, price: price, tax: 0, profitMargin: 12 },
			conditionData,
			variableData,
		});
		setInfoHolder((prev) => ({
			...prev,
			idMetodologiaPrecificacao: methodologyId,
			kit: { ids: kitIds, nome: kitName, valor: price },
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
				<h1 className="text-center font-medium italic text-[#fead61]">
					Nessa etapa, por favor escolha o kit que melhor se adeque as necessidades desse projeto.
				</h1>
			</div>
			<div className="flex w-full flex-col items-center justify-center">
				<h1 className="text-center font-thin italic text-primary/70">
					Calculamos, com base nas premissas preenchidas, que a potência pico ideal para esse projeto é de aproximadamente:
				</h1>
				<h1 className="text-center font-medium italic text-primary/80">{formatDecimalPlaces(ideal)} kWp</h1>
			</div>
			<div className="flex w-full flex-col rounded-md border border-primary/30 p-3">
				<div className="flex w-full items-center justify-between">
					<h1 className="font-bold leading-none tracking-tight">COMPOSIÇÃO DO SISTEMA</h1>
					<h1 className="rounded border border-cyan-500 p-1 font-bold text-cyan-500">{getSelectedKitsTotalPower(selectedKits)} kWp</h1>
				</div>
				<div className="mt-2 flex w-full flex-col gap-1">{renderSystemCompostion()}</div>
			</div>
			<div className="flex h-[600px] w-full flex-col rounded-md border border-primary/30 p-3">
				<div className="flex w-full flex-col border-b border-primary/30 pb-2">
					<div className="flex w-full flex-col items-center justify-between lg:flex-row">
						<h1 className="font-bold leading-none tracking-tight">KITS DISPONÍVEIS ({kits ? kits.length : "..."})</h1>
						<div className="flex w-full flex-col items-center gap-2 lg:w-fit lg:flex-row">
							<button
								onClick={() => setQueryType("KITS POR PREMISSA")}
								className={`${
									queryType == "KITS POR PREMISSA"
										? "bg-[#fead61] text-primary-foreground hover:bg-transparent hover:text-[#fead61]"
										: "text-[#fead61] hover:bg-[#fead61] hover:text-primary-foreground"
								} w-full rounded border border-[#fead61] px-2  py-1 font-medium lg:w-fit`}
							>
								MOSTRAR KITS IDEAIS
							</button>
							<button
								onClick={() => setQueryType("TODOS OS KITS")}
								className={`${
									queryType == "TODOS OS KITS"
										? "bg-[#15599a] text-primary-foreground hover:bg-transparent hover:text-[#15599a]"
										: "text-[#15599a] hover:bg-[#15599a] hover:text-primary-foreground"
								} w-full rounded border border-[#15599a] px-2  py-1 font-medium lg:w-fit`}
							>
								MOSTRAR TODOS OS KITS
							</button>
							<button
								onClick={() => setShowFilters((prev) => !prev)}
								className={`flex w-full items-center justify-center rounded border border-[#15599a] px-2 py-1 lg:w-fit ${
									showFilters ? "bg-[#15599a] text-primary-foreground" : "bg-background text-[#15599a]"
								} `}
							>
								{showFilters ? <VscFilterFilled style={{ fontSize: "22px" }} /> : <VscFilter style={{ fontSize: "22px" }} />}
							</button>
						</div>
					</div>
					{showFilters ? <FilterMenu filters={filters} setFilters={setFilters} /> : null}
				</div>
				<div className="flex w-full grow flex-wrap justify-around gap-2 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
					<div className="flex w-full flex-wrap items-start justify-around gap-2">
						{kitsLoading ? <LoadingComponent /> : null}
						{kitsError ? (
							<div className="flex flex-col items-center justify-center gap-4">
								<ImSad style={{ fontSize: "50px", color: "#fead61" }} />
								<p className="w-full text-center text-sm italic text-primary/60 lg:w-[50%]">
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
										userHasPricingView={true}
									/>
								))
							) : (
								<div className="flex flex-col items-center justify-center gap-4">
									<ImSad style={{ fontSize: "50px", color: "#fead61" }} />
									<p className="w-full text-center text-sm italic text-primary/60 lg:w-[50%]">
										Oops, parece que não há kits cadastrados pra essa faixa de potência ou pros filtros que você selecionou. Contate o setor responsável ou, se
										desejar, busque os demais kits clicando em <strong className="text-[#15599a]">"Mostrar todos os kits"</strong>.
									</p>
								</div>
							)
						) : null}
					</div>
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

export default System;
