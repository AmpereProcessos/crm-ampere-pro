import dayjs from 'dayjs';
import type React from 'react';
import { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import type { TGoal } from '../schemas/goal.schema';

type TGoalState = Omit<TGoal, 'dataInsercao' | 'dataCalculo'>;
// Tipos para inicialização da store
interface GoalInitProps {
  goal?: Partial<TGoalState>;
}

export type TGoalStore = {
  goal: TGoalState;

  redefineState: (goal: TGoalState) => void;
  // actions
  updateGoal: (goal: Partial<TGoalState>) => void;
  updatePeriod: (period: Partial<TGoalState['periodo']>) => void;
  updateGoalValues: (values: Partial<TGoalState['objetivo']>) => void;
  addUser: (user: TGoalState['usuarios'][number]) => void;
  removeUser: (userIndex: number) => void;
  updateUser: (payload: { index: number; change: Partial<TGoalState['usuarios'][number]> }) => void;
  getGoal: () => TGoalState;

  clearGoal: () => void;

  reset: () => void;
};

type GoalStore = ReturnType<typeof createGoalStore>;

// Estado inicial padrão
const getDefaultState = (): Pick<TGoalStore, 'goal'> => ({
  goal: {
    tipo: 'META-COMERCIAL',
    periodo: {
      inicio: dayjs().startOf('month').toISOString(),
      fim: dayjs().endOf('month').toISOString(),
    },
    objetivo: {
      oportunidadesCriadas: 0,
      oportunidadesEnviadas: 0,
      oportunidadesEnviadasConversao: 0,
      oportunidadesEnviadasGanhas: 0,
      oportunidadesEnviadasGanhasConversao: 0,
      oportunidadesGanhas: 0,
      oportunidadesGanhasConversao: 0,
      valorVendido: 0,
      potenciaVendida: 0,
    },

    usuarios: [],
  },
});

// Função criadora da store
export const createGoalStore = (initProps?: GoalInitProps) => {
  const defaultState = getDefaultState();

  // Merge das props de inicialização com o estado padrão
  const initialState = {
    goal: { ...defaultState.goal, ...initProps?.goal },
  };

  return createStore<TGoalStore>()((set, get) => ({
    ...initialState,
    redefineState: (goal) => set({ goal }),
    updateGoal: (goal) => set({ goal: { ...get().goal, ...goal } }),
    updatePeriod: (period) => set({ goal: { ...get().goal, periodo: { ...get().goal.periodo, ...period } } }),
    updateGoalValues: (values) => set({ goal: { ...get().goal, objetivo: { ...get().goal.objetivo, ...values } } }),
    addUser: (user) => set({ goal: { ...get().goal, usuarios: [...get().goal.usuarios, user] } }),
    removeUser: (userIndex) => set({ goal: { ...get().goal, usuarios: get().goal.usuarios.filter((_, index) => index !== userIndex) } }),
    updateUser: (payload) =>
      set({ goal: { ...get().goal, usuarios: get().goal.usuarios.map((user, index) => (index === payload.index ? { ...user, ...payload.change } : user)) } }),
    clearGoal: () => set(defaultState),
    getGoal: () => get().goal,
    reset: () => set(defaultState),
  }));
};

// Contexto React
export const GoalContext = createContext<GoalStore | null>(null);

// Tipos para o Provider
type GoalProviderProps = React.PropsWithChildren<GoalInitProps>;

// Provider component
export function GoalProvider({ children, ...props }: GoalProviderProps) {
  const storeRef = useRef<GoalStore>(null);
  if (!storeRef.current) {
    storeRef.current = createGoalStore(props);
  }
  return <GoalContext.Provider value={storeRef.current}>{children}</GoalContext.Provider>;
}

// Hook customizado para acessar a store
export function useGoalStore<T>(selector: (state: TGoalStore) => T): T {
  const store = useContext(GoalContext);
  if (!store) throw new Error('Missing GoalProvider in the tree');
  return useStore(store, selector);
}
