import { useQuery } from '@tanstack/react-query'
import { IKit } from '../models'
import axios from 'axios'
import { getErrorMessage } from '@/lib/methods/errors'
import toast from 'react-hot-toast'
import { useState } from 'react'

import { TBulkOperationKit, TKit, TKitDTO, TKitDTOWithPricingMethod } from '../schemas/kits.schema'
import { getModulesPeakPotByProducts, getPeakPotByModules } from '@/lib/methods/extracting'
import { formatWithoutDiacritics } from '@/lib/methods/formatting'
type FetchKitsByQueryParams = {
  pipeline: any
}
async function fetchKitsByQuery({ pipeline }: FetchKitsByQueryParams) {
  try {
    const { data } = await axios.post('/api/kits/query', {
      pipeline,
    })
    return data.data as TKitDTOWithPricingMethod[]
  } catch (error) {
    throw error
  }
}

type UseKitsByQueryParams = {
  enabled: boolean
  queryType: 'TODOS OS KITS' | 'KITS POR PREMISSA'
  pipeline: any
}
export type UseKitsFilters = {
  search: string
  onlyActive: boolean
  onlyInactive: boolean
  promo: boolean
  topology: string[]
  moduleManufacturer: string[]
  inverterManufacturer: string[]
  powerRange: {
    min: number | null
    max: number | null
  }
  priceOrder: 'ASC' | 'DESC' | null
  powerOrder: 'ASC' | 'DESC' | null
}
export function useKitsByQuery({ enabled, queryType, pipeline }: UseKitsByQueryParams) {
  const [filters, setFilters] = useState<UseKitsFilters>({
    search: '',
    onlyActive: false,
    onlyInactive: false,
    promo: false,
    topology: [],
    moduleManufacturer: [],
    inverterManufacturer: [],
    powerRange: {
      min: null,
      max: null,
    },
    priceOrder: null,
    powerOrder: null,
  })
  function matchSearch(kit: TKitDTOWithPricingMethod) {
    if (filters.search.trim().length == 0) return true
    else return kit.nome.toUpperCase().includes(filters.search.toUpperCase())
  }
  function matchOnlyActive(kit: TKitDTOWithPricingMethod) {
    if (!filters.onlyActive) return true
    return !!kit.ativo
  }
  function matchOnlyInactive(kit: TKitDTOWithPricingMethod) {
    if (!filters.onlyInactive) return true
    return !kit.ativo
  }
  function matchPromo(kit: TKitDTOWithPricingMethod) {
    if (!filters.promo) return true
    return formatWithoutDiacritics(kit.nome, true).includes('PROMO')
  }
  function matchModuleManufacturer(kit: TKitDTOWithPricingMethod) {
    if (filters.moduleManufacturer.length == 0) return true
    return kit.produtos.filter((p) => p.categoria == 'MÓDULO').some((module) => filters.moduleManufacturer.includes(module.fabricante))
  }
  function matchInverterManufacturer(kit: TKitDTOWithPricingMethod) {
    if (filters.inverterManufacturer.length == 0) return true
    return kit.produtos.filter((p) => p.categoria == 'INVERSOR').some((inverter) => filters.inverterManufacturer.includes(inverter.fabricante))
  }
  function matchTopology(kit: TKitDTOWithPricingMethod) {
    if (filters.topology.length == 0) return true
    return filters.topology.includes(kit.topologia)
  }
  function matchPowerRange(kit: TKitDTOWithPricingMethod) {
    if (filters.powerRange.min == null || !filters.powerRange.max) return true
    const kitPower = getModulesPeakPotByProducts(kit.produtos)
    return kitPower >= filters.powerRange.min && kitPower <= filters.powerRange.max
  }
  function orderByPrice(kits: TKitDTOWithPricingMethod[]) {
    var newArr
    switch (filters.priceOrder) {
      case 'ASC':
        newArr = kits.sort((a, b) => a.preco - b.preco)
        return newArr
      case 'DESC':
        newArr = kits.sort((a, b) => b.preco - a.preco)
        return newArr

      default:
        return kits
    }
  }
  function orderByPower(kits: TKitDTOWithPricingMethod[]) {
    var newArr
    switch (filters.powerOrder) {
      case 'ASC':
        newArr = kits.sort((a, b) => getModulesPeakPotByProducts(a.produtos) - getModulesPeakPotByProducts(b.produtos))
        return newArr
      case 'DESC':
        newArr = kits.sort((a, b) => getModulesPeakPotByProducts(b.produtos) - getModulesPeakPotByProducts(a.produtos))
        return newArr
      default:
        return kits
    }
  }
  function handleModelData(data: TKitDTOWithPricingMethod[]) {
    if (data instanceof Error) return []
    var modeledData = data
    modeledData = orderByPrice(modeledData)
    modeledData = orderByPower(modeledData)
    return modeledData.filter(
      (kit) =>
        matchSearch(kit) &&
        matchOnlyActive(kit) &&
        matchOnlyInactive(kit) &&
        matchPromo(kit) &&
        matchTopology(kit) &&
        matchPowerRange(kit) &&
        matchModuleManufacturer(kit) &&
        matchInverterManufacturer(kit)
    )
  }
  return {
    ...useQuery({
      queryKey: ['queryKits', queryType],
      queryFn: async () => await fetchKitsByQuery({ pipeline }),
      enabled: !!enabled,
      select: (data) => handleModelData(data),
      refetchOnWindowFocus: false,
    }),
    filters,
    setFilters,
  }
}

