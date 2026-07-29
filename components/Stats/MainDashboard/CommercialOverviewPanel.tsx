"use client";

import { ChartNoAxesCombined, Headphones, Trophy } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { SdrsRanking, SellerRanking } from "@/components/Stats/rankings/Rankings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommercialOverviewMode = "indicators" | "sellers" | "sdrs";
const OVERVIEW_MODES: CommercialOverviewMode[] = ["indicators", "sellers", "sdrs"];
const AUTO_ROTATE_MS = 10_000;

type CommercialOverviewPanelProps = {
	indicators: ReactNode;
};

export default function CommercialOverviewPanel({ indicators }: CommercialOverviewPanelProps) {
	const [mode, setMode] = useState<CommercialOverviewMode>("indicators");

	useEffect(() => {
		const currentIndex = OVERVIEW_MODES.indexOf(mode);
		const timeoutId = window.setTimeout(() => {
			setMode(OVERVIEW_MODES[(currentIndex + 1) % OVERVIEW_MODES.length] ?? "indicators");
		}, AUTO_ROTATE_MS);
		return () => window.clearTimeout(timeoutId);
	}, [mode]);

	return (
		<section className="flex min-h-[420px] w-full min-w-0 flex-col gap-3 rounded-xl border border-primary/20 bg-card px-3 py-4 shadow-xs lg:h-[500px] lg:min-h-0">
			<header className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-2">
				<div>
					<h2 className="text-xs font-semibold uppercase tracking-tight">Visão comercial</h2>
					<p className="text-[0.65rem] text-primary/55">
						{mode === "indicators" ? "Indicadores do período" : mode === "sellers" ? "Ranking de vendedores" : "Ranking de SDRs"}
					</p>
				</div>
				<fieldset className="flex items-center rounded-lg border border-primary/15 bg-primary/5 p-0.5" aria-label="Modo da visão comercial">
					<ModeButton active={mode === "indicators"} label="INDICADORES" onClick={() => setMode("indicators")}>
						<ChartNoAxesCombined className="h-3.5 w-3.5" />
					</ModeButton>
					<ModeButton active={mode === "sellers"} label="VENDEDORES" onClick={() => setMode("sellers")}>
						<Trophy className="h-3.5 w-3.5" />
					</ModeButton>
					<ModeButton active={mode === "sdrs"} label="SDRS" onClick={() => setMode("sdrs")}>
						<Headphones className="h-3.5 w-3.5" />
					</ModeButton>
				</fieldset>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto">
				{mode === "indicators" ? indicators : null}
				{mode === "sellers" ? <SellerRanking /> : null}
				{mode === "sdrs" ? <SdrsRanking /> : null}
			</div>
		</section>
	);
}

function ModeButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
	return (
		<Button
			type="button"
			size="xs"
			variant="ghost"
			aria-pressed={active}
			onClick={onClick}
			className={cn("h-7 gap-1.5 px-2 text-[0.65rem]", active && "bg-background text-foreground shadow-xs hover:bg-background")}
		>
			{children}
			<span>{label}</span>
		</Button>
	);
}
