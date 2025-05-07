import { getErrorMessage } from "@/lib/methods/errors";
import { type QueryClient, useMutation, type UseMutationOptions } from "@tanstack/react-query";
import toast from "react-hot-toast";

type UseMutationWithFeedbackParams<TData, TVariables> = {
	queryClient: QueryClient;
	mutationKey: any[];
	mutationFn: (variables: TVariables) => Promise<TData>;
	callbackFn?: () => void;
	affectedQueryKey: any[];
	options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationKey" | "mutationFn">;
};

export function useMutationWithFeedback<TData = unknown, TVariables = unknown>({
	queryClient,
	mutationKey,
	mutationFn,
	callbackFn,
	affectedQueryKey,
	options = {},
}: UseMutationWithFeedbackParams<TData, TVariables>) {
	return useMutation({
		mutationKey: mutationKey,
		mutationFn: mutationFn,
		...options,
		onMutate: async (variables) => {
			// Show a loading toast message
			const loadingToast = toast.loading("Processando...");

			// Invalidate relevant queries before the mutation
			await queryClient.cancelQueries({ queryKey: affectedQueryKey });
			console.log("QUERY CANCELED", affectedQueryKey);
			// Return the loading toast to be used for rollback on error
			return { loadingToast };
		},
		onSuccess: (data, variables, context) => {
			// Dismiss the loading toast and show a success toast
			if (!context) return;
			const { loadingToast } = context;
			toast.dismiss();
			console.log("SUCCESS");
			const msg = typeof data === "string" ? data : "Atualização feita com sucesso !";
			toast.success(msg);
		},
		onSettled: async (data, error) => {
			console.log("QUERY INVALIDATED", affectedQueryKey);
			if (callbackFn) callbackFn();
			await queryClient.invalidateQueries({ queryKey: affectedQueryKey });
		},
		onError: (error, variables, context) => {
			console.log(error);
			// Rollback changes if needed

			toast.dismiss();

			const msg = getErrorMessage(error);
			// Show an error toast
			toast.error(msg);
		},
	});
}
