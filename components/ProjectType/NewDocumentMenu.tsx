import { conditionsAlias, getConditionOptions, TDocumentationConditionData } from "@/utils/project-documentation/helpers";
import { TProjectType } from "@/utils/schemas/project-types.schema";
import { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import CheckboxInput from "../Inputs/CheckboxInput";
import SelectInput from "../Inputs/SelectInput";
import TextareaInput from "../Inputs/TextareaInput";
import TextInput from "../Inputs/TextInput";

type NewDocumentMenuProps = {
	addDocument: (document: TProjectType["documentacao"][number]) => void;
	closeMenu: () => void;
};
function NewDocumentMenu({ addDocument, closeMenu }: NewDocumentMenuProps) {
	const [newDocumentationHolder, setNewDocumentationHolder] = useState<TProjectType["documentacao"][number]>({
		obrigatorio: false,
		titulo: "",
		descricao: "",
		multiplo: false,
		condicao: {
			aplicavel: false,
			variavel: null,
			igual: null,
		},
	});

	return (
		<div className="flex w-[80%] flex-col gap-2 self-center rounded-md border border-primary/50 p-2 font-Inter">
			<div className="mb-4 flex w-full items-center justify-between">
				<h1 className="font-Inter font-black">NOVO DOCUMENTO</h1>
				<button
					onClick={() => closeMenu()}
					type="button"
					className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
				>
					<VscChromeClose style={{ color: "red" }} />
				</button>
			</div>
			<TextInput
				label="TÍTULO DO DOCUMENTO"
				value={newDocumentationHolder.titulo}
				placeholder="Preencha o título a ser dado ao campo de anexo..."
				handleChange={(value) => setNewDocumentationHolder((prev) => ({ ...prev, titulo: value }))}
				width="100%"
			/>
			<TextareaInput
				label="DESCRIÇÃO DO DOCUMENTO"
				value={newDocumentationHolder.descricao}
				placeholder="Preencha aqui uma descrição para a documentação em questão..."
				handleChange={(value) => setNewDocumentationHolder((prev) => ({ ...prev, descricao: value }))}
			/>
			<div className="my-2 flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="flex w-full items-center justify-center lg:w-1/2">
					<div className="w-fit">
						<CheckboxInput
							labelFalse="OBRIGATÓRIO"
							labelTrue="OBRIGATÓRIO"
							checked={newDocumentationHolder.obrigatorio}
							handleChange={(value) => setNewDocumentationHolder((prev) => ({ ...prev, obrigatorio: value }))}
							justify="justify-center"
						/>
					</div>
				</div>
				<div className="flex w-full items-center justify-center lg:w-1/2">
					<div className="w-fit">
						<CheckboxInput
							labelFalse="PERMITIR MÚLTIPLOS ARQUIVOS"
							labelTrue="PERMITIR MÚLTIPLOS ARQUIVOS"
							checked={newDocumentationHolder.multiplo}
							handleChange={(value) => setNewDocumentationHolder((prev) => ({ ...prev, multiplo: value }))}
							justify="justify-center"
						/>
					</div>
				</div>
			</div>
			<h1 className="mt-4 w-full text-center font-Inter text-sm font-black leading-none tracking-tight">CONDIÇÃO DE OBRIGATORIEDADE</h1>
			<p className="my-2 text-center text-sm tracking-tight text-primary/70">Se aplicável, defina uma condição para obrigatoriedade do documento em questão.</p>
			<div className="flex w-full items-center justify-center">
				<div className="w-fit">
					<CheckboxInput
						labelFalse="APLICAR CONDIÇÃO"
						labelTrue="APLICAR CONDIÇÃO"
						checked={newDocumentationHolder.condicao.aplicavel}
						handleChange={(value) => setNewDocumentationHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, aplicavel: value } }))}
						justify="justify-center"
					/>
				</div>
			</div>
			{newDocumentationHolder.condicao.aplicavel ? (
				<div className="flex w-full flex-col">
					<div className="my-2 flex flex-wrap items-center gap-2">
						{conditionsAlias.map((va, index) => (
							<button
								key={index}
								onClick={() => setNewDocumentationHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, variavel: va.value, igual: null } }))}
								className={`grow ${
									va.value == newDocumentationHolder.condicao.variavel ? "bg-primary/70  text-primary-foreground" : "text-primary/70 "
								} rounded border border-primary/70  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-primary/70  hover:text-primary-foreground`}
							>
								{va.label}
							</button>
						))}
					</div>
					<SelectInput
						label="IGUAL A:"
						value={newDocumentationHolder.condicao.igual}
						options={getConditionOptions({
							variable: newDocumentationHolder.condicao.variavel as keyof TDocumentationConditionData,
						})}
						handleChange={(value) => setNewDocumentationHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, igual: value } }))}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => setNewDocumentationHolder((prev) => ({ ...prev, condicao: { ...prev.condicao, igual: null } }))}
						width="100%"
					/>
				</div>
			) : null}
			<div className="my-2 flex items-center justify-end gap-2">
				<button
					onClick={() => addDocument(newDocumentationHolder)}
					className="rounded bg-blue-600 p-1 px-4 text-xs font-medium text-primary-foreground duration-300 ease-in-out hover:bg-blue-800"
				>
					CADASTRAR DOCUMENTO
				</button>
			</div>
		</div>
	);
}

export default NewDocumentMenu;
