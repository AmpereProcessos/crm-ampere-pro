import BulkOperationKit from "@/components/Cards/BulkOperationKit";
import { copyToClipboard } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/methods/errors";
import { getFixedDateFromExcel, getJSONFromExcelFile } from "@/lib/methods/excel-utils";
import { getDateFromLocaleString, getModulesPeakPotByProducts, getPeakPotByModules } from "@/lib/methods/extracting";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createManyKits, deleteManyKits, updateManyKits } from "@/utils/mutations/kits";
import { usePricingMethods } from "@/utils/queries/pricing-methods";
import { KitsBulkOperationItemSchema, TBulkOperationKit, TKit, TKitDTO, TProductItem, TServiceItem } from "@/utils/schemas/kits.schema";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsCloudUploadFill } from "react-icons/bs";
import { FaTag } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { VscChromeClose } from "react-icons/vsc";
import { z } from "zod";
import BulkOperationHelpMenu from "./Utils/BulkOperationHelpMenu";
import { CommonProductsByProjectType, CommonServicesByProjectType } from "@/utils/constants";
import { usePartnersSimplified } from "@/utils/queries/partners";
import user from "@/pages/api/onboarding/user";

function getStatusTag({ active, expiryDate }: { active: boolean; expiryDate?: string | null }) {
	if (!active) return <h1 className="rounded-full bg-gray-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">INATIVO</h1>;
	if (expiryDate && dayjs(expiryDate).isBefore(new Date())) return <h1 className="rounded-full bg-orange-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">VENCIDO</h1>;
	return <h1 className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">ATIVO</h1>;
}

