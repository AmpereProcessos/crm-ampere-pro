import { TServiceOrderReport } from "../schemas/service-order.schema";

type TServiceOrderReportOption = {
	aplicavel: boolean;
	secoes: {
		titulo: string;
		controles: { titulo: string; efetivado: boolean }[];
		arquivos: { titulo: string; efetivado: boolean; condicao: { aplicavel: boolean; variavel?: string; igual?: string } }[];
	}[];
};

type ServiceOrderCategoriesReportsItem = {
	id: number;
	label: string;
	value: string;
	report?: TServiceOrderReportOption;
};
export const ServiceOrderCategoriesReports: ServiceOrderCategoriesReportsItem[] = [
	{
		id: 1,
		label: "PADRÃO",
		value: "PADRÃO",
		report: {
			aplicavel: true,
			secoes: [
				{
					titulo: "EXECUÇÃO DE PADRÃO",
					controles: [
						{ titulo: "MONTAGEM DO PADRÃO", efetivado: false },
						{ titulo: "LANÇAMENTO DO RAMAL", efetivado: false },
						{ titulo: "REALIMENTAÇÃO", efetivado: false },
					],
					arquivos: [
						{ titulo: "PADRÃO MONTADO", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DAS LIGAÇÕES FEITAS", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DO DISJUNTOR", efetivado: false, condicao: { aplicavel: false } },
					],
				},
			],
		},
	},
	{ id: 2, label: "ESTRUTURA", value: "ESTRUTURA" },
	{
		id: 3,
		label: "MONTAGEM",
		value: "MONTAGEM",
		report: {
			aplicavel: true,
			secoes: [
				{
					titulo: "ETAPA DE ENTRADA",
					controles: [
						{ titulo: "DESENHO DA MONTAGEM NO TELHADO EM MÃOS", efetivado: false },
						{ titulo: "DIAGRAMA UNIFILAR EM MÃOS", efetivado: false },
						{ titulo: "DESENHO DA MONTAGEM DO INVERSOR EM MÃOS", efetivado: false },
						{ titulo: "CONFERÊNCIA DAS FERRAMENTAS NECESSÁRIAS FEITA", efetivado: false },
						{ titulo: "EM POSSE DOS EPIs", efetivado: false },
						{ titulo: "EM POSSE DA ESCADA", efetivado: false },
					],
					arquivos: [
						{ titulo: "FOTO DO CONJUNTO ESCADA (ESCADA AMARRADA, CONES, CORRENTE E PLACA DE ALERTA)", efetivado: false, condicao: { aplicavel: false } },
					],
				},
				{
					titulo: "ETAPA TELHADO",
					controles: [
						{ titulo: "FIXAÇÃO E CONFERÊNCIA DOS SUPORTES COM APERTO DE TODOS OS PARAFUSOS", efetivado: false },
						{ titulo: "FIXAÇÃO DOS TRILHOS COM APERTO DE TODOS OS PARAFUSOS E CONFERIR TELHAS ALTAS E ONDAS BAIXAS", efetivado: false },
						{ titulo: "FIXAÇÃO DA MANTA ASFÁLTICA (PICHE) NAS SAÍDAS DOS GANCHOS, TELHAS ALTAS E ONDAS BAIXAS", efetivado: false },
						{ titulo: "EXECUÇÃO DO ATERRAMENTO DE TODOS OS TRILHOS E COLOCAR AS PONTAS DOS TERRAS PRA DENTRO DA LAJE", efetivado: false },
						{ titulo: "FIXAÇÃO DOS MICROS INVERSORES E ATERRARAMENTO DOS MESMOS", efetivado: false },
						{ titulo: "VERIFICAÇÃO SE TODAS AS CONEXÕES DE CORRENTE ALTERANADA DOS MICROS ESTÃO ESTANHADAS E ISOLADAS CORRETAMENTE", efetivado: false },
						{ titulo: "VERIFICAÇÃO SE OS TAPÕES FORAM COLOCADOS NO FINAL DOS MICROS INVERSORES", efetivado: false },
						{ titulo: "INSPEÇÃO VISUAL PRÉ-MONTAGEM SE ESTÁ TUDO CORRETO E CONFERIR SE TEM TELHAS QUEBRADAS", efetivado: false },
						{ titulo: "CONFERÊNCIA DA CONEXÃO EM SÉRIE DOS MÓDULOS E/OU DA CONEXÃO COM O MICRO", efetivado: false },
						{ titulo: "CONFERÊNCIA DE TELHAS QUEBRADAS", efetivado: false },
						{ titulo: "RETIRADA DE LIXOS EVENTUAIS (LIXO EM RUFOS E CALHAS, LIXO EM SAÍDAS DE ÁGUA, ABRAÇADEIRAS DESCARTADAS, ETC.)", efetivado: false },
						{ titulo: "FOTO DE CONCLUSÃO DA ETAPA E ENVIO NO WHATSAPP DA EQUIPE TÉCNICA", efetivado: false },
					],
					arquivos: [
						{ titulo: "FOTO(S) DA ETIQUETA DOS MÓDULOS", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO(S) DA ETIQUETA DOS INVERSORES", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FILMAGEM DE TODO O TELHADO (POR CIMA)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FILMAGEM DE TODO O TELHADO (POR BAIXO)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO(S) DOS TRILHOS MONTADOS", efetivado: false, condicao: { aplicavel: false } },
						{
							titulo: "FOTO(S)/FILMAGEM DOS MICROS/INVERSORES INSTALADOS",
							efetivado: false,
							condicao: { aplicavel: true, variavel: "topologia", igual: "MICRO-INVERSOR" },
						},
						{ titulo: "FOTO(S) DAS CONEXÕES DOS MICROS", efetivado: false, condicao: { aplicavel: true, variavel: "topologia", igual: "MICRO-INVERSOR" } },
						{ titulo: "FOTO(S) DOS PAINÉIS INSTALADOS", efetivado: false, condicao: { aplicavel: false } },
					],
				},
				{
					titulo: "ETAPA DE MONTAGEM MECÂNICA",
					controles: [
						{ titulo: "FIXAÇÃO DO INVERSOR, STRING BOX E QUADRO DE DISTRIBUIÇÃO GERAL(QDB)", efetivado: false },
						{ titulo: "EXECUÇÃO DE MONTAGEM CONFORME ESQUEMA", efetivado: false },
						{ titulo: "FIXAÇÃO DE CONDULETES E ELETRODUTOS", efetivado: false },
						{ titulo: "CONFERÊNCIA VISUAL PÓS-MONTAGEM", efetivado: false },
						{ titulo: "FIXAÇÃO DE ADESIVOS AMPÈRE", efetivado: false },
						{ titulo: "FOTO DE CONCLUSÃO DA ETAPA E ENVIO NO WHATSAPP DA EQUIPE TÉCNICA", efetivado: false },
						{ titulo: "FIXAÇÃO DA PLACA DE AVISO DE GERAÇÃO DISTRIBUÍDA", efetivado: false },
					],
					arquivos: [
						{ titulo: "FOTO DE FIXAÇÃO/MONTAGEM DO QUADRO CA", efetivado: false, condicao: { aplicavel: false } },
						{
							titulo: " FOTO(S)/FILMAGEM DA INFRAESTRUTURA ELÉTRICA (INVERSOR, STRINGBOX, CONDULETES, ELETRODUTOS)",
							efetivado: false,
							condicao: { aplicavel: true, variavel: "topologia", igual: "INVERSOR" },
						},
						{ titulo: "FOTO DE FIXAÇÃO DA PLADA DE GERAÇÃO DISTRIBUÍDA", efetivado: false, condicao: { aplicavel: false } },
					],
				},
				{
					titulo: "ETAPA DE LANÇAMENTO DOS CABOS CC E CA",
					controles: [
						{ titulo: "LANÇAMENTO DE CABOS, ELETRODUTOS, MANGUEIRA HIPERFLEX", efetivado: false },
						{ titulo: "FIXAÇÃO DAS ROLDANAS", efetivado: false },
						{ titulo: "LIGAÇÃO DOS EQUIPAMENTOS", efetivado: false },
						{ titulo: "VERIFICAÇÃO DAS CONEXÕES CC,CA, TERRAS, STRING E DPS", efetivado: false },
						{ titulo: "CONFERÊNCIA DOS BORNES DAS CONEXÕES", efetivado: false },
					],
					arquivos: [
						{
							titulo: "FOTO(S)/FILMAGEM DO CABEAMENTO LANÇADADO (ROLDANAS FIXADAS, ELETRODUTOS, MANGUEIRA)",
							efetivado: false,
							condicao: { aplicavel: false },
						},
						{ titulo: "FOTO/FILMAGEM DA CONEXÃO DO SISTEMA COM A REDE DO CLIENTE (QUADRO OU RAMAL)", efetivado: false, condicao: { aplicavel: false } },
					],
				},
				{
					titulo: "ETAPA DE FINALIZAÇÃO",
					controles: [
						{ titulo: "EXECUÇÃO DAS MEDIÇÕES", efetivado: false },
						{ titulo: "CONFERÊNCIA E RETIRADA DA SOBRA DE MATERIAIS", efetivado: false },
						{ titulo: "CONFERÊNCIA E RETIRADA DE FERRAMENTAS", efetivado: false },
						{ titulo: "CONFERÊNCIA E RETIRADA DE LIXOS", efetivado: false },
						{ titulo: "CONFERÊNCIA E RETIRADA DE EVENTUAIS TELHAS QUEBRADAS", efetivado: false },
						{ titulo: "HIGIENIZAÇÃO DOS CONDULETES", efetivado: false },
					],
					arquivos: [
						{ titulo: "FILMAGEM DO TESTE DE ÁGUA (VISTA DO TELHADO)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FILMAGEM DO TESTE DE ÁGUA (VISTA DA LAJE)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FILMAGEM DO PÓS TESTE DE ÁGUA (VISTA DO TELHADO)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FILMAGEM DO PÓS TESTE DE ÁGUA (VISTA DA LAJE)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO/FILMAGEM DA ANTENA/DATALOGGER/DTU PÓS CONFIGURAÇÃO", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO(S) DAS MEDIÇÕES DE CORRENTE E TENSÃO CC DE TODAS AS STRINGS", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO(S) DE TENSÃO CA FASE E LINHA NA ENTRADA DE ENERGIA", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTOS DE TENSÃO CA FASE E LINHA NO QUADRO CA ANTES DO DISJUNTOR", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTOS DE TENSÃO CA FASE E LINHA NO QUADRO CA DEPOIS DO DISJUNTOR", efetivado: false, condicao: { aplicavel: false } },
					],
				},
			],
		},
	},
	{
		id: 4,
		label: "MANUTENÇÃO PREVENTIVA",
		value: "MANUTENÇÃO PREVENTIVA",
		report: {
			aplicavel: true,
			secoes: [
				{
					titulo: "EXECUÇÃO DE MANUTENÇÃO",
					controles: [
						{ titulo: "LIMPEZA DOS MÓDULOS", efetivado: false },
						{ titulo: "LIMPEZA DOS INVERSORES", efetivado: false },
						{ titulo: "TESTES E CONFERÊNCIAS CC E CA", efetivado: false },
						{ titulo: "CONFERÊNCIA DOS CONECTORES", efetivado: false },
						{ titulo: "CONFERÊNCIA DOS GRAMPOS (FINAL E/OU INTERMEDIÁRIOS)", efetivado: false },
						{ titulo: "REVISÃO DO MADEIRAMENTO", efetivado: false },
					],
					arquivos: [
						{ titulo: "FOTO DOS PAINÉIS PRÉ-LIMPEZA", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO(S) DE IRREGULARIDADES E CORREÇÃO (SE HOUVER)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DOS PAINÉIS PÓS-LIMPEZA", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DO(S) QUADRO(S), STRING BOX (QUANDO HOUVER) E INVERSOR(ES)", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DA INFRAESTRUTURA ELETROMECANICA LIMPA", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DOS TESTES DE TENSÃO CC E CA", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DO SISTEMA LIGADO", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DA ORDEM ASSINADA", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FOTO DO TERMO ASSINADO PELO CLIENTE", efetivado: false, condicao: { aplicavel: false } },
						{ titulo: "FILMAGEM TESTE DE ÁGUA", efetivado: false, condicao: { aplicavel: false } },
					],
				},
			],
		},
	},
	{ id: 5, label: "MANUTENÇÃO CORRETIVA", value: "MANUTENÇÃO CORRETIVA" },
	{ id: 6, label: "OUTROS", value: "OUTROS" },
];

type GetServiceOrderCategoryReportParams = {
	category: string;
	conditionData: {
		uf: string;
		cidade: string;
		topologia: "MICRO-INVERSOR" | "INVERSOR" | string;
	};
};

export function getServiceOrderCategoryReport({ category, conditionData }: GetServiceOrderCategoryReportParams) {
	const report = ServiceOrderCategoriesReports.find((item) => item.value === category)?.report;
	console.log("REPORT");
	if (!report) return null;

	const secoes = report.secoes.map((secao) => {
		// Validating each files will be applicable and required given the conditionData
		const arquivos = secao.arquivos.filter((arquivo) => {
			const condicao = arquivo.condicao;
			// In case there is not a condition defined, returning true
			if (!condicao.aplicavel) return true;

			// In casee there is a condiition defined, comparing the value from condition data to the reference value
			const comparisonValue = conditionData[condicao.variavel as keyof typeof conditionData];

			const comparisonReference = condicao.igual;

			return comparisonValue == comparisonReference;
		});
		return { ...secao, arquivos };
	});

	return { ...report, secoes };
}

// const MontagemReport: TServiceOrderReport = {
//   aplicavel: true,
//   secoes: [
//     {
//       titulo: 'ETAPA DE ENTRADA',
//       controles: [
//         { titulo: 'DESENHO DA MONTAGEM NO TELHADO EM MÃOS', efetivado: false },
//         { titulo: 'DIAGRAMA UNIFILAR EM MÃOS', efetivado: false },
//         { titulo: 'DESENHO DA MONTAGEM DO INVERSOR EM MÃOS', efetivado: false },
//         { titulo: 'CONFERÊNCIA DAS FERRAMENTAS NECESSÁRIAS FEITA', efetivado: false },
//         { titulo: 'EM POSSE DOS EPIs', efetivado: false },
//         { titulo: 'EM POSSE DA ESCADA', efetivado: false },
//       ],
//       arquivos: [{ titulo: 'FOTO DO CONJUNTO ESCADA (ESCADA AMARRADA, CONES, CORRENTE E PLACA DE ALERTA)', efetivado: false, condicao: { aplicavel: false } }],
//     },
//     {
//       titulo: 'ETAPA TELHADO',
//       controles: [
//         { titulo: 'FIXAÇÃO E CONFERÊNCIA DOS SUPORTES COM APERTO DE TODOS OS PARAFUSOS', efetivado: false },
//         { titulo: 'FIXAÇÃO DOS TRILHOS COM APERTO DE TODOS OS PARAFUSOS E CONFERIR TELHAS ALTAS E ONDAS BAIXAS', efetivado: false },
//         { titulo: 'FIXAÇÃO DA MANTA ASFÁLTICA (PICHE) NAS SAÍDAS DOS GANCHOS, TELHAS ALTAS E ONDAS BAIXAS', efetivado: false },
//         { titulo: 'EXECUÇÃO DO ATERRAMENTO DE TODOS OS TRILHOS E COLOCAR AS PONTAS DOS TERRAS PRA DENTRO DA LAJE', efetivado: false },
//         { titulo: 'FIXAÇÃO DOS MICROS INVERSORES E ATERRARAMENTO DOS MESMOS', efetivado: false },
//         { titulo: 'VERIFICAÇÃO SE TODAS AS CONEXÕES DE CORRENTE ALTERANADA DOS MICROS ESTÃO ESTANHADAS E ISOLADAS CORRETAMENTE', efetivado: false },
//         { titulo: 'VERIFICAÇÃO SE OS TAPÕES FORAM COLOCADOS NO FINAL DOS MICROS INVERSORES', efetivado: false },
//         { titulo: 'INSPEÇÃO VISUAL PRÉ-MONTAGEM SE ESTÁ TUDO CORRETO E CONFERIR SE TEM TELHAS QUEBRADAS', efetivado: false },
//         { titulo: 'CONFERÊNCIA DA CONEXÃO EM SÉRIE DOS MÓDULOS E/OU DA CONEXÃO COM O MICRO', efetivado: false },
//         { titulo: 'CONFERÊNCIA DE TELHAS QUEBRADAS', efetivado: false },
//         { titulo: 'RETIRADA DE LIXOS EVENTUAIS (LIXO EM RUFOS E CALHAS, LIXO EM SAÍDAS DE ÁGUA, ABRAÇADEIRAS DESCARTADAS, ETC.)', efetivado: false },
//         { titulo: 'FOTO DE CONCLUSÃO DA ETAPA E ENVIO NO WHATSAPP DA EQUIPE TÉCNICA', efetivado: false },
//       ],
//       arquivos: [
//         { titulo: 'FOTO(S) DA ETIQUETA DOS MÓDULOS', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO(S) DA ETIQUETA DOS INVERSORES', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FILMAGEM DE TODO O TELHADO (POR CIMA)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FILMAGEM DE TODO O TELHADO (POR BAIXO)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO(S) DOS TRILHOS MONTADOS', efetivado: false, condicao: { aplicavel: false } },
//         {
//           titulo: 'FOTO(S)/FILMAGEM DOS MICROS/INVERSORES INSTALADOS',
//           efetivado: false,
//           condicao: { aplicavel: true, variavel: 'topologia', igual: 'MICRO-INVERSOR' },
//         },
//         { titulo: 'FOTO(S) DAS CONEXÕES DOS MICROS', efetivado: false, condicao: { aplicavel: true, variavel: 'topologia', igual: 'MICRO-INVERSOR' } },
//         { titulo: 'FOTO(S) DOS PAINÉIS INSTALADOS', efetivado: false, condicao: { aplicavel: false } },
//       ],
//     },
//     {
//       titulo: 'ETAPA DE MONTAGEM MECÂNICA',
//       controles: [
//         { titulo: 'FIXAÇÃO DO INVERSOR, STRING BOX E QUADRO DE DISTRIBUIÇÃO GERAL(QDB)', efetivado: false },
//         { titulo: 'EXECUÇÃO DE MONTAGEM CONFORME ESQUEMA', efetivado: false },
//         { titulo: 'FIXAÇÃO DE CONDULETES E ELETRODUTOS', efetivado: false },
//         { titulo: 'CONFERÊNCIA VISUAL PÓS-MONTAGEM', efetivado: false },
//         { titulo: 'FIXAÇÃO DE ADESIVOS AMPÈRE', efetivado: false },
//         { titulo: 'FOTO DE CONCLUSÃO DA ETAPA E ENVIO NO WHATSAPP DA EQUIPE TÉCNICA', efetivado: false },
//         { titulo: 'FIXAÇÃO DA PLACA DE AVISO DE GERAÇÃO DISTRIBUÍDA', efetivado: false },
//       ],
//       arquivos: [
//         { titulo: 'FOTO DE FIXAÇÃO/MONTAGEM DO QUADRO CA', efetivado: false, condicao: { aplicavel: false } },
//         {
//           titulo: ' FOTO(S)/FILMAGEM DA INFRAESTRUTURA ELÉTRICA (INVERSOR, STRINGBOX, CONDULETES, ELETRODUTOS)',
//           efetivado: false,
//           condicao: { aplicavel: true, variavel: 'topologia', igual: 'INVERSOR' },
//         },
//         { titulo: 'FOTO DE FIXAÇÃO DA PLADA DE GERAÇÃO DISTRIBUÍDA', efetivado: false, condicao: { aplicavel: false } },
//       ],
//     },
//     {
//       titulo: 'ETAPA DE LANÇAMENTO DOS CABOS CC E CA',
//       controles: [
//         { titulo: 'LANÇAMENTO DE CABOS, ELETRODUTOS, MANGUEIRA HIPERFLEX', efetivado: false },
//         { titulo: 'FIXAÇÃO DAS ROLDANAS', efetivado: false },
//         { titulo: 'LIGAÇÃO DOS EQUIPAMENTOS', efetivado: false },
//         { titulo: 'VERIFICAÇÃO DAS CONEXÕES CC,CA, TERRAS, STRING E DPS', efetivado: false },
//         { titulo: 'CONFERÊNCIA DOS BORNES DAS CONEXÕES', efetivado: false },
//       ],
//       arquivos: [
//         { titulo: 'FOTO(S)/FILMAGEM DO CABEAMENTO LANÇADADO (ROLDANAS FIXADAS, ELETRODUTOS, MANGUEIRA)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO/FILMAGEM DA CONEXÃO DO SISTEMA COM A REDE DO CLIENTE (QUADRO OU RAMAL)', efetivado: false, condicao: { aplicavel: false } },
//       ],
//     },
//     {
//       titulo: 'ETAPA DE FINALIZAÇÃO',
//       controles: [
//         { titulo: 'EXECUÇÃO DAS MEDIÇÕES', efetivado: false },
//         { titulo: 'CONFERÊNCIA E RETIRADA DA SOBRA DE MATERIAIS', efetivado: false },
//         { titulo: 'CONFERÊNCIA E RETIRADA DE FERRAMENTAS', efetivado: false },
//         { titulo: 'CONFERÊNCIA E RETIRADA DE LIXOS', efetivado: false },
//         { titulo: 'CONFERÊNCIA E RETIRADA DE EVENTUAIS TELHAS QUEBRADAS', efetivado: false },
//         { titulo: 'HIGIENIZAÇÃO DOS CONDULETES', efetivado: false },
//       ],
//       arquivos: [
//         { titulo: 'FILMAGEM DO TESTE DE ÁGUA (VISTA DO TELHADO)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FILMAGEM DO TESTE DE ÁGUA (VISTA DA LAJE)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FILMAGEM DO PÓS TESTE DE ÁGUA (VISTA DO TELHADO)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FILMAGEM DO PÓS TESTE DE ÁGUA (VISTA DA LAJE)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO/FILMAGEM DA ANTENA/DATALOGGER/DTU PÓS CONFIGURAÇÃO', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO(S) DAS MEDIÇÕES DE CORRENTE E TENSÃO CC DE TODAS AS STRINGS', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO(S) DE TENSÃO CA FASE E LINHA NA ENTRADA DE ENERGIA', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTOS DE TENSÃO CA FASE E LINHA NO QUADRO CA ANTES DO DISJUNTOR', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTOS DE TENSÃO CA FASE E LINHA NO QUADRO CA DEPOIS DO DISJUNTOR', efetivado: false, condicao: { aplicavel: false } },
//       ],
//     },
//   ],
// }

// const ManutencaoPreventivaReport: TServiceOrderReport = {
//   aplicavel: true,
//   secoes: [
//     {
//       titulo: 'EXECUÇÃO DE MANUTENÇÃO',
//       controles: [
//         { titulo: 'LIMPEZA DOS MÓDULOS', efetivado: false },
//         { titulo: 'LIMPEZA DOS INVERSORES', efetivado: false },
//         { titulo: 'TESTES E CONFERÊNCIAS CC E CA', efetivado: false },
//         { titulo: 'CONFERÊNCIA DOS CONECTORES', efetivado: false },
//         { titulo: 'CONFERÊNCIA DOS GRAMPOS (FINAL E/OU INTERMEDIÁRIOS)', efetivado: false },
//         { titulo: 'REVISÃO DO MADEIRAMENTO', efetivado: false },
//       ],
//       arquivos: [
//         { titulo: 'FOTO DOS PAINÉIS PRÉ-LIMPEZA', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO(S) DE IRREGULARIDADES E CORREÇÃO (SE HOUVER)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DOS PAINÉIS PÓS-LIMPEZA', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DO(S) QUADRO(S), STRING BOX (QUANDO HOUVER) E INVERSOR(ES)', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DA INFRAESTRUTURA ELETROMECANICA LIMPA', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DOS TESTES DE TENSÃO CC E CA', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DO SISTEMA LIGADO', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DA ORDEM ASSINADA', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DO TERMO ASSINADO PELO CLIENTE', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FILMAGEM TESTE DE ÁGUA', efetivado: false, condicao: { aplicavel: false } },
//       ],
//     },
//   ],
// }
// const PadraoReport: TServiceOrderReport = {
//   aplicavel: true,
//   secoes: [
//     {
//       titulo: 'EXECUÇÃO DE PADRÃO',
//       controles: [
//         { titulo: 'MONTAGEM DO PADRÃO', efetivado: false },
//         { titulo: 'LANÇAMENTO DO RAMAL', efetivado: false },
//         { titulo: 'REALIMENTAÇÃO', efetivado: false },
//       ],
//       arquivos: [
//         { titulo: 'PADRÃO MONTADO', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DAS LIGAÇÕES FEITAS', efetivado: false, condicao: { aplicavel: false } },
//         { titulo: 'FOTO DO DISJUNTOR', efetivado: false, condicao: { aplicavel: false } },
//       ],
//     },
//   ],
// }
