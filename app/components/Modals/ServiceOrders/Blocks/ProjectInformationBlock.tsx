import CheckboxInput from '@/components/Inputs/CheckboxInput'
import Avatar from '@/components/utils/Avatar'
import { formatDateAsLocale, formatLocation, formatNameAsInitials } from '@/lib/methods/formatting'
import { TServiceOrderWithProject } from '@/utils/schemas/service-order.schema'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { AiFillCloseCircle, AiFillEdit } from 'react-icons/ai'
import { BsCalendarPlus } from 'react-icons/bs'
import { FaUserAlt } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'
import { MdDashboard } from 'react-icons/md'
import ServiceOrderProjectVinculationMenu from './Utils/ServiceOrderProjectVinculationMenu'
import FilesBlock from './Utils/FilesBlock'
import { Session } from 'next-auth'

const variants = {
  hidden: {
    opacity: 0.2,
    transition: {
      duration: 0.8, // Adjust the duration as needed
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8, // Adjust the duration as needed
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.01, // Adjust the duration as needed
    },
  },
}

type ProjectInformationBlockProps = {
  orderId?: string
  infoHolder: TServiceOrderWithProject
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrderWithProject>>
  session: Session
}
function ProjectInformationBlock({ orderId, infoHolder, setInfoHolder, session }: ProjectInformationBlockProps) {
  const [vinculationMenuIsOpen, setVinculationMenuIsOpen] = useState<boolean>(false)
  const [showFiles, setShowFiles] = useState<boolean>(false)
  return (
    <div className="flex w-full flex-col gap-y-2">
      <h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES DO PROJETO</h1>
      <div className="flex w-full flex-col gap-1">
        {infoHolder.projetoDados ? (
          <>
            <h1 className="w-full bg-gray-500 p-1 text-center text-xs font-medium text-white">GERAIS</h1>
            <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
              <div className="flex flex-col items-center gap-1 lg:items-start">
                <p className="text-[0.65rem] font-medium text-gray-500">PROJETO</p>
                <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <div className="flex items-center gap-1">
                    <FaUserAlt />
                    <p className="text-[0.6rem] font-medium leading-none tracking-tight">{infoHolder.projetoDados.nome}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaLocationDot />
                    <p className="text-[0.6rem] font-medium leading-none tracking-tight">
                      {formatLocation({ location: infoHolder.projetoDados.localizacao, includeCity: true, includeUf: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdDashboard />
                    <p className="text-[0.6rem] font-medium leading-none tracking-tight">{infoHolder.projetoDados.tipo.titulo}</p>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="w-full bg-gray-500 p-1 text-center text-xs font-medium text-white">OBSERVAÇÕES</h1>
            {infoHolder.projetoDados.observacoes.length > 0 ? (
              infoHolder.projetoDados.observacoes.map((obs, index) => (
                <div key={index} className="flex w-full flex-col rounded-md border border-gray-500">
                  <div className="flex min-h-[25px] w-full flex-col items-start justify-between gap-1 lg:flex-row">
                    <div className="flex w-full items-center justify-center rounded-br-md rounded-tl-md bg-cyan-700 lg:w-[40%]">
                      <p className="w-full text-center text-xs font-medium text-white">{obs.assunto}</p>
                    </div>
                    <div className="flex grow items-center justify-end gap-2 p-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1`}>
                          <BsCalendarPlus />
                          <p className="text-[0.6rem] font-medium">{formatDateAsLocale(obs.data)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Avatar fallback={formatNameAsInitials(obs.autor.nome)} url={obs.autor.avatar_url || undefined} height={20} width={20} />
                          <p className="text-[0.6rem] font-medium">{obs.autor.nome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h1 className="w-full p-2 text-center text-xs font-medium tracking-tight text-gray-500">{obs.descricao}</h1>
                </div>
              ))
            ) : (
              <p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhuma observação adicionada ao projeto.</p>
            )}
            {orderId ? (
              <>
                <div className="flex w-full items-center justify-center py-2">
                  <div className="w-fit">
                    <CheckboxInput
                      labelFalse="MOSTRAR ARQUIVOS"
                      labelTrue="MOSTRAR ARQUIVOS"
                      checked={showFiles}
                      handleChange={(value) => setShowFiles(value)}
                    />
                  </div>
                </div>
                {showFiles ? (
                  <FilesBlock
                    serviceOrderId={orderId}
                    projectId={infoHolder.projetoDados?._id}
                    clientId={infoHolder.projetoDados?.cliente.id}
                    opportunityId={infoHolder.projetoDados?.oportunidade.id}
                    analysisId={infoHolder.projetoDados?.idAnaliseTecnica || undefined}
                    session={session}
                  />
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        <div className="flex w-full items-center justify-center py-2">
          <div className="w-fit">
            <CheckboxInput
              labelFalse="ABRIR MENU DE VINCULAÇÃO"
              labelTrue="ABRIR MENU DE VINCULAÇÃO"
              checked={vinculationMenuIsOpen}
              handleChange={(value) => setVinculationMenuIsOpen(value)}
            />
          </div>
        </div>
        <AnimatePresence>
          {vinculationMenuIsOpen ? (
            <ServiceOrderProjectVinculationMenu
              vinculatedId={infoHolder.projeto.id}
              infoHolder={infoHolder}
              setInfoHolder={setInfoHolder}
              closeMenu={() => setVinculationMenuIsOpen(false)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProjectInformationBlock
