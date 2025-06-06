import ServiceOrdersPage from "@/components/ServiceOrders/ServiceOrdersPage";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import React from "react";

async function ServiceOrderMainPage() {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	return <ServiceOrdersPage session={session} />;
}

export default ServiceOrderMainPage;
