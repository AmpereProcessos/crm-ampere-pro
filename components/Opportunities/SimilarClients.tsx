import type { TSimilarClientSimplifiedDTO } from '@/utils/schemas/client.schema';
import { Link } from 'lucide-react';
import SimilarClient from '../Cards/SimilarClient';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type SimilarClientsProps = {
  clients: TSimilarClientSimplifiedDTO[];
  selectedClientId: string | null;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  handleSelectSimilarClient: (client: TSimilarClientSimplifiedDTO) => void;
};
function SimilarClients({ clients, selectedClientId, isSuccess, isLoading, isError, handleSelectSimilarClient }: SimilarClientsProps) {
  return (
    <div className='flex w-full grow flex-col gap-2 lg:pl-2 lg:border-l pl-0 border-l-0 border-t pt-2 lg:border-t-0 lg:pt-0 border-primary/20'>
      <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
        <Link size={15} />
        <h1 className='text-xs tracking-tight font-medium text-start w-fit'>CLIENTES SIMILARES</h1>
      </div>
      <div className='flex w-full grow flex-col gap-2 overflow-y-auto overscroll-y-auto p-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
        {isError ? <ErrorComponent msg='Erro ao buscar clientes similares...' /> : null}
        {isLoading ? <LoadingComponent /> : null}
        {isSuccess ? (
          clients && clients.length > 0 ? (
            clients.map((client) => (
              <SimilarClient
                key={client._id}
                client={client}
                selectedClientId={selectedClientId}
                handleSelectSimilarClient={handleSelectSimilarClient}
              />
            ))
          ) : (
            <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/50'>
              Nenhum cliente similar encontrado.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}

export default SimilarClients;
