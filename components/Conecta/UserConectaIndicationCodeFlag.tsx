import type { TUserSession } from "@/lib/auth/session";
import { TSessionUser } from "@/utils/schemas/user.schema";
import { Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { copyToClipboard } from "@/lib/hooks";

type UserConectaIndicationCodeFlagProps = {
	code: TUserSession["user"]["codigoIndicacaoConecta"];
};
function UserConectaIndicationCodeFlag({ code }: UserConectaIndicationCodeFlagProps) {
	return (
		<Button
			onClick={async () => await copyToClipboard(code ? `${process.env.NEXT_PUBLIC_CONECTA_APP_URL}/seller-invites/code/${code}` : undefined)}
			variant="ghost"
			className="flex items-center gap-2 rounded-lg border-cyan-500 bg-cyan-100 p-1 text-cyan-500 hover:bg-cyan-200 hover:text-cyan-600"
			size={"fit"}
		>
			<Share2 className="h-4 w-4 min-w-4 min-h-4" />
			<p className="text-xs">COMPARTILHE SEU LINK DE INDICAÇÃO CONECTA</p>
		</Button>
	);
}

export default UserConectaIndicationCodeFlag;
