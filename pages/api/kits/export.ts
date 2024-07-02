import { formatDateAsLocale } from '@/lib/methods/formatting'
import { getPartnerActiveKits, getPartnerKits } from '@/repositories/kits/queries'
import { getPartnersSimplified } from '@/repositories/partner-simplified/query'
import { getPartnerPricingMethods } from '@/repositories/pricing-methods/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { apiHandler, validateAuthenticationWithSession } from '@/utils/api'
import { TBulkOperationKit, TKit } from '@/utils/schemas/kits.schema'
import { TPartner } from '@/utils/schemas/partner.schema'
import { TPricingMethod } from '@/utils/schemas/pricing-method.schema'
import { Collection, Filter } from 'mongodb'
import { NextApiHandler } from 'next'

type GetResponse = {
  data: TBulkOperationKit[]
}

const getKitsExportRoute: NextApiHandler<GetResponse> = async (req, res) => {
  const session = await validateAuthenticationWithSession(req, res)
  const partnerScope = session.user.permissoes.parceiros.escopo

  const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope, null] } } : {}

  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const kitsCollection: Collection<TKit> = db.collection('kits')
  const pricingMethodsCollection: Collection<TPricingMethod> = db.collection('pricing-methods')
  const partnersCollection: Collection<TPartner> = db.collection('partners')

  const kits = await getPartnerKits({ collection: kitsCollection, query: partnerQuery })
  const pricingMethods = await getPartnerPricingMethods({ collection: pricingMethodsCollection, query: partnerQuery })
  const partners = await getPartnersSimplified({ collection: partnersCollection, query: {} })

  const result: TBulkOperationKit[] = kits.map((kit) => {
    const pricingMethodologyName = pricingMethods?.find((m) => m._id.toString() == kit.idMetodologiaPrecificacao)?.nome || 'SOMENTE VALOR DO KIT'
    const partnerName = partners.find((p) => p._id.toString() == kit.idParceiro)?.nome || 'N/A'
    return {
      ID: kit._id.toString(),
      ATIVO: (kit.ativo ? 'SIM' : 'NÃO') as 'SIM' | 'NÃO',
      NOME: kit.nome,
      TOPOLOGIA: kit.topologia,
      PREÇO: kit.preco,
      'VISIBILIDADE DE PARCEIRO': partnerName,
      'METODOLOGIA DE PRECIFICAÇÃO': pricingMethodologyName,
      'DATA DE VALIDADE': formatDateAsLocale(kit.dataValidade || undefined),
      'TIPO DE ESTRUTURA': kit.estruturasCompativeis[0],
      'CATEGORIA PRODUTO 1': kit.produtos[0]?.categoria,
      'FABRICANTE PRODUTO 1': kit.produtos[0]?.fabricante,
      'MODELO PRODUTO 1': kit.produtos[0]?.modelo,
      'POTÊNCIA PRODUTO 1': kit.produtos[0]?.potencia,
      'QUANTIDADE PRODUTO 1': kit.produtos[0]?.qtde,
      'GARANTIA PRODUTO 1': kit.produtos[0]?.garantia,
      'CATEGORIA PRODUTO 2': kit.produtos[1]?.categoria,
      'FABRICANTE PRODUTO 2': kit.produtos[1]?.fabricante,
      'MODELO PRODUTO 2': kit.produtos[1]?.modelo,
      'POTÊNCIA PRODUTO 2': kit.produtos[1]?.potencia,
      'QUANTIDADE PRODUTO 2': kit.produtos[1]?.qtde,
      'GARANTIA PRODUTO 2': kit.produtos[1]?.garantia,
      'DESCRIÇÃO SERVIÇO 1': kit.servicos[0]?.descricao,
      'GARANTIA SERVIÇO 1': kit.servicos[0]?.garantia,
      'DESCRIÇÃO SERVIÇO 2': kit.servicos[1]?.descricao,
      'GARANTIA SERVIÇO 2': kit.servicos[1]?.garantia,
      EXCLUIR: 'NÃO' as 'SIM' | 'NÃO',
    }
  })

  return res.status(200).json({ data: result })
}

export default apiHandler({ GET: getKitsExportRoute })
