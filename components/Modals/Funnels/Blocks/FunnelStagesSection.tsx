import { Layers } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import type { TFunnel } from "@/utils/schemas/funnel.schema";

type FunnelStagesSectionProps = {
	infoHolder: TFunnel;
	setInfoHolder: React.Dispatch<React.SetStateAction<TFunnel>>;
};

export default function FunnelStagesSection({ infoHolder, setInfoHolder }: FunnelStagesSectionProps) {
	const [stageHolder, setStageHolder] = useState("");

	function addStage() {
		if (stageHolder.trim().length < 3) return toast.error("Preencha um nome de ao menos 3 caracteres para a etapa.");
		const stageArrCopy = [...infoHolder.etapas];
		stageArrCopy.push({ id: infoHolder.etapas.length + 1, nome: stageHolder.trim().toUpperCase() });
		setInfoHolder((prev) => ({ ...prev, etapas: stageArrCopy }));
		setStageHolder("");
	}

	function removeStage(index: number) {
		const stageArrCopy = [...infoHolder.etapas];
		stageArrCopy.splice(index, 1);
		setInfoHolder((prev) => ({ ...prev, etapas: stageArrCopy }));
	}

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="ETAPAS DO FUNIL" sectionTitleIcon={<Layers className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="flex w-full items-end gap-2">
				<div className="flex-1">
					<TextInput
						label="NOME DA ETAPA"
						placeholder="Preencha o nome a ser dado a etapa do funil..."
						value={stageHolder}
						handleChange={(value) => setStageHolder(value)}
						width="100%"
					/>
				</div>
				<button
					type="button"
					onClick={addStage}
					className="whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					ADICIONAR
				</button>
			</div>
			<div className="flex w-full flex-col gap-2">
				{infoHolder.etapas.length > 0 ? (
					infoHolder.etapas.map((stage, index) => (
						<div key={stage.id} className="flex w-full items-center justify-between rounded-md border border-primary/30 p-2">
							<div className="flex grow items-center gap-1">
								<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
									<h1 className="text-sm font-bold">{index + 1}</h1>
								</div>
								<p className="text-sm font-medium leading-none tracking-tight">{stage.nome}</p>
							</div>
							<button
								onClick={() => removeStage(index)}
								type="button"
								className="flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
							>
								<MdDelete size={15} />
							</button>
						</div>
					))
				) : (
					<p className="w-full py-4 text-center text-sm italic text-primary/70">Sem etapas adicionadas...</p>
				)}
			</div>
		</ResponsiveDialogDrawerSection>
	);
}
