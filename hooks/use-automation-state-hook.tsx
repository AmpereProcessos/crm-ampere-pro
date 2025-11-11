import { useCallback, useState } from "react";
import z from "zod";
import { AutomationConfigurationSchema, type TAutomationConfiguration } from "@/utils/schemas/automations.schema";

const AutomationStateSchema = z.object({
	automation: AutomationConfigurationSchema,
});

export type TAutomationState = z.infer<typeof AutomationStateSchema>;

type useAutomationStateHookParams = {
	initialState: TAutomationState;
};

export default function useAutomationStateHook({ initialState }: useAutomationStateHookParams) {
	const [state, setState] = useState<TAutomationState>(initialState);

	// Basic update function for top-level properties
	const updateAutomation = useCallback((changes: Partial<TAutomationState["automation"]>) => {
		setState((prev) => ({
			...prev,
			automation: {
				...prev.automation,
				...changes,
			},
		}));
	}, []);

	// Update trigger (gatilho) - discriminated union
	const updateTrigger = useCallback((newTrigger: TAutomationConfiguration["gatilho"]) => {
		setState((prev) => ({
			...prev,
			automation: {
				...prev.automation,
				gatilho: newTrigger,
			},
		}));
	}, []);

	// Update execution (execucao) - discriminated union
	const updateExecution = useCallback((newExecution: TAutomationConfiguration["execucao"]) => {
		setState((prev) => ({
			...prev,
			automation: {
				...prev.automation,
				execucao: newExecution,
			},
		}));
	}, []);

	// Update action (acao) - discriminated union
	const updateAction = useCallback((newAction: TAutomationConfiguration["acao"]) => {
		setState((prev) => ({
			...prev,
			automation: {
				...prev.automation,
				acao: newAction,
			},
		}));
	}, []);

	// Utility functions
	const resetState = useCallback(() => {
		setState(initialState);
	}, [initialState]);

	const redefineState = useCallback((newState: TAutomationState) => {
		setState(newState);
	}, []);

	return {
		state,
		updateAutomation,
		updateTrigger,
		updateExecution,
		updateAction,
		resetState,
		redefineState,
	};
}

export type TUseAutomationStateHook = ReturnType<typeof useAutomationStateHook>;
