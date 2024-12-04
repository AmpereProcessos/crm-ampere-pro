import ProposalWithKitTemplate from '@/components/Proposal/Templates/ProposalWithKitTemplate'
import ProposalWithKitUFVTemplate from '@/components/Proposal/Templates/ProposalWithKitUFVTemplate'
import ProposalWithPlanTemplate from '@/components/Proposal/Templates/ProposalWithPlanTemplate'
import ProposalWithProductsTemplate from '@/components/Proposal/Templates/ProposalWithProductsTemplate'
import ProposalWithServicesTemplate from '@/components/Proposal/Templates/ProposalWithServicesTemplate'

import { getOpportunityById } from '@/repositories/opportunities/queries'
import { getPartnerOwnInformation } from '@/repositories/partner-simplified/query'
import { getProposalById } from '@/repositories/proposals/queries'
import connectToDatabase from '@/services/mongodb/crm-db-connection'
import { TOpportunity, TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema'
import { TPartner, TPartnerDTO } from '@/utils/schemas/partner.schema'
import { TProposal, TProposalDTO } from '@/utils/schemas/proposal.schema'
import { Collection, ObjectId } from 'mongodb'
import { GetServerSidePropsContext } from 'next'
import React from 'react'

type ProposalDocumentPageProps = {
  proposalJSON: string
  opportunityJSON: string
  partnerJSON: string
  error: string | null | undefined
}
function ProposalDocumentPage({ proposalJSON, opportunityJSON, partnerJSON, error }: ProposalDocumentPageProps) {
  if (error) return <h1>{error}</h1>
  const proposal: TProposalDTO = JSON.parse(proposalJSON)
  const opportunity: TOpportunityDTOWithClient = JSON.parse(opportunityJSON)
  const partner: TPartnerDTO = JSON.parse(partnerJSON)
  const isSolarSystemSale = opportunity.tipo.titulo == 'SISTEMA FOTOVOLTAICO' && opportunity.categoriaVenda == 'KIT'
  const isGeneralKitSale = opportunity.categoriaVenda == 'KIT' && opportunity.tipo.titulo != 'SISTEMA FOTOVOLTAICO'
  return (
    <div className="flex w-full items-center justify-center">
      {isSolarSystemSale ? <ProposalWithKitUFVTemplate proposal={proposal} opportunity={opportunity} partner={partner} /> : null}
      {/* {isSolarSystemSale ? <ProposalWithKitTemplate proposal={proposal} opportunity={opportunity} partner={partner} /> : null} */}
      {isGeneralKitSale ? <ProposalWithKitTemplate proposal={proposal} opportunity={opportunity} partner={partner} /> : null}
      {opportunity.categoriaVenda == 'PLANO' ? <ProposalWithPlanTemplate proposal={proposal} opportunity={opportunity} partner={partner} /> : null}
      {opportunity.categoriaVenda == 'PRODUTOS' ? <ProposalWithProductsTemplate proposal={proposal} opportunity={opportunity} partner={partner} /> : null}
      {opportunity.categoriaVenda == 'SERVIÇOS' ? <ProposalWithServicesTemplate proposal={proposal} opportunity={opportunity} partner={partner} /> : null}
    </div>
  )
}

export default ProposalDocumentPage

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context
  const { id } = query

  if (!id || typeof id != 'string' || !ObjectId.isValid(id))
    return {
      props: {
        error: 'ID INVÁLIDO',
      },
    }
  const db = await connectToDatabase(process.env.MONGODB_URI, 'crm')
  const proposalsCollection: Collection<TProposal> = db.collection('proposals')
  const opportunitiesCollection: Collection<TOpportunity> = db.collection('opportunities')
  const partnersCollection: Collection<TPartner> = db.collection('partners')

  const proposal = await proposalsCollection.findOne({ _id: new ObjectId(id) })

  if (!proposal)
    return {
      props: {
        error: 'PROPOSTA NÃO ENCONTRADA',
      },
    }

  const partnerId = proposal.idParceiro
  const opportunityId = proposal.oportunidade.id

  const partner = await getPartnerOwnInformation({ collection: partnersCollection, id: partnerId })
  if (!partner)
    return {
      props: {
        error: 'PARCEIRO NÃO ENCONTRADO',
      },
    }
  const opportunity = await getOpportunityById({ collection: opportunitiesCollection, id: opportunityId, query: {} })
  if (!opportunity)
    return {
      props: {
        error: 'OPORTUNIDADE NÃO ENCONTRADA',
      },
    }

  return {
    props: {
      proposalJSON: JSON.stringify(proposal),
      opportunityJSON: JSON.stringify(opportunity),
      partnerJSON: JSON.stringify(partner),
    },
  }
}
