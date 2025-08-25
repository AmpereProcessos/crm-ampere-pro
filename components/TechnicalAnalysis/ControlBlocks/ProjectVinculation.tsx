import CheckboxInput from '@/components/Inputs/CheckboxInput';
import TextInput from '@/components/Inputs/TextInput';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import OperationProjectsBlock from './OperationProjectsBlock';
type ProjectVinculationProps = {
  requestInfo: TTechnicalAnalysis;
  setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  goToNextStage: () => void;
  resetSolicitationType: () => void;
};
type TAmpliationHolder = {
  id: string | null;
  nome: string;
  equipamentos: {
    modulos: {
      modelo: string | null;
      potencia: string | null;
      qtde: string | null;
    };
    inversor: {
      modelo: string | null;
      potencia: string | null;
      qtde: string | null;
    };
  };
};
function ProjectVinculation({ requestInfo, setRequestInfo, resetSolicitationType, goToNextStage }: ProjectVinculationProps) {
  const [isExistingProject, setIsExistingProject] = useState<boolean>(false);
  const [ampliationHolder, setAmpliationHolder] = useState<TAmpliationHolder>({
    id: null,
    nome: '',
    equipamentos: {
      modulos: {
        modelo: null,
        potencia: null,
        qtde: null,
      },
      inversor: {
        modelo: null,
        potencia: null,
        qtde: null,
      },
    },
  });
  function handleVinculation(project: any) {
    setAmpliationHolder((prev) => ({
      ...prev,
      id: project._id,
      nome: project.nomeDoContrato,
      equipamentos: {
        modulos: {
          qtde: `${project.sistema?.qtdeModulos}`,
          modelo: null,
          potencia: `${project.sistema?.potModulos}`,
        },
        inversor: {
          qtde: null,
          modelo: project.sistema?.inversor,
          potencia: null,
        },
      },
    }));
  }
  function handleUnvinculation() {
    setAmpliationHolder({
      id: null,
      nome: '',
      equipamentos: {
        modulos: {
          modelo: null,
          potencia: null,
          qtde: null,
        },
        inversor: {
          modelo: null,
          potencia: null,
          qtde: null,
        },
      },
    });
  }
  function validateFields() {
    if (!ampliationHolder.equipamentos.modulos.qtde || ampliationHolder.equipamentos.modulos.qtde.trim().length == 0) {
      return toast.error('Preencha uma quantidade válida de módulos.');
    }
    if (!ampliationHolder.equipamentos.modulos.potencia || ampliationHolder.equipamentos.modulos.potencia.trim().length == 0) {
      return toast.error('Preencha uma potência válida para os módulos.');
    }
    if (!ampliationHolder.equipamentos.inversor.qtde || ampliationHolder.equipamentos.inversor.qtde.trim().length == 0) {
      return toast.error('Preencha uma quantidade válida de inversores.');
    }
    if (!ampliationHolder.equipamentos.inversor.potencia || ampliationHolder.equipamentos.inversor.potencia.trim().length == 0) {
      return toast.error('Preencha uma potência válida para os inversores.');
    }
    setRequestInfo((prev) => ({ ...prev, aumento: ampliationHolder }));
    return goToNextStage();
  }
  return (
    <div className='flex w-full grow flex-col bg-background px-2'>
      <span className='text-center text-lg font-bold uppercase text-[#15599a]'>INFORMAÇÕES DO PROJETO ATUAL</span>
      <div className='flex w-full grow flex-col gap-2'>
        <div className='flex w-full items-center justify-center'>
          <CheckboxInput
            labelFalse='POSSUI UM PROJETO CONOSCO'
            labelTrue='POSSUI UM PROJETO CONOSCO'
            checked={isExistingProject}
            handleChange={(value) => setIsExistingProject(value)}
            justify='justify-center'
            width='100%'
          />
        </div>
        {isExistingProject ? <OperationProjectsBlock handleVinculation={handleVinculation} handleUnvinculation={handleUnvinculation} /> : null}
        <h1 className='rounded bg-black py-1 text-center text-lg font-bold uppercase text-white'>CONFIRMAÇÃO DAS INFORMAÇÕES</h1>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-[50%]'>
            <TextInput
              label='ID DO PROJETO (SE EXISTENTE)'
              value={ampliationHolder.id || ''}
              editable={false}
              placeholder='Preencha o ID do projeto, se existente na base de projetos...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  id: value,
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[50%]'>
            <TextInput
              label='NOME DO PROJETO (SE EXISTENTE)'
              value={ampliationHolder.nome || ''}
              placeholder='Preencha o nome do projeto, se existente na base de projetos...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  nome: value,
                }))
              }
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='QTDE DE MÓDULOS ATUAIS'
              value={ampliationHolder.equipamentos?.modulos.qtde || ''}
              placeholder='Preencha a quantidade de módulos do sistema hoje instalado...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  equipamentos: {
                    ...prev.equipamentos,
                    modulos: { ...prev.equipamentos.modulos, qtde: value },
                  },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='MODELO DOS MÓDULOS ATUAIS'
              value={ampliationHolder.equipamentos?.modulos.modelo || ''}
              placeholder='Preencha o modelo dos módulos do sistema hoje instalado...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  equipamentos: {
                    ...prev.equipamentos,
                    modulos: { ...prev.equipamentos.modulos, modelo: value },
                  },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='POTÊNCIA DOS MÓDULOS ATUAIS'
              value={ampliationHolder.equipamentos?.modulos.potencia || ''}
              placeholder='Preencha a potência dos módulos do sistema hoje instalado...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  equipamentos: {
                    ...prev.equipamentos,
                    modulos: { ...prev.equipamentos.modulos, potencia: value },
                  },
                }))
              }
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='QTDE DE INVERSORES ATUAIS'
              value={ampliationHolder.equipamentos?.inversor.qtde || ''}
              placeholder='Preencha a quantidade de inversores do sistema hoje instalado...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  equipamentos: {
                    ...prev.equipamentos,
                    inversor: { ...prev.equipamentos.inversor, qtde: value },
                  },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='MODELO DOS INVERSORES ATUAIS'
              value={ampliationHolder.equipamentos?.inversor.modelo || ''}
              placeholder='Preencha o modelo dos inversores do sistema hoje instalado...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  equipamentos: {
                    ...prev.equipamentos,
                    inversor: { ...prev.equipamentos.inversor, modelo: value },
                  },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='POTÊNCIA DOS INVERSORES ATUAIS'
              value={ampliationHolder.equipamentos?.inversor.potencia || ''}
              placeholder='Preencha a potência de módulos do sistema hoje instalado...'
              handleChange={(value) =>
                setAmpliationHolder((prev) => ({
                  ...prev,
                  equipamentos: {
                    ...prev.equipamentos,
                    inversor: { ...prev.equipamentos.inversor, potencia: value },
                  },
                }))
              }
              width='100%'
            />
          </div>
        </div>
      </div>
      <div className='mt-2 flex w-full justify-between'>
        <button onClick={() => resetSolicitationType()} className='rounded p-2 font-bold text-primary/50 duration-300 ease-in-out hover:scale-105'>
          Voltar
        </button>
        <button
          onClick={() => {
            validateFields();
          }}
          className='rounded p-2 font-bold hover:bg-black hover:text-white'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default ProjectVinculation;
