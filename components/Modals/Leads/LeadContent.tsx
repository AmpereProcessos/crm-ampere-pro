import SelectInput from '@/components/Inputs/SelectInput';
import SelectInputVirtualized from '@/components/Inputs/SelectInputVirtualized';
import SelectWithImages from '@/components/Inputs/SelectWithImages';
import TextInput from '@/components/Inputs/TextInput';
import { BrazilianCitiesOptionsFromUF, BrazilianStatesOptions } from '@/utils/estados_cidades';
import StatesAndCities from '@/utils/json-files/cities.json';
import { formatToPhone } from '@/utils/methods';
import { useOpportunityCreators } from '@/utils/queries/users';
import { TLead } from '@/utils/schemas/leads.schema';
import { CustomersAcquisitionChannels } from '@/utils/select-options';
import { LayoutGrid, Upload } from 'lucide-react';
import { useMemo } from 'react';

const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));
const AllStates = StatesAndCities.map((e) => e.sigla).map((c, index) => ({ id: index + 1, label: c, value: c }));

type GeneralBlockProps = {
  infoHolder: TLead;
  updateInfoHolder: (newInfo: Partial<TLead>) => void;
};
export function GeneralBlock({ infoHolder, updateInfoHolder }: GeneralBlockProps) {
  return useMemo(
    () => (
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
          <LayoutGrid size={15} />
          <h1 className='text-xs tracking-tight font-medium text-start w-fit'>INFORMAÇÕES DO LEAD</h1>
        </div>
        <div className='w-full flex flex-col gap-3'>
          <TextInput
            label='NOME DO LEAD'
            placeholder='Preencha aqui o nome do lead...'
            value={infoHolder.nome ?? ''}
            handleChange={(value) => updateInfoHolder({ nome: value })}
            width='100%'
          />
          <TextInput
            label='TELEFONE DO LEAD'
            placeholder='Preencha aqui o telefone do lead...'
            value={infoHolder.telefone ?? ''}
            handleChange={(value) => updateInfoHolder({ telefone: formatToPhone(value) })}
            width='100%'
          />
          <SelectInputVirtualized
            label='ESTADO'
            value={infoHolder.uf ?? null}
            handleChange={(value) => updateInfoHolder({ uf: value, cidade: BrazilianCitiesOptionsFromUF(value)[0]?.value })}
            options={BrazilianStatesOptions}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => updateInfoHolder({ uf: null })}
            width='100%'
          />
          <SelectInputVirtualized
            label='CIDADE'
            value={infoHolder.cidade ?? null}
            handleChange={(value) => updateInfoHolder({ cidade: value })}
            options={BrazilianCitiesOptionsFromUF(infoHolder.uf ?? '')}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => updateInfoHolder({ cidade: null })}
            width='100%'
          />
          <SelectInput
            label='CANAL DE AQUISIÇÃO'
            value={infoHolder.canalAquisicao ?? null}
            handleChange={(value) => updateInfoHolder({ canalAquisicao: value })}
            options={CustomersAcquisitionChannels}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => updateInfoHolder({ canalAquisicao: 'PROSPECÇÃO ATIVA' })}
            width='100%'
          />
        </div>
      </div>
    ),
    [infoHolder.nome, infoHolder.telefone, infoHolder.canalAquisicao, updateInfoHolder]
  );
}

type QualificationBlockProps = {
  infoHolder: TLead;
  updateInfoHolder: (newInfo: Partial<TLead>) => void;
};
export function QualificationBlock({ infoHolder, updateInfoHolder }: QualificationBlockProps) {
  const { data: opportunityCreators } = useOpportunityCreators();
  return useMemo(
    () => (
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
          <Upload size={15} />
          <h1 className='text-xs tracking-tight font-medium text-start w-fit'>QUALIFICAÇÃO DO LEAD</h1>
        </div>
        <div className='w-full flex flex-col gap-3'>
          <SelectWithImages
            label='RESPONSÁVEL PELA QUALIFICAÇÃO'
            value={infoHolder.qualificacao.responsavel?.id ?? ''}
            options={
              opportunityCreators?.map((creator) => ({
                id: creator._id,
                value: creator._id,
                label: creator.nome,
                url: creator.avatar_url || undefined,
              })) || []
            }
            handleChange={(value) => {
              {
                const selectedUser = opportunityCreators?.find((creator) => creator._id === value);
                if (!selectedUser) return updateInfoHolder({ qualificacao: { ...infoHolder.qualificacao, responsavel: null } });
                return updateInfoHolder({
                  qualificacao: {
                    ...infoHolder.qualificacao,
                    responsavel: { id: selectedUser._id, nome: selectedUser.nome, avatar_url: selectedUser.avatar_url },
                  },
                });
              }
            }}
            onReset={() => updateInfoHolder({ qualificacao: { ...infoHolder.qualificacao, responsavel: null } })}
            resetOptionLabel='NÃO DEFINIDO'
            width='100%'
          />
        </div>
      </div>
    ),
    [infoHolder.qualificacao.responsavel, opportunityCreators, updateInfoHolder]
  );
}
