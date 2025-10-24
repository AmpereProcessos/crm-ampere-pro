"use client";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type React from "react";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "./SessionProvider";
import TanstackProvider from "./TanstackProvicer";
import { ThemeProvider } from "./ThemeProvider";

function ProvidersWrapper({ children }: { children: React.ReactNode }) {
	return (
		<TanstackProvider>
			<SessionProvider>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<FullScreenWrapper>
						{children}
						<Toaster />
						{/* <Notifications /> */}
					</FullScreenWrapper>
					<ReactQueryDevtools initialIsOpen={true} />
				</ThemeProvider>
			</SessionProvider>
		</TanstackProvider>
	);
}

export default ProvidersWrapper;
