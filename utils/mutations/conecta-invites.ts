import type { TCreateConectaInviteRouteOutput } from "@/app/api/conecta-invites/route";
import axios from "axios";

export async function createConectaInvite({ clientId }: { clientId: string }) {
	const { data }: { data: TCreateConectaInviteRouteOutput } = await axios.post("/api/conecta-invites", {
		clienteId: clientId,
	});
	return data;
}
