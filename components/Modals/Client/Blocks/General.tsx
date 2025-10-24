import { LayoutGrid } from "lucide-react";
import DateInput from "@/components/Inputs/DateInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import { formatDateForInputValue, formatToCPForCNPJ, formatToPhone } from "@/utils/methods";
import { useAcquisitionChannels } from "@/utils/queries/utils";
import type { TClient } from "@/utils/schemas/client.schema";
import { MaritalStatus } from "@/utils/select-options";

type ClientGeneralBlockProps = {
	infoHolder: TClient;
	updateInfoHolder: (changes: Partial<TClient>) => void;
};
export default function ClientGeneralBlock({ infoHolder, updateInfoHolder }: ClientGeneralBlockProps) {
	const { data: acquisitionChannels } = useAcquisitionChannels();

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="INFORMAÇÕES DO CLIENTE" sectionTitleIcon={<LayoutGrid size={15} />}>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NOME (*)"
						value={infoHolder.nome}
						placeholder="Preencha aqui o nome do cliente."
						handleChange={(value) => updateInfoHolder({ nome: value })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="CPF/CNPJ"
						value={infoHolder.cpfCnpj ?? ""}
						placeholder="Preencha aqui o CPF ou CNPJ do cliente."
						handleChange={(value) => updateInfoHolder({ cpfCnpj: formatToCPForCNPJ(value) })}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<DateInput
						label={"DATA DE NASCIMENTO"}
						editable={true}
						value={infoHolder.dataNascimento ? formatDateForInputValue(infoHolder.dataNascimento) : undefined}
						handleChange={(value) => updateInfoHolder({ dataNascimento: formatDateOnInputChange(value, "string") as string })}
						width={"100%"}
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="PROFISSÃO"
						value={infoHolder.profissao ?? ""}
						placeholder="Preencha aqui a profissão do cliente."
						handleChange={(value) => updateInfoHolder({ profissao: value })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="ESTADO CIVIL"
						value={infoHolder.estadoCivil ?? null}
						options={MaritalStatus}
						handleChange={(value) => updateInfoHolder({ estadoCivil: value })}
						onReset={() => updateInfoHolder({ estadoCivil: null })}
						resetOptionLabel="NÃO DEFINIDO"
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="CANAL DE AQUISIÇÃO"
						value={infoHolder.canalAquisicao ?? null}
						options={
							acquisitionChannels?.map((c) => ({
								id: c._id,
								label: c.valor,
								value: c.valor,
							})) || []
						}
						handleChange={(value) => updateInfoHolder({ canalAquisicao: value })}
						onReset={() => updateInfoHolder({ canalAquisicao: undefined })}
						resetOptionLabel="NÃO DEFINIDO"
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="NOME DO INDICADOR (SE INDICAÇÃO)"
						value={infoHolder.indicador.nome || ""}
						placeholder="Preencha aqui o nome do indicador..."
						handleChange={(value) => updateInfoHolder({ indicador: { ...infoHolder.indicador, nome: value } })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="TELEFONE DO INDICADOR (SE INDICAÇÃO)"
						value={infoHolder.indicador.contato ?? ""}
						placeholder="Preencha aqui o contato do indicador..."
						handleChange={(value) => updateInfoHolder({ indicador: { ...infoHolder.indicador, contato: formatToPhone(value) } })}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}
