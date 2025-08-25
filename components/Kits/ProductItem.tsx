import { renderIcon } from '@/lib/methods/rendering';
import { TProductItem } from '@/utils/schemas/kits.schema';
import { ProductItemCategories } from '@/utils/select-options';
import { AiOutlineSafety } from 'react-icons/ai';
import { BsCart } from 'react-icons/bs';
import { FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { MdDelete } from 'react-icons/md';

type ProductItemProps = {
  product: TProductItem;
  index: number;
  showRemoveButton?: boolean;
  removeProductFromKit: (index: number) => void;
};
function renderCategoryIcon(category: TProductItem['categoria']) {
  const CategoryInfo = ProductItemCategories.find((productCategory) => productCategory.value == category);
  if (!CategoryInfo) return <BsCart />;
  return renderIcon(CategoryInfo.icon);
}
function ProductItem({ product, index, showRemoveButton = true, removeProductFromKit }: ProductItemProps) {
  return (
    <div className='flex w-full flex-col rounded-md border border-primary/30 p-2 lg:w-[450px]'>
      <div className='flex w-full items-center justify-between gap-2'>
        <div className='flex  items-center gap-1'>
          <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
            {renderCategoryIcon(product.categoria)}
          </div>
          <p className='text-xs font-medium leading-none tracking-tight lg:text-sm'>
            <strong className='text-[#FF9B50]'>{product.qtde}</strong> x {product.modelo}
          </p>
        </div>
        {showRemoveButton ? (
          <button
            onClick={() => removeProductFromKit(index)}
            type='button'
            className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
          >
            <MdDelete style={{ color: 'red' }} size={15} />
          </button>
        ) : null}
      </div>

      <div className='mt-1 flex w-full items-center justify-end gap-2 pl-2'>
        <div className='flex items-center gap-1'>
          <FaIndustry size={12} />
          <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{product.fabricante}</p>
        </div>
        <div className='flex items-center gap-1'>
          <ImPower size={12} />
          <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{product.potencia} W</p>
        </div>
        <div className='flex items-center gap-1'>
          <AiOutlineSafety size={12} />
          <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{product.garantia} ANOS</p>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
