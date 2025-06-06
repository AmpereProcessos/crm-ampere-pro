export const dynamic = "force-dynamic";

import ErrorComponent from "@/components/utils/ErrorComponent";
import { ObjectId } from "mongodb";
import React from "react";
import { fetchServiceOrderById } from "./queries";
import ReportPage from "@/app/components/ServiceOrders/ReportPage";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

async function ServiceOrderReportPage({ params }: { params: { id: string } }) {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	const orderId = params.id;
	if (!orderId || typeof orderId !== "string" || !ObjectId.isValid(orderId)) return <ErrorComponent msg="Oops, ID inválido." />;
	const order = await fetchServiceOrderById({ id: orderId });

	return <ReportPage order={order} user={session.user} />;
}

export default ServiceOrderReportPage;
