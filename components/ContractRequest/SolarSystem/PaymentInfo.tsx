import NumberInput from '@/components/Inputs/NumberInput'
import SelectInput from '@/components/Inputs/SelectInput'
import TextInput from '@/components/Inputs/TextInput'

import { formatToCPForCNPJ, formatToPhone } from '@/utils/methods'
import { IContractRequest } from '@/utils/models'
import { useCreditors } from '@/utils/queries/utils'
import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema'
import { TProposalPaymentMethodItem } from '@/utils/schemas/proposal.schema'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
type PaymentInfoProps = {
  requestInfo: TContractRequest
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>
  paymentMethods: TProposalPaymentMethodItem[]
  goToPreviousStage: () => void
  goToNextStage: () => void
}
function PaymentInfo({ requestInfo, setRequestInfo, paymentMethods, goToPreviousStage, goToNextStage }: PaymentInfoProps) {
  const { data: creditors } = useCreditors()

  function setPaymentInfoSameAsContract() {
    setRequestInfo((prev) => ({
      ...prev,
      nomePagador: prev.nomeDoContrato,
      contatoPagador: prev.telefone,
      cpf_cnpjNF: prev.cpf_cnpj,
    }))
  }
  function validateFields() {
    if (requestInfo.nomePagador.trim().length < 3) {
      toast.error('Por favor, preencha o nome do pagador.')
      return false
    }
    if (requestInfo.contatoPagador.trim().length < 8) {
      toast.error('Por favor, preencha o contato do pagador.')
      return false
    }
    if (requestInfo.cpf_cnpjNF.trim().length < 11) {
      toast.error('Por favor, preencha um CPF/CPNJ válido para NF')
      return false
    }
    if (!requestInfo.necessidadeNFAdiantada) {
      toast.error('Por favor, preencha sobre a necessidade de NF adiantada.')
      return false
    }
    if (!requestInfo.necessidaInscricaoRural) {
      toast.error('Por favor, preencha sobre a necessidade de faturamento por inscrição rural.')
      return false
    }
    if (requestInfo.tipoDeServico == 'SISTEMA FOTOVOLTAICO') {
      if (!requestInfo.localEntrega) {
        toast.error('Por favor, preencha o local de entrega.')
        return false
      }
      if (!requestInfo.entregaIgualCobranca) {
        toast.error('Por favor, preencha se o endereço de entrega é igual ao de cobrança.')
        return false
      }
      if (!requestInfo.restricoesEntrega) {
        toast.error('Por favor, preencha as restrições para entrega.')
        return false
      }
    }

    if (requestInfo.valorContrato == null || requestInfo.valorContrato == 0) {
      toast.error('Por favor, preencha o valor do contrato fotovoltaico.')
      return false
    }
    if (!requestInfo.origemRecurso) {
      toast.error('Por favor, preencha a origem do recurso.')
      return false
    }
    if (requestInfo.formaDePagamento == 'NÃO DEFINIDO') {
      toast.error('Por favor, preencha a forma de pagamento.')
      return false
    }
    if (requestInfo.origemRecurso == 'FINANCIAMENTO' && !requestInfo.credor) {
      toast.error('Por favor, preencha o credor do financiamento.')
      return false
    }
    if (requestInfo.origemRecurso == 'FINANCIAMENTO' && requestInfo.nomeGerente.trim().length < 5) {
      toast.error('Por favor, preencha o nome do gerente.')
      return false
    }
    if (requestInfo.origemRecurso == 'FINANCIAMENTO' && requestInfo.contatoGerente.trim().length < 8) {
      toast.error('Por favor, preencha o contato do gerente.')
      return false
    }
    if (!requestInfo.necessidadeCodigoFiname) {
      toast.error('Por favor, preencha sobre a necessidade de Código FINAME')
      return false
    }
    return true
  }
  return (
    <div className="flex w-full grow flex-col bg-[#fff] pb-2">
      <span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS FINANCEIROS E NEGOCIAÇÃO</span>
      <div className="flex w-full grow flex-col">
        <button onClick={() => setPaymentInfoSameAsContract()} className="w-fit self-center rounded bg-[#15599a] p-2 text-xs font-medium text-white">
          Usar mesmas informações preenchidas para contrato
        </button>
        <div className="mt-2 flex flex-col gap-2 p-2 lg:grid lg:grid-cols-3">
          <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">DADOS DO PAGADOR</h1>
          <div className="flex items-center justify-center">
            <TextInput
              width={'450px'}
              label={'NOME DO PAGADOR'}
              placeholder="Preencha aqui o nome da pessoa/empresa que realizará o pagamento"
              editable={true}
              value={requestInfo.nomePagador}
              handleChange={(value) => setRequestInfo({ ...requestInfo, nomePagador: value })}
            />
          </div>
          <div className="flex items-center justify-center">
            <TextInput
              width={'450px'}
              label={'CONTATO DO PAGADOR'}
              placeholder="Preencha aqui o contato da pessoa que realizará o pagamento"
              editable={true}
              value={requestInfo.contatoPagador}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  contatoPagador: formatToPhone(value),
                })
              }
            />
          </div>
          <div className="flex items-center justify-center">
            <TextInput
              width={'450px'}
              label={'CPF/CNPJ PARA NF'}
              placeholder="Preencha aqui o CPF/CNPJ para faturamento do serviço/equipamentos."
              editable={true}
              value={requestInfo.cpf_cnpjNF}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  cpf_cnpjNF: formatToCPForCNPJ(value),
                })
              }
            />
          </div>
        </div>
        <div className="flex flex-col p-2">
          <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE N.F</h1>
          <div className="mt-2 flex flex-wrap justify-around gap-2">
            <SelectInput
              width={'450px'}
              label={'NECESSIDADE N.F ADIANTADA'}
              editable={true}
              value={requestInfo.necessidadeNFAdiantada}
              options={[
                {
                  id: 1,
                  label: 'NÃO',
                  value: 'NÃO',
                },
                {
                  id: 2,
                  label: 'SIM',
                  value: 'SIM',
                },
              ]}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  necessidadeNFAdiantada: value,
                })
              }
              selectedItemLabel="NÃO DEFINIDO"
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  necessidadeNFAdiantada: null,
                }))
              }}
            />
            <SelectInput
              width={'450px'}
              label={'NECESSIDADE DE INSCRIÇÃO RURAL NA N.F?'}
              editable={true}
              value={requestInfo.necessidaInscricaoRural}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  necessidaInscricaoRural: value,
                })
              }
              options={[
                {
                  id: 1,
                  label: 'NÃO',
                  value: 'NÃO',
                },
                {
                  id: 2,
                  label: 'SIM',
                  value: 'SIM',
                },
              ]}
              selectedItemLabel="NÃO DEFINIDO"
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  necessidaInscricaoRural: null,
                }))
              }}
            />
            {requestInfo.necessidaInscricaoRural == 'SIM' && (
              <TextInput
                width={'450px'}
                label={'INSCRIÇÃO RURAL'}
                placeholder="Preencha aqui a inscrição rural do cliente."
                editable={true}
                value={requestInfo.inscriçãoRural}
                handleChange={(value) => setRequestInfo({ ...requestInfo, inscriçãoRural: value })}
              />
            )}
          </div>
        </div>
        {requestInfo.tipoDeServico == 'SISTEMA FOTOVOLTAICO' ? (
          <div className="flex flex-col p-2">
            <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE A ENTREGA</h1>
            <div className="mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-2">
              <div className="col-span-2 flex items-center justify-center">
                <SelectInput
                  width={'450px'}
                  label={'LOCAL DE ENTREGA'}
                  options={[
                    {
                      id: 1,
                      label: 'MESMO DO PROJETO',
                      value: 'MESMO DO PROJETO',
                    },
                    {
                      id: 2,
                      label: 'LOCAL DIFERENTE DA INSTALAÇÃO (DESCRITO NAS OBSERVAÇÕES)',
                      value: 'LOCAL DIFERENTE DA INSTALAÇÃO (DESCRITO NAS OBSERVAÇÕES)',
                    },
                    {
                      id: 3,
                      label: 'ENTREGAR NA AMPÈRE(SOMENTE COM AUTORIZAÇÃO DO GERENTE COMERCIAL)',
                      value: 'ENTREGAR NA AMPÈRE(SOMENTE COM AUTORIZAÇÃO DO GERENTE COMERCIAL)',
                    },
                  ]}
                  editable={true}
                  value={requestInfo.localEntrega}
                  handleChange={(value) => setRequestInfo({ ...requestInfo, localEntrega: value })}
                  selectedItemLabel="NÃO DEFINIDO"
                  onReset={() => {
                    setRequestInfo((prev) => ({ ...prev, localEntrega: null }))
                  }}
                />
              </div>
              <div className="flex items-center justify-center">
                <SelectInput
                  width={'450px'}
                  label={'END. ENTREGA IGUAL COBRANÇA?'}
                  editable={true}
                  value={requestInfo.entregaIgualCobranca}
                  handleChange={(value) =>
                    setRequestInfo({
                      ...requestInfo,
                      entregaIgualCobranca: value,
                    })
                  }
                  options={[
                    {
                      id: 1,
                      label: 'SIM',
                      value: 'SIM',
                    },
                    {
                      id: 2,
                      label: 'NÃO',
                      value: 'NÃO',
                    },
                  ]}
                  selectedItemLabel="NÃO DEFINIDO"
                  onReset={() =>
                    setRequestInfo((prev) => ({
                      ...prev,
                      entregaIgualCobranca: null,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-center">
                <SelectInput
                  width={'450px'}
                  label={'HÁ RESTRIÇÕES PARA ENTREGA?'}
                  editable={true}
                  value={requestInfo.restricoesEntrega}
                  handleChange={(value) => setRequestInfo({ ...requestInfo, restricoesEntrega: value })}
                  options={[
                    {
                      id: 1,
                      label: 'SOMENTE HORARIO COMERCIAL',
                      value: 'SOMENTE HORARIO COMERCIAL',
                    },
                    {
                      id: 2,
                      label: 'NÃO HÁ RESTRIÇÕES',
                      value: 'NÃO HÁ RESTRIÇÕES',
                    },
                    {
                      id: 3,
                      label: 'CASA EM CONSTRUÇÃO',
                      value: 'CASA EM CONSTRUÇÃO',
                    },
                    {
                      id: 4,
                      label: 'NÃO PODE RECEBER EM HORARIO COMERCIAL',
                      value: 'NÃO PODE RECEBER EM HORARIO COMERCIAL',
                    },
                  ]}
                  selectedItemLabel="NÃO DEFINIDO"
                  onReset={() => {
                    setRequestInfo((prev) => ({
                      ...prev,
                      restricoesEntrega: null,
                    }))
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col p-2">
          <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE O PAGAMENTO</h1>
          <div className="mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-3">
            <div className="col-span-3 flex flex-col items-center justify-center gap-2">
              <NumberInput
                width={'100%'}
                label={'VALOR DO CONTRATO FOTOVOLTAICO(SEM CUSTOS ADICIONAIS)'}
                editable={true}
                value={requestInfo.valorContrato || null}
                placeholder={'Preencha aqui o valor do contrato (sem custos adicionais de estrutura/padrão/O&M, etc...'}
                handleChange={(value) =>
                  setRequestInfo((prev) => ({
                    ...prev,
                    valorContrato: Number(value),
                  }))
                }
              />
              <SelectInput
                width={'100%'}
                label={'ORIGEM DO RECURSO'}
                editable={true}
                value={requestInfo.origemRecurso}
                handleChange={(value) => setRequestInfo({ ...requestInfo, origemRecurso: value })}
                options={[
                  {
                    id: 1,
                    label: 'FINANCIAMENTO',
                    value: 'FINANCIAMENTO',
                  },
                  {
                    id: 2,
                    label: 'CAPITAL PRÓPRIO',
                    value: 'CAPITAL PRÓPRIO',
                  },
                ]}
                selectedItemLabel="NÃO DEFINIDO"
                onReset={() => {
                  setRequestInfo((prev) => ({ ...prev, origemRecurso: null }))
                }}
              />
            </div>
            {requestInfo.origemRecurso == 'FINANCIAMENTO' && (
              <div className="col-span-3 mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-3">
                <div className="flex items-center justify-center">
                  <SelectInput
                    width={'450px'}
                    label={'CREDOR'}
                    editable={true}
                    options={creditors?.map((c) => ({ id: c._id, label: c.valor, value: c.valor })) || []}
                    value={requestInfo.credor}
                    handleChange={(value) => setRequestInfo({ ...requestInfo, credor: value })}
                    selectedItemLabel="NÃO DEFINIDO"
                    onReset={() => {
                      setRequestInfo((prev) => ({ ...prev, credor: null }))
                    }}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <TextInput
                    width={'450px'}
                    label={'NOME DO GERENTE'}
                    placeholder="Preencha aqui o nome do gerente."
                    editable={true}
                    value={requestInfo.nomeGerente}
                    handleChange={(value) => setRequestInfo({ ...requestInfo, nomeGerente: value })}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <TextInput
                    width={'450px'}
                    label={'CONTATO DO GERENTE'}
                    placeholder="Preencha aqui o contato de telefone do gerente."
                    editable={true}
                    value={requestInfo.contatoGerente}
                    handleChange={(value) =>
                      setRequestInfo({
                        ...requestInfo,
                        contatoGerente: formatToPhone(value),
                      })
                    }
                  />
                </div>
              </div>
            )}
            <div className="flex items-center justify-center">
              <NumberInput
                width={'450px'}
                label={'SE CARTÃO OU CHEQUE, QUANTAS PARCELAS?'}
                placeholder="Preencha aqui o número de parcelas."
                editable={true}
                value={requestInfo.numParcelas || null}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    numParcelas: Number(value),
                    valorParcela: requestInfo.valorContrato ? Number((requestInfo.valorContrato / Number(value)).toFixed(2)) : 0,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-center">
              <NumberInput
                width={'450px'}
                label={'VALOR DA PARCELA'}
                placeholder="Preencha aqui o valor das parcelas."
                editable={true}
                value={requestInfo.valorParcela || null}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    valorParcela: Number(value),
                  })
                }
              />
            </div>
            <div className="flex items-center justify-center">
              <SelectInput
                width={'450px'}
                label={'NECESSIDADE CÓDIGO FINAME?'}
                editable={true}
                value={requestInfo.necessidadeCodigoFiname}
                options={[
                  {
                    id: 1,
                    label: 'NÃO',
                    value: 'NÃO',
                  },
                  {
                    id: 2,
                    label: 'SIM',
                    value: 'SIM',
                  },
                ]}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    necessidadeCodigoFiname: value,
                  })
                }
                selectedItemLabel="NÃO DEFINIDO"
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    necessidadeCodigoFiname: null,
                  }))
                }}
              />
            </div>
            {/* <div className="col-span-3 flex items-center justify-center">
              <SelectInput
                width={'450px'}
                label={'FORMA DE PAGAMENTO'}
                editable={true}
                options={paymentMethods.map((m) => ({ id: m.id, value: m.nome, label: m.nome }))}
                value={requestInfo.formaDePagamento}
                handleChange={(value) => {
                  const method = paymentMethods.find((p) => p.nome === value)
                  setRequestInfo({ ...requestInfo, formaDePagamento: method?.nome || undefined, formaDePagamentoId: method?.id })
                }}
                selectedItemLabel="NÃO DEFINIDO"
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    formaDePagamento: null,
                  }))
                }}
              />
            </div> */}
            <div className="col-span-3 flex items-center justify-center">
              <SelectInput
                width={'450px'}
                label={'FORMA DE PAGAMENTO'}
                editable={true}
                options={[
                  {
                    id: 1,
                    label: '80% A VISTA NA ENTRADA + 20% NA FINALIZAÇÃO DA INSTALAÇÃO',
                    value: '80% A VISTA NA ENTRADA + 20% NA FINALIZAÇÃO DA INSTALAÇÃO',
                  },
                  {
                    id: 2,
                    label: '100% A VISTA ATRAVÉS DE FINANCIAMENTO BANCÁRIO',
                    value: '100% A VISTA ATRAVÉS DE FINANCIAMENTO BANCÁRIO',
                  },
                  {
                    id: 3,
                    label: '100% PARCELADO NO CARTÃO DE CRÉDITO',
                    value: '100% PARCELADO NO CARTÃO DE CRÉDITO',
                  },
                  {
                    id: 4,
                    label: '100% À VISTA NO DINHEIRO/DÉBITO/PIX',
                    value: '100% À VISTA NO DINHEIRO/DÉBITO/PIX',
                  },
                  {
                    id: 5,
                    label: 'NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)',
                    value: 'NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)',
                  },
                ]}
                value={requestInfo.formaDePagamento}
                handleChange={(value) => setRequestInfo({ ...requestInfo, formaDePagamento: value })}
                selectedItemLabel="NÃO DEFINIDO"
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    formaDePagamento: null,
                  }))
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-2 flex w-full flex-col items-center self-center px-2">
          <span className="font-raleway text-center text-sm font-bold uppercase">DESCRIÇÃO DA NEGOCIAÇÃO</span>
          <textarea
            placeholder={'Descreva aqui a negociação'}
            value={requestInfo.descricaoNegociacao}
            onChange={(e) =>
              setRequestInfo({
                ...requestInfo,
                descricaoNegociacao: e.target.value,
              })
            }
            className="block h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
        <button
          onClick={() => {
            goToPreviousStage()
          }}
          className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
        >
          Voltar
        </button>
        <button
          onClick={() => {
            if (validateFields()) goToNextStage()
          }}
          className="rounded p-2 font-bold hover:bg-black hover:text-white"
        >
          Prosseguir
        </button>
      </div>
    </div>
  )
}

export default PaymentInfo
