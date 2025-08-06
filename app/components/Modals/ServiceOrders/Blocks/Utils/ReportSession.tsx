import { formatDateAsLocale } from "@/lib/methods/formatting";
import { TServiceOrder } from "@/utils/schemas/service-order.schema";
import React from "react";
import { BsCalendarCheck, BsCheck, BsFiles } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { MdAttachFile } from "react-icons/md";

function getStatusTag(effectivationDate: string | null) {
	if (!effectivationDate) return <h1 className="rounded-md bg-gray-500 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">PENDENTE</h1>;

	return <h1 className="rounded-md bg-green-500 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">CONCLUÍDA</h1>;
}
type ReportSessionProps = {
	session: TServiceOrder["relatorio"]["secoes"][number];
};
function ReportSession({ session }: ReportSessionProps) {
	return (
		<div className="flex w-full flex-col gap-1 rounded border border-gray-500 p-3">
			<div className="flex w-full items-center gap-2">
				<h1 className="text-sm font-bold tracking-tight">{session.titulo}</h1>
				{getStatusTag(session.dataConclusao || null)}
				{session.dataConclusao ? (
					<div className={`flex items-center gap-1`}>
						<BsCalendarCheck color="rgb(34,197,94)" />
						<p className="text-xs font-medium text-gray-500">{formatDateAsLocale(session.dataConclusao, true)}</p>
					</div>
				) : null}
			</div>

			<div className="flex items-center gap-1">
				<FaListCheck size={12} />
				<p className="text-[0.65rem] font-medium text-gray-500">CONTROLES</p>
			</div>
			<div className="flex w-full flex-wrap gap-2">
				{session.controles.map((control, index) => (
					<div key={index} className="flex items-center gap-1 rounded border border-gray-500 bg-[#f8f8f8] px-2 py-1 text-center shadow-md">
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">{control.titulo}</p>
						<BsCheck color={"#000"} />
					</div>
				))}
			</div>
			<div className="flex items-center gap-1">
				<BsFiles size={12} />
				<p className="text-[0.65rem] font-medium text-gray-500">ARQUIVOS</p>
			</div>
			<div className="flex w-full flex-wrap gap-2">
				{session.arquivos.map((file, index) => (
					<div key={index} className="flex items-center gap-1 rounded border border-gray-500 bg-[#f8f8f8] px-2 py-1 text-center shadow-md">
						<p className="text-[0.6rem] font-medium leading-none tracking-tight">{file.titulo}</p>
						<MdAttachFile color={"#000"} />
					</div>
				))}
			</div>
		</div>
	);
}

export default ReportSession;
