'use client';
import { useEffect, useState } from 'react';

import { Sidebar } from '@/components/Sidebar';

import LoadingPage from '@/components/utils/LoadingPage';

import type { TUserSession } from '@/lib/auth/session';
import { useOpportunityById } from '@/utils/queries/opportunities';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import ErrorComponent from '../utils/ErrorComponent';

import Link from 'next/link';
import { FaStepBackward } from 'react-icons/fa';
import ProposalWithKits from './ProposalsCreationByCategory/ProposeWithKits';
import ProposalWithPlans from './ProposalsCreationByCategory/ProposeWithPlans';
import ProposalWithProducts from './ProposalsCreationByCategory/ProposeWithProducts';
import ProposalWithServices from './ProposalsCreationByCategory/ProposeWithServices';
type NewProposalPageprops = {
  session: TUserSession;
  opportunityId: string;
};
function NewProposalPage({ session, opportunityId }: NewProposalPageprops) {
  const partnerId = session.user.idParceiro;

  const {
    data: opportunity,
    status,
    isLoading: opportunityLoading,
    isSuccess: opportunitySuccess,
    isError: opportunityError,
  } = useOpportunityById({ opportunityId: opportunityId });
  const saleCategory = opportunity?.categoriaVenda;

  const [infoHolder, setInfoHolder] = useState<TProposal>({
    nome: '',
    idParceiro: session.user.idParceiro || '',
    idCliente: '',
    idMetodologiaPrecificacao: '',
    valor: 0,
    premissas: {
      consumoEnergiaMensal: null,
      fatorSimultaneidade: null,
      tarifaEnergia: null,
      tarifaFioB: null,
      tipoEstrutura: null,
      orientacao: null,
    },
    oportunidade: {
      id: opportunityId,
      nome: opportunity?.nome || '',
    },
    kits: [],
    planos: [],
    produtos: [],
    servicos: [],
    precificacao: [],
    pagamento: {
      metodos: [],
    },
    potenciaPico: null,
    urlArquivo: null,
    autor: {
      id: session?.user.id || '',
      nome: session?.user.nome || '',
      avatar_url: session?.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });
  useEffect(() => {
    if (opportunity)
      setInfoHolder((prev) => ({ ...prev, oportunidade: { id: opportunity._id, nome: opportunity.nome }, idCliente: opportunity.idCliente }));
  }, [opportunity]);

  if (opportunityLoading) return <LoadingPage />;
  if (opportunityError) return <ErrorComponent msg='Erro ao carregar informações sobre a oportunidade.' />;
  if (opportunitySuccess)
    return (
      <div className='flex h-full flex-col md:flex-row'>
        <Sidebar session={session} />
        <div className='flex w-full max-w-full grow flex-col overflow-x-hidden bg-background'>
          <div className='flex h-fit w-full flex-col items-center gap-2 bg-primary px-2 py-4 lg:flex-row'>
            <div className='flex w-full items-center justify-center lg:w-1/3'>
              <Link href={`/comercial/oportunidades/id/${opportunityId}`}>
                <button type='button' className='flex items-center gap-1 rounded-sm bg-primary-foreground px-2 py-1 text-xs text-primary'>
                  <FaStepBackward />
                  <p className='font-bold'>VOLTAR À OPORTUNIDADE</p>
                </button>
              </Link>
            </div>
            <div className='flex w-full flex-col items-center lg:w-1/3'>
              <h1 className='text-[0.55rem] text-primary-foreground/40 lg:text-sm'>NOME DA OPORTUNIDADE</h1>
              <h1 className='font-bold text-primary-foreground'>{opportunity.nome}</h1>
            </div>
            <div className='flex w-full flex-col items-center lg:w-1/3'>
              <h1 className='text-[0.55rem] text-primary-foreground/40 lg:text-sm'>CÓD. DO PROJETO</h1>
              <h1 className='font-bold text-primary-foreground'># {opportunity.identificador}</h1>
            </div>
          </div>
          {saleCategory === 'KIT' ? (
            <ProposalWithKits
              opportunity={opportunity}
              partner={opportunity.parceiro}
              session={session}
              infoHolder={infoHolder}
              setInfoHolder={setInfoHolder}
            />
          ) : null}
          {saleCategory === 'PLANO' ? (
            <ProposalWithPlans
              opportunity={opportunity}
              partner={opportunity.parceiro}
              session={session}
              infoHolder={infoHolder}
              setInfoHolder={setInfoHolder}
            />
          ) : null}
          {saleCategory === 'PRODUTOS' ? (
            <ProposalWithProducts
              opportunity={opportunity}
              partner={opportunity.parceiro}
              session={session}
              infoHolder={infoHolder}
              setInfoHolder={setInfoHolder}
            />
          ) : null}
          {saleCategory === 'SERVIÇOS' ? (
            <ProposalWithServices
              opportunity={opportunity}
              partner={opportunity.parceiro}
              session={session}
              infoHolder={infoHolder}
              setInfoHolder={setInfoHolder}
            />
          ) : null}
        </div>
      </div>
    );
  return <ErrorComponent msg='Erro ao carregar informações sobre a oportunidade.' />;
}

export default NewProposalPage;
