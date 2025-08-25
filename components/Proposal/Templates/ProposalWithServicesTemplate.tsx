import { formatLocation } from '@/lib/methods/formatting';
import { formatToMoney } from '@/utils/methods';
import { getFractionnementValue } from '@/utils/payment';
import type { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema';
import type { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema';
import type { TProposal } from '@/utils/schemas/proposal.schema';
import Image from 'next/image';
import { AiOutlineSafety } from 'react-icons/ai';
import { BsCircleHalf } from 'react-icons/bs';
import { FaInstagram, FaPhone } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdEmail, MdOutlineMiscellaneousServices, MdPayment } from 'react-icons/md';
import { TbWorld } from 'react-icons/tb';

type ProposalWithServicesTemplateProps = {
  proposalDocumentRef: any;
  proposal: TProposal;
  opportunity: TOpportunityDTOWithClient;
  partner: TPartnerSimplifiedDTO;
};
function ProposalWithServicesTemplate({ proposalDocumentRef, proposal, opportunity, partner }: ProposalWithServicesTemplateProps) {
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
      <div className='flex w-full grow flex-col'>
        <div className='px-2 py-2 text-center text-sm font-medium tracking-normal'>{partner.descricao}</div>
        <h1 className='w-full py-2 text-center text-2xl font-black text-cyan-400'>NOSSO ORÇAMENTO</h1>
        <h1 className='w-full py-2 text-start text-lg font-black'>SERVIÇOS DESSA PROPOSTA</h1>
        <div className='flex w-full flex-col gap-1'>
          {proposal.servicos.map((service, index) => (
            <div key={`${service.descricao}-${index}`} className='flex w-full flex-col border border-primary/50 p-2'>
              <div className='flex w-full flex-col items-start justify-between gap-2'>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-1'>
                    <div className='flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
                      <MdOutlineMiscellaneousServices size={18} />
                    </div>
                    <p className='whitespace-nowrap text-sm font-medium leading-none tracking-tight'>{service.descricao}</p>
                  </div>
                  {service.valor ? <h1 className='text-sm font-bold'>{formatToMoney(service.valor || 0)}</h1> : null}
                </div>

                <div className='flex w-full items-center justify-end gap-2 pl-2'>
                  {service.garantia ? (
                    <div className='flex items-center gap-1'>
                      <AiOutlineSafety size={12} />
                      <p className='whitespace-nowrap text-[0.6rem] font-light text-primary/70 lg:text-xs'>
                        {service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        <h1 className='w-full py-2 text-start text-lg font-black'>FORMAS DE PAGAMENTO DESSA PROPOSTA</h1>
        <div className='flex w-full flex-col gap-1'>
          {proposal.pagamento.metodos.map((method, index) => (
            <div key={`${method.descricao}-${index}`} className='flex w-full flex-col border border-primary/50 p-2'>
              <div className='flex w-full items-center justify-between gap-2'>
                <div className='flex items-center gap-1'>
                  <div className='flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1'>
                    <MdPayment size={18} />
                  </div>
                  <p className='text-sm font-medium leading-none tracking-tight'>{method.descricao}</p>
                </div>
                <div className='flex grow items-center justify-end gap-2'>
                  {method.fracionamento.map((fractionnement, itemIndex) => (
                    <div
                      key={`${method.descricao}-${itemIndex}`}
                      className={'flex w-fit min-w-fit items-center gap-1 rounded-md border border-primary/30 p-2 shadow-md'}
                    >
                      <BsCircleHalf color='#ed174c' />
                      <h1 className='text-[0.55rem] font-medium leading-none tracking-tight'>
                        {fractionnement.parcelas || fractionnement.maximoParcelas} x{' '}
                        <strong>
                          {formatToMoney(
                            getFractionnementValue({ fractionnement, proposalValue: proposal.valor }) /
                              (fractionnement.parcelas || fractionnement.maximoParcelas)
                          )}
                        </strong>
                      </h1>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className='my-4 px-2 text-center text-[0.47rem] font-medium'>
          OBS.: EFETIVAÇÃO DE VÍNCULO COMERCIAL PODE ESTAR SUJEITA A UMA VISITA TÉCNICA IN LOCO E CONFECÇÃO DE UM CONTRATO DE PRESTAÇÃO DE SERVIÇO
          ENTRE AS PARTES.
        </span>
        <div className='flex w-full items-center justify-between gap-1 rounded-bl-md rounded-br-md bg-black p-3'>
          <h1 className='text-[0.7rem] font-bold text-primary-foreground'>INVESTIMENTO ESPERADO</h1>
          <h1 className='whitespace-nowrap text-sm font-black text-primary-foreground'>{formatToMoney(proposal.valor)} À VISTA</h1>
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
        {partner.slogan ? <h1 className='w-full text-center font-black text-primary-foreground'>{partner.slogan}</h1> : null}
      </div>
    </div>
  );
}

export default ProposalWithServicesTemplate;
