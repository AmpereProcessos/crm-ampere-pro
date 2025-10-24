import { useState } from "react";
import toast from "react-hot-toast";

import SelectInput from "../Inputs/SelectInput";
import TextInput from "../Inputs/TextInput";
import Avatar from "../utils/Avatar";

import { stateCities } from "@/utils/estados_cidades";
import { formatToCEP, formatToPhone, getCEPInfo } from "@/utils/methods";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { editPartner } from "@/utils/mutations/onboarding";
import { TPartnerDTO } from "@/utils/schemas/partner.schema";
import { useQueryClient } from "@tanstack/react-query";

type PartnerProps = {
	partner: TPartnerDTO;
	goToNextStage: () => void;
};
function Partner({ partner, goToNextStage }: PartnerProps) {
	const queryClient = useQueryClient();
	const [editImage, setEditImage] = useState<{ enabled: boolean; temporaryUrl: null | string }>({
		enabled: false,
		temporaryUrl: null,
	});
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [partnerHolder, setPartnerHolder] = useState<TPartnerDTO>(partner);

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
				setPartnerHolder((prev) => ({
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
	async function handleProceed() {
		try {
			if (partnerHolder.contatos.telefonePrimario.trim().length < 11) throw new Error("Preencha um telefone de contato válido.");
			if (partnerHolder.contatos.email.trim().length < 5) throw new Error("Preencha um email válido.");
			if (partnerHolder.descricao.trim().length < 10) throw new Error("Preencha uma descrição de ao menos 10 caracteres");
			if (partnerHolder.localizacao.uf.trim().length <= 1) throw new Error("Preencha uma UF válida.");
			if (partnerHolder.localizacao.cidade.trim().length <= 1) throw new Error("Preencha uma cidade válida.");

			const updateInfo = { ...partnerHolder };
			await editPartner({ id: partner._id, info: updateInfo, logo: logoFile });
			return "Alterações feitas com sucesso !";
		} catch (error) {
			throw error;
		}
	}
	const { mutate, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-partner", partner._id],
		mutationFn: handleProceed,
		queryClient: queryClient,
		affectedQueryKey: ["partner-by-id", partner._id],
		callbackFn: () => goToNextStage(),
	});
	return (
		<div className="flex h-full w-full flex-col gap-y-2">
			<h1 className="mt-4 w-full text-center text-lg tracking-tight text-primary/70">Bem vindo ao processo de onboarding.</h1>
			<h1 className="mb-4 w-full text-center text-lg tracking-tight text-primary/70">
				Passaremos por algumas etapas para configurar informações da empresa e de outros detalhes.
			</h1>
			<h1 className="w-full bg-[#fead41] p-1 text-center font-bold text-primary-foreground">DADOS DA EMPRESA</h1>
			<div className="flex w-full flex-col items-center gap-2 px-2 lg:flex-row">
				<div className="relative flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 rounded-full ">
					{partner.logo_url && !editImage.enabled ? (
						<div className="flex h-[150px] w-full flex-col items-center gap-2">
							<div className="flex h-[120px] w-[120px] items-center justify-center self-center">
								<Avatar url={partner.logo_url} width={120} height={120} fallback="L" />
							</div>
							<button
								onClick={() => setEditImage((prev) => ({ ...prev, enabled: true }))}
								className="w-fit rounded-sm border border-black p-1 font-Raleway text-xs font-medium duration-300 ease-in-out hover:bg-black hover:text-primary-foreground"
							>
								EDITAR IMAGEM
							</button>
						</div>
					) : (
						<div className="flex h-[150px] w-full flex-col items-center gap-2">
							<div className="relative flex h-[200px] w-[200px]  items-center justify-center">
								{logoFile && !!editImage.temporaryUrl ? (
									<div className="flex h-[120px] w-[120px] items-center justify-center self-center">
										<Avatar url={editImage.temporaryUrl} width={120} height={120} fallback="L" />
									</div>
								) : (
									<div className=" flex h-[120px] w-[120px] items-center justify-center rounded-full border border-primary/30 bg-primary/30">
										<p className="absolute w-full text-center text-xxs font-bold text-primary/70">ESCOLHA UMA LOGO</p>
									</div>
								)}
								<input
									onChange={(e) => {
										if (e.target.files && e.target.files[0]) {
											const file = e.target.files[0];
											setLogoFile(file);
											const previewURL = URL.createObjectURL(file);
											setEditImage((prev) => ({ ...prev, temporaryUrl: previewURL }));
										} else {
											setLogoFile(null);
											setEditImage((prev) => ({ ...prev, temporaryUrl: null }));
										}
									}}
									className="absolute h-full w-full opacity-0"
									type="file"
									accept=".png, .jpeg"
								/>
							</div>
						</div>
					)}
				</div>
				<div className="flex grow flex-col px-4 lg:px-0">
					<h1 className="text-lg font-bold leading-none tracking-tight">{partner.nome}</h1>
					<h1 className="mb-1 mt-2 text-xs font-medium text-primary/80">PREENCHA UMA DESCRIÇÃO PARA SER A APRESENTAÇÃO DA EMPRESA</h1>
					<textarea
						value={partnerHolder.descricao}
						onChange={(e) => setPartnerHolder((prev) => ({ ...prev, descricao: e.target.value }))}
						className="h-[120px] w-full resize-none rounded-sm border border-primary/30 bg-primary/10p-3 outline-hidden"
						placeholder="Quem são vocês, o que vocês fazem de melhor, por que um cliente deveria escolher vocês, etc..."
					/>
				</div>
			</div>
			<h1 className="w-full  bg-primary/60 p-0.5 text-center text-xs font-bold text-primary-foreground">CONTATOS</h1>
			<div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
				<TextInput
					label="TELEFONE"
					value={partnerHolder.contatos.telefonePrimario || ""}
					placeholder="Preencha aqui o telefone de contato da empresa..."
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
							...prev,
							contatos: {
								...prev.contatos,
								telefonePrimario: formatToPhone(value),
							},
						}))
					}
					width="100%"
				/>
				<TextInput
					label="EMAIL"
					value={partnerHolder.contatos.email || ""}
					placeholder="Preencha aqui o email de contato da empresa..."
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
							...prev,
							contatos: {
								...prev.contatos,
								email: value,
							},
						}))
					}
					width="100%"
				/>
			</div>
			<h1 className="w-full  bg-primary/60 p-0.5 text-center text-xs font-bold text-primary-foreground">INFORMAÇÕES DE ENDEREÇO DA EMPRESA</h1>
			<div className="grid grid-cols-1 grid-rows-3 items-center gap-6 px-2 lg:grid-cols-3 lg:grid-rows-1">
				<TextInput
					label="CEP"
					value={partnerHolder.localizacao.cep || ""}
					placeholder="Preencha aqui o CEP do cliente."
					handleChange={(value) => {
						if (value.length == 9) {
							setAddressDataByCEP(value);
						}
						setPartnerHolder((prev) => ({
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
					value={partnerHolder.localizacao.uf}
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
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
						setPartnerHolder((prev) => ({
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
					value={partnerHolder.localizacao.cidade}
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
							...prev,
							localizacao: {
								...prev.localizacao,
								cidade: value,
							},
						}))
					}
					options={
						partnerHolder.localizacao.uf
							? stateCities[partnerHolder.localizacao.uf as keyof typeof stateCities].map((city, index) => ({
									id: index + 1,
									value: city,
									label: city,
								}))
							: null
					}
					resetOptionLabel="NÃO DEFINIDO"
					onReset={() =>
						setPartnerHolder((prev) => ({
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
					value={partnerHolder.localizacao.bairro || ""}
					placeholder="Preencha aqui o bairro do cliente."
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
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
					value={partnerHolder.localizacao.endereco || ""}
					placeholder="Preencha aqui o logradouro do cliente."
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
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
					value={partnerHolder.localizacao.numeroOuIdentificador || ""}
					placeholder="Preencha aqui o número ou identificador da residência do cliente."
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
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
					value={partnerHolder.localizacao.complemento || ""}
					placeholder="Preencha aqui algum complemento do endereço."
					handleChange={(value) =>
						setPartnerHolder((prev) => ({
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
			<div className="flex w-full items-center justify-end px-2 py-2">
				<button
					disabled={isPending}
					className="rounded bg-black p-1 px-4 text-xs font-medium text-primary-foreground duration-300 ease-in-out disabled:bg-primary/40 disabled:text-primary enabled:hover:bg-primary/60"
					onClick={() => mutate()}
				>
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default Partner;
