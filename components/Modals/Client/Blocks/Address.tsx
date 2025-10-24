import { MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { BrazilianCitiesOptionsFromUF, BrazilianStatesOptions, type stateCities } from "@/utils/estados_cidades";
import { formatToCEP, getCEPInfo } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";

type ClientAddressBlockProps = {
	infoHolder: TClient;
	updateInfoHolder: (changes: Partial<TClient>) => void;
};
export default function ClientAddressBlock({ infoHolder, updateInfoHolder }: ClientAddressBlockProps) {
	async function setAddressDataByCEP(cep: string) {
		const addressInfo = await getCEPInfo(cep);
		const toastID = toast.loading("Buscando informações sobre o CEP...", {
			duration: 2000,
		});
		setTimeout(() => {
			if (addressInfo) {
				toast.dismiss(toastID);
				toast.success("Dados do CEP buscados com sucesso.", {
					duration: 1000,
				});
				updateInfoHolder({
					endereco: addressInfo.logradouro,
					bairro: addressInfo.bairro,
					uf: addressInfo.uf as keyof typeof stateCities,
					cidade: addressInfo.localidade.toUpperCase(),
				});
			}
		}, 1000);
	}
	return (
		<ResponsiveDialogDrawerSection sectionTitleText="ENDEREÇO DO CLIENTE" sectionTitleIcon={<MapPin size={15} />}>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="CEP"
						value={infoHolder.cep || ""}
						placeholder="Preencha aqui o CEP do cliente."
						handleChange={(value) => {
							if (value.length === 9) {
								setAddressDataByCEP(value);
							}
							updateInfoHolder({ cep: formatToCEP(value) });
						}}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="ESTADO"
						value={infoHolder.uf}
						handleChange={(value) => updateInfoHolder({ uf: value, cidade: BrazilianCitiesOptionsFromUF(value)[0]?.value })}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => updateInfoHolder({ uf: "", cidade: "" })}
						options={BrazilianStatesOptions}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="CIDADE"
						value={infoHolder.cidade}
						handleChange={(value) => updateInfoHolder({ cidade: value })}
						options={BrazilianCitiesOptionsFromUF(infoHolder.uf)}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => updateInfoHolder({ cidade: "" })}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="BAIRRO"
						value={infoHolder.bairro || ""}
						placeholder="Preencha aqui o bairro do cliente."
						handleChange={(value) => updateInfoHolder({ bairro: value })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="LOGRADOURO/RUA"
						value={infoHolder.endereco || ""}
						placeholder="Preencha aqui o logradouro do cliente."
						handleChange={(value) => updateInfoHolder({ endereco: value })}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NÚMERO/IDENTIFICADOR"
						value={infoHolder.numeroOuIdentificador || ""}
						placeholder="Preencha aqui o número ou identificador da residência do cliente."
						handleChange={(value) => updateInfoHolder({ numeroOuIdentificador: value })}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="COMPLEMENTO"
						value={infoHolder.complemento || ""}
						placeholder="Preencha aqui algum complemento do endereço."
						handleChange={(value) => updateInfoHolder({ complemento: value })}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}
