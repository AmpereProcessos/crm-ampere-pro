import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { structureTypes } from "@/utils/constants";
import { TContractRequest } from "@/utils/schemas//contract-request.schema";
import React from "react";
import { toast } from "react-hot-toast";

type StructureInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function StructureInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage }: StructureInfoProps) {
	function validateFields() {
		if (!requestInfo.tipoEstrutura) {
			toast.error("Por favor, preencha o tipo da estrutura");
			return false;
		}
		if (!requestInfo.materialEstrutura) {
			toast.error("Por favor, preencha sobre o material da estrutura.");
			return false;
		}
		if (!requestInfo.estruturaAmpere) {
			toast.error("Por favor, preencha sobre a necessidade de adequações ou construção de estrutura.");
			return false;
		}
		if (requestInfo.estruturaAmpere == "SIM" && requestInfo.responsavelEstrutura == "NÃO SE APLICA") {
			toast.error("Por favor, preencha o responsável pela construção/adequações de estrutura.");
			return false;
		}
		if (requestInfo.responsavelEstrutura != "NÃO SE APLICA" && requestInfo.formaPagamentoEstrutura == "NÃO DEFINIDO") {
			toast.error("Por favor, preencha uma forma de pagamento válida.");
			return false;
		}
		if (
			requestInfo.responsavelEstrutura != "AMPERE" &&
			requestInfo.estruturaAmpere == "SIM" &&
			(requestInfo.valorEstrutura == null || requestInfo.valorEstrutura == 0)
		) {
			toast.error("Por favor, preencha o valor da estrutura");
			return false;
		}

		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-background pb-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DA ESTRUTURA DE MONTAGEM</span>
			<div className="flex w-full grow flex-col items-center gap-2">
				<div className="grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
					<SelectInput
						label={"TIPO DA ESTRUTURA"}
						editable={true}
						options={structureTypes.map((type, index) => {
							return {
								id: index + 1,
								label: type.label,
								value: type.value,
							};
						})}
						value={requestInfo.tipoEstrutura}
						handleChange={(value) => setRequestInfo({ ...requestInfo, tipoEstrutura: value })}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setRequestInfo((prev) => ({ ...prev, tipoEstrutura: "" }));
						}}
						width="100%"
					/>
					<SelectInput
						label={"MATERIAL DA ESTRUTURA"}
						editable={true}
						options={[
							{ id: 1, label: "MADEIRA", value: "MADEIRA" },
							{ id: 2, label: "FERRO", value: "FERRO" },
						]}
						value={requestInfo.materialEstrutura}
						handleChange={(value) => setRequestInfo({ ...requestInfo, materialEstrutura: value })}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => setRequestInfo((prev) => ({ ...prev, materialEstrutura: null }))}
						width="100%"
					/>
				</div>
				<div className="grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1">
					<SelectInput
						label={"INCLUSO VENDA DE NOVA (OU ADEQUAÇÃO) DE ESTRUTURA"}
						editable={true}
						options={[
							{
								id: 1,
								label: "NÃO",
								value: "NÃO",
							},
							{
								id: 2,
								label: "SIM",
								value: "SIM",
							},
						]}
						value={requestInfo.estruturaAmpere}
						handleChange={(value) => setRequestInfo({ ...requestInfo, estruturaAmpere: value })}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setRequestInfo((prev) => ({
								...prev,
								estruturaAmpere: "NÃO",
							}));
						}}
						width="100%"
					/>
					<SelectInput
						label={"RESPONSÁVEL PELA ESTRUTURA"}
						editable={true}
						options={[
							{
								id: 1,
								label: "AMPERE",
								value: "AMPERE",
							},
							{
								id: 2,
								label: "CLIENTE",
								value: "CLIENTE",
							},
							{
								id: 3,
								label: "NÃO SE APLICA",
								value: "NÃO SE APLICA",
							},
						]}
						value={requestInfo.responsavelEstrutura}
						handleChange={(value) => setRequestInfo({ ...requestInfo, responsavelEstrutura: value })}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() =>
							setRequestInfo((prev) => ({
								...prev,
								responsavelEstrutura: "NÃO SE APLICA",
							}))
						}
						width="100%"
					/>
				</div>
				{requestInfo.responsavelEstrutura && requestInfo.responsavelEstrutura != "NÃO SE APLICA" && (
					<>
						<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">PAGAMENTO DA ESTRUTURA</h1>
						<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
							<SelectInput
								label={"FORMA DE PAGAMENTO"}
								editable={true}
								options={[
									{
										id: 1,
										label: "INCLUSO NO FINANCIAMENTO",
										value: "INCLUSO NO FINANCIAMENTO",
									},
									{
										id: 2,
										label: "DIRETO PRO FORNECEDOR",
										value: "DIRETO PRO FORNECEDOR",
									},
									{
										id: 3,
										label: "A VISTA PARA AMPÈRE",
										value: "A VISTA PARA AMPÈRE",
									},
									{
										id: 4,
										label: "NÃO SE APLICA",
										value: "NÃO SE APLICA",
									},
								]}
								value={requestInfo.formaPagamentoEstrutura}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										formaPagamentoEstrutura: value,
									})
								}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() =>
									setRequestInfo((prev) => ({
										...prev,
										formaPagamentoEstrutura: null,
									}))
								}
							/>
							<NumberInput
								label={"VALOR DA ESTRUTURA"}
								editable={true}
								value={requestInfo.valorEstrutura ? requestInfo.valorEstrutura : null}
								placeholder="Preencha aqui o valor da estrutura"
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										valorEstrutura: Number(value),
									})
								}
							/>
						</div>
					</>
				)}
			</div>
			<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
				<button
					onClick={() => {
						goToPreviousStage();
					}}
					className="rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105"
				>
					Voltar
				</button>
				<button
					onClick={() => {
						if (validateFields()) goToNextStage();
					}}
					className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default StructureInfo;
