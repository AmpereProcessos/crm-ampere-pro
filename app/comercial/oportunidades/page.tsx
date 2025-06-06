import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import OpportunitiesMainPage from "./opportunities-main";
import { cookies } from "next/headers";

export default async function Opportunities() {
	const cookiesStore = await cookies();
	const intiailMode = cookiesStore.get("opportunities-page-mode")?.value || null;
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	return <OpportunitiesMainPage session={session} initialMode={intiailMode as "card" | "kanban" | null} />;
}
