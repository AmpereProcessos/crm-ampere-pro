import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import ServicesPage from "./services-page";

export default async function Services() {
	const session = await getCurrentSession();
	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	return <ServicesPage session={session} />;
}
