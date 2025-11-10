import { useCallback, useState } from "react";
import z from "zod";
import { GeneralNewKitSchema } from "@/utils/schemas/kits.schema";

const KitStateSchema = z.object({
	kit: GeneralNewKitSchema,
	kitImageHolder: z.object({
		file: z.instanceof(File).nullable(),
		previewUrl: z.string().nullable(),
	}),
});
export type TKitState = z.infer<typeof KitStateSchema>;

type useKitStateHookParams = {
	initialState: TKitState;
};
export default function useKitStateHook({ initialState }: useKitStateHookParams) {
	const [state, setState] = useState<TKitState>(initialState);

	const updateKit = useCallback((changes: Partial<TKitState["kit"]>) => {
		setState((prev) => ({
			...prev,
			kit: {
				...prev.kit,
				...changes,
			},
		}));
	}, []);

	const updateKitImageHolder = useCallback((changes: Partial<TKitState["kitImageHolder"]>) => {
		setState((prev) => ({
			...prev,
			kitImageHolder: {
				...prev.kitImageHolder,
				...changes,
			},
		}));
	}, []);

	const addKitProduct = useCallback((newProduct: TKitState["kit"]["produtos"][number]) => {
		setState((prev) => ({
			...prev,
			kit: {
				...prev.kit,
				produtos: [...prev.kit.produtos, newProduct],
			},
		}));
	}, []);

	const updateKitProduct = useCallback((index: number, changes: Partial<TKitState["kit"]["produtos"][number]>) => {
		setState((prev) => ({
			...prev,
			kit: {
				...prev.kit,
				produtos: prev.kit.produtos.map((product, i) => (i === index ? { ...product, ...changes } : product)),
			},
		}));
	}, []);

	const removeKitProduct = useCallback((index: number) => {
		setState((prev) => ({
			...prev,
			kit: {
				...prev.kit,
				produtos: prev.kit.produtos.filter((_, i) => i !== index),
			},
		}));
	}, []);

	const addKitService = useCallback((newService: TKitState["kit"]["servicos"][number]) => {
		setState((prev) => ({
			...prev,
			kit: {
				...prev.kit,
				servicos: [...prev.kit.servicos, newService],
			},
		}));
	}, []);

	const updateKitService = useCallback((index: number, changes: Partial<TKitState["kit"]["servicos"][number]>) => {
		setState((prev) => ({
			...prev,
			kit: {
				...prev.kit,
				servicos: prev.kit.servicos.map((service, i) => (i === index ? { ...service, ...changes } : service)),
			},
		}));
	}, []);

	const removeKitService = useCallback((index: number) => {
		setState((prev) => ({
			...prev,
			kit: {
				...prev.kit,
				servicos: prev.kit.servicos.filter((_, i) => i !== index),
			},
		}));
	}, []);
	const resetState = useCallback(() => {
		setState(initialState);
	}, [initialState]);

	const redefineState = useCallback((newState: TKitState) => {
		setState(newState);
	}, []);

	return {
		state,
		updateKit,
		updateKitImageHolder,
		addKitProduct,
		updateKitProduct,
		removeKitProduct,
		addKitService,
		updateKitService,
		removeKitService,
		resetState,
		redefineState,
	};
}

export type TUseKitStateHook = ReturnType<typeof useKitStateHook>;
