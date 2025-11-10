import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useKitStateHook, { type TUseKitStateHook } from "@/hooks/use-kit-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { uploadFile } from "@/lib/methods/firebase";
import { getModulesPeakPotByProducts } from "@/lib/methods/extracting";
import { createKit } from "@/utils/mutations/kits";
import type { TKit } from "@/utils/schemas/kits.schema";
import KitGeneralBlock from "./Blocks/General";
import KitProductsBlock from "./Blocks/Products";
import KitServicesBlock from "./Blocks/Services";

type NewKitModalProps = {
	session: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};

function NewKit({ session, closeModal, callbacks }: NewKitModalProps) {
	const queryClient = useQueryClient();

	const {
		state,
		updateKit,
		updateKitImageHolder,
		resetState,
		redefineState,
		addKitProduct,
		updateKitProduct,
		removeKitProduct,
		addKitService,
		updateKitService,
		removeKitService,
	} = useKitStateHook({
		initialState: {
			kit: {
				nome: "",
				idParceiro: session.user.idParceiro || "",
				idMetodologiaPrecificacao: "660dab0b0fcb72da4ed8c35e",
				idsMetodologiasPagamento: ["661ec619e03128a48f94b4db"],
				ativo: true,
				topologia: "MICRO-INVERSOR",
				potenciaPico: 0,
				preco: 0,
				estruturasCompativeis: [],
				produtos: [],
				servicos: [],
				imagemCapaUrl: undefined,
				dataValidade: undefined,
				autor: {
					id: session.user.id,
					nome: session.user.nome,
					avatar_url: session.user.avatar_url,
				},
				dataInsercao: new Date().toISOString(),
			},
			kitImageHolder: {
				file: null,
				previewUrl: null,
			},
		},
	});

	async function handleCreateKitFn(state: TUseKitStateHook["state"]) {
		let kitImageUrl = state.kit.imagemCapaUrl;

		if (state.kitImageHolder.file) {
			const fileName = `cover_kit_${state.kit.nome.toLowerCase().replaceAll(" ", "_")}`;
			const { url } = await uploadFile({ file: state.kitImageHolder.file, fileName: fileName, vinculationId: state.kit.idParceiro || "" });
			kitImageUrl = url;
		}

		const peakPower = getModulesPeakPotByProducts(state.kit.produtos);

		return await createKit({
			info: {
				...state.kit,
				imagemCapaUrl: kitImageUrl,
				potenciaPico: peakPower,
			},
		});
	}

	const {
		data: mutationData,
		mutate: handleCreateKitMutation,
		reset: resetMutation,
		isPending,
	} = useMutation({
		mutationKey: ["create-kit"],
		mutationFn: handleCreateKitFn,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data);
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
	});

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO KIT"
			menuDescription="Preencha os campos abaixo para criar um novo kit."
			menuActionButtonText="CRIAR KIT"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleCreateKitMutation(state)}
			actionIsLoading={isPending}
			stateIsLoading={false}
			dialogVariant="md"
			drawerVariant="md"
		>
			{mutationData ? (
				<div className="flex w-full grow flex-col items-center justify-center gap-2">
					<div className="flex flex-col items-center gap-1">
						<BadgeCheck className="h-10 min-h-10 w-10 min-w-10 text-green-500 lg:h-20 lg:w-20" />
						<h1 className="text-center font-bold text-lg text-primary tracking-tight">Kit criado com sucesso!</h1>
					</div>
					<div className="flex flex-col items-center gap-2 lg:flex-row">
						<Button
							onClick={() => {
								resetState();
								resetMutation();
							}}
							variant={"secondary"}
						>
							NOVO KIT
						</Button>
					</div>
				</div>
			) : null}
			<KitGeneralBlock infoHolder={state.kit} updateInfoHolder={updateKit} imageHolder={state.kitImageHolder} updateImageHolder={updateKitImageHolder} />
			<KitProductsBlock products={state.kit.produtos} addKitProduct={addKitProduct} updateKitProduct={updateKitProduct} removeKitProduct={removeKitProduct} />
			<KitServicesBlock services={state.kit.servicos} addKitService={addKitService} updateKitService={updateKitService} removeKitService={removeKitService} />
		</ResponsiveDialogDrawer>
	);
}

export default NewKit;
