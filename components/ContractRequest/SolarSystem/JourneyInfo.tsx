import TextInput from "@/components/Inputs/TextInput";
import { formatToPhone } from "@/utils/methods";
import { TContractRequest } from "@/utils/schemas//contract-request.schema";
import React from "react";
import { toast } from "react-hot-toast";
type JourneyInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function JourneyInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage }: JourneyInfoProps) {
	function validateFields() {
		if (requestInfo.nomeContatoJornadaUm.trim().length < 6) {
			toast.error("Por favor, preencha o nome do contato primário");
			return false;
		}
		if (requestInfo.telefoneContatoUm.trim().length < 9) {
			toast.error("Por favor, preencha o telefone do contato primário");
			return false;
		}
		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-background pb-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS PARA CONTATO</span>
			<div className="flex grow flex-col gap-2 p-2">
				<div className="grid w-full grid-cols-2 gap-2">
					<div className="w-full">
						<TextInput
							width="100%"
							label={"NOME DO CONTATO 1"}
							placeholder="Preencha aqui o nome do contato primário para a jornada do cliente."
							editable={true}
							value={requestInfo.nomeContatoJornadaUm}
							handleChange={(value) =>
								setRequestInfo({
									...requestInfo,
									nomeContatoJornadaUm: value,
								})
							}
						/>
					</div>
					<div className="w-full">
						<TextInput
							width="100%"
							label={"TELEFONE DO CONTATO 1"}
							placeholder="Preencha aqui o telefone do contato primário para a jornada do cliente."
							editable={true}
							value={requestInfo.telefoneContatoUm}
							handleChange={(value) =>
								setRequestInfo({
									...requestInfo,
									telefoneContatoUm: formatToPhone(value),
								})
							}
						/>
					</div>
				</div>
				<div className="grid w-full grid-cols-2 gap-2">
					<div className="w-full">
						<TextInput
							width="100%"
							label={"NOME DO CONTATO 2"}
							placeholder="Preencha aqui o nome do contato secundário para a jornada do cliente."
							editable={true}
							value={requestInfo.nomeContatoJornadaDois}
							handleChange={(value) =>
								setRequestInfo({
									...requestInfo,
									nomeContatoJornadaDois: value.toUpperCase(),
								})
							}
						/>
					</div>
					<div className="w-full">
						<TextInput
							width="100%"
							label={"TELEFONE DO CONTATO 2"}
							placeholder="Preencha aqui o telefone do contato secundário para a jornada do cliente."
							editable={true}
							value={requestInfo.telefoneContatoDois}
							handleChange={(value) =>
								setRequestInfo({
									...requestInfo,
									telefoneContatoDois: formatToPhone(value),
								})
							}
						/>
					</div>
				</div>

				<div className="mt-2 flex w-full flex-col items-center self-center px-2">
					<span className="font-raleway text-center text-sm font-bold uppercase">CUIDADOS PARA CONTATO COM O CLIENTE</span>
					<textarea
						placeholder={"Descreva aqui cuidados em relação ao contato do cliente durante a jornada. Melhores horários para contato, texto ou aúdio, etc..."}
						value={requestInfo.cuidadosContatoJornada}
						onChange={(e) =>
							setRequestInfo({
								...requestInfo,
								cuidadosContatoJornada: e.target.value,
							})
						}
						className="block h-[80px] w-full resize-none rounded-lg border border-primary/30 bg-primary/10p-2.5 text-center text-primary/90 outline-hidden focus:border-blue-500 focus:ring-blue-500 dark:border-primary/60 dark:bg-primary/70  dark:placeholder-primary/40 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					/>
				</div>
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
						if (validateFields()) {
							goToNextStage();
						}
					}}
					className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default JourneyInfo;
