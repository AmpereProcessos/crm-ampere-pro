import { formatDecimalPlaces } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import type { TUser } from "@/utils/schemas/user.schema";
import type { AnyBulkWriteOperation } from "mongodb";
import type { NextApiHandler } from "next";

const handleGeneralFixing: NextApiHandler<any> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");

	const users = await usersCollection.find({ ativo: true, codigoIndicacaoConecta: null }).toArray();

	const bulkwriteUsers: AnyBulkWriteOperation<TUser>[] = users.map((u) => {
		const firstName = u.nome.split(" ")[0];
		const secondName = u.nome.split(" ")[1];

		const firstNameThreeLetters = firstName.slice(0, 3);
		const secondNameThreeLetters = secondName.slice(0, 3);

		const conectaIndicationCode = `${firstNameThreeLetters}${secondNameThreeLetters}`;
		const conectaIndicationCodeWithoutDiactritics = conectaIndicationCode.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		return {
			updateOne: {
				filter: { _id: u._id },
				update: {
					$set: {
						codigoIndicacaoConecta: conectaIndicationCodeWithoutDiactritics,
					},
				},
			},
		};
	});
	// const usersBulkwriteWithComission = users
	// 	.map((u) => {
	// 		const userComissionConfigWithoutUFV = u.comissionamento.filter((c) => c.tipoProjeto.id !== "6615785ddcb7a6e66ede9785");

	// 		const comissionData = userComissionsData.find((c) => c.nome === u.nome);
	// 		if (!comissionData) {
	// 			console.log(`Comissão não encontrada para o usuário ${u.nome}`);
	// 			return null;
	// 		}

	// 		const userIsSDR = u.idGrupo === "66562a2a812707dbf9f04833";
	// 		if (userIsSDR) {
	// 			userComissionConfigWithoutUFV.unshift({
	// 				tipoProjeto: {
	// 					id: "6615785ddcb7a6e66ede9785",
	// 					nome: "SISTEMA FOTOVOLTAICO",
	// 				},
	// 				papel: "SDR",
	// 				resultados: [
	// 					{
	// 						condicao: {
	// 							aplicavel: false,
	// 						},
	// 						formulaArr: ["[valor_venda]", "*", comissionData.comissaoComSDR.toString()],
	// 					},
	// 				],
	// 			});
	// 		} else {
	// 			userComissionConfigWithoutUFV.unshift({
	// 				tipoProjeto: {
	// 					id: "6615785ddcb7a6e66ede9785",
	// 					nome: "SISTEMA FOTOVOLTAICO",
	// 				},
	// 				papel: "VENDEDOR",
	// 				resultados: [
	// 					{
	// 						condicao: {
	// 							aplicavel: true,
	// 							variavel: "combinacao_responsaveis",
	// 							igual: "SDR + VENDEDOR",
	// 							tipo: "IGUAL_TEXTO",
	// 						},
	// 						formulaArr: ["[valor_venda]", "*", comissionData.comissaoComSDR.toString()],
	// 					},
	// 					{
	// 						condicao: {
	// 							aplicavel: false,
	// 						},
	// 						formulaArr: ["[valor_venda]", "*", comissionData.comissaoSemSDR.toString()],
	// 					},
	// 				],
	// 			});
	// 		}
	// 		return {
	// 			updateOne: {
	// 				filter: { _id: u._id },
	// 				update: { $set: { comissionamento: userComissionConfigWithoutUFV } },
	// 			},
	// 		};
	// 	})
	// 	.filter((u) => u !== null);

	const userBulkwriteResult = await usersCollection.bulkWrite(bulkwriteUsers);
	return res.status(200).json({
		userBulkwriteResult,
		message: "Código de indicação conecta fixado com sucesso",
	});
};

export default apiHandler({
	GET: handleGeneralFixing,
});
