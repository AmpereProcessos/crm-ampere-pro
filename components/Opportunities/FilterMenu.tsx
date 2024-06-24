import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants'
import { TPersonalizedOpportunitiesFilter } from '@/utils/schemas/opportunity.schema'
import { AnimatePresence, motion } from 'framer-motion'
import StatesAndCities from '@/utils/json-files/cities.json'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import TextInput from '../Inputs/TextInput'
import MultipleSelectInputVirtualized from '../Inputs/MultipleSelectInputVirtualized'
import DateInput from '../Inputs/DateInput'
import { formatDate } from '@/utils/methods'
import { formatDateInputChange } from '@/lib/methods/formatting'
import SelectInput from '../Inputs/SelectInput'
import { TUserDTO, TUserDTOSimplified } from '@/utils/schemas/user.schema'
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'
import { TProjectTypeDTOSimplified } from '@/utils/schemas/project-types.schema'
const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }))

type OpportunitiesFiltersMenuProps = {
  updateFilters: (filters: TPersonalizedOpportunitiesFilter) => void
  selectedResponsibles: string[] | null
  setResponsibles: (responsibles: string[] | null) => void
  responsiblesOptions: TUserDTOSimplified[]
  selectedPartners: string[] | null
  setPartners: (partners: string[] | null) => void
  partnersOptions: TPartnerSimplifiedDTO[]
  selectedProjectTypes: string[] | null
  setProjectTypes: (types: string[] | null) => void
  projectTypesOptions: TProjectTypeDTOSimplified[]
  session: Session
  queryLoading: boolean
  resetSelectedPage: () => void
}
function OpportunitiesFiltersMenu({
  updateFilters,
  selectedResponsibles,
  setResponsibles,
  responsiblesOptions,
  selectedPartners,
  setPartners,
  partnersOptions,
  selectedProjectTypes,
  setProjectTypes,
  projectTypesOptions,
  session,
  queryLoading,
  resetSelectedPage,
}: OpportunitiesFiltersMenuProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo || null
  const userOpportunityScope = session.user.permissoes.oportunidades.escopo || null

  const responsibleSelectableOptions = responsiblesOptions
    ? userOpportunityScope
      ? responsiblesOptions.filter((a) => userOpportunityScope.includes(a._id))
      : responsiblesOptions
    : []
  const partnersSelectableOptions = partnersOptions
    ? userPartnersScope
      ? partnersOptions.filter((a) => userPartnersScope.includes(a._id))
      : partnersOptions
    : []
  const [filtersHolder, setFiltersHolder] = useState<TPersonalizedOpportunitiesFilter>({
    name: '',
    city: [],
    period: {
      after: null,
      before: null,
      field: null,
    },
  })
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
            value={filtersHolder.name}
            handleChange={(value) => {
              setFiltersHolder((prev) => ({ ...prev, name: value }))
            }}
            placeholder="Filtre pelo nome do cliente..."
            labelClassName="text-xs font-medium tracking-tight text-black"
          />
          <div className="w-full lg:w-[200px]">
            <MultipleSelectInputVirtualized
              label="CIDADE"
              selected={filtersHolder.city}
              options={AllCities}
              selectedItemLabel="NÃO DEFINIDO"
              handleChange={(value) => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  city: value as string[],
                }))
              }}
              onReset={() => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  city: [],
                }))
              }}
              width="100%"
              labelClassName="text-xs font-medium tracking-tight text-black"
            />
          </div>
          <div className="flex w-full flex-col items-center gap-2 lg:w-fit lg:flex-row">
            <div className="flex w-full flex-col gap-1 lg:w-fit">
              <h1 className="text-xs font-medium tracking-tight text-black">PERÍODO</h1>
              <div className="flex flex-col items-center gap-2 lg:flex-row">
                <div className="w-full lg:w-[150px]">
                  <DateInput
                    showLabel={false}
                    label="PERÍODO"
                    value={formatDate(filtersHolder.period.after)}
                    handleChange={(value) =>
                      setFiltersHolder((prev) => ({
                        ...prev,
                        period: {
                          ...prev.period,
                          after: formatDateInputChange(value),
                        },
                      }))
                    }
                    width="100%"
                  />
                </div>
                <div className="w-full lg:w-[150px]">
                  <DateInput
                    showLabel={false}
                    label="PERÍODO"
                    value={formatDate(filtersHolder.period.before)}
                    handleChange={(value) =>
                      setFiltersHolder((prev) => ({
                        ...prev,
                        period: {
                          ...prev.period,
                          before: formatDateInputChange(value),
                        },
                      }))
                    }
                    width="100%"
                  />
                </div>
              </div>
            </div>
            <SelectInput
              label="CAMPO DE FILTRO"
              value={filtersHolder.period.field}
              options={[
                { id: 1, label: 'DATA DE INSERÇÃO', value: 'dataInsercao' },
                { id: 2, label: 'DATA DE GANHO', value: 'ganho.data' },
                { id: 3, label: 'DATA DE PERDA', value: 'perda.data' },
              ]}
              selectedItemLabel="CAMPO NÃO DEFINIDO"
              handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, period: { ...prev.period, field: value } }))}
              onReset={() => setFiltersHolder((prev) => ({ ...prev, period: { ...prev.period, field: null } }))}
              labelClassName="text-xs font-medium tracking-tight text-black"
            />
          </div>
          <div className="w-full md:w-[350px]">
            <MultipleSelectInputVirtualized
              label="RESPONSÁVEIS"
              options={responsibleSelectableOptions?.map((promoter) => ({ id: promoter._id || '', label: promoter.nome, value: promoter._id })) || null}
              selected={selectedResponsibles}
              handleChange={(value) => setResponsibles(value as string[])}
              selectedItemLabel="TODOS"
              onReset={() => setResponsibles(null)}
              labelClassName="text-xs font-medium tracking-tight text-black"
              width="100%"
            />
          </div>
          <div className="w-full md:w-[350px]">
            <MultipleSelectInputVirtualized
              label="PARCEIROS"
              options={partnersSelectableOptions?.map((promoter) => ({ id: promoter._id || '', label: promoter.nome, value: promoter._id })) || null}
              selected={selectedPartners}
              handleChange={(value) => setPartners(value as string[])}
              selectedItemLabel="TODOS"
              onReset={() => setPartners(null)}
              labelClassName="text-xs font-medium tracking-tight text-black"
              width="100%"
            />
          </div>
          <div className="w-full md:w-[350px]">
            <MultipleSelectInputVirtualized
              label="TIPOS DE PROJETO"
              options={projectTypesOptions?.map((promoter) => ({ id: promoter._id || '', label: promoter.nome, value: promoter._id })) || null}
              selected={selectedProjectTypes}
              handleChange={(value) => setProjectTypes(value as string[])}
              selectedItemLabel="TODOS"
              onReset={() => setProjectTypes(null)}
              labelClassName="text-xs font-medium tracking-tight text-black"
              width="100%"
            />
          </div>
        </div>
        <div className="flex w-full flex-col flex-wrap items-center justify-end gap-2 lg:flex-row">
          <button
            disabled={queryLoading}
            onClick={() => {
              resetSelectedPage()
              updateFilters(filtersHolder)
            }}
            className="h-9 whitespace-nowrap rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-700 enabled:hover:text-white"
          >
            PESQUISAR
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OpportunitiesFiltersMenu
