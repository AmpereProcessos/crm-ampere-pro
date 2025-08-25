import TextInput from '@/components/Inputs/TextInput';
import { formatToPhone } from '@/utils/methods';
import { TServiceOrder } from '@/utils/schemas/service-order.schema';
import React from 'react';

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
type FavoredInformationBlockProps = {
  infoHolder: TServiceOrder;
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
};
function FavoredInformationBlock({ infoHolder, setInfoHolder }: FavoredInformationBlockProps) {
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>FAVORECIDO</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='NOME DO FAVORECIDO'
              placeholder='Preencha aqui o nome do favorecido.'
              value={infoHolder.favorecido.nome}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, favorecido: { ...prev.favorecido, nome: value } }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='CONTATO DO FAVORECIDO'
              placeholder='Preencha aqui o contato do favorecido.'
              value={infoHolder.favorecido.contato}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, favorecido: { ...prev.favorecido, contato: formatToPhone(value) } }))}
              width='100%'
            />
          </div>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="flex w-full flex-col gap-2">
  //     <div className="flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2">
  //       <h1 className="font-bold text-white">INFORMAÇÕES DO FAVORECIDO</h1>
  //       <button onClick={() => setEditModeEnable((prev) => !prev)}>
  //         {!editModeEnable ? <AiFillEdit color="white" /> : <AiFillCloseCircle color="#ff1736" />}
  //       </button>
  //     </div>
  //     <AnimatePresence>
  //       {editModeEnable ? (
  //         <motion.div key={'editor'} variants={variants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-2">
  //           <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
  //             <div className="w-1/2 lg:w-full">
  //               <TextInput
  //                 label="NOME DO FAVORECIDO"
  //                 placeholder="Preencha aqui o nome do favorecido."
  //                 value={infoHolder.favorecido.nome}
  //                 handleChange={(value) => setInfoHolder((prev) => ({ ...prev, favorecido: { ...prev.favorecido, nome: value } }))}
  //                 width="100%"
  //               />
  //             </div>
  //             <div className="w-1/2 lg:w-full">
  //               <TextInput
  //                 label="CONTATO DO FAVORECIDO"
  //                 placeholder="Preencha aqui o contato do favorecido."
  //                 value={infoHolder.favorecido.contato}
  //                 handleChange={(value) => setInfoHolder((prev) => ({ ...prev, favorecido: { ...prev.favorecido, contato: formatToPhone(value) } }))}
  //                 width="100%"
  //               />
  //             </div>
  //           </div>
  //         </motion.div>
  //       ) : (
  //         <motion.div key={'readOnly'} variants={variants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-1">
  //           <div className="mt-2 flex w-full flex-col items-center justify-center gap-2 md:flex-row lg:gap-4">
  //             <div className="flex items-center gap-2 text-primary/80">
  //               <FaUser size={'20px'} color="rgb(31,41,55)" />
  //               <p className="text-sm font-medium tracking-tight">{infoHolder.favorecido?.nome || 'N/A'}</p>
  //             </div>
  //             <div className="flex items-center gap-2 text-primary/80">
  //               <AiFillPhone size={'20px'} color="rgb(31,41,55)" />
  //               <p className="text-sm font-medium tracking-tight">{infoHolder.favorecido?.contato || 'N/A'}</p>
  //             </div>
  //           </div>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //   </div>
  // )
}

export default FavoredInformationBlock;
