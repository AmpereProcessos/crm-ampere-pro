import "@/styles/globals.css";
import type { Metadata } from "next";
import ProvidersWrapper from "./providers/ProvidersWrapper";

export const metadata: Metadata = {
	title: "CRM Ampère",
	description: "Bem vindo ao CRM Ampère !",
};
export default function RootLayout({
	// Layouts must accept a children prop.
	// This will be populated with nested layouts or pages
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<ProvidersWrapper>{children}</ProvidersWrapper>
			</body>
		</html>
	);
}
