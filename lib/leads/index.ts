import { CreditCard, PiggyBank, Receipt, SparkleIcon } from 'lucide-react';

export const DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES = [
  {
    icon: SparkleIcon,
    identifier: 'possui_interesse',
    name: 'INTERESSADO',
    call: 'Responda se o cliente está interessado em solar.',
    inputType: 'select',
    inputPlaceholder: 'Selecione se o cliente está interessado em solar.',
    inputOptions: [
      { id: 1, label: 'SIM', value: 'SIM', weightMultipler: 1 },
      { id: 2, label: 'NÃO', value: 'NÃO', weightMultipler: 0 },
    ],
    weight: 5,
  },
  {
    icon: Receipt,
    identifier: 'valor_conta_energia',
    name: 'VALOR DA CONTA DE ENERGIA',
    call: 'Escolha qual a faixa de valor da conta de energia do cliente.',
    inputType: 'select',
    inputPlaceholder: 'Selecione a faixa de valor da conta de energia do cliente.',
    inputOptions: [
      { id: 1, label: 'R$ 0,00 à R$ 100,00', value: 'R$ 0,00 à R$ 100,00', weightMultipler: 1 },
      { id: 2, label: 'R$ 100,00 à R$ 300,00', value: 'R$ 100,00 à R$ 200,00', weightMultipler: 1 },
      { id: 3, label: 'R$ 300,00 à R$ 500,00', value: 'R$ 300,00 à R$ 500,00', weightMultipler: 1 },
      { id: 4, label: 'R$ 500,00 à R$ 1000,00', value: 'R$ 500,00 à R$ 1000,00', weightMultipler: 1 },
      { id: 5, label: '+ R$ 1000,00', value: '+ R$ 1000,00', weightMultipler: 1 },
    ],
    weight: 1,
  },
  {
    icon: PiggyBank,
    identifier: 'possui_capital',
    name: 'POSSUI CAPITAL PARA INVESTIR',
    call: 'Escolha se o cliente possui capital para investir.',
    inputType: 'select',
    inputPlaceholder: 'Selecione se o cliente possui capital para investir.',
    inputOptions: [
      { id: 1, label: 'SIM', value: 'SIM', weightMultipler: 1 },
      { id: 2, label: 'NÃO', value: 'NÃO', weightMultipler: 0.5 },
    ],
    weight: 3,
  },
  {
    icon: CreditCard,
    identifier: 'credito_bancario',
    name: 'APTO A RECORRER À CREDITO BANCÁRIO',
    call: 'Responda se o cliente está apto a recorrer à crédito bancário.',
    inputType: 'select',
    inputPlaceholder: 'Selecione se o cliente está apto a recorrer à crédito bancário.',
    inputOptions: [
      { id: 1, label: 'SIM', value: 'SIM', weightMultipler: 1 },
      { id: 2, label: 'NÃO', value: 'NÃO', weightMultipler: 0.5 },
    ],
    weight: 1,
  },
];
