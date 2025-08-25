import { formatDateAsLocale, formatToMoney } from '@/lib/methods/formatting';
import { renderCategoryIcon } from '@/lib/methods/rendering';
import { TProductDTO } from '@/utils/schemas/products.schema';
import { AiOutlineSafety } from 'react-icons/ai';
import { BsCalendarPlus } from 'react-icons/bs';
import { FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { MdAttachMoney } from 'react-icons/md';
import Avatar from '../utils/Avatar';

function getStatusTag({ active }: { active: boolean }) {
  if (!active) return <h1 className='rounded-full bg-primary/60 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs'>INATIVO</h1>;

  return <h1 className='rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs'>ATIVO</h1>;
}

type ProductProps = {
  product: TProductDTO;
  handleClick: (id: string) => void;
  userHasEditPermission: boolean;
  userHasPricingViewPermission: boolean;
};
function Product({ product, handleClick, userHasEditPermission, userHasPricingViewPermission }: ProductProps) {
  return (
    <div className='flex w-full gap-2 rounded-md border border-primary/50 bg-background font-Inter shadow-md lg:w-[450px]'>
      <div className='flex grow flex-col p-4'>
        <div className='flex w-full items-center justify-between gap-2'>
          <div className='flex items-center gap-1 text-primary '>
            <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
              {renderCategoryIcon(product.categoria)}
            </div>
            {userHasEditPermission ? (
              <h1
                onClick={() => handleClick(product._id)}
                className='cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'
              >
                {product.modelo}
              </h1>
            ) : (
              <h1 className='text-sm font-black leading-none tracking-tight'>{product.modelo}</h1>
            )}
          </div>
          {getStatusTag({ active: product.ativo })}
        </div>
        <div className='mt-2 flex w-full items-center justify-between gap-2'>
          <div className='flex items-center gap-1 text-green-500'>
            {userHasPricingViewPermission ? (
              <>
                <MdAttachMoney size={12} />
                <p className='text-[0.65rem] font-bold lg:text-xs'>{formatToMoney(product.preco || 0)}</p>
              </>
            ) : null}
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <FaIndustry size={12} />
              <p className='text-[0.65rem] font-bold lg:text-xs'>{product.fabricante}</p>
            </div>
            <div className='flex items-center gap-1'>
              <ImPower size={12} />
              <p className='text-[0.65rem] font-bold lg:text-xs'>{product.potencia} W</p>
            </div>
            <div className='flex items-center gap-1'>
              <AiOutlineSafety size={12} />
              <p className='text-[0.65rem] font-bold lg:text-xs'>{product.garantia} ANOS</p>
            </div>
          </div>
        </div>
        <div className='mt-2 flex w-full items-center justify-end gap-2'>
          <div className={`flex items-center gap-2`}>
            <div className='ites-center flex gap-1'>
              <BsCalendarPlus />
              <p className={`text-[0.65rem] font-medium text-primary/70`}>{formatDateAsLocale(product.dataInsercao, true)}</p>
            </div>
          </div>
          <div className='flex items-center justify-center gap-1'>
            <Avatar fallback={'U'} height={20} width={20} url={product.autor?.avatar_url || undefined} />
            <p className='text-[0.65rem] font-medium text-primary/70'>{product.autor?.nome}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
