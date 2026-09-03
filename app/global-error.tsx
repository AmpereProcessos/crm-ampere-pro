"use client";

import { useEffect } from "react";
import ApplicationErrorPage from "@/components/utils/ApplicationErrorPage";

export default function GlobalErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("Global application error boundary:", error);
	}, [error]);

	return (
		<html lang="pt-BR">
			<body>
				<ApplicationErrorPage reset={reset} />
			</body>
		</html>
	);
}
