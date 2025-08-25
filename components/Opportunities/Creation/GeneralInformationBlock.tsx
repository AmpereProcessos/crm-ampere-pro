import SelectInput from '@/components/Inputs/SelectInput';
import SelectWithImages from '@/components/Inputs/SelectWithImages';
import TextInput from '@/components/Inputs/TextInput';
import type { TUserSession } from '@/lib/auth/session';
import { usePartnersSimplified } from '@/utils/queries/partners';
import type { TOpportunity } from '@/utils/schemas/opportunity.schema';
import type { TProjectTypeDTO } from '@/utils/schemas/project-types.schema';
import { ComercialSegments } from '@/utils/select-options';
import { LayoutGrid } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';

type GeneralInformationBlockProps = {
  opportunity: TOpportunity;
  setOpportunity: Dispatch<SetStateAction<TOpportunity>>;
  projectTypes?: TProjectTypeDTO[];
  session: TUserSession;
};
function GeneralInformationBlock({ opportunity, setOpportunity, projectTypes, session }: GeneralInformationBlockProps) {
  const partnersScope = session.user.permissoes.parceiros.escopo;
  const { data: partners } = usePartnersSimplified();
  const vinculationPartners = partners ? (partnersScope ? partners?.filter((p) => partnersScope.includes(p._id)) : partners) : [];
  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
        <LayoutGrid size={15} />
        <h1 className='text-xs tracking-tight font-medium text-start w-fit'>INFORMAÇÕES DA OPORTUNIDADE</h1>
      </div>
      <TextInput
        label='NOME DO PROJETO'
        value={opportunity.nome}
        placeholder='Preencha aqui o nome a ser dado ao projeto...'
        handleChange={(value) => setOpportunity((prev) => ({ ...prev, nome: value }))}
        width='100%'
      />
      <SelectWithImages
        label='VÍNCULO DE PARCEIRO'
        value={opportunity.idParceiro || null}
        options={vinculationPartners?.map((p) => ({ id: p._id, value: p._id, label: p.nome, url: p.logo_url || undefined })) || []}
        resetOptionLabel='TODOS'
        handleChange={(value) =>
          setOpportunity((prev) => ({
            ...prev,
            idParceiro: value,
          }))
        }
        onReset={() =>
          setOpportunity((prev) => ({
            ...prev,
            idParceiro: session.user.idParceiro,
          }))
        }
        width='100%'
      />
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <SelectInput
            label='TIPO DO PROJETO'
            value={opportunity.tipo.id}
            options={projectTypes?.map((type, index) => ({ id: index + 1, label: type.nome, value: type._id })) || []}
            handleChange={(value) => {
              const type = projectTypes?.find((t) => t._id === value);
              const saleCategory = type?.categoriaVenda || 'KIT';
              const typeTitle = type?.nome || 'SISTEMA FOTOVOLTAICO';
              setOpportunity((prev) => ({
                ...prev,
                tipo: {
                  id: value,
                  titulo: typeTitle,
                },
                categoriaVenda: saleCategory as TOpportunity['categoriaVenda'],
              }));
            }}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() =>
              setOpportunity((prev) => ({
                ...prev,
                tipo: {
                  id: '6615785ddcb7a6e66ede9785',
                  titulo: 'SISTEMA FOTOVOLTAICO',
                },
                categoriaVenda: 'KIT',
              }))
            }
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <SelectInput
            label='SEGMENTO'
            value={opportunity.segmento}
            options={ComercialSegments}
            handleChange={(value) => {
              setOpportunity((prev) => ({
                ...prev,
                segmento: value as TOpportunity['segmento'],
              }));
            }}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() =>
              setOpportunity((prev) => ({
                ...prev,
                segmento: 'RESIDENCIAL',
              }))
            }
            width='100%'
          />
        </div>
      </div>

      <div className='flex w-full flex-col gap-1'>
        <p className='font-Raleway font-bold text-primary/80'>DESCRIÇÃO</p>
        <textarea
          value={opportunity.descricao}
          onChange={(e) =>
            setOpportunity((prev) => ({
              ...prev,
              descricao: e.target.value,
            }))
          }
          placeholder='Descreva aqui peculiaridades do cliente, da negociação, ou outras informações relevantes acerca desse projeto.'
          className='h-[100px] w-full resize-none rounded-xs border border-primary/30 p-2 text-center text-sm text-primary/60 outline-hidden focus:border-blue-300 focus:ring-3 focus:ring-[1] lg:h-[50px]'
        />
      </div>
    </div>
  );
}

export default GeneralInformationBlock;
