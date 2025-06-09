import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { ObjectId } from "mongodb";
import type { NextApiHandler } from "next";

// Função utilitária para fazer delay entre batches
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Tipo para as oportunidades com _id incluído
type OpportunityWithId = TOpportunity & { _id: ObjectId };

// Função para processar oportunidades em batches com rate limiting
const processBatchWithRateLimit = async (opportunities: OpportunityWithId[], batchSize = 15) => {
	const results = [];

	for (let i = 0; i < opportunities.length; i += batchSize) {
		const batch = opportunities.slice(i, i + batchSize);

		console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(opportunities.length / batchSize)} (${batch.length} opportunities)`);

		// Processa o batch atual em paralelo
		const batchPromises = batch.map(async (opportunity) => {
			try {
				console.log(`Creating topic for opportunity ${opportunity.identificador}`);
				const result = await novu.topics.subscriptions.create(
					{
						subscriberIds: opportunity.responsaveis.map((responsavel) => responsavel.id),
					},
					`opportunity:${opportunity._id.toString()}`,
				);
				return { success: true, opportunityId: opportunity._id, result };
			} catch (error) {
				console.error(`Error creating topic for opportunity ${opportunity.identificador}:`, error);
				return { success: false, opportunityId: opportunity._id, error };
			}
		});

		// Aguarda todas as requisições do batch atual
		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults);

		// Delay entre batches para respeitar o rate limit (15 requests por batch, aguarda 1 segundo)
		// Isso garante que não passemos de 20 RPS
		if (i + batchSize < opportunities.length) {
			console.log("Waiting 1 second before next batch to respect rate limit...");
			await sleep(1000);
		}
	}

	return results;
};

const handleGeneralFixing: NextApiHandler<any> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const db = await connectToDatabase();
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const opportunities = await opportunitiesCollection
		.find({ _id: { $gte: new ObjectId("66fad90a7dfddca405955612") } }, { projection: { _id: 1, identificador: 1, nome: true, responsaveis: true } })
		.toArray();

	console.log(`Found ${opportunities.length} opportunities to process`);

	const results = await processBatchWithRateLimit(opportunities);

	const successCount = results.filter((r) => r.success).length;
	const errorCount = results.filter((r) => !r.success).length;

	console.log(`Processing completed: ${successCount} successful, ${errorCount} errors`);

	return res.status(200).json({
		message: "Topics creation process completed!",
		summary: {
			total: opportunities.length,
			successful: successCount,
			errors: errorCount,
		},
		results: results,
	});
};

export default apiHandler({
	GET: handleGeneralFixing,
});
