import CheckboxInput from "@/components/Inputs/CheckboxInput";
import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { cn } from "@/lib/utils";
import { stateCities } from "@/utils/estados_cidades";
import { formatToCEP, formatToCPForCNPJ, getCEPInfo } from "@/utils/methods";
import type { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineSearch } from "react-icons/ai";
import { BsCheck } from "react-icons/bs";
type HomologationInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	sameProjectHolder: boolean;
	setSameProjectHolder: React.Dispatch<React.SetStateAction<boolean>>;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function HomologationInfo({ requestInfo, setRequestInfo, sameProjectHolder, setSameProjectHolder, goToPreviousStage, goToNextStage }: HomologationInfoProps) {
	const [homologationModality, setHomologationModality] = useState<"CONVENCIONAL" | "FAST TRACK">("CONVENCIONAL");

	async function setAddressDataByCEP(cep: string) {
		const addressInfo = await getCEPInfo(cep);
		const toastID = toast.loading("Buscando informações sobre o CEP...", {
			duration: 2000,
		});
		setTimeout(() => {
			if (addressInfo) {
				toast.dismiss(toastID);
				toast.success("Dados do CEP buscados com sucesso.", { duration: 1000 });
				setRequestInfo((prev) => ({
					...prev,
					enderecoInstalacao: addressInfo.logradouro,
					bairroInstalacao: addressInfo.bairro,
					ufInstalacao: addressInfo.uf as keyof typeof stateCities,
					cidadeInstalacao: addressInfo.localidade.toUpperCase(),
				}));
			}
		}, 1000);
	}
	function useMailInfo() {
		setRequestInfo((prev) => ({
			...prev,
			cepInstalacao: prev.cep,
			enderecoInstalacao: prev.enderecoCobranca,
			numeroResInstalacao: prev.numeroResCobranca,
			bairroInstalacao: prev.bairro,
			ufInstalacao: prev.uf,
			cidadeInstalacao: prev.cidade,
			pontoDeReferenciaInstalacao: prev.pontoDeReferencia,
		}));
	}
	function validateFields() {
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
		if (requestInfo.cidadeInstalacao == "NÃO DEFINIDO") {
			toast.error("Por favor, preencha uma cidade válida.");
			return false;
		}
		if (requestInfo.enderecoInstalacao.trim().length < 3) {
			toast.error("Por favor, preencha um endereço válido");
			return false;
		}
		if (requestInfo.bairroInstalacao.trim().length < 3) {
			toast.error("Por favor, preencha um bairro válido");
			return false;
		}
		if (requestInfo.numeroResInstalacao == null) {
			toast.error("Por favor, preencha o número da residência.");
			return false;
		}
		if (requestInfo.tipoDaLigacao == "EXISTENTE" && (requestInfo.numeroInstalacao == null || requestInfo.numeroInstalacao.trim().length < 7)) {
			toast.error("Por favor, preencha um número de instalação válido.");
			return false;
		}
		if (requestInfo.tipoDaInstalacao == "RURAL" && requestInfo.longitude.trim().length < 6) {
			toast.error("Por favor, preencha uma longitude válida.");
			return false;
		}
		if (requestInfo.tipoDaInstalacao == "RURAL" && requestInfo.latitude.trim().length < 6) {
			toast.error("Por favor, preencha uma latitude válida.");
			return false;
		}
		if (homologationModality == "FAST TRACK")
			setRequestInfo((prev) => ({
				...prev,
				homologacaoFastTrack: true,
				observacoesHomologacao: "A HOMOLOGAÇÃO SERÁ FEITA NA MODALIDADE FAST TRACK. NESSE SENTIDO O CLIENTE OPTA POR ABDICAR, PERMANENTEMENTE, DE DISTRUIÇÕES DE CRÉDITO.",
			}));
		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-[#fff] pb-2">
			<span className="py-2 text-center text-sm font-bold uppercase text-[#15599a]">DADOS DE HOMOLOGAÇÃO</span>
			<div className="flex w-full items-center justify-center">
				<div className="w-fit">
					<CheckboxInput
						labelFalse="MESMO TITULAR DO CONTRATO"
						labelTrue="MESMO TITULAR DO CONTRATO"
						checked={sameProjectHolder}
						handleChange={(value) => setSameProjectHolder(value)}
					/>
				</div>
			</div>
			<h1 className="w-full text-start text-sm font-medium tracking-tight">MODALIDADE DE HOMOLOGAÇÃO</h1>
			<div className="flex w-full flex-col gap-2">
				<div className="w-full rounded border border-blue-800 bg-blue-50 p-2">
					<div className="flex w-full items-center justify-between gap-2">
						<h1 className="text-sm font-bold text-blue-800">HOMOLOGAÇÃO CONVENCIONAL</h1>
						<button
							onClick={() => setHomologationModality("CONVENCIONAL")}
							className={cn(
								"flex h-[20px] w-[20px] items-center justify-center rounded-full border border-blue-800 p-2",
								homologationModality == "CONVENCIONAL" ? "bg-blue-800 text-xs text-white" : "",
							)}
						></button>
					</div>
					<p className="text-sm tracking-tight text-blue-700">Modalidade convencional no qual a potência de homologação será a máxima possível liberada pela concessionária local.</p>
					<p className="text-sm tracking-tight text-blue-700">
						Em casos em que a potência de contrato ultrapasse a de homologação, o prosseguimento se dará com o consentimento do cliente sobre possíveis riscos.
					</p>
				</div>
				{requestInfo.potPico && requestInfo.potPico <= 7.5 ? (
					<div className="w-full rounded border border-green-800 bg-green-50 p-2">
						<div className="flex w-full items-center justify-between gap-2">
							<h1 className="text-sm font-bold text-green-800">HOMOLOGAÇÃO FAST TRACK</h1>
							<button
								onClick={() => setHomologationModality("FAST TRACK")}
								className={cn(
									"flex h-[20px] w-[20px] items-center justify-center rounded-full border border-green-800 p-2 text-xs",
									homologationModality == "FAST TRACK" ? "bg-green-800 text-white" : "",
								)}
							></button>
						</div>
						<p className="text-sm tracking-tight text-green-700">Nova modalidade liberada pela ANEEL que dispensa análise de potência para sistemas de até 7,5KW.</p>
						<p className="text-sm tracking-tight text-green-700">
							<strong>IMPORTANTE:</strong> para participar dessa modalidade a instalação deve optar pela abdicação permanente de distribuição de créditos.
						</p>
					</div>
				) : null}
			</div>
			<div className="flex flex-col gap-2 p-2 lg:grid lg:grid-cols-3">
				<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">INFORMAÇÕES DA INSTALAÇÃO DO CLIENTE</h1>
				<div className="col-span-3 flex w-full items-center justify-center gap-2">
					<TextInput
						label={"Nº DA INSTALAÇÃO"}
						editable={true}
						placeholder="Preencha aqui o número de instalação junto a concessionária."
						value={requestInfo.numeroInstalacao ? requestInfo.numeroInstalacao : ""}
						handleChange={(value) => setRequestInfo({ ...requestInfo, numeroInstalacao: value })}
					/>
				</div>
				<div className="flex items-center justify-center">
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
						selectedItemLabel="NÃO DEFINIDO"
						onReset={() => setRequestInfo((prev) => ({ ...prev, tipoDoTitular: undefined }))}
					/>
				</div>
				<div className="flex items-center justify-center">
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
						selectedItemLabel="NÃO DEFINIDO"
						onReset={() => setRequestInfo((prev) => ({ ...prev, tipoDaLigacao: undefined }))}
					/>
				</div>
				<div className="flex items-center justify-center">
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
						selectedItemLabel="NÃO DEFINIDO"
						onReset={() =>
							setRequestInfo((prev) => ({
								...prev,
								tipoDaInstalacao: undefined,
							}))
						}
					/>
				</div>
				<h1 className="col-span-3 pt-2 text-center font-bold text-[#fead61]">ENDEREÇO DA INSTALAÇÃO</h1>
				<div className="col-span-3 flex items-center justify-center">
					<button onClick={() => useMailInfo()} className="rounded bg-[#15599a] p-2 text-xs font-medium text-white">
						Usar informações de endereço da correspondência
					</button>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-x-2">
					<TextInput
						editable={true}
						label={"CEP INSTALAÇÃO"}
						placeholder="Preencha aqui o CEP do local de instalação do sistema."
						value={requestInfo.cepInstalacao}
						handleChange={(value) => {
							if (value.length == 9) {
								setAddressDataByCEP(value);
							}
							setRequestInfo({
								...requestInfo,
								cepInstalacao: formatToCEP(value),
							});
						}}
					/>
				</div>
				<div className="flex items-center justify-center">
					<TextInput
						label={"ENDEREÇO DE INSTALAÇÃO"}
						editable={true}
						placeholder="Preencha aqui o endereço do local de instalação do sistema."
						value={requestInfo.enderecoInstalacao}
						handleChange={(value) =>
							setRequestInfo({
								...requestInfo,
								enderecoInstalacao: value.toUpperCase(),
							})
						}
					/>
				</div>
				<div className="flex items-center justify-center">
					<TextInput
						label={"Nº"}
						editable={true}
						placeholder="Preencha o número/identificador do local de instalação do sistema."
						value={requestInfo.numeroResInstalacao ? requestInfo.numeroResInstalacao : ""}
						handleChange={(value) => setRequestInfo({ ...requestInfo, numeroResInstalacao: value })}
					/>
				</div>
				<div className="flex items-center justify-center">
					<TextInput
						label={"BAIRRO"}
						placeholder="Preencha aqui o bairro do local de instalação do sistema."
						editable={true}
						value={requestInfo.bairroInstalacao}
						handleChange={(value) =>
							setRequestInfo({
								...requestInfo,
								bairroInstalacao: value.toUpperCase(),
							})
						}
					/>
				</div>
				<div className="flex items-center justify-center">
					<SelectInput
						width={"450px"}
						label={"UF"}
						editable={true}
						options={Object.keys(stateCities).map((state, index) => ({
							id: index + 1,
							label: state,
							value: state,
						}))}
						value={requestInfo.ufInstalacao}
						handleChange={(value) => setRequestInfo({ ...requestInfo, ufInstalacao: value })}
						selectedItemLabel="NÃO DEFINIDO"
						onReset={() => {
							setRequestInfo((prev) => ({ ...prev, ufInstalacao: null }));
						}}
					/>
				</div>
				<div className="flex items-center justify-center">
					<SelectInput
						label={"CIDADE"}
						editable={true}
						value={requestInfo.cidadeInstalacao}
						options={
							requestInfo.ufInstalacao
								? stateCities[requestInfo.ufInstalacao as keyof typeof stateCities].map((city, index) => {
										return {
											id: index,
											value: city,
											label: city,
										};
									})
								: null
						}
						handleChange={(value) => setRequestInfo({ ...requestInfo, cidadeInstalacao: value })}
						selectedItemLabel="NÃO DEFINIDO"
						onReset={() =>
							setRequestInfo((prev) => ({
								...prev,
								cidadeInstalacao: undefined,
							}))
						}
					/>
				</div>
				<div className="flex items-center justify-center">
					<TextInput
						label={"PONTO DE REFERÊNCIA DA INSTALAÇÃO"}
						placeholder="Preencha aqui um ponto de referência do local de instalação."
						editable={true}
						value={requestInfo.pontoDeReferenciaInstalacao}
						handleChange={(value) =>
							setRequestInfo({
								...requestInfo,
								pontoDeReferenciaInstalacao: value,
							})
						}
					/>
				</div>
				<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
					<TextInput
						label={"LATITUDE"}
						value={requestInfo.latitude}
						placeholder="Preencha aqui a latitude do local de instalação."
						editable={true}
						handleChange={(value) => setRequestInfo({ ...requestInfo, latitude: value })}
					/>
					<TextInput
						label={"LONGITUDE"}
						editable={true}
						value={requestInfo.longitude}
						placeholder="Preencha aqui a longitude do local de instalação."
						handleChange={(value) => setRequestInfo({ ...requestInfo, longitude: value })}
					/>
				</div>

				<h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">INFORMAÇÕES DA CONTA DE CEMIG ATENDE</h1>
				<div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
					<TextInput
						label={"LOGIN(CEMIG ATENDE)"}
						editable={true}
						placeholder="Preencha aqui o login do CEMIG ATENDE do cliente."
						value={requestInfo.loginCemigAtende}
						handleChange={(value) => setRequestInfo({ ...requestInfo, loginCemigAtende: value })}
					/>
					<TextInput
						label={"SENHA(CEMIG ATENDE)"}
						placeholder="Preencha aqui a senha do CEMIG ATENDE do cliente."
						editable={true}
						value={requestInfo.senhaCemigAtende}
						handleChange={(value) => setRequestInfo({ ...requestInfo, senhaCemigAtende: value })}
					/>
				</div>
				{/* <h1 className="col-span-3 py-2 text-center font-bold text-[#fead61]">
          DADOS DO SISTEMA
        </h1>
        <div className="col-span-3 flex flex-wrap items-center justify-center gap-2">
          <NumberInput
            label={"POTÊNCIA PICO"}
            editable={true}
            placeholder="Preencha aqui a potência "
            value={requestInfo.potPico ? requestInfo.potPico : null}
            handleChange={(value) =>
              setRequestInfo({
                ...requestInfo,
                potPico: Number(value),
                geracaoPrevista: Number(value) * 126,
              })
            }
          />
          <NumberInput
            label={"GERAÇÃO PREVISTA"}
            placeholder="Preencha aqui a geração prevista do sistema."
            editable={true}
            value={
              requestInfo.geracaoPrevista ? requestInfo.geracaoPrevista : null
            }
            handleChange={(value) =>
              setRequestInfo({ ...requestInfo, geracaoPrevista: Number(value) })
            }
          />
        </div> */}
			</div>
			<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
				<button
					onClick={() => {
						goToPreviousStage();
					}}
					className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
				>
					Voltar
				</button>
				<button
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
		</div>
	);
}

export default HomologationInfo;
