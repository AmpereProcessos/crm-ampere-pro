import { SessionProvider } from "@/app/providers/SessionProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps: { ...pageProps } }: AppProps) {
	const queryClient = new QueryClient();

	return (
		<>
			<Head>
				<title>CRM Ampère</title>
			</Head>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<FullScreenWrapper>
							<Component {...pageProps} />
							<Toaster />
						</FullScreenWrapper>
					</ThemeProvider>
				</SessionProvider>
				<ReactQueryDevtools initialIsOpen={true} />
			</QueryClientProvider>
		</>
	);
}
