import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useKitStateHook, { type TUseKitStateHook } from "@/hooks/use-kit-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { uploadFile } from "@/lib/methods/firebase";
import { getModulesPeakPotByProducts } from "@/lib/methods/extracting";
import { updateKit as updateKitMutation } from "@/utils/mutations/kits";
import { useKitById } from "@/utils/queries/kits";
import KitGeneralBlock from "./Blocks/General";
import KitProductsBlock from "./Blocks/Products";
import KitServicesBlock from "./Blocks/Services";

type EditKitModalProps = {
	kitId: string;
	session: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};

function EditKit({ kitId, session, closeModal, callbacks }: EditKitModalProps) {
	const queryClient = useQueryClient();
	const { data: kit, queryKey, isError, isLoading, error } = useKitById({ id: kitId });

	const {
		state,
		updateKit,
		addKitProduct,
		updateKitProduct,
		removeKitProduct,
		addKitService,
		updateKitService,
		removeKitService,
		updateKitImageHolder,
		redefineState,
	} = useKitStateHook({
		initialState: {
			kit: {
				nome: "",
				idParceiro: session.user.idParceiro || "",
				idMetodologiaPrecificacao: "",
				idsMetodologiasPagamento: [],
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

	async function handleUpdateKitFn(state: TUseKitStateHook["state"]) {
		let kitImageUrl = state.kit.imagemCapaUrl;

		if (state.kitImageHolder.file) {
			const fileName = `cover_kit_${state.kit.nome.toLowerCase().replaceAll(" ", "_")}`;
			const { url } = await uploadFile({ file: state.kitImageHolder.file, fileName: fileName, vinculationId: state.kit.idParceiro || "" });
			kitImageUrl = url;
		}

		const peakPower = getModulesPeakPotByProducts(state.kit.produtos);

		return await updateKitMutation({
			id: kitId,
			info: {
				...state.kit,
				imagemCapaUrl: kitImageUrl,
				potenciaPico: peakPower,
			},
		});
	}

	const { mutate: handleUpdateKitMutation, isPending } = useMutation({
		mutationKey: ["update-kit", kitId],
		mutationFn: handleUpdateKitFn,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: queryKey });
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
			await queryClient.invalidateQueries({ queryKey: queryKey });
		},
	});

	useEffect(() => {
		if (kit) redefineState({ kit: kit, kitImageHolder: { file: null, previewUrl: null } });
	}, [kit, redefineState]);

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR KIT"
			menuDescription="Preencha os campos abaixo para atualizar o kit."
			menuActionButtonText="ATUALIZAR KIT"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleUpdateKitMutation(state)}
			actionIsLoading={isPending}
			stateIsLoading={isLoading}
			stateError={isError ? getErrorMessage(error) : null}
			dialogVariant="lg"
			drawerVariant="lg"
		>
			<KitGeneralBlock infoHolder={state.kit} updateInfoHolder={updateKit} imageHolder={state.kitImageHolder} updateImageHolder={updateKitImageHolder} />
			<KitProductsBlock products={state.kit.produtos} addKitProduct={addKitProduct} updateKitProduct={updateKitProduct} removeKitProduct={removeKitProduct} />
			<KitServicesBlock services={state.kit.servicos} addKitService={addKitService} updateKitService={updateKitService} removeKitService={removeKitService} />
		</ResponsiveDialogDrawer>
	);
}

export default EditKit;
