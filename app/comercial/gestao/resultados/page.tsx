import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ManagementComercialResults from "./resultados";

export async function ManagementResults() {
	const session = await getValidCurrentSessionUncached();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	return <ManagementComercialResults session={session} />;
}
