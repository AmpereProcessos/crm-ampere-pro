"use client";
import type React from "react";
import TanstackProvider from "./TanstackProvicer";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "./SessionProvider";

function ProvidersWrapper({ children }: { children: React.ReactNode }) {
	return (
		<TanstackProvider>
			<SessionProvider>
				<FullScreenWrapper>
					{children}
					<Toaster />
					{/* <Notifications /> */}
				</FullScreenWrapper>
				<ReactQueryDevtools initialIsOpen={true} />
			</SessionProvider>
		</TanstackProvider>
	);
}

export default ProvidersWrapper;
