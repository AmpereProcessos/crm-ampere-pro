import type { TContractRequest } from '@/utils/schemas//contract-request.schema';
import { useState, type Dispatch, type SetStateAction } from 'react';

import CheckboxInput from '@/components/Inputs/CheckboxInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { Button } from '@/components/ui/button';
import { BrazilianCitiesOptionsFromUF, BrazilianStatesOptions } from '@/utils/estados_cidades';
import { formatToCEP, getCEPInfo } from '@/utils/methods';
import { ChevronRight, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
type DeliveryInfoProps = {
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
  showActions: boolean;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
};
function DeliveryInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage, showActions }: DeliveryInfoProps) {
  const [isDeliveryNecessary, setIsDeliveryNecessary] = useState<boolean>(requestInfo.produtos.length > 0);

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

        setRequestInfo((prev) => ({
          ...prev,
          enderecoEntrega: addressInfo.logradouro,
          bairroEntrega: addressInfo.bairro,
          ufEntrega: addressInfo.uf,
          cidadeEntrega: addressInfo.localidade.toUpperCase(),
        }));
      }
    }, 1000);
  }
  function useExecutionLocationForDelivery() {
    setRequestInfo((prev) => ({
      ...prev,
      cepEntrega: prev.cepInstalacao,
      enderecoEntrega: prev.enderecoInstalacao,
      numeroResEntrega: prev.numeroResInstalacao,
      bairroEntrega: prev.bairroInstalacao,
      ufEntrega: prev.ufInstalacao,
      cidadeEntrega: prev.cidadeInstalacao,
      pontoDeReferenciaEntrega: prev.pontoDeReferenciaInstalacao,
    }));
  }
  return (
    <div className='flex w-full flex-col bg-background pb-2 gap-6 grow'>
      <div className='w-full flex items-center justify-center gap-2'>
        <Truck size={15} />
        <span className='text-sm tracking-tight font-bold'>INFORMAÇÕES SOBRE COMPRA E ENTREGA</span>
      </div>
      {/** DELIVERY INFORMATION */}
      <div className='w-full flex grow flex-col gap-4'>
        <div className='w-full flex items-center justify-center'>
          <div className='w-fit'>
            <CheckboxInput
              labelFalse='PROJETO REQUER COMPRA/ENTREGA'
              labelTrue='PROJETO REQUER COMPRA/ENTREGA'
              checked={isDeliveryNecessary}
              handleChange={(value) => setIsDeliveryNecessary(value)}
            />
          </div>
        </div>
        {isDeliveryNecessary ? (
          <>
            <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
              <ChevronRight size={15} />
              <h1 className='text-xs tracking-tight font-medium text-start w-fit'>LOCALIZAÇÃO DE ENTREGA</h1>
            </div>
            <div className='flex w-full items-center justify-end'>
              <button
                type='button'
                onClick={() => useExecutionLocationForDelivery()}
                className='rounded-lg border border-cyan-500 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-500'
              >
                USAR LOCALIZAÇÃO DE EXECUÇÃO
              </button>
            </div>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/3'>
                <TextInput
                  label='CEP'
                  value={requestInfo.cepEntrega || ''}
                  placeholder='Preencha aqui o CEP da instalação...'
                  handleChange={(value) => {
                    if (value.length === 9) {
                      setAddressDataByCEP(value);
                    }
                    setRequestInfo((prev) => ({ ...prev, cepEntrega: formatToCEP(value) }));
                  }}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <SelectInput
                  label='ESTADO'
                  value={requestInfo.ufEntrega}
                  handleChange={(value) =>
                    setRequestInfo((prev) => ({ ...prev, ufEntrega: value, cidadeEntrega: BrazilianCitiesOptionsFromUF(value || '')[0]?.value }))
                  }
                  resetOptionLabel='NÃO DEFINIDO'
                  onReset={() => setRequestInfo((prev) => ({ ...prev, ufEntrega: null, cidadeEntrega: null }))}
                  options={BrazilianStatesOptions}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/3'>
                <SelectInput
                  label='CIDADE'
                  value={requestInfo.cidadeEntrega}
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, cidadeEntrega: value }))}
                  options={BrazilianCitiesOptionsFromUF(requestInfo.uf || '')}
                  resetOptionLabel='NÃO DEFINIDO'
                  onReset={() => setRequestInfo((prev) => ({ ...prev, cidadeEntrega: null }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='BAIRRO'
                  value={requestInfo.bairroEntrega || ''}
                  placeholder='Preencha aqui o bairro do instalação...'
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, bairroEntrega: value }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='LOGRADOURO/RUA'
                  value={requestInfo.enderecoEntrega || ''}
                  placeholder='Preencha aqui o logradouro da instalação...'
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, enderecoEntrega: value }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='NÚMERO/IDENTIFICADOR'
                  value={requestInfo.numeroResEntrega || ''}
                  placeholder='Preencha aqui o número ou identificador da residência da instalação...'
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, numeroResEntrega: value }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='PONTO DE REFERÊNCIA'
                  value={requestInfo.pontoDeReferenciaEntrega || ''}
                  placeholder='Preencha aqui algum complemento do endereço...'
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, pontoDeReferenciaEntrega: value }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='LATITUDE'
                  value={requestInfo.latitudeEntrega || ''}
                  placeholder='Preencha aqui a latitude da instalação...'
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, latitudeEntrega: value }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='LONGITUDE'
                  value={requestInfo.longitudeEntrega || ''}
                  placeholder='Preencha aqui a longitude da instalação...'
                  handleChange={(value) => setRequestInfo((prev) => ({ ...prev, longitudeEntrega: value }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
              <ChevronRight size={15} />
              <h1 className='text-xs tracking-tight font-medium text-start w-fit'>OUTROS DETALHES</h1>
            </div>
            <SelectInput
              width={'100%'}
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
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  restricoesEntrega: null,
                }));
              }}
            />
          </>
        ) : null}
      </div>
      {showActions ? (
        <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
          <Button
            type='button'
            onClick={() => {
              goToPreviousStage();
            }}
            variant='outline'
          >
            Voltar
          </Button>
          <Button
            type='button'
            onClick={() => {
              goToNextStage();
            }}
          >
            Prosseguir
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default DeliveryInfo;
