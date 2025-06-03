import DateInput from "@/components/Inputs/DateInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { formatDateInputChange } from "@/lib/methods/formatting";
import { stateCities } from "@/utils/estados_cidades";
import { formatDateForInput, formatToCEP, getCEPInfo } from "@/utils/methods";
import { TPurchaseDTO } from "@/utils/schemas/purchase.schema";
import { PurchaseDeliveryStatus } from "@/utils/select-options";
import React from "react";
import toast from "react-hot-toast";

type DeliveryInformationBlockProps = {
	infoHolder: TPurchaseDTO;
	setInfoHolder: React.Dispatch<React.SetStateAction<TPurchaseDTO>>;
};
function DeliveryInformationBlock({ infoHolder, setInfoHolder }: DeliveryInformationBlockProps) {
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
					entrega: {
						...prev.entrega,
						localizacao: {
							...prev.entrega.localizacao,
							endereco: addressInfo.logradouro,
							bairro: addressInfo.bairro,
							uf: addressInfo.uf as keyof typeof stateCities,
							cidade: addressInfo.localidade.toUpperCase(),
						},
					},
				}));
			}
		}, 1000);
	}
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES DE ENTREGA</h1>
			<div className="flex w-full flex-col gap-1">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="STATUS DA ENTREGA"
							value={infoHolder.entrega.status}
							options={PurchaseDeliveryStatus}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, status: value } }))}
							onReset={() => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, status: null } }))}
							resetOptionLabel="NÃO DEFINIDO"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<DateInput
							label="DATA DE PREVISÃO DA ENTREGA"
							value={formatDateForInput(infoHolder.entrega.previsao)}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, previsao: formatDateInputChange(value) } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<DateInput
							label="DATA DE EFETIVAÇÃO DA ENTREGA"
							value={formatDateForInput(infoHolder.entrega.efetivacao)}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, efetivacao: formatDateInputChange(value) } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/3">
						<TextInput
							label="CEP"
							value={infoHolder.entrega.localizacao.cep || ""}
							placeholder="Preencha aqui o CEP da instalação..."
							handleChange={(value) => {
								if (value.length == 9) {
									setAddressDataByCEP(value);
								}
								setInfoHolder((prev) => ({
									...prev,
									entrega: {
										localizacao: {
											...prev.entrega.localizacao,
											cep: formatToCEP(value),
										},
									},
								}));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="ESTADO"
							value={infoHolder.entrega.localizacao.uf}
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									entrega: {
										...prev.entrega,
										localizacao: { ...prev.entrega.localizacao, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string },
									},
								}))
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() =>
								setInfoHolder((prev) => ({
									...prev,
									entrega: {
										...prev.entrega,
										localizacao: { ...prev.entrega.localizacao, uf: "", cidade: "" },
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
					</div>
					<div className="w-full lg:w-1/3">
						<SelectInput
							label="CIDADE"
							value={infoHolder.entrega.localizacao.cidade}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, localizacao: { ...prev.entrega.localizacao, cidade: value } } }))}
							options={
								infoHolder.entrega.localizacao.uf
									? stateCities[infoHolder.entrega.localizacao.uf as keyof typeof stateCities].map((city, index) => ({
											id: index + 1,
											value: city,
											label: city,
										}))
									: null
							}
							resetOptionLabel="NÃO DEFINIDO"
							onReset={() => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, localizacao: { ...prev.entrega.localizacao, cidade: "" } } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="BAIRRO"
							value={infoHolder.entrega.localizacao.bairro || ""}
							placeholder="Preencha aqui o bairro do instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, localizacao: { ...prev.entrega.localizacao, bairro: value } } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="LOGRADOURO/RUA"
							value={infoHolder.entrega.localizacao.endereco || ""}
							placeholder="Preencha aqui o logradouro da instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, localizacao: { ...prev.entrega.localizacao, endereco: value } } }))}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NÚMERO/IDENTIFICADOR"
							value={infoHolder.entrega.localizacao.numeroOuIdentificador || ""}
							placeholder="Preencha aqui o número ou identificador da residência da instalação..."
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									entrega: {
										...prev.entrega,
										localizacao: { ...prev.entrega.localizacao, numeroOuIdentificador: value },
									},
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="COMPLEMENTO"
							value={infoHolder.entrega.localizacao.complemento || ""}
							placeholder="Preencha aqui algum complemento do endereço..."
							handleChange={(value) =>
								setInfoHolder((prev) => ({
									...prev,
									entrega: {
										...prev.entrega,
										localizacao: { ...prev.entrega.localizacao, complemento: value },
									},
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
							value={infoHolder.entrega.localizacao.latitude || ""}
							placeholder="Preencha aqui a latitude da instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, localizacao: { ...prev.entrega.localizacao, latitude: value } } }))}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="LONGITUDE"
							value={infoHolder.entrega.localizacao.longitude || ""}
							placeholder="Preencha aqui a longitude da instalação..."
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, entrega: { ...prev.entrega, localizacao: { ...prev.entrega.localizacao, longitude: value } } }))}
							width="100%"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DeliveryInformationBlock;
