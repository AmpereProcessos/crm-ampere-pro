import type { TUserSession } from '@/lib/auth/session';
import { TClientDTO } from '@/utils/schemas/client.schema';
import { TProject } from '@/utils/schemas/project.schema';
import React from 'react';
import ReviewActiveHomologation from './Utils/ReviewActiveHomologation';
import ReviewActiveTechnicalAnalysis from './Utils/ReviewActiveTechnicalAnalysis';
import ReviewClientBlock from './Utils/ReviewClientBlock';
import ReviewGeneralInformation from './Utils/ReviewGeneralInformation';
import ReviewPaymentInformationBlock from './Utils/ReviewPaymentInformationBlock';
import ReviewSaleCompositionBlock from './Utils/ReviewSaleCompositionBlock';

type ReviewInformationBlockProps = {
  infoHolder: TProject;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProject>>;
  requestPending: boolean;
  requestNewProject: () => void;
  client: TClientDTO;
  session: TUserSession;
};
function ReviewInformationBlock({ infoHolder, setInfoHolder, requestPending, requestNewProject, session, client }: ReviewInformationBlockProps) {
  return (
    <div className='flex w-full grow flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-green-800 p-1 text-center text-lg font-bold text-primary-foreground'>REVISÃO DE INFORMAÇÕES</h1>
      <div className='my-1 flex w-full flex-col'>
        <p className='w-full text-center text-sm font-light tracking-tighter text-primary/70'>
          Revise as informações preenchidas para solicitação de projeto e, se necessário, faça correções.
        </p>
      </div>
      <div className='flex w-full grow flex-col gap-2'>
        {/** GENERAL INFORMATION */}
        <ReviewGeneralInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} session={session} />
        {/** CLIENT INFORMATION */}
        <ReviewClientBlock clientId={infoHolder.cliente.id} session={session} />
        {/** HOMOLOGATION INFORMATION */}
        {infoHolder.idHomologacao ? <ReviewActiveHomologation homologationId={infoHolder.idHomologacao} /> : null}
        {/** TECHNICAL ANALYSIS INFORMATION */}
        {infoHolder.idAnaliseTecnica ? (
          <ReviewActiveTechnicalAnalysis
            analysisId={infoHolder.idAnaliseTecnica}
            userHasPricingViewPermission={session.user.permissoes.precos.visualizar}
          />
        ) : null}
        {/** SALE COMPOSITION */}
        <ReviewSaleCompositionBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} session={session} />
        {/** PAYMENT INFORMATION */}
        <ReviewPaymentInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} client={client} />
        <div className='flex w-full items-center justify-end p-2'>
          <button
            disabled={requestPending}
            onClick={() => requestNewProject()}
            className='h-9 whitespace-nowrap rounded-sm bg-green-700 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-green-600 enabled:hover:text-primary-foreground'
          >
            REQUISITAR PROJETO
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewInformationBlock;
