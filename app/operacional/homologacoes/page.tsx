import HomologationsControlPage from "@/app/components/Homologations/Page/HomologationPage";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import React from "react";

async function HomologationMainPage() {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	return <HomologationsControlPage session={session} />;
}

export default HomologationMainPage;