async function fetchKits() {
  try {
    const { data } = await axios.get('/api/kits')
    return data.data as TKitDTO[]
  } catch (error) {
    throw error
  }
}

export function useKits() {
  const [filters, setFilters] = useState<UseKitsFilters>({
    onlyActive: false,
    onlyInactive: false,
    topology: [],
    moduleManufacturer: [],
    inverterManufacturer: [],
    search: '',
    powerRange: {
      min: null,
      max: null,
    },
    priceOrder: null,
    powerOrder: null,
    promo: false,
  })
  function matchSearch(kit: TKitDTO) {
    if (filters.search.trim().length == 0) return true
    else return kit.nome.toUpperCase().includes(filters.search.toUpperCase())
  }
  function matchOnlyActive(kit: TKitDTO) {
    if (!filters.onlyActive) return true
    return !!kit.ativo
  }
  function matchOnlyInactive(kit: TKitDTO) {
    if (!filters.onlyInactive) return true
    return !kit.ativo
  }
  function matchModuleManufacturer(kit: TKitDTO) {
    if (filters.moduleManufacturer.length == 0) return true
    return kit.produtos.filter((p) => p.categoria == 'MÓDULO').some((module) => filters.moduleManufacturer.includes(module.fabricante))
  }
  function matchInverterManufacturer(kit: TKitDTO) {
    if (filters.inverterManufacturer.length == 0) return true
    return kit.produtos.filter((p) => p.categoria == 'INVERSOR').some((inverter) => filters.inverterManufacturer.includes(inverter.fabricante))
  }
  function matchTopology(kit: TKitDTO) {
    if (filters.topology.length == 0) return true
    return filters.topology.includes(kit.topologia)
  }
  function matchPowerRange(kit: TKitDTO) {
    if (filters.powerRange.min == null || !filters.powerRange.max) return true
    const kitPower = getModulesPeakPotByProducts(kit.produtos)
    return kitPower >= filters.powerRange.min && kitPower <= filters.powerRange.max
  }
  function matchPromo(kit: TKitDTO) {
    if (!filters.promo) return true
    return formatWithoutDiacritics(kit.nome, true).includes('PROMO')
  }
  function orderByPrice(kits: TKitDTO[]) {
    var newArr
    switch (filters.priceOrder) {
      case 'ASC':
        newArr = kits.sort((a, b) => a.preco - b.preco)
        return newArr
      case 'DESC':
        newArr = kits.sort((a, b) => b.preco - a.preco)
        return newArr

      default:
        return kits
    }
  }
  function orderByPower(kits: TKitDTO[]) {
    var newArr
    switch (filters.powerOrder) {
      case 'ASC':
        newArr = kits.sort((a, b) => getModulesPeakPotByProducts(a.produtos) - getModulesPeakPotByProducts(b.produtos))
        return newArr
      case 'DESC':
        newArr = kits.sort((a, b) => getModulesPeakPotByProducts(b.produtos) - getModulesPeakPotByProducts(a.produtos))
        return newArr
      default:
        return kits
    }
  }
  function handleModelData(data: TKitDTO[]) {
    if (data instanceof Error) return []
    var modeledData = data
    modeledData = orderByPrice(modeledData)
    modeledData = orderByPower(modeledData)
    return modeledData.filter(
      (kit) =>
        matchSearch(kit) &&
        matchOnlyActive(kit) &&
        matchOnlyInactive(kit) &&
        matchTopology(kit) &&
        matchPowerRange(kit) &&
        matchModuleManufacturer(kit) &&
        matchInverterManufacturer(kit) &&
        matchPromo(kit)
    )
  }

  return {
    ...useQuery({
      queryKey: ['kits'],
      queryFn: fetchKits,
      select: (data) => handleModelData(data),
    }),
    filters,
    setFilters,
  }
}
async function fetchActiveKits() {
  try {
    const { data } = await axios.get('/api/kits?active=true')
    return data.data as TKitDTO[]
  } catch (error) {
    throw error
  }
}

