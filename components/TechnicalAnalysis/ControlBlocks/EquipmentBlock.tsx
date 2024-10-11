import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { easeBackInOut } from 'd3-ease'
import toast from 'react-hot-toast'

import { AiFillCloseCircle, AiFillEdit } from 'react-icons/ai'
import { FaIndustry, FaSolarPanel } from 'react-icons/fa'
import { TbWaveSine } from 'react-icons/tb'
import { MdDelete } from 'react-icons/md'
import { ImPower } from 'react-icons/im'

import { renderCategoryIcon } from '@/lib/methods/rendering'

import SelectInput from '@/components/Inputs/SelectInput'
import NumberInput from '@/components/Inputs/NumberInput'

import { TInverter, TModule } from '@/utils/schemas/kits.schema'
import { TEquipment, TTechnicalAnalysis, TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema'
import { ProductItemCategories } from '@/utils/select-options'

import TextInput from '@/components/Inputs/TextInput'
import CheckboxInput from '@/components/Inputs/CheckboxInput'
import PreviousEquipmentMenu from '../PreviousEquipmentMenu'
import { useEquipments } from '@/utils/queries/utils'
const variants = {
  hidden: {
    opacity: 0.2,
    scale: 0.95, // Scale down slightly
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Adjust the color and alpha as needed
    transition: {
      duration: 0.5,
      ease: easeBackInOut, // Use an easing function
    },
  },
  visible: {
    opacity: 1,
    scale: 1, // Scale down slightly
    backgroundColor: 'rgba(255, 255, 255, 1)', // Normal background color
    transition: {
      duration: 0.5,
      ease: easeBackInOut, // Use an easing function
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05, // Scale down slightly
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Fading background color
    transition: {
      duration: 0.01,
      ease: easeBackInOut, // Use an easing function
    },
  },
}

type EquipmentBlockProps = {
  infoHolder: TTechnicalAnalysisDTO
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>
  changes: object
  setChanges: React.Dispatch<React.SetStateAction<object>>
}
function EquipmentBlock({ infoHolder, setInfoHolder, changes, setChanges }: EquipmentBlockProps) {
  const { data: equipments, isLoading, isError, isSuccess } = useEquipments({ category: null })

  const [editEnabled, setEditEnabled] = useState<boolean>(false)
  const [previousEquipmentMenuIsOpen, setPreviousEquipmentMenuIsOpen] = useState<boolean>(infoHolder.equipamentosAnteriores?.length > 0)
  // Functionality for equipments control
  const [inverterHolder, setInverterHolder] = useState<TInverter>({
    id: '',
    fabricante: '',
    modelo: '',
    qtde: 1,
    garantia: 10,
    potencia: 0,
  })
  const [moduleHolder, setModuleHolder] = useState<TModule>({
    id: '',
    fabricante: '',
    modelo: '',
    qtde: 1,
    potencia: 0,
    garantia: 10,
  })
  const [personalizedProductHolder, setPersonalizedProductHolder] = useState<TEquipment>({
    id: null,
    categoria: 'OUTROS',
    fabricante: '',
    modelo: '',
    qtde: 1,
    potencia: 0,
  })
  function addInverterToEquipments() {
    if (!inverterHolder.id && !inverterHolder.fabricante && !inverterHolder.modelo) {
      return toast.error('Inversor inválido. Por favor, tente novamente.')
    }
    if (inverterHolder.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de inversores válida.')
    }
    var productsArr = [...infoHolder.equipamentos]
    const productInfo: TEquipment = {
      id: inverterHolder.id,
      categoria: 'INVERSOR',
      fabricante: inverterHolder.fabricante,
      modelo: inverterHolder.modelo,
      qtde: inverterHolder.qtde,
      potencia: inverterHolder.potencia,
    }
    productsArr.push(productInfo)
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria))
    setInfoHolder((prev) => ({ ...prev, equipamentos: orderProducts }))
    setChanges((prev) => ({ ...prev, equipamentos: orderProducts }))
    setInverterHolder({
      id: '',
      fabricante: '',
      modelo: '',
      qtde: 1,
      garantia: 10,
      potencia: 0,
    })
  }
  function addModuleToEquipments() {
    if (!moduleHolder.id && !moduleHolder.fabricante && !moduleHolder.modelo) {
      return toast.error('Módulo inválido. Por favor, tente novamente.')
    }
    if (moduleHolder.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de módulos válida.')
    }
    var productsArr = [...infoHolder.equipamentos]
    const productInfo: TEquipment = {
      id: moduleHolder.id,
      categoria: 'MÓDULO',
      fabricante: moduleHolder.fabricante,
      modelo: moduleHolder.modelo,
      qtde: moduleHolder.qtde,
      potencia: moduleHolder.potencia,
    }
    productsArr.push(productInfo)
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria))
    setInfoHolder((prev) => ({ ...prev, equipamentos: orderProducts }))
    setChanges((prev) => ({ ...prev, equipamentos: orderProducts }))
    setModuleHolder({
      id: '',
      fabricante: '',
      modelo: '',
      qtde: 1,
      potencia: 0,
      garantia: 10,
    })
  }
  function addPersonalizedEquipment() {
    if (personalizedProductHolder.fabricante.trim().length < 3) return toast.error('Fabricante do produto não específicado.')
    if (personalizedProductHolder.modelo.trim().length < 3) return toast.error('Modelo do produto não específicado.')
    if (personalizedProductHolder.qtde <= 0) return toast.error('Quantidade do produto inválida.')

    var productsArr = [...infoHolder.equipamentos]
    const productInfo: TEquipment = {
      id: personalizedProductHolder.id,
      categoria: personalizedProductHolder.categoria,
      fabricante: personalizedProductHolder.fabricante,
      modelo: personalizedProductHolder.modelo,
      qtde: personalizedProductHolder.qtde,
      potencia: personalizedProductHolder.potencia,
    }
    productsArr.push(productInfo)
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria))
    setInfoHolder((prev) => ({ ...prev, equipamentos: orderProducts }))
    setChanges((prev) => ({ ...prev, equipamentos: orderProducts }))
    setPersonalizedProductHolder({
      id: null,
      categoria: 'OUTROS',
      fabricante: '',
      modelo: '',
      qtde: 1,
      potencia: 0,
    })
    return
  }
  function removeEquipment(index: number) {
    const currenTEquipmentList = [...infoHolder.equipamentos]
    currenTEquipmentList.splice(index, 1)
    setInfoHolder((prev) => ({ ...prev, equipamentos: currenTEquipmentList }))
    setChanges((prev) => ({ ...prev, equipamentos: currenTEquipmentList }))
  }

  return (
    <div className="mt-4 flex w-full flex-col">
      <div className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2">
        <h1 className="font-bold text-white">EQUIPAMENTOS</h1>
        <button onClick={() => setEditEnabled((prev) => !prev)}>{!editEnabled ? <AiFillEdit color="white" /> : <AiFillCloseCircle color="#ff1736" />}</button>
      </div>
      <AnimatePresence>
        {
          editEnabled ? (
            <motion.div key={'editor'} variants={variants} initial="hidden" animate="visible" exit="exit" className="mt-2 flex w-full flex-col gap-2">
              <div className="flex w-full flex-col gap-1">
                <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
                  <div className="w-full lg:w-3/4">
                    <SelectInput
                      label="INVERSOR"
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
                      selectedItemLabel="NÃO DEFINIDO"
                      options={
                        equipments
                          ?.filter((e) => e.categoria == 'INVERSOR')
                          .map((inverter) => {
                            return {
                              id: inverter._id,
                              label: `${inverter.fabricante} - ${inverter.modelo}`,
                              value: inverter,
                            }
                          }) || []
                      }
                      width="100%"
                    />
                  </div>
                  <div className="w-full lg:w-1/4">
                    <NumberInput
                      label="QTDE"
                      value={inverterHolder.qtde}
                      handleChange={(value) =>
                        setInverterHolder((prev) => ({
                          ...prev,
                          qtde: Number(value),
                        }))
                      }
                      placeholder="QTDE"
                      width="100%"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    className="rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
                    onClick={() => addInverterToEquipments()}
                  >
                    ADICIONAR INVERSOR
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
                  <div className="w-full lg:w-3/4">
                    <SelectInput
                      label="MÓDULO"
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
                      selectedItemLabel="NÃO DEFINIDO"
                      options={
                        equipments
                          ?.filter((e) => e.categoria == 'MÓDULO')
                          .map((module) => {
                            return {
                              id: module._id,
                              label: `${module.fabricante} - ${module.modelo}`,
                              value: module,
                            }
                          }) || []
                      }
                      width="100%"
                    />
                  </div>
                  <div className="w-full lg:w-1/4">
                    <NumberInput
                      label="QTDE"
                      value={moduleHolder.qtde}
                      handleChange={(value) =>
                        setModuleHolder((prev) => ({
                          ...prev,
                          qtde: Number(value),
                        }))
                      }
                      placeholder="QTDE"
                      width="100%"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    className="rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
                    onClick={() => addModuleToEquipments()}
                  >
                    ADICIONAR MÓDULO
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
                  <div className="w-full lg:w-[30%]">
                    <SelectInput
                      label="CATEGORIA"
                      selectedItemLabel="NÃO DEFINIDO"
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
                        }))
                      }}
                      width="100%"
                    />
                  </div>
                  <div className="w-full lg:w-[40%]">
                    <TextInput
                      label="FABRICANTE"
                      placeholder="FABRICANTE"
                      value={personalizedProductHolder.fabricante}
                      handleChange={(value) =>
                        setPersonalizedProductHolder((prev) => ({
                          ...prev,
                          fabricante: value,
                        }))
                      }
                      width="100%"
                    />
                  </div>
                  <div className="w-full lg:w-[40%]">
                    <TextInput
                      label="MODELO"
                      placeholder="MODELO"
                      value={personalizedProductHolder.modelo}
                      handleChange={(value) =>
                        setPersonalizedProductHolder((prev) => ({
                          ...prev,
                          modelo: value,
                        }))
                      }
                      width="100%"
                    />
                  </div>
                  <div className="w-full lg:w-[15%]">
                    <NumberInput
                      label="POTÊNCIA"
                      value={personalizedProductHolder.potencia || null}
                      handleChange={(value) =>
                        setPersonalizedProductHolder((prev) => ({
                          ...prev,
                          potencia: Number(value),
                        }))
                      }
                      placeholder="POTÊNCIA"
                      width="100%"
                    />
                  </div>
                  <div className="w-full lg:w-[15%]">
                    <NumberInput
                      label="QTDE"
                      value={personalizedProductHolder.qtde}
                      handleChange={(value) =>
                        setPersonalizedProductHolder((prev) => ({
                          ...prev,
                          qtde: Number(value),
                        }))
                      }
                      placeholder="QTDE"
                      width="100%"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    className="rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
                    onClick={() => addPersonalizedEquipment()}
                  >
                    ADICIONAR PRODUTO PERSONALIZADO
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null
          // <motion.div
          //   key={'readOnly'}
          //   variants={variants}
          //   initial="hidden"
          //   animate="visible"
          //   exit="exit"
          //   className="mt-2 flex w-full flex-col gap-2"
          // ></motion.div>
        }
        <div className="mt-4 flex w-full flex-col flex-wrap justify-around gap-4 lg:flex-row">
          {infoHolder.equipamentos.length > 0 ? (
            infoHolder.equipamentos.map((equipment, index) => (
              <div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2 lg:w-[350px]">
                <div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-1">
                    <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
                      {renderCategoryIcon(equipment.categoria, 18)}
                    </div>
                    <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
                      <strong className="text-[#FF9B50]">{equipment.qtde}</strong> x {equipment.modelo}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEquipment(index)}
                    type="button"
                    className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
                  >
                    <MdDelete color="red" size={15} />
                  </button>
                </div>
                <div className="flex w-full items-center justify-end gap-2 pl-2">
                  <div className="flex items-center gap-1">
                    <FaIndustry size={15} />
                    <p className="text-[0.6rem] font-light text-gray-500">{equipment.fabricante}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ImPower size={15} />
                    <p className="text-[0.6rem] font-light text-gray-500">{equipment.potencia} W</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhum equipamento adicionado à lista.</p>
          )}
        </div>
      </AnimatePresence>
      <div className="my-2 flex w-full items-center justify-center">
        <div className="w-fit">
          <CheckboxInput
            labelFalse="AMPLIAÇÃO DE SISTEMA"
            labelTrue="AMPLIAÇÃO DE SISTEMA"
            checked={previousEquipmentMenuIsOpen}
            handleChange={(value) => setPreviousEquipmentMenuIsOpen(value)}
          />
        </div>
      </div>
      {previousEquipmentMenuIsOpen ? (
        <PreviousEquipmentMenu
          infoHolder={infoHolder as TTechnicalAnalysis}
          setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>}
        />
      ) : null}
    </div>
  )
}

export default EquipmentBlock
