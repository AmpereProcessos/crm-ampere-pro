import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import ResponsiveDialogDrawerSection from "@/components/utils/ResponsiveDialogDrawerSection";
import { stateCities } from "@/utils/estados_cidades";
import { formatToCEP, getCEPInfo } from "@/utils/methods";
import type { THomologation } from "@/utils/schemas/homologation.schema";
import { MapPin } from "lucide-react";
import type React from "react";
import toast from "react-hot-toast";

type LocationInformationProps = {
	infoHolder: THomologation;
	setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};
function LocationInformation({ infoHolder, setInfoHolder }: LocationInformationProps) {
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
		<ResponsiveDialogDrawerSection sectionTitleText="LOCALIZAÇÃO DA INSTALAÇÃO ELÉTRICA" sectionTitleIcon={<MapPin className="w-4 h-4 min-w-4 min-h-4" />}>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="CEP"
						value={infoHolder.localizacao.cep || ""}
						placeholder="Preencha aqui o CEP da instalação..."
						handleChange={(value) => {
							if (value.length === 9) {
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
				</div>
				<div className="w-full lg:w-1/3">
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
								localizacao: { ...prev.localizacao, uf: "", cidade: "" },
							}))
						}
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
						value={infoHolder.localizacao.cidade}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								localizacao: { ...prev.localizacao, cidade: value },
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
								localizacao: { ...prev.localizacao, cidade: "" },
							}))
						}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="BAIRRO"
						value={infoHolder.localizacao.bairro || ""}
						placeholder="Preencha aqui o bairro do instalação..."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								localizacao: { ...prev.localizacao, bairro: value },
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="LOGRADOURO/RUA"
						value={infoHolder.localizacao.endereco || ""}
						placeholder="Preencha aqui o logradouro da instalação..."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								localizacao: { ...prev.localizacao, endereco: value },
							}))
						}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="NÚMERO/IDENTIFICADOR"
						value={infoHolder.localizacao.numeroOuIdentificador || ""}
						placeholder="Preencha aqui o número ou identificador da residência da instalação..."
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
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="COMPLEMENTO"
						value={infoHolder.localizacao.complemento || ""}
						placeholder="Preencha aqui algum complemento do endereço..."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								localizacao: { ...prev.localizacao, complemento: value },
							}))
						}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="LATITUDE"
						value={infoHolder.localizacao.latitude || ""}
						placeholder="Preencha aqui a latitude da instalação..."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								localizacao: { ...prev.localizacao, latitude: value },
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="LONGITUDE"
						value={infoHolder.localizacao.longitude || ""}
						placeholder="Preencha aqui a longitude da instalação..."
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								localizacao: { ...prev.localizacao, longitude: value },
							}))
						}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawerSection>
	);
}

export default LocationInformation;
