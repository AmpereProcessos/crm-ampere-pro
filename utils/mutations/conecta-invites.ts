import type { TCreateConectaInviteRouteOutput } from "@/pages/api/conecta-invites";
import axios from "axios";

export async function createConectaInvite({ clientId }: { clientId: string }) {
	try {
		const { data }: { data: TCreateConectaInviteRouteOutput } =
			await axios.post("/api/conecta-invites", {
				clienteId: clientId,
			});
		return data;
	} catch (error) {
		console.log("Erro running createConectaInvite", error);
		throw error;
	}
}
