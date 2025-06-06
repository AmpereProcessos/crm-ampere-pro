import MainDashboardPage from "@/components/Stats/MainDashboard/MainDashboardPage";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	return <MainDashboardPage session={session} />;
}
