import { useCallback, useState } from "react";
import z from "zod";
import { GeneralClientSchema } from "@/utils/schemas/client.schema";

const ClientStateSchema = z.object({
	client: GeneralClientSchema,
	clientAvatarHolder: z.object({
		file: z.instanceof(File).nullable(),
		previewUrl: z.string().nullable(),
	}),
});
export type TClientState = z.infer<typeof ClientStateSchema>;

type useClientStateHookParams = {
	initialState: TClientState;
};
export default function useClientStateHook({ initialState }: useClientStateHookParams) {
	const [state, setState] = useState<TClientState>(initialState);

	const updateClient = useCallback((changes: Partial<TClientState["client"]>) => {
		setState((prev) => ({
			...prev,
			client: {
				...prev.client,
				...changes,
			},
		}));
	}, []);

	const updateClientAvatarHolder = useCallback((changes: Partial<TClientState["clientAvatarHolder"]>) => {
		setState((prev) => ({
			...prev,
			clientAvatarHolder: {
				...prev.clientAvatarHolder,
				...changes,
			},
		}));
	}, []);

	const resetState = useCallback(() => {
		setState(initialState);
	}, [initialState]);

	const redefineState = useCallback((newState: TClientState) => {
		setState(newState);
	}, []);

	return {
		state,
		updateClient,
		updateClientAvatarHolder,
		resetState,
		redefineState,
	};
}

export type TUseClientStateHook = ReturnType<typeof useClientStateHook>;
