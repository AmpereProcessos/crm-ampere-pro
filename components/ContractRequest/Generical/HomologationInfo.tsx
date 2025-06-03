import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToCPForCNPJ } from "@/utils/methods";
import type { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import { ChevronRight, Share2 } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { FaCode } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

type HomologationInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
	showActions: boolean;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function HomologationInfo({ requestInfo, setRequestInfo, showActions, goToPreviousStage, goToNextStage }: HomologationInfoProps) {
	const [homologationModality, setHomologationModality] = useState<"CONVENCIONAL" | "FAST TRACK">("CONVENCIONAL");

	function useInfoInfoFromContract() {
		setRequestInfo((prev) => ({
			...prev,
			nomeTitularProjeto: prev.nomeDoContrato,
			cpf_cnpjTitularProjeto: prev.cpf_cnpj,
		}));
	}
	function addDistribution(distribution: TContractRequest["distribuicoes"][number]) {
		setRequestInfo((prev) => ({
			...prev,
			distribuicoes: [...prev.distribuicoes, distribution],
		}));
	}
	function removeDistribution(index: number) {
		setRequestInfo((prev) => ({
			...prev,
			distribuicoes: prev.distribuicoes.filter((_, i) => i !== index),
		}));
	}
	function validateFields() {
		if (!requestInfo.realizarHomologacao) return true;

		if (!requestInfo.nomeTitularProjeto) {
			toast.error("Por favor, preencha um nome do titular válido.");
			return false;
		}
		if (!requestInfo.tipoDoTitular) {
			toast.error("Por favor, preencha o tipo do titular.");
			return false;
		}
		if (!requestInfo.tipoDaLigacao) {
			toast.error("Por favor, preencha o tipo da ligação.");
			return false;
		}
		if (!requestInfo.tipoDaInstalacao) {
			toast.error("Por favor, preencha o tipo da instalação.");
			return false;
		}

		if (homologationModality === "FAST TRACK")
			setRequestInfo((prev) => ({
				...prev,
				homologacaoFastTrack: true,
				observacoesHomologacao: "A HOMOLOGAÇÃO SERÁ FEITA NA MODALIDADE FAST TRACK. NESSE SENTIDO O CLIENTE OPTA POR ABDICAR, PERMANENTEMENTE, DE DISTRUIÇÕES DE CRÉDITO.",
			}));

		return true;
	}
	return (
		<div className="flex w-full flex-col bg-[#fff] pb-2 gap-6 grow">
			<div className="w-full flex items-center justify-center gap-2">
				<Share2 size={15} />
				<span className="text-sm tracking-tight font-bold">HOMOLOGAÇÃO</span>
			</div>
			<div className="w-full flex flex-col gap-4 grow">
				<div className="flex w-full items-center justify-center">
					<div className="w-fit">
						<CheckboxInput
							labelFalse="REALIZAR HOMOLOGAÇÃO"
							labelTrue="REALIZAR HOMOLOGAÇÃO"
							checked={!!requestInfo.realizarHomologacao}
							handleChange={(value) => setRequestInfo((prev) => ({ ...prev, realizarHomologacao: value }))}
						/>
					</div>
				</div>
				<div className="w-full flex flex-col gap-4 grow">
					{requestInfo.realizarHomologacao ? (
						<>
							<div className="w-full flex flex-col gap-2">
								<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
									<ChevronRight size={15} />
									<h1 className="text-xs tracking-tight font-medium text-start w-fit">MODALIDADE DE HOMOLOGAÇÃO</h1>
								</div>
								<div className="w-full rounded border border-blue-800 bg-blue-50 p-2">
									<div className="flex w-full items-center justify-between gap-2">
										<h1 className="text-sm font-bold text-blue-800">HOMOLOGAÇÃO CONVENCIONAL</h1>
										<button
											type="button"
											onClick={() => setHomologationModality("CONVENCIONAL")}
											className={cn(
												"flex h-[20px] w-[20px] items-center justify-center rounded-full border border-blue-800 p-2",
												homologationModality === "CONVENCIONAL" ? "bg-blue-800 text-xs text-white" : "",
											)}
										/>
									</div>
									<p className="text-sm tracking-tight text-blue-700">
										Modalidade convencional no qual a potência de homologação será a máxima possível liberada pela concessionária local.
									</p>
									<p className="text-sm tracking-tight text-blue-700">
										Em casos em que a potência de contrato ultrapasse a de homologação, o prosseguimento se dará com o consentimento do cliente sobre possíveis riscos.
									</p>
								</div>
								{requestInfo.potPico && requestInfo.potPico <= 7.5 ? (
									<div className="w-full rounded border border-green-800 bg-green-50 p-2">
										<div className="flex w-full items-center justify-between gap-2">
											<h1 className="text-sm font-bold text-green-800">HOMOLOGAÇÃO FAST TRACK</h1>
											<button
												type="button"
												onClick={() => setHomologationModality("FAST TRACK")}
												className={cn(
													"flex h-[20px] w-[20px] items-center justify-center rounded-full border border-green-800 p-2 text-xs",
													homologationModality === "FAST TRACK" ? "bg-green-800 text-white" : "",
												)}
											/>
										</div>
										<p className="text-sm tracking-tight text-green-700">Nova modalidade liberada pela ANEEL que dispensa análise de potência para sistemas de até 7,5KW.</p>
										<p className="text-sm tracking-tight text-green-700">
											<strong>IMPORTANTE:</strong> para participar dessa modalidade a instalação deve optar pela abdicação permanente de distribuição de créditos.
										</p>
									</div>
								) : null}
							</div>
							<div className="flex w-full items-center justify-end">
								<button type="button" onClick={() => useInfoInfoFromContract()} className="rounded-lg border border-cyan-500 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-500">
									USAR DADOS DO TITULAR DO CONTRATO
								</button>
							</div>
							<div className="w-full flex flex-col gap-4">
								<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
									<ChevronRight size={15} />
									<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DO TITULAR DA INSTALAÇÃO</h1>
								</div>
								<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
									<div className="w-full lg:w-1/3">
										<TextInput
											label={"NOME DO TITULAR DO PROJETO"}
											placeholder="Preencha o nome do titular do projeto junto a concessionária."
											value={requestInfo.nomeTitularProjeto ? requestInfo.nomeTitularProjeto : ""}
											editable={true}
											handleChange={(value) =>
												setRequestInfo({
													...requestInfo,
													nomeTitularProjeto: value.toUpperCase(),
												})
											}
											width="100%"
										/>
									</div>
									<div className="w-full lg:w-1/3">
										<TextInput
											label={"CPF/CNPJ DO TITULAR DO PROJETO"}
											placeholder="Preencha o CPF/CNPJ do titular do projeto junto a concessionária."
											value={requestInfo.cpf_cnpjTitularProjeto ? requestInfo.cpf_cnpjTitularProjeto : ""}
											editable={true}
											handleChange={(value) =>
												setRequestInfo({
													...requestInfo,
													cpf_cnpjTitularProjeto: formatToCPForCNPJ(value),
												})
											}
											width="100%"
										/>
									</div>
									<div className="w-full lg:w-1/3">
										<SelectInput
											label={"TIPO DO TITULAR"}
											editable={true}
											value={requestInfo.tipoDoTitular}
											handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDoTitular: value })}
											options={[
												{
													id: 1,
													label: "PESSOA FISICA",
													value: "PESSOA FISICA",
												},
												{
													id: 2,
													label: "PESSOA JURIDICA",
													value: "PESSOA JURIDICA",
												},
											]}
											resetOptionLabel="NÃO DEFINIDO"
											onReset={() => setRequestInfo((prev) => ({ ...prev, tipoDoTitular: undefined }))}
											width="100%"
										/>
									</div>
								</div>
								<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
									<ChevronRight size={15} />
									<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DA INSTALAÇÃO</h1>
								</div>
								<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
									<div className="w-full lg:w-1/3">
										<TextInput
											label={"Nº DA INSTALAÇÃO"}
											editable={true}
											placeholder="Preencha aqui o número de instalação junto a concessionária."
											value={requestInfo.numeroInstalacao ? requestInfo.numeroInstalacao : ""}
											handleChange={(value) => setRequestInfo({ ...requestInfo, numeroInstalacao: value })}
											width="100%"
										/>
									</div>
									<div className="w-full lg:w-1/3">
										<SelectInput
											label={"TIPO DA LIGAÇÃO"}
											editable={true}
											value={requestInfo.tipoDaLigacao}
											handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDaLigacao: value })}
											options={[
												{
													id: 1,
													label: "NOVA",
													value: "NOVA",
												},
												{
													id: 2,
													label: "EXISTENTE",
													value: "EXISTENTE",
												},
											]}
											resetOptionLabel="NÃO DEFINIDO"
											onReset={() => setRequestInfo((prev) => ({ ...prev, tipoDaLigacao: undefined }))}
											width="100%"
										/>
									</div>
									<div className="w-full lg:w-1/3">
										<SelectInput
											label={"TIPO DA INSTALAÇÃO"}
											editable={true}
											value={requestInfo.tipoDaInstalacao}
											handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDaInstalacao: value })}
											options={[
												{
													id: 1,
													label: "RURAL",
													value: "RURAL",
												},
												{
													id: 2,
													label: "URBANO",
													value: "URBANO",
												},
											]}
											resetOptionLabel="NÃO DEFINIDO"
											onReset={() =>
												setRequestInfo((prev) => ({
													...prev,
													tipoDaInstalacao: undefined,
												}))
											}
											width="100%"
										/>
									</div>
								</div>
								<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
									<ChevronRight size={15} />
									<h1 className="text-xs tracking-tight font-medium text-start w-fit">CREDENCIAIS DO APP DA CONCESSIONÁRIA</h1>
								</div>
								<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
									<div className="w-full lg:w-1/2">
										<TextInput
											label={"LOGIN(CEMIG ATENDE)"}
											editable={true}
											placeholder="Preencha aqui o login do CEMIG ATENDE do cliente."
											value={requestInfo.loginCemigAtende}
											handleChange={(value) => setRequestInfo({ ...requestInfo, loginCemigAtende: value })}
											width="100%"
										/>
									</div>
									<div className="w-full lg:w-1/2">
										<TextInput
											label={"SENHA(CEMIG ATENDE)"}
											placeholder="Preencha aqui a senha do CEMIG ATENDE do cliente."
											editable={true}
											value={requestInfo.senhaCemigAtende}
											handleChange={(value) => setRequestInfo({ ...requestInfo, senhaCemigAtende: value })}
											width="100%"
										/>
									</div>
								</div>
							</div>
							<div className="w-full flex flex-col gap-4">
								<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
									<ChevronRight size={15} />
									<h1 className="text-xs tracking-tight font-medium text-start w-fit">DISTRIBUIÇÕES DE CRÉDITO</h1>
								</div>
								<div className="flex w-full items-center justify-center">
									<div className="w-fit">
										<CheckboxInput
											labelFalse="POSSUI DISTRIBUIÇÕES DE CRÉDITO"
											labelTrue="POSSUI DISTRIBUIÇÕES DE CRÉDITO"
											checked={requestInfo.possuiDistribuicao === "SIM"}
											handleChange={(value) => setRequestInfo((prev) => ({ ...prev, possuiDistribuicao: value ? "SIM" : "NÃO", distribuições: !value ? [] : prev.distribuicoes }))}
										/>
									</div>
								</div>
								{requestInfo.possuiDistribuicao === "SIM" ? (
									<CreditDistributions distributions={requestInfo.distribuicoes} addDistribution={addDistribution} removeDistribution={removeDistribution} />
								) : null}
							</div>
						</>
					) : null}
				</div>
			</div>
			{showActions ? (
				<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
					<button
						type="button"
						onClick={() => {
							goToPreviousStage();
						}}
						className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
					>
						Voltar
					</button>
					<button
						type="button"
						onClick={() => {
							if (validateFields()) {
								goToNextStage();
							}
						}}
						className="rounded p-2 font-bold hover:bg-black hover:text-white"
					>
						Prosseguir
					</button>
				</div>
			) : null}
		</div>
	);
}
export default HomologationInfo;

