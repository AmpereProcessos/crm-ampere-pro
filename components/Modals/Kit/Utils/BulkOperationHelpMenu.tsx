import type { TUserSession } from '@/lib/auth/session';
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema';
import { TPricingMethodDTO } from '@/utils/schemas/pricing-method.schema';
import { FaRegQuestionCircle } from 'react-icons/fa';
import BulkOperationPartners from './BulkOperationPartners';
import BulkOperationPricingMethods from './BulkOperationPricingMethods';

type BulkOperationHelpMenuProps = {
  session: TUserSession;
  pricingMethods: TPricingMethodDTO[];
  partners: TPartnerSimplifiedDTO[];
};
function BulkOperationHelpMenu({ session, pricingMethods, partners }: BulkOperationHelpMenuProps) {
  const userPartnerScope = session.user.permissoes.parceiros.escopo;
  const userHasWidePartnerScope = !userPartnerScope || userPartnerScope.length > 1;
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-orange-500 bg-orange-50 p-3'>
      <div className='flex items-center gap-1 text-orange-500'>
        <FaRegQuestionCircle />
        <h1 className='font-black'>AJUDA</h1>
      </div>
      <div className='flex flex-col items-center'>
        <p className='text-sm tracking-tight text-primary/50'>Faça operações em massa nos seus kits através da nossa planilha modelo.</p>
        <p className='text-sm tracking-tight text-primary/50'>Adicione, altere e/ou exclua diversos kits simultaneamente.</p>
        <p className='text-sm tracking-tight text-primary/50'>
          Linhas com a <strong className='text-[#E25E3E]'>coluna ID</strong> preenchida serão utilizadas para{' '}
          <strong className='text-[#E25E3E]'>atualização de um kit existente.</strong>
        </p>
        <p className='text-sm tracking-tight text-primary/50'>
          Linhas com a <strong className='text-[#E25E3E]'>coluna EXCLUIR preenchida com SIM</strong> serão utilizadas para{' '}
          <strong className='text-[#E25E3E]'>exclusão de um kit existente.</strong>
        </p>
      </div>
      <BulkOperationPricingMethods pricingMethods={pricingMethods} />
      {userHasWidePartnerScope ? <BulkOperationPartners session={session} partners={partners} /> : null}
    </div>
  );
}

export default BulkOperationHelpMenu;
