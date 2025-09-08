import { apiHandler } from "@/lib/api";
import {
	type TUserSession,
	getValidCurrentSessionUncached,
} from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import dayjs from "dayjs";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";

const GetSDRRankingQueryParams = z.object({
	type: z.enum(["current-month", "current-semester", "current-year"], {
		required_error: "Tipo de ranking é obrigatório",
		invalid_type_error: "Tipo de ranking inválido",
	}),
	rankBy: z.enum(
		[
			"opportunities-created-qty",
			"opportunities-won-qty",
			"opportunities-send-qty",
		],
		{
			required_error: "Tipo de ranking é obrigatório",
			invalid_type_error: "Tipo de ranking inválido",
		},
	),
});

export type TGetSDRRankingInput = z.infer<typeof GetSDRRankingQueryParams>;

type TOpportunityReduced = {
	[key: string]: {
		created: number;
		won: number;
		send: number;
	};
};
async function getSDRRanking(
	input: TGetSDRRankingInput,
	session: TUserSession,
) {
	const currentDate = dayjs();
	const currentMonth = currentDate.month();
	const currentSemesterMonthStart = currentMonth < 6 ? 0 : 6;

	const PERIOD_MAP = {
		"current-month": {
			startDate: currentDate.startOf("month").subtract(3, "hours").toDate(),
			endDate: currentDate.endOf("month").subtract(3, "hours").toDate(),
		},
		"current-semester": {
			startDate: currentDate
				.set("month", currentSemesterMonthStart)
				.startOf("month")
				.toDate(),
			endDate: currentDate
				.set("month", currentSemesterMonthStart + 5)
				.endOf("month")
				.subtract(3, "hours") // Fixing timezone issue
				.toDate(),
		},
		"current-year": {
			startDate: currentDate.startOf("year").subtract(3, "hours").toDate(),
			endDate: currentDate.endOf("year").subtract(3, "hours").toDate(),
		},
	};

	const crmDb = await connectToDatabase();
	const crmCollection = crmDb.collection<TUser>("users");
	const opportunitiesCollection =
		crmDb.collection<TOpportunity>("opportunities");

	const { startDate, endDate } = PERIOD_MAP[input.type];

	const users = await crmCollection
		.find(
			{},
			{
				projection: {
					nome: 1,
					avatar_url: 1,
				},
			},
		)
		.toArray();

	const opportunities = await opportunitiesCollection
		.find(
			{
				$or: [
					{
						$and: [
							{
								"responsaveis.dataInsercao": { $gte: startDate.toISOString() },
							},
							{ "responsaveis.dataInsercao": { $lte: endDate.toISOString() } },
						],
					},
					{
						$and: [
							{ dataInsercao: { $gte: startDate.toISOString() } },
							{ dataInsercao: { $lte: endDate.toISOString() } },
						],
					},
					{
						$and: [
							{ "ganho.data": { $gte: startDate.toISOString() } },
							{ "ganho.data": { $lte: endDate.toISOString() } },
						],
					},
				],
				dataExclusao: null,
			},
			{
				projection: {
					ganho: 1,
					responsaveis: 1,
					dataInsercao: 1,
				},
			},
		)
		.toArray();

	const reducedOpportunities = opportunities.reduce(
		(acc: TOpportunityReduced, opportunity) => {
			const insertionDate = new Date(opportunity.dataInsercao);
			const winDate = opportunity.ganho?.data
				? new Date(opportunity.ganho.data)
				: null;

			const sdr = opportunity.responsaveis.find(
				(responsavel) => responsavel.papel === "SDR",
			);
			if (!sdr) return acc;
			const seller = opportunity.responsaveis.find(
				(responsavel) => responsavel.papel === "VENDEDOR",
			);

			const isTransfer = !!sdr && !!seller;
			const transferDate =
				isTransfer && seller?.dataInsercao
					? new Date(seller.dataInsercao)
					: null;

			const isInsertedWithinPeriod =
				insertionDate >= startDate && insertionDate <= endDate;
			const isWonWithinPeriod =
				winDate && winDate >= startDate && winDate <= endDate;
			const isSentWithinPeriod =
				!!sdr &&
				!!transferDate &&
				transferDate >= startDate &&
				transferDate <= endDate;

			if (!acc[sdr.id]) acc[sdr.id] = { created: 0, won: 0, send: 0 };

			if (isSentWithinPeriod) acc[sdr.id].send++;
			if (isInsertedWithinPeriod) acc[sdr.id].created++;
			if (isWonWithinPeriod) acc[sdr.id].won++;

			return acc;
		},
		{},
	);

	const ranking = Object.entries(reducedOpportunities)
		.sort((a, b) => {
			const [sdrIdA, { created: createdA, won: wonA, send: sendA }] = a;
			const [sdrIdB, { created: createdB, won: wonB, send: sendB }] = b;

			if (input.rankBy === "opportunities-created-qty")
				return createdB - createdA;
			if (input.rankBy === "opportunities-won-qty") return wonB - wonA;
			if (input.rankBy === "opportunities-send-qty") return sendB - sendA;

			return 0;
		})
		.map(([sdrId, { created, won, send }], index) => {
			const user = users.find((user) => user._id.toString() === sdrId);

			const valueMap = {
				"opportunities-created-qty": created,
				"opportunities-won-qty": won,
				"opportunities-send-qty": send,
			};

			const value = valueMap[input.rankBy];

			return {
				index: index + 1,
				name: user?.nome || "N/A",
				avatar: user?.avatar_url || undefined,
				value,
			};
		})
		.filter(Boolean);

	return {
		data: ranking,
	};
}
export type TGetSDRRankingOutput = Awaited<ReturnType<typeof getSDRRanking>>;

const getSDRRankingHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();

	const queryParams = await req.nextUrl.searchParams;
	const input = GetSDRRankingQueryParams.parse({
		type: queryParams.get("type"),
		rankBy: queryParams.get("rankBy"),
	});
	const result = await getSDRRanking(input, session);
	return NextResponse.json(result);
};

export const GET = apiHandler({
	GET: getSDRRankingHandler,
});
