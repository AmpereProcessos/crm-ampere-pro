import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import { structureTypes } from "@/utils/constants";
import type { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import { ChevronRight, Hammer } from "lucide-react";
import React, { type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";

type OtherServicesProps = {
	requestInfo: TContractRequest;
	setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
	showActions: boolean;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function OtherServices({ requestInfo, setRequestInfo, showActions, goToPreviousStage, goToNextStage }: OtherServicesProps) {
	function validateFields() {
		if (requestInfo.estruturaAmpere === "SIM") {
			if (!requestInfo.tipoEstrutura) {
				toast.error("Por favor, preencha o tipo da estrutura");
				return false;
			}
			if (!requestInfo.materialEstrutura) {
				toast.error("Por favor, preencha sobre o material da estrutura.");
				return false;
			}

			if (requestInfo.estruturaAmpere === "SIM" && requestInfo.responsavelEstrutura === "NÃO SE APLICA") {
				toast.error("Por favor, preencha o responsável pela construção/adequações de estrutura.");
				return false;
			}
			if (requestInfo.responsavelEstrutura !== "NÃO SE APLICA" && requestInfo.formaPagamentoEstrutura === "NÃO DEFINIDO") {
				toast.error("Por favor, preencha uma forma de pagamento válida.");
				return false;
			}
			if (requestInfo.responsavelEstrutura !== "AMPERE" && requestInfo.estruturaAmpere === "SIM" && (requestInfo.valorEstrutura == null || requestInfo.valorEstrutura === 0)) {
				toast.error("Por favor, preencha o valor da estrutura");
				return false;
			}
		}
		if (requestInfo.aumentoDeCarga === "SIM") {
			if (!requestInfo.caixaConjugada) {
				toast.error("Por favor, preencha se há caixa conjugada.");
				return false;
			}
			if (!requestInfo.tipoDePadrao) {
				toast.error("Por favor, preencha o tipo de padrão.");
				return false;
			}
			if (requestInfo.respTrocaPadrao === "NÃO SE APLICA" && requestInfo.aumentoDeCarga === "SIM") {
				toast.error("Por favor, preencha o responsável pela troca do padrão.");
				return false;
			}
			if ((requestInfo.formaPagamentoPadrao === "NÃO SE APLICA" || !requestInfo.formaPagamentoPadrao) && requestInfo.aumentoDeCarga === "SIM") {
				toast.error("Por favor, preencha a forma de pagamento do padrão.");
				return false;
			}
			if (requestInfo.valorPadrao === null) {
				toast.error("Por favor, preencha o valor do padrão.");
				return false;
			}
		}

		return true;
	}
	return (
		<div className="flex w-full flex-col bg-[#fff] pb-2 gap-6 grow">
			<div className="w-full flex items-center justify-center gap-2">
				<Hammer size={15} />
				<span className="text-sm tracking-tight font-bold">PADRÃO E ESTRUTURA</span>
			</div>
			<div className="w-full flex flex-col grow gap-4">
				{/** STRUCTURE INFORMATION */}
				<div className="w-full flex flex-col gap-4">
					<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
						<ChevronRight size={15} />
						<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DA ESTRUTURA</h1>
					</div>
					<div className="w-full flex items-center justify-center">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="INCLUSO VENDA DE NOVA (OU ADEQUAÇÃO) DE ESTRUTURA"
								labelTrue="INCLUSO VENDA DE NOVA (OU ADEQUAÇÃO) DE ESTRUTURA"
								checked={requestInfo.estruturaAmpere === "SIM"}
								handleChange={(value) => setRequestInfo({ ...requestInfo, estruturaAmpere: value ? "SIM" : "NÃO" })} // Update the state based on the checkbox value
							/>
						</div>
					</div>
					{requestInfo.estruturaAmpere === "SIM" ? (
						<>
							<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
								<div className="w-full lg:w-1/2">
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
										selectedItemLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({ ...prev, tipoEstrutura: "" }));
										}}
										width="100%"
									/>
								</div>
								<div className="w-full lg:w-1/2">
									<SelectInput
										label={"MATERIAL DA ESTRUTURA"}
										editable={true}
										options={[
											{ id: 1, label: "MADEIRA", value: "MADEIRA" },
											{ id: 2, label: "FERRO", value: "FERRO" },
										]}
										value={requestInfo.materialEstrutura}
										handleChange={(value) => setRequestInfo({ ...requestInfo, materialEstrutura: value })}
										selectedItemLabel="NÃO DEFINIDO"
										onReset={() => setRequestInfo((prev) => ({ ...prev, materialEstrutura: null }))}
										width="100%"
									/>
								</div>
							</div>
							<div className="w-full">
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
										// {
										// 	id: 3,
										// 	label: "NÃO SE APLICA",
										// 	value: "NÃO SE APLICA",
										// },
									]}
									value={requestInfo.responsavelEstrutura}
									handleChange={(value) => setRequestInfo({ ...requestInfo, responsavelEstrutura: value })}
									selectedItemLabel="NÃO DEFINIDO"
									onReset={() =>
										setRequestInfo((prev) => ({
											...prev,
											responsavelEstrutura: "NÃO SE APLICA",
										}))
									}
									width="100%"
								/>
							</div>
							<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
								<ChevronRight size={15} />
								<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DE PAGAMENTO DA ESTRUTURA</h1>
							</div>

							<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
								<div className="w-full lg:w-1/2">
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
										selectedItemLabel="NÃO DEFINIDO"
										onReset={() =>
											setRequestInfo((prev) => ({
												...prev,
												formaPagamentoEstrutura: null,
											}))
										}
										width="100%"
									/>
								</div>
								<div className="w-full lg:w-1/2">
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
										width="100%"
									/>
								</div>
							</div>
						</>
					) : null}
				</div>
				{/** ENERGIA PA INFORMATION */}
				<div className="w-full flex flex-col gap-4">
					<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
						<ChevronRight size={15} />
						<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DO PADRÃO DE ENERGIA</h1>
					</div>

					<div className="w-full flex items-center justify-center">
						<div className="w-fit">
							<CheckboxInput
								labelFalse="HAVERÁ TROCA DE PADRÃO/AUMENTO DE CARGA"
								labelTrue="HAVERÁ TROCA DE PADRÃO/AUMENTO DE CARGA"
								checked={requestInfo.aumentoDeCarga === "SIM"}
								handleChange={(value) => setRequestInfo({ ...requestInfo, aumentoDeCarga: value ? "SIM" : "NÃO" })} // Update the state based on the checkbox value
							/>
						</div>
					</div>
					{requestInfo.aumentoDeCarga === "SIM" ? (
						<>
							<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
								<div className="w-full lg:w-1/3">
									<SelectInput
										width={"100%"}
										label={"TIPO DO PADRÃO"}
										editable={true}
										value={requestInfo.tipoDePadrao}
										handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDePadrao: value })}
										options={[
											{
												label: "MONO 40A",
												value: "MONO 40A",
											},
											{
												label: "MONO 63A",
												value: "MONO 63A",
											},
											{
												label: "BIFASICO 63A",
												value: "BIFASICO 63A",
											},
											{
												label: "BIFASICO 70A",
												value: "BIFASICO 70A",
											},
											{
												label: "BIFASICO 100A",
												value: "BIFASICO 100A",
											},
											{
												label: "BIFASICO 125A",
												value: "BIFASICO 125A",
											},
											{
												label: "BIFASICO 150A",
												value: "BIFASICO 150A",
											},
											{
												label: "BIFASICO 200A",
												value: "BIFASICO 200A",
											},
											{
												label: "TRIFASICO 63A",
												value: "TRIFASICO 63A",
											},
											{
												label: "TRIFASICO 100A",
												value: "TRIFASICO 100A",
											},
											{
												label: "TRIFASICO 125A",
												value: "TRIFASICO 125A",
											},
											{
												label: "TRIFASICO 150A",
												value: "TRIFASICO 150A",
											},
											{
												label: "TRIFASICO 200A",
												value: "TRIFASICO 200A",
											},
										].map((type, index) => {
											return {
												id: index + 1,
												label: type.label,
												value: type.value,
											};
										})}
										selectedItemLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												tipoDePadrao: null,
											}));
										}}
									/>
								</div>
								<div className="w-full lg:w-1/3">
									<SelectInput
										width={"100%"}
										label={"HAVERÁ AUMENTO DO DISJUNTOR?"}
										editable={true}
										value={requestInfo.aumentoDisjuntor}
										handleChange={(value) => setRequestInfo({ ...requestInfo, aumentoDisjuntor: value })}
										options={[
											{
												id: 1,
												label: "SIM",
												value: "SIM",
											},
											{
												id: 2,
												label: "NÃO",
												value: "NÃO",
											},
										]}
										selectedItemLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({
												...prev,
												aumentoDisjuntor: null,
											}));
										}}
									/>
								</div>
								<div className="w-full lg:w-1/3">
									<SelectInput
										width={"100%"}
										label={"CAIXA CONJUGADA?"}
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
										value={requestInfo.caixaConjugada}
										handleChange={(value) => setRequestInfo({ ...requestInfo, caixaConjugada: value })}
										selectedItemLabel="NÃO DEFINIDO"
										onReset={() => {
											setRequestInfo((prev) => ({ ...prev, caixaConjugada: null }));
										}}
									/>
								</div>
							</div>
							<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
								<ChevronRight size={15} />
								<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DE PAGAMENTO DO PADRÃO</h1>
							</div>
							<div className="w-full flex items-center gap-2 flex-col lg:flex-row">
								<div className="w-full lg:w-1/2">
									<SelectInput
										width={"100%"}
										label={"PAGAMENTO DO PADRÃO"}
										editable={true}
										value={requestInfo.formaPagamentoPadrao}
										options={[
											{
												id: 1,
												label: "CLIENTE IRÁ COMPRAR EM SEPARADO",
												value: "CLIENTE IRÁ COMPRAR EM SEPARADO",
											},
											{
												id: 2,
												label: "CLIENTE PAGAR POR FORA",
												value: "CLIENTE PAGAR POR FORA",
											},
											{
												id: 3,
												label: "INCLUSO NO CONTRATO",
												value: "INCLUSO NO CONTRATO",
											},
											{
												id: 4,
												label: "NÃO HAVERA TROCA PADRÃO",
												value: "NÃO HAVERA TROCA PADRÃO",
											},
										]}
										handleChange={(value) => {
											setRequestInfo({
												...requestInfo,
												formaPagamentoPadrao: value,
											});
										}}
										selectedItemLabel="NÃO DEFINIDO"
										onReset={() =>
											setRequestInfo((prev) => ({
												...prev,
												formaPagamentoPadrao: null,
											}))
										}
									/>
								</div>
								<div className="w-full lg:w-1/2">
									<NumberInput
										width={"100%"}
										label={"VALOR DO PADRÃO"}
										editable={true}
										value={requestInfo.valorPadrao ? requestInfo.valorPadrao : null}
										handleChange={(value) => setRequestInfo({ ...requestInfo, valorPadrao: Number(value) })}
										placeholder="Preencha aqui o valor do padrão."
									/>
								</div>
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

export default OtherServices;
