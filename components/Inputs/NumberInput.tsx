import React, { type ComponentType } from 'react';
import type { IconType } from 'react-icons';
import { formatAsValidNumber } from '@/lib/methods/formatting';
import { renderIconWithClassNames } from '@/lib/methods/rendering';
import { cn } from '@/lib/utils';

type NumberInputProps = {
  width?: string;
  label: string;
  labelIcon?: ComponentType | IconType;
  labelIconClassName?: string;
  labelClassName?: string;
  holderClassName?: string;
  showLabel?: boolean;
  value: number | null | undefined;
  editable?: boolean;
  placeholder: string;
  handleChange: (value: number) => void;
};
function NumberInput({
  width,
  label,
  labelIcon,
  labelIconClassName,
  labelClassName,
  holderClassName,
  showLabel = true,
  value,
  editable = true,
  placeholder,
  handleChange,
}: NumberInputProps) {
  const inputIdentifier = label.toLowerCase().replace(' ', '_');
  return (
    <div className={`flex w-full flex-col gap-1 lg:w-[${width ? width : '350px'}]`}>
      {showLabel ? (
        labelIcon ? (
          <label className={cn('flex items-center gap-1 font-medium text-primary/80 text-sm tracking-tight', labelClassName)} htmlFor={inputIdentifier}>
            {renderIconWithClassNames(labelIcon, labelIconClassName)}
            {label}
          </label>
        ) : (
          <label className={cn('font-medium text-primary/80 text-sm tracking-tight', labelClassName)} htmlFor={inputIdentifier}>
            {label}
          </label>
        )
      ) : null}

      <input
        className={cn(
          'w-full rounded-md border border-primary/20 p-3 text-sm shadow-md outline-hidden duration-500 ease-in-out placeholder:italic focus:border-primary',
          holderClassName
        )}
        id={inputIdentifier}
        onChange={(e) => handleChange(Number(e.target.value))}
        placeholder={placeholder}
        readOnly={!editable}
        step={0.01}
        type="number"
        value={formatAsValidNumber(value)?.toString() ?? ''}
      />
    </div>
  );
}

export default NumberInput;
