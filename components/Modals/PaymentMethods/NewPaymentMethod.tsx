import SelectWithImages from "@/components/Inputs/SelectWithImages";
import TextInput from "@/components/Inputs/TextInput";
import NewFractionnement from "@/components/PaymentMethods/NewFractionnement";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createPaymentMethod } from "@/utils/mutations/payment-methods";
import { usePartnersSimplified } from "@/utils/queries/partners";
import { TFractionnementItem, TPaymentMethod } from "@/utils/schemas/payment-methods";
import { useQueryClient } from "@tanstack/react-query";
import { Session } from "next-auth";
import React, { useState } from "react";
import { BsCircleHalf } from "react-icons/bs";
import { FaPercentage } from "react-icons/fa";
import { MdDelete, MdPayment } from "react-icons/md";
import { VscChromeClose } from "react-icons/vsc";

type NewPaymentMethodProps = {
	session: Session;
	closeModal: () => void;
};
function NewPaymentMethod({ session, closeModal }: NewPaymentMethodProps) {
	const queryClient = useQueryClient();
	const { data: partners } = usePartnersSimplified();
	const [infoHolder, setInfoHolder] = useState<TPaymentMethod>({
		nome: "",
		ativo: true,
		descricao: "",
		idParceiro: session.user.idParceiro || "",
		fracionamento: [],
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	const [newFractionnementItemMenuIsOpen, setNewFractionnementItemMenuIsOpen] = useState<boolean>(true);

	const missingPercentage = 100 - infoHolder.fracionamento.reduce((acc, current) => acc + current.porcentagem, 0);

	function addFractionnement(info: TFractionnementItem) {
		const fractionnements = [...infoHolder.fracionamento];
		fractionnements.push(info);
		setInfoHolder((prev) => ({ ...prev, fracionamento: fractionnements }));
	}
	function removeFractionnement(index: number) {
		const fractionnements = [...infoHolder.fracionamento];
		fractionnements.splice(index, 1);
		setInfoHolder((prev) => ({ ...prev, fracionamento: fractionnements }));
	}
	const { mutate: handleCreatePaymentMethod } = useMutationWithFeedback({
		mutationKey: ["create-payment-method"],
		mutationFn: createPaymentMethod,
		queryClient: queryClient,
		affectedQueryKey: ["payment-methods"],
	});
	return (
		<div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
				<div className="flex h-full flex-col font-Inter">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVO MÉTODO DE PAGAMENTO</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<div className="my-5 flex flex-col">
							<p className="text-gray-500">
								Define <strong className="text-[#E25E3E]">métodos de pagamento</strong> a ser utilizados nas suas propostas.
							</p>
							<p className="text-gray-500">
								Especifique <strong className="text-[#E25E3E]">fracionamentos</strong> de pagamento, defina o número máximo de <strong className="text-[#E25E3E]">parcelas</strong>{" "}
								aplicável, fixe <strong className="text-[#E25E3E]">taxas únicas</strong> (taxas de máquininhas de cartão) e <strong className="text-[#E25E3E]">taxas de juros</strong> .
								Através desse mecanismo, você será capaz de <strong className="text-[#E25E3E]">personalizar</strong> os métodos de pagamento que compõe a sua proposta.
							</p>
						</div>
						<div className="flex w-full flex-col gap-2 lg:flex-row">
							<div className="w-full lg:w-1/2">
								<TextInput
									label="NOME DO MÉTODO"
									value={infoHolder.nome}
									placeholder="Preencha aqui o nome para identificação do método de pagamento..."
									handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-1/2">
								<TextInput
									label="DESCRIÇÃO"
									value={infoHolder.descricao}
									placeholder="Preencha aqui a descrição que aparecerá na proposta..."
									handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
									width="100%"
								/>
							</div>
						</div>
						<div className="w-full">
							<SelectWithImages
								label="VISIBILIDADE DE PARCEIRO"
								value={infoHolder.idParceiro || null}
								options={partners?.map((p) => ({ id: p._id, value: p._id, label: p.nome, url: p.logo_url || undefined })) || []}
								resetOptionLabel="TODOS"
								handleChange={(value) =>
									setInfoHolder((prev) => ({
										...prev,
										idParceiro: value,
									}))
								}
								onReset={() =>
									setInfoHolder((prev) => ({
										...prev,
										idParceiro: null,
									}))
								}
								width="100%"
							/>
						</div>
						<h1 className="mt-2 w-full rounded-md bg-gray-700 p-1 text-center text-sm font-bold text-white">FRACIONAMENTO</h1>
						{newFractionnementItemMenuIsOpen ? (
							<NewFractionnement
								addFractionnement={addFractionnement}
								removeFractionnement={removeFractionnement}
								missingPercentage={missingPercentage}
								closeMenu={() => setNewFractionnementItemMenuIsOpen(false)}
							/>
						) : (
							<div className="flex w-full items-center justify-end">
								<button
									className="rounded bg-green-500 p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-green-600"
									onClick={() => setNewFractionnementItemMenuIsOpen(true)}
								>
									NOVO ITEM DE FRACIONAMENTO
								</button>
							</div>
						)}
						<h1 className="my-4 text-sm font-bold leading-none tracking-tight text-[#E25E3E]">LISTA DE FRACIONAMENTOS</h1>
						{infoHolder.fracionamento.length > 0 ? (
							<div className="flex w-full flex-wrap items-center justify-around gap-2">
								{infoHolder.fracionamento.map((fractionnement, index) => (
									<div key={index} className="flex w-full flex-col rounded-md border border-gray-500 p-3 shadow-sm lg:w-[500px]">
										<div className="flex w-full items-center justify-between gap-2">
											<h1 className="text-sm font-black leading-none tracking-tight">FRAÇÃO DE {fractionnement.porcentagem}%</h1>
											<button
												onClick={() => removeFractionnement(index)}
												type="button"
												className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
											>
												<MdDelete style={{ color: "red" }} />
											</button>
										</div>

										<div className="mt-2 flex w-full items-center justify-between">
											<div className="flex items-center gap-2">
												<MdPayment color={"#76c893"} />
												<p className="text-xs font-medium leading-none tracking-tight text-gray-500">{fractionnement.metodo}</p>
											</div>
											<div className="flex items-center gap-2">
												<BsCircleHalf color="#ed174c" />
												<p className="text-xs font-medium leading-none tracking-tight text-gray-500">
													{fractionnement.maximoParcelas} {fractionnement.maximoParcelas > 1 ? "PARCELAS" : "PARCELA"}
												</p>
											</div>
											{fractionnement.taxaJuros ? (
												<div className="flex items-center gap-2">
													<FaPercentage />
													<p className="text-xs font-medium leading-none tracking-tight text-gray-500">{fractionnement.taxaJuros} DE JUROS</p>
												</div>
											) : null}
											{fractionnement.taxaUnica ? (
												<div className="flex items-center gap-2">
													<FaPercentage />
													<p className="text-xs font-medium leading-none tracking-tight text-gray-500">{fractionnement.taxaUnica} DE USO</p>
												</div>
											) : null}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="w-full text-center text-sm italic text-gray-500">Nenhum fracionamento adicionado.</p>
						)}
					</div>
					<div className="flex w-full items-center justify-end">
						<button
							className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
							onClick={() =>
								// @ts-ignore
								handleCreatePaymentMethod({ info: infoHolder })
							}
						>
							CRIAR MÉTODO
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewPaymentMethod;
