import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { renderCategoryIcon } from '@/lib/methods/rendering';
import { stateCities } from '@/utils/estados_cidades';
import { formatToCEP, getCEPInfo } from '@/utils/methods';
import { TFileHolder } from '@/utils/schemas/file-reference.schema';
import { TInverter, TKitDTO, TModule } from '@/utils/schemas/kits.schema';
import { TEquipment, TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { MdDelete } from 'react-icons/md';

import NumberInput from '@/components/Inputs/NumberInput';
import type { TUserSession } from '@/lib/auth/session';
import { useEquipments } from '@/utils/queries/utils';
import { TOpportunity } from '@/utils/schemas/opportunity.schema';
import { ProductItemCategories } from '@/utils/select-options';
import KitsSelectionMenu from '../KitsSelectionMenu';
import UseActiveProposalProducts from '../UseActiveProposalProducts';

type InlocoProps = {
  session: TUserSession;
  infoHolder: TTechnicalAnalysis;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  resetSolicitationType: () => void;
  files: TFileHolder;
  setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
  activeProposalId: TOpportunity['idPropostaAtiva'];
  handleRequestAnalysis: ({ info, files }: { info: TTechnicalAnalysis; files: TFileHolder }) => void;
};
function Inloco({
  session,
  infoHolder,
  setInfoHolder,
  files,
  setFiles,
  activeProposalId,
  resetSolicitationType,
  handleRequestAnalysis,
}: InlocoProps) {
  const queryClient = useQueryClient();
  const { data: equipments, isLoading, isError, isSuccess } = useEquipments({ category: null });

  const [showKits, setShowKits] = useState<boolean>(false);
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [inverterHolder, setInverterHolder] = useState<TInverter>({
    id: '',
    fabricante: '',
    modelo: '',
    qtde: 1,
    garantia: 10,
    potencia: 0,
  });
  const [moduleHolder, setModuleHolder] = useState<TModule>({
    id: '',
    fabricante: '',
    modelo: '',
    qtde: 1,
    potencia: 0,
    garantia: 10,
  });
  const [personalizedProductHolder, setPersonalizedProductHolder] = useState<TEquipment>({
    id: null,
    categoria: 'OUTROS',
    fabricante: '',
    modelo: '',
    qtde: 1,
    potencia: 0,
  });
  async function setAddressDataByCEP(cep: string) {
    const addressInfo = await getCEPInfo(cep);
    const toastID = toast.loading('Buscando informações sobre o CEP...', {
      duration: 2000,
    });
    setTimeout(() => {
      if (addressInfo) {
        toast.dismiss(toastID);
        toast.success('Dados do CEP buscados com sucesso.', {
          duration: 1000,
        });
        setInfoHolder((prev) => ({
          ...prev,
          localizacao: {
            ...prev.localizacao,
            endereco: addressInfo.logradouro,
            bairro: addressInfo.bairro,
            uf: addressInfo.uf as keyof typeof stateCities,
            cidade: addressInfo.localidade.toUpperCase(),
          },
        }));
      }
    }, 1000);
  }

  function addInverterToEquipments(info: TInverter) {
    if (!info.id && !info.fabricante && !info.modelo) {
      return toast.error('Inversor inválido. Por favor, tente novamente.');
    }
    if (info.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de inversores válida.');
    }
    var productsArr = [...infoHolder.equipamentos];
    const productInfo: TEquipment = {
      id: info.id,
      categoria: 'INVERSOR',
      fabricante: info.fabricante,
      modelo: info.modelo,
      qtde: info.qtde,
      potencia: info.potencia,
    };
    productsArr.push(productInfo);
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setInfoHolder((prev) => ({ ...prev, equipamentos: orderProducts }));
    setInverterHolder({
      id: '',
      fabricante: '',
      modelo: '',
      qtde: 1,
      garantia: 10,
      potencia: 0,
    });
  }
  function addModuleToEquipments(info: TModule) {
    if (!info.id && !info.fabricante && !info.modelo) {
      return toast.error('Módulo inválido. Por favor, tente novamente.');
    }
    if (info.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de módulos válida.');
    }
    var productsArr = [...infoHolder.equipamentos];
    const productInfo: TEquipment = {
      id: info.id,
      categoria: 'MÓDULO',
      fabricante: info.fabricante,
      modelo: info.modelo,
      qtde: info.qtde,
      potencia: info.potencia,
    };
    productsArr.push(productInfo);
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setInfoHolder((prev) => ({ ...prev, equipamentos: orderProducts }));
    setModuleHolder({
      id: '',
      fabricante: '',
      modelo: '',
      qtde: 1,
      potencia: 0,
      garantia: 10,
    });
  }
  function addPersonalizedEquipment(info: TEquipment) {
    if (info.fabricante.trim().length < 3) return toast.error('Fabricante do produto não específicado.');
    if (info.modelo.trim().length < 3) return toast.error('Modelo do produto não específicado.');
    if (info.qtde <= 0) return toast.error('Quantidade do produto inválida.');

    var productsArr = [...infoHolder.equipamentos];
    const productInfo: TEquipment = {
      id: info.id,
      categoria: info.categoria,
      fabricante: info.fabricante,
      modelo: info.modelo,
      qtde: info.qtde,
      potencia: info.potencia,
    };
    productsArr.push(productInfo);
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setInfoHolder((prev) => ({ ...prev, equipamentos: orderProducts }));
    setPersonalizedProductHolder({
      id: null,
      categoria: 'OUTROS',
      fabricante: '',
      modelo: '',
      qtde: 1,
      potencia: 0,
    });
    return;
  }
  function removeEquipment(index: number) {
    const currenTEquipmentList = [...infoHolder.equipamentos];
    currenTEquipmentList.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, equipamentos: currenTEquipmentList }));
  }
  function addEquipmentFromKit(kit: TKitDTO) {
    const equipments: TEquipment[] = kit.produtos.map((p) => ({
      categoria: p.categoria,
      fabricante: p.fabricante,
      modelo: p.modelo,
      qtde: p.qtde,
      id: p.id,
      potencia: p.potencia,
    }));
    setInfoHolder((prev) => ({ ...prev, equipamentos: equipments, detalhes: { ...prev.detalhes, topologia: kit.topologia } }));
  }
  return (
    <div className='flex w-full grow flex-col gap-2 overflow-y-auto overscroll-y-auto bg-background px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
      <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-white'>INFORMAÇÕES GERAIS</h1>
      <div className='flex w-full flex-col gap-2'>
        <div className='flex w-full flex-col items-center justify-center gap-2 lg:flex-row'>
          <TextInput
            label={'NOME DO CLIENTE'}
            placeholder='Digite aqui o nome do cliente...'
            width={'100%'}
            value={infoHolder.nome}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
          />
        </div>
        <p className='my-2 w-full text-center text-sm leading-none tracking-tight text-primary/50'>
          Preencha abaixo a localização de <strong className='text-cyan-500'>instalação</strong> do sistema fotovoltaico.
        </p>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label={'CEP'}
              placeholder='Digite aqui o CEP do cliente...'
              width={'100%'}
              value={infoHolder.localizacao.cep || ''}
              handleChange={(value) => {
                if (value.length == 9) {
                  setAddressDataByCEP(value);
                }
                setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cep: formatToCEP(value) } }));
              }}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              width={'100%'}
              label={'UF'}
              editable={true}
              options={Object.keys(stateCities).map((state, index) => ({
                id: index + 1,
                label: state,
                value: state,
              }))}
              value={infoHolder.localizacao.uf}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: value } }))}
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => {
                setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: null } }));
              }}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              width={'100%'}
              label={'CIDADE'}
              editable={true}
              value={infoHolder.localizacao.cidade}
              options={
                infoHolder.localizacao.uf
                  ? stateCities[infoHolder.localizacao.uf as keyof typeof stateCities].map((city, index) => {
                      return {
                        id: index,
                        value: city,
                        label: city,
                      };
                    })
                  : null
              }
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }))}
              onReset={() => {
                setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: null } }));
              }}
              resetOptionLabel='NÃO DEFINIDO'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label={'BAIRRO'}
              placeholder='Digite aqui o bairro do cliente..'
              width={'100%'}
              value={infoHolder.localizacao.bairro}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }))}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label={'LOGRADOURO'}
              placeholder='Digite o logradouro do cliente...'
              width={'100%'}
              value={infoHolder.localizacao.endereco}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }))}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label={'NÚMERO OU IDENTIFICADOR'}
              placeholder='Digite aqui o número/identificador da residência...'
              width={'100%'}
              value={infoHolder.localizacao.numeroOuIdentificador}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, localizacao: { ...prev.localizacao, numeroOuIdentificador: value } }));
              }}
            />
          </div>
        </div>
      </div>
      <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-white'>INFORMAÇÕES DOS EQUIPAMENTOS</h1>
      <p className='my-2 w-full text-center text-sm leading-none tracking-tight text-primary/50'>
        Preencha abaixo os <strong className='text-cyan-500'>equipamentos</strong> a serem análisados, ou, escolha um dos kits ativos.
      </p>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-2/4'>
            <SelectInput
              label='INVERSOR'
              value={equipments?.find((e) => e.categoria == 'INVERSOR' && e._id == inverterHolder.id) || null}
              handleChange={(value) =>
                setInverterHolder((prev) => ({
                  ...prev,
                  id: value._id,
                  fabricante: value.fabricante,
                  modelo: value.modelo,
                  potencia: value.potencia || 0,
                }))
              }
              onReset={() =>
                setInverterHolder({
                  id: '',
                  fabricante: '',
                  modelo: '',
                  qtde: 1,
                  garantia: 10,
                  potencia: 0,
                })
              }
              resetOptionLabel='NÃO DEFINIDO'
              options={
                equipments
                  ?.filter((e) => e.categoria == 'INVERSOR')
                  .map((inverter) => {
                    return {
                      id: inverter._id,
                      label: `${inverter.fabricante} - ${inverter.modelo}`,
                      value: inverter,
                    };
                  }) || []
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <NumberInput
              label='QTDE'
              value={inverterHolder.qtde}
              handleChange={(value) =>
                setInverterHolder((prev) => ({
                  ...prev,
                  qtde: Number(value),
                }))
              }
              placeholder='QTDE'
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <NumberInput
              label='GARANTIA'
              value={inverterHolder.garantia || null}
              handleChange={(value) =>
                setInverterHolder((prev) => ({
                  ...prev,
                  garantia: Number(value),
                }))
              }
              placeholder='GARANTIA'
              width='100%'
            />
          </div>
        </div>
        <div className='flex items-center justify-end'>
          <button
            className='rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
            onClick={() => addInverterToEquipments(inverterHolder)}
          >
            ADICIONAR INVERSOR
          </button>
        </div>
      </div>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-2/4'>
            <SelectInput
              label='MÓDULO'
              value={equipments?.find((e) => e.categoria == 'MÓDULO' && e._id == moduleHolder.id) || null}
              handleChange={(value) =>
                setModuleHolder((prev) => ({
                  ...prev,
                  id: value._id,
                  fabricante: value.fabricante,
                  modelo: value.modelo,
                  potencia: value.potencia || 0,
                }))
              }
              onReset={() =>
                setModuleHolder({
                  id: '',
                  fabricante: '',
                  modelo: '',
                  qtde: 1,
                  potencia: 0,
                  garantia: 10,
                })
              }
              resetOptionLabel='NÃO DEFINIDO'
              options={
                equipments
                  ?.filter((e) => e.categoria == 'MÓDULO')
                  .map((module) => {
                    return {
                      id: module._id,
                      label: `${module.fabricante} - ${module.modelo}`,
                      value: module,
                    };
                  }) || []
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <NumberInput
              label='QTDE'
              value={moduleHolder.qtde}
              handleChange={(value) =>
                setModuleHolder((prev) => ({
                  ...prev,
                  qtde: Number(value),
                }))
              }
              placeholder='QTDE'
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <NumberInput
              label='GARANTIA'
              value={moduleHolder.garantia || null}
              handleChange={(value) =>
                setModuleHolder((prev) => ({
                  ...prev,
                  garantia: Number(value),
                }))
              }
              placeholder='GARANTIA'
              width='100%'
            />
          </div>
        </div>
        <div className='flex items-center justify-end'>
          <button
            className='rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
            onClick={() => addModuleToEquipments(moduleHolder)}
          >
            ADICIONAR MÓDULO
          </button>
        </div>
      </div>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-[30%]'>
            <SelectInput
              label='CATEGORIA'
              resetOptionLabel='NÃO DEFINIDO'
              options={ProductItemCategories}
              value={personalizedProductHolder.categoria}
              handleChange={(value) =>
                setPersonalizedProductHolder((prev) => ({
                  ...prev,
                  categoria: value,
                }))
              }
              onReset={() => {
                setPersonalizedProductHolder((prev) => ({
                  ...prev,
                  categoria: 'OUTROS',
                }));
              }}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[40%]'>
            <TextInput
              label='FABRICANTE'
              placeholder='FABRICANTE'
              value={personalizedProductHolder.fabricante}
              handleChange={(value) =>
                setPersonalizedProductHolder((prev) => ({
                  ...prev,
                  fabricante: value,
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[40%]'>
            <TextInput
              label='MODELO'
              placeholder='MODELO'
              value={personalizedProductHolder.modelo}
              handleChange={(value) =>
                setPersonalizedProductHolder((prev) => ({
                  ...prev,
                  modelo: value,
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[15%]'>
            <NumberInput
              label='POTÊNCIA'
              value={personalizedProductHolder.potencia || null}
              handleChange={(value) =>
                setPersonalizedProductHolder((prev) => ({
                  ...prev,
                  potencia: Number(value),
                }))
              }
              placeholder='POTÊNCIA'
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[15%]'>
            <NumberInput
              label='QTDE'
              value={personalizedProductHolder.qtde}
              handleChange={(value) =>
                setPersonalizedProductHolder((prev) => ({
                  ...prev,
                  qtde: Number(value),
                }))
              }
              placeholder='QTDE'
              width='100%'
            />
          </div>
        </div>

        <div className='flex items-center justify-end'>
          <button
            className='rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
            onClick={() => addPersonalizedEquipment(personalizedProductHolder)}
          >
            ADICIONAR PRODUTO PERSONALIZADO
          </button>
        </div>
      </div>
      {activeProposalId ? (
        <UseActiveProposalProducts
          activeProposalId={activeProposalId}
          getProducts={(products) => setInfoHolder((prev) => ({ ...prev, equipamentos: products }))}
        />
      ) : null}
      <p className='w-full text-center text-sm leading-none tracking-tight text-primary/50'>
        Deseja utilizar os equipamentos de um kit específico ? Abra o menu e <strong className='text-cyan-500'>Escolha uma das opções de kit.</strong>
      </p>
      <div className='my-2 flex w-full items-center justify-center'>
        {showKits ? (
          <button onClick={() => setShowKits(false)} className='rounded-md bg-red-500 px-2 py-1 text-sm font-bold text-white'>
            FECHAR MENU DE KITS
          </button>
        ) : (
          <button onClick={() => setShowKits(true)} className='rounded-md bg-cyan-500 px-2 py-1 text-sm font-bold text-white'>
            MOSTRAR MENU KITS
          </button>
        )}
      </div>

      {showKits ? (
        <KitsSelectionMenu
          session={session}
          selectedKitId={selectedKitId}
          handleSelect={(kit) => {
            addEquipmentFromKit(kit);
            setSelectedKitId(kit._id);
          }}
          closeMenu={() => setShowKits(false)}
        />
      ) : null}
      <h1 className='mt-2 w-full text-start font-sans  font-bold text-cyan-500'>EQUIPAMENTOS ESCOLHIDOS</h1>
      <div className='flex w-full flex-col flex-wrap justify-around gap-2 lg:flex-row'>
        {infoHolder.equipamentos.length > 0 ? (
          infoHolder.equipamentos.map((equipment, index) => (
            <div key={index} className='mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2 lg:w-[350px]'>
              <div className='flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center'>
                <div className='flex items-center gap-1'>
                  <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
                    {renderCategoryIcon(equipment.categoria, 18)}
                  </div>
                  <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>
                    <strong className='text-[#FF9B50]'>{equipment.qtde}</strong> x {equipment.modelo}
                  </p>
                </div>
                <button
                  onClick={() => removeEquipment(index)}
                  type='button'
                  className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                >
                  <MdDelete color='red' size={15} />
                </button>
              </div>
              <div className='flex w-full items-center justify-end gap-2 pl-2'>
                <div className='flex items-center gap-1'>
                  <FaIndustry size={15} />
                  <p className='text-[0.6rem] font-light text-primary/50'>{equipment.fabricante}</p>
                </div>
                <div className='flex items-center gap-1'>
                  <ImPower size={15} />
                  <p className='text-[0.6rem] font-light text-primary/50'>{equipment.potencia} W</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className='w-full text-center text-sm font-medium tracking-tight text-primary/50'>Nenhum equipamento adicionado à lista.</p>
        )}
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button onClick={() => resetSolicitationType()} className='rounded p-2 font-bold text-primary/50 duration-300 hover:scale-105'>
          Voltar
        </button>
        <button
          className='rounded p-2 font-bold hover:bg-black hover:text-white'
          onClick={() => handleRequestAnalysis({ info: infoHolder, files: files })}
        >
          SOLICITAR ANÁLISE
        </button>
      </div>
    </div>
  );
}

export default Inloco;
