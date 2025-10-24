import { THomologationDTO } from "@/utils/schemas/homologation.schema";
import React from "react";

import DateInput from "@/components/Inputs/DateInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { formatDateForInputValue } from "@/utils/methods";

type AccessInformationProps = {
	infoHolder: THomologationDTO;
	setInfoHolder: React.Dispatch<React.SetStateAction<THomologationDTO>>;
};
function AccessInformation({ infoHolder, setInfoHolder }: AccessInformationProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">INFORMAÇÕES SOBRE O PARECER DE ACESSO</h1>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="CÓDIGO (NS) DA HOMOLOGAÇÃO"
						placeholder="Preencha o código de acompanhamento da homologação..."
						value={infoHolder.acesso.codigo}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, acesso: { ...prev.acesso, codigo: value } }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<DateInput
						label="DATA DE SOLICITAÇÃO DA HOMOLOGAÇÃO"
						value={formatDateForInputValue(infoHolder.acesso.dataSolicitacao)}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, acesso: { ...prev.acesso, dataSolicitacao: formatDateOnInputChange(value) } }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<DateInput
						label="DATA DE RESPOSTA DA HOMOLOGAÇÃO"
						value={formatDateForInputValue(infoHolder.acesso.dataResposta)}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, acesso: { ...prev.acesso, dataResposta: formatDateOnInputChange(value) } }))}
						width="100%"
					/>
				</div>
			</div>
		</div>
	);
}

export default AccessInformation;
