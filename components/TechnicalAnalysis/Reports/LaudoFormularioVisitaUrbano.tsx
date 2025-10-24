import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import dayjs from "dayjs";

type LaudoFormularioVisitaUrbanoProps = {
	analysis: TTechnicalAnalysisDTO;
};
function LaudoFormularioVisitaUrbano({ analysis }: LaudoFormularioVisitaUrbanoProps) {
	return (
		<div className="h-[29.7cm] w-[21cm]">
			<div className="flex h-full w-full flex-col">
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
				<div className="flex flex-col">
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
					<div className="mt-1 flex border border-black">
						<h1 className="w-[20%] border-r border-black text-center text-xs font-bold">OBSERVAÇÕES SOBRE A VISITA</h1>
						<div className="h-full w-[80%]"></div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border-x border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">PADRÃO</h1>
					<div className="flex w-full border border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">PADRÃO ESTÁ</h1>
						<div className="grid w-[80%] grid-cols-2">
							<h1 className="border-r border-black p-1 text-center text-xs">CONTRA A REDE</h1>
							<h1 className="p-1 text-center text-xs">A FAVOR DA REDE</h1>
						</div>
					</div>
					<div className="flex w-full border border-t-0 border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">RAMAL DE ENTRADA</h1>
						<div className="grid w-[80%] grid-cols-9">
							<h1 className="col-span-2 border-r border-black p-1 text-center text-xs">SUBTERRÂNEO</h1>
							<h1 className="col-span-1 border-r border-black p-1 text-center text-xs">AÉREO</h1>
							<h1 className="col-span-3 border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">INFORMAÇÕES DE SAÍDA</h1>
							<h1 className="col-span-2 border-r border-black p-1 text-center text-xs">SUBTERRÂNEO</h1>
							<h1 className="col-span-1 p-1 text-center text-xs">AÉREO</h1>
						</div>
					</div>
					<div className="flex w-full border border-t-0 border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">BITOLA SAÍDA DOS CABOS E TUBO</h1>
						<div className="grid w-[80%] grid-cols-9">
							<h1 className="col-span-3 border-r border-black p-1 text-end text-xs">{"                 "}MM²</h1>
							<h1 className="col-span-3 border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">ALTURA DO MURO</h1>
							<h1 className="col-span-3 p-1 text-end text-xs">{"                 "}METROS</h1>
						</div>
					</div>
					<h1 className="border-x border-black bg-[#15599a] text-center text-xs font-bold text-primary-foreground">CAIXA ÚNICA</h1>
					<div className="flex w-full border border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">AMPERAGEM</h1>
						<div className="grid w-[80%] grid-cols-9">
							<h1 className="col-span-3 border-r border-black p-1 text-end text-xs">{"                 "}AMPÈRES</h1>
							<h1 className="col-span-3 border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">TIPO DO DISJUNTOR</h1>
							<div className="col-span-3 flex items-center">
								<h1 className="border-r border-black p-1 text-end text-xs">MONOFÁSICO</h1>
								<h1 className="border-r border-black p-1 text-end text-xs">BIFÁSICO</h1>
								<h1 className="border-black p-1 text-end text-xs">TRIFÁSICO</h1>
							</div>
						</div>
					</div>
					<div className="flex w-full border border-t-0 border-black">
						<h1 className="w-[20%] border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">Nº DO MEDIDOR</h1>
						<div className="grid w-[80%] grid-cols-9">
							<h1 className="col-span-3 border-r border-black p-1 text-end text-xs"></h1>
							<h1 className="col-span-3 border-r border-black bg-primary/30 p-1 text-center text-xs font-bold">MODELO DA CAIXA</h1>
							<h1 className="border-black p-1 text-end text-xs">CM-</h1>
						</div>
					</div>
					<h1 className="border-x border-black bg-[#15599a] text-center text-xs font-bold text-primary-foreground">CAIXAS AGRUPADAS</h1>
					<div className="flex w-full flex-col">
						<div className="grid grid-cols-10 border border-black">
							<div className="col-span-1 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">NºCAIXA</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">AMPERAGEM</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">MONO/BI/TRI</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">NºMEDIDOR</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">MODELO CAIXA</div>
							<div className="col-span-1 flex items-center justify-center bg-primary/30 text-center text-xs font-bold">BITOLA DE SAÍDA</div>
						</div>
						<div className="grid grid-cols-10 border border-t-0 border-black">
							<div className="col-span-1 flex items-center justify-center border-r border-black text-center text-xs font-bold">CAIXA 1</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-start border-r border-black pl-3 text-center text-xs font-bold">CM-</div>
							<div className="col-span-1 flex w-full items-end justify-end pr-1 text-end text-xs font-bold">MM²</div>
						</div>
						<div className="grid grid-cols-10 border border-t-0 border-black">
							<div className="col-span-1 flex items-center justify-center border-r border-black text-center text-xs font-bold">CAIXA 2</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-start border-r border-black pl-3 text-center text-xs font-bold">CM-</div>
							<div className="col-span-1 flex w-full items-end justify-end pr-1 text-end text-xs font-bold">MM²</div>
						</div>
						<div className="grid grid-cols-10 border border-t-0 border-black">
							<div className="col-span-1 flex items-center justify-center border-r border-black text-center text-xs font-bold">CAIXA 3</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-start border-r border-black pl-3 text-center text-xs font-bold">CM-</div>
							<div className="col-span-1 flex w-full items-end justify-end pr-1 text-end text-xs font-bold">MM²</div>
						</div>
						<div className="grid grid-cols-10 border border-t-0 border-black">
							<div className="col-span-1 flex items-center justify-center border-r border-black text-center text-xs font-bold">CAIXA 4</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-start border-r border-black pl-3 text-center text-xs font-bold">CM-</div>
							<div className="col-span-1 flex w-full items-end justify-end pr-1 text-end text-xs font-bold">MM²</div>
						</div>
						<div className="grid grid-cols-10 border border-t-0 border-black">
							<div className="col-span-1 flex items-center justify-center border-r border-black text-center text-xs font-bold">CAIXA 5</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-start border-r border-black pl-3 text-center text-xs font-bold">CM-</div>
							<div className="col-span-1 flex w-full items-end justify-end pr-1 text-end text-xs font-bold">MM²</div>
						</div>
						<div className="grid grid-cols-10 border border-t-0 border-black">
							<div className="col-span-1 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">GERAL</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold"></div>
							<div className="col-span-2 flex items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold"></div>
							<div className="col-span-1 flex items-center justify-center bg-primary/30 text-end text-xs font-bold"></div>
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border-x border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">OBRAS</h1>
					<h1 className="border-x border-t border-black bg-[#fead61] text-center text-xs font-bold text-primary-foreground">ESTRUTURA DE MONTAGEM</h1>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">TELHA RESERVA</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-xs">SIM</h1>
								<h1 className="text-center text-xs">NÃO</h1>
							</div>
						</div>
						<div className="flex border border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">TIPO DA ESTRUTURA</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-xs">FERRO</h1>
								<h1 className="text-center text-xs">MADEIRA</h1>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">QTDE DE TELHAS RESERVAS</h1>
							<div className=" w-[40%]"></div>
						</div>
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">ORIENTAÇÃO DO TELHADO</h1>
							<div className="w-[40%]"></div>
						</div>
					</div>
					<div className="flex border border-t-0 border-black">
						<div className="flex w-[30%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">TIPO DA TELHA</div>
						<div className="grid w-[70%] grid-cols-7 grid-rows-2">
							<h1 className="border-b border-r border-black text-center text-xs">AMERICANA</h1>
							<h1 className="border-b border-r border-black text-center text-xs">ETHERNIT</h1>
							<h1 className="border-b border-r border-black text-center text-xs">CIMENTO</h1>
							<h1 className="border-b border-r border-black text-center text-xs">PORTUGUESA</h1>
							<h1 className="border-b border-r border-black text-center text-xs">ROMANA</h1>
							<h1 className="border-b border-r border-black text-center text-xs">CAPA+BICA</h1>
							<h1 className="border-b border-black text-center text-xs">ZINCO</h1>
							<h1 className="border-r border-black text-center text-xs">SANDUÍCHE</h1>
							<h1 className="border-r border-black text-center text-xs">FRANCESA</h1>
							<h1 className="border-r border-black text-center text-xs">PINTADA</h1>
							<h1 className="border-r border-black text-center text-xs">ESPECIAL</h1>
							<h1 className="border-r border-black text-center text-xs">VER FOTO</h1>
							<h1 className="border-r border-black text-center text-xs">N/A</h1>
							<h1 className="text-center text-xs">AMERICANA</h1>
						</div>
					</div>
					<div className="flex border border-t-0 border-black">
						<h1 className="flex w-[30%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">TIPO DE EDIFICAÇÃO</h1>
						<div className="grid w-[70%] grid-cols-11">
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs">COLONIAL</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs">BARRACÃO</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs">CAIXOTE</div>
							<div className="col-span-2 flex items-center justify-center border-r border-black text-center text-xs">SOLO</div>
							<div className="col-span-3 flex items-center justify-center text-center text-xs">BARRACÃO A SER CONSTRUÍDO</div>
						</div>
					</div>
					<h1 className="border-x border-black bg-[#fead61] text-center text-xs font-bold text-primary-foreground">INFRAESTRUTURA ELÉTRICA</h1>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">ESPAÇO NO QGBT</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-xs">SIM</h1>
								<h1 className="text-center text-xs">NÃO</h1>
							</div>
						</div>
						<div className="flex border border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">DPS NO QGBT</h1>
							<div className="grid w-[40%] grid-cols-2">
								<h1 className="border-r border-black text-center text-xs">SIM</h1>
								<h1 className="text-center text-xs">NÃO</h1>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-t-0 border-black">
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs font-bold">
								ADAPTAÇÃO NO QGBT
							</div>
							<div className="grid w-[40%] grid-cols-3">
								<div className="flex items-center justify-center border-r border-black text-center text-xs">TRILHO</div>
								<div className="flex items-center justify-center border-r border-black text-center text-xs">CORTE</div>
								<div className="flex items-center justify-center text-center text-xs">NÃO</div>
							</div>
						</div>
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">PARADE DE FIXAÇÃO DOS EQUIPAMENTOS</h1>
							<div className="grid w-[40%] grid-cols-2">
								<div className="flex items-center justify-center border-r border-black text-center text-xs">ALVENARIA</div>
								<div className="flex items-center justify-center text-center text-xs">OUTRO</div>
							</div>
						</div>
					</div>
					<div className="flex border border-t-0 border-black">
						<h1 className="w-[30%] border-r border-black bg-primary/30 text-center text-xs font-bold">LOCAL DE INSTALAÇÃO DOS EQUIPAMENTOS</h1>
						<div className="w-[70%]"></div>
					</div>
					<div className="flex border border-t-0 border-black">
						<h1 className="w-[30%] border-r border-black bg-primary/30 text-center text-xs font-bold">INFRA P/ LANÇAMENTO DE CABOS</h1>
						<div className="w-[70%]">
							<h1 className="w-[29%] border-r border-black text-center text-xs">KIT NORMAL</h1>
							<div className="w-[70%]"></div>
						</div>
					</div>
					<div className="grid grid-cols-2">
						<div className="flex border border-r-0 border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">DISTÂNCIA DO SISTEMA AO QGBT</h1>
							<h1 className="w-[40%] pr-2 text-end text-xs">METROS</h1>
						</div>
						<div className="flex border border-t-0 border-black">
							<h1 className="w-[60%] border-r border-black bg-primary/30 text-center text-xs font-bold">DISTÂNCIA DO ROTEADOR AO INVERSOR</h1>
							<h1 className="w-[40%] pr-2 text-end text-xs">METROS</h1>
						</div>
					</div>
					<h1 className="border-x border-t-0 border-black bg-[#fead61] text-center text-xs font-bold text-primary-foreground">OBSERVAÇÕES</h1>
					<div className="h-[200px] border border-t-0 border-black"></div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border border-black bg-[#15599a] text-center text-sm font-bold text-primary-foreground">CHECKLIST DE FOTOS E LOCALIZAÇÕES</h1>
					<div className="grid grid-cols-3 grid-rows-3 border border-black">
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center">1</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">FOTO DA FACHADA</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">2</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">FOTO DO PADRÃO</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">3</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">FOTO DO DISJUNTOR</div>
							<div className="w-[20%] text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">4</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">FOTO DO QUADRO(QDG)</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">5</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">
								FOTO DO LOCAL DO EQUIPAMENTO
							</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">6</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">FOTO DO TELHADO</div>
							<div className="w-[20%] text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">7</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">
								FOTO DA ESTRUTURA DO TELHADO
							</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">8</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">LOCALIZAÇÃO DA RESIDÊNCIA</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-r-0 border-black">
							<div className="flex w-[20%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">9</div>
							<div className="flex w-[60%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">
								LOCALIZAÇÃO DO TRANSFORMADOR
							</div>
							<div className="w-[20%] text-center text-xs"></div>
						</div>
					</div>
					<h1 className="border border-t-0 border-black bg-[#15599a] text-center text-xs font-bold text-primary-foreground">GOIÁS</h1>
					<div className="grid grid-cols-3">
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">FOTO DO POSTE DE DERIVAÇÃO</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">
								NÚMERO E LOCALIZAÇÃO DO POSTE
							</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
						<div className="flex border-b border-black">
							<div className="flex w-[80%] items-center justify-center border-r border-black bg-primary/30 text-center text-xs">
								FOTO DO LOCAL DE ATERRAMENTO
							</div>
							<div className="w-[20%] border-r border-black text-center text-xs"></div>
						</div>
					</div>
				</div>
				<div className="mt-6 flex flex-col">
					<h1 className="border border-black text-center text-sm font-bold text-[#15599a]">DESENHO TÉCNICO</h1>
					<h1 className="border border-t-0 border-black bg-[#15599a] text-center text-xs font-bold text-primary-foreground">OBSERVAÇÕES</h1>
					<div className="mb-2 h-[100px] border border-t-0 border-black"></div>
				</div>
			</div>
		</div>
	);
}

export default LaudoFormularioVisitaUrbano;
