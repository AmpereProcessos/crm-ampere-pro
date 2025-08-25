import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { TServiceOrder } from '@/utils/schemas/service-order.schema';
import { ServiceOrderCategories, ServiceOrderUrgencies } from '@/utils/select-options';
import React, { useState } from 'react';
import ObservationsBlock from './Utils/ObservationsBlock';

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
};
type GeneralInformationBlockProps = {
  infoHolder: TServiceOrder;
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
  initialEditModeEnable?: boolean;
};
function GeneralInformationBlock({ infoHolder, setInfoHolder, initialEditModeEnable = false }: GeneralInformationBlockProps) {
  const [editModeEnable, setEditModeEnable] = useState<boolean>(initialEditModeEnable);

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground'>INFORMAÇÕES GERAIS</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col gap-2 lg:flex-row'>
          <div className='w-full'>
            <TextInput
              label='DESCRIÇÃO DO SERVIÇO'
              placeholder='Preencha aqui a descrição da ordem de serviço...'
              value={infoHolder.descricao}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
              width='100%'
            />
          </div>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <SelectInput
                label='CATEGORIA DO SERVIÇO'
                value={infoHolder.categoria}
                options={ServiceOrderCategories}
                handleChange={(value) => setInfoHolder((prev) => ({ ...prev, categoria: value }))}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => setInfoHolder((prev) => ({ ...prev, categoria: 'OUTROS' }))}
              />
            </div>
            <div className='w-full lg:w-1/2'>
              <SelectInput
                label='URGÊNCIA DO SERVIÇO'
                value={infoHolder.urgencia}
                options={ServiceOrderUrgencies}
                handleChange={(value) => setInfoHolder((prev) => ({ ...prev, urgencia: value }))}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => setInfoHolder((prev) => ({ ...prev, urgencia: null }))}
              />
            </div>
          </div>
        </div>
        <ObservationsBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
      </div>
    </div>
  );
  // return (
  //   <div className="flex w-full flex-col gap-2">
  //     <div className="flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2">
  //       <h1 className="font-bold text-primary-foreground">INFORMAÇÕES GERAIS</h1>
  //       <button onClick={() => setEditModeEnable((prev) => !prev)}>
  //         {!editModeEnable ? <AiFillEdit color="white" /> : <AiFillCloseCircle color="#ff1736" />}
  //       </button>
  //     </div>
  //     <AnimatePresence>
  //       {editModeEnable ? (
  //         <motion.div key={'editor'} variants={variants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-2">
  //           <div className="flex w-full flex-col gap-2 lg:flex-row">
  //             <div className="w-full">
  //               <TextInput
  //                 label="DESCRIÇÃO DO SERVIÇO"
  //                 placeholder="Preencha aqui a descrição da ordem de serviço..."
  //                 value={infoHolder.descricao}
  //                 handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
  //                 width="100%"
  //               />
  //             </div>
  //             <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
  //               <div className="w-full lg:w-1/2">
  //                 <SelectInput
  //                   label="CATEGORIA DO SERVIÇO"
  //                   value={infoHolder.categoria}
  //                   options={ServiceOrderCategories}
  //                   handleChange={(value) => setInfoHolder((prev) => ({ ...prev, categoria: value }))}
  //                   resetOptionLabel="NÃO DEFINIDO"
  //                   onReset={() => setInfoHolder((prev) => ({ ...prev, categoria: 'OUTROS' }))}
  //                 />
  //               </div>
  //               <div className="w-full lg:w-1/2">
  //                 <SelectInput
  //                   label="URGÊNCIA DO SERVIÇO"
  //                   value={infoHolder.urgencia}
  //                   options={ServiceOrderUrgencies}
  //                   handleChange={(value) => setInfoHolder((prev) => ({ ...prev, urgencia: value }))}
  //                   resetOptionLabel="NÃO DEFINIDO"
  //                   onReset={() => setInfoHolder((prev) => ({ ...prev, urgencia: null }))}
  //                 />
  //               </div>
  //             </div>
  //           </div>
  //         </motion.div>
  //       ) : (
  //         <motion.div key={'readOnly'} variants={variants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-1">
  //           <div className="flex w-full items-center justify-center gap-2 text-primary/80">
  //             <MdOutlineMenu size={'20px'} color="rgb(31,41,55)" />
  //             <p className="text-sm font-medium tracking-tight">{infoHolder.descricao}</p>
  //           </div>
  //           <div className="flex w-full items-center justify-center gap-4">
  //             <div className="flex items-center gap-2 text-primary/80">
  //               <FaDiamond size={'20px'} color="rgb(31,41,55)" />
  //               <p className="text-sm font-medium tracking-tight">{infoHolder.categoria}</p>
  //             </div>
  //             <div className="flex items-center gap-2 text-primary/80">
  //               <AiOutlineAlert size={'20px'} color="rgb(31,41,55)" />
  //               <p className="text-sm font-medium tracking-tight">{infoHolder.urgencia || 'NÃO DEFINIDO'}</p>
  //             </div>
  //           </div>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //   </div>
  // )
}

export default GeneralInformationBlock;
