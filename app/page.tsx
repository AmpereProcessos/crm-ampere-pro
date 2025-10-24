export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import MainDashboardPage from "@/components/Stats/MainDashboard/MainDashboardPage";
import { getCurrentSession } from "@/lib/auth/session";

export default async function Home() {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	console.log({ session: session.session, user: session.user });
	return <MainDashboardPage session={session} />;
}
