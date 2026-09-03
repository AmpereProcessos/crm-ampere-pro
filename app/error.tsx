"use client";

import { useEffect } from "react";
import ApplicationErrorPage from "@/components/utils/ApplicationErrorPage";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("Application error boundary:", error);
	}, [error]);

	return <ApplicationErrorPage reset={reset} />;
}
