import { TServiceOrderReport } from './utils/schemas/service-order.schema'

const MontagemReport: TServiceOrderReport = {
  aplicavel: true,
  secoes: [
    {
      titulo: 'ETAPA DE ENTRADA',
      controles: [
        { titulo: 'DESENHO DA MONTAGEM NO TELHADO EM MÃOS', efetivado: false },
        { titulo: 'DIAGRAMA UNIFILAR EM MÃOS', efetivado: false },
        { titulo: 'DESENHO DA MONTAGEM DO INVERSOR EM MÃOS', efetivado: false },
        { titulo: 'CONFERÊNCIA DAS FERRAMENTAS NECESSÁRIAS FEITA', efetivado: false },
        { titulo: 'EM POSSE DOS EPIs', efetivado: false },
        { titulo: 'EM POSSE DA ESCADA', efetivado: false },
      ],
      arquivos: [{ titulo: 'FOTO DO CONJUNTO ESCADA (ESCADA AMARRADA, CONES, CORRENTE E PLACA DE ALERTA)', efetivado: false, condicao: { aplicavel: false } }],
    },
    {
      titulo: 'ETAPA TELHADO',
      controles: [
        { titulo: 'FIXAÇÃO E CONFERÊNCIA DOS SUPORTES COM APERTO DE TODOS OS PARAFUSOS', efetivado: false },
        { titulo: 'FIXAÇÃO DOS TRILHOS COM APERTO DE TODOS OS PARAFUSOS E CONFERIR TELHAS ALTAS E ONDAS BAIXAS', efetivado: false },
        { titulo: 'FIXAÇÃO DA MANTA ASFÁLTICA (PICHE) NAS SAÍDAS DOS GANCHOS, TELHAS ALTAS E ONDAS BAIXAS', efetivado: false },
        { titulo: 'EXECUÇÃO DO ATERRAMENTO DE TODOS OS TRILHOS E COLOCAR AS PONTAS DOS TERRAS PRA DENTRO DA LAJE', efetivado: false },
        { titulo: 'FIXAÇÃO DOS MICROS INVERSORES E ATERRARAMENTO DOS MESMOS', efetivado: false },
        { titulo: 'VERIFICAÇÃO SE TODAS AS CONEXÕES DE CORRENTE ALTERANADA DOS MICROS ESTÃO ESTANHADAS E ISOLADAS CORRETAMENTE', efetivado: false },
        { titulo: 'VERIFICAÇÃO SE OS TAPÕES FORAM COLOCADOS NO FINAL DOS MICROS INVERSORES', efetivado: false },
        { titulo: 'INSPEÇÃO VISUAL PRÉ-MONTAGEM SE ESTÁ TUDO CORRETO E CONFERIR SE TEM TELHAS QUEBRADAS', efetivado: false },
        { titulo: 'CONFERÊNCIA DA CONEXÃO EM SÉRIE DOS MÓDULOS E/OU DA CONEXÃO COM O MICRO', efetivado: false },
        { titulo: 'CONFERÊNCIA DE TELHAS QUEBRADAS', efetivado: false },
        { titulo: 'RETIRADA DE LIXOS EVENTUAIS (LIXO EM RUFOS E CALHAS, LIXO EM SAÍDAS DE ÁGUA, ABRAÇADEIRAS DESCARTADAS, ETC.)', efetivado: false },
        { titulo: 'FOTO DE CONCLUSÃO DA ETAPA E ENVIO NO WHATSAPP DA EQUIPE TÉCNICA', efetivado: false },
      ],
      arquivos: [
        { titulo: 'FOTO(S) DA ETIQUETA DOS MÓDULOS', efetivado: false, condicao: { aplicavel: false } },
        { titulo: 'FOTO(S) DA ETIQUETA DOS INVERSORES', efetivado: false, condicao: { aplicavel: false } },
        { titulo: 'FILMAGEM DE TODO O TELHADO (POR CIMA)', efetivado: false, condicao: { aplicavel: false } },
        { titulo: 'FILMAGEM DE TODO O TELHADO (POR BAIXO)', efetivado: false, condicao: { aplicavel: false } },
        { titulo: 'FOTO(S) DOS TRILHOS MONTADOS', efetivado: false, condicao: { aplicavel: false } },
        {
          titulo: 'FOTO(S)/FILMAGEM DOS MICROS/INVERSORES INSTALADOS',
          efetivado: false,
          condicao: { aplicavel: true, variavel: 'topologia', igual: 'MICRO-INVERSOR' },
        },
        { titulo: 'FOTO(S) DAS CONEXÕES DOS MICROS', efetivado: false, condicao: { aplicavel: true, variavel: 'topologia', igual: 'MICRO-INVERSOR' } },
        { titulo: 'FOTO(S) DOS PAINÉIS INSTALADOS', efetivado: false, condicao: { aplicavel: false } },
      ],
    },
    {
      titulo: 'ETAPA DE MONTAGEM MECÂNICA',
      controles: [
        { titulo: 'FIXAÇÃO DO INVERSOR, STRING BOX E QUADRO DE DISTRIBUIÇÃO GERAL(QDB)', efetivado: false },
        { titulo: 'EXECUÇÃO DE MONTAGEM CONFORME ESQUEMA', efetivado: false },
        { titulo: 'FIXAÇÃO DE CONDULETES E ELETRODUTOS', efetivado: false },
        { titulo: 'CONFERÊNCIA VISUAL PÓS-MONTAGEM', efetivado: false },
        { titulo: 'FIXAÇÃO DE ADESIVOS AMPÈRE', efetivado: false },
        { titulo: 'FOTO DE CONCLUSÃO DA ETAPA E ENVIO NO WHATSAPP DA EQUIPE TÉCNICA', efetivado: false },
        { titulo: 'FIXAÇÃO DA PLACA DE AVISO DE GERAÇÃO DISTRIBUÍDA', efetivado: false },
      ],
      arquivos: [
        { titulo: 'FOTO DE FIXAÇÃO/MONTAGEM DO QUADRO CA', efetivado: false, condicao: { aplicavel: false } },
        {
          titulo: ' FOTO(S)/FILMAGEM DA INFRAESTRUTURA ELÉTRICA (INVERSOR, STRINGBOX, CONDULETES, ELETRODUTOS)',
          efetivado: false,
          condicao: { aplicavel: true, variavel: 'topologia', igual: 'INVERSOR' },
        },
        { titulo: 'FOTO DE FIXAÇÃO DA PLADA DE GERAÇÃO DISTRIBUÍDA', efetivado: false, condicao: { aplicavel: false } },
      ],
    },
    {
      titulo: 'ETAPA DE LANÇAMENTO DOS CABOS CC E CA',
      controles: [
        { titulo: 'LANÇAMENTO DE CABOS, ELETRODUTOS, MANGUEIRA HIPERFLEX', efetivado: false },
        { titulo: 'FIXAÇÃO DAS ROLDANAS', efetivado: false },
        { titulo: 'LIGAÇÃO DOS EQUIPAMENTOS', efetivado: false },
        { titulo: 'VERIFICAÇÃO DAS CONEXÕES CC,CA, TERRAS, STRING E DPS', efetivado: false },
        { titulo: 'CONFERÊNCIA DOS BORNES DAS CONEXÕES', efetivado: false },
      ],
      arquivos: [
        { titulo: 'FOTO(S)/FILMAGEM DO CABEAMENTO LANÇADADO (ROLDANAS FIXADAS, ELETRODUTOS, MANGUEIRA)', efetivado: false, condicao: { aplicavel: false } },
        { titulo: 'FOTO/FILMAGEM DA CONEXÃO DO SISTEMA COM A REDE DO CLIENTE (QUADRO OU RAMAL)', efetivado: false, condicao: { aplicavel: false } },
      ],
    },
    { titulo: 'ETAPA DE FINALIZAÇÃO' },
  ],
}
