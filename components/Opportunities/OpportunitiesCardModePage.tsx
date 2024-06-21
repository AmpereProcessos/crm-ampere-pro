import { Session } from 'next-auth'
import React, { useState } from 'react'

type OpportunitiesCardModePageProps = {
  session: Session
}
function OpportunitiesCardModePage({ session }: OpportunitiesCardModePageProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo || null
  const userOpportunityScope = session.user.permissoes.oportunidades.escopo || null

  const [partners, setPartners] = useState<string[] | null>(userPartnersScope)
  const [responsibles, setResponsibles] = useState<string[] | null>(userOpportunityScope)
  return <div>OpportunitiesCardModePage</div>
}

export default OpportunitiesCardModePage
