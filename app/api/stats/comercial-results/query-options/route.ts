import { getPartnersSimplified } from "@/repositories/partner-simplified/query";
import { getProjectTypesSimplified } from "@/repositories/project-type/queries";
import { getSalePromoters } from "@/repositories/users/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import type { TPartner, TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";
import type { TProjectType, TProjectTypeDTOSimplified } from "@/utils/schemas/project-types.schema";
import type { TUser, TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
import type { Collection, Filter } from "mongodb";
import createHttpError from "http-errors";
import { NextResponse } from "next/server";

export type TComercialResultsQueryFiltersOptions = {
	salePromoters: TUserDTOWithSaleGoals[];
	partners: TPartnerSimplifiedDTO[];
	projectTypes: TProjectTypeDTOSimplified[];
};

type GetResponse = {
	data: TComercialResultsQueryFiltersOptions;
	message: string;
};

async function getQueryOptions() {
	try {
		const { user } = await getValidCurrentSessionUncached();
		const parterScope = user.permissoes.parceiros.escopo;
		const partnerQuery = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

		const db = await connectToDatabase();
		const usersCollection: Collection<TUser> = db.collection("users");
		const partnersCollection: Collection<TPartner> = db.collection("partners");
		const projectTypesCollection: Collection<TProjectType> = db.collection("project-types");

		const salePromoters = await getSalePromoters({ collection: usersCollection, query: partnerQuery as Filter<TUser> });
		const partners = await getPartnersSimplified({ collection: partnersCollection, query: partnerQuery as Filter<TPartner> });
		const projectTypes = await getProjectTypesSimplified({ collection: projectTypesCollection, query: partnerQuery });

		const options = {
			salePromoters: salePromoters.map((s) => ({ ...s, _id: s._id.toString() })),
			partners: partners.map((p) => ({ ...p, _id: p._id.toString() })),
			projectTypes: projectTypes.map((p) => ({ ...p, _id: p._id.toString() })),
		};

		return NextResponse.json({
			data: options,
			message: "Opções de filtro recuperadas com sucesso",
		});
	} catch (error) {
		throw createHttpError(500, `Erro ao buscar opções de filtro: ${error}`);
	}
}

// Tipos exportados para uso no frontend
export type TComercialResultsQueryOptionsResponse = UnwrapNextResponse<Awaited<ReturnType<typeof getQueryOptions>>>;
export const GET = apiHandler({ GET: getQueryOptions });
