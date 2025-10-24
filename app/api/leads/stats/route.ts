import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, TUserSession } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { TLead } from "@/utils/schemas/leads.schema";
import dayjs from "dayjs";
import { Filter } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { GetLeadsStatsInputSchema } from "./input";

export type TGetLeadsStatsInput = z.infer<typeof GetLeadsStatsInputSchema>;

async function getLeadsStats({ input }: { input: TGetLeadsStatsInput; session: TUserSession }) {
	const { periodAfter, periodBefore, qualifiersIds } = input;

	const db = await connectToDatabase();
	const leadsCollection = db.collection<TLead>("leads");

	const afterDate = new Date(periodAfter);
	const beforeDate = new Date(periodBefore);

	const daysDiff = Math.abs(dayjs(beforeDate).diff(dayjs(afterDate), "day"));

	const afterWithMarginDate = new Date(dayjs(afterDate).subtract(daysDiff, "day").toISOString());
	const afterWithMarginDateStr = afterWithMarginDate.toISOString();
	const beforeWithMarginDate = new Date(dayjs(beforeDate).add(daysDiff, "day").toISOString());
	const beforeWithMarginDateStr = beforeWithMarginDate.toISOString();
	const match: Filter<TLead> = {
		$or: [
			{
				dataUltimoContato: { $gte: afterWithMarginDateStr, $lte: beforeWithMarginDateStr },
			},
			{
				"qualificacao.data": { $gte: afterWithMarginDateStr, $lte: beforeWithMarginDateStr },
			},
			{
				"conversao.data": { $gte: afterWithMarginDateStr, $lte: beforeWithMarginDateStr },
			},
		],
	};
	const leadsStatsResult = (await leadsCollection
		.aggregate([
			{
				$match: match,
			},
			{
				$group: {
					_id: {},
					contactsInPeriod: {
						$sum: {
							$cond: [
								{
									$and: [{ $gte: ["$dataUltimoContato", periodAfter] }, { $lte: ["$dataUltimoContato", periodBefore] }],
								},
								1,
								0,
							],
						},
					},
					contactsInPreviousPeriod: {
						$sum: {
							$cond: [{ $and: [{ $gte: ["$dataUltimoContato", afterWithMarginDateStr] }, { $lt: ["$dataUltimoContato", beforeWithMarginDateStr] }] }, 1, 0],
						},
					},
					qualificationsInPeriod: {
						$sum: {
							$cond: [{ $and: [{ $gte: ["$qualificacao.data", periodAfter] }, { $lte: ["$qualificacao.data", periodBefore] }] }, 1, 0],
						},
					},
					qualificationsInPreviousPeriod: {
						$sum: {
							$cond: [{ $and: [{ $gte: ["$qualificacao.data", afterWithMarginDateStr] }, { $lt: ["$qualificacao.data", beforeWithMarginDateStr] }] }, 1, 0],
						},
					},
					conversionsInPeriod: {
						$sum: {
							$cond: [{ $and: [{ $gte: ["$conversao.data", periodAfter] }, { $lte: ["$conversao.data", periodBefore] }] }, 1, 0],
						},
					},
					conversionsInPreviousPeriod: {
						$sum: {
							$cond: [{ $and: [{ $gte: ["$conversao.data", afterWithMarginDateStr] }, { $lt: ["$conversao.data", beforeWithMarginDateStr] }] }, 1, 0],
						},
					},
				},
			},
		])
		.toArray()) as {
		_id: {};
		contactsInPeriod: number;
		contactsInPreviousPeriod: number;
		qualificationsInPeriod: number;
		qualificationsInPreviousPeriod: number;
		conversionsInPeriod: number;
		conversionsInPreviousPeriod: number;
	}[];

	const [leadsStats] = leadsStatsResult;

	return {
		data: {
			contatos: {
				atual: leadsStats.contactsInPeriod,
				anterior: leadsStats.contactsInPreviousPeriod,
			},
			qualificacoes: {
				atual: leadsStats.qualificationsInPeriod,
				anterior: leadsStats.qualificationsInPreviousPeriod,
			},
			conversoes: {
				atual: leadsStats.conversionsInPeriod,
				anterior: leadsStats.conversionsInPreviousPeriod,
			},
		},
	};
}
export type TGetLeadsStatsRouteOutput = Awaited<ReturnType<typeof getLeadsStats>>;

const getLeadsStatsHandler = async (req: NextRequest) => {
	const sessionUser = await getValidCurrentSessionUncached();
	const queryParams = await req.nextUrl.searchParams;
	const input = GetLeadsStatsInputSchema.parse({
		periodAfter: queryParams.get("periodAfter"),
		periodBefore: queryParams.get("periodBefore"),
		qualifiersIds: queryParams.get("qualifiersIds"),
	});
	const result = await getLeadsStats({ input, session: sessionUser });
	return NextResponse.json(result);
};

export const GET = apiHandler({ GET: getLeadsStatsHandler });
