import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import KitsPage from "./kits-page";

export default async function Kits() {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	return <KitsPage session={session} />;
}
