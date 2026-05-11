import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { leadLoseJustification } from "@/utils/constants";
import { TUtil } from "@/utils/schemas/utils";
import { Collection } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();
  const collection: Collection<TUtil> = db.collection("utils");

  const utilsToInsert: TUtil[] = Object.entries(leadLoseJustification).map(([key, value]) => ({
    identificador: "OPPORTUNITY_LOSS_REASON",
    ativo: true,
    titulo: key,
    descricao: "",
  }));

  await collection.insertMany(utilsToInsert);

  return res.status(200).json({ message: "Razões de perda populadas com sucesso!" });
}
