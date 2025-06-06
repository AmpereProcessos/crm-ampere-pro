import React from "react";

import Link from "next/link";
import FileReferenceCard from "@/components/FileReference/FileReferenceCard";
import { useFileReferencesByAnalysisId } from "@/utils/queries/file-references";
import AttachFileMenu from "../AttachFileMenu";
import type { TUserSession } from "@/lib/auth/session";

type FilesBlockProps = {
	auxiliarFilesLink?: string | null;
	analysisId: string;
	session: TUserSession;
};
function FilesBlock({ auxiliarFilesLink, analysisId, session }: FilesBlockProps) {
	const { data: fileReferences } = useFileReferencesByAnalysisId({ analysisId });
	return (
		<div className="mt-4 flex w-full flex-col">
			<div className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2">
				<h1 className="font-bold text-white">ARQUIVOS</h1>
			</div>
			<div className="flex w-full flex-col items-center">
				<h1 className="font-sans font-bold  text-[#353432]">LINK PARA ARQUIVOS AUXILIARES</h1>
				{auxiliarFilesLink ? (
					<Link href={auxiliarFilesLink}>
						<p className="font-raleway w-fit cursor-pointer self-center text-center text-sm font-medium text-blue-300 duration-300 ease-in-out hover:text-cyan-300">
							{auxiliarFilesLink}
						</p>
					</Link>
				) : (
					<p className="w-full py-2 text-center text-xs font-medium italic text-gray-500">Link não preenchido.</p>
				)}
			</div>
			<div className="mt-2 flex w-full flex-wrap justify-around gap-2">
				{fileReferences && fileReferences.length > 0 ? (
					fileReferences.map((file, index) => (
						<div key={index} className="w-full lg:w-[400px]">
							<FileReferenceCard info={file} />
						</div>
					))
				) : (
					<p className="w-full text-center text-xs font-medium italic text-gray-500">Nenhum arquivo adicionado.</p>
				)}
			</div>
			<div className="mt-2 w-full">
				<AttachFileMenu analysisId={analysisId} session={session} />
			</div>
		</div>
	);
}

export default FilesBlock;
