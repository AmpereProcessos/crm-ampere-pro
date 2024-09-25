import { TOpportunityDTOWithClient, TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import React, { useState } from 'react'
import GeneralSizing from '../NewProposalStages/GeneralSizing'
import PlansSelection from '../NewProposalStages/PlansSelection'
import KitsSelection from '../NewProposalStages/KitsSelection'
import Pricing from '../NewProposalStages/Pricing'
import { Session } from 'next-auth'
import Payment from '../NewProposalStages/Payment'
import Proposal from '../NewProposalStages/Proposal'
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'
import { IoMdOptions } from 'react-icons/io'
import { SlEnergy } from 'react-icons/sl'
import { MdAttachMoney, MdSell } from 'react-icons/md'
import { ImFileEmpty } from 'react-icons/im'
import { useProjectTypes } from '@/utils/queries/project-types'

type ProposalWithKitsProps = {
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  infoHolder: TProposal
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>
  session: Session
  partner: TPartnerSimplifiedDTO
}
function ProposalWithKits({ opportunity, infoHolder, setInfoHolder, session, partner }: ProposalWithKitsProps) {
  const { data: projectTypes } = useProjectTypes()
  const [stage, setStage] = useState<number>(1)
  const [applicablePaymentMethodsIds, setApplicablePaymentMethodsIds] = useState<string[]>([])
  console.log(infoHolder)
  return (
    <div className="m-6 flex h-fit flex-col rounded-md border border-gray-200 bg-[#fff] p-2 shadow-lg">
      <div className="grid min-h-[50px] w-full grid-cols-1 grid-rows-5 items-center gap-6 border-b border-gray-200 pb-4 lg:grid-cols-5 lg:grid-rows-1 lg:gap-1">
        <div className={`flex items-center justify-center gap-1 ${stage == 1 ? 'text-cyan-500' : 'text-gray-600'} `}>
          <IoMdOptions style={{ fontSize: '23px' }} />
          <p className="text-sm font-bold lg:text-lg">DIMENSIONAMENTO</p>
        </div>
        <div className={`flex items-center justify-center gap-1 ${stage == 2 ? 'text-cyan-500' : 'text-gray-600'} `}>
          <SlEnergy style={{ fontSize: '23px' }} />
          <p className="text-sm font-bold lg:text-lg">COMPOSIÇÃO</p>
        </div>
        <div className={`flex items-center justify-center gap-1 ${stage == 3 ? 'text-cyan-500' : 'text-gray-600'} `}>
          <MdSell style={{ fontSize: '23px' }} />
          <p className="text-sm font-bold lg:text-lg">VENDA</p>
        </div>
        <div className={`flex items-center justify-center gap-1 ${stage == 4 ? 'text-cyan-500' : 'text-gray-600'} `}>
          <MdAttachMoney style={{ fontSize: '23px' }} />
          <p className="text-sm font-bold lg:text-lg">PAGAMENTO</p>
        </div>
        <div className={`flex items-center justify-center gap-1 ${stage == 5 ? 'text-cyan-500' : 'text-gray-600'} `}>
          <ImFileEmpty style={{ fontSize: '23px' }} />
          <p className="text-sm font-bold lg:text-lg">PROPOSTA</p>
        </div>
      </div>
      {stage == 1 ? (
        <GeneralSizing
          infoHolder={infoHolder}
          setInfoHolder={setInfoHolder}
          opportunity={opportunity}
          projectTypes={projectTypes || []}
          moveToNextStage={() => setStage((prev) => prev + 1)}
          session={session}
        />
      ) : null}
      {stage == 2 ? (
        <KitsSelection
          infoHolder={infoHolder}
          setInfoHolder={setInfoHolder}
          opportunity={opportunity}
          moveToPreviousStage={() => setStage((prev) => prev - 1)}
          moveToNextStage={() => setStage((prev) => prev + 1)}
          setApplicablePaymentMethodsIds={setApplicablePaymentMethodsIds}
          session={session}
        />
      ) : null}
      {stage == 3 ? (
        <Pricing
          infoHolder={infoHolder}
          setInfoHolder={setInfoHolder}
          opportunity={opportunity}
          moveToPreviousStage={() => setStage((prev) => prev - 1)}
          moveToNextStage={() => setStage((prev) => prev + 1)}
          session={session}
        />
      ) : null}
      {stage == 4 ? (
        <Payment
          infoHolder={infoHolder}
          setInfoHolder={setInfoHolder}
          opportunity={opportunity}
          moveToPreviousStage={() => setStage((prev) => prev - 1)}
          moveToNextStage={() => setStage((prev) => prev + 1)}
          applicablePaymentMethodsIds={applicablePaymentMethodsIds}
          session={session}
        />
      ) : null}
      {stage == 5 ? (
        <Proposal
          infoHolder={infoHolder}
          setInfoHolder={setInfoHolder}
          opportunity={opportunity}
          projectTypes={projectTypes || []}
          moveToPreviousStage={() => setStage((prev) => prev - 1)}
          moveToNextStage={() => setStage((prev) => prev + 1)}
          session={session}
          partner={partner}
        />
      ) : null}
    </div>
  )
}

export default ProposalWithKits
