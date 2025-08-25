import type { TUserSession } from '@/lib/auth/session';
import { formatDateAsLocale, formatLocation } from '@/lib/methods/formatting';
import type { TClientDTO } from '@/utils/schemas/client.schema';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import { Accessibility, BriefcaseBusiness, Building2, Cake, Filter, Phone, User, UserRound } from 'lucide-react';
import { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { BsCalendarPlus } from 'react-icons/bs';
import { FaRing } from 'react-icons/fa';
import { FaLocationDot, FaRegIdCard } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import EditClient from '../Modals/Client/EditClient';
import Avatar from '../utils/Avatar';

type OpportunityClientProps = {
  opportunityId: string;
  client: TClientDTO;
  responsibles: TOpportunity['responsaveis'];
  session: TUserSession;
};
function OpportunityClient({ opportunityId, client, responsibles, session }: OpportunityClientProps) {
  const [editModalIsOpen, setEditModalIsOpen] = useState<boolean>(false);
  const userScope = session.user.permissoes.clientes.escopo;
  const userHasClientEditPermission = !userScope || userScope.includes(client.autor.id) || responsibles.some((r) => userScope.includes(r.id));
  return (
    <div className='flex h-[450px] w-full flex-col rounded-md border border-primary/30 bg-background p-3 shadow-lg lg:h-[300px]'>
      <div className='flex h-[40px] items-center justify-between border-b border-primary/30 pb-2'>
        <h1 className='font-bold text-primary'>Dados do Cliente</h1>
        {userHasClientEditPermission ? (
          <button
            type='button'
            onClick={() => setEditModalIsOpen(true)}
            className='text-md text-primary/40 duration-300 ease-in-out hover:text-blue-800'
          >
            <AiFillEdit />
          </button>
        ) : null}
      </div>

      <div className='mt-3 flex w-full grow flex-col gap-2'>
        <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
          <div className='flex flex-col items-center gap-1 lg:items-start'>
            <p className='text-[0.65rem] font-medium text-primary/50'>GERAIS</p>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
              <div className='flex items-center gap-1'>
                <UserRound size={15} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.nome}</p>
              </div>
              <div className='flex items-center gap-1'>
                <FaRegIdCard size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.cpfCnpj}</p>
              </div>
              <div className='flex items-center gap-1'>
                <Cake size={15} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>
                  {client.dataNascimento ? formatDateAsLocale(client.dataNascimento) : 'NÃO DEFINIDO'}
                </p>
              </div>
              <div className='flex items-center gap-1'>
                <FaRing size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.estadoCivil || 'NÃO DEFINIDO'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
          <div className='flex flex-col items-center gap-1 lg:items-start'>
            <p className='text-[0.65rem] font-medium text-primary/50'>CONTATOS</p>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
              <div className='flex items-center gap-1'>
                <Phone size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.telefonePrimario}</p>
              </div>
              <div className='flex items-center gap-1'>
                <MdEmail size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.email || 'NÃO DEFINIDO'}</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center gap-1 lg:items-end'>
            <p className='text-[0.65rem] font-medium text-primary/50'>AQUISIÇÃO</p>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
              <div className='flex items-center gap-1'>
                <Filter size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.canalAquisicao}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
          <div className='flex flex-col items-center gap-1 lg:items-start'>
            <p className='text-[0.65rem] font-medium text-primary/50'>LOCALIZAÇÃO</p>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
              <div className='flex items-center gap-1'>
                <FaLocationDot size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>
                  {formatLocation({
                    location: {
                      cep: client.cep,
                      uf: client.uf,
                      cidade: client.cidade,
                      bairro: client.bairro,
                      endereco: client.endereco,
                      numeroOuIdentificador: client.numeroOuIdentificador,
                      complemento: client.complemento,
                    },
                    includeCity: true,
                    includeUf: true,
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center gap-1 lg:items-end'>
            <p className='text-[0.65rem] font-medium text-primary/50'>ESTADO CIVIL</p>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
              <div className='flex items-center gap-1'>
                <FaRing size={15} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.estadoCivil}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
          <div className='flex flex-col items-center gap-1 lg:items-start'>
            <p className='text-[0.65rem] font-medium text-primary/50'>TRABALHO</p>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
              <div className='flex items-center gap-1'>
                <BriefcaseBusiness size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.profissao || 'NÃO DEFINIDO'}</p>
              </div>
              <div className='flex items-center gap-1'>
                <Building2 size={12} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.ondeTrabalha || 'NÃO DEFINIDO'}</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center gap-1 lg:items-end'>
            <p className='text-[0.65rem] font-medium text-primary/50'>DEFICIÊNCIA</p>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
              <div className='flex items-center gap-1'>
                <Accessibility size={15} />
                <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.deficiencia || 'NÃO DEFINIDO'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-center gap-1'>
          <p className='text-[0.65rem] font-medium text-primary/50'>INDICAÇÃO</p>
          <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-center'>
            {client.indicador.nome ? (
              <>
                <div className='flex items-center gap-1'>
                  <User size={15} />
                  <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.indicador.nome}</p>
                </div>
                <div className='flex items-center gap-1'>
                  <Phone size={15} />
                  <p className='text-[0.75rem] font-medium leading-none tracking-tight'>{client.indicador.contato || 'NÃO DEFINIDO'}</p>
                </div>
              </>
            ) : (
              <p className='text-[0.75rem] font-medium leading-none tracking-tight'>NÃO APLICÁVEL</p>
            )}
          </div>
        </div>
      </div>
      <div className='flex w-full items-center justify-end gap-2'>
        <div className={'flex items-center gap-1'}>
          <BsCalendarPlus />
          <p className='text-[0.65rem] font-medium text-primary/50'>{formatDateAsLocale(client.dataInsercao, true)}</p>
        </div>
        <div className='flex items-center gap-1'>
          <Avatar fallback={'R'} url={client.autor.avatar_url || undefined} height={20} width={20} />
          <p className='text-[0.65rem] font-medium text-primary/50'>{client.autor.nome}</p>
        </div>
      </div>
      {editModalIsOpen ? (
        <EditClient
          clientId={client._id}
          session={session}
          partnerId={client.idParceiro}
          closeModal={() => setEditModalIsOpen(false)}
          additionalAffectedQuery={['opportunity-by-id', opportunityId]}
        />
      ) : null}
    </div>
  );
}

export default OpportunityClient;
