'use server'
import SelectInput from '@/components/Inputs/SelectInput'
import { Sidebar } from '@/components/Sidebar'
import { BiCloudDownload } from 'react-icons/bi'
import { getExcelFromJSON, getJSONFromExcelFile } from '@/lib/methods/excel-utils'
import { formatDateAsLocale, formatDecimalPlaces } from '@/lib/methods/formatting'
import { formatToMoney } from '@/utils/methods'
import axios from 'axios'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import MultipleSelectInput from '@/components/Inputs/MultipleSelectInput'
import { z } from 'zod'
import { getErrorMessage } from '@/lib/methods/errors'
import { TbFileExport } from 'react-icons/tb'
import { useSession } from 'next-auth/react'
import LoadingPage from '@/components/utils/LoadingPage'
import { ADiasEquipmentExtractionSchema, getADiasModuleInfo, TAdiasExtractedEquipment } from '@/utils/integrations/suppliers/adias'

function renderInputText(file: File | null) {
  if (!file)
    return (
      <p className="mb-2 px-2 text-center text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Clique para escolher um arquivo</span> ou o arraste para a àrea demarcada
      </p>
    )
  return <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
}

const ADIASExtractionSchema = z.object(
  {
    CATEGORIA: z.enum(['MÓDULOS', 'INVERSORES', 'STRINGBOX', 'ESTRUTURA', 'CABO', 'CONECTOR', 'ACESSÓRIOS MICRO ENPHASE', 'BATERIA'], {
      required_error: 'CATEGORIA não informada.',
      invalid_type_error: 'Tipo não válido para CATEGORIA.',
    }),
    DESCRIÇÃO: z.string({ required_error: 'DESCRIÇÃO não fornecida.', invalid_type_error: 'Tipo não válido para DESCRIÇÃO.' }),
    PREÇO: z.union([z.string(), z.number()], { required_error: 'PREÇO não informado.', invalid_type_error: 'Tipo não válido para PREÇO.' }),
  },
  { required_error: 'Informações inválidas ou não fornecidas.', invalid_type_error: 'Informações inválidas ou não fornecidas.' }
)

type ExtractedADias = z.infer<typeof ADIASExtractionSchema>
type TKitExtracted = {
  nome: string
  itens: { qty: number; description: string; value: number; mppts?: number; size?: number }[]
}

type TExtractionParams = {
  data: TAdiasExtractedEquipment[] | null
  referenceModule: string | null
  referenceInverters: string[] | null
}

