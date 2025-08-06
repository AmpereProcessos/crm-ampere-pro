import React from "react";
import Link from "next/link";
import { formatDateAsLocale, formatDecimalPlaces } from "@/lib/methods/formatting";

import { BsCalendarCheck, BsCode, BsPatchCheck, BsPatchCheckFill, BsPatchExclamation } from "react-icons/bs";
import { FaBolt, FaCity } from "react-icons/fa";
import { MdDashboard, MdTimer } from "react-icons/md";
import { TFollowUpProject } from "@/pages/api/projects/follow-up";
import { getHoursDiff, getTimeFormattedTextFromHours } from "@/lib/methods/dates";
import { TbProgress } from "react-icons/tb";

function getStatusTag({ startDate, conclusionDate }: { startDate: string | null; conclusionDate: string | null }) {
	const isConcluded = !!startDate && !!conclusionDate;
	// In case it was not started, returning null
	if (!startDate) return null;

	// In case it is concluded, getting the amount of hours taken to finish it and rendering the tag
	if (isConcluded) {
		const hoursTaken = getHoursDiff({ start: startDate, finish: conclusionDate });

		return (
			<div className="flex items-center gap-1">
				<BsPatchCheck color="rgb(22,163,74)" />
				<h1 className="text-xs tracking-tight text-gray-500">
					CONCLUÍDO COM <strong className="text-green-600">{getTimeFormattedTextFromHours(hoursTaken).toUpperCase()}</strong>{" "}
				</h1>
			</div>
		);
	}
	// In case it is not concluded, showing the progress information
	const hoursTaken = getHoursDiff({ start: startDate, finish: new Date().toISOString() });
	return (
		<div className="flex items-center gap-1">
			<TbProgress color="rgb(234,88,12)" />
			<h1 className="text-xs tracking-tight text-gray-500">
				EM ANDAMENTO COM <strong className="text-orange-600">{getTimeFormattedTextFromHours(hoursTaken).toUpperCase()}</strong>
			</h1>
		</div>
	);
}

type ProjectFollowUpCardProps = {
	project: TFollowUpProject;
};
function ProjectFollowUpCard({ project }: ProjectFollowUpCardProps) {
	const startDate = project.contrato.dataAssinatura || null;
	const conclusionDate = project.processos.at(-1)?.data || null;
	return (
		<div className="flex w-full flex-col gap-2 rounded border border-gray-500 bg-[#fff] p-4 shadow-md">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-1">
					<div className="flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1">
						<MdDashboard size={12} />
					</div>
					<h1 className="text-sm font-black leading-none tracking-tight">{project.nome}</h1>
					{getStatusTag({ startDate, conclusionDate })}
				</div>
				<div className="flex items-center gap-2">
					<h1 className="rounded-full bg-gray-800 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">{project.indexador}</h1>
				</div>
			</div>
			<div className="flex w-full flex-wrap items-center gap-2">
				<div className="flex items-center gap-1">
					<MdDashboard />
					<h1 className="text-xs font-medium leading-none text-gray-500">{project.tipo}</h1>
				</div>
				<div className="flex items-center gap-1">
					<BsCode />
					{project.idProjetoCRM ? (
						<Link href={`/comercial/oportunidades/id/${project.idProjetoCRM}`}>
							<h1 className="text-xs font-medium tracking-tight text-gray-500 duration-300 ease-in-out hover:text-cyan-500">{project.identificador}</h1>
						</Link>
					) : (
						<h1 className="text-xs font-medium tracking-tight text-gray-500">{project.identificador}</h1>
					)}
				</div>
				<div className="flex items-center gap-1">
					<FaCity />
					<h1 className="text-xs font-medium leading-none text-gray-500">{project.cidade}</h1>
				</div>
				<div className="flex items-center gap-1">
					<FaBolt />
					<h1 className="text-xs font-medium leading-none text-gray-500">{formatDecimalPlaces(project.potenciaPico)} kWp</h1>
				</div>
			</div>
			<h1 className="w-full text-start text-xs font-medium">PROCESSOS</h1>
			<div className="flex w-full flex-wrap items-center gap-4">
				{project.processos.map((process, processIndex) => {
					if (process.concluido)
						return (
							<div key={processIndex} className="flex items-center gap-1 rounded-lg border border-green-600 bg-green-50 px-2 py-1 text-[0.57rem] font-medium">
								<h1 className="">{process.processo}</h1>
								<BsCalendarCheck color="rgb(22,163,7)" />
								<h1>{process.data && process.data != "-" ? formatDateAsLocale(process.data) : "N/A"}</h1>
							</div>
						);
					else
						return (
							<div key={processIndex} className="rounded-lg border border-gray-500 bg-gray-50 px-2 py-1 text-[0.57rem] font-medium">
								<h1>{process.processo}</h1>
							</div>
						);
				})}
			</div>
		</div>
	);
}

export default ProjectFollowUpCard;
