import CheckboxInput from '@/components/Inputs/CheckboxInput';
import Avatar from '@/components/utils/Avatar';
import type { TUserSession } from '@/lib/auth/session';
import { formatDateAsLocale, formatLocation, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting';
import { getFractionnementValue } from '@/utils/payment';
import { TRevenue, TRevenueWithProjectDTO } from '@/utils/schemas/revenues.schema';
import { AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { BsBank, BsCalendarPlus, BsCircleHalf, BsPersonVcard } from 'react-icons/bs';
import { FaPercentage, FaPhone, FaUserAlt } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdDashboard, MdPayment } from 'react-icons/md';
import FilesBlock from './FilesBlock';
import RevenueProjectVinculationMenu from './Utils/ProjectVinculationMenu';

type RevenueProjectInformationBlockEditProps = {
  infoHolder: TRevenueWithProjectDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TRevenueWithProjectDTO>>;
  session: TUserSession;
  handleUpdateRevenue: (revenue: TRevenue) => void;
};
function RevenueProjectInformationBlockEdit({ infoHolder, setInfoHolder, session, handleUpdateRevenue }: RevenueProjectInformationBlockEditProps) {
  const [vinculationMenuIsOpen, setVinculationMenuIsOpen] = useState<boolean>(false);
  const [showFiles, setShowFiles] = useState<boolean>(false);
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>INFORMAÇÕES DO PROJETO</h1>
      <div className='flex w-full flex-col gap-1'>
        {infoHolder.projetoDados ? (
          <>
            <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-white'>GERAIS</h1>
            <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
              <div className='flex flex-col items-center gap-1 lg:items-start'>
                <p className='text-[0.65rem] font-medium text-primary/50'>PROJETO</p>
                <div className='flex flex-wrap items-center justify-center gap-4 lg:justify-start'>
                  <div className='flex items-center gap-1'>
                    <FaUserAlt />
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{infoHolder.projetoDados.nome}</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <FaLocationDot />
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                      {formatLocation({ location: infoHolder.projetoDados.localizacao, includeCity: true, includeUf: true })}
                    </p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <MdDashboard />
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{infoHolder.projetoDados.tipo.titulo}</p>
                  </div>
                </div>
              </div>
            </div>
            <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-white'>OBSERVAÇÕES</h1>
            {infoHolder.projetoDados.observacoes.length > 0 ? (
              infoHolder.projetoDados.observacoes.map((obs, index) => (
                <div key={index} className='flex w-full flex-col rounded-md border border-primary/50'>
                  <div className='flex min-h-[25px] w-full flex-col items-start justify-between gap-1 lg:flex-row'>
                    <div className='flex w-full items-center justify-center rounded-br-md rounded-tl-md bg-cyan-700 lg:w-[40%]'>
                      <p className='w-full text-center text-xs font-medium text-white'>{obs.assunto}</p>
                    </div>
                    <div className='flex grow items-center justify-end gap-2 p-2'>
                      <div className='flex items-center gap-2'>
                        <div className={`flex items-center gap-1`}>
                          <BsCalendarPlus />
                          <p className='text-[0.6rem] font-medium'>{formatDateAsLocale(obs.data)}</p>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Avatar fallback={formatNameAsInitials(obs.autor.nome)} url={obs.autor.avatar_url || undefined} height={20} width={20} />
                          <p className='text-[0.6rem] font-medium'>{obs.autor.nome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h1 className='w-full p-2 text-center text-xs font-medium tracking-tight text-primary/50'>{obs.descricao}</h1>
                </div>
              ))
            ) : (
              <p className='w-full text-center text-sm font-medium tracking-tight text-primary/50'>Nenhuma observação adicionada ao projeto.</p>
            )}
            <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-white'>PAGAMENTO</h1>
            <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
              <div className='flex flex-col items-center gap-1 lg:items-start'>
                <p className='text-[0.65rem] font-medium text-primary/50'>PAGADOR</p>
                <div className='flex flex-wrap items-center justify-center gap-4 lg:justify-start'>
                  <div className='flex items-center gap-1'>
                    <FaUserAlt />
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{infoHolder.projetoDados?.pagamento.pagador.nome}</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <FaPhone />
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{infoHolder.projetoDados?.pagamento.pagador.telefone}</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <BsPersonVcard />
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{infoHolder.projetoDados?.pagamento.pagador.cpfCnpj}</p>
                  </div>
                </div>
              </div>
              <div className='flex flex-col items-center gap-1 lg:items-end'>
                <p className='text-[0.65rem] font-medium text-primary/50'>CREDOR</p>
                <div className='flex flex-wrap items-center justify-center gap-4 lg:justify-start'>
                  <div className='flex items-center gap-1'>
                    <BsBank />
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                      {infoHolder.projetoDados?.pagamento.credito.credor || 'NÃO DEFINIDO'}
                    </p>
                  </div>
                  {infoHolder.projetoDados?.pagamento.credito.credor ? (
                    <>
                      <div className='flex items-center gap-1'>
                        <FaUserAlt />
                        <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                          {infoHolder.projetoDados?.pagamento.credito.nomeResponsavel}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <FaPhone />
                        <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                          {infoHolder.projetoDados?.pagamento.credito.telefoneResponsavel}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <p className='text-[0.65rem] font-medium text-primary/50'>FRACIONAMENTO</p>
            <div className='flex w-full flex-wrap items-center justify-start gap-2'>
              {infoHolder.projetoDados.pagamento.metodo.fracionamento.map((fractionnement, itemIndex) => (
                <div key={itemIndex} className={`flex w-[450px] flex-col rounded-md border border-primary/50 p-2  shadow-md`}>
                  <div className='flex w-full items-center justify-between gap-2'>
                    <h1 className='text-xs font-black leading-none tracking-tight lg:text-sm'>FRAÇÃO DE {fractionnement.porcentagem}%</h1>
                    <h1 className='rounded-full bg-primary/80 px-2 py-1 text-[0.65rem] font-medium text-white lg:text-xs'>
                      {formatToMoney(getFractionnementValue({ fractionnement, proposalValue: infoHolder.projetoDados?.valor || 0 }))}
                    </h1>
                  </div>
                  <div className='mt-2 flex w-full flex-wrap items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <MdPayment color={'#76c893'} />
                      <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/50 lg:text-xs'>{fractionnement.metodo}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <BsCircleHalf color='#ed174c' />
                      <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/50 lg:text-xs'>
                        {fractionnement.parcelas} {fractionnement.parcelas ? (fractionnement.parcelas > 1 ? 'PARCELAS' : 'PARCELA') : null}
                      </p>
                    </div>
                    {fractionnement.taxaJuros ? (
                      <div className='flex items-center gap-2'>
                        <FaPercentage />
                        <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/50 lg:text-xs'>
                          {fractionnement.taxaJuros} DE JUROS
                        </p>
                      </div>
                    ) : null}
                    {fractionnement.taxaUnica ? (
                      <div className='flex items-center gap-2'>
                        <FaPercentage />
                        <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/50 lg:text-xs'>
                          {fractionnement.taxaUnica} DE USO
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className='flex w-full items-center justify-center py-2'>
              <div className='w-fit'>
                <CheckboxInput
                  labelFalse='MOSTRAR ARQUIVOS'
                  labelTrue='MOSTRAR ARQUIVOS'
                  checked={showFiles}
                  handleChange={(value) => setShowFiles(value)}
                />
              </div>
            </div>
            {showFiles ? (
              <FilesBlock
                revenueId={infoHolder._id}
                projectId={infoHolder.projetoDados?._id}
                clientId={infoHolder.projetoDados?.cliente.id}
                opportunityId={infoHolder.projetoDados?.oportunidade.id}
                analysisId={infoHolder.projetoDados?.idAnaliseTecnica || undefined}
                session={session}
              />
            ) : null}
          </>
        ) : null}

        <div className='flex w-full items-center justify-center py-2'>
          <div className='w-fit'>
            <CheckboxInput
              labelFalse='ABRIR MENU DE VINCULAÇÃO'
              labelTrue='ABRIR MENU DE VINCULAÇÃO'
              checked={vinculationMenuIsOpen}
              handleChange={(value) => setVinculationMenuIsOpen(value)}
            />
          </div>
        </div>
        <AnimatePresence>
          {vinculationMenuIsOpen ? (
            <RevenueProjectVinculationMenu
              vinculatedId={infoHolder.projeto.id}
              infoHolder={infoHolder}
              setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TRevenue>>}
              closeMenu={() => setVinculationMenuIsOpen(false)}
              handleUpdateRevenue={handleUpdateRevenue}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default RevenueProjectInformationBlockEdit;