type CreditDistributionsProps = {
	distributions: TContractRequest["distribuicoes"];
	addDistribution: (distribution: TContractRequest["distribuicoes"][number]) => void;
	removeDistribution: (index: number) => void;
};
function CreditDistributions({ distributions, addDistribution, removeDistribution }: CreditDistributionsProps) {
	const [distributionHolder, setDistributionHolder] = useState<TContractRequest["distribuicoes"][number]>({
		numInstalacao: "",
		excedente: 0,
	});
	function handleAddDistribution(info: TContractRequest["distribuicoes"][number]) {
		if (info.numInstalacao.trim().length <= 3) {
			toast.error("Preencha um número da instalação válido.");
			return;
		}
		if (!info.excedente || info.excedente <= 0) {
			toast.error("Preencha um excedente válido.");
			return;
		}
		addDistribution(info);
		setDistributionHolder({ numInstalacao: "", excedente: 0 });
	}
	return (
		<>
			<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NÚMERO DA INSTALAÇÃO"
						labelClassName="text-[0.6rem]"
						inputClassName="text-xs p-2 min-h-[34px]"
						placeholder="NÚMERO DA INSTALAÇÃO"
						value={distributionHolder.numInstalacao}
						handleChange={(value) =>
							setDistributionHolder((prev) => ({
								...prev,
								numInstalacao: value,
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="PORCENTAGE DO EXCEDENTE (%)"
						labelClassName="text-[0.6rem]"
						inputClassName="text-xs p-2 min-h-[34px]"
						placeholder="PORCENTAGE DO EXCEDENTE (%)"
						value={distributionHolder.excedente || null}
						handleChange={(value) =>
							setDistributionHolder((prev) => ({
								...prev,
								excedente: value,
							}))
						}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex items-center justify-end">
				<Button onClick={() => handleAddDistribution(distributionHolder)} size={"sm"} type="button">
					ADICIONAR DISTRIBUIÇÃO
				</Button>
			</div>
			{distributions.length > 0 ? (
				distributions.map((distribution, index) => (
					<div key={`distribuicao-${distribution.numInstalacao}-${index}`} className="flex w-full justify-between items-center gap-1 rounded border border-primary bg-[#fff] p-2">
						<div className="flex items-center gap-1">
							<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 dark:border-[#fff]">
								<FaCode />
							</div>
							<p className="text-sm font-bold leading-none tracking-tight">{distribution.numInstalacao}</p>
						</div>
						<button type="button" onClick={() => removeDistribution(index)} className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-white hover:bg-red-500">
							<MdDelete width={10} height={10} />
							<p>REMOVER</p>
						</button>
					</div>
				))
			) : (
				<div className="w-full text-center text-sm font-medium tracking-tight text-primary/80">Nenhuma distribuição adicionada.</div>
			)}
		</>
	);
}
