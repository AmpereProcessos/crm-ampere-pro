import DropdownSelect from '@/components/Inputs/DropdownSelect'
import SelectInput from '@/components/Inputs/SelectInput'
import { TFunnelReference } from '@/utils/schemas/funnel-reference.schema'
import { TFunnelDTO } from '@/utils/schemas/funnel.schema'
import React from 'react'

function getCurrentActiveFunnelOptions(funnelId: number | string, funnels: TFunnelDTO[]) {
  let funnel = funnels.filter((funnel) => funnel._id.toString() == funnelId)[0]
  return funnel.etapas.map((stage) => {
    return {
      id: stage.id,
      label: stage.nome,
      value: stage.id,
    }
  })
}

type FunnelReferenceInformationBlockProps = {
  funnelReference: TFunnelReference
  setFunnelReference: React.Dispatch<React.SetStateAction<TFunnelReference>>
  funnels: TFunnelDTO[]
}
function FunnelReferenceInformationBlock({ funnelReference, setFunnelReference, funnels }: FunnelReferenceInformationBlockProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
      <div className="w-full lg:w-1/2">
        <SelectInput
          label="FUNIL"
          options={funnels.map((funnel) => ({
            id: funnel._id,
            label: funnel.nome,
            value: funnel._id,
          }))}
          value={funnelReference.idFunil || null}
          selectedItemLabel="NÃO DEFINIDO"
          handleChange={(selected) => {
            const selectedFunnel = funnels.find((f) => f._id == selected)
            const firstStage = selectedFunnel?.etapas[0].id || ''
            setFunnelReference((prev) => ({ ...prev, idFunil: selected, idEstagioFunil: firstStage.toString() }))
          }}
          onReset={() => setFunnelReference((prev) => ({ ...prev, idFunil: '' }))}
          width="100%"
        />
      </div>
      <div className="w-full lg:w-1/2">
        <SelectInput
          label="ETAPA"
          options={funnelReference.idFunil ? getCurrentActiveFunnelOptions(funnelReference.idFunil, funnels) : null}
          value={funnelReference.idEstagioFunil || null}
          selectedItemLabel="ETAPA NÃO DEFINIDA"
          handleChange={(selected) => {
            setFunnelReference((prev) => ({ ...prev, idEstagioFunil: selected.toString() }))
          }}
          onReset={() => setFunnelReference((prev) => ({ ...prev, idEstagioFunil: '' }))}
          width="100%"
        />
        {/* <DropdownSelect
          categoryName="ETAPA"
          selectedItemLabel="ETAPA NÃO DEFINIDA"
          options={funnelReference.idFunil ? getCurrentActiveFunnelOptions(funnelReference.idFunil, funnels) : null}
          value={funnelReference.idEstagioFunil || null}
          onChange={(selected) => setFunnelReference((prev) => ({ ...prev, idEstagioFunil: selected.value.toString() }))}
          onReset={() => setFunnelReference((prev) => ({ ...prev, idEstagioFunil: '' }))}
          width="100%"
        /> */}
      </div>
    </div>
  )
}

export default FunnelReferenceInformationBlock
