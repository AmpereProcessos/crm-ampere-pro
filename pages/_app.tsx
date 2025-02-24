import "@/styles/globals.css";
import type { AppProps } from "next/app";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps) {
	const queryClient = new QueryClient();

	return (
		<SessionProvider session={session}>
			<Head>
				<title>CRM Ampère</title>
			</Head>
			<QueryClientProvider client={queryClient}>
				<FullScreenWrapper>
					<Component {...pageProps} />
					<Toaster />
					{/* <Notifications /> */}
				</FullScreenWrapper>
				<ReactQueryDevtools initialIsOpen={true} />
			</QueryClientProvider>
		</SessionProvider>
	);
}