type KitBulkOperationProps = {
	session: TUserSession;
	closeModal: () => void;
};
function KitBulkOperation({ session, closeModal }: KitBulkOperationProps) {
	const userPartnerScope = session.user.permissoes.parceiros.escopo;
	const userPartnerId = session.user.idParceiro;
	const queryClient = useQueryClient();

	const { data: pricingMethods } = usePricingMethods();
	const { data: partners } = usePartnersSimplified();
	const [fileHolder, setFileHolder] = useState<File | null>(null);
	const [kitsHolder, setKitsHolder] = useState<(TKit & { _id: string | null; excluir: boolean })[]>([]);
	async function handleExtracting(file: File | null) {
		if (!file) return toast.error("Arquivo não vinculado.");
		try {
			// Extracting excel data as JSON
			const data = await getJSONFromExcelFile(file);
			// Parsing the JSON obtained to validate types and values in correct form
			const bulkOperationKits = await z.array(KitsBulkOperationItemSchema).parseAsync(data);
			// Formatting data into TKit schema
			const kits: (TKit & { _id: string | null; excluir: boolean })[] = bulkOperationKits.map((bulkKit) => {
				const productsArr = [];
				const servicesArr = [];

				// Defining the first product and pushing it
				const firstProduct: TProductItem = {
					categoria: bulkKit["CATEGORIA PRODUTO 1"],
					fabricante: bulkKit["FABRICANTE PRODUTO 1"],
					modelo: bulkKit["MODELO PRODUTO 1"],
					qtde: bulkKit["QUANTIDADE PRODUTO 1"],
					potencia: bulkKit["POTÊNCIA PRODUTO 1"],
					garantia: bulkKit["GARANTIA PRODUTO 1"],
				};
				productsArr.push(firstProduct);
				// Validating if there is a second product and pushing it
				if (bulkKit["CATEGORIA PRODUTO 2"] && bulkKit["FABRICANTE PRODUTO 2"] && bulkKit["MODELO PRODUTO 2"] && bulkKit["QUANTIDADE PRODUTO 2"] && bulkKit["GARANTIA PRODUTO 2"]) {
					const secondProduct: TProductItem = {
						categoria: bulkKit["CATEGORIA PRODUTO 2"],
						fabricante: bulkKit["FABRICANTE PRODUTO 2"],
						modelo: bulkKit["MODELO PRODUTO 2"],
						qtde: bulkKit["QUANTIDADE PRODUTO 2"],
						potencia: bulkKit["POTÊNCIA PRODUTO 2"],
						garantia: bulkKit["GARANTIA PRODUTO 2"],
					};
					productsArr.push(secondProduct);
				}

				if (bulkKit["DESCRIÇÃO SERVIÇO 1"] && bulkKit["GARANTIA SERVIÇO 1"]) {
					// Defining the first service and pushing it
					const firstService: TServiceItem = {
						descricao: bulkKit["DESCRIÇÃO SERVIÇO 1"],
						observacoes: "",
						garantia: bulkKit["GARANTIA SERVIÇO 1"],
					};
					servicesArr.push(firstService);
				}

				// Validating if there is a second service and pushing it
				if (bulkKit["DESCRIÇÃO SERVIÇO 2"] && bulkKit["GARANTIA SERVIÇO 2"]) {
					const secondService: TServiceItem = {
						descricao: bulkKit["DESCRIÇÃO SERVIÇO 2"],
						observacoes: "",
						garantia: bulkKit["GARANTIA SERVIÇO 2"],
					};
					servicesArr.push(secondService);
				}

				// Finding the equivalent pricing method, if not found, using the default
				const pricingMethodologyId = pricingMethods?.find((m) => m.nome == bulkKit["METODOLOGIA DE PRECIFICAÇÃO"])?._id || "660dab0b0fcb72da4ed8c35e";
				// Finding the equivalent defined partner, if not found, using users partner
				const definedPartner = bulkKit["VISIBILIDADE DE PARCEIRO"] != "N/A" ? partners?.find((p) => p.nome == bulkKit["VISIBILIDADE DE PARCEIRO"])?._id || userPartnerId : null;
				console.log("DEFINED PARTNER", definedPartner);

				const partnerId = !!userPartnerScope
					? !definedPartner // In case user has a defined partner scope and didnt selected a partner:
						? userPartnerId //  using the default (user partner)
						: !userPartnerScope.includes(definedPartner) // In case user has a defined partner scope and selected a non valid partner
							? userPartnerId // using the default (user partner)
							: definedPartner // Else, the scope does include the defined partner, so using it
					: definedPartner; // Else, user has global scope, so using the defined partner

				console.log("PARTNER ID FOUND", partnerId);
				// Extracting module peak power
				const modulesTotalPeakPower = getModulesPeakPotByProducts(productsArr);

				// Extracting the due data, if defined
				const dueDate = bulkKit["DATA DE VALIDADE"]
					? isNaN(bulkKit["DATA DE VALIDADE"] as number)
						? dayjs(getDateFromLocaleString(bulkKit["DATA DE VALIDADE"].toString())).add(3, "hour").toISOString()
						: dayjs(getFixedDateFromExcel(bulkKit["DATA DE VALIDADE"] as number))
								.add(3, "hour")
								.toISOString()
					: null; // dayjs(getFixedDateFromExcel(k['DATA VALIDADE'])).add(3, 'hour').toISOString()
				return {
					_id: bulkKit.ID || null,
					nome: bulkKit.NOME,
					idParceiro: partnerId,
					idMetodologiaPrecificacao: pricingMethodologyId,
					idsMetodologiasPagamento: ["661ec619e03128a48f94b4db", "661ec635e03128a48f94b4dc", "661ec65ae03128a48f94b4dd"],
					ativo: bulkKit.ATIVO == "SIM" ? true : false,
					topologia: bulkKit.TOPOLOGIA,
					potenciaPico: modulesTotalPeakPower,
					preco: bulkKit.PREÇO,
					estruturasCompativeis: [bulkKit["TIPO DE ESTRUTURA"]],
					produtos: productsArr,
					servicos: servicesArr,
					dataValidade: dueDate,
					autor: {
						id: session.user.id,
						nome: session.user.nome,
						avatar_url: session.user.avatar_url,
					},
					dataInsercao: new Date().toISOString(),
					excluir: bulkKit.EXCLUIR == "SIM" ? true : false,
				};
			});
			setKitsHolder(kits);
			return toast.success("Kits extraídos com sucesso !");
		} catch (error) {
			console.log(error);
			const msg = getErrorMessage(error);
			return toast.error(msg);
		}
	}
	async function handleBulkOperation(kits: (TKit & { _id: string | null; excluir: boolean })[]) {
		if (kits.length == 0) return toast.error("Nenhum kit foi encontrado.");

		try {
			const createArr = kits.filter((k) => !k._id).map((k) => ({ ...k, excluir: undefined })) as TKit[];
			const updateArr = kits.filter((k) => !!k._id && !k.excluir).map((k) => ({ ...k, excluir: undefined })) as TKitDTO[];
			const deleteArr = kits.filter((k) => !!k._id && !!k.excluir).map((k) => ({ ...k, excluir: undefined })) as TKitDTO[];

			// Dealing with creation of kits
			if (createArr.length > 0) await createManyKits({ info: createArr });
			if (updateArr.length > 0) await updateManyKits({ info: updateArr });
			if (deleteArr.length > 0) await deleteManyKits({ ids: deleteArr.map((k) => k._id) });

			return "Operação concluída com sucesso!";
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	const { mutate: handleKitsOperation } = useMutationWithFeedback({
		mutationKey: ["operate-many-kits"],
		mutationFn: handleBulkOperation,
		affectedQueryKey: ["kits"],
		queryClient: queryClient,
		callbackFn: () => {
			setKitsHolder([]);
			closeModal();
		},
	});
	const creatingCount = kitsHolder?.reduce((acc, current) => (!current._id ? acc + 1 : acc), 0) || 0;
	const updateCount = kitsHolder?.reduce((acc, current) => (!!current._id && !current.excluir ? acc + 1 : acc), 0) || 0;
	const deleteCount = kitsHolder?.reduce((acc, current) => (!!current._id && !!current.excluir ? acc + 1 : acc), 0) || 0;
	console.log(kitsHolder);
	return (
		<div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">OPERAÇÃO EM MASSA</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<BulkOperationHelpMenu session={session} pricingMethods={pricingMethods || []} partners={partners || []} />
						<div className="relative mb-4 flex w-full items-center justify-center">
							<label
								htmlFor="dropzone-file"
								className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
							>
								<div className="flex flex-col items-center justify-center pb-6 pt-5 text-gray-800">
									<BsCloudUploadFill color={"rgb(31,41,55)"} size={50} />

									{fileHolder ? (
										<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{fileHolder.name}</p>
									) : (
										<p className="mb-2 px-2 text-center text-sm text-gray-500 dark:text-gray-400">
											<span className="font-semibold">Clique para escolher um arquivo</span> ou o arraste para a àrea demarcada
										</p>
									)}
								</div>
								<input
									onChange={(e) => {
										if (e.target.files) return setFileHolder(e.target.files[0]);
										else return setFileHolder(null);
									}}
									id="dropzone-file"
									type="file"
									className="absolute h-full w-full opacity-0"
									accept=".xlsx"
								/>
							</label>
						</div>
						<div className="flex w-full items-center justify-end">
							<button
								onClick={() => handleExtracting(fileHolder)}
								className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
							>
								IDENTIFICAR KITS
							</button>
						</div>
						{kitsHolder.length > 0 ? (
							<div className="flex w-full flex-col">
								<h1 className="rounded bg-gray-800 p-1 text-center font-bold text-white">KITS IDENTIFICADOS</h1>
								<p className="text-sm font-medium text-gray-500">
									Foram identificados <strong className="text-[#f25041]">{creatingCount}</strong> kits para criação.
								</p>
								<p className="text-sm font-medium text-gray-500">
									Foram identificados <strong className="text-[#f25041]">{updateCount}</strong> kits para atualização.
								</p>
								<p className="text-sm font-medium text-gray-500">
									Foram identificados <strong className="text-[#f25041]">{deleteCount}</strong> kits para exclusão.
								</p>
								<div className="mt-2 flex w-full flex-col gap-1">
									<h1 className="text-start font-Inter text-xs font-medium leading-none tracking-tight">ADICIONAR PRODUTOS COMUNS</h1>
									<div className="flex w-full flex-wrap items-start justify-start gap-2">
										{CommonProductsByProjectType.map((type, index) => (
											<button
												onClick={() => setKitsHolder((prev) => prev.map((k) => ({ ...k, produtos: [...k.produtos, ...type.produtos] })))}
												key={index}
												className={`rounded-lg px-2 py-1 text-xs font-medium bg-[${type.cores.texto}] text-[${type.cores.fundo}]  w-fit`}
											>
												{type.nome}
											</button>
										))}
									</div>
								</div>
								<div className="mt-2 flex w-full flex-col gap-1">
									<h1 className="text-start font-Inter text-xs font-medium leading-none tracking-tight">ADICIONAR SERVIÇOS COMUNS</h1>
									<div className="flex w-full flex-wrap items-start justify-start gap-2">
										{CommonServicesByProjectType.map((type, index) => (
											<button
												onClick={() => setKitsHolder((prev) => prev.map((k) => ({ ...k, servicos: [...k.servicos, ...type.servicos] })))}
												key={index}
												className={`rounded-lg px-2 py-1 text-xs font-medium bg-[${type.cores.texto}] text-[${type.cores.fundo}]  w-fit`}
											>
												{type.nome}
											</button>
										))}
									</div>
								</div>
								<div className="flex flex-col gap-2 py-2">
									{kitsHolder.map((kit, index) => (
										<BulkOperationKit key={index} kit={kit} />
									))}
								</div>
							</div>
						) : null}
					</div>
					{kitsHolder.length > 0 ? (
						<div className="flex w-full items-center justify-end p-2">
							<button
								onClick={() => {
									// @ts-ignore
									handleKitsOperation(kitsHolder);
								}}
								className="h-9 whitespace-nowrap rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-800 enabled:hover:text-white"
							>
								REALIZAR OPERAÇÃO
							</button>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default KitBulkOperation;
