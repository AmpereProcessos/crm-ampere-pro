import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { TGetGoalsRouteOutput } from '@/app/api/goals/route';

async function getGoalById({ id }: { id: string }) {
  try {
    const { data } = await axios.get<TGetGoalsRouteOutput>(`/api/goals?id=${id}`);
    if (!data.data.byId) {
      throw new Error('Meta não encontrada.');
    }

    return data.data.byId;
  } catch (error) {
    console.log('Error running getGoals.');
    throw error;
  }
}

export function useGoalById({ id }: { id: string }) {
  return useQuery({
    queryKey: ['goal-by-id', id],
    queryFn: async () => await getGoalById({ id }),
  });
}

async function getGoals() {
  try {
    const { data } = await axios.get<TGetGoalsRouteOutput>('/api/goals');
    if (!data.data.default) {
      throw new Error('Metas não encontradas.');
    }

    return data.data.default;
  } catch (error) {
    console.log('Error running getGoals.');
    throw error;
  }
}

export function useGoals() {
  return {
    ...useQuery({
      queryKey: ['goals'],
      queryFn: async () => await getGoals(),
    }),
    queryKey: ['goals'],
  };
}
