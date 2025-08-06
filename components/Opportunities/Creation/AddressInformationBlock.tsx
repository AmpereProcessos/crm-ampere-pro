import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { stateCities } from "@/utils/estados_cidades";
import { formatToCEP, getCEPInfo } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { MapPin } from "lucide-react";
import React, { type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";

type AddressInformationBlockProps = {
	opportunity: TOpportunity;
	setOpportunity: Dispatch<SetStateAction<TOpportunity>>;
	client: TClient;
	setClient: Dispatch<SetStateAction<TClient>>;
};
function AddressInformationBlock({ opportunity, setOpportunity, client, setClient }: AddressInformationBlockProps) {
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
				setClient((prev) => ({
					...prev,
					endereco: addressInfo.logradouro,
					bairro: addressInfo.bairro,
					uf: addressInfo.uf as keyof typeof stateCities,
					cidade: addressInfo.localidade.toUpperCase(),
				}));
				setOpportunity((prev) => ({
					...prev,
					localizacao: {
						...prev.localizacao,
						endereco: addressInfo.logradouro,
						bairro: addressInfo.bairro,
						uf: addressInfo.uf as keyof typeof stateCities,
						cidade: addressInfo.localidade.toUpperCase(),
					},
				}));
			}
		}, 1000);
	}
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
				<MapPin size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DE ENDEREÇO</h1>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="CEP"
						value={client.cep || ""}
						placeholder="Preencha aqui o CEP do cliente."
						handleChange={(value) => {
							if (value.length === 9) {
								setAddressDataByCEP(value);
							}
							setClient((prev) => ({
								...prev,
								cep: formatToCEP(value),
							}));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cep: formatToCEP(value) } }));
						}}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="ESTADO"
						value={client.uf}
						handleChange={(value) => {
							setClient((prev) => ({ ...prev, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string }));
							setOpportunity((prev) => ({
								...prev,
								localizacao: { ...prev.localizacao, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string },
							}));
						}}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setClient((prev) => ({ ...prev, uf: "", cidade: "" }));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: "", cidade: "" } }));
						}}
						options={Object.keys(stateCities).map((state, index) => ({
							id: index + 1,
							label: state,
							value: state,
						}))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="CIDADE"
						value={client.cidade}
						handleChange={(value) => {
							setClient((prev) => ({ ...prev, cidade: value }));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }));
						}}
						options={client.uf ? stateCities[client.uf as keyof typeof stateCities].map((city, index) => ({ id: index + 1, value: city, label: city })) : null}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => {
							setClient((prev) => ({ ...prev, cidade: "" }));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: "" } }));
						}}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="BAIRRO"
						value={client.bairro || ""}
						placeholder="Preencha aqui o bairro do cliente."
						handleChange={(value) => {
							setClient((prev) => ({ ...prev, bairro: value }));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }));
						}}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="LOGRADOURO/RUA"
						value={client.endereco || ""}
						placeholder="Preencha aqui o logradouro do cliente."
						handleChange={(value) => {
							setClient((prev) => ({ ...prev, endereco: value }));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }));
						}}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NÚMERO/IDENTIFICADOR"
						value={client.numeroOuIdentificador || ""}
						placeholder="Preencha aqui o número ou identificador da residência do cliente."
						handleChange={(value) => {
							setClient((prev) => ({
								...prev,
								numeroOuIdentificador: value,
							}));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, numeroOuIdentificador: value } }));
						}}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="COMPLEMENTO"
						value={client.complemento || ""}
						placeholder="Preencha aqui algum complemento do endereço."
						handleChange={(value) => {
							setClient((prev) => ({
								...prev,
								complemento: value,
							}));
							setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, complemento: value } }));
						}}
						width="100%"
					/>
				</div>
			</div>
		</div>
	);
}

export default AddressInformationBlock;