export function useActiveKits() {
  const [filters, setFilters] = useState<UseKitsFilters>({
    topology: [],
    moduleManufacturer: [],
    inverterManufacturer: [],
    search: '',
    onlyActive: false,
    onlyInactive: false,
    powerRange: {
      min: null,
      max: null,
    },
    priceOrder: null,
    powerOrder: null,
    promo: false,
  })
  function matchSearch(kit: TKitDTO) {
    if (filters.search.trim().length == 0) return true
    else return kit.nome.toUpperCase().includes(filters.search.toUpperCase())
  }
  function matchOnlyActive(kit: TKitDTO) {
    if (!filters.onlyActive) return true
    return !!kit.ativo
  }
  function matchOnlyInactive(kit: TKitDTO) {
    if (!filters.onlyInactive) return true
    return !kit.ativo
  }
  function matchModuleManufacturer(kit: TKitDTO) {
    if (filters.moduleManufacturer.length == 0) return true
    return kit.produtos.filter((p) => p.categoria == 'MÓDULO').some((module) => filters.moduleManufacturer.includes(module.fabricante))
  }
  function matchInverterManufacturer(kit: TKitDTO) {
    if (filters.inverterManufacturer.length == 0) return true
    return kit.produtos.filter((p) => p.categoria == 'INVERSOR').some((inverter) => filters.inverterManufacturer.includes(inverter.fabricante))
  }
  function matchTopology(kit: TKitDTO) {
    if (filters.topology.length == 0) return true
    return filters.topology.includes(kit.topologia)
  }
  function matchPowerRange(kit: TKitDTO) {
    if (filters.powerRange.min == null || !filters.powerRange.max) return true
    const kitPower = getModulesPeakPotByProducts(kit.produtos)
    return kitPower >= filters.powerRange.min && kitPower <= filters.powerRange.max
  }
  function matchPromo(kit: TKitDTO) {
    if (!filters.promo) return true
    return formatWithoutDiacritics(kit.nome, true).includes('PROMO')
  }
  function orderByPrice(kits: TKitDTO[]) {
    var newArr
    switch (filters.priceOrder) {
      case 'ASC':
        newArr = kits.sort((a, b) => a.preco - b.preco)
        return newArr
      case 'DESC':
        newArr = kits.sort((a, b) => b.preco - a.preco)
        return newArr

      default:
        return kits
    }
  }
  function orderByPower(kits: TKitDTO[]) {
    var newArr
    switch (filters.powerOrder) {
      case 'ASC':
        newArr = kits.sort((a, b) => getModulesPeakPotByProducts(a.produtos) - getModulesPeakPotByProducts(b.produtos))
        return newArr
      case 'DESC':
        newArr = kits.sort((a, b) => getModulesPeakPotByProducts(b.produtos) - getModulesPeakPotByProducts(a.produtos))
        return newArr
      default:
        return kits
    }
  }
  function handleModelData(data: TKitDTO[]) {
    if (data instanceof Error) return []
    var modeledData = data
    modeledData = orderByPrice(modeledData)
    modeledData = orderByPower(modeledData)
    return modeledData.filter(
      (kit) =>
        matchSearch(kit) &&
        matchOnlyActive(kit) &&
        matchOnlyInactive(kit) &&
        matchTopology(kit) &&
        matchPowerRange(kit) &&
        matchModuleManufacturer(kit) &&
        matchInverterManufacturer(kit) &&
        matchPromo(kit)
    )
  }

  return {
    ...useQuery({
      queryKey: ['active-kits'],
      queryFn: fetchActiveKits,
      select: (data) => handleModelData(data),
    }),
    filters,
    setFilters,
  }
}

async function fetchKitById({ id }: { id: string }) {
  try {
    const { data } = await axios.get(`/api/kits?id=${id}`)
    return data.data as TKitDTO
  } catch (error) {
    throw error
  }
}

export function useKitById({ id }: { id: string }) {
  return useQuery({
    queryKey: ['kit-by-id', id],
    queryFn: async () => await fetchKitById({ id }),
  })
}

export async function fetchKitsExportation() {
  try {
    const { data } = await axios.get('/api/kits/export')
    return data.data as TBulkOperationKit[]
  } catch (error) {
    throw error
  }
}
