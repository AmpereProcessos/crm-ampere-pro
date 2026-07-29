import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import PlansPage from "./plans-page";

export default async function Plans() {
	const session = await getCurrentSession();
	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	return <PlansPage session={session} />;
}
