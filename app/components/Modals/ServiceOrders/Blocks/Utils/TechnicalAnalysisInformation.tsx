import TextareaInput from "@/components/Inputs/TextareaInput";
import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { FaRegCompass } from "react-icons/fa";
import { MdDashboard, MdElectricMeter, MdOutlineRoofing, MdOutlineSettingsInputComponent, MdSettingsInputComponent } from "react-icons/md";
import { RxSquare } from "react-icons/rx";
import { TbAtom, TbPlugConnected } from "react-icons/tb";

type TechnicalAnalysisInformationProps = {
	analysis: TTechnicalAnalysisDTO;
};
function TechnicalAnalysisInformation({ analysis }: TechnicalAnalysisInformationProps) {
	// const { data: analysis, isLoading, isError, isSuccess } = useTechnicalAnalysisById({ id: analysisId })
	return (
		<div className="flex w-full flex-col gap-y-2 py-2">
			<>
				<h1 className="w-full bg-primary/50 p-1 text-center text-xs font-medium text-primary-foreground">DETALHES</h1>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-col items-center gap-1 lg:items-start">
						<div className="flex items-center gap-1">
							<TbAtom size={12} />
							<p className="text-[0.65rem] font-medium text-primary/70">MATERIAL DA ESTRUTURA</p>
						</div>
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">{analysis.detalhes.materialEstrutura || "NÃO DEFINIDO"}</p>
					</div>
					<div className="flex flex-col items-center gap-1 lg:items-end">
						<div className="flex items-center gap-1">
							<MdOutlineRoofing size={12} />
							<p className="text-[0.65rem] font-medium text-primary/70">TIPO DA ESTRUTURA</p>
						</div>
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">{analysis.detalhes.tipoEstrutura || "NÃO DEFINIDO"}</p>
					</div>
				</div>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-col items-center gap-1 lg:items-start">
						<div className="flex items-center gap-1">
							<FaRegCompass size={12} />
							<p className="text-[0.65rem] font-medium text-primary/70">ORIENTAÇÃO</p>
						</div>
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">{analysis.detalhes.orientacao || "NÃO DEFINIDO"}</p>
					</div>
					<div className="flex flex-col items-center gap-1 lg:items-end">
						<div className="flex items-center gap-1">
							<RxSquare size={12} />
							<p className="text-[0.65rem] font-medium text-primary/70">TIPO DA TELHA</p>
						</div>
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">{analysis.detalhes.tipoTelha || "NÃO DEFINIDO"}</p>
					</div>
				</div>
				<h1 className="w-full bg-primary/50 p-1 text-center text-xs font-medium text-primary-foreground">PADRÕES</h1>
				<div className="flex w-full flex-col gap-1">
					{analysis.padrao.map((info, index) => (
						<div key={index} className="flex w-full flex-col rounded-sm border border-primary/50 p-3">
							<div className="flex w-full items-center justify-between gap-2">
								<div className="flex flex-col gap-1">
									<div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black p-1 text-[20px]">
										<MdElectricMeter />
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">PADRÃO DE {info.amperagem}A</p>
								</div>
							</div>
							<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
								<div className="flex flex-col items-center gap-1 lg:items-start">
									<div className="flex items-center gap-1">
										<MdDashboard size={12} />
										<p className="text-[0.65rem] font-medium text-primary/70">TIPO</p>
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight">{info.tipo}</p>
								</div>
								<div className="flex flex-col items-center gap-1 lg:items-end">
									<div className="flex items-center gap-1">
										<TbPlugConnected size={12} />
										<p className="text-[0.65rem] font-medium text-primary/70">LIGAÇÃO</p>
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight">{info.ligacao}</p>
								</div>
							</div>
							<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
								<div className="flex flex-col items-center gap-1 lg:items-start">
									<div className="flex items-center gap-1">
										<AiOutlineArrowDown size={12} />
										<p className="text-[0.65rem] font-medium text-primary/70">ENTRADA</p>
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight">{info.tipoEntrada}</p>
								</div>
								<div className="flex flex-col items-center gap-1 lg:items-end">
									<div className="flex items-center gap-1">
										<AiOutlineArrowUp size={12} />
										<p className="text-[0.65rem] font-medium text-primary/70">SAÍDA</p>
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight">{info.tipoSaida}</p>
								</div>
							</div>
							{info.alteracao ? (
								<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
									<div className="flex flex-col items-center gap-1 lg:items-start">
										<div className="flex items-center gap-1">
											<MdOutlineSettingsInputComponent size={12} />
											<p className="text-[0.65rem] font-medium text-primary/70">NOVA AMPERAGEM</p>
										</div>
										<p className="text-[0.6rem] font-medium leading-none tracking-tight">{info.novaAmperagem}</p>
									</div>
									<div className="flex flex-col items-center gap-1 lg:items-end">
										<div className="flex items-center gap-1">
											<TbPlugConnected size={12} />
											<p className="text-[0.65rem] font-medium text-primary/70">NOVA LIGAÇÃO</p>
										</div>
										<p className="text-[0.6rem] font-medium leading-none tracking-tight">{info.novaLigacao || "-"}</p>
									</div>
								</div>
							) : null}
						</div>
					))}
				</div>
				<h1 className="w-full bg-primary/50 p-1 text-center text-xs font-medium text-primary-foreground">SUPRIMENTOS</h1>
				<div className="flex items-center gap-1">
					<MdSettingsInputComponent size={12} />
					<p className="text-[0.65rem] font-medium text-primary/70">ITENS DE INSUMO</p>
				</div>
				<div className="flex w-full flex-wrap items-center gap-2">
					{analysis.suprimentos?.itens.map((item, index) => (
						<div key={index} className="rounded border border-primary/50 bg-[#f8f8f8] p-2 text-center shadow-md">
							<p className="text-[0.6rem] font-medium leading-none tracking-tight">
								{item.qtde} x {item.descricao}
							</p>
						</div>
					))}
				</div>
				<TextareaInput
					label="OBSERVAÇÕES PARA EXECUÇÃO"
					editable={false}
					value={analysis.execucao?.observacoes || ""}
					handleChange={(value) => {}}
					placeholder="Observações e detalhes da execução..."
				/>
				{analysis.execucao.memorial && analysis.execucao.memorial.length > 0 ? (
					analysis.execucao.memorial.map((obs, index) => (
						<div key={index} className="flex w-full flex-col rounded-md border border-primary/50">
							<div className="flex min-h-[25px] w-full flex-col items-start justify-between gap-1 lg:flex-row">
								<div className="flex w-full items-center justify-center rounded-br-md rounded-tl-md bg-cyan-700 lg:w-[40%]">
									<p className="w-full text-center text-xs font-medium text-primary-foreground">{obs.topico}</p>
								</div>
							</div>
							<h1 className="w-full p-2 text-center text-xs font-medium tracking-tight text-primary/70">{obs.descricao}</h1>
						</div>
					))
				) : (
					<p className="w-full text-center text-sm font-medium tracking-tight text-primary/70">Nenhuma descritivo adicionado.</p>
				)}
			</>
		</div>
	);
}

export default TechnicalAnalysisInformation;
