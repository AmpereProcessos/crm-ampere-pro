import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BiSolidCloudDownload } from "react-icons/bi";

import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import SelectInput from "@/components/Inputs/SelectInput";
import { uploadFile } from "@/lib/methods/firebase";
function renderInputText(file: File | null) {
	if (!file)
		return (
			<p className="text-sm1 mb-2 px-2 text-center text-gray-500 dark:text-gray-400">
				<span className="font-semibold">Clique para escolher um arquivo</span> ou o arraste para a àrea demarcada
			</p>
		);
	return <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>;
}

type DrawBlockProps = {
	infoHolder: TTechnicalAnalysisDTO;
	setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
	changes: object;
	setChanges: React.Dispatch<React.SetStateAction<object>>;
	updateAnalysis: (x: any) => void;
};
function DrawBlock({ infoHolder, setInfoHolder, changes, setChanges, updateAnalysis }: DrawBlockProps) {
	const [drawImageFile, setDrawImageFile] = useState<File | null>(null);
	const [previewImageURL, setPreviewImageURL] = useState<string | null>(null);
	function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
		if (!file) {
			setPreviewImageURL(null);
			setDrawImageFile(null);
			return;
		}
		const previewURL = URL.createObjectURL(file);
		setPreviewImageURL(previewURL);
		setDrawImageFile(file);
	}
	async function handleDrawImageUpload() {
		if (!drawImageFile) return toast.error("Favor, adicionar um arquivo.");
		const filePath = `/clientes/${infoHolder.nome}/desenhoVisitaTecnica-${new Date().toISOString()}`;
		const { url } = await uploadFile({ vinculationId: infoHolder._id, fileName: "desenho_da_analise_tecnica", file: drawImageFile });
		console.log("URL UPLOAD", url);
		setInfoHolder((prev) => ({ ...prev, desenho: { ...prev.desenho, url: url } }));
		setChanges((prev) => ({ ...prev, "desenho.url": url }));
		updateAnalysis({ "desenho.url": url });
	}
	return (
		<div className="mt-4 flex w-full flex-col">
			<div className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2">
				<h1 className="font-bold text-white">DESENHO</h1>
			</div>
			<div className="flex w-full flex-col">
				<div className="w-full self-center lg:w-1/2">
					<SelectInput
						label="TIPO DE DESENHO"
						width={"100%"}
						value={infoHolder.desenho.tipo}
						resetOptionLabel="NÃO DEFINIDO"
						options={[
							{
								id: 1,
								label: "SOLAR EDGE DESIGN",
								value: "SOLAR EDGE DESIGN",
							},
							{ id: 2, label: "REVIT 3D", value: "REVIT 3D" },
							{ id: 3, label: "AUTOCAD 2D", value: "AUTOCAD 2D" },
							{
								id: 4,
								label: "APENAS VIABILIDADE DE ESPAÇO",
								value: "APENAS VIABILIDADE DE ESPAÇO",
							},
						]}
						handleChange={(value) => {
							setInfoHolder((prev) => ({ ...prev, desenho: { ...prev.desenho, tipo: value } }));
							setChanges((prev) => ({ ...prev, "desenho.tipo": value }));
						}}
						onReset={() => setInfoHolder((prev) => ({ ...prev, desenho: { ...prev.desenho, tipo: null } }))}
					/>
				</div>
				<div className="mt-2 flex w-full flex-col">
					<h1 className="w-full rounded-tl-sm rounded-tr-sm bg-gray-500 p-1 text-center font-bold text-white">OBSERVAÇÕES</h1>
					<textarea
						placeholder="SEM OBSERVAÇÕES PREENCHIDAS..."
						value={infoHolder.desenho?.observacoes || ""}
						onChange={(e) => {
							setInfoHolder((prev) => ({
								...prev,
								desenho: prev.desenho ? { ...prev.desenho, observacoes: e.target.value } : { observacoes: e.target.value, itens: [] },
							}));
							setChanges((prev) => ({ ...prev, "desenho.observacoes": e.target.value }));
						}}
						className="min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-gray-100 p-3 text-center text-xs font-medium text-gray-600 outline-none"
					/>
				</div>
			</div>
			<div className="mt-2 flex w-full flex-col gap-2">
				{previewImageURL || infoHolder.desenho.url ? (
					<div className="flex w-full flex-col items-center gap-2">
						{previewImageURL && !infoHolder.desenho.url ? <h1 className="text-center font-bold leading-none tracking-tight">PREVIEW DA IMAGEM</h1> : null}
						{!!infoHolder.desenho.url ? <h1 className="text-center font-bold leading-none tracking-tight">IMAGEM</h1> : null}
						<div className="relative flex h-[300px] w-fit min-w-[300px] items-center justify-center rounded-[5%] border border-gray-500">
							{!!previewImageURL ? (
								<Image src={previewImageURL} fill={true} style={{ borderRadius: "5%" }} alt="DESENHO" />
							) : infoHolder.desenho.url ? (
								<Image src={infoHolder.desenho.url} fill={true} style={{ borderRadius: "5%" }} alt="DESENHO" />
							) : null}
						</div>
					</div>
				) : (
					<div className="flex h-[300px] w-full items-center justify-center">
						<p className="text-sm font-medium italic text-gray-500">Nenhuma imagem de desenho vinculada.</p>
					</div>
				)}
				<div className="relative flex w-full items-center justify-center">
					<label
						htmlFor="dropzone-file"
						className="dark:hover:bg-bray-800 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
					>
						<div className="flex flex-col items-center justify-center pb-6 pt-5 text-gray-800">
							<BiSolidCloudDownload color={"rgb(31,41,55)"} size={50} />

							{renderInputText(drawImageFile)}
						</div>
						<input onChange={(e) => handleFileInput(e)} id="dropzone-file" type="file" className="absolute h-full w-full opacity-0" accept=".png, .jpg" />
					</label>
				</div>
				<div className="mb-2 flex w-full items-center justify-end">
					<button onClick={handleDrawImageUpload} className="rounded border border-[#15599a] p-1 font-bold text-[#15599a] duration-300 ease-in-out hover:bg-[#15599a] hover:text-white">
						VINCULAR IMAGEM
					</button>
				</div>
			</div>
		</div>
	);
}

export default DrawBlock;
