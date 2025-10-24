import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { TContractRequest } from "@/utils/schemas//contract-request.schema";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillDelete } from "react-icons/ai";
type CreditDistributionInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
type CreditDistHolderType = {
	numInstalacao: string;
	excedente: number;
};
function CreditDistributionInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage }: CreditDistributionInfoProps) {
	const [creditDistHolder, setCreditDistHolder] = useState<CreditDistHolderType>({
		numInstalacao: "",
		excedente: 0,
	});
	function addCreditDist() {
		if (creditDistHolder.numInstalacao.trim().length < 5) {
			toast.error("Preencha um número de instalação válido.");
			return;
		}
		if (creditDistHolder.excedente <= 0) {
			toast.error("Preencha uma porcentagem de envio válida.");
			return;
		}
		var distArrCopy = [...requestInfo.distribuicoes];
		distArrCopy.push(creditDistHolder);
		setRequestInfo((prev) => ({ ...prev, distribuicoes: distArrCopy }));
		setCreditDistHolder({ numInstalacao: "", excedente: 0 });
	}
	function validateFields() {
		if (requestInfo.possuiDistribuicao == "SIM") {
			if (requestInfo.distribuicoes.length == 0) {
				toast.error("Adicione distribuições de crédito à lista.");
				return false;
			}
			return true;
		}
		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-background pb-2">
			<span className="py-2 text-center text-sm font-bold uppercase text-[#15599a]">DISTRIBUIÇÃO DE CRÉDITOS</span>
			<div className="flex w-full grow flex-col">
				<div className="mt-2 flex justify-center p-2">
					<SelectInput
						label={"POSSUI DISTRIBUIÇÕES DE CRÉDITOS?"}
						value={requestInfo.possuiDistribuicao}
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
						handleChange={(value) => setRequestInfo({ ...requestInfo, possuiDistribuicao: value })}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setRequestInfo((prev) => ({ ...prev, possuiDistribuicao: null }));
						}}
					/>
				</div>
				{requestInfo.possuiDistribuicao == "SIM" && (
					<>
						<div className="mt-2 flex flex-col gap-2 p-2">
							<h1 className="font-raleway text-center font-bold">ADICIONAR DISTRIBUIÇÃO:</h1>
							<div className="flex flex-col items-center justify-around lg:flex-row">
								<TextInput
									label={"Nº DA INSTALAÇÃO"}
									editable={true}
									value={creditDistHolder.numInstalacao}
									placeholder="Preencha aqui o número da instalação."
									handleChange={(value) =>
										setCreditDistHolder({
											...creditDistHolder,
											numInstalacao: value,
										})
									}
								/>
								<NumberInput
									label={"% EXCEDENTE"}
									editable={true}
									placeholder="Preencha aqui o valor do excedente para envio."
									value={creditDistHolder.excedente}
									handleChange={(value) =>
										setCreditDistHolder({
											...creditDistHolder,
											excedente: Number(value),
										})
									}
								/>
								<button onClick={addCreditDist} className="rounded bg-[#fead61] p-1 font-bold hover:bg-[#15599a] hover:text-primary-foreground">
									ADICIONAR
								</button>
							</div>
						</div>
						{requestInfo.distribuicoes?.length > 0 && (
							<div className="mt-4 flex flex-col gap-2">
								{requestInfo.distribuicoes.map((distribuicao, index) => (
									<div key={index} className="flex flex-wrap justify-around">
										<p className="text-sm font-bold text-primary/60">INSTALAÇÃO Nº{distribuicao.numInstalacao}</p>
										<p className="text-sm font-bold text-primary/60">{distribuicao.excedente}%</p>
										<button
											onClick={() => {
												let distribuicoes = requestInfo.distribuicoes;
												distribuicoes.splice(index, 1);
												setRequestInfo({
													...requestInfo,
													distribuicoes: distribuicoes,
												});
											}}
											className="rounded bg-red-500 p-1"
										>
											<AiFillDelete />
										</button>
									</div>
								))}
							</div>
						)}
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

export default CreditDistributionInfo;
