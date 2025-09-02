import axios from 'axios';
import { TContractRequest } from '../schemas/contract-request.schema';
export async function createContractRequest({ info, returnId = false }: { info: TContractRequest; returnId?: boolean }) {
  try {
    const { data } = await axios.post('/api/integration/app-ampere/contract-requests', info);
    if (returnId) return data.data.insertedId as string;
    if (typeof data.message != 'string') return 'Solicitação de contrato criada com sucesso !';
    return data.message as string;
  } catch (error) {
    throw error;
  }
}
