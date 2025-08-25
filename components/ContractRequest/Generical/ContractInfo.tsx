import { type Dispatch, type SetStateAction } from 'react';
import { toast } from 'react-hot-toast';

import DateInput from '@/components/Inputs/DateInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';

import TextareaInput from '@/components/Inputs/TextareaInput';
import { formatDateOnInputChange } from '@/lib/methods/formatting';
import { BrazilianCitiesOptionsFromUF, BrazilianStatesOptions } from '@/utils/estados_cidades';
import { formatDateForInputValue, formatToCEP, formatToCPForCNPJ, formatToPhone, getCEPInfo } from '@/utils/methods';
import { useAcquisitionChannels } from '@/utils/queries/utils';
import type { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema';
import { BookText, ChevronRight } from 'lucide-react';
type ContractInfoProps = {
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
  showActions: boolean;
  goToNextStage: () => void;
};
function ContractInfo({ requestInfo, setRequestInfo, showActions, goToNextStage }: ContractInfoProps) {
  const { data: acquisitionChannels } = useAcquisitionChannels();
  async function setAddressDataByCEP(cep: string, type: 'cobranca' | 'instalacao' = 'cobranca') {
    const addressInfo = await getCEPInfo(cep);
    const toastID = toast.loading('Buscando informações sobre o CEP...', {
      duration: 2000,
    });
    setTimeout(() => {
      if (addressInfo) {
        toast.dismiss(toastID);
        toast.success('Dados do CEP buscados com sucesso.', {
          duration: 1000,
        });
        if (type === 'instalacao') {
          setRequestInfo((prev) => ({
            ...prev,
            enderecoInstalacao: addressInfo.logradouro,
            bairroInstalacao: addressInfo.bairro,
            ufInstalacao: addressInfo.uf,
            cidadeInstalacao: addressInfo.localidade.toUpperCase(),
          }));
        }
        if (type === 'cobranca') {
          setRequestInfo((prev) => ({
            ...prev,
            enderecoCobranca: addressInfo.logradouro,
            bairro: addressInfo.bairro,
            uf: addressInfo.uf,
            cidade: addressInfo.localidade.toUpperCase(),
          }));
        }
      }
    }, 1000);
  }
  function useClientLocationForExecution() {
    setRequestInfo((prev) => ({
      ...prev,
      cepInstalacao: prev.cep,
      enderecoInstalacao: prev.enderecoCobranca,
      numeroResInstalacao: prev.numeroResCobranca,
      bairroInstalacao: prev.bairro,
      ufInstalacao: prev.uf,
      cidadeInstalacao: prev.cidade,
      pontoDeReferenciaInstalacao: prev.pontoDeReferencia,
    }));
  }
  function validateFields() {
    if (requestInfo.nomeVendedor === 'NÃO DEFINIDO') {
      toast.error('Por favor, preencha o vendedor.');
      return false;
    }
    if (requestInfo.telefoneVendedor.trim().length < 5) {
      toast.error('Por favor, preencha o contato do vendedor.');
      return false;
    }
    if (requestInfo.nomeDoContrato.trim().length < 5) {
      toast.error('Por favor, preencha um nome ou razão social válido.');
      return false;
    }
    if (requestInfo.telefone.trim().length < 8) {
      toast.error('Por favor, preencha um telefone válido.');
      return false;
    }
    if (requestInfo.cpf_cnpj.trim().length < 11) {
      toast.error('Por favor, preencha um CPF/CNPJ válido.');
      return false;
    }
    if (requestInfo.dataDeNascimento == null) {
      toast.error('Por favor, preencha uma data de nascimento.');
      return false;
    }
    if (!requestInfo.estadoCivil) {
      toast.error('Por favor, preencha o estado civil do cliente.');
      return false;
    }
    if (requestInfo.email.trim().length < 5) {
      toast.error('Por favor, preencha um email válido.');
      return false;
    }
    if (requestInfo.profissao.trim().length < 3) {
      toast.error('Por favor, preencha uma profissão válida.');
      return false;
    }
    if (requestInfo.cidade === 'NÃO DEFINIDO') {
      toast.error('Por favor, preencha uma cidade válida.');
      return false;
    }
    if (requestInfo.enderecoCobranca.trim().length < 3) {
      toast.error('Por favor, preencha um endereço de cobrança válido.');
      return false;
    }

    if (requestInfo.numeroResCobranca.trim().length === 0) {
      toast.error('Por favor, preencha um numéro de residência válido.');
      return false;
    }
    if (requestInfo.bairro.trim().length < 3) {
      toast.error('Por favor, preencha um bairro válido.');
      return false;
    }
    if (requestInfo.possuiDeficiencia === 'SIM' && requestInfo.qualDeficiencia.trim().length < 3) {
      toast.error('Por favor, preencha a deficiência.');
      return false;
    }
    if (!requestInfo.segmento) {
      toast.error('Por favor, preencha o segmento do projeto.');
      return false;
    }
    if (requestInfo.canalVenda === 'INDICAÇÃO DE AMIGO' && requestInfo.nomeIndicador.trim().length < 3) {
      toast.error('Por favor, preencha o nome do indicador.');
      return false;
    }
    return true;
  }
  return (
    <div className='flex w-full flex-col bg-background pb-2 gap-6 grow'>
      <div className='w-full flex items-center justify-center gap-2'>
        <BookText size={15} />
        <span className='text-sm tracking-tight font-bold'>INFORMAÇÕES GERAIS</span>
      </div>
      <div className='w-full flex flex-col gap-4 grow'>
        {/** CLIENT INFORMATION */}
        <div className='w-full flex flex-col gap-4'>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start  w-fit'>INFORMAÇÕES PESSOAIS</h1>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'NOME/RAZÃO SOCIAL'}
                placeholder='Digite o nome do contrato.'
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
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'CPF/CNPJ'}
                editable={true}
                value={requestInfo.cpf_cnpj}
                placeholder='Digite aqui o CPF ou CNPJ para o contrato.'
                handleChange={(value) => {
                  setRequestInfo({
                    ...requestInfo,
                    cpf_cnpj: formatToCPForCNPJ(value),
                  });
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'RG'}
                editable={true}
                placeholder='Digite aqui o RG do cliente.'
                value={requestInfo.rg}
                handleChange={(value) => setRequestInfo({ ...requestInfo, rg: value })}
              />
            </div>
          </div>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start  w-fit'>CONTATOS PESSOAIS</h1>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width={'100%'}
                label={'TELEFONE'}
                editable={true}
                placeholder='Digite aqui o telefone do cliente.'
                value={requestInfo.telefone}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    telefone: formatToPhone(value),
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width={'100%'}
                label={'EMAIL'}
                editable={true}
                placeholder='Preencha aqui o email do cliente.'
                value={requestInfo.email}
                handleChange={(value) => setRequestInfo({ ...requestInfo, email: value })}
              />
            </div>
          </div>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start  w-fit'>OUTRAS INFORMAÇÕES</h1>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                label={'TIPO DO CLIENTE'}
                width={'100%'}
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
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    tipoDoTitular: null,
                  }));
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width={'100%'}
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
                  }));
                }}
                resetOptionLabel='NÃO DEFINIDO'
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <DateInput
                width={'100%'}
                label={'DATA DE NASCIMENTO'}
                editable={true}
                value={requestInfo.dataDeNascimento ? formatDateForInputValue(requestInfo.dataDeNascimento) : undefined}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    dataDeNascimento: formatDateOnInputChange(value) as string,
                  })
                }
              />
            </div>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width={'100%'}
                label={'PROFISSÃO'}
                editable={true}
                placeholder='Preencha aqui a profissão do cliente.'
                value={requestInfo.profissao}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    profissao: value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width={'100%'}
                label={'ONDE TRABALHA'}
                placeholder='Preencha aqui onde o cliente trabalha.'
                editable={true}
                value={requestInfo.ondeTrabalha}
                handleChange={(value) => setRequestInfo({ ...requestInfo, ondeTrabalha: value })}
              />
            </div>
          </div>
          <div className='w-full flex items-center justify-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <SelectInput
                width={'100%'}
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
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() =>
                  setRequestInfo((prev) => ({
                    ...prev,
                    possuiDeficiencia: 'NÃO',
                  }))
                }
              />
            </div>
            {requestInfo.possuiDeficiencia === 'SIM' && (
              <div className='w-full lg:w-1/2'>
                <TextInput
                  width={'100%'}
                  label={'SE SIM, QUAL ?'}
                  editable={true}
                  placeholder='Preencha aqui a deficiência do cliente em questão.'
                  value={requestInfo.qualDeficiencia}
                  handleChange={(value) =>
                    setRequestInfo({
                      ...requestInfo,
                      qualDeficiencia: value,
                    })
                  }
                />
              </div>
            )}
          </div>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start  w-fit'>LOCALIZAÇÃO DE CORRESPODÊNCIA</h1>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'CEP'}
                editable={true}
                placeholder='Preencha aqui o CEP do cliente.'
                value={requestInfo.cep}
                handleChange={(value) => {
                  if (value.length === 9) {
                    setAddressDataByCEP(value);
                  }
                  setRequestInfo({
                    ...requestInfo,
                    cep: formatToCEP(value),
                  });
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width={'100%'}
                label={'UF'}
                editable={true}
                options={BrazilianStatesOptions}
                value={requestInfo.uf}
                handleChange={(value) => setRequestInfo({ ...requestInfo, uf: value, cidade: BrazilianCitiesOptionsFromUF(value)[0]?.value })}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({ ...prev, uf: null, cidade: undefined }));
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width={'100%'}
                label={'CIDADE'}
                editable={true}
                value={requestInfo.cidade}
                options={BrazilianCitiesOptionsFromUF(requestInfo.uf || '')}
                handleChange={(value) => setRequestInfo({ ...requestInfo, cidade: value })}
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    cidade: undefined,
                  }));
                }}
                resetOptionLabel='NÃO DEFINIDO'
              />
            </div>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'BAIRRO'}
                editable={true}
                placeholder='Preencha aqui o bairro do cliente.'
                value={requestInfo.bairro}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    bairro: value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'ENDEREÇO DE COBRANÇA'}
                placeholder='Preencha aqui o endereço de cobrança (correspondências) do cliente.'
                editable={true}
                value={requestInfo.enderecoCobranca}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    enderecoCobranca: value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'Nº'}
                placeholder='Preencha aqui o número/identificador do endereço de cobrança (correspondências) do cliente.'
                value={requestInfo.numeroResCobranca}
                editable={true}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    numeroResCobranca: value,
                  })
                }
              />
            </div>
          </div>
          <div className='w-full'>
            <TextInput
              width={'100%'}
              label={'PONTO DE REFERÊNCIA'}
              placeholder='Preencha aqui o nome de um ponto de referência para o endereço do cliente.'
              editable={true}
              value={requestInfo.pontoDeReferencia}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  pontoDeReferencia: value,
                })
              }
            />
          </div>
        </div>
        {/** SALE INFORMATION */}
        <div className='w-full flex flex-col gap-4'>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start  w-fit'>INFORMAÇÕES DA VENDA</h1>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width={'100%'}
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
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    segmento: undefined,
                  }));
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width={'100%'}
                label={'FORMA DE ASSINATURA'}
                editable={true}
                value={requestInfo.formaAssinatura}
                options={[
                  { id: 1, label: 'FISICA', value: 'FISICA' },
                  { id: 2, label: 'DIGITAL', value: 'DIGITAL' },
                ]}
                handleChange={(value) => setRequestInfo({ ...requestInfo, formaAssinatura: value })}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    formaAssinatura: undefined,
                  }));
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width='100%'
                label={'CANAL DE VENDA'}
                editable={true}
                value={requestInfo.canalVenda}
                handleChange={(value) => setRequestInfo({ ...requestInfo, canalVenda: value })}
                options={
                  acquisitionChannels?.map((acquisitionChannel) => ({
                    id: acquisitionChannel._id,
                    label: acquisitionChannel.valor,
                    value: acquisitionChannel.valor,
                  })) || null
                }
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    canalVenda: null,
                  }));
                }}
              />
            </div>
          </div>
          {requestInfo.canalVenda === 'INDICAÇÃO DE AMIGO' ? (
            <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  width='100%'
                  label={'NOME INDICADOR'}
                  editable={true}
                  placeholder='Preencha aqui o nomo do indicador'
                  value={requestInfo.nomeIndicador}
                  handleChange={(value) =>
                    setRequestInfo({
                      ...requestInfo,
                      nomeIndicador: value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  width='100%'
                  label={'TELEFONE INDICADOR'}
                  editable={true}
                  placeholder='Preencha aqui o contato do indicador.'
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
          ) : null}
          <TextareaInput
            label='COMO VOCÊ CHEGOU AO CLIENTE ?'
            value={requestInfo.comoChegouAoCliente}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                comoChegouAoCliente: value,
              })
            }
            placeholder='Descreva aqui como esse cliente chegou até voce...'
          />
          <TextareaInput
            label='OBSERVAÇÕES RELEVANTES SOBRE O CONTRATO'
            value={requestInfo.obsComercial || ''}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                obsComercial: value,
              })
            }
            placeholder={
              'Preencha aqui, se houver, observações acerca desse contrato. Peculiaridades desse serviço (ex: somente instalação/equipamentos), detalhes e esclarecimentos para financiamento, entre outras informações relevantes.'
            }
          />
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start  w-fit'>LOCALIZAÇÃO DE EXECUÇÃO DO SERVIÇO</h1>
          </div>
          <div className='flex w-full items-center justify-end'>
            <button
              type='button'
              onClick={() => useClientLocationForExecution()}
              className='rounded-lg border border-cyan-500 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-500'
            >
              USAR LOCALIZAÇÃO DE CORRESPONDÊNCIA
            </button>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'CEP'}
                editable={true}
                placeholder='Preencha aqui o CEP do local de execução do serviço.'
                value={requestInfo.cepInstalacao}
                handleChange={(value) => {
                  if (value.length === 9) {
                    setAddressDataByCEP(value, 'instalacao');
                  }
                  setRequestInfo({
                    ...requestInfo,
                    cepInstalacao: formatToCEP(value),
                  });
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width={'100%'}
                label={'UF'}
                editable={true}
                options={BrazilianStatesOptions}
                value={requestInfo.ufInstalacao}
                handleChange={(value) =>
                  setRequestInfo({ ...requestInfo, ufInstalacao: value, cidade: BrazilianCitiesOptionsFromUF(value)[0]?.value })
                }
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({ ...prev, ufInstalacao: null, cidade: undefined }));
                }}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                width={'100%'}
                label={'CIDADE'}
                editable={true}
                value={requestInfo.cidadeInstalacao}
                options={BrazilianCitiesOptionsFromUF(requestInfo.uf || '')}
                handleChange={(value) => setRequestInfo({ ...requestInfo, cidadeInstalacao: value })}
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    cidadeInstalacao: undefined,
                  }));
                }}
                resetOptionLabel='NÃO DEFINIDO'
              />
            </div>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'BAIRRO'}
                editable={true}
                placeholder='Preencha aqui o bairro do local de execução do serviço.'
                value={requestInfo.bairroInstalacao}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    bairroInstalacao: value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'ENDEREÇO DE COBRANÇA'}
                placeholder='Preencha aqui o endereço do local de execução do serviço.'
                editable={true}
                value={requestInfo.enderecoInstalacao}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    enderecoInstalacao: value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                width={'100%'}
                label={'Nº'}
                placeholder='Preencha aqui o número/identificador do local de execução do serviço.'
                value={requestInfo.numeroResInstalacao || ''}
                editable={true}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    numeroResInstalacao: value,
                  })
                }
              />
            </div>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width={'100%'}
                label={'LATITUDE'}
                editable={true}
                placeholder='Preencha aqui a latitude do local de execução.'
                value={requestInfo.latitude}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    latitude: value,
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width={'100%'}
                label={'LONGITUDE'}
                placeholder='Preencha aqui a longitude do local de execução.'
                editable={true}
                value={requestInfo.longitude}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    longitude: value,
                  })
                }
              />
            </div>
          </div>
          <div className='w-full'>
            <TextInput
              width={'100%'}
              label={'PONTO DE REFERÊNCIA'}
              placeholder='Preencha aqui o nome de um ponto de referência para o endereço do cliente.'
              editable={true}
              value={requestInfo.pontoDeReferenciaInstalacao}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  pontoDeReferenciaInstalacao: value,
                })
              }
            />
          </div>
        </div>
        <div className='w-full flex flex-col gap-4'>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start w-fit'>INFORMAÇÕES PARA JORNADA</h1>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width='100%'
                label={'NOME DO CONTATO PRIMÁRIO'}
                placeholder='Preencha aqui o nome do contato primário para a jornada do cliente.'
                editable={true}
                value={requestInfo.nomeContatoJornadaUm}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    nomeContatoJornadaUm: value,
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width='100%'
                label={'TELEFONE DO CONTATO PRIMÁRIO'}
                placeholder='Preencha aqui o telefone do contato primário para a jornada do cliente.'
                editable={true}
                value={requestInfo.telefoneContatoUm}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    telefoneContatoUm: formatToPhone(value),
                  })
                }
              />
            </div>
          </div>
          <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width='100%'
                label={'NOME DO CONTATO SECUNDÁRIO'}
                placeholder='Preencha aqui o nome do contato secundário para a jornada do cliente.'
                editable={true}
                value={requestInfo.nomeContatoJornadaDois}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    nomeContatoJornadaDois: value,
                  })
                }
              />
            </div>
            <div className='w-full lg:w-1/2'>
              <TextInput
                width='100%'
                label={'TELEFONE DO CONTATO SECUNDÁRIO'}
                placeholder='Preencha aqui o telefone do contato secundário para a jornada do cliente.'
                editable={true}
                value={requestInfo.telefoneContatoDois}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    telefoneContatoDois: formatToPhone(value),
                  })
                }
              />
            </div>
          </div>
          <div className='w-full'>
            <TextInput
              width={'100%'}
              label={'CUIDADOS PARA CONTATO COM O CLIENTE'}
              placeholder='Descreva aqui cuidados em relação ao contato do cliente durante a jornada. Melhores horários para contato, texto ou aúdio, etc...'
              editable={true}
              value={requestInfo.cuidadosContatoJornada}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  cuidadosContatoJornada: value,
                })
              }
            />
          </div>
        </div>
      </div>

      {showActions ? (
        <div className='mt-2 flex w-full justify-end'>
          <button
            type='button'
            onClick={() => {
              if (validateFields()) {
                goToNextStage();
              }
            }}
            className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
          >
            Prosseguir
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ContractInfo;
