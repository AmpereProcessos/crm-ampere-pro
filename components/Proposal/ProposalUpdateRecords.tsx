import { useProposalUpdateRecords } from '@/utils/queries/proposal-update-records';
import ProposalUpdateRecord from '../Cards/ProposalUpdateRecord';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type ProposalUpdateRecordsProps = {
  proposalId: string;
};
function ProposalUpdateRecords({ proposalId }: ProposalUpdateRecordsProps) {
  const { data: records, isLoading, isError, isSuccess } = useProposalUpdateRecords({ proposalId });
  return (
    <div className='mt-2 flex w-full flex-col gap-1 rounded-sm border border-primary/50 bg-background shadow-md'>
      <h1 className='w-full bg-yellow-500 p-2 text-center font-bold'>REGISTROS DE ALTERAÇÃO</h1>
      <div className='flex min-h-[50px] w-full flex-col gap-2 p-2'>
        {isLoading ? <LoadingComponent /> : null} {isError ? <ErrorComponent msg='Erro ao buscar registros de alteração.' /> : null}
        {isSuccess ? (
          records.length > 0 ? (
            records.map((record) => <ProposalUpdateRecord key={record._id} record={record} />)
          ) : (
            <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70'>
              Sem registros de alteração.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}

export default ProposalUpdateRecords;
