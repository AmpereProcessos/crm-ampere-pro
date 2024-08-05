import DateInput from '@/components/Inputs/DateInput'
import SelectInput from '@/components/Inputs/SelectInput'
import TextInput from '@/components/Inputs/TextInput'

import { stateCities } from '@/utils/estados_cidades'
import { formatDateForInput, formatToCEP, formatToCPForCNPJ, formatToPhone, getCEPInfo } from '@/utils/methods'

import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema'
import { CustomersAcquisitionChannels } from '@/utils/select-options'
import React from 'react'
import { toast } from 'react-hot-toast'
type ContractInfoProps = {
  requestInfo: TContractRequest
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>
  goToNextStage: () => void
}
function ContractInfo({ requestInfo, setRequestInfo, goToNextStage }: ContractInfoProps) {
  async function setAddressDataByCEP(cep: string) {
    const addressInfo = await getCEPInfo(cep)
    const toastID = toast.loading('Buscando informações sobre o CEP...', {
      duration: 2000,
    })
    setTimeout(() => {
      if (addressInfo) {
        toast.dismiss(toastID)
        toast.success('Dados do CEP buscados com sucesso.', {
          duration: 1000,
        })
        setRequestInfo((prev) => ({
          ...prev,
          enderecoCobranca: addressInfo.logradouro,
          enderecoInstalacao: addressInfo.logradouro,
          bairro: addressInfo.bairro,
          bairroInstalacao: addressInfo.bairro,
          uf: addressInfo.uf as keyof typeof stateCities,
          ufInstalacao: addressInfo.uf as keyof typeof stateCities,
          cidade: addressInfo.localidade.toUpperCase(),
          cidadeInstalacao: addressInfo.localidade.toUpperCase(),
        }))
      }
    }, 1000)
  }
  function validateFields() {
    if (requestInfo.nomeVendedor == 'NÃO DEFINIDO') {
      toast.error('Por favor, preencha o vendedor.')
      return false
    }
    if (requestInfo.telefoneVendedor.trim().length < 5) {
      toast.error('Por favor, preencha o contato do vendedor.')
      return false
    }
    if (requestInfo.nomeDoContrato.trim().length < 5) {
      toast.error('Por favor, preencha um nome ou razão social válido.')
      return false
    }
    if (requestInfo.telefone.trim().length < 8) {
      toast.error('Por favor, preencha um telefone válido.')
      return false
    }
    if (requestInfo.cpf_cnpj.trim().length < 11) {
      toast.error('Por favor, preencha um CPF/CNPJ válido.')
      return false
    }
    // if (requestInfo.dataDeNascimento == null) {
    //   toast.error('Por favor, preencha uma data de nascimento.')
    //   return false
    // }
    if (!requestInfo.estadoCivil) {
      toast.error('Por favor, preencha o estado civil do cliente.')
      return false
    }
    if (requestInfo.email.trim().length < 5) {
      toast.error('Por favor, preencha um email válido.')
      return false
    }
    // if (requestInfo.profissao.trim().length < 3) {
    //   toast.error('Por favor, preencha uma profissão válida.')
    //   return false
    // }
    if (requestInfo.cidade == 'NÃO DEFINIDO') {
      toast.error('Por favor, preencha uma cidade válida.')
      return false
    }
    if (requestInfo.enderecoCobranca.trim().length < 3) {
      toast.error('Por favor, preencha um endereço de cobrança válido.')
      return false
    }

    if (requestInfo.numeroResCobranca.trim().length == 0) {
      toast.error('Por favor, preencha um numéro de residência válido.')
      return false
    }
    if (requestInfo.bairro.trim().length < 3) {
      toast.error('Por favor, preencha um bairro válido.')
      return false
    }
    if (requestInfo.possuiDeficiencia == 'SIM' && requestInfo.qualDeficiencia.trim().length < 3) {
      toast.error('Por favor, preencha a deficiência.')
      return false
    }
    if (!requestInfo.segmento) {
      toast.error('Por favor, preencha o segmento do projeto.')
      return false
    }
    if (requestInfo.canalVenda == 'INDICAÇÃO DE AMIGO' && requestInfo.nomeIndicador.trim().length < 3) {
      toast.error('Por favor, preencha o nome do indicador.')
      return false
    }
    return true
  }
  return (
    <div className="flex w-full flex-col  bg-[#fff] pb-2">
      <span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS PARA CONTRATO</span>
      <div className="flex flex-col flex-wrap justify-around gap-2 p-2 lg:grid lg:grid-cols-3">
        <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">SOBRE O CLIENTE</h1>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'NOME/RAZÃO SOCIAL'}
            placeholder="Digite o nome do contrato."
            value={requestInfo.nomeDoContrato}
            editable={true}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                nomeDoContrato: value.toUpperCase(),
              })
            }
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'TELEFONE'}
            editable={true}
            placeholder="Digite aqui o telefone do cliente."
            value={requestInfo.telefone}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                telefone: formatToPhone(value),
              })
            }
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'CPF/CNPJ'}
            editable={true}
            value={requestInfo.cpf_cnpj}
            placeholder="Digite aqui o CPF ou CNPJ para o contrato."
            handleChange={(value) => {
              setRequestInfo({
                ...requestInfo,
                cpf_cnpj: formatToCPForCNPJ(value),
              })
            }}
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'RG'}
            editable={true}
            placeholder="Digite aqui o RG do cliente."
            value={requestInfo.rg}
            handleChange={(value) => setRequestInfo({ ...requestInfo, rg: value })}
          />
        </div>
        <div className="flex items-center justify-center">
          <DateInput
            width={'450px'}
            label={'DATA DE NASCIMENTO'}
            editable={true}
            value={requestInfo.dataDeNascimento ? formatDateForInput(requestInfo.dataDeNascimento) : undefined}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                dataDeNascimento: value,
              })
            }
          />
        </div>
        <div className="flex items-center justify-center">
          <SelectInput
            width={'450px'}
            label={'ESTADO CIVIL'}
            options={[
              {
                id: 1,
                label: 'CASADO(A)',
                value: 'CASADO(A)',
              },
              {
                id: 2,
                label: 'SOLTEIRO(A)',
                value: 'SOLTEIRO(A)',
              },
              {
                id: 3,
                label: 'UNIÃO ESTÁVEL',
                value: 'UNIÃO ESTÁVEL',
              },
              {
                id: 4,
                label: 'DIVORCIADO(A)',
                value: 'DIVORCIADO(A)',
              },
              {
                id: 5,
                label: 'VIUVO(A)',
                value: 'VIUVO(A)',
              },
              {
                id: 6,
                label: 'NÃO DEFINIDO',
                value: 'NÃO DEFINIDO',
              },
            ]}
            editable={true}
            value={requestInfo.estadoCivil}
            handleChange={(value) => setRequestInfo({ ...requestInfo, estadoCivil: value })}
            onReset={() => {
              setRequestInfo((prev) => ({
                ...prev,
                estadoCivil: undefined,
              }))
            }}
            selectedItemLabel="NÃO DEFINIDO"
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'EMAIL'}
            editable={true}
            placeholder="Preencha aqui o email do cliente."
            value={requestInfo.email}
            handleChange={(value) => setRequestInfo({ ...requestInfo, email: value })}
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'PROFISSÃO'}
            editable={true}
            placeholder="Preencha aqui a profissão do cliente."
            value={requestInfo.profissao}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                profissao: value.toUpperCase(),
              })
            }
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'ONDE TRABALHA'}
            placeholder="Preencha aqui onde o cliente trabalha."
            editable={true}
            value={requestInfo.ondeTrabalha}
            handleChange={(value) => setRequestInfo({ ...requestInfo, ondeTrabalha: value })}
          />
        </div>
        {requestInfo.tipoDeServico != 'SISTEMA FOTOVOLTAICO' && (
          <div className="col-span-3 flex items-center justify-center">
            <SelectInput
              label={'TIPO DO CLIENTE'}
              width={'450px'}
              editable={true}
              value={requestInfo.tipoDoTitular}
              handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDoTitular: value })}
              options={[
                {
                  id: 1,
                  label: 'PESSOA FISICA',
                  value: 'PESSOA FISICA',
                },
                {
                  id: 2,
                  label: 'PESSOA JURIDICA',
                  value: 'PESSOA JURIDICA',
                },
              ]}
              selectedItemLabel="NÃO DEFINIDO"
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  tipoDoTitular: null,
                }))
              }}
            />
          </div>
        )}
        <div className="col-span-3 flex items-center justify-center gap-2">
          <SelectInput
            width={'450px'}
            label={'POSSUI ALGUMA DEFICIÊNCIA'}
            editable={true}
            value={requestInfo.possuiDeficiencia}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                possuiDeficiencia: value,
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
                possuiDeficiencia: 'NÃO',
              }))
            }
          />
          {requestInfo.possuiDeficiencia == 'SIM' && (
            <>
              <TextInput
                width={'450px'}
                label={'SE SIM, QUAL ?'}
                editable={true}
                placeholder="Preencha aqui a deficiência do cliente em questão."
                value={requestInfo.qualDeficiencia}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    qualDeficiencia: value,
                  })
                }
              />
            </>
          )}
        </div>
        <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">ENDEREÇO</h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <TextInput
            width={'450px'}
            label={'CEP'}
            editable={true}
            placeholder="Preencha aqui o CEP do cliente."
            value={requestInfo.cep}
            handleChange={(value) => {
              if (value.length == 9) {
                setAddressDataByCEP(value)
              }
              setRequestInfo({
                ...requestInfo,
                cep: formatToCEP(value),
                cepInstalacao: formatToCEP(value),
              })
            }}
          />
          {/* <button
                    // onClick={() => findCPF("enderecoCobranca")}
                    className="flex h-[30px] items-center rounded bg-[#fead61] p-1"
                  >
                    <AiOutlineSearch />
                  </button> */}
        </div>
        <div className="flex items-center justify-center">
          <SelectInput
            width={'450px'}
            label={'CIDADE'}
            editable={true}
            value={requestInfo.cidade}
            options={
              requestInfo.uf
                ? stateCities[requestInfo.uf as keyof typeof stateCities].map((city, index) => {
                    return {
                      id: index,
                      value: city,
                      label: city,
                    }
                  })
                : null
            }
            handleChange={(value) => setRequestInfo({ ...requestInfo, cidade: value, cidadeInstalacao: value })}
            onReset={() => {
              setRequestInfo((prev) => ({
                ...prev,
                cidade: undefined,
                cidadeInstalacao: undefined,
              }))
            }}
            selectedItemLabel="NÃO DEFINIDO"
          />
        </div>
        <div className="flex items-center justify-center">
          <SelectInput
            width={'450px'}
            label={'UF'}
            editable={true}
            options={Object.keys(stateCities).map((state, index) => ({
              id: index + 1,
              label: state,
              value: state,
            }))}
            value={requestInfo.uf}
            handleChange={(value) => setRequestInfo((prev) => ({ ...prev, uf: value, ufInstalacao: value }))}
            selectedItemLabel="NÃO DEFINIDO"
            onReset={() => {
              setRequestInfo((prev) => ({ ...prev, uf: null, ufInstalacao: null }))
            }}
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'ENDEREÇO DE COBRANÇA'}
            placeholder="Preencha aqui o endereço de cobrança (correspondências) do cliente."
            editable={true}
            value={requestInfo.enderecoCobranca}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                enderecoCobranca: value.toUpperCase(),
                enderecoInstalacao: value.toUpperCase(),
              })
            }
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'Nº'}
            placeholder="Preencha aqui o número/identificador do endereço de cobrança (correspondências) do cliente."
            value={requestInfo.numeroResCobranca}
            editable={true}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                numeroResCobranca: value,
                numeroResInstalacao: value,
              })
            }
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'BAIRRO'}
            editable={true}
            placeholder="Preencha aqui o bairro do cliente."
            value={requestInfo.bairro}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                bairro: value.toUpperCase(),
                bairroInstalacao: value.toUpperCase(),
              })
            }
          />
        </div>
        <div className="flex items-center justify-center">
          <TextInput
            width={'450px'}
            label={'PONTO DE REFERÊNCIA'}
            placeholder="Preencha aqui o nome de um ponto de referência para o endereço do cliente."
            editable={true}
            value={requestInfo.pontoDeReferencia}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                pontoDeReferencia: value,
                pontoDeReferenciaInstalacao: value,
              })
            }
          />
        </div>
        <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">CONTRATO/VENDA</h1>
        <div className="flex items-center justify-center">
          <SelectInput
            width={'450px'}
            label={'SEGMENTO'}
            value={requestInfo.segmento}
            editable={true}
            options={[
              { id: 1, label: 'RESIDENCIAL', value: 'RESIDENCIAL' },
              { id: 2, label: 'COMERCIAL', value: 'COMERCIAL' },
              { id: 3, label: 'RURAL', value: 'RURAL' },
              { id: 4, label: 'INDUSTRIAL', value: 'INDUSTRIAL' },
            ]}
            handleChange={(value) => setRequestInfo({ ...requestInfo, segmento: value })}
            selectedItemLabel="NÃO DEFINIDO"
            onReset={() => {
              setRequestInfo((prev) => ({
                ...prev,
                segmento: undefined,
              }))
            }}
          />
        </div>
        <div className="flex items-center justify-center">
          <SelectInput
            width={'450px'}
            label={'FORMA DE ASSINATURA'}
            editable={true}
            value={requestInfo.formaAssinatura}
            options={[
              { id: 1, label: 'FISICA', value: 'FISICA' },
              { id: 2, label: 'DIGITAL', value: 'DIGITAL' },
            ]}
            handleChange={(value) => setRequestInfo({ ...requestInfo, formaAssinatura: value })}
            selectedItemLabel="NÃO DEFINIDO"
            onReset={() => {
              setRequestInfo((prev) => ({
                ...prev,
                formaAssinatura: undefined,
              }))
            }}
          />
        </div>
        <div className="flex w-full items-center justify-center">
          <SelectInput
            label={'CANAL DE VENDA'}
            editable={true}
            value={requestInfo.canalVenda}
            handleChange={(value) => setRequestInfo({ ...requestInfo, canalVenda: value })}
            options={CustomersAcquisitionChannels.map((value) => value)}
            selectedItemLabel="NÃO DEFINIDO"
            onReset={() => {
              setRequestInfo((prev) => ({
                ...prev,
                canalVenda: null,
              }))
            }}
          />
        </div>
        {requestInfo.canalVenda == 'INDICAÇÃO DE AMIGO' && (
          <div className="col-span-3 flex w-full flex-wrap items-center justify-center gap-2">
            <div className="flex  grow items-center justify-center">
              <TextInput
                width="100%"
                label={'NOME INDICADOR'}
                editable={true}
                placeholder="Preencha aqui o nomo do indicador"
                value={requestInfo.nomeIndicador}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    nomeIndicador: value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className="flex grow items-center justify-center">
              <TextInput
                width="100%"
                label={'TELEFONE INDICADOR'}
                editable={true}
                placeholder="Preencha aqui o contato do indicador."
                value={requestInfo.telefoneIndicador}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    telefoneIndicador: formatToPhone(value),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex w-full flex-col items-center self-center px-2">
        <span className="font-raleway text-center text-sm font-bold uppercase">COMO VOCÊ CHEGOU A ESSE CLIENTE?</span>
        <textarea
          placeholder={'Descreva aqui como esse cliente chegou até voce..'}
          value={requestInfo.comoChegouAoCliente}
          onChange={(e) =>
            setRequestInfo({
              ...requestInfo,
              comoChegouAoCliente: e.target.value,
            })
          }
          className="block h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
      </div>
      <div className="mt-2 flex w-full flex-col items-center self-center px-2">
        <span className="font-raleway text-center text-sm font-bold uppercase">OBSERVAÇÃO ADICIONAL ACERCA DO SERVIÇO PRESTADO</span>
        <textarea
          placeholder={
            'Preencha aqui, se houver, observações acerca desse contrato. Peculiaridades desse serviço (ex: somente instalação/equipamentos), detalhes e esclarecimentos para financiamento, entre outras informações relevantes.'
          }
          value={requestInfo.obsComercial}
          onChange={(e) =>
            setRequestInfo({
              ...requestInfo,
              obsComercial: e.target.value,
            })
          }
          className="block h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
      </div>
      <div className="mt-2 flex w-full justify-end">
        <button
          onClick={() => {
            if (validateFields()) {
              goToNextStage()
            }
          }}
          className="rounded p-2 font-bold hover:bg-black hover:text-white"
        >
          Prosseguir
        </button>
      </div>
    </div>
  )
}

export default ContractInfo
