import AddressInformationBlock from "@/components/Partners/AddressInformationBlock";
import ContactInformationBlock from "@/components/Partners/ContactInformationBlock";
import GeneralInformationBlock from "@/components/Partners/GeneralInformationBlock";
import MediaInformationBlock from "@/components/Partners/MediaInformationBlock";
import Avatar from "@/components/utils/Avatar";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import LoadingPage from "@/components/utils/LoadingPage";
import type { TUserSession } from "@/lib/auth/session";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { stateCities } from "@/utils/estados_cidades";
import { getCEPInfo } from "@/utils/methods";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { editPartner } from "@/utils/mutations/partners";
import { usePartnerById } from "@/utils/queries/partners";
import { TPartner } from "@/utils/schemas/partner.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsCheckLg } from "react-icons/bs";
import { VscChromeClose } from "react-icons/vsc";
type EditPartnerProps = {
	partnerId: string;
	closeModal: () => void;
	session: TUserSession;
};
function EditPartnerOwn({ partnerId, closeModal, session }: EditPartnerProps) {
	const queryClient = useQueryClient();

	const [image, setImage] = useState<File | null>();
	const [editImage, setEditImage] = useState<boolean>(false);
	const [infoHolder, setInfoHolder] = useState<TPartner>({
		nome: "",
		cpfCnpj: "",
		contatos: {
			telefonePrimario: "",
			telefoneSecundario: null,
			email: "",
		},
		slogan: "",
		midias: {
			instagram: "",
			website: "",
			facebook: "",
		},
		localizacao: {
			cep: null,
			uf: "",
			cidade: "",
			bairro: undefined,
			endereco: undefined,
			numeroOuIdentificador: undefined,
			complemento: undefined,
			// distancia: z.number().optional().nullable(),
		},
		logo_url: null,
		descricao: "",
		ativo: true,
		dataInsercao: new Date().toISOString(),
	});
	const { data: partner, isSuccess, isLoading, isError } = usePartnerById({ id: partnerId });
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
	const { mutate: handleEditPartner } = useMutationWithFeedback({
		mutationKey: ["edit-partner", partnerId],
		mutationFn: editPartner,
		queryClient: queryClient,
		affectedQueryKey: ["partner-onw-info", partnerId],
		callbackFn: () => closeModal(),
	});
	useEffect(() => {
		if (partner) setInfoHolder(partner);
	}, [partner]);

	if (status != "authenticated") return <LoadingPage />;
	return (
		<div id="edit-partner" className="fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-100 h-[90%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:h-[80%] lg:w-[60%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-wrap items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg">
						<h3 className="text-xl font-bold text-primary  ">EDITAR PARCEIRO</h3>
						<button
							onClick={() => closeModal()}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar informações do parceiro." /> : null}
					{isSuccess && infoHolder && partner ? (
						<>
							<div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
								<div className="flex flex-col items-center justify-center">
									<div className="relative flex w-full items-center justify-center">
										{partner.logo_url && !editImage ? (
											<div className="flex h-fit w-full flex-col items-center gap-2">
												<Avatar url={partner.logo_url} fallback={formatNameAsInitials(partner.nome)} height={120} width={120} radiusPercentage="60%" />
												<button
													onClick={() => setEditImage(true)}
													className="w-fit rounded-sm border border-black p-1 font-Raleway text-xs font-medium duration-300 ease-in-out hover:bg-black hover:text-primary-foreground"
												>
													EDITAR IMAGEM
												</button>
											</div>
										) : (
											<div className="flex h-[150px] flex-col items-center justify-center">
												<div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-primary/30 bg-primary/30">
													{image ? (
														<div className="absolute flex items-center justify-center">
															<BsCheckLg style={{ color: "green", fontSize: "25px" }} />
														</div>
													) : (
														<p className="absolute w-full text-center text-xs font-bold text-primary/70">ESCOLHA UMA LOGO</p>
													)}

													<input
														onChange={(e) => {
															if (e.target.files) setImage(e.target.files[0]);
														}}
														className="h-full w-full opacity-0"
														type="file"
														accept=".png, .jpeg"
													/>
												</div>
											</div>
										)}
									</div>
								</div>
								<GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
								<AddressInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
								<ContactInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
								<MediaInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
							</div>
							<div className="mt-2 flex w-full items-center justify-end">
								<button
									// @ts-ignore
									onClick={() => handleEditPartner({ id: partnerId, info: infoHolder, logo: image })}
									className="h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
								>
									EDITAR
								</button>
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default EditPartnerOwn;
