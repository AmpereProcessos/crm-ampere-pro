import DateInput from '@/components/Inputs/DateInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { getErrorMessage } from '@/lib/methods/errors';
import { formatDateOnInputChange } from '@/lib/methods/formatting';
import { stateCities } from '@/utils/estados_cidades';
import { formatDateForInputValue, formatToCEP, formatToCPForCNPJ, formatToPhone, getCEPInfo } from '@/utils/methods';
import { updateClient } from '@/utils/mutations/clients';
import type { TClientDTO } from '@/utils/schemas/client.schema';
import type { TProject } from '@/utils/schemas/project.schema';
import { ComercialSegments, CustomersAcquisitionChannels, MaritalStatus } from '@/utils/select-options';
import { useState, type Dispatch, type SetStateAction } from 'react';
import toast from 'react-hot-toast';

type ClientInformationProps = {
  client: TClientDTO;
  requestInfo: TProject;
  setRequestInfo: Dispatch<SetStateAction<TProject>>;
  goToNextState: () => void;
};
function ClientInformation({ client, requestInfo, setRequestInfo, goToNextState }: ClientInformationProps) {
  const [clientInfo, setClientInfo] = useState(client);

  async function setAddressDataByCEP(cep: string) {
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
        setClientInfo((prev) => ({
          ...prev,
          endereco: addressInfo.logradouro,
          bairro: addressInfo.bairro,
          uf: addressInfo.uf as keyof typeof stateCities,
          cidade: addressInfo.localidade.toUpperCase(),
        }));
      }
    }, 1000);
  }
  async function validateAndProceed() {
    try {
      if (!clientInfo.cpfCnpj || clientInfo.cpfCnpj.trim().length < 11) return toast.error('CPF ou CNPJ inválido.');
      if (!clientInfo.email || clientInfo.email.trim().length < 6) return toast.error('Email inválido ou não fornecido.');
      if (!clientInfo.dataNascimento) return toast.error('Data de nascimento inválido ou não fornecido.');
      if (!clientInfo.profissao || clientInfo.profissao.trim().length < 3) return toast.error('Profissão inválida ou não fornecido.');
      if (!clientInfo.estadoCivil) return toast.error('Estado civil inválido ou não fornecido.');
      const loadingEditClientId = toast.loading('Atualizando informações do cliente.');
      const updateObject = { ...clientInfo };
      // @ts-ignore
      delete updateObject._id;
      await updateClient({ id: client._id, changes: { ...updateObject } });
      toast.dismiss(loadingEditClientId);
      return goToNextState();
    } catch (error) {
      const msg = getErrorMessage(error);
      return toast.error(msg);
    }
  }
  return (
    <div className='flex w-full grow flex-col gap-2'>
      <div className='flex w-full grow flex-col gap-2'>
        <h1 className='w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-primary-foreground'>DADOS DO CLIENTE</h1>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='NOME DO CLIENTE'
              placeholder='Preencha aqui o nome do cliente...'
              value={clientInfo.nome}
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, nome: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='CPF OU CNPJ'
              placeholder='Preencha aqui o nome do cliente...'
              value={clientInfo.cpfCnpj || ''}
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  cpfCnpj: formatToCPForCNPJ(value),
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='RG'
              placeholder='Preencha aqui o RG do cliente...'
              value={clientInfo.rg || ''}
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, rg: value }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='TELEFONE PRIMÁRIO'
              placeholder='Preencha aqui o telefone primário...'
              value={clientInfo.telefonePrimario}
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  telefonePrimario: formatToPhone(value),
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='TELEFONE SECUNDÁRIO'
              placeholder='Preencha aqui o telefone secundário...'
              value={clientInfo.telefoneSecundario || ''}
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  telefoneSecundario: formatToPhone(value),
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='EMAIL'
              placeholder='Preencha aqui o email do cliente...'
              value={clientInfo.email || ''}
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, email: value }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <DateInput
              label='DATA DE NASCIMENTO DO CLIENTE'
              value={clientInfo.dataNascimento ? formatDateForInputValue(clientInfo.dataNascimento) : undefined}
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  dataNascimento: formatDateOnInputChange(value, 'string') as string,
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='PROFISSÃO DO CLIENTE'
              placeholder='Preencha aqui a profissão do cliente...'
              value={clientInfo.profissao || ''}
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, profissao: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label='ESTADO CIVIL'
              value={clientInfo.estadoCivil}
              resetOptionLabel='NÃO DEFINIDO'
              options={MaritalStatus}
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, estadoCivil: value }))}
              onReset={() => setClientInfo((prev) => ({ ...prev, estadoCivil: undefined }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label='CANAL DE AQUISIÇÃO'
              value={clientInfo.canalAquisicao}
              resetOptionLabel='NÃO DEFINIDO'
              options={CustomersAcquisitionChannels}
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, canalAquisicao: value }))}
              onReset={() =>
                setClientInfo((prev) => ({
                  ...prev,
                  canalAquisicao: CustomersAcquisitionChannels[0].value,
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='SE INDICAÇÃO, NOME DO INDICADOR'
              placeholder='Preencha aqui o nome do indicador...'
              value={clientInfo.indicador?.nome || ''}
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  indicador: { ...(prev.indicador || {}), nome: value },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='SE INDICAÇÃO, TELEFONE DO INDICADOR'
              placeholder='Preencha aqui o telefone do indicador...'
              value={clientInfo.indicador?.contato || ''}
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  indicador: { ...(prev.indicador || {}), contato: value },
                }))
              }
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='SEGMENTO'
              value={requestInfo.segmento}
              resetOptionLabel='NÃO DEFINIDO'
              options={ComercialSegments}
              handleChange={(value) => setRequestInfo((prev) => ({ ...prev, segmento: value }))}
              onReset={() => setRequestInfo((prev) => ({ ...prev, segmento: 'RESIDENCIAL' }))}
              width='100%'
            />
          </div>
        </div>
        <h1 className='w-full rounded-md bg-primary/80 p-0.5 text-center text-xs font-medium text-primary-foreground'>ENDEREÇO</h1>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='CEP'
              value={clientInfo.cep || ''}
              placeholder='Preencha aqui o CEP do cliente.'
              handleChange={(value) => {
                if (value.length === 9) {
                  setAddressDataByCEP(value);
                }
                setClientInfo((prev) => ({
                  ...prev,
                  cep: formatToCEP(value),
                }));
              }}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label='ESTADO'
              value={clientInfo.uf}
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  uf: value,
                  cidade: stateCities[value as keyof typeof stateCities][0] as string,
                }))
              }
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => setClientInfo((prev) => ({ ...prev, uf: '', cidade: '' }))}
              options={Object.keys(stateCities).map((state, index) => ({
                id: index + 1,
                label: state,
                value: state,
              }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label='CIDADE'
              value={clientInfo.cidade}
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, cidade: value }))}
              options={
                clientInfo.uf
                  ? stateCities[clientInfo.uf as keyof typeof stateCities].map((city, index) => ({
                      id: index + 1,
                      value: city,
                      label: city,
                    }))
                  : null
              }
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => setClientInfo((prev) => ({ ...prev, cidade: '' }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='BAIRRO'
              value={clientInfo.bairro || ''}
              placeholder='Preencha aqui o bairro do cliente.'
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, bairro: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='LOGRADOURO/RUA'
              value={clientInfo.endereco || ''}
              placeholder='Preencha aqui o logradouro do cliente.'
              handleChange={(value) => setClientInfo((prev) => ({ ...prev, endereco: value }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='NÚMERO/IDENTIFICADOR'
              value={clientInfo.numeroOuIdentificador || ''}
              placeholder='Preencha aqui o número ou identificador da residência do cliente.'
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  numeroOuIdentificador: value,
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='COMPLEMENTO'
              value={clientInfo.complemento || ''}
              placeholder='Preencha aqui algum complemento do endereço.'
              handleChange={(value) =>
                setClientInfo((prev) => ({
                  ...prev,
                  complemento: value,
                }))
              }
              width='100%'
            />
          </div>
        </div>
      </div>
      <div className='flex w-full items-center justify-end'>
        <button
          type='button'
          onClick={() => validateAndProceed()}
          className='rounded bg-black px-4 py-1 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
        >
          PROSSEGUIR
        </button>
      </div>
    </div>
  );
}

export default ClientInformation;
