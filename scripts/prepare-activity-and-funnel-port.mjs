import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');

const client = new MongoClient(process.env.MONGODB_URI, {
	serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

try {
	await client.connect();
	const db = client.db("crm");
	const activities = db.collection("activities");
	const funnels = db.collection("funnels");

	const activityBackfill = await activities.updateMany(
		{
			$or: [{ dataInicio: { $exists: false } }, { agendamentoInicio: { $exists: false } }, { agendamentoFim: { $exists: false } }],
		},
		[
			{
				$set: {
					dataInicio: { $ifNull: ["$dataInicio", null] },
					agendamentoInicio: { $ifNull: ["$agendamentoInicio", null] },
					agendamentoFim: { $ifNull: ["$agendamentoFim", null] },
				},
			},
		],
	);

	await activities.createIndexes([
		{ name: "activities_partner_completion_deadline", key: { idParceiro: 1, dataConclusao: 1, dataVencimento: 1 } },
		{ name: "activities_partner_schedule", key: { idParceiro: 1, agendamentoInicio: 1 } },
		{ name: "activities_partner_responsible_completion", key: { idParceiro: 1, "responsaveis.id": 1, dataConclusao: 1 } },
	]);

	const funnelsCursor = funnels.find({ etapas: { $type: "array", $ne: [] } });
	let normalizedFunnels = 0;
	for await (const funnel of funnelsCursor) {
		const stages = funnel.etapas;
		const hasInitial = stages.some((stage) => stage.estagioInicial === true);
		const hasFinal = stages.some((stage) => stage.estagioFinal === true);
		if (hasInitial && hasFinal) continue;
		await funnels.updateOne(
			{ _id: funnel._id },
			{
				$set: {
					etapas: stages.map((stage, index) => ({
						...stage,
						estagioInicial: hasInitial ? stage.estagioInicial === true : index === 0,
						estagioFinal: hasFinal ? stage.estagioFinal === true : index === stages.length - 1,
					})),
				},
			},
		);
		normalizedFunnels += 1;
	}

	console.log(
		JSON.stringify(
			{
				activitiesMatched: activityBackfill.matchedCount,
				activitiesModified: activityBackfill.modifiedCount,
				funnelsNormalized: normalizedFunnels,
			},
			null,
			2,
		),
	);
} finally {
	await client.close();
}
