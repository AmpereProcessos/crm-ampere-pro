import type { TUserSession } from "@/lib/auth/session";

type NotAuthorizedPageProps = {
	session: TUserSession;
};
function NotAuthorizedPage({ session: _session }: NotAuthorizedPageProps) {
	return (
		<div className="flex min-h-64 w-full flex-col items-center justify-center">
			<p className="max-w-[52ch] text-center text-base font-medium text-muted-foreground">Seu usuário não tem permissão para acessar esta área.</p>
		</div>
	);
}

export default NotAuthorizedPage;
