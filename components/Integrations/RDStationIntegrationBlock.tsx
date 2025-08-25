import type { TUserSession } from '@/lib/auth/session';
import { copyToClipboard } from '@/lib/hooks';
import { formatDateAsLocale } from '@/lib/methods/formatting';
import { createRDStationIntegration } from '@/utils/mutations/rd-station-integration';
import { useRDIntegrationConfig } from '@/utils/queries/integrations';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BsCalendarCheck, BsPatchCheckFill } from 'react-icons/bs';
import { MdContentCopy } from 'react-icons/md';
import RDStationLogo from '../../utils/images/logo-rd-station.jpeg';
import TextInput from '../Inputs/TextInput';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';
import LeadReceiversBlock from './Utils/LeadReceiversBlock';

type RDStationIntegrationBlockProps = {
  session: TUserSession;
};
function RDStationIntegrationBlock({ session }: RDStationIntegrationBlockProps) {
  const { data: integrationConfig, isLoading, isError, isSuccess } = useRDIntegrationConfig();
  const hasConfig = !!integrationConfig;

  const [configInformation, setConfigInformation] = useState<{ client_id: string; client_secret: string }>({ client_id: '', client_secret: '' });
  const [showToken, setShowToken] = useState<boolean>(false);
  async function handleConfiguration() {
    const { client_id, client_secret } = configInformation;
    if (configInformation.client_id.trim().length < 5) return toast.error('Preencha um client_id válido.');
    if (configInformation.client_secret.trim().length < 5) return toast.error('Preencha um client_secret válido.');
    const insertedId = await createRDStationIntegration({ client_id, client_secret });
    const url = `https://api.rd.services/auth/dialog?client_id=${client_id}&redirect_uri=https://erp-rose.vercel.app/api/integration/rd-station/config-callback/&state=${insertedId}`;
    const link = document.createElement('a');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  return (
    <div className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
      <div className='flex w-full items-center gap-1'>
        <div style={{ width: 35, height: 35 }} className='relative flex items-center justify-center'>
          <Image src={RDStationLogo} alt='Avatar' fill={true} style={{ borderRadius: '100%' }} />
        </div>
        <p className='font-black leading-none tracking-tight'>RD STATION</p>
      </div>

      {isLoading ? <LoadingComponent /> : null}
      {isError ? <ErrorComponent /> : null}
      {isSuccess ? (
        <div className='flex w-full flex-col'>
          {hasConfig ? (
            <>
              <div className='mt-1 flex w-full items-center justify-center gap-2'>
                <h1 className=' text-center text-sm font-bold text-primary/70'>Sua configuração com a RD Station está ativa.</h1>
                <BsPatchCheckFill color='#2c6e49' />
                {!showToken ? (
                  <button
                    onClick={() => setShowToken(true)}
                    className='mt-1 w-fit self-center rounded-md border border-cyan-500 bg-transparent px-4 py-1 text-xxs font-bold  text-cyan-500 duration-300 ease-in-out hover:bg-cyan-100'
                  >
                    VER TOKEN
                  </button>
                ) : (
                  <button
                    onClick={() => setShowToken(false)}
                    className='mt-1 w-fit self-center rounded-md border border-red-500 bg-transparent px-4 py-1 text-xxs font-bold  text-red-500 duration-300 ease-in-out hover:bg-red-100'
                  >
                    FECHAR
                  </button>
                )}
              </div>
              {showToken ? (
                <h1 className='mt-2 w-[80%] self-center break-words rounded-md border border-primary/30 bg-primary/10 p-2 text-center text-[0.6rem] font-bold text-primary/70'>
                  {integrationConfig.access_token}
                </h1>
              ) : null}
              <h1 className='mt-2 text-xs font-medium leading-none tracking-tight text-primary/70'>WEBHOOK DE OPORTUNIDADES</h1>
              <div className='mt-2 flex w-full items-center justify-center gap-2'>
                <h1 className='text-center text-xs font-bold text-blue-800'>{`https://erp-rose.vercel.app/api/integration/rd-station/opportunities?partnerId=${session.user.idParceiro}`}</h1>
                <button
                  onClick={() =>
                    copyToClipboard(`https://erp-rose.vercel.app/api/integration/rd-station/opportunities?partnerId=${session.user.idParceiro}`)
                  }
                  className='text-blue-800'
                >
                  <MdContentCopy />
                </button>
              </div>
              <h1 className='mt-2 text-center text-xs font-medium leading-none tracking-tight text-primary/70'>
                Para configurar um Webhook para envio automático de oportunidades no RD Station, você pode utilizar o link acima.
              </h1>
              <LeadReceiversBlock />
              <div className='flex w-full items-center justify-end'>
                <div className={`flex items-center gap-2`}>
                  <BsCalendarCheck />
                  <p className='text-xs font-medium text-primary/70'>
                    Ultima atualização em: {formatDateAsLocale(integrationConfig.dataValidacaoToken, true)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className='mt-1 w-full text-center text-sm font-medium text-primary/70'>É parceiro da RD Station ? Faça a aqui sua integração.</h1>
              <h1 className='mt-2 text-xs font-medium leading-none tracking-tight text-primary/70'>WEBHOOK DE OPORTUNIDADES</h1>
              <div className='mt-2 flex w-full items-center justify-center gap-2'>
                <h1 className='text-center text-xs font-bold text-blue-800'>{`https://erp-rose.vercel.app/api/integration/rd-station/opportunities?partnerId=${session.user.idParceiro}`}</h1>
                <button
                  onClick={() =>
                    copyToClipboard(`https://crm.ampereenergias.com.br/api/integration/rd-station/opportunities?partnerId=${session.user.idParceiro}`)
                  }
                  className='text-blue-800'
                >
                  <MdContentCopy />
                </button>
              </div>
              <h1 className='mt-2 text-center text-xs font-medium leading-none tracking-tight text-primary/70'>
                Para configurar um Webhook para envio automático de oportunidades no RD Station, você pode utilizar o link acima.
              </h1>
              <h1 className='mt-2 text-xs font-medium leading-none tracking-tight text-primary/70'>COMUNICAÇÃO DE GANHOS E PERDAS</h1>
              <div className='mt-2 flex w-full flex-col items-center gap-2 lg:flex-row'>
                <div className='w-full lg:w-1/2'>
                  <TextInput
                    label='ID DE CLIENTE (client_id)'
                    placeholder='Preencha o client_id do seu aplicativo RD Station Marketing...'
                    value={configInformation.client_id}
                    handleChange={(value) => setConfigInformation((prev) => ({ ...prev, client_id: value }))}
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-1/2'>
                  <TextInput
                    label='ID SECRETO (client_secret)'
                    placeholder='Preencha o client_secret do seu aplicativo RD Station Marketing...'
                    value={configInformation.client_secret}
                    handleChange={(value) => setConfigInformation((prev) => ({ ...prev, client_secret: value }))}
                    width='100%'
                  />
                </div>
              </div>
              <h1 className='mt-2 text-center text-xs font-medium leading-none tracking-tight text-primary/70'>
                Preencha os IDs do seu aplicativo na plataforma do RD Station para configurar a comunicação de perda e ganho de oportunidades.
              </h1>
              <h1 className='mt-2 text-center text-xs font-medium leading-none tracking-tight text-primary/70'>
                Não sabe como encontrar os IDs,{' '}
                <a href='https://developers.rdstation.com/reference/criar-aplicativo-appstore' className='text-blue-300 hover:text-blue-500'>
                  clique aqui
                </a>{' '}
                e dê uma olhada na documentação da plataforma.
              </h1>
              <div className='mt-2 flex w-full items-center justify-end'>
                <button
                  className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
                  onClick={() => handleConfiguration()}
                >
                  REALIZAR CONFIGURAÇÃO
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default RDStationIntegrationBlock;
