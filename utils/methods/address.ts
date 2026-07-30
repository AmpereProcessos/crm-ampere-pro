import axios from "axios";
import { toast } from "react-hot-toast";

type ViaCEPSuccessfulReturn = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};

export async function getCEPInfo(cep: string): Promise<ViaCEPSuccessfulReturn | null> {
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`);
    if (data.erro) throw new Error("CEP não encontrado.");
    return data;
  } catch {
    toast.error("Erro ao buscar informações a partir do CEP.");
    return null;
  }
}
