import { useSession } from "@/app/providers/SessionProvider";
import Funnels from "@/components/Configuration/Funnels";
import Integrations from "@/components/Configuration/Integrations";
import Partner from "@/components/Configuration/Partner";
import Partners from "@/components/Configuration/Partners";
import PaymentMethods from "@/components/Configuration/PaymentMethods";
import Personalization from "@/components/Configuration/Personalization";
import PricingMethods from "@/components/Configuration/PricingMethods";
import Profile from "@/components/Configuration/Profile";
import ProjectTypes from "@/components/Configuration/ProjectTypes";
import UserGroups from "@/components/Configuration/UserGroups";
import Users from "@/components/Configuration/Users";
import { Sidebar } from "@/components/Sidebar";
import LoadingPage from "@/components/utils/LoadingPage";
import type { NextPageContext } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Modes =
	| "profile"
	| "partner"
	| "users"
	| "user-groups"
	| "funnels"
	| "pricing-methods"
	| "payment-methods"
	| "integrations"
	| "project-types"
	| "partners"
	| "personalization";

function ConfigurationMain() {
	const router = useRouter();
	const { initialMode } = router.query;
	const { session, status } = useSession({ required: true });
	const [mode, setMode] = useState<Modes>((initialMode as Modes) || "profile");
	useEffect(() => {
		if (initialMode && typeof initialMode === "string") setMode(initialMode as Modes);
	}, [initialMode]);
	if (status !== "authenticated" || !session) return <LoadingPage />;
	return (
		<div className="flex h-full flex-col font-Inter md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden p-6">
				<div className="flex w-full flex-col border-b border-gray-300 px-6 pb-2">
					<h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
					<p className="text-[#71717A]">Gerencie configurações e preferências</p>
				</div>
				<div className="flex grow flex-col items-center gap-2 py-2 lg:flex-row">
					<div className="flex h-fit w-full flex-col gap-1 px-2 py-2 lg:h-full lg:w-1/5">
						<button
							type="button"
							onClick={() => setMode("profile")}
							className={`${
								mode === "profile" ? "bg-gray-100" : ""
							} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
						>
							Perfil
						</button>
						{session.user.permissoes.configuracoes.parceiro ? (
							<button
								type="button"
								onClick={() => setMode("partner")}
								className={`${
									mode === "partner" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Empresa
							</button>
						) : null}
						{session.user.permissoes.usuarios.visualizar ? (
							<button
								type="button"
								onClick={() => setMode("users")}
								className={`${
									mode === "users" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Usuários
							</button>
						) : null}
						{session.user.permissoes.configuracoes.gruposUsuarios ? (
							<button
								type="button"
								onClick={() => setMode("user-groups")}
								className={`${
									mode === "user-groups" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Grupos de usuários
							</button>
						) : null}
						{session.user.permissoes.configuracoes.tiposProjeto ? (
							<button
								type="button"
								onClick={() => setMode("project-types")}
								className={`${
									mode === "project-types" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Tipos de projeto
							</button>
						) : null}
						{session.user.permissoes.configuracoes.funis ? (
							<button
								type="button"
								onClick={() => setMode("funnels")}
								className={`${
									mode === "funnels" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Funis
							</button>
						) : null}
						{session.user.permissoes.precos.editar ? (
							<button
								type="button"
								onClick={() => setMode("pricing-methods")}
								className={`${
									mode === "pricing-methods" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Metodologias de precificação
							</button>
						) : null}
						{session.user.permissoes.precos.editar ? (
							<button
								type="button"
								onClick={() => setMode("payment-methods")}
								className={`${
									mode === "payment-methods" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Métodos de pagamento
							</button>
						) : null}
						{session.user.permissoes.parceiros.visualizar ? (
							<button
								type="button"
								onClick={() => setMode("partners")}
								className={`${
									mode === "partners" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Parceiros
							</button>
						) : null}
						{session.user.permissoes.configuracoes.parceiro ? (
							<button
								type="button"
								onClick={() => setMode("integrations")}
								className={`${
									mode === "integrations" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Integrações
							</button>
						) : null}
						{session.user.permissoes.configuracoes.parceiro ? (
							<button
								type="button"
								onClick={() => setMode("personalization")}
								className={`${
									mode === "personalization" ? "bg-gray-100" : ""
								} w-full rounded-md px-4 py-2 text-center text-xs font-semibold text-gray-600 duration-300 ease-in-out hover:bg-gray-100 lg:text-start lg:text-base`}
							>
								Personalizações
							</button>
						) : null}
					</div>
					<div className="flex h-full w-full flex-col gap-1 px-2 py-2 lg:w-4/5">
						{mode === "profile" ? <Profile session={session} /> : null}
						{mode === "partner" ? <Partner session={session} /> : null}
						{mode === "users" ? <Users session={session} /> : null}
						{mode === "user-groups" ? <UserGroups session={session} /> : null}
						{mode === "funnels" ? <Funnels session={session} /> : null}
						{mode === "pricing-methods" ? <PricingMethods session={session} /> : null}
						{mode === "payment-methods" ? <PaymentMethods session={session} /> : null}
						{mode === "partners" ? <Partners session={session} /> : null}
						{mode === "integrations" ? <Integrations session={session} /> : null}
						{mode === "project-types" ? <ProjectTypes session={session} /> : null}
						{mode === "personalization" ? <Personalization session={session} /> : null}
					</div>
				</div>
			</div>
		</div>
	);
}

ConfigurationMain.getInitialProps = ({ query }: NextPageContext) => {
	console.log("QUERY", query);
	// Retrieve the mode query parameter from the URL
	const { initialMode } = query;

	// Return the initialMode as a prop
	return { initialMode: initialMode as string | null };
};
export default ConfigurationMain;
