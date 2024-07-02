import React, { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { AnimatePresence, motion } from 'framer-motion'
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants'
import { MdContentCopy } from 'react-icons/md'
import { copyToClipboard } from '@/lib/hooks'
import { usePartnersSimplified } from '@/utils/queries/partners'
import { Session } from 'next-auth'
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'

type BulkOperationPartnersProps = {
  session: Session
  partners: TPartnerSimplifiedDTO[]
}
function BulkOperationPartners({ session, partners }: BulkOperationPartnersProps) {
  const userPartnerScope = session.user.permissoes.parceiros.escopo

  const partnersSelectableOptions = partners ? (userPartnerScope ? partners.filter((a) => userPartnerScope.includes(a._id)) : partners) : []
  const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false)
  return (
    <AnimatePresence>
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          <h1 className="text-xs font-medium tracking-tight text-gray-500">RESTRIÇÕES DE PARCEIRO (COMO USAR)</h1>
          <button
            data-block-open={blockIsOpen ? 'true' : 'false'}
            onClick={() => setBlockIsOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-md bg-indigo-200 p-1 text-xs text-blue-600 duration-300 ease-out data-[block-open=true]:rotate-180"
          >
            <FaChevronDown />
          </button>
        </div>
        {blockIsOpen ? (
          <motion.div
            key={'block-open'}
            variants={GeneralVisibleHiddenExitMotionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex w-full flex-col gap-2 p-2"
          >
            <p className="text-sm tracking-tight text-gray-500">
              A coluna <strong className="text-[#E25E3E]">VISIBILIDADE DE PARCEIRO</strong> será referência para a restrição de visibilidade de parceiros do
              kit.
            </p>
            <p className="text-sm tracking-tight text-gray-500">
              Para facilitar, abaixo estão listas os parceiros cadastrados. Clique em um deles para copiar o texto a ser preenchido na coluna.
            </p>
            <p className="text-sm tracking-tight text-gray-500">
              Se restrição não aplicável, preencha <strong>N/A</strong>.
            </p>
            <div className="mt-2 flex w-full flex-wrap items-start gap-2">
              {partnersSelectableOptions ? (
                partnersSelectableOptions.map((partner) => (
                  <button
                    key={partner._id}
                    onClick={() => copyToClipboard(partner.nome)}
                    className="flex items-center gap-1 rounded border border-cyan-600 px-2 py-1 font-medium text-cyan-600"
                  >
                    <p className="text-xs">{partner.nome}</p>
                    <MdContentCopy />
                  </button>
                ))
              ) : (
                <p className="flex w-full grow animate-pulse items-center justify-center py-2 text-center text-sm font-medium italic tracking-tight text-gray-500">
                  Carregando parceiros...
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </AnimatePresence>
  )
}

export default BulkOperationPartners
