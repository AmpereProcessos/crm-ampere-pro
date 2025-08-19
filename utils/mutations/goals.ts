import axios from 'axios';
import type { TCreateGoalRouteInput, TCreateGoalRouteOutput, TUpdateGoalRouteInput, TUpdateGoalRouteOutput } from '@/app/api/goals/route';

export async function createGoal(payload: TCreateGoalRouteInput) {
  try {
    const { data } = await axios.post<TCreateGoalRouteOutput>('/api/goals', payload);
    return data;
  } catch (error) {
    console.error('Error running createGoal');
    throw error;
  }
}

export async function updateGoal(payload: TUpdateGoalRouteInput) {
  try {
    const { data } = await axios.put<TUpdateGoalRouteOutput>('/api/goals', payload);
    return data;
  } catch (error) {
    console.error('Error running updateGoal');
    throw error;
  }
}
