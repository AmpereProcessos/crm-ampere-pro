import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextareaInput from "@/components/Inputs/TextareaInput";
import TextInput from "@/components/Inputs/TextInput";
import { BrazilianCitiesOptionsFromUF, BrazilianStatesOptions } from "@/utils/estados_cidades";
import { formatToCEP, formatToCPForCNPJ, formatToPhone, getCEPInfo } from "@/utils/methods";
import { useCreditors } from "@/utils/queries/utils";
import type { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import { BadgeDollarSign, ChevronRight } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";

type PaymentInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
	showActions: boolean;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function PaymentInfo({ requestInfo, setRequestInfo, showActions, goToPreviousStage, goToNextStage }: PaymentInfoProps) {
	const { data: creditors } = useCreditors();

	function usePaymentInfoFromContract() {
		setRequestInfo((prev) => ({
			...prev,
			nomePagador: prev.nomeDoContrato,
			contatoPagador: prev.telefone,
			cpf_cnpjNF: prev.cpf_cnpj,
		}));
	}
	function validateFields() {
		if (requestInfo.nomePagador.trim().length < 3) {
			toast.error("Por favor, preencha o nome do pagador.");
			return false;
		}
		if (requestInfo.contatoPagador.trim().length < 8) {
			toast.error("Por favor, preencha o contato do pagador.");
			return false;
		}
		if (requestInfo.cpf_cnpjNF.trim().length < 11) {
			toast.error("Por favor, preencha um CPF/CPNJ válido para NF");
			return false;
		}
		if (!requestInfo.valorContrato || requestInfo.valorContrato <= 0) {
			toast.error("Por favor, preencha o valor do contrato.");
			return false;
		}
		if (!requestInfo.origemRecurso) {
			toast.error("Por favor, preencha a origem do recurso.");
			return false;
		}
		if (!requestInfo.formaDePagamento || requestInfo.formaDePagamento === "NÃO DEFINIDO") {
			toast.error("Por favor, preencha a forma de pagamento.");
			return false;
		}
		if (requestInfo.origemRecurso === "FINANCIAMENTO" && !requestInfo.credor) {
			toast.error("Por favor, preencha o credor do financiamento.");
			return false;
		}
		if (requestInfo.origemRecurso === "FINANCIAMENTO" && requestInfo.nomeGerente.trim().length < 5) {
			toast.error("Por favor, preencha o nome do gerente.");
			return false;
		}
		if (requestInfo.origemRecurso === "FINANCIAMENTO" && requestInfo.contatoGerente.trim().length < 8) {
			toast.error("Por favor, preencha o contato do gerente.");
			return false;
		}
		return true;
	}
	return (
		<div className="flex w-full flex-col bg-[#fff] pb-2 gap-6 grow">
			<div className="w-full flex items-center justify-center gap-2">
				<BadgeDollarSign size={15} />
				<span className="text-sm tracking-tight font-bold">INFORMAÇÕES SOBRE PAGAMENTO</span>
			</div>
			<div className="w-full flex flex-col gap-4 grow">
				{/** PAYER INFORMATION */}
				<div className="w-full flex flex-col gap-4">
					<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
						<ChevronRight size={15} />
						<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DO PAGADOR</h1>
					</div>
					<div className="flex w-full items-center justify-end">
						<button type="button" onClick={() => usePaymentInfoFromContract()} className="rounded-lg border border-cyan-500 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-500">
							USAR DADOS DO TITULAR DO CONTRATO
						</button>
					</div>
					<div className="w-full flex items-center justify-center gap-2 flex-col lg:flex-row">
						<div className="w-full lg:w-1/3">
							<TextInput
								width={"100%"}
								label={"NOME DO PAGADOR"}
								placeholder="Preencha aqui o nome da pessoa/empresa que realizará o pagamento"
								editable={true}
								value={requestInfo.nomePagador}
								handleChange={(value) => setRequestInfo({ ...requestInfo, nomePagador: value })}
							/>
						</div>
						<div className="w-full lg:w-1/3">
							<TextInput
								width={"100%"}
								label={"CPF/CNPJ PARA NF"}
								placeholder="Preencha aqui o CPF/CNPJ para faturamento do serviço/equipamentos."
								editable={true}
								value={requestInfo.cpf_cnpjNF}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										cpf_cnpjNF: formatToCPForCNPJ(value),
									})
								}
							/>
						</div>
						<div className="w-full lg:w-1/3">
							<TextInput
								width={"100%"}
								label={"CONTATO DO PAGADOR"}
								placeholder="Preencha aqui o contato da pessoa que realizará o pagamento"
								editable={true}
								value={requestInfo.contatoPagador}
								handleChange={(value) =>
									setRequestInfo({
										...requestInfo,
										contatoPagador: formatToPhone(value),
									})
								}
							/>
						</div>
					</div>
				</div>
				{/** NEGOTIATION & PAYMENT INFORMATION */}
				<div className="w-full flex flex-col gap-4">
					<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
						<ChevronRight size={15} />
						<h1 className="text-xs tracking-tight font-medium text-start w-fit">DETALHES DO PAGAMENTO</h1>
					</div>
					<SelectInput
						width={"100%"}
						label={"FORMA DE PAGAMENTO"}
						editable={true}
						options={[
							{
								id: 1,
								label: "80% A VISTA NA ENTRADA + 20% NA FINALIZAÇÃO DA INSTALAÇÃO",
								value: "80% A VISTA NA ENTRADA + 20% NA FINALIZAÇÃO DA INSTALAÇÃO",
							},
							{
								id: 2,
								label: "100% A VISTA ATRAVÉS DE FINANCIAMENTO BANCÁRIO",
								value: "100% A VISTA ATRAVÉS DE FINANCIAMENTO BANCÁRIO",
							},
							{
								id: 3,
								label: "100% PARCELADO NO CARTÃO DE CRÉDITO",
								value: "100% PARCELADO NO CARTÃO DE CRÉDITO",
							},
							{
								id: 4,
								label: "100% À VISTA NO DINHEIRO/DÉBITO/PIX",
								value: "100% À VISTA NO DINHEIRO/DÉBITO/PIX",
							},
							{
								id: 5,
								label: "NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)",
								value: "NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)",
							},
						]}
						value={requestInfo.formaDePagamento}
						handleChange={(value) => setRequestInfo({ ...requestInfo, formaDePagamento: value })}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setRequestInfo((prev) => ({
								...prev,
								formaDePagamento: null,
							}));
						}}
					/>
					<div className="w-full flex items-center justify-center gap-2 flex-col lg:flex-row">
						<div className="w-full lg:w-1/2">
							<SelectInput
								width={"100%"}
								label={"ORIGEM DO RECURSO"}
								editable={true}
								value={requestInfo.origemRecurso}
								handleChange={(value) => setRequestInfo({ ...requestInfo, origemRecurso: value })}
								options={[
									{
										id: 1,
										label: "FINANCIAMENTO",
										value: "FINANCIAMENTO",
									},
									{
										id: 2,
										label: "CAPITAL PRÓPRIO",
										value: "CAPITAL PRÓPRIO",
									},
								]}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => {
									setRequestInfo((prev) => ({ ...prev, origemRecurso: null }));
								}}
							/>
						</div>
						<div className="w-full lg:w-1/2">
							<NumberInput
								width={"100%"}
								label={"VALOR DO CONTRATO FOTOVOLTAICO(SEM CUSTOS ADICIONAIS)"}
								editable={true}
								value={requestInfo.valorContrato || null}
								placeholder={"Preencha aqui o valor do contrato (sem custos adicionais de estrutura/padrão/O&M, etc..."}
								handleChange={(value) =>
									setRequestInfo((prev) => ({
										...prev,
										valorContrato: Number(value),
									}))
								}
							/>
						</div>
					</div>
					{requestInfo.origemRecurso === "FINANCIAMENTO" ? (
						<div className="w-full flex items-center justify-center gap-2 flex-col lg:flex-row">
							<div className="w-full lg:w-1/3">
								<SelectInput
									width={"100%"}
									label={"CREDOR"}
									editable={true}
									options={creditors?.map((c) => ({ id: c._id, label: c.valor, value: c.valor })) || []}
									value={requestInfo.credor}
									handleChange={(value) => setRequestInfo({ ...requestInfo, credor: value })}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => {
										setRequestInfo((prev) => ({ ...prev, credor: null }));
									}}
								/>
							</div>
							<div className="w-full lg:w-1/3">
								<TextInput
									width={"100%"}
									label={"NOME DO GERENTE"}
									placeholder="Preencha aqui o nome do gerente."
									editable={true}
									value={requestInfo.nomeGerente}
									handleChange={(value) => setRequestInfo({ ...requestInfo, nomeGerente: value })}
								/>
							</div>
							<div className="w-full lg:w-1/3">
								<TextInput
									width={"100%"}
									label={"CONTATO DO GERENTE"}
									placeholder="Preencha aqui o contato de telefone do gerente."
									editable={true}
									value={requestInfo.contatoGerente}
									handleChange={(value) =>
										setRequestInfo({
											...requestInfo,
											contatoGerente: formatToPhone(value),
										})
									}
								/>
							</div>
						</div>
					) : null}
					<TextareaInput
						label={"DESCRIÇÃO DA NEGOCIAÇÃO"}
						placeholder="Descreva aqui detalhes da negociação. Parcelamento, divisão de valores, etc..."
						editable={true}
						value={requestInfo.descricaoNegociacao}
						handleChange={(value) => setRequestInfo({ ...requestInfo, descricaoNegociacao: value })}
					/>
				</div>
				{/** FISCAL INFORMATION */}
				<div className="w-full flex flex-col gap-4">
					<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
						<ChevronRight size={15} />
						<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES SOBRE A NOTA FISCAL</h1>
					</div>
					<div className="w-full flex items-center justify-center gap-2 flex-wrap">
						<div className="w-fit">
							<CheckboxInput
								labelTrue="NECESSÁRIO NOTA FISCAL ADIANTADA"
								labelFalse="NECESSÁRIO NOTA FISCAL ADIANTADA"
								checked={requestInfo.necessidadeNFAdiantada === "SIM"}
								handleChange={(value) => {
									setRequestInfo((prev) => ({ ...prev, necessidadeNFAdiantada: value ? "SIM" : "NÃO" }));
								}}
							/>
						</div>
						<div className="w-fit">
							<CheckboxInput
								labelTrue="NECESSÁRIO NOTA FISCAL COM INSCRIÇÃO RURAL"
								labelFalse="NECESSÁRIO NOTA FISCAL COM INSCRIÇÃO RURAL"
								checked={requestInfo.necessidaInscricaoRural === "SIM"}
								handleChange={(value) => {
									setRequestInfo((prev) => ({ ...prev, necessidaInscricaoRural: value ? "SIM" : "NÃO" }));
								}}
							/>
						</div>
						<div className="w-fit">
							<CheckboxInput
								labelTrue="NECESSÁRIO NOTA FISCAL COM CÓDIGO FINAME"
								labelFalse="NECESSÁRIO NOTA FISCAL COM CÓDIGO FINAME"
								checked={requestInfo.necessidadeCodigoFiname === "SIM"}
								handleChange={(value) => {
									setRequestInfo((prev) => ({ ...prev, necessidadeCodigoFiname: value ? "SIM" : "NÃO" }));
								}}
							/>
						</div>
					</div>
					{requestInfo.necessidaInscricaoRural === "SIM" ? (
						<div className="w-full">
							<TextInput
								width={"100%"}
								label={"INSCRIÇÃO RURAL"}
								placeholder="Preencha aqui a inscrição rural"
								editable={true}
								value={requestInfo.inscriçãoRural || ""}
								handleChange={(value) => setRequestInfo({ ...requestInfo, inscriçãoRural: value })}
							/>
						</div>
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

export default PaymentInfo;
