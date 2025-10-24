import Logo from "@/utils/images/blue-vertical-logo-with-text.png";
import Assinatura from "@/utils/images/signature-diogo.jpg";
import GenFactors from "@/utils/json-files/generationFactors.json";
import dayjs from "dayjs";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getGenFactorByOrientation, getModulesAveragePower, getModulesQty } from "@/lib/methods/extracting";
import { formatDecimalPlaces, formatToMoney } from "@/lib/methods/formatting";
import { STANDARD_PROFIT_MARGIN, STANDARD_TAX } from "@/utils/constants";
import { TProductItem } from "@/utils/schemas/kits.schema";
import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import { MdTopic } from "react-icons/md";

type LaudoIntermediarioUrbanoProps = {
	analysis: TTechnicalAnalysisDTO;
};
function LaudoIntermediarioUrbano({ analysis }: LaudoIntermediarioUrbanoProps) {
	function getAdditionalCostsSum(costs: TTechnicalAnalysisDTO["custos"], addTaxes = false) {
		const sum = costs.reduce((acc, current) => {
			if (!addTaxes && !!current.totalVendaSimples) return acc + current.totalVendaSimples;
			if (!!addTaxes && !!current.totalVendaFaturavel) return acc + current.totalVendaFaturavel;
			const costTotal = current.total || current.qtde * (current.custoUnitario || 0);
			const total = addTaxes ? costTotal / (1 - (STANDARD_PROFIT_MARGIN + STANDARD_TAX)) : costTotal / (1 - STANDARD_PROFIT_MARGIN);
			return acc + total;
		}, 0);
		return sum;
	}
	function getCorrectedGen() {
		const { cidade, uf } = analysis.localizacao;
		var cityFactor = GenFactors.find((genFactor) => genFactor.CIDADE == cidade && genFactor.UF == uf) || {
			CIDADE: "ITUIUTABA",
			ESTADO: "MINAS GERAIS",
			UF: "MG",
			LONGITUDE: -49.4644,
			LATITUDE: -18.9776,
			ANUAL: 127.1862,
			LESTE: 115.35045188664226,
			NORDESTE: 124.76640205381308,
			NORTE: 127.1862,
			NOROESTE: 124.76640205381308,
			OESTE: 114.20636331794299,
			SUDOESTE: 107.15958770896354,
			SUL: 100.09256274478585,
			SUDESTE: 108.33405031046011,
		};

		let norte = analysis.alocacaoModulos.norte
			? ((Number(cityFactor["NORTE"]) * analysis.alocacaoModulos.norte * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(2)
			: 0;
		let nordeste = analysis.alocacaoModulos.nordeste
			? ((Number(cityFactor["NORDESTE"]) * analysis.alocacaoModulos.nordeste * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(
					2,
				)
			: 0;
		let leste = analysis.alocacaoModulos.leste
			? ((Number(cityFactor["LESTE"]) * analysis.alocacaoModulos.leste * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(2)
			: 0;
		let sudeste = analysis.alocacaoModulos.sudeste
			? ((Number(cityFactor["SUDESTE"]) * analysis.alocacaoModulos.sudeste * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(2)
			: 0;
		let sul = analysis.alocacaoModulos.sul
			? ((Number(cityFactor["SUL"]) * analysis.alocacaoModulos.sul * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(2)
			: 0;
		let sudoeste = analysis.alocacaoModulos.sudoeste
			? ((Number(cityFactor["SUDOESTE"]) * analysis.alocacaoModulos.sudoeste * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(
					2,
				)
			: 0;
		let oeste = analysis.alocacaoModulos.oeste
			? ((Number(cityFactor["OESTE"]) * analysis.alocacaoModulos.oeste * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(2)
			: 0;
		let noroeste = analysis.alocacaoModulos.noroeste
			? ((Number(cityFactor["NOROESTE"]) * analysis.alocacaoModulos.noroeste * getModulesAveragePower(analysis.equipamentos as TProductItem[])) / 1000).toFixed(
					2,
				)
			: 0;
		return Number(norte) + Number(nordeste) + Number(leste) + Number(sudeste) + Number(sul) + Number(sudoeste) + Number(oeste) + Number(noroeste);
	}

	function getProposedGen() {
		const factor = getGenFactorByOrientation({ city: analysis.localizacao.cidade, uf: analysis.localizacao.uf, orientation: "NORTE" });

		return (getModulesQty(analysis.equipamentos as TProductItem[]) * getModulesAveragePower(analysis.equipamentos as TProductItem[]) * factor) / 1000;
	}

	return (
		<div className="h-[29.7cm] w-[21cm]">
			<div className="flex h-full w-full flex-col">
				<div className="mt-2 flex w-full items-center justify-around border border-t-0 border-black py-2">
					<h1 className="font-bold uppercase text-[#15599a]">LAUDO TÉCNICO - URBANO</h1>
					<div className="h-[47px] w-[47px]">
						<Image style={{ width: "47px", height: "47px" }} src={Logo} alt="Logo" />
					</div>
				</div>
				<div className="flex flex-col">
					<h1 className="border-x border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">INFORMAÇÕES DO CLIENTE</h1>
					<div className="flex">
						<div className="grid w-[60%] grid-rows-5">
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">CLIENTE</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.nome}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">REPRESENTANTE</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.requerente.apelido || analysis.requerente.nome}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">ENDEREÇO</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.localizacao.endereco}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">BAIRRO</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.localizacao.bairro}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">DATA DA VISITA</p>
								<p className="border-r border-black p-1 text-center text-xs">{dayjs().format("DD/MM/YYYY")}</p>
							</div>
						</div>
						<div className="grid w-[40%] grid-rows-5">
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">TELEFONE</p>
								<p className="border-r border-black p-1 text-center text-xs">-</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">Nº DE PROJETO</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.oportunidade.identificador || "N/A"}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">NÚMERO</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.localizacao.numeroOuIdentificador}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">MUNICÍPIO</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.localizacao.cidade}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-xs font-bold text-primary-foreground">TIPO DE SOLICITAÇÃO</p>
								<p className="border-r border-black p-1 text-center text-xs">{analysis.tipoSolicitacao}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="bg-[#15599a] text-center text-sm font-bold text-primary-foreground">EQUIPAMENTOS</h1>
					<div className="flex">
						<div className="flex h-full w-[20%] items-center justify-center bg-[#15599a] text-center font-bold text-primary-foreground">
							DESCRIÇÃO DO SISTEMA FOTOVOLTAICO
						</div>
						<div className="flex w-[80%] flex-col">
							<div className="flex w-full items-center">
								<div className="font-raleway w-1/2 border  border-b-0 border-black bg-[#fead61]  text-center text-sm font-bold text-primary-foreground">
									TOPOLOGIA
								</div>
								<p className="w-1/2 p-1 text-center text-[0.6rem] font-bold">{analysis.detalhes.topologia}</p>
							</div>
							<h1 className="font-raleway border border-b-0  border-black bg-[#fead61] text-center  text-sm font-bold text-primary-foreground">INVERSORES</h1>
							<div className="flex w-full flex-col border border-black">
								<div className="flex w-full items-center">
									<div className="w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold">QUANTIDADE</div>
									<div className="w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold">MODELO</div>
									<div className="w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold">POTÊNCIA</div>
								</div>
								{analysis.equipamentos
									.filter((e) => e.categoria == "INVERSOR")
									.map((inverter, index) => (
										<div key={index} className="flex w-full items-center">
											<div className="w-1/3 p-1 text-center text-[0.6rem] font-bold">{inverter.qtde}</div>
											<div className="w-1/3 p-1 text-center text-[0.6rem] font-bold">
												({inverter.fabricante}) {inverter.modelo}
											</div>
											<div className="w-1/3 p-1 text-center text-[0.6rem] font-bold">{inverter.potencia}</div>
										</div>
									))}
							</div>
							<h1 className="font-raleway border border-b-0 border-t-0  border-black bg-[#fead61] text-center  text-sm font-bold text-primary-foreground">
								MÓDULOS FOTOVOLTÁICOS
							</h1>
							<div className="flex w-full flex-col border border-black">
								<div className="flex w-full items-center">
									<div className="w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold">QUANTIDADE</div>
									<div className="w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold">MODELO</div>
									<div className="w-1/3 bg-primary/30 p-1 text-center text-[0.6rem] font-bold">POTÊNCIA</div>
								</div>
								{analysis.equipamentos
									.filter((e) => e.categoria == "MÓDULO")
									.map((module, index) => (
										<div key={index} className="flex w-full items-center">
											<div className="w-1/3 p-1 text-center text-[0.6rem] font-bold">{module.qtde}</div>
											<div className="w-1/3 p-1 text-center text-[0.6rem] font-bold">
												({module.fabricante}) {module.modelo}
											</div>
											<div className="w-1/3 p-1 text-center text-[0.6rem] font-bold">{module.potencia}</div>
										</div>
									))}
							</div>
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border border-b-0 border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">VISUALIZAÇÃO DO PROJETO</h1>
					<div className="flex h-[600px] items-center border border-black">
						{analysis.desenho.url ? (
							<div className="relative h-[560px] w-[793.7px]">
								<Image fill={true} src={analysis.desenho.url} alt="DESENHO" />
							</div>
						) : (
							<div className="flex h-full w-[793.7px] items-center justify-center">
								<p className="font-bold italic text-primary/70">Oops, parece que não há nenhum desenho vinculado para essa análise...</p>
							</div>
						)}
					</div>
				</div>
				<div className="mt-2 flex flex-col">
					<h1 className="border border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">CUSTOS ADICIONAIS</h1>
					<div className="flex flex-col">
						<div className="grid grid-cols-10 border-b border-black bg-[#fead61]">
							<p className="col-span-3 border-r border-black p-1 text-center text-xs font-bold text-primary-foreground">DESCRIÇÃO</p>
							<p className="col-span-2 border-r border-black p-1 text-center text-xs font-bold text-primary-foreground">QUANTIDADE</p>
							<p className="col-span-1 border-r border-black p-1 text-center text-xs font-bold text-primary-foreground">GRANDEZA</p>
							<p className="col-span-2 border-r border-black p-1 text-center text-xs font-bold text-primary-foreground">VALOR</p>
							<p className="col-span-2 border-r border-black p-1 text-center text-xs font-bold text-primary-foreground">TOTAL</p>
						</div>
						{analysis.custos?.length > 0 ? (
							analysis.custos.map((cost, index) => (
								<div key={index} className="grid grid-cols-10 border-b border-black">
									<p className="col-span-3 border-r border-black p-1 text-center text-xs font-bold">{cost.descricao}</p>
									<p className="col-span-2 border-r border-black p-1 text-center text-xs font-bold">{cost.qtde}</p>
									<p className="col-span-1 border-r border-black p-1 text-center text-xs font-bold">{cost.grandeza}</p>
									<p className="col-span-2 border-r border-black p-1 text-center text-xs font-bold">
										{formatToMoney((cost.custoUnitario || 0) / (1 - STANDARD_PROFIT_MARGIN))}
									</p>
									<p className="col-span-2 border-r border-black p-1 text-center text-xs font-bold">
										{cost.total
											? formatToMoney(cost.total / (1 - STANDARD_PROFIT_MARGIN))
											: formatToMoney((cost.qtde * (cost.custoUnitario || 0)) / (1 - STANDARD_PROFIT_MARGIN))}
									</p>
								</div>
							))
						) : (
							<div className="flex h-[50px] items-center justify-center border-b border-r border-black italic">SEM CUSTOS ADICIONAIS</div>
						)}
					</div>
					<div className="grid grid-cols-10">
						<div className="col-span-3 flex items-center justify-center border border-l-0 border-t-0 border-black bg-[#15599a] text-center font-bold text-primary-foreground">
							VALOR PARA AJUSTE NA PROPOSTA COMERCIAL
						</div>
						<div className="col-span-7 flex h-full flex-col">
							<div className="grid grid-cols-7  border-b border-black">
								<div className="col-span-5 border-r border-black bg-[#fead61] p-1 text-center font-bold text-primary-foreground">VALOR À VISTA</div>
								<div className="col-span-2 border-r border-black bg-[#fead61] p-1 text-center font-bold text-primary-foreground">
									R$ {analysis.custos ? getAdditionalCostsSum(analysis.custos).toFixed(2).replace(".", ",") : "-"}
								</div>
							</div>
							<div className="grid grid-cols-7  border-b border-black">
								<div className="col-span-5 border-r border-black bg-[#15599a] p-1 text-center font-bold text-primary-foreground">VALOR FINANCIAMENTO</div>
								<div className="col-span-2 border-r border-black bg-[#15599a] p-1 text-center font-bold text-primary-foreground">
									R$ {analysis.custos ? getAdditionalCostsSum(analysis.custos, true).toFixed(2).replace(".", ",") : "-"}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border border-black bg-[#15599a] text-center text-sm font-bold  text-primary-foreground">ESTUDO DE GERAÇÃO - DESVIO AZIMUTAL</h1>
					<div className="grid grid-cols-2">
						<div className="grid-rows-5">
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#15599a] p-1 text-center text-xs font-bold text-primary-foreground">ORIENTAÇÃO</p>
								<p className="border-r border-black bg-[#15599a] p-1 text-center text-xs font-bold text-primary-foreground">QTDE PLACAS</p>
								<p className="border-r border-black bg-[#15599a] p-1 text-center text-xs font-bold text-primary-foreground">GERAÇÃO</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">NORTE</p>
								<p className="border-r border-black text-center text-xs font-bold">{analysis.alocacaoModulos.norte ? analysis.alocacaoModulos.norte : "-"}</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.norte
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "NORTE",
												}) *
													analysis.alocacaoModulos.norte *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)} kWh`
										: " - "}{" "}
								</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">NORDESTE</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.nordeste ? analysis.alocacaoModulos.nordeste : "-"}
								</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.nordeste
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "NORDESTE",
												}) *
													analysis.alocacaoModulos.nordeste *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)} kWh`
										: " - "}{" "}
								</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">LESTE</p>
								<p className="border-r border-black text-center text-xs font-bold">{analysis.alocacaoModulos.leste ? analysis.alocacaoModulos.leste : "-"}</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.leste
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "LESTE",
												}) *
													analysis.alocacaoModulos.leste *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)} kWh`
										: "-"}{" "}
								</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">SUDESTE</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.sudeste ? analysis.alocacaoModulos.sudeste : "-"}
								</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.sudeste
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "SUDESTE",
												}) *
													analysis.alocacaoModulos.sudeste *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)}`
										: "-"}{" "}
								</p>
							</div>
						</div>
						<div className="grid-rows-5">
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#15599a] p-1 text-center text-xs font-bold text-primary-foreground">ORIENTAÇÃO</p>
								<p className="border-r border-black bg-[#15599a] p-1 text-center text-xs font-bold text-primary-foreground">QTDE PLACAS</p>
								<p className="border-r border-black bg-[#15599a] p-1 text-center text-xs font-bold text-primary-foreground">GERAÇÃO</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">SUL</p>
								<p className="border-r border-black text-center text-xs font-bold">{analysis.alocacaoModulos.sul ? analysis.alocacaoModulos.sul : "-"}</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.sul
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "SUL",
												}) *
													analysis.alocacaoModulos.sul *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)} kWh`
										: "-"}{" "}
								</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">SUDOESTE</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.sudoeste ? analysis.alocacaoModulos.sudoeste : "-"}
								</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.sudoeste
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "SUDOESTE",
												}) *
													analysis.alocacaoModulos.sudoeste *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)} kWh`
										: "-"}{" "}
								</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">OESTE</p>
								<p className="border-r border-black text-center text-xs font-bold">{analysis.alocacaoModulos.oeste ? analysis.alocacaoModulos.oeste : "-"}</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.oeste
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "OESTE",
												}) *
													analysis.alocacaoModulos.oeste *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)} kWh`
										: "-"}{" "}
								</p>
							</div>
							<div className="grid grid-cols-3 border-b border-black">
								<p className="border-r border-black bg-[#fead61] text-center text-xs font-bold italic text-primary-foreground">NOROESTE</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.noroeste ? analysis.alocacaoModulos.noroeste : "-"}
								</p>
								<p className="border-r border-black text-center text-xs font-bold">
									{analysis.alocacaoModulos.noroeste
										? `${(
												(getGenFactorByOrientation({
													city: analysis.localizacao.cidade,
													uf: analysis.localizacao.uf,
													orientation: "NOROESTE",
												}) *
													analysis.alocacaoModulos.noroeste *
													getModulesAveragePower(analysis.equipamentos as TProductItem[])) /
													1000
											).toFixed(2)} kWh`
										: "-"}{" "}
								</p>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-6 border-b border-black">
						<div className="col-span-4 border-r border-black bg-[#15599a] py-1 text-center text-xs font-bold italic text-primary-foreground">
							GERAÇÃO PROPOSTA COMERCIAL
						</div>
						<div className="col-span-2 border-r border-black py-1 text-center text-xs font-bold">{formatDecimalPlaces(getProposedGen())} kWh</div>
					</div>
					<div className="grid grid-cols-6 border-b border-black">
						<div className="col-span-4 border-r border-black bg-[#fead61] py-1 text-center text-xs font-bold italic text-primary-foreground">
							GERAÇÃO PREVISTA TOTAL
						</div>
						<div className="col-span-2 border-r border-black py-1 text-center text-xs font-bold">{formatDecimalPlaces(getCorrectedGen())} kWh</div>
					</div>
					<div className="grid grid-cols-6 border-b border-black">
						<div className="col-span-4 border-r border-black bg-[#15599a] py-1 text-center text-xs font-bold italic text-primary-foreground">
							PERCENTUAL DE GERAÇÃO DEVIDO AO DESVIO AZIMUTAL
						</div>
						<div className="col-span-2 border-r border-black py-1 text-center text-xs font-bold">
							{getProposedGen() / getCorrectedGen() < 1
								? formatDecimalPlaces((getCorrectedGen() / getProposedGen()) * 100)
								: formatDecimalPlaces((getCorrectedGen() / getProposedGen()) * 100)}
							%
						</div>
					</div>
				</div>
				<div className="my-2 flex flex-col items-center">
					<h1 className="text-center font-bold text-[#15599a]">VISUALIZAÇÃO GRÁFICA</h1>
					<div className="h-[300px] w-[600px]">
						<ResponsiveContainer width="100%">
							<BarChart
								width={500}
								height={250}
								data={[
									{
										name: "PROPOSTA",
										PROPOSTO: getProposedGen(),
										PREVISTO: 0,
									},
									{
										name: "PREVISTO",
										PROPOSTO: 0,
										PREVISTO: getCorrectedGen(),
									},
								]}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis unit="kWh" />
								<Tooltip />
								<Legend />
								<Bar dataKey="PROPOSTO" fill="#15599a" unit={"kWh"}></Bar>
								<Bar dataKey="PREVISTO" fill="#fead61" unit={"kWh"}></Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className="mt-2 flex flex-col">
					<h1 className="border border-t-0 border-black bg-[#fead61] text-center font-bold text-primary-foreground">DESCRITIVO DO PROJETO</h1>
					<div className="flex min-h-[60px] flex-col items-center justify-center border border-t-0 border-black text-center text-xs">
						{analysis.descritivo?.length > 0 ? (
							analysis.descritivo?.map((item, index) => (
								<div key={index} className="mb-1 flex w-full flex-col">
									<div className="flex w-full items-center justify-between">
										<div className="flex w-full items-center justify-center gap-2 bg-black text-primary-foreground">
											<MdTopic />
											<h1 className=" text-sm font-bold leading-none  tracking-tight">{item.topico}</h1>
										</div>
									</div>

									<p className="mt-1 w-full text-center text-xs text-primary/70">{item.descricao}</p>
								</div>
							))
						) : (
							<div className="flex h-full items-center justify-center text-center italic text-primary/60">SEM DESCRITIVO</div>
						)}
					</div>
				</div>
				<div className="mt-2 flex flex-col">
					<h1 className="border border-t-0 border-black bg-[#15599a] text-center font-bold text-primary-foreground">CONCLUSÃO</h1>
					<div className="flex h-[60px] items-center justify-center border border-t-0 border-black p-2 text-center text-xs">
						{analysis.conclusao.observacoes ? analysis.conclusao.observacoes : "-"}
					</div>
				</div>
				<div className="mt-2 grid grid-cols-2 gap-x-4">
					<div className="flex flex-col">
						<p className="ml-2 text-start text-xxs">Autorizado por:</p>
						<div className="flex w-full items-center justify-center">
							<div className="relative flex h-[40px] w-[97px] items-center justify-center text-center">
								<Image src={Assinatura} fill={true} alt="Assinatura" />
							</div>
						</div>
						<hr className="border-t-2 border-black" />
						<p className="text-center text-xxs">ASSINATURA DIRETOR DE ENGENHARIA</p>
					</div>
					<div className="flex flex-col">
						<p className="ml-2 text-start text-xxs">Realizado por:</p>
						<div className="flex w-full items-center justify-center">
							<div className="relative flex h-[40px] w-[97px] items-center justify-center text-center"></div>
						</div>
						<hr className="border-t-2 border-black" />
						<p className="text-center text-xxs">ASSINATURA TÉCNICO RESPONSÁVEL</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LaudoIntermediarioUrbano;
