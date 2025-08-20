import { useEffect } from "react";
import { create } from "zustand";
import type { TGoal } from "../schemas/goal.schema";

type TGoalState = Omit<TGoal, "dataInsercao" | "dataCalculo">;

const initialGoalState = (): TGoalState =>
	({
		id: "",
		nome: "",
		objetivo: {
			oportunidadesCriadas: 0,
			oportunidadesEnviadas: 0,
			oportunidadesEnviadasConversao: 0,
			oportunidadesEnviadasGanhas: 0,
			oportunidadesEnviadasGanhasConversao: 0,
			oportunidadesGanhas: 0,
			oportunidadesGanhasConversao: 0,
			potenciaVendida: 0,
			valor: 0,
			valorVendido: 0,
		},
		periodo: {
			fim: "",
			inicio: "",
		},
		tipo: "META-COMERCIAL",
		usuarios: [],
	}) as TGoalState;

export const useGoalStore = create<{
	goal: TGoalState;
	sync: (goal: TGoalState) => void;
	updateGoal: (goal: Partial<TGoalState>) => void;
	updatePeriod: (period: Partial<TGoalState["periodo"]>) => void;
	updateGoalValues: (values: Partial<TGoalState["objetivo"]>) => void;
	addUser: (user: TGoalState["usuarios"][number]) => void;
	removeUser: (userIndex: number) => void;
	updateUser: (payload: { index: number; change: Partial<TGoalState["usuarios"][number]> }) => void;
	getGoal: () => TGoalState;
	clearGoal: () => void;
	reset: () => void;
}>((set, get) => ({
	addUser: (user) =>
		set((state) => ({
			goal: { ...state.goal, usuarios: [...state.goal.usuarios, user] },
		})),
	clearGoal: () => set({ goal: initialGoalState() }),
	getGoal: () => get().goal,
	goal: initialGoalState(),
	removeUser: (userIndex) =>
		set((state) => ({
			goal: {
				...state.goal,
				usuarios: state.goal.usuarios.filter((_, idx) => idx !== userIndex),
			},
		})),
	reset: () => set({ goal: initialGoalState() }),
	sync: (goal) => set({ goal }),
	updateGoal: (goal) =>
		set((state) => ({
			goal: { ...state.goal, ...goal },
		})),
	updateGoalValues: (values) =>
		set((state) => ({
			goal: { ...state.goal, objetivo: { ...state.goal.objetivo, ...values } },
		})),
	updatePeriod: (period) =>
		set((state) => ({
			goal: { ...state.goal, periodo: { ...state.goal.periodo, ...period } },
		})),
	updateUser: ({ index, change }) =>
		set((state) => ({
			goal: {
				...state.goal,
				usuarios: state.goal.usuarios.map((user, idx) => (idx === index ? { ...user, ...change } : user)),
			},
		})),
}));

/**
 * Hook personalizado para gerenciar o ciclo de vida da goal store com sincronização automática
 * @param fetchedState - Estado obtido via fetch que deve ser sincronizado (opcional)
 * @returns As funções da store necessárias para interação
 */
export const useGoalStoreWithSync = (fetchedState?: TGoalState | null) => {
	const reset = useGoalStore((s) => s.reset);
	const sync = useGoalStore((s) => s.sync);

	useEffect(() => {
		if (fetchedState) {
			// Se temos dados do servidor, sincronizar o formulário com eles
			sync(fetchedState);
		} else {
			// Se não temos dados (modo criação), resetar para o estado inicial
			reset();
		}
		// Função de cleanup para resetar a store quando o componente for desmontado
		return () => {
			reset();
		};
	}, [fetchedState, sync, reset]);

	return useGoalStore;
};
