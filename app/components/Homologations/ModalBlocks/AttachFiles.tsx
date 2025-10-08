import DocumentFileInput from "@/components/Inputs/DocumentFileInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { useFileReferences } from "@/utils/queries/file-references";
import type { TFileHolder } from "@/utils/schemas/file-reference.schema";
import { FileIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiFillFile } from "react-icons/ai";

type AttachFilesProps = {
	opportunityId?: string;
	files: TFileHolder;
	setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
};
function AttachFiles({ opportunityId, files, setFiles }: AttachFilesProps) {
	const { data: fileReferences } = useFileReferences({ opportunityId });
	const [personalizedFile, setPersonalizedFile] = useState<{
		titulo: string;
		arquivo: File | string | null;
	}>({
		titulo: "",
		arquivo: null,
	});
	function addFile({
		titulo,
		arquivo,
	}: { titulo: string; arquivo: File | string | null }) {
		if (titulo.trim().length < 3)
			return toast.error("Preencha um título de ao menos 3 caractéres.");
		if (!arquivo) return toast.error("Vincule o arquivo a ser anexado.");
		const fileTitle = titulo.toUpperCase();
		setFiles((prev) => ({ ...prev, [fileTitle]: arquivo }));
		return setPersonalizedFile({ titulo: "", arquivo: null });
	}

	return (
		<ResponsiveDialogDrawerSection
			sectionTitleText="ARQUIVOS"
			sectionTitleIcon={<FileIcon className="w-4 h-4 min-w-4 min-h-4" />}
		>
			<div className="flex w-full flex-col items-center justify-center gap-2">
				<div className="w-full lg:w-1/2">
					<DocumentFileInput
						label="ARQUIVO"
						value={personalizedFile.arquivo}
						handleChange={(value) =>
							setPersonalizedFile((prev) => ({ ...prev, arquivo: value }))
						}
						fileReferences={fileReferences ?? []}
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="TITULO DO ARQUIVO"
						placeholder="Digite o nome a ser dado ao arquivo..."
						value={personalizedFile.titulo}
						handleChange={(value) =>
							setPersonalizedFile((prev) => ({ ...prev, titulo: value }))
						}
						width="100%"
					/>
				</div>
				<button
					type="button"
					onClick={() => addFile(personalizedFile)}
					className="rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70"
				>
					ADICIONAR ARQUIVO
				</button>
			</div>
			<h1 className="mb-2 text-start font-Inter font-bold leading-none tracking-tight">
				ARQUIVOS A SEREM ANEXADOS
			</h1>
			<div className="flex w-full flex-wrap items-center justify-around gap-2">
				{Object.entries(files).length > 0 ? (
					Object.entries(files).map(([key, value], index) => (
						<div
							key={`${key}-${index.toString()}`}
							className="flex w-full flex-col rounded-md border border-cyan-500 p-3 lg:w-[350px]"
						>
							<div className="flex w-full items-center gap-2">
								<div className="text-lg text-primary">
									<AiFillFile />
								</div>
								<p className="text-sm font-bold leading-none tracking-tight text-primary/70">
									{key}
								</p>
							</div>
						</div>
					))
				) : (
					<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
						Nenhum arquivo anexado...
					</p>
				)}
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

export default AttachFiles;
