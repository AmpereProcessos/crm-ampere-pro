import { fileTypes } from '@/utils/constants';
import type { TProductItem } from '@/utils/schemas/kits.schema';
import { ProductItemCategories, Units } from '@/utils/select-options';
import dayjs from 'dayjs';
import type { ComponentType } from 'react';
import type { IconType } from 'react-icons';
import { AiFillFile } from 'react-icons/ai';
import { BsCart } from 'react-icons/bs';
import { cn } from '../utils';

export function handleRenderIcon(format: string, size?: number) {
  //   useKey('Escape', () => setSelectMenuIsOpen(false))
  const extensionInfo = Object.values(fileTypes).find((f) => f.title == format);
  if (!extensionInfo)
    return (
      <div className='text-primary text-lg'>
        <AiFillFile />
      </div>
    );
  return <div className='text-primary text-lg'>{renderIcon(extensionInfo.icon, size || 15)}</div>;
}
export function renderIcon(icon: React.ComponentType | IconType, size: number | undefined = 12) {
  const IconComponent = icon;
  return <IconComponent size={size} />;
}
export function renderIconWithClassNames(icon: ComponentType | IconType, className?: string) {
  const IconComponent = icon;
  return <IconComponent className={cn('h-4 min-h-4 w-4 min-w-4', className)} />;
}
export function renderCategoryIcon(category: TProductItem['categoria'], size: number | undefined = 12) {
  const CategoryInfo = ProductItemCategories.find((productCategory) => productCategory.value == category);
  if (!CategoryInfo) return <BsCart size={size} />;
  return renderIcon(CategoryInfo.icon, size);
}
export function renderDateDiffText(dueDate?: string) {
  if (!dueDate)
    return (
      <p className={'min-w-[170px] break-keep rounded-md text-start font-medium text-[0.65rem] text-green-500 leading-none'}>
        SEM DATA DE VENCIMENTO
      </p>
    );
  const diffHours = dayjs(dueDate).diff(undefined, 'hour');
  const diffDays = dayjs(dueDate).diff(undefined, 'days');
  var number;
  var param;

  if (diffHours > 24) {
    number = Math.abs(diffDays);
    param = number > 1 ? 'DIAS' : 'DIA';
  } else {
    number = Math.abs(diffHours);
    param = number > 1 ? 'HORAS' : 'HORA';
  }
  const preText = diffHours < 0 ? 'VENCIDA HÁ ' : 'VENCE EM ';
  const text = preText + number + ' ' + param;

  if (diffHours > 24 && diffDays > 1)
    return <p className={'min-w-[170px] break-keep rounded-md text-start font-medium text-[0.65rem] text-green-500 leading-none'}>{text}</p>;
  if (diffHours > 24 && diffDays < 1)
    return <p className={'min-w-[170px] break-keep rounded-md text-start font-medium text-[0.65rem] text-orange-500 leading-none'}>{text}</p>;
  return <p className={'min-w-[170px] break-keep rounded-md text-start font-medium text-[0.65rem] text-red-500 leading-none'}>{text}</p>;
}

export function renderPaginationPageItemsIcons({
  totalPages,
  activePage,
  selectPage,
  disabled,
  maxRender = 5,
}: {
  totalPages: number;
  activePage: number;
  selectPage: (page: number) => void;
  disabled: boolean;
  maxRender?: number;
}) {
  const MAX_RENDER = maxRender;
  var pages: (number | string)[] = [];
  if (totalPages <= MAX_RENDER) {
    pages = Array.from({ length: totalPages }, (v, i) => i + 1);
  } else {
    // If active page is around the middle of the total pages
    if (totalPages - activePage > 3 && activePage - 1 > 3) {
      console.log('AQUI 1');
      pages = [1, '...', activePage - 1, activePage, activePage + 1, '...', totalPages];
    } else {
      // if active page is 3 elements from the total page
      if (activePage > 3 && totalPages - activePage < MAX_RENDER - 1)
        pages = [1, '...', ...Array.from({ length: MAX_RENDER }, (v, i) => i + totalPages - MAX_RENDER), totalPages];
      // else, if active page is 3 elements from 1
      else pages = [...Array.from({ length: MAX_RENDER }, (v, i) => i + 1), '...', totalPages];
    }
  }
  return pages.map((p) => (
    <button
      className={`${
        activePage == p ? 'border-black bg-black text-white' : 'border-transparent text-primary hover:bg-primary/50'
      } h-10 max-h-10 min-h-10 w-10 min-w-10 max-w-10 rounded-full border font-medium text-xs`}
      disabled={typeof p != 'number' || disabled}
      key={p}
      onClick={() => {
        if (typeof p != 'number') return;
        return selectPage(p);
      }}
    >
      {p}
    </button>
  ));
}

export function renderUnitLabel(str: string) {
  const unit = Units.find((u) => u.value == str);
  return unit?.label || str;
}
