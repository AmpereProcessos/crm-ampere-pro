import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication } from "@/utils/api";
import { IKit } from "@/utils/models";
import { NextApiHandler } from "next";

import Inverters from "../../../utils/json-files/pvinverters.json";
import Modules from "../../../utils/json-files/pvmodules.json";
import { Collection } from "mongodb";
import { TKit } from "@/utils/schemas/kits.schema";
type GetResponse = {
	data: object;
};
const formatKits: NextApiHandler<GetResponse> = async (req, res) => {
	const Kits: any = [];
	const formattedKits = Kits.map((internalKit: any) => {
		var estruturas = [];
		var inversoresArr = [];
		var modulosArr = [];
		if (internalKit.carport == 1) estruturas.push("Carport");
		if (internalKit.ceramico == 1) estruturas.push("Cerâmico");
		if (internalKit.fibrocimento == 1) estruturas.push("Fibrocimento");
		if (internalKit.laje == 1) estruturas.push("Laje");
		if (internalKit.metalico == 1) estruturas.push("Metálico");
		if (internalKit.zipado == 1) estruturas.push("Zipado");
		if (internalKit.solo == 1) estruturas.push("Solo");
		if (internalKit["Sem estrutura"] == 1) estruturas.push("Sem estrutura");
		inversoresArr.push({
			id: Inverters.find((i) => i.modelo == internalKit.inversorUmModelo)?.id,
			fabricante: internalKit.inversorUmFabricante,
			modelo: internalKit.inversorUmModelo,
			qtde: internalKit.inversorUmQtde,
		});
		if (internalKit.inversorDoisModelo != "") {
			inversoresArr.push({
				id: Inverters.find((i) => i.modelo == internalKit.inversorDoisModelo)?.id,
				fabricante: internalKit.inversorDoisFabricante,
				modelo: internalKit.inversorDoisModelo,
				qtde: internalKit.inversorDoisQtde,
			});
		}
		if (internalKit.inversorTresModelo != "") {
			inversoresArr.push({
				id: Inverters.find((i) => i.modelo == internalKit.inversorTresModelo)?.id
					? Inverters.find((i) => i.modelo == internalKit.inversorTresModelo)?.id
					: "N/A",
				fabricante: internalKit.inversorTresFabricante,
				modelo: internalKit.inversorTresModelo,
				qtde: internalKit.inversorTresQtde,
			});
		}
		modulosArr.push({
			id: Modules.find((i) => i.modelo == internalKit.moduloModelo)?.id ? Modules.find((i) => i.modelo == internalKit.moduloModelo)?.id : "N/A",
			fabricante: internalKit.moduloFabricante,
			modelo: internalKit.moduloModelo,
			qtde: internalKit.moduloQtde,
			potencia: internalKit.moduloPot,
		});
		const obj = {
			nome: internalKit.Nome,
			categoria: "ON-GRID",
			topologia: internalKit.topologia == "tradicional" ? "INVERSOR" : "MICRO-INVERSOR",
			preco: typeof internalKit.preco == "string" ? Number(internalKit.preco.replace(",", ".")) : null,
			ativo: internalKit.ativo == 1 ? true : false,
			fornecedor: internalKit.fornecedor,
			estruturasCompativeis: estruturas,
			incluiEstrutura: internalKit.incluiEstrutura == 1 ? true : false,
			inversores: inversoresArr,
			modulos: modulosArr,
			dataInsercao: new Date().toISOString(),
			incluiTransformador: internalKit.incluiTransformador == 1 ? true : false,
		};
		return obj;
	});
	res.status(200).json({ data: formattedKits });
};
type PostResponse = {
	data: TKit[];
};
const queryKits: NextApiHandler<PostResponse> = async (req, res) => {
	await validateAuthentication(req, res);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TKit> = db.collection("kits");
	const { pipeline } = req.body;

	const arrOfKits = await collection.aggregate(pipeline).toArray();
	const formatted = arrOfKits.map((kit) => ({ ...kit, metodologia: kit.metodologia ? kit.metodologia[0] : null }));
	// @ts-ignore
	res.status(200).json({ data: formatted as TKit[] });
};

export default apiHandler({
	GET: formatKits,
	POST: queryKits,
});

// {
//   $match: {
//     $expr: {
//       $gt: [
//         {
//           $reduce: {
//             input: "$modulos",
//             initialValue: 0,
//             in: {
//               $add: [
//                 "$$value",
//                 {
//                   $multiply: ["$$this.potencia", "$$this.qtde"],
//                 },
//               ],
//             },
//           },
//         },
//         param, // seu parâmetro X aqui
//       ],
//     },
//   },
// },
