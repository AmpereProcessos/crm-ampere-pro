export const AllProcessTracked = {
  CONTRATOS: [
    {
      id: 'contract_formulation',
      processo: 'FORMULAÇÃO DE CONTRATO',
      descricao:
        'Processo de formulação dos contratos para liberação para coleta de assinatura. Compreendido pelo período entre a data de solicitação do contrato até a data de liberação do contrato.',
    },
    {
      id: 'contract_signature_collection',
      processo: 'COLETA DE ASSINATURA DO CONTRATO',
      descricao:
        'Processo de coleta de assinaturas à partir da liberação do contrato. Compreendido pelo período entre a data de liberação do contrato até a data de assinatura do contrato.',
    },
  ],
  HOMOLOGAÇÃO: [
    {
      id: 'homologation_initiation',
      processo: 'INICIAÇÃO DE PROJETO',
      descricao:
        'Processo de inicialização do projeto/homologação. Compreende o período entre a liberação para projeto/homologação até o início efetivo da elaboração (das documentações) da homologação.',
    },
    {
      id: 'homologation_documents_elaboration',
      processo: 'ELABORAÇÃO DA DOCUMENTAÇÃO',
      descricao:
        'Processo de elaboração dos documentos. Refere-se ao tempo entre o início dos trabalhos de elaboração de documentos até a conclusão da elaboração desses (e consequente emissão envio para pagamento de ART).',
    },
    {
      id: 'homologation_access_request',
      processo: 'SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA',
      descricao:
        'Processo de solicitação de acesso a concessionária. Refere-se ao tempo necessário, uma vez concluídas as documentações, para entrada com a solicitação de acesso. Esse tempo incluí o tempo necessário para pagamento e efetivação da ART.',
    },
    {
      id: 'homologation_access_approval',
      processo: 'APROVAÇÃO DA CONCESSIONÁRIA',
      descricao:
        'Processo de aprovação da solicitação de acesso. Refere-se ao tempo necessário entre a solicitação de acesso e a aprovação do parecer de acesso pela concessionária.',
    },
  ],
  SUPRIMENTAÇÃO: [
    {
      id: 'supplementation_release',
      processo: 'LIBERAÇÃO PARA COMPRA',
      descricao:
        'Processo de liberação para compra. Pode envolver viabilização de recursos. Compreende o período entre a data de assinatura do contrato até a data de liberação para compra.',
    },
    {
      id: 'supplementation_order',
      processo: 'COMPRA DE PRODUTOS',
      descricao: 'Processo de compra dos equipamentos ou produtos do projeto. Compreende o período entre a data de liberação para compra até a data do pedido.',
    },
    {
      id: 'supplementation_delivery',
      processo: 'ENTREGA DE PRODUTOS',
      descricao: 'Processo de entrega dos produtos/equipamentos. Compreende o período entre a data do pedido até a data de entrega.',
    },
  ],
  EXECUÇÃO: [
    {
      id: 'execution_planning_post_delivery',
      processo: 'PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO',
      descricao:
        'Processo de preparação (estudo técnico, agendamento, separação de materiais) da execução do serviço à partir da liberação para execução (entrega). Compreende o período entre a data de entrega até a data de entrada na obra.',
    },
    {
      id: 'execution_planning_post_contract',
      processo: 'PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO',
      descricao:
        'Processo de preparação (estudo técnico, agendamento, separação de materiais) da execução do serviço à partir da liberação para execução (assinatura de contrato). Compreende o período entre a data de assinatura de contrato até a data de entrada na obra.',
    },
    {
      id: 'execution',
      processo: 'EXECUÇÃO',
      descricao:
        'Processo de execução do serviço uma vez iniciado o serviço. Compreende o período entre a data de entrada na obra até a data de saída da obra.',
    },
  ],
  COMISSIONAMENTO: [
    {
      id: 'homologation_vistory_request',
      processo: 'SOLICITAÇÃO DE VISTORIA',
      descricao: 'Processo de solicitação de vistoria a concessionária. Refere-se ao tempo necessário, uma vez concluída a obra, para o pedido de vistoria.',
    },
    {
      id: 'homologation_vistory_approval',
      processo: 'APROVAÇÃO DA VISTORIA',
      descricao:
        'Processo de vistoria da concessionária. Refere-se ao tempo entre o pedido de vistoria a concessionária até a realização da vistoria (troca do medidor).',
    },
  ],
}
export const ContractProcessesIds = AllProcessTracked.CONTRATOS.map((p) => p.id)
export const HomologationProcessesIds = AllProcessTracked.HOMOLOGAÇÃO.map((p) => p.id)
export const SupplyProcessesIds = AllProcessTracked.SUPRIMENTAÇÃO.map((p) => p.id)
export const ExecutionProcessesIds = AllProcessTracked.EXECUÇÃO.map((p) => p.id)
export const CommissioningProcessesIds = AllProcessTracked.COMISSIONAMENTO.map((p) => p.id)
export const ProcessTrackedByProjectType = {
  'SISTEMA FOTOVOLTAICO': [
    'contract_formulation',
    'contract_signature_collection',
    'homologation_initiation',
    'homologation_documents_elaboration',
    'homologation_access_request',
    'homologation_access_approval',
    'homologation_vistory_request',
    'homologation_vistory_approval',
    'supplementation_release',
    'supplementation_order',
    'supplementation_delivery',
    'execution_planning_post_delivery',
    'execution',
  ],
  'OPERAÇÃO E MANUTENÇÃO': ['contract_formulation', 'contract_signature_collection', 'execution_planning_post_contract', 'execution'],
}
