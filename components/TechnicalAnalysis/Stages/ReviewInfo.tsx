import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { stateCities } from '@/utils/estados_cidades';
import RoofTiles from '@/utils/images/roofTiles.png';
import { formatToCEP, getCEPInfo } from '@/utils/methods';
import { TFileHolder } from '@/utils/schemas/file-reference.schema';
import { TEquipment, TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import CheckboxInput from '@/components/Inputs/CheckboxInput';
import type { TUserSession } from '@/lib/auth/session';
import { renderCategoryIcon } from '@/lib/methods/rendering';
import { useEquipments } from '@/utils/queries/utils';
import { TInverter, TKitDTO, TModule } from '@/utils/schemas/kits.schema';
import {
  AmperageOptions,
  EnergyMeterBoxModels,
  EnergyPAConnectionTypes,
  EnergyPATypes,
  ProductItemCategories,
  StructureTypes,
} from '@/utils/select-options';
import Image from 'next/image';
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai';
import { FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { IoMdBarcode } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import { TbBoxModel2, TbCategory2 } from 'react-icons/tb';
import KitsSelectionMenu from '../KitsSelectionMenu';

type ReviewInfoProps = {
  session: TUserSession;
  infoHolder: TTechnicalAnalysis;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
  files: TFileHolder;
  setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
  handleRequestAnalysis: ({ info, files }: { info: TTechnicalAnalysis; files: TFileHolder }) => void;
};
function ReviewInfo({
  session,
  infoHolder,
  setInfoHolder,
  files,
  setFiles,
  goToNextStage,
  goToPreviousStage,
  handleRequestAnalysis,
}: ReviewInfoProps) {
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

  function addInverterToEquipments() {
    if (!inverterHolder.id && !inverterHolder.fabricante && !inverterHolder.modelo) {
      return toast.error('Inversor inválido. Por favor, tente novamente.');
    }
    if (inverterHolder.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de inversores válida.');
    }
    var productsArr = [...infoHolder.equipamentos];
    const productInfo: TEquipment = {
      id: inverterHolder.id,
      categoria: 'INVERSOR',
      fabricante: inverterHolder.fabricante,
      modelo: inverterHolder.modelo,
      qtde: inverterHolder.qtde,
      potencia: inverterHolder.potencia,
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
  function addModuleToEquipments() {
    if (!moduleHolder.id && !moduleHolder.fabricante && !moduleHolder.modelo) {
      return toast.error('Módulo inválido. Por favor, tente novamente.');
    }
    if (moduleHolder.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de módulos válida.');
    }
    var productsArr = [...infoHolder.equipamentos];
    const productInfo: TEquipment = {
      id: moduleHolder.id,
      categoria: 'MÓDULO',
      fabricante: moduleHolder.fabricante,
      modelo: moduleHolder.modelo,
      qtde: moduleHolder.qtde,
      potencia: moduleHolder.potencia,
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
  function addPersonalizedEquipment() {
    if (personalizedProductHolder.fabricante.trim().length < 3) return toast.error('Fabricante do produto não específicado.');
    if (personalizedProductHolder.modelo.trim().length < 3) return toast.error('Modelo do produto não específicado.');
    if (personalizedProductHolder.qtde <= 0) return toast.error('Quantidade do produto inválida.');

    var productsArr = [...infoHolder.equipamentos];
    const productInfo: TEquipment = {
      id: personalizedProductHolder.id,
      categoria: personalizedProductHolder.categoria,
      fabricante: personalizedProductHolder.fabricante,
      modelo: personalizedProductHolder.modelo,
      qtde: personalizedProductHolder.qtde,
      potencia: personalizedProductHolder.potencia,
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
  // PA
  const [paInfoHolder, setPaInfoHolder] = useState<TTechnicalAnalysis['padrao'][number]>({
    alteracao: false,
    tipo: 'CONTRA À REDE',
    tipoEntrada: 'AÉREO',
    tipoSaida: 'AÉREO',
    amperagem: '',
    ligacao: '',
    novaAmperagem: null,
    novaLigacao: null,
    codigoMedidor: '',
    modeloCaixaMedidor: null,
    codigoPosteDerivacao: null,
  });
  function addEnergyPA() {
    if (!paInfoHolder.ligacao) return toast.error('Por favor, preencha o tipo de ligação do padrão.');
    if (!paInfoHolder.amperagem) return toast.error('Por favor, preencha a amperagem do padrão.');
    if (paInfoHolder.codigoMedidor.trim().length < 5) return toast.error('Por favor, preencha um código de medidor válido.');
    const energyPAList = infoHolder.padrao ? [...infoHolder.padrao] : [];
    energyPAList.push(paInfoHolder);
    setInfoHolder((prev) => ({ ...prev, padrao: energyPAList }));
    setPaInfoHolder({
      alteracao: false,
      tipo: 'CONTRA À REDE',
      tipoEntrada: 'AÉREO',
      tipoSaida: 'AÉREO',
      amperagem: '',
      ligacao: '',
      novaAmperagem: null,
      novaLigacao: null,
      codigoMedidor: '',
      modeloCaixaMedidor: null,
      codigoPosteDerivacao: null,
    });
    return toast.success('Padrão adicionado com sucesso.');
  }
  function removeEnergyPA(index: number) {
    const energyPAList = infoHolder.padrao ? [...infoHolder.padrao] : [];
    energyPAList.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, padrao: energyPAList }));
    return toast.success('Padrão removido com sucesso.');
  }
  return (
    <div className='flex w-full grow flex-col bg-background px-2'>
      <h1 className='w-full rounded-md  bg-green-700 px-1 py-2 text-center text-lg font-bold text-primary-foreground'>REVISÃO DAS INFORMAÇÕES</h1>
      <p className='my-2 w-full text-center text-sm leading-none tracking-tight text-primary/70'>
        Nessa etapa estão condensadas todas as informações preenchidas ao longo das etapas anteriores para que você possa{' '}
        <strong className='text-cyan-500'>revisá-las</strong> e então <strong className='text-cyan-500'>requisitar</strong> sua análise técnica.
      </p>
      <div className='flex w-full grow flex-col gap-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {/*GENERAL INFORMATION */}
        <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-primary-foreground'>INFORMAÇÕES GERAIS</h1>
        <div className='flex w-full flex-col items-center justify-center gap-2 lg:flex-row'>
          <TextInput
            label={'NOME DO CLIENTE'}
            placeholder='Digite aqui o nome do cliente...'
            width={'100%'}
            value={infoHolder.nome}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
          />
        </div>
        <p className='my-2 w-full text-center text-sm leading-none tracking-tight text-primary/70'>
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
        {/*SYSTEM INFORMATION */}
        <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-primary-foreground'>INFORMAÇÕES DOS EQUIPAMENTOS</h1>
        <p className='my-2 w-full text-center text-sm leading-none tracking-tight text-primary/70'>
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
              className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addInverterToEquipments()}
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
              className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addModuleToEquipments()}
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
              className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addPersonalizedEquipment()}
            >
              ADICIONAR PRODUTO PERSONALIZADO
            </button>
          </div>
        </div>
        <p className='w-full text-center text-sm leading-none tracking-tight text-primary/70'>
          Deseja utilizar os equipamentos de um kit específico ? Abra o menu e{' '}
          <strong className='text-cyan-500'>Escolha uma das opções de kit.</strong>
        </p>
        <div className='my-2 flex w-full items-center justify-center'>
          {showKits ? (
            <button onClick={() => setShowKits(false)} className='rounded-md bg-red-500 px-2 py-1 text-sm font-bold text-primary-foreground'>
              FECHAR MENU DE KITS
            </button>
          ) : (
            <button onClick={() => setShowKits(true)} className='rounded-md bg-cyan-500 px-2 py-1 text-sm font-bold text-primary-foreground'>
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
                    <p className='text-[0.6rem] font-light text-primary/70'>{equipment.fabricante}</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <ImPower size={15} />
                    <p className='text-[0.6rem] font-light text-primary/70'>{equipment.potencia} W</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className='w-full text-center text-sm font-medium tracking-tight text-primary/70'>Nenhum equipamento adicionado à lista.</p>
          )}
        </div>
        {/*PA INFORMATION */}
        <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-primary-foreground'>INFORMAÇÕES DO PADRÃO DE ENERGIA</h1>
        <p className='my-2 w-full self-center text-center text-sm leading-none tracking-tight text-primary/70 lg:w-[60%]'>
          Preencha abaixo as informações do padrão de energia instalação e clique em{' '}
          <strong className='font-bold text-green-500'>adicionar (+)</strong>. Se necessário, você pode adicionar mais de um padrão de energia à
          lista.
        </p>
        <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='LIGAÇÃO'
              options={[
                { id: 1, label: 'MONOFÁSICO', value: 'MONOFÁSICO' },
                { id: 2, label: 'BIFÁSICO', value: 'BIFÁSICO' },
                { id: 3, label: 'TRIFÁSICO', value: 'TRIFÁSICO' },
              ]}
              value={paInfoHolder.ligacao}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, ligacao: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, ligacao: '' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='AMPERAGEM'
              options={AmperageOptions}
              value={paInfoHolder.amperagem}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, amperagem: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, amperagem: '' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='TIPO'
              options={EnergyPATypes}
              value={paInfoHolder.tipo}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipo: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipo: 'CONTRA À REDE' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>

          <div className='w-full lg:w-1/4'>
            <TextInput
              label={'CÓD.DO POSTE DE DERIVAÇÃO'}
              placeholder={'Preencha o código do poste de derivação...'}
              value={paInfoHolder.codigoPosteDerivacao || ''}
              handleChange={(value) => {
                setPaInfoHolder((prev) => ({ ...prev, codigoPosteDerivacao: value }));
              }}
              width={'100%'}
            />
          </div>
        </div>
        <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='TIPO DO RAMAL DE ENTRADA'
              options={EnergyPAConnectionTypes}
              value={paInfoHolder.tipoEntrada}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: 'AÉREO' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='TIPO DO RAMAL DE SAÍDA'
              options={EnergyPAConnectionTypes}
              value={paInfoHolder.tipoSaida}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: 'AÉREO' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <TextInput
              label={'CÓDIGO DO MEDIDOR'}
              placeholder={'Preencha o código do medidor de energia...'}
              value={paInfoHolder.codigoMedidor || ''}
              handleChange={(value) => {
                setPaInfoHolder((prev) => ({ ...prev, codigoMedidor: value }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='MODELO DA CAIXA DO MEDIDOR'
              options={EnergyMeterBoxModels}
              value={paInfoHolder.modeloCaixaMedidor}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: null }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
        </div>
        <div className='mt-2 flex w-full items-center justify-end'>
          <button
            onClick={addEnergyPA}
            className='rounded border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-primary-foreground'
          >
            ADICIONAR ITEM
          </button>
        </div>
        <h1 className='mt-2 w-full text-start font-sans  font-bold text-cyan-500'>LISTA DE PADRÕES</h1>
        <div className='mt-2 flex w-full flex-col flex-wrap items-start justify-around gap-2 lg:flex-row'>
          {infoHolder.padrao.length > 0 ? (
            infoHolder.padrao.map((paInfo, index) => (
              <div key={index} className='flex w-[450px] flex-col rounded-md border border-primary/50 p-2 shadow-md'>
                <div className='flex w-full items-center justify-between gap-1'>
                  <div className='flex items-center gap-1'>
                    <h1 className='font-black leading-none tracking-tight'>PADRÃO {paInfo.ligacao}</h1>
                    <h1 className='rounded-full bg-primary/80 px-2 py-1 text-[0.65rem] font-medium text-primary-foreground lg:text-xs'>
                      {paInfo.amperagem}
                    </h1>
                  </div>
                  <button
                    onClick={() => removeEnergyPA(index)}
                    className='w-fit cursor-pointer text-[20px] text-red-500 opacity-40 duration-300 ease-in hover:scale-110 hover:text-red-500 hover:opacity-100'
                  >
                    <MdDelete />
                  </button>
                </div>
                <div className='flex items-center gap-1'>
                  <TbCategory2 />
                  <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>{paInfo.tipo}</p>
                </div>
                <div className='mt-4 flex w-full items-center justify-between gap-2'>
                  <div className='flex items-center gap-1'>
                    <AiOutlineArrowDown />
                    <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                      <strong className='text-cyan-500'>ENTRADA:</strong> {paInfo.tipoEntrada}
                    </p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <AiOutlineArrowUp />
                    <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                      <strong className='text-cyan-500'>SAÍDA:</strong> {paInfo.tipoSaida}
                    </p>
                  </div>
                </div>
                <div className='mt-2 flex w-full items-center justify-between gap-2'>
                  <div className='flex items-center gap-1'>
                    <IoMdBarcode />
                    <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                      <strong className='text-cyan-500'>Nº DO MEDIDOR:</strong> {paInfo.codigoMedidor}
                    </p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <TbBoxModel2 />
                    <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                      <strong className='text-cyan-500'>MODELO DA CAIXA:</strong>: {paInfo.modeloCaixaMedidor || 'NÃO DEFINIDO'}
                    </p>
                  </div>
                </div>
                <div className='mt-2 flex w-full flex-wrap items-center justify-around'>
                  {paInfo.codigoPosteDerivacao ? (
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <IoMdBarcode />
                      <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                        <strong className='text-cyan-500'>Nº DO POSTE DE DERIVAÇÃO:</strong> {paInfo.codigoPosteDerivacao}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className='w-full text-center text-sm font-medium tracking-tight text-primary/70'>Nenhum padrão de energia adicionado à lista.</p>
          )}
        </div>
        {/*TRANSFORMER INFORMATION */}
        <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-primary-foreground'>
          INFORMAÇÕES DO TRANSFORMADOR DE ENERGIA
        </h1>
        <div className='w-full self-center lg:w-1/3'>
          <CheckboxInput
            labelFalse='TRANSFORMADOR E PADRÃO ACOPLADOS'
            labelTrue='TRANSFORMADOR E PADRÃO ACOPLADOS'
            checked={infoHolder.transformador.acopladoPadrao}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transformador: { ...prev.transformador, acopladoPadrao: value } }))}
          />
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <NumberInput
              width='100%'
              label='POTÊNCIA DO TRANSFORMADOR'
              placeholder='Preencha aqui a potência do transformador...'
              value={infoHolder.transformador.potencia}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transformador: { ...prev.transformador, potencia: value } }))}
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              width='100%'
              label='Nº DO TRANSFORMADOR'
              placeholder='Preencha o número transformador...'
              value={infoHolder.transformador.codigo}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transformador: { ...prev.transformador, codigo: value } }))}
            />
          </div>
        </div>
        {/*STRUCTURE INFORMATION */}
        <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-primary-foreground'>INFORMAÇÕES DA ESTRUTURA DE MONTAGEM</h1>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='TIPO DA ESTRUTURA DE MONTAGEM'
              width='100%'
              value={infoHolder.detalhes?.tipoEstrutura}
              options={StructureTypes}
              resetOptionLabel='NÃO DEFINIDO'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    tipoEstrutura: value,
                  },
                }))
              }
              onReset={() =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    tipoEstrutura: null,
                  },
                }))
              }
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='TIPO DA ESTRUTURA'
              width='100%'
              value={infoHolder.detalhes?.materialEstrutura}
              options={[
                { id: 1, label: 'MADEIRA', value: 'MADEIRA' },
                { id: 2, label: 'FERRO', value: 'FERRO' },
              ]}
              resetOptionLabel='NÃO DEFINIDO'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    materialEstrutura: value,
                  },
                }))
              }
              onReset={() =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    materialEstrutura: null,
                  },
                }))
              }
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='TIPO DA TELHA'
              width='100%'
              value={infoHolder.detalhes?.tipoTelha}
              options={[
                { id: 1, label: 'PORTUGUESA', value: 'PORTUGUESA' },
                { id: 2, label: 'FRANCESA', value: 'FRANCESA' },
                { id: 3, label: 'ROMANA', value: 'ROMANA' },
                { id: 4, label: 'CIMENTO', value: 'CIMENTO' },
                { id: 5, label: 'ETHERNIT', value: 'ETHERNIT' },
                { id: 6, label: 'SANDUÍCHE', value: 'SANDUÍCHE' },
                { id: 7, label: 'AMERICANA', value: 'AMERICANA' },
                { id: 8, label: 'ZINCO', value: 'ZINCO' },
                { id: 9, label: 'CAPE E BICA', value: 'CAPE E BICA' },
                { id: 10, label: 'ESTRUTURA DE SOLO', value: 'ESTRUTURA DE SOLO' },
              ]}
              resetOptionLabel='NÃO DEFINIDO'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    tipoTelha: value,
                  },
                }))
              }
              onReset={() =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    tipoTelha: null,
                  },
                }))
              }
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='CLIENTE POSSUIU TELHAS RESERVAS ?'
              width='100%'
              value={infoHolder.detalhes?.telhasReservas}
              options={[
                { id: 1, label: 'SIM', value: 'SIM' },
                { id: 3, label: 'NÃO', value: 'NÃO' },
              ]}
              resetOptionLabel='NÃO DEFINIDO'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    telhasReservas: value,
                  },
                }))
              }
              onReset={() =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    telhasReservas: null,
                  },
                }))
              }
            />
          </div>
        </div>
        <div className='my-3 flex h-[165px] w-[300px] flex-col items-center justify-center self-center border border-primary/30 p-1 py-2 lg:h-[250px] lg:w-[450px]'>
          <h1 className='text-sm font-bold text-[#fead41]'>TIPOS DE TELHAS</h1>
          <Image src={RoofTiles} alt='Tipos de Telhas' />
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='LINK DE ARQUIVOS AUXILIARES (EX: PASTA FOTOS DE DRONE)'
              width='100%'
              value={infoHolder.arquivosAuxiliares || ''}
              placeholder='Preencha aqui o link para uma pasta na nuvem dos arquivos auxiliares.'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  arquivosAuxiliares: value,
                }))
              }
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='ORIENTAÇÃO DOS MÓDULOS'
              width='100%'
              value={infoHolder.detalhes?.orientacao ? infoHolder.detalhes?.orientacao : ''}
              placeholder='Preencha aqui a orientação dos módulos. (EX: 10° NORTE)'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  detalhes: {
                    ...prev.detalhes,
                    orientacao: value,
                  },
                }))
              }
            />
          </div>
        </div>
        {/*INSTALLATION INFORMATION */}
        <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-primary-foreground'>INFORMAÇÕES SOBRE A INSTALAÇÃO </h1>
        <div className='flex w-full flex-col gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LOCAL DE ATERRAMENTO'
              placeholder='Preencha o local de aterramento...'
              value={infoHolder.locais.aterramento || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, locais: { ...prev.locais, aterramento: value } }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LOCAL DE INSTALAÇÃO DO(S) INVERSOR(ES)'
              placeholder='Preencha o local de instalação do(s) inversor(es)...'
              value={infoHolder.locais.inversor || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, locais: { ...prev.locais, inversor: value } }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LOCAL DE INSTALAÇÃO DOS MÓDULOS'
              placeholder='Preencha o local de instalação dos módulos...'
              value={infoHolder.locais.modulos || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, locais: { ...prev.locais, modulos: value } }));
              }}
              width={'100%'}
            />
          </div>
        </div>
        <div className='flex w-full flex-col gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTANCIA DO INVERSOR AO PADRÃO'
              placeholder='Preencha a distância para cabeamento CA...'
              value={infoHolder.distancias.cabeamentoCA || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCA: value } }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTANCIA DOS MÓDULOS AO INVERSOR'
              placeholder='Preencha a distância para cabeamento CC..'
              value={infoHolder.distancias.cabeamentoCC || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCC: value } }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTÂNCIA DO INVERSOR ATÉ O ROTEADOR'
              placeholder='Preencha a distância do comunicador ao roteador...'
              value={infoHolder.distancias.conexaoInternet || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, conexaoInternet: value } }));
              }}
              width={'100%'}
            />
          </div>
        </div>
        <div className='flex w-full flex-col'>
          <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-primary-foreground'>
            COMENTÁRIOS COMPLEMENTARES
          </h1>
          <textarea
            placeholder='Preencha comentários relevantes para execução da análise.'
            value={infoHolder.comentarios || ''}
            onChange={(e) => {
              setInfoHolder((prev) => ({
                ...prev,
                comentarios: e.target.value,
              }));
            }}
            className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
          />
        </div>
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button onClick={() => {}} className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'>
          Voltar
        </button>
        <button
          className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
          onClick={() => handleRequestAnalysis({ info: infoHolder, files: files })}
        >
          SOLICITAR ANÁLISE
        </button>
      </div>
    </div>
  );
}

export default ReviewInfo;
