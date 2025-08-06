import { formatDateAsLocale } from "@/lib/methods/formatting";
import type { TCreditorDTO } from "@/utils/schemas/utils";
import React from "react";
import { BsCalendarPlus } from "react-icons/bs";
import { FaPiggyBank } from "react-icons/fa6";
import Avatar from "../utils/Avatar";

type CreditorUtilProps = {
	creditor: TCreditorDTO;
};
function CreditorUtil({ creditor }: CreditorUtilProps) {
	return (
		<div className="flex w-full flex-col rounded-md border border-gray-300 p-2">
			<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
				<div className="flex items-center gap-1">
					<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
						<FaPiggyBank />
					</div>
					<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{creditor.valor}</p>
				</div>
			</div>
			<div className="mt-2 flex w-full items-center justify-end gap-2">
				<div className="flex items-center gap-2">
					<div className={"flex items-center gap-1"}>
						<BsCalendarPlus />
						<p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(creditor.dataInsercao)}</p>
					</div>
					<div className="flex items-center gap-1">
						<Avatar fallback={"R"} url={creditor.autor.avatar_url || undefined} height={20} width={20} />
						<p className="text-[0.65rem] font-medium text-gray-500">{creditor.autor.nome}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CreditorUtil;
