import { TPartner } from "@/utils/schemas/partner.schema";
import React from "react";
import TextInput from "../Inputs/TextInput";
import { formatToCEP, getCEPInfo } from "@/utils/methods";
import toast from "react-hot-toast";
import { stateCities } from "@/utils/estados_cidades";
import SelectInput from "../Inputs/SelectInput";

type AddressInformationBlockProps = {
	infoHolder: TPartner;
	setInfoHolder: React.Dispatch<React.SetStateAction<TPartner>>;
};
function AddressInformationBlock({ infoHolder, setInfoHolder }: AddressInformationBlockProps) {
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
				setInfoHolder((prev) => ({
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
			<h1 className="w-full rounded-sm bg-[#fead41] p-1 text-center text-sm font-bold text-white">INFORMAÇÕES DE ENDEREÇO</h1>
			<div className="grid grid-cols-1 grid-rows-3 items-center gap-6 px-2 lg:grid-cols-3 lg:grid-rows-1">
				<TextInput
					label="CEP"
					value={infoHolder.localizacao.cep || ""}
					placeholder="Preencha aqui o CEP do cliente."
					handleChange={(value) => {
						if (value.length == 9) {
							setAddressDataByCEP(value);
						}
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								cep: formatToCEP(value),
							},
						}));
					}}
					width="100%"
				/>
				<SelectInput
					label="ESTADO"
					value={infoHolder.localizacao.uf}
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								uf: value,
								cidade: stateCities[value as keyof typeof stateCities][0] as string,
							},
						}))
					}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								uf: "",
								cidade: "",
							},
						}))
					}
					options={Object.keys(stateCities).map((state, index) => ({
						id: index + 1,
						label: state,
						value: state,
					}))}
					width="100%"
				/>
				<SelectInput
					label="CIDADE"
					value={infoHolder.localizacao.cidade}
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								cidade: value,
							},
						}))
					}
					options={
						infoHolder.localizacao.uf
							? stateCities[infoHolder.localizacao.uf as keyof typeof stateCities].map((city, index) => ({
									id: index + 1,
									value: city,
									label: city,
								}))
							: null
					}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								cidade: "",
							},
						}))
					}
					width="100%"
				/>
			</div>
			<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
				<TextInput
					label="BAIRRO"
					value={infoHolder.localizacao.bairro || ""}
					placeholder="Preencha aqui o bairro do cliente."
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								bairro: value,
							},
						}))
					}
					width="100%"
				/>
				<TextInput
					label="LOGRADOURO/RUA"
					value={infoHolder.localizacao.endereco || ""}
					placeholder="Preencha aqui o logradouro do cliente."
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								endereco: value,
							},
						}))
					}
					width="100%"
				/>
			</div>
			<div className="mb-2 grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
				<TextInput
					label="NÚMERO/IDENTIFICADOR"
					value={infoHolder.localizacao.numeroOuIdentificador || ""}
					placeholder="Preencha aqui o número ou identificador da residência do cliente."
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								numeroOuIdentificador: value,
							},
						}))
					}
					width="100%"
				/>
				<TextInput
					label="COMPLEMENTO"
					value={infoHolder.localizacao.complemento || ""}
					placeholder="Preencha aqui algum complemento do endereço."
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								complemento: value,
							},
						}))
					}
					width="100%"
				/>
			</div>
		</div>
	);
}

export default AddressInformationBlock;
