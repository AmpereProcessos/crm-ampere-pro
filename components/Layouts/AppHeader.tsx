"use client";

import { getAppRouteMetadata } from "@/configs/app-routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { TUserSession } from "@/lib/auth/session";
import GlobalSearch from "./GlobalSearch";

export default function AppHeader({ session }: { session: TUserSession }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const metadata = getAppRouteMetadata(pathname || "");
  const redirectBackToParam = searchParams?.get("redirectBackTo");
  const redirectBackTo =
    redirectBackToParam?.startsWith("/") && !redirectBackToParam.startsWith("//")
      ? redirectBackToParam
      : null;

  return (
    <header className="flex w-full flex-col gap-1 border-b border-border pb-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="size-11 shrink-0 md:size-8" />
        {redirectBackTo ? (
          <Button variant="ghost" size="fit" asChild className="shrink-0 rounded-full px-2 py-2">
            <Link href={redirectBackTo} aria-label="Voltar">
              <ArrowLeft className="size-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          </Button>
        ) : null}
        <h1 className="min-w-0 truncate text-xl font-black uppercase leading-tight tracking-tight text-foreground md:text-2xl">
          {metadata.title}
        </h1>
        <div className="ml-auto">
          <GlobalSearch session={session} />
        </div>
      </div>
      <p className="max-w-[72ch] pl-[3.25rem] text-sm text-muted-foreground md:pl-10 leading-none">
        {metadata.description}
      </p>
    </header>
  );
}

export function AppHeaderSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse flex-col gap-2 border-b border-border pb-4"
      aria-hidden="true"
    >
      <div className="h-8 w-56 rounded-md bg-muted" />
      <div className="h-4 w-full max-w-md rounded-md bg-muted" />
    </div>
  );
}
