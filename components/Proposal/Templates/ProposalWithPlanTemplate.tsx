import { formatLocation, formatToMoney } from '@/lib/methods/formatting';
import type { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema';
import type { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import Image from 'next/image';
import { BsCheckCircleFill } from 'react-icons/bs';
import { FaInstagram, FaPhone } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { TbWorld } from 'react-icons/tb';

type ProposalWithPlanTemplateProps = {
  proposalDocumentRef: any;
  proposal: TProposal;
  opportunity: TOpportunityDTOWithClient;
  partner: TPartnerSimplifiedDTO;
};
function ProposalWithPlanTemplate({ proposalDocumentRef, proposal, opportunity, partner }: ProposalWithPlanTemplateProps) {
  return (
    <div ref={proposalDocumentRef} className='relative flex h-fit w-full flex-col overflow-hidden bg-background lg:h-[297mm] lg:w-[210mm]'>
      <div className='flex h-fit w-full items-center justify-between rounded-bl-md rounded-br-md bg-black p-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <p className='text-xs font-medium text-primary-foreground'>CLIENTE</p>
            <p className='text-xs font-medium text-primary-foreground'>{opportunity.nome}</p>
          </div>
          <div className='flex items-center gap-2'>
            <p className='text-xs font-medium text-primary-foreground'>CPF/CNPJ</p>
            <p className='text-xs font-medium text-primary-foreground'>{opportunity.cliente.cpfCnpj}</p>
          </div>
          <div className='flex items-center gap-2'>
            <p className='text-xs font-medium text-primary-foreground'>CIDADE</p>
            <p className='text-xs font-medium text-primary-foreground'>{opportunity.localizacao.cidade}</p>
          </div>
          <div className='flex items-center gap-2'>
            <p className='text-xs font-medium text-primary-foreground'>ENDEREÇO</p>
            <p className='text-xs font-medium text-primary-foreground'>{formatLocation({ location: opportunity.localizacao })}</p>
          </div>
        </div>
        <div className='flex flex-col items-end'>
          {partner.logo_url ? <Image src={partner.logo_url} width={60} height={60} alt='WHITE LOGO' quality={100} /> : null}
        </div>
      </div>
      <div className='px-2 py-2 text-center text-xs font-medium'>{partner.descricao}</div>
      <div className='flex w-full items-center gap-1 rounded-bl-md rounded-br-md bg-black p-3'>
        <h1 className='w-full text-center text-[0.7rem] font-bold text-primary-foreground'>CONHEÇA NOSSOS PLANOS</h1>
      </div>
      <div className='flex h-fit w-full flex-wrap items-stretch justify-center gap-2 py-2'>
        {proposal.planos.map((plan, index) => (
          <div key={`${plan.nome}-${index}`} className='flex w-[350px] flex-col rounded-lg border border-primary/50 bg-background p-6 shadow-lg'>
            <div className='flex w-full items-center justify-between gap-2'>
              <h1 className='font-black'>{plan.nome}</h1>
            </div>
            <p className='w-full text-start text-[0.65rem]  text-primary/70'>{plan?.descricao || '...'}</p>
            <div className='my-4 flex w-full items-end justify-center gap-1'>
              <h1 className='text-2xl font-black'>{formatToMoney(plan.valor || 0)}</h1>
              <h1 className='text-xs font-light text-primary/70'>/ {plan?.intervalo.tipo}</h1>
            </div>

            <div className='my-4 flex grow flex-col gap-1'>
              <h1 className='text-[0.6rem] tracking-tight text-primary/70'>DESCRITIVO</h1>
              <div className='flex grow flex-col gap-2'>
                {plan.descritivo.map((d, idx) => (
                  <div key={`${d.descricao}-${idx}`} className='flex items-center gap-1'>
                    <div className='w-fit'>
                      <BsCheckCircleFill color='rgb(21,128,61)' size={15} />
                    </div>
                    <p className='text-[0.65rem] font-medium tracking-tight'>{d.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-2 flex min-h-[100px] w-full items-end justify-between'>
        <div className='flex w-1/3 flex-col'>
          <div className='mb-1 h-[2px] w-full bg-black' />
          <p className='w-full text-center text-[0.7rem] font-bold text-primary'>{opportunity.cliente.nome.toUpperCase()}</p>
          <p className='w-full text-center text-[0.7rem] font-bold text-primary'>{opportunity.cliente.cpfCnpj}</p>
        </div>

        <div className='flex w-1/3 flex-col'>
          <div className='mb-1 h-[2px] w-full bg-black' />
          <p className='w-full text-center text-[0.7rem] font-bold text-primary'>{partner.nome.toUpperCase()}</p>
          <p className='w-full text-center text-[0.7rem] font-bold text-primary'>{partner.cpfCnpj}</p>
        </div>
      </div>
      <div className='mt-4 flex w-full flex-col gap-4 bg-black p-4'>
        <div className='flex w-full items-center justify-center gap-2'>
          <div className='flex items-center gap-1 text-primary-foreground'>
            <FaLocationDot size={20} />
            <p className='text-xs tracking-tight'>
              {partner.localizacao.cidade}/{partner.localizacao.uf}, {formatLocation({ location: partner.localizacao })}
            </p>
          </div>
          <div className='flex items-center gap-1 text-primary-foreground'>
            <MdEmail size={20} />
            <p className='text-xs tracking-tight'>{partner.contatos.email}</p>
          </div>
        </div>
        <div className='flex w-full items-center justify-around gap-6'>
          {partner.midias.website ? (
            <div className='flex items-center gap-1 text-primary-foreground'>
              <TbWorld size={20} />
              <p className='text-xs tracking-tight'>{partner.midias.website}</p>
            </div>
          ) : null}

          {partner.midias.instagram ? (
            <div className='flex items-center gap-1 text-primary-foreground'>
              <FaInstagram size={20} />
              <p className='text-xs tracking-tight'>{partner.midias.instagram}</p>
            </div>
          ) : null}

          <div className='flex items-center gap-1 text-primary-foreground'>
            <FaPhone size={20} />
            <p className='text-xs tracking-tight'>{partner.contatos.telefonePrimario}</p>
          </div>
        </div>
        {partner.slogan ? <h1 className='w-full whitespace-nowrap text-center font-black text-primary-foreground'>{partner.slogan}</h1> : null}
      </div>
    </div>
  );
}

export default ProposalWithPlanTemplate;
