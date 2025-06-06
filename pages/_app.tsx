import "@/styles/globals.css";
import type { AppProps } from "next/app";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "@/app/providers/SessionProvider";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
	const queryClient = new QueryClient();

	return (
		<>
			<Head>
				<title>CRM Ampère</title>
			</Head>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>
					<FullScreenWrapper>
						<Component {...pageProps} />
						<Toaster />
						{/* <Notifications /> */}
					</FullScreenWrapper>
				</SessionProvider>

				<ReactQueryDevtools initialIsOpen={true} />
			</QueryClientProvider>
		</>
	);
}
