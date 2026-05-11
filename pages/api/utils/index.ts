import { insertUtil, updateUtil } from "@/repositories/utils/mutations";
import {
  getAcquisitionChannels,
  getCreditors,
  getEquipments,
  getOpportunityLossReasons,
} from "@/repositories/utils/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import {
  GeneralUtilSchema,
  OpportunityLossReasonsSchema,
  type TUtil,
  UtilsIdentifierSchema,
} from "@/utils/schemas/utils";
import createHttpError from "http-errors";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type { NextApiHandler } from "next";

type GetResponse = {
  data: TUtil[];
};

const getUtilsRelated: NextApiHandler<GetResponse> = async (req, res) => {
  await validateAuthenticationWithSession(req, res);

  const { equipmentCategory } = req.query;
  const identifier = UtilsIdentifierSchema.parse(req.query.identifier);

  const db = await connectToDatabase();
  const collection: Collection<TUtil> = db.collection("utils");
  if (identifier === "CREDITOR") {
    const creditors = await getCreditors({ collection: collection });
    return res.status(200).json({ data: creditors });
  }

  if (identifier === "EQUIPMENT") {
    const categoryQuery: Filter<TUtil> =
      equipmentCategory && equipmentCategory !== "null" && equipmentCategory !== "undefined"
        ? { categoria: equipmentCategory }
        : {};
    const query = { ...categoryQuery };
    const equipments = await getEquipments({ collection: collection, query: query });
    return res.status(200).json({ data: equipments });
  }

  if (identifier === "ACQUISITION_CHANNEL") {
    const acquisitionChannels = await getAcquisitionChannels({ collection: collection });
    return res.status(200).json({ data: acquisitionChannels });
  }

  if (identifier === "OPPORTUNITY_LOSS_REASON") {
    const opportunityLossReasons = await getOpportunityLossReasons({ collection: collection });
    return res.status(200).json({ data: opportunityLossReasons });
  }

  return res.status(200).json({ data: [] });
};

type PostResponse = {
  data: { insertedId: string };
  message: string;
};

const createUtil: NextApiHandler<PostResponse> = async (req, res) => {
  await validateAuthenticationWithSession(req, res);
  const db = await connectToDatabase();
  const collection: Collection<TUtil> = db.collection("utils");
  const util = GeneralUtilSchema.parse(req.body);

  const insertResponse = await insertUtil({ collection: collection, info: util });
  if (!insertResponse.acknowledged)
    throw new createHttpError.InternalServerError(
      "Oops, houve um erro desconhecido ao inserir personalização.",
    );

  const insertedId = insertResponse.insertedId.toString();

  return res
    .status(201)
    .json({ data: { insertedId }, message: "Personalização criada com sucesso !" });
};

type PutResponse = {
  data: string;
  message: string;
};

const editUtil: NextApiHandler<PutResponse> = async (req, res) => {
  await validateAuthenticationWithSession(req, res);

  const { id } = req.query;
  if (!id || typeof id !== "string" || !ObjectId.isValid(id))
    throw new createHttpError.BadRequest("ID inválido.");

  const changes = OpportunityLossReasonsSchema.partial().parse(req.body);

  const db = await connectToDatabase();
  const collection: Collection<TUtil> = db.collection("utils");

  const updateResponse = await updateUtil({ collection: collection, id: id, changes: changes });
  if (!updateResponse.acknowledged)
    throw new createHttpError.InternalServerError(
      "Oops, houve um erro desconhecido ao atualizar personalização.",
    );
  if (updateResponse.matchedCount === 0)
    throw new createHttpError.NotFound("Personalização não encontrada.");

  return res
    .status(201)
    .json({ data: "Personalização atualizada com sucesso !", message: "Personalização atualizada com sucesso !" });
};

export default apiHandler({ GET: getUtilsRelated, POST: createUtil, PUT: editUtil });
