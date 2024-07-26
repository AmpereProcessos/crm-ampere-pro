import CheckboxWithDate from '@/components/Inputs/CheckboxWithDate'
import { THomologation } from '@/utils/schemas/homologation.schema'

type PendenciesInformationProps = {
  infoHolder: THomologation
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>
}
function PendenciesInformation({ infoHolder, setInfoHolder }: PendenciesInformationProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="w-full rounded bg-gray-800 p-1 text-center font-bold text-white">PENDÊNCIAS</h1>
      <div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row">
        <div className="w-fit">
          <CheckboxWithDate
            labelFalse="DIAGRAMAS FEITOS"
            labelTrue="DIAGRAMAS FEITOS"
            date={infoHolder.pendencias.diagramas || null}
            handleChange={(value) => {
              setInfoHolder((prev) => ({
                ...prev,
                pendencias: { ...prev.pendencias, diagramas: value },
              }))
            }}
          />
        </div>
        <div className="w-fit">
          <CheckboxWithDate
            labelFalse="FORMULÁRIOS FEITOS"
            labelTrue="FORMULÁRIOS FEITOS"
            date={infoHolder.pendencias.formularios || null}
            handleChange={(value) => {
              setInfoHolder((prev) => ({
                ...prev,
                pendencias: { ...prev.pendencias, formularios: value },
              }))
            }}
          />
        </div>
        <div className="w-fit">
          <CheckboxWithDate
            labelFalse="DESENHOS FEITOS"
            labelTrue="DESENHOS FEITOS"
            date={infoHolder.pendencias.desenhos || null}
            handleChange={(value) => {
              setInfoHolder((prev) => ({
                ...prev,
                pendencias: { ...prev.pendencias, desenhos: value },
              }))
            }}
          />
        </div>
        <div className="w-fit">
          <CheckboxWithDate
            labelFalse="MAPAS DE MICRO"
            labelTrue="MAPAS DE MICRO"
            date={infoHolder.pendencias.mapasDeMicro || null}
            handleChange={(value) => {
              setInfoHolder((prev) => ({
                ...prev,
                pendencias: { ...prev.pendencias, mapasDeMicro: value },
              }))
            }}
          />
        </div>
        <div className="w-fit">
          <CheckboxWithDate
            labelFalse="DISTRIBUIÇÃO DE CRÉDITOS FEITA"
            labelTrue="DISTRIBUIÇÃO DE CRÉDITOS FEITA"
            date={infoHolder.pendencias.distribuicoes || null}
            handleChange={(value) => {
              setInfoHolder((prev) => ({
                ...prev,
                pendencias: { ...prev.pendencias, distribuicoes: value },
              }))
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default PendenciesInformation
