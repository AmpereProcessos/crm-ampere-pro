import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { stateCities } from '@/utils/estados_cidades';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { AiFillCloseCircle, AiFillEdit } from 'react-icons/ai';
import { FaCity } from 'react-icons/fa';
import { MdLocationPin } from 'react-icons/md';
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

type LocationBlockProps = {
  infoHolder: TTechnicalAnalysisDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
  changes: object;
  setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function LocationBlock({ infoHolder, setInfoHolder, changes, setChanges }: LocationBlockProps) {
  const [editEnabled, setEditEnabled] = useState(false);
  return (
    <div className='mt-4 flex w-full flex-col'>
      <div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
        <h1 className='font-bold text-white'>LOCALIZAÇÃO</h1>
        <button onClick={() => setEditEnabled((prev) => !prev)}>
          {!editEnabled ? <AiFillEdit color='white' /> : <AiFillCloseCircle color='#ff1736' />}
        </button>
      </div>
      <AnimatePresence>
        {editEnabled ? (
          <motion.div key={'editor'} variants={variants} initial='hidden' animate='visible' exit='exit' className='mt-2 flex w-full flex-col gap-2'>
            <div className='flex w-full flex-col gap-2 lg:flex-row'>
              <div className='flex w-full items-center gap-2 lg:w-[50%]'>
                <div className='w-[20%]'>
                  <SelectInput
                    label={'UF'}
                    value={infoHolder.localizacao?.uf}
                    options={Object.keys(stateCities).map((op, index) => ({ id: index + 1, label: op, value: op }))}
                    resetOptionLabel={'NÃO DEFINIDO'}
                    handleChange={(value) => {
                      setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: value } }));
                      setChanges((prev) => ({ ...prev, 'localizacao.uf': value }));
                    }}
                    onReset={() => {
                      setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: null } }));
                      setChanges((prev) => ({ ...prev, 'localizacao.uf': null }));
                    }}
                    width={'100%'}
                  />
                </div>
                <div className='w-[80%]'>
                  <SelectInput
                    label={'CIDADE'}
                    value={infoHolder.localizacao?.cidade}
                    options={
                      infoHolder.localizacao?.uf
                        ? stateCities[infoHolder.localizacao.uf as keyof typeof stateCities]?.map((op, index) => ({
                            id: index + 1,
                            label: op,
                            value: op,
                          }))
                        : null
                    }
                    resetOptionLabel={'NÃO DEFINIDO'}
                    handleChange={(value) => {
                      setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }));
                      setChanges((prev) => ({ ...prev, 'localizacao.cidade': value }));
                    }}
                    onReset={() => {
                      setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: null } }));
                      setChanges((prev) => ({ ...prev, 'localizacao.cidade': null }));
                    }}
                    width={'100%'}
                  />
                </div>
              </div>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label={'BAIRRO'}
                  placeholder={'Preencha o bairro do cliente favorecido...'}
                  value={infoHolder.localizacao.bairro}
                  handleChange={(value) => {
                    setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }));
                    setChanges((prev) => ({ ...prev, 'localizacao.bairro': value }));
                  }}
                  width={'100%'}
                />
              </div>
            </div>
            <div className='flex w-full flex-col gap-2 lg:flex-row'>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label={'ENDEREÇO'}
                  placeholder={'Preencha o endereço do cliente favorecido...'}
                  value={infoHolder.localizacao.endereco}
                  handleChange={(value) => {
                    setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }));
                    setChanges((prev) => ({ ...prev, 'localizacao.endereco': value }));
                  }}
                  width={'100%'}
                />
              </div>
              <div className='w-full lg:w-[50%]'>
                <TextInput
                  label={'NÚMERO OU IDENTIFICADOR'}
                  placeholder={'Preencha o número ou identificador da residência do cliente favorecido...'}
                  value={infoHolder.localizacao.numeroOuIdentificador}
                  handleChange={(value) => {
                    setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, numeroOuIdentificador: value } }));
                    setChanges((prev) => ({ ...prev, 'localizacao.numeroOuIdentificador': value }));
                  }}
                  width={'100%'}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key={'readOnly'} variants={variants} initial='hidden' animate='visible' exit='exit' className='mt-2 flex w-full flex-col gap-1'>
            <div className='mt-2 flex w-full flex-col items-center justify-center gap-2 md:flex-row lg:gap-4'>
              <div className='flex items-center gap-2'>
                <FaCity size={'20px'} color='rgb(31,41,55)' />
                <p className='font-raleway text-sm font-medium'>
                  {infoHolder.localizacao ? `${infoHolder.localizacao.cidade} - ${infoHolder.localizacao.uf || 'N/A'} ` : 'N/A'}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <MdLocationPin size={'20px'} color='rgb(31,41,55)' />
                <p className='font-raleway text-sm font-medium'>
                  {infoHolder.localizacao
                    ? `${infoHolder.localizacao.endereco}, Nº ${infoHolder.localizacao.numeroOuIdentificador}, ${infoHolder.localizacao.bairro} - CEP: ${infoHolder.localizacao.cep || 'N/A'}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LocationBlock;
