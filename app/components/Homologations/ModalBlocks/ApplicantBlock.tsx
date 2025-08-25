import { formatNameAsInitials } from '@/lib/methods/formatting';
import { useUsers } from '@/utils/queries/users';
import { THomologation } from '@/utils/schemas/homologation.schema';
import React, { useState } from 'react';
import SelectWithImages from '../../../../components/Inputs/SelectWithImages';

type ApplicantBlockProps = {
  infoHolder: THomologation;
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};
function ApplicantBlock({ infoHolder, setInfoHolder }: ApplicantBlockProps) {
  const [applicantHolder, setApplicantHolder] = useState<string | null>(null);
  const { data: users, isLoading, isError, isSuccess } = useUsers();
  function handleSelect(selected: string) {
    const equivalentUser = users?.find((u) => u._id == selected);
    if (!equivalentUser) return;
    setInfoHolder((prev) => ({
      ...prev,
      requerente: {
        id: equivalentUser._id,
        nome: equivalentUser.nome,
        apelido: equivalentUser.nome,
        contato: equivalentUser.telefone || '',
        avatar_url: equivalentUser.avatar_url,
      },
    }));
  }
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>REQUERENTE</h1>
      <div className='flex w-full items-center justify-center'>
        <SelectWithImages
          label={'REQUERENTE'}
          editable={true}
          showLabel={false}
          value={infoHolder.requerente.id}
          options={
            users?.map((resp) => ({
              id: resp._id,
              label: resp.nome,
              value: resp._id,
              url: resp.avatar_url || undefined,
              fallback: formatNameAsInitials(resp.nome),
            })) || []
          }
          handleChange={(value) => handleSelect(value)}
          onReset={() => setApplicantHolder(null)}
          resetOptionLabel={'USUÁRIO NÃO DEFINIDO'}
        />
      </div>
    </div>
  );
}

export default ApplicantBlock;
