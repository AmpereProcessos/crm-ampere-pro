"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

type ApplicationErrorPageProps = {
	reset: () => void;
};

export default function ApplicationErrorPage({ reset }: ApplicationErrorPageProps) {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 font-Raleway text-primary">
			<section className="w-full max-w-lg rounded-2xl border border-primary/20 bg-background p-8 text-center shadow-xl">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
					<AlertTriangle aria-hidden="true" className="h-7 w-7" />
				</div>
				<h1 className="mt-5 text-2xl font-semibold">Não foi possível carregar o CRM</h1>
				<p className="mt-3 text-sm leading-6 text-primary/70">
					Parece que um dos nossos serviços está temporariamente indisponível. Seus dados estão seguros. Aguarde alguns segundos e tente novamente.
				</p>
				<button
					type="button"
					onClick={reset}
					className="mx-auto mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
				>
					<RefreshCw aria-hidden="true" className="h-4 w-4" />
					Tentar novamente
				</button>
				<p className="mt-5 text-xs text-primary/50">Se o problema continuar, entre em contato com o suporte.</p>
			</section>
		</main>
	);
}
