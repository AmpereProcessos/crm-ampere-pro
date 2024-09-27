import { cn } from '@/lib/utils'
import React from 'react'
type TextInputProps = {
  width?: string
  label: string
  labelClassName?: string
  inputClassName?: string
  showLabel?: boolean
  value: string
  placeholder: string
  editable?: boolean
  handleChange: (value: string) => void
  handleOnBlur?: () => void
}
function TextInput({
  width,
  label,
  labelClassName,
  inputClassName,
  showLabel = true,
  value,
  placeholder,
  editable = true,
  handleChange,
  handleOnBlur,
}: TextInputProps) {
  const inputIdentifier = label.toLowerCase().replace(' ', '_')
  return (
    <div className={`flex w-full flex-col gap-1 lg:w-[${width ? width : '350px'}]`}>
      {showLabel ? (
        <label htmlFor={inputIdentifier} className={cn('font-sans font-bold text-[#353432]', labelClassName)}>
          {label}
        </label>
      ) : null}

      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        id={inputIdentifier}
        onBlur={() => {
          if (handleOnBlur) handleOnBlur()
          else return
        }}
        readOnly={!editable}
        type="text"
        placeholder={placeholder}
        className={cn('w-full rounded-md border border-gray-200 p-3 text-sm shadow-sm outline-none placeholder:italic', inputClassName)}
      />
    </div>
  )
}

export default TextInput
