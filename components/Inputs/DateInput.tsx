import React, { type ComponentType } from 'react';
import type { IconType } from 'react-icons';
import { renderIconWithClassNames } from '@/lib/methods/rendering';
import { cn } from '@/lib/utils';

type TextInputProps = {
  width?: string;
  label: string;
  labelIcon?: ComponentType | IconType;
  labelIconClassName?: string;
  labelClassName?: string;
  holderClassName?: string;
  showLabel?: boolean;
  value: string | undefined;
  editable?: boolean;
  handleChange: (value: string | undefined) => void;
};
function DateInput({
  width,
  label,
  labelIcon,
  labelIconClassName,
  labelClassName,
  holderClassName,
  showLabel = true,
  value,
  editable = true,
  handleChange,
}: TextInputProps) {
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
        onChange={(e) => {
          handleChange(e.target.value !== '' ? e.target.value : undefined);
        }}
        onReset={() => handleChange(undefined)}
        readOnly={!editable}
        type="date"
        value={value}
      />
    </div>
  );
}

export default DateInput;
