import { orientations } from '@/utils/constants'
import { IRepresentative, IResponsible, IUsuario } from '@/utils/models'
import { TInverter, TModule, TProductItem } from '@/utils/schemas/kits.schema'
import { TUserEntity, TUserDTOSimplified, TUserDTO } from '@/utils/schemas/user.schema'
import dayjs from 'dayjs'
import GenFactors from '@/utils/json-files/generationFactors.json'
import { TRevenue } from '@/utils/schemas/revenues.schema'
type GetPromoterAvatarUrl = {
  users?: TUserDTO[] | TUserDTOSimplified[]
  userName: string
  userId?: string
}
export function getUserAvatarUrl({ users, userName, userId }: GetPromoterAvatarUrl) {
  if (!users) return undefined
  const user = users.find((p) => p.nome == userName || p._id.toString() == userId)
  if (!user) return undefined
  return user.avatar_url || undefined
}

export function getPeakPotByModules(modules: TModule[] | undefined) {
  if (modules) {
    var peakPotSum = 0
    for (let i = 0; i < modules.length; i++) {
      peakPotSum = peakPotSum + modules[i].qtde * modules[i].potencia
    }
    return peakPotSum / 1000
  } else {
    return 0
  }
}
export function getModulesPeakPotByProducts(products: TProductItem[] | undefined) {
  if (!products) return 0
  const power = products.filter((product) => product.categoria == 'MÓDULO').reduce((acc, current) => acc + current.qtde * (current.potencia || 0), 0)
  return power / 1000
}
export function getInverterPeakPowerByProducts(products: TProductItem[] | undefined) {
  if (!products) return 0
  const power = products.filter((p) => p.categoria == 'INVERSOR').reduce((acc, current) => acc + current.qtde * (current.potencia || 0), 0)
  return power / 1000
}
export function getModulesQty(products: TProductItem[] | undefined) {
  if (!products) return 0
  const qty = products.filter((p) => p.categoria == 'MÓDULO').reduce((acc, current) => acc + current.qtde, 0)
  return qty
}
export function getInverterQty(products: TProductItem[] | undefined) {
  if (!products) return 0
  const qty = products.filter((p) => p.categoria == 'INVERSOR').reduce((acc, current) => acc + current.qtde, 0)
  return qty
}
export function getModulesStrByProducts(products: TProductItem[]) {
  const modules = products.filter((p) => p.categoria == 'MÓDULO')
  var str = ''
  for (let i = 0; i < modules.length; i++) {
    if (i < modules.length - 1) {
      str = str + `${modules[i].qtde}x ${modules[i].modelo} (${modules[i].potencia}W) & ` // `${modules[i].qtde}x PAINÉIS PROMOCIONAIS DE ${modules[i].potencia}W & `
    } else {
      str = str + `${modules[i].qtde}x ${modules[i].modelo} (${modules[i].potencia}W)` //  `${modules[i].qtde}x PAINÉIS PROMOCIONAIS DE ${modules[i].potencia}W`
    }
  }
  return str
}
export function getInvertersStrByProducts(products: TProductItem[]) {
  const inverters = products.filter((p) => p.categoria == 'INVERSOR')
  var str = ''
  for (let i = 0; i < inverters.length; i++) {
    if (i < inverters.length - 1) {
      str = str + `${inverters[i].qtde}x ${inverters[i].modelo} (${inverters[i].potencia}W) & ` // `${inverters[i].qtde}x PAINÉIS PROMOCIONAIS DE ${inverters[i].potencia}W & `
    } else {
      str = str + `${inverters[i].qtde}x ${inverters[i].modelo} (${inverters[i].potencia}W)` //  `${inverters[i].qtde}x PAINÉIS PROMOCIONAIS DE ${inverters[i].potencia}W`
    }
  }
  return str
}
export function getModulesAveragePower(products: TProductItem[]) {
  const modules = products.filter((m) => m.categoria == 'MÓDULO')
  const averagepower = modules.reduce((acc, current) => acc + (current.potencia || 0), 0) / modules.length
  console.log(averagepower)
  return averagepower
}
export function getDateDifference({ dateOne, dateTwo, absolute }: { dateOne?: string | null; dateTwo?: string | null; absolute: boolean }) {
  if (!dateOne || !dateTwo) return null
  const diff = dayjs(dateOne).diff(dateTwo, 'days')
  if (absolute) return Math.abs(diff)
  return diff
}

export function getRevenueReceivedTotal(receipts: TRevenue['recebimentos']) {
  return receipts.reduce((acc, current) => acc + current.valor, 0)
}

type GetGenFactorByOrientationParams = {
  city?: string | null
  uf?: string | null
  orientation: string
}
export function getGenFactorByOrientation({ city, uf, orientation }: GetGenFactorByOrientationParams) {
  if (!city || !uf) return 127

  var cityFactor = GenFactors.find((genFactor) => genFactor.CIDADE == city && genFactor.UF == uf)
  if (!cityFactor) return 127

  // Checking for existing orientations
  if (orientation && orientations.includes(orientation as (typeof orientations)[number])) return cityFactor[orientation as (typeof orientations)[number]]

  // In case no orientation or invalid orientation is provided, returning annual generation factor
  return cityFactor.ANUAL
}

export function getDateFromLocaleString(dateString: string) {
  const splited = dateString.split('/')
  console.log(splited)
  const day = splited[0]
  const month = splited[1]
  const year = splited[2]
  return new Date(`${month}/${day}/${year}`)
}
