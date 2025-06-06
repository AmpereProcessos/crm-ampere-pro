import { TProjectDTO } from "@/utils/schemas/project.schema";
import { TPurchase, TPurchaseCompositionItem } from "@/utils/schemas/purchase.schema";
import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import TextInput from "../../Inputs/TextInput";
import { formatDateForInput, formatToCEP, formatToPhone, getCEPInfo } from "@/utils/methods";
import SelectInput from "../../Inputs/SelectInput";
import { PurchaseDeliveryStatus, PurchaseStatus } from "@/utils/select-options";
import PurchaseCompositionBlock from "./PurchaseCompositionBlock";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { createPurchase } from "@/utils/mutations/purchases";
import DateInput from "@/components/Inputs/DateInput";
import { formatDateInputChange } from "@/lib/methods/formatting";
import TextareaInput from "@/components/Inputs/TextareaInput";
import type { TUserSession } from "@/lib/auth/session";
import CheckboxInput from "@/components/Inputs/CheckboxInput";
import { stateCities } from "@/utils/estados_cidades";
import toast from "react-hot-toast";

type NewPurchaseMenuProps = {
	session: TUserSession;
	project: TProjectDTO;
	closeMenu: () => void;
};
function NewPurchaseMenu({ session, project, closeMenu }: NewPurchaseMenuProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TPurchase>({
		titulo: "",
		status: null,
		idParceiro: project.idParceiro,
		projeto: {
			id: project._id,
			indexador: project.indexador,
			nome: project.nome,
			tipo: project.tipo.titulo,
			identificador: project.identificador,
		},
		anotacoes: "",
		composicao: [],
		total: 0,
		liberacao: {},
		pedido: {
			fornecedor: {
				nome: "",
				contato: "",
			},
		},
		transporte: {
			transportadora: {
				nome: "",
				contato: "",
			},
		},

		faturamento: {},
		entrega: {
			localizacao: {
				cep: project.localizacao.cep,
				uf: project.localizacao.uf,
				cidade: project.localizacao.cidade,
				bairro: project.localizacao.bairro,
				endereco: project.localizacao.endereco,
				numeroOuIdentificador: project.localizacao.numeroOuIdentificador,
				complemento: project.localizacao.complemento,
				// distancia: z.number().optional().nullable(),
			},
		},

		dataInsercao: new Date().toISOString(),
	});
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
	const { mutate: handleCreatePurchase, isPending } = useMutationWithFeedback({
		mutationKey: ["create-purchase"],
		mutationFn: createPurchase,
		queryClient: queryClient,
		affectedQueryKey: ["purchase-by-project-id", project._id],
	});
	return (
		<div className="flex w-full flex-col gap-2 rounded border border-gray-500 p-6">
			<div className="flex w-full items-center justify-between gap-2">
				<h1 className="text-sm font-bold tracking-tight">NOVA COMPRA</h1>
				<button onClick={closeMenu} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
					<VscChromeClose style={{ color: "red" }} />
				</button>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="TÍTULO DA COMPRA"
						placeholder="Preencha o título da registro de compra..."
						value={infoHolder.titulo}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titulo: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<SelectInput
						label="STATUS DA COMPRA"
						value={infoHolder.status}
						options={PurchaseStatus}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, status: value }))}
						onReset={() => setInfoHolder((prev) => ({ ...prev, status: null }))}
						resetOptionLabel="NÃO DEFINIDO"
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="flex w-full items-center justify-center lg:w-1/2">
					<div className="w-fit">
						<CheckboxInput
							labelFalse="COMPRA LIBERADA"
							labelTrue="COMPRA LIBERADA"
							checked={!!infoHolder.liberacao.data}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, liberacao: { ...prev.liberacao, data: value ? new Date().toISOString() : null } }))}
						/>
					</div>
				</div>
				<div className="w-full lg:w-1/2">
					<DateInput
						label="DATA DE LIBERAÇÃO"
						value={formatDateForInput(infoHolder.liberacao.data)}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, liberacao: { ...prev.liberacao, data: formatDateInputChange(value) } }))}
						width="100%"
					/>
				</div>
			</div>
			<TextareaInput
				label="ANOTAÇÕES"
				placeholder="Preencha aqui detalhes da compra, informações relevantes, entre outros..."
				value={infoHolder.anotacoes}
				handleChange={(value) => setInfoHolder((prev) => ({ ...prev, anotacoes: value }))}
			/>
			<PurchaseCompositionBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			<h1 className="w-full text-start text-sm font-light text-gray-500">PEDIDO</h1>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<DateInput
						label="DATA DO PEDIDO"
						value={formatDateForInput(infoHolder.pedido.data)}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, pedido: { ...prev.pedido, data: formatDateInputChange(value) } }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="NOME DO FORNECEDOR"
						placeholder="Preencha o nome do fornecedor..."
						value={infoHolder.pedido.fornecedor.nome}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, pedido: { ...prev.pedido, fornecedor: { ...prev.pedido.fornecedor, nome: value } } }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="CONTATO DO FORNECEDOR"
						placeholder="Preencha o telefone de contato do fornecedor..."
						value={infoHolder.pedido.fornecedor.contato}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, pedido: { ...prev.pedido, fornecedor: { ...prev.pedido.fornecedor, contato: value } } }))}
						width="100%"
					/>
				</div>
			</div>
			<h1 className="w-full text-start text-sm font-light text-gray-500">FRETE</h1>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/3">
					<TextInput
						label="NOME DA TRANSPORTADORA"
						placeholder="Preencha o nome da transportadora..."
						value={infoHolder.transporte.transportadora.nome}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transporte: { ...prev.transporte, transportadora: { ...prev.transporte.transportadora, nome: value } } }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="CONTATO DA TRANSPORTADORA"
						placeholder="Preencha o telefone de contato da transportadora..."
						value={infoHolder.transporte.transportadora.contato}
						handleChange={(value) =>
							setInfoHolder((prev) => ({
								...prev,
								transporte: { ...prev.transporte, transportadora: { ...prev.transporte.transportadora, contato: formatToPhone(value) } },
							}))
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<TextInput
						label="LINK DE RASTREIO (SE HOUVER)"
						placeholder="Preencha, se houver, o link de rastreio..."
						value={infoHolder.titulo}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titulo: value }))}
						width="100%"
					/>
				</div>
			</div>
			<h1 className="w-full text-start text-sm font-light text-gray-500">FATURAMENTO</h1>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<DateInput
						label="DATA DE FATURAMENTO"
						value={formatDateForInput(infoHolder.faturamento.data)}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, faturamento: { ...prev.faturamento, data: formatDateInputChange(value) } }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="CÓDIGO DA NOTA FISCAL"
						placeholder="Preencha o código da nota fiscal..."
						value={infoHolder.faturamento.codigoNotaFiscal || ""}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, faturamento: { ...prev.faturamento, codigoNotaFiscal: value } }))}
						width="100%"
					/>
				</div>
			</div>
			<h1 className="w-full text-start text-sm font-light text-gray-500">ENTREGA</h1>
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
			<div className="flex w-full items-center justify-end p-2">
				<button
					disabled={isPending}
					onClick={() => {
						const isApproved = !!infoHolder.liberacao.data;
						const author = isApproved ? { id: session.user.id, nome: session.user.nome, avatar_url: session.user.avatar_url } : null;
						// @ts-ignore
						handleCreatePurchase({ info: { ...infoHolder, liberacao: { ...infoHolder.liberacao, autor: author } } });
					}}
					className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
				>
					CRIAR COMPRA
				</button>
			</div>
		</div>
	);
}

export default NewPurchaseMenu;