function KitFormatting() {
  const { data: session, status } = useSession()
  const [file, setFile] = useState<File | null>(null)

  const [rawJSONData, setRawJSONData] = useState<ExtractedADias[] | null>(null)
  const [kits, setKits] = useState<TKitExtracted[]>([])
  const [params, setParams] = useState<TExtractionParams>({
    data: null,
    referenceModule: null,
    referenceInverters: [],
  })
  async function handleDataExtraction({ file }: { file: File | null }) {
    try {
      if (!file) return toast.error('Nenhum arquivo vinculado.')
      const data = await getJSONFromExcelFile(file)
      const parsed = z.array(ADiasEquipmentExtractionSchema, { required_error: 'Formato inválido.', invalid_type_error: 'Formato inválido.' }).parse(data)
      return setParams((prev) => ({ ...prev, data: parsed }))
    } catch (error) {
      console.log(error)
      // const msg = getErrorMessage(error)
      toast.error('Formato inválido.')
    }
  }
  function getEquipmentsByCategory(data: TAdiasExtractedEquipment[] | null) {
    if (!data)
      return {
        modules: [],
        inverters: [],
        structures: [],
        cables: [],
        connector: [],
        stringBoxes: [],
      }
    return {
      modules: data.filter((d) => d.CATEGORIA == 'MÓDULOS'),
      inverters: data.filter((d) => d.CATEGORIA == 'INVERSORES'),
      structures: data.filter((d) => d.CATEGORIA == 'ESTRUTURA'),
      cables: data.filter((d) => d.CATEGORIA == 'CABO'),
      connector: data.filter((d) => d.CATEGORIA == 'CONECTOR'),
      stringBoxes: data.filter((d) => d.CATEGORIA == 'STRINGBOX'),
    }
  }
  const { modules, inverters, structures, stringBoxes, cables, connector } = getEquipmentsByCategory(params.data)

  async function getInfo({ data }: { data: ExtractedADias[] }) {
    if (data.length == 0) return toast.error('Nenhuma informações extraída foi encontrada.')
    if (!params.referenceModule) return toast.error('Selecione o painel fotovoltaico base para criação dos kits.')
    if (params.referenceInverters?.length == 0) return toast.error('Selecione ao menos um inversor para compor as possibilidades.')
    const selectedModule = modules.find((d) => d.DESCRIÇÃO == params.referenceModule)
    if (!selectedModule) return
    const { manufacturer, power } = getADiasModuleInfo(selectedModule)
    const moduleModel = manufacturer
    const modulePower = power
    const modulePrice = Number(selectedModule.PREÇO) || 0
    const system = []
    for (let m = 1; m <= 48; m++) {
      const itens = []
      const modulePowerTotal = (m * modulePower) / 1000
      const modulePriceTotal = m * modulePrice
      const moduleRailWidthTotal = m * 2.4
      const moduleCableSizeTotal = m * 3.2
      const selectedModule = { qty: m, description: moduleModel, value: modulePrice }
      itens.push(selectedModule)
      // Getting the inverter
      const selectedInverter = getInverter({ inverters, systemPower: modulePowerTotal })
      if (selectedInverter) itens.push(selectedInverter)
      // Getting trilhos
      const rails = data.filter((d) => d.DESCRIÇÃO.includes('PERFIL'))
      const selectedRail = getRails({ rails, moduleRailWidthTotal })
      if (selectedRail) itens.push(selectedRail)
      // Getting cables
      const cables = data.filter((d) => d.DESCRIÇÃO.includes('CABO SOLAR'))
      const { selectedBlackCable, selectedRedCable } = getCables({ cables, moduleCableSizeTotal })

      if (selectedRedCable) itens.push(selectedRedCable)
      if (selectedBlackCable) itens.push(selectedBlackCable)
      // Getting MC4
      const mc4 = data.find((d) => d.DESCRIÇÃO.includes('MC4'))
      const mppts = selectedInverter?.mppts || 0
      const selectedMC4 = getMC4({ mc4, mppts })
      if (selectedMC4) itens.push(selectedMC4)
      // Getting string box
      // @ts-ignore
      const mpptsQty = selectedInverter?.mppts
      const stringBoxes = data.filter((d) => d.DESCRIÇÃO.includes('STRING BOX'))
      const selectedStringBox = getStringBoxes({ stringBoxes, mppts })
      if (selectedStringBox) itens.push(selectedStringBox)
      // Getting screws
      const screws = data.filter((d) => d.DESCRIÇÃO.includes('KIT BYD LITE FIBRO-AÇO.'))
      const selectedScrew = getScrews({ screws, modulesQty: m })
      if (selectedScrew) itens.push(selectedScrew)

      const kitPackage = { qty: 1, description: 'EMBALAGEM', value: 300 }
      itens.push(kitPackage)
      const kitName = `GERADOR ${modulePowerTotal} kWp ${m}x BYD 540 + ${selectedInverter?.qty}x${selectedInverter?.description}`
      system.push({ nome: kitName, itens })
    }
    setKits(system)
  }
  function getInverter({ inverters, systemPower }: { inverters: ExtractedADias[]; systemPower: number }) {
    var selectedInverter: { qty: number; description: string; value: number; mppts: number } | null = null
    for (let i = 0; i < inverters.length; i++) {
      const inverter = inverters[i]
      const [byd, model, inv, connection, power, mppt] = inverter.DESCRIÇÃO.split(' ')
      const inverterPrice = Number(inverter.PREÇO) || 0
      const inverterMppt = Number(mppt.replace('MPPT', ''))

      const inverterPower = Number(power.replace('KW', ''))
      const inverterMaxPower = inverterPower * 1.5
      const inverterMinPower = inverterPower * 0.5

      const inverterQty = Math.ceil(systemPower / inverterPower)
      const inverterMinQty = Math.ceil(systemPower / inverterMaxPower)

      const inverterMinMppts = inverterMinQty * inverterMppt
      const inverterPriceTotal = inverterQty * inverterPrice
      const inverterPriceMinTotal = inverterMinQty * inverterPrice
      if (!selectedInverter)
        selectedInverter = {
          qty: inverterMinQty,
          description: inverter.DESCRIÇÃO,
          value: inverterPrice,
          mppts: inverterMinMppts,
        }

      const isBetterFitPrice = inverterPriceMinTotal < selectedInverter.qty * selectedInverter.value
      if (isBetterFitPrice)
        selectedInverter = {
          qty: inverterMinQty,
          description: inverter.DESCRIÇÃO,
          value: inverterPrice,
          mppts: inverterMinMppts,
        }
    }
    return selectedInverter
  }
  function getRails({ rails, moduleRailWidthTotal }: { rails: ExtractedADias[]; moduleRailWidthTotal: number }) {
    var selectedRail: { qty: number; description: string; value: number } | null = null
    for (let i = 0; i < rails.length; i++) {
      const rail = rails[i]
      const [perfil, model, material, size, structure] = rail.DESCRIÇÃO.split(' ')
      const railPrice = Number(rail.VALOR) || 0
      const railSize = Number(size.replace('MM', '')) / 1000
      const railQty = moduleRailWidthTotal / railSize
      const railTotal = railQty * railPrice
      if (!selectedRail) selectedRail = { qty: railQty, description: rail.DESCRIÇÃO, value: railPrice }
      const isBetterFitPrice = railTotal < selectedRail.qty * selectedRail.value
      if (isBetterFitPrice) selectedRail = { qty: railQty, description: rail.DESCRIÇÃO, value: railPrice }
    }
    return selectedRail
  }
  function getCables({ cables, moduleCableSizeTotal }: { cables: ExtractedADias[]; moduleCableSizeTotal: number }) {
    var selectedRedCable: { qty: number; description: string; value: number; size: number } | null = null
    const redCables = cables.filter((c) => c.DESCRIÇÃO.includes('VERM.'))
    for (let i = 0; i < redCables.length; i++) {
      const cable = redCables[i]
      const [cabo, solar, thickness, color, voltage, size] = cable.DESCRIÇÃO.split(' ')
      const cablePrice = Number(cable.VALOR) || 0
      const cableSizeNumber = Number(size.replace('KM', '').replace('M', ''))
      const cableSizeUnitMultiplier = size.includes('KM') ? 1000 : 1
      const cableSize = cableSizeNumber * cableSizeUnitMultiplier
      const cableQty = Math.ceil(moduleCableSizeTotal / cableSize)
      const cableTotalSize = cableQty * cableSize
      const cableTotalPrice = cableQty * cablePrice
      if (!selectedRedCable) selectedRedCable = { qty: cableQty, description: `CABO VERMELHO ${thickness} ${size}`, value: cablePrice, size: cableTotalSize }

      const isBetterFit = cableTotalSize > moduleCableSizeTotal && cableTotalSize < selectedRedCable.size
      const isBetterPrice = cableTotalSize > moduleCableSizeTotal && cableTotalPrice < selectedRedCable.qty * selectedRedCable.value
      if (isBetterFit || isBetterPrice)
        selectedRedCable = { qty: cableQty, description: `CABO VERMELHO ${thickness} ${size}`, value: cablePrice, size: cableTotalSize }
    }
    var selectedBlackCable: { qty: number; description: string; value: number; size: number } | null = null
    const blackCables = cables.filter((c) => c.DESCRIÇÃO.includes('PRETO'))
    for (let i = 0; i < blackCables.length; i++) {
      const cable = blackCables[i]
      const [cabo, solar, thickness, color, voltage, size] = cable.DESCRIÇÃO.split(' ')
      const cablePrice = Number(cable.VALOR) || 0
      const cableSizeNumber = Number(size.replace('KM', '').replace('M', ''))
      const cableSizeUnitMultiplier = size.includes('KM') ? 1000 : 1
      const cableSize = cableSizeNumber * cableSizeUnitMultiplier
      const cableQty = Math.ceil(moduleCableSizeTotal / cableSize)
      const cableTotalSize = cableQty * cableSize
      const cableTotalPrice = cableQty * cablePrice
      if (!selectedBlackCable) selectedBlackCable = { qty: cableQty, description: `CABO PRETO ${thickness} ${size}`, value: cablePrice, size: cableTotalSize }

      const isBetterFit = cableTotalSize > moduleCableSizeTotal && cableTotalSize < selectedBlackCable.size
      const isBetterPrice = cableTotalSize > moduleCableSizeTotal && cableTotalPrice < selectedBlackCable.qty * selectedBlackCable.value
      if (isBetterFit || isBetterPrice)
        selectedBlackCable = { qty: cableQty, description: `CABO PRETO ${thickness} ${size}`, value: cablePrice, size: cableTotalSize }
    }
    return { selectedRedCable, selectedBlackCable }
  }
  function getMC4({ mc4, mppts }: { mc4: ExtractedADias | undefined; mppts: number }) {
    if (!mc4) return null
    const mc4Price = Number(mc4.VALOR)
    const mc4Qty = mppts || 0
    const mc4PriceTotal = mc4Price * mc4Qty
    const selectedMC4 = { qty: mc4Qty, description: mc4.DESCRIÇÃO, value: mc4PriceTotal }
    return selectedMC4
  }
  function getStringBoxes({ stringBoxes, mppts }: { stringBoxes: ExtractedADias[]; mppts: number }) {
    var selectedStringBox: { qty: number; description: string; value: number } | null = null
    for (let i = 0; i < stringBoxes.length; i++) {
      const box = stringBoxes[i]
      const [name1, name2, identifier, waysStrModel] = box.DESCRIÇÃO.split(' ')
      const boxPrice = Number(box.VALOR) || 0

      const wayStr = waysStrModel.split('_')[0]
      const inputQty = Number(wayStr.split('-')[0].replace('E', ''))
      const outputQty = Number(wayStr.split('-')[1].replace('S', ''))
      if (!inputQty || !outputQty || inputQty != outputQty) return
      const boxQty = Math.ceil(mppts / inputQty)
      const boxPriceTotal = boxQty * boxPrice
      if (!selectedStringBox) selectedStringBox = { qty: boxQty, description: box.DESCRIÇÃO, value: boxPrice }

      const isBetterFitPrice = boxPriceTotal < selectedStringBox.qty * selectedStringBox.value
      if (isBetterFitPrice) selectedStringBox = { qty: boxQty, description: box.DESCRIÇÃO, value: boxPrice }
    }
    return selectedStringBox
  }
  function getScrews({ screws, modulesQty }: { screws: ExtractedADias[]; modulesQty: number }) {
    var selectedScrew: { qty: number; description: string; value: number } | null = null
    for (let i = 0; i < screws.length; i++) {
      const screw = screws[i]
      const [kit, byd, lite, type, modules] = screw.DESCRIÇÃO.split(' ')
      const screwPrice = Number(screw.VALOR) || 0
      const screwModulesNumber = Number(modules.replace('MOD', ''))
      const screwQty = Math.ceil(modulesQty / screwModulesNumber)
      const screwPriceTotal = screwQty * screwPrice
      if (!selectedScrew) selectedScrew = { qty: screwQty, description: screw.DESCRIÇÃO, value: screwPrice }
      const isBetterFitPrice = screwPriceTotal < selectedScrew.qty * selectedScrew.value
      if (isBetterFitPrice) selectedScrew = { qty: screwQty, description: screw.DESCRIÇÃO, value: screwPrice }
    }
    return selectedScrew
  }
  async function handleDataExport(kits: TKitExtracted[]) {
    try {
      const kitsFormatted = kits.map((kit) => {
        const inverter = kit.itens.find((k) => k.description.includes('INV.'))
        const module = kit.itens.find((k) => k.description.includes('PAINEL SOLAR'))
        const formatted = {
          ID: null,
          NOME: kit.nome,
          TOPOLOGIA: 'INVERSOR',
          PREÇO: kit.itens.reduce((acc, current) => acc + current.qty * current.value, 0),
          ATIVO: 'SIM',
          TIPO: 'TRADICIONAL',
          'DATA VALIDADE': null,
          'TIPO DE ESTRUTURA': ['Fibrocimento'],
          FORNECEDOR: null,
          INVERSOR: `${inverter?.description}`,
          'QTDE DE INVERSORES': inverter?.qty,
          'GARANTIA DE INVERSORES': 10,
          'INVERSOR 2': undefined,
          'QTDE DE INVERSORES 2': undefined,
          'GARANTIA DE INVERSORES 2': undefined,
          MÓDULO: `${module?.description}`,
          'QTDE DE MÓDULOS': module?.qty,
          'GARANTIA DE MÓDULOS': 10,
          'MÓDULO 2': undefined,
          'QTDE DE MÓDULOS 2': undefined,
          'GARANTIA DE MÓDULOS 2': undefined,
          EXCLUIR: '',
        }
        return formatted
      })
      getExcelFromJSON(kitsFormatted, `KITS ${formatDateAsLocale(new Date().toISOString())}`)
    } catch (error) {
      throw error
    }
  }
  console.log(modules.map((m) => m.DESCRIÇÃO))
  console.log(inverters.map((i) => i.DESCRIÇÃO))
  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col gap-2 overflow-x-hidden bg-[#f8f9fa] p-6">
        <h1 className="text-center font-medium text-gray-700">
          Crie múltiplos kits a partir de itens <strong className="text-[#DC222D]">A.DIAS</strong>{' '}
        </h1>
        <h1 className="text-center font-medium text-gray-700">
          Para a correção extração das informações, a tabela .XLSX deve conter duas colunas: uma chamada <strong className="text-blue-800">DESCRIÇÃO</strong> e
          outra chamada <strong className="text-blue-800">VALOR</strong>
        </h1>
        <div className="relative flex w-full items-center justify-center">
          <label
            htmlFor="dropzone-file"
            className="dark:hover:bg-bray-800 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pb-6 pt-5 text-gray-800">
              <BiCloudDownload color={'rgb(31,41,55)'} size={50} />

              {renderInputText(file)}
            </div>
            <input
              onChange={(e) => {
                if (e.target.files) setFile(e.target.files[0])
              }}
              id="dropzone-file"
              type="file"
              className="absolute h-full w-full opacity-0"
              accept=".xlsx"
            />
          </label>
        </div>
        <div className="flex w-full items-center justify-end">
          <button
            onClick={() => handleDataExtraction({ file })}
            className="rounded bg-gray-900 px-4 py-1 text-sm font-medium text-white disabled:bg-gray-200 enabled:hover:bg-gray-700"
          >
            EXTRAIR INFORMAÇÕES
          </button>
        </div>
        {params.data ? (
          <>
            <h1 className="w-full text-center font-bold text-gray-500">
              <strong className="text-green-500">Informações extraídas com sucesso.</strong> Selecione abaixo opções para compor os kits.
            </h1>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <SelectInput
                  label="PAINEL FOTOVOLTAICO PRINCIPAL"
                  value={params.referenceModule}
                  handleChange={(value) => setParams((prev) => ({ ...prev, referenceModule: value }))}
                  options={modules.map((d, index) => ({ id: index + 1, label: d.DESCRIÇÃO, value: d.DESCRIÇÃO })) || []}
                  selectedItemLabel="NÃO DEFINIDO"
                  onReset={() => setParams((prev) => ({ ...prev, module: null }))}
                />
                <MultipleSelectInput
                  label="POSSÍVEIS INVERSORES"
                  selected={params.referenceInverters}
                  handleChange={(value) => setParams((prev) => ({ ...prev, inverters: value as string[] }))}
                  options={inverters.map((d, index) => ({ id: index + 1, label: d.DESCRIÇÃO, value: d.DESCRIÇÃO })) || []}
                  selectedItemLabel="NÃO DEFINIDO"
                  onReset={() => setParams((prev) => ({ ...prev, inverters: [] }))}
                />
              </div>
              <button
                onClick={() => getInfo({ data: rawJSONData })}
                className="rounded bg-gray-900 px-4 py-1 text-sm font-medium text-white disabled:bg-gray-200 enabled:hover:bg-gray-700"
              >
                CRIAR KITS
              </button>
            </div>
            <div className="flex w-full items-center justify-end">
              {kits ? (
                <button
                  onClick={async () => {
                    if (kits) handleDataExport(kits)
                  }}
                  className="flex w-full items-center gap-2 rounded-md bg-gray-300 px-2 py-1 text-sm font-medium lg:w-fit"
                >
                  <p>Exportar dados como .XLSX</p>
                  <TbFileExport />
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {/* <div className="relative flex h-[46px] min-h-[46px] w-full items-center justify-center overflow-x-hidden rounded-lg border-2 border-dotted border-blue-700 bg-gray-100 p-2">
          <div className="absolute">
            {file ? (
              <div className="flex flex-col items-center">
                <i className="fa fa-folder-open fa-4x text-blue-700"></i>
                <span className="block text-center text-sm font-normal text-gray-400">{file ? file.name : `-`}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center overflow-x-hidden text-sm">
                <i className="fa fa-folder-open fa-4x text-blue-700"></i>
                <span className="block w-full overflow-x-hidden font-normal text-gray-400">Vincule aqui o arquivo</span>
              </div>
            )}
          </div>
          <input
            onChange={(e) => {
              if (e.target.files) setFile(e.target.files[0])
            }}
            className="h-full w-full opacity-0"
            type="file"
            id={'file-input'}
            accept={'.xlsx'}
          />
        </div> */}

        <div className="flex w-full flex-wrap justify-around gap-2">
          {kits.map((kit, index) => (
            <div key={index} className="flex w-[600px] flex-col rounded-md border border-gray-300 p-3 shadow-sm">
              <h1 className="font-bold leading-none tracking-tight">{kit.nome}</h1>
              <h1 className="mt-2 text-sm font-medium text-gray-500">ITENS</h1>
              <div className="mt-1 flex w-full flex-col gap-1">
                {kit.itens.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex w-full justify-between gap-2">
                    <h1 className="text-xs font-medium leading-none tracking-tight text-gray-500">
                      <strong className="text-[#fead41]">{formatDecimalPlaces(item.qty, 0)}x</strong> {item.description}{' '}
                      <strong className="text-[0.6rem] text-green-500">{formatToMoney(item.value)} /UN</strong>
                    </h1>
                    <h1 className="text-xs font-bold text-blue-800">{formatToMoney(item.value * item.qty)}</h1>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex w-full items-center justify-between border-t border-gray-300 py-2">
                <h1 className="text-sm font-medium text-gray-500">TOTAL</h1>
                <h1 className="rounded-md bg-black p-1 text-sm font-medium text-white">
                  {formatToMoney(kit.itens.reduce((acc, current) => acc + current.qty * current.value, 0))}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KitFormatting
