import axios from "axios";

type CreateIntegrationRegisterParams = { client_id: string; client_secret: string };
export async function createRDStationIntegration({ client_id, client_secret }: CreateIntegrationRegisterParams) {
	try {
		const { data } = await axios.post("/api/integration/rd-station", { client_id, client_secret });
		const insertedId = data.data.insertedId as string;
		return insertedId;
	} catch (error) {
		throw error;
	}
}
