import ExpensesPage from "@/components/Expenses/ExpensesPage";
import LoadingPage from "@/components/utils/LoadingPage";
import React from "react";
import { useSession } from "@/app/providers/SessionProvider";

function MainExpensesPage() {
	const { session, status } = useSession({ required: true });

	if (status !== "authenticated") return <LoadingPage />;
	return <ExpensesPage session={session} />;
}

export default MainExpensesPage;
