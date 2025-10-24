import CheckboxInput from "@/components/Inputs/CheckboxInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { TProject } from "@/utils/schemas/project.schema";
import { StructureTypes } from "@/utils/select-options";
import React from "react";
import toast from "react-hot-toast";

type StructureProps = {
	requestInfo: TProject;
	setRequestInfo: React.Dispatch<React.SetStateAction<TProject>>;
	goToNextState: () => void;
};
function Structure({ requestInfo, setRequestInfo, goToNextState }: StructureProps) {
	function validateAndProceed() {
		if (requestInfo.estruturaInstalacao.alteracao) {
			if (requestInfo.estruturaInstalacao.observacoes.trim().length < 5) return toast.error("Observações inválidas.");
		}
		return goToNextState();
	}
	return (
		<div className="flex w-full grow flex-col gap-2">
			<div className="flex w-full grow flex-col gap-2">
				<h1 className="w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-primary-foreground">ESTRUTURA DE INSTALAÇÃO</h1>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="TIPO DE ESTRUTURA"
							value={requestInfo.estruturaInstalacao.tipo}
							options={StructureTypes}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, estruturaInstalacao: { ...prev.estruturaInstalacao, tipo: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, estruturaInstalacao: { ...prev.estruturaInstalacao, tipo: "Fibrocimento" } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<SelectInput
							label="MATERIAL DA ESTRUTURA"
							value={requestInfo.estruturaInstalacao.material}
							options={[
								{ id: 1, label: "MADEIRA", value: "MADEIRA" },
								{ id: 2, label: "FERRO", value: "FERRO" },
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, estruturaInstalacao: { ...prev.estruturaInstalacao, material: value } }))}
							onReset={() => setRequestInfo((prev) => ({ ...prev, estruturaInstalacao: { ...prev.estruturaInstalacao, material: "MADEIRA" } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full items-center justify-center">
					<CheckboxInput
						labelFalse="NECESSÁRIO ADEQUAÇÕES"
						labelTrue="NECESSÁRIO ADEQUAÇÕES"
						checked={requestInfo.estruturaInstalacao.alteracao}
						handleChange={(value) => setRequestInfo((prev) => ({ ...prev, estruturaInstalacao: { ...prev.estruturaInstalacao, alteracao: value } }))}
						justify="justify-center"
					/>
				</div>
				{requestInfo.estruturaInstalacao.alteracao ? (
					<div className="flex w-full flex-col">
						<h1 className="w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-primary-foreground">OBSERVAÇÕES</h1>
						<textarea
							placeholder="SEM OBSERVAÇÕES PREENCHIDAS..."
							value={requestInfo.estruturaInstalacao.observacoes || ""}
							onChange={(e) => {
								setRequestInfo((prev) => ({
									...prev,
									estruturaInstalacao: { ...prev.estruturaInstalacao, observacoes: e.target.value },
								}));
							}}
							className="min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden"
						/>
					</div>
				) : null}
			</div>
			<div className="flex w-full items-center justify-end">
				<button
					onClick={() => validateAndProceed()}
					className="rounded bg-black px-4 py-1 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70"
				>
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default Structure;
