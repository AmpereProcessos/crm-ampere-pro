import axios from "axios";
import { TUtil } from "../schemas/utils";

export async function createUtil({ info }: { info: TUtil }) {
  const { data } = await axios.post("/api/utils", info);
  if (typeof data.message != "string") return "Personalização criada com sucesso !";
  return data.message as string;
}

export async function editUtil({ id, changes }: { id: string; changes: Partial<TUtil> }) {
  const { data } = await axios.put(`/api/utils?id=${id}`, changes);
  if (typeof data.message != "string") return "Personalização atualizada com sucesso !";
  return data.message as string;
}
