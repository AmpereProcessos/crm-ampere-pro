import MultipleSelectInput from '@/components/Inputs/MultipleSelectInput'
import TextInput from '@/components/Inputs/TextInput'
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants'
import { UseHomologationsFilters } from '@/utils/queries/homologations'
import { HomologationControlStatus } from '@/utils/select-options'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

type FilterMenuProps = {
  filters: UseHomologationsFilters
  setFilters: React.Dispatch<React.SetStateAction<UseHomologationsFilters>>
}
function FilterMenu({ filters, setFilters }: FilterMenuProps) {
  return (
    <AnimatePresence>
      <motion.div
        key={'editor'}
        variants={GeneralVisibleHiddenExitMotionVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="mt-2 flex w-full flex-col gap-2 rounded-md border border-gray-300 bg-[#fff] p-2"
      >
        <h1 className="text-sm font-bold tracking-tight">FILTROS</h1>
        <div className="flex w-full flex-col flex-wrap items-center justify-start gap-2 lg:flex-row">
          <TextInput
            label="PESQUISA"
            value={filters.search}
            handleChange={(value) => {
              setFilters((prev) => ({ ...prev, search: value }))
            }}
            placeholder="Filtre pelo nome do kit..."
            labelClassName="text-xs font-medium tracking-tight text-black"
          />
          <div className="w-full lg:w-[200px]">
            <MultipleSelectInput
              label="STATUS"
              selected={filters.status}
              options={HomologationControlStatus}
              selectedItemLabel="NÃO DEFINIDO"
              handleChange={(value: string[] | []) => {
                setFilters((prev) => ({
                  ...prev,
                  status: value,
                }))
              }}
              onReset={() => {
                setFilters((prev) => ({
                  ...prev,
                  status: [],
                }))
              }}
              width="100%"
              labelClassName="text-xs font-medium tracking-tight text-black"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FilterMenu
