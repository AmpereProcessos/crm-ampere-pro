import type {
	TAcquisitionChannel,
	TCreditor,
	TEquipment,
	TOpportunityLossReason,
	TUtil,
} from "@/utils/schemas/utils";
import type { Collection, Filter, WithId } from "mongodb";

type GetCreditorsParams = {
	collection: Collection<TUtil>;
};
export async function getCreditors({ collection }: GetCreditorsParams) {
	try {
		const creditors = await collection.find({ identificador: "CREDITOR" }).toArray();
		return creditors as WithId<TCreditor>[];
	} catch (error) {
		console.log("Error running getCreditors", error);
		throw error;
	}
}

type GetEquipments = {
	collection: Collection<TUtil>;
	query: Filter<TUtil>;
};
export async function getEquipments({ collection, query }: GetEquipments) {
	try {
		const equipments = await collection.find({ identificador: "EQUIPMENT", ...query }).toArray();
		return equipments as WithId<TEquipment>[];
	} catch (error) {
		console.log("Error running getEquipments", error);
		throw error;
	}
}
type GetAcquisitionChannelsParams = {
	collection: Collection<TUtil>;
};
export async function getAcquisitionChannels({ collection }: GetAcquisitionChannelsParams) {
	try {
		const acquisitionChannels = await collection.find({ identificador: "ACQUISITION_CHANNEL" }).toArray();
		return acquisitionChannels as WithId<TAcquisitionChannel>[];
	} catch (error) {
		console.log("Error running getAcquisitionChannels", error);
		throw error;
	}
}

type GetOpportunityLossReasonsParams = {
	collection: Collection<TUtil>;
};
export async function getOpportunityLossReasons({ collection }: GetOpportunityLossReasonsParams) {
	try {
		const opportunityLossReasons = await collection
			.find({ identificador: "OPPORTUNITY_LOSS_REASON" })
			.toArray();
		return opportunityLossReasons as WithId<TOpportunityLossReason>[];
	} catch (error) {
		console.log("Error running getOpportunityLossReasons", error);
		throw error;
	}
}
