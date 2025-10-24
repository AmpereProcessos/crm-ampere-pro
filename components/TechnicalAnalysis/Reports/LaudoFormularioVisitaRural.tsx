import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import dayjs from "dayjs";

type LaudoFormularioVisitaRuralProps = {
	analysis: TTechnicalAnalysisDTO;
};
function LaudoFormularioVisitaRural({ analysis }: LaudoFormularioVisitaRuralProps) {
	return (
		<div className="h-[29.7cm] w-[21cm]">
			<div className="flex h-full w-full flex-col">
				<div className="flex flex-col">
					<h1 className="border-x border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">INFORMAÇÕES DO CLIENTE</h1>
					<div className="flex">
						<div className="grid w-[60%] grid-rows-5">
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">CLIENTE</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.nome}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">REPRESENTANTE</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.requerente.apelido || analysis.requerente.nome}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">ENDEREÇO</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.localizacao.endereco}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">BAIRRO</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.localizacao.bairro}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">DATA DA VISITA</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{dayjs().format("DD/MM/YYYY")}</p>
							</div>
						</div>
						<div className="grid w-[40%] grid-rows-5">
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">TELEFONE</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">-</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">Nº DE PROJETO</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.oportunidade.identificador || "N/A"}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">NÚMERO</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.localizacao.numeroOuIdentificador}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">MUNICÍPIO</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.localizacao.cidade}</p>
							</div>
							<div className="grid grid-cols-2 border-b border-black">
								<p className="border-r border-black bg-[#fead61] p-1 text-center text-[0.65rem] font-bold text-primary-foreground">TIPO DE SOLICITAÇÃO</p>
								<p className="border-r border-black p-1 text-center text-[0.65rem]">{analysis.tipoSolicitacao}</p>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-4 flex flex-col">
					<h1 className="bg-[#15599a] text-center text-sm font-bold text-primary-foreground">ESTRUTURA FOTOVOLTAICA</h1>
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
					<div className="mt-1 flex border border-black">
						<h1 className="w-[20%] border-r border-black text-center text-[0.65rem] font-bold">OBSERVAÇÕES SOBRE A VISITA</h1>
						<div className="h-full w-[80%]"></div>
					</div>
				</div>
				<div className="mt-4 flex flex-col">
					<h1 className="border-x border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">PADRÃO</h1>
					<div className="flex w-full border border-t-0 border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-[0.65rem] font-bold">RAMAL DE ENTRADA</h1>
						<div className="grid w-[80%] grid-cols-9">
							<h1 className="col-span-2 border-r border-black p-1 text-center text-[0.65rem]">SUBTERRÂNEO</h1>
							<h1 className="col-span-1 border-r border-black p-1 text-center text-[0.65rem]">AÉREO</h1>
							<h1 className="col-span-3 border-r border-black bg-primary/30 p-1 text-center text-[0.65rem] font-bold">INFORMAÇÕES DE SAÍDA</h1>
							<h1 className="col-span-2 border-r border-black p-1 text-center text-[0.65rem]">SUBTERRÂNEO</h1>
							<h1 className="col-span-1 p-1 text-center text-[0.65rem]">AÉREO</h1>
						</div>
					</div>
					<div className="flex w-full border border-t-0 border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-[0.65rem] font-bold">AMPERAGEM</h1>
						<div className="grid w-[80%] grid-cols-9">
							<h1 className="col-span-3 border-r border-black p-1 text-end text-[0.65rem]">{"                 "}AMPÈRES</h1>
							<h1 className="col-span-3 border-r border-black bg-primary/30 p-1 text-center text-[0.65rem] font-bold">TIPO DO DISJUNTOR</h1>
							<div className="col-span-3 flex items-center">
								<h1 className="border-r border-black p-1 text-end text-[0.65rem]">MONOFÁSICO</h1>
								<h1 className="border-r border-black p-1 text-end text-[0.65rem]">BIFÁSICO</h1>
								<h1 className="border-black p-1 text-end text-[0.65rem]">TRIFÁSICO</h1>
							</div>
						</div>
					</div>
					<div className="flex w-full border border-t-0 border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-[0.65rem] font-bold">Nº DO MEDIDOR</h1>
						<div className="grid w-[80%] grid-cols-9">
							<h1 className="col-span-3 border-r border-black p-1 text-end text-[0.65rem]"></h1>
							<h1 className="col-span-3 border-r border-black bg-primary/30 p-1 text-center text-[0.65rem] font-bold">MODELO DA CAIXA</h1>
							<h1 className="border-black p-1 text-end text-[0.65rem]">CM-</h1>
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border-x border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">OBRAS</h1>
					<h1 className="border-x border-t border-black bg-[#fead61] text-center text-[0.65rem] font-bold text-primary-foreground">ESTRUTURA DE MONTAGEM</h1>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">TELHA RESERVA</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-[0.65rem]">SIM</h1>
								<h1 className="text-center text-[0.65rem]">NÃO</h1>
							</div>
						</div>
						<div className="flex border border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">TIPO DA ESTRUTURA</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-[0.65rem]">FERRO</h1>
								<h1 className="text-center text-[0.65rem]">MADEIRA</h1>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">QTDE DE TELHAS RESERVAS</h1>
							<div className=" w-[40%]"></div>
						</div>
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">ORIENTAÇÃO DO TELHADO</h1>
							<div className="w-[40%]"></div>
						</div>
					</div>
					<div className="flex border border-t-0 border-black">
						<div className="flex w-[30%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">
							TIPO DA TELHA
						</div>
						<div className="grid w-[70%] grid-cols-7 grid-rows-2">
							<h1 className="border-b border-r border-black text-center text-[0.65rem]">AMERICANA</h1>
							<h1 className="border-b border-r border-black text-center text-[0.65rem]">ETHERNIT</h1>
							<h1 className="border-b border-r border-black text-center text-[0.65rem]">CIMENTO</h1>
							<h1 className="border-b border-r border-black text-center text-[0.65rem]">PORTUGUESA</h1>
							<h1 className="border-b border-r border-black text-center text-[0.65rem]">ROMANA</h1>
							<h1 className="border-b border-r border-black text-center text-[0.65rem]">CAPA+BICA</h1>
							<h1 className="border-b border-black text-center text-[0.65rem]">ZINCO</h1>
							<h1 className="border-r border-black text-center text-[0.65rem]">SANDUÍCHE</h1>
							<h1 className="border-r border-black text-center text-[0.65rem]">FRANCESA</h1>
							<h1 className="border-r border-black text-center text-[0.65rem]">PINTADA</h1>
							<h1 className="border-r border-black text-center text-[0.65rem]">ESPECIAL</h1>
							<h1 className="border-r border-black text-center text-[0.65rem]">VER FOTO</h1>
							<h1 className="border-r border-black text-center text-[0.65rem]">N/A</h1>
							<h1 className="text-center text-[0.65rem]">AMERICANA</h1>
						</div>
					</div>
					<div className="flex border border-t-0 border-black">
						<h1 className="flex w-[30%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">
							TIPO DE EDIFICAÇÃO
						</h1>
						<div className="grid w-[70%] grid-cols-11">
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-[0.65rem]">COLONIAL</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-[0.65rem]">BARRACÃO</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-[0.65rem]">CAIXOTE</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-[0.65rem]">SOLO</div>
							<div className="col-span-3 flex items-center justify-center text-center text-[0.65rem]">BARRACÃO A SER CONSTRUÍDO</div>
						</div>
					</div>
					<h1 className="border-x border-black bg-[#fead61] text-center text-[0.65rem] font-bold text-primary-foreground">INFRAESTRUTURA ELÉTRICA</h1>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-t-0 border-black">
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">
								ADAPTAÇÃO NO QGBT
							</div>
							<div className="grid w-[40%] grid-cols-3">
								<div className="flex items-center justify-center border-r border-black text-center text-[0.65rem]">TRILHO</div>
								<div className="flex items-center justify-center border-r border-black text-center text-[0.65rem]">CORTE</div>
								<div className="flex items-center justify-center text-center text-[0.65rem]">NÃO</div>
							</div>
						</div>
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">PARADE DE FIXAÇÃO DOS EQUIPAMENTOS</h1>
							<div className="grid w-[40%] grid-cols-2">
								<div className="flex items-center justify-center border-r border-black text-center text-[0.65rem]">ALVENARIA</div>
								<div className="flex items-center justify-center text-center text-[0.65rem]">OUTRO</div>
							</div>
						</div>
					</div>
					<div className="flex border border-t-0 border-black">
						<h1 className="w-[30%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">LOCAL DE INSTALAÇÃO DOS EQUIPAMENTOS</h1>
						<div className="w-[70%]"></div>
					</div>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">DISTÂNCIA DO SISTEMA AO QGBT</h1>
							<h1 className="w-[40%] pr-2 text-end text-[0.65rem]">METROS</h1>
						</div>
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">DISTÂNCIA DO ROTEADOR AO INVERSOR</h1>
							<h1 className="w-[40%] pr-2 text-end text-[0.65rem]">METROS</h1>
						</div>
					</div>
					<div className="grid grid-cols-2">
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">CASA DE MÁQUINAS</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-[0.65rem]">SIM</h1>
								<h1 className="text-center text-[0.65rem]">NÃO</h1>
							</div>
						</div>
						<div className="flex border border-l-0 border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">REDE PARA INTERLIGAR FAZENDA</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-[0.65rem]">SIM</h1>
								<h1 className="text-center text-[0.65rem]">NÃO</h1>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2">
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">INSTALAÇÃO INTERNET</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-[0.65rem]">SIM</h1>
								<h1 className="text-center text-[0.65rem]">NÃO</h1>
							</div>
						</div>
						<div className="flex border border-l-0 border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-[0.65rem] font-bold">CONSTRUÇÃO DE BARRACÃO</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-[0.65rem]">SIM</h1>
								<h1 className="text-center text-[0.65rem]">NÃO</h1>
							</div>
						</div>
					</div>
					<h1 className="border-x border-t-0 border-black bg-[#fead61] text-center text-[0.65rem] font-bold text-primary-foreground">OBSERVAÇÕES</h1>
					<div className="h-[200px] border border-t-0 border-black"></div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">CHECKLIST DE FOTOS E LOCALIZAÇÕES</h1>
					<h1 className="border border-b-0 border-t-0 border-black bg-[#fead61] text-center text-[0.65rem] font-bold text-primary-foreground">PADRÃO</h1>
					<div className="grid grid-cols-3 grid-rows-2 border border-b-0 border-black">
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">1</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								FOTO DO PADRÃO DE ENTRADA
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">2</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">FOTO DO DISJUNTOR</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">3</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								FOTO DO RAMAL DE ENTRADA
							</div>
							<div className="w-[20%] text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">4</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								LOCALIZAÇÃO DO PADRÃO
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">5</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								FOTO GERAL DO PADRÃO ATÉ A RESIDÊNCIA
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">6</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">FOTO DO MEDIDOR</div>
							<div className="w-[20%] text-center text-[0.65rem]"></div>
						</div>
					</div>
					<h1 className="border border-t-0 border-black bg-[#fead61] text-center text-[0.65rem] font-bold text-primary-foreground">TRANSFORMADOR</h1>
					<div className="grid grid-cols-3">
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">1</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">LOCALIZAÇÃO TRAFO</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">2</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">Nº DO TRANSFORMADOR</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">3</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								FOTO DO TRANSFORMADOR
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
					</div>
					<h1 className="border border-b-0 border-t-0 border-black bg-[#fead61] text-center text-[0.65rem] font-bold text-primary-foreground">MONTAGEM</h1>
					<div className="grid grid-cols-3 grid-rows-3 border border-black">
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center">1</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">FOTO DO TELHADO</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">2</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								FOTO DO LOCAL DE MONTAGEM(SOLO)
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">3</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">FILMAGEM GERAL</div>
							<div className="w-[20%] text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">4</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">FOTO DA FACHADA</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">5</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								LOCALIZAÇÃO DA RESIDÊNCIA
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">6</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								LOCALIZAÇÃO DAS PLACAS(SOLO)
							</div>
							<div className="w-[20%] text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">7</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								FOTO LOCAL DO INVERSOR
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">8</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">FOTOS GERAIS</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-r-0 border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">9</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								FOTOS DA ESTRUTURA TELHADO
							</div>
							<div className="w-[20%] text-center text-[0.65rem]"></div>
						</div>
					</div>
					<h1 className="border border-t-0 border-black bg-[#15599a] text-center text-[0.65rem] font-bold text-primary-foreground">GOIÁS</h1>
					<div className="grid grid-cols-3 grid-rows-2">
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								Nº POSTE DE DERIVAÇÃO
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								LOCAL DE ATERRAMENTO
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								POTÊNCIA DO TRANSFORMADOR
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								LOCALIZAÇÃO POSTE DERIVAÇÃO
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">CHAVE FUSÍVEL</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-[0.65rem]">
								NºPOSTE DO TRANSFORMADOR
							</div>
							<div className="w-[20%] border-r border-black text-center text-[0.65rem]"></div>
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border border-black text-center text-sm font-bold text-[#15599a]">DESENHO TÉCNICO</h1>
					<h1 className="border border-t-0 border-black bg-[#15599a] text-center text-[0.65rem] font-bold text-primary-foreground">OBSERVAÇÕES</h1>
					<div className="mb-2 h-[500px] border border-t-0 border-black"></div>
				</div>
			</div>
		</div>
	);
}

export default LaudoFormularioVisitaRural;
