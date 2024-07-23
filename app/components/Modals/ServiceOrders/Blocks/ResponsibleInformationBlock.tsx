import CheckboxInput from '@/components/Inputs/CheckboxInput'
import SelectWithImages from '@/components/Inputs/SelectWithImages'
import TextInput from '@/components/Inputs/TextInput'
import Avatar from '@/components/utils/Avatar'
import { formatNameAsInitials } from '@/lib/methods/formatting'
import { useUsers } from '@/utils/queries/users'
import { TServiceOrder } from '@/utils/schemas/service-order.schema'
import { AnimatePresence, motion } from 'framer-motion'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { AiFillCloseCircle, AiFillEdit } from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
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
type ResponsibleInformationBlockProps = {
  infoHolder: TServiceOrder
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>
}
function ResponsibleInformationBlock({ infoHolder, setInfoHolder }: ResponsibleInformationBlockProps) {
  const { data: users } = useUsers()

  const [newResponsibleHolder, setNewResponsibleHolder] = useState<TServiceOrder['responsaveis'][number]>({
    id: '',
    nome: '',
    avatar_url: null,
    tipo: 'INTERNO',
  })

  function addResponsible(responsible: TServiceOrder['responsaveis'][number]) {
    const responsibles = [...infoHolder.responsaveis]
    responsibles.push(responsible)
    setInfoHolder((prev) => ({ ...prev, responsaveis: responsibles }))
    return toast.success('Responsável adicionado !', { position: 'bottom-center' })
  }
  function removeResponsible(index: number) {
    const responsibles = [...infoHolder.responsaveis]
    responsibles.splice(index, 1)
    setInfoHolder((prev) => ({ ...prev, responsaveis: responsibles }))
    return toast.success('Responsável removido !', { position: 'bottom-center' })
  }

  return (
    <div className="flex w-full flex-col gap-y-2">
      <h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">RESPONSÁVEIS</h1>
      <div className="flex w-full flex-col gap-1">
        {infoHolder.responsaveis.length > 0 ? (
          <div className="flex w-full flex-col gap-1">
            <h1 className="w-full text-start text-sm font-medium tracking-tight text-gray-500">Os responsáveis pela execução do serviço são:</h1>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {infoHolder.responsaveis.map((responsible, index) => (
                <div
                  onClick={() => removeResponsible(index)}
                  key={index}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-500 p-2 text-gray-800 hover:border-red-500"
                >
                  <Avatar url={responsible.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(responsible.nome)} />
                  <p className="text-sm font-medium tracking-tight">{responsible.nome}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhum responsável adicionado ao serviço.</p>
        )}

        <div className="flex w-full flex-col gap-1">
          {newResponsibleHolder.tipo == 'INTERNO' ? (
            <SelectWithImages
              label={'RESPONSÁVEL'}
              editable={true}
              value={newResponsibleHolder.id}
              options={
                users?.map((resp) => ({
                  id: resp._id,
                  label: resp.nome,
                  value: resp._id,
                  url: resp.avatar_url || undefined,
                  fallback: formatNameAsInitials(resp.nome),
                })) || []
              }
              handleChange={(value) => {
                const responsible = users?.find((u) => u._id == value)
                setNewResponsibleHolder((prev) => ({
                  id: responsible?._id || '',
                  nome: responsible?.nome || '',
                  tipo: 'INTERNO',
                  avatar_url: responsible?.avatar_url,
                }))
              }}
              onReset={() =>
                setNewResponsibleHolder({
                  id: '',
                  nome: '',
                  tipo: 'INTERNO',
                  avatar_url: null,
                })
              }
              selectedItemLabel={'USUÁRIO NÃO DEFINIDO'}
              width="100%"
            />
          ) : (
            <TextInput
              label="NOME DO RESPONSÁVEL"
              placeholder="Preencha aqui o nome do responsável..."
              value={newResponsibleHolder.nome}
              handleChange={(value) => setNewResponsibleHolder((prev) => ({ ...prev, nome: value }))}
              width="100%"
            />
          )}
          <div className="flex items-center justify-end gap-4">
            <div className="w-fit">
              <CheckboxInput
                labelFalse="RESPONSÁVEL INTERNO"
                labelTrue="RESPONSÁVEL INTERNO"
                checked={newResponsibleHolder.tipo == 'INTERNO'}
                handleChange={(value) => setNewResponsibleHolder((prev) => ({ id: '', nome: '', tipo: value ? 'INTERNO' : 'EXTERNO', avatar_url: null }))}
              />
            </div>
            <button
              className="rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
              onClick={() => addResponsible(newResponsibleHolder)}
            >
              ADICIONAR RESPONSÁVEL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  // return (
  //   <div className="flex w-full flex-col gap-2">
  //     <div className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2">
  //       <h1 className="font-bold text-white">RESPONSÁVEIS</h1>
  //       <button onClick={() => setEditModeEnable((prev) => !prev)}>
  //         {!editModeEnable ? <AiFillEdit color="white" /> : <AiFillCloseCircle color="#ff1736" />}
  //       </button>
  //     </div>
  //     <AnimatePresence>
  //       {editModeEnable ? (
  //         <motion.div key={'editor'} variants={variants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-2">
  //           <div className="flex w-full flex-wrap items-center gap-2">
  //             {infoHolder.responsaveis.length > 0 ? (
  //               infoHolder.responsaveis.map((responsible, index) => (
  //                 <div
  //                   onClick={() => removeResponsible(index)}
  //                   key={index}
  //                   className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-500 p-2 text-gray-800 hover:border-red-500"
  //                 >
  //                   <Avatar url={responsible.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(responsible.nome)} />
  //                   <p className="text-sm font-medium tracking-tight">{responsible.nome}</p>
  //                 </div>
  //               ))
  //             ) : (
  //               <p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhum responsável adicionado ao serviço.</p>
  //             )}
  //           </div>
  //           <div className="flex w-[80%] flex-col gap-2 self-center rounded border border-gray-500 p-2">
  //             <div className="flex w-full items-center justify-center">
  //               <div className="w-fit">
  //                 <CheckboxInput
  //                   labelFalse="RESPONSÁVEL INTERNO"
  //                   labelTrue="RESPONSÁVEL INTERNO"
  //                   checked={newResponsibleHolder.tipo == 'INTERNO'}
  //                   handleChange={(value) => setNewResponsibleHolder((prev) => ({ id: '', nome: '', tipo: value ? 'INTERNO' : 'EXTERNO', avatar_url: null }))}
  //                 />
  //               </div>
  //             </div>
  //             <div className="w-full">
  //               {newResponsibleHolder.tipo == 'INTERNO' ? (
  //                 <SelectWithImages
  //                   label={'RESPONSÁVEL'}
  //                   editable={true}
  //                   value={newResponsibleHolder.id}
  //                   options={
  //                     users?.map((resp) => ({
  //                       id: resp._id,
  //                       label: resp.nome,
  //                       value: resp._id,
  //                       url: resp.avatar_url || undefined,
  //                       fallback: formatNameAsInitials(resp.nome),
  //                     })) || []
  //                   }
  //                   handleChange={(value) => {
  //                     const responsible = users?.find((u) => u._id == value)
  //                     setNewResponsibleHolder((prev) => ({
  //                       id: responsible?._id || '',
  //                       nome: responsible?.nome || '',
  //                       tipo: 'INTERNO',
  //                       avatar_url: responsible?.avatar_url,
  //                     }))
  //                   }}
  //                   onReset={() =>
  //                     setNewResponsibleHolder({
  //                       id: '',
  //                       nome: '',
  //                       tipo: 'INTERNO',
  //                       avatar_url: null,
  //                     })
  //                   }
  //                   selectedItemLabel={'USUÁRIO NÃO DEFINIDO'}
  //                   width="100%"
  //                 />
  //               ) : (
  //                 <TextInput
  //                   label="NOME DO RESPONSÁVEL"
  //                   placeholder="Preencha aqui o nome do responsável..."
  //                   value={newResponsibleHolder.nome}
  //                   handleChange={(value) => setNewResponsibleHolder((prev) => ({ ...prev, nome: value }))}
  //                   width="100%"
  //                 />
  //               )}
  //             </div>
  //             <div className="mt-1 flex w-full items-center justify-end">
  //               <button
  //                 onClick={() => addResponsible(newResponsibleHolder)}
  //                 className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
  //               >
  //                 ADICIONAR
  //               </button>
  //             </div>
  //           </div>
  //         </motion.div>
  //       ) : (
  //         <motion.div key={'readOnly'} variants={variants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-1">
  //           <div className="flex w-full items-center justify-center gap-2 text-gray-800">
  //             <div className="flex flex-wrap items-center gap-6">
  //               {infoHolder.responsaveis.length > 0 ? (
  //                 infoHolder.responsaveis.map((responsible, index) => (
  //                   <div key={index} className="flex items-center gap-2 text-gray-800">
  //                     <Avatar url={responsible.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(responsible.nome)} />
  //                     <p className="text-sm font-medium tracking-tight">{responsible.nome}</p>
  //                   </div>
  //                 ))
  //               ) : (
  //                 <p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhum responsável adicionado ao serviço.</p>
  //               )}
  //             </div>
  //           </div>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //   </div>
  // )
}

export default ResponsibleInformationBlock
