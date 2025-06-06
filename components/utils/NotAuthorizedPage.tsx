import React from "react";
import { Sidebar } from "../Sidebar";
import type { TUserSession } from "@/lib/auth/session";

type NotAuthorizedPageProps = {
	session: TUserSession;
};
function NotAuthorizedPage({ session }: NotAuthorizedPageProps) {
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-[#f8f9fa] p-6">
				<p className="text-center text-lg font-medium text-gray-500">Oops, seu usuário não tem permissão para acessar essa área.</p>
			</div>
		</div>
	);
}

export default NotAuthorizedPage;
