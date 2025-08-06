import { create } from "zustand";
import type { TActivity } from "../schemas/activities.schema";

type TActivityStore = {
	activity: TActivity;
	redefineActivity: (info: TActivity) => void;
	getActivity: () => TActivity;
	updateActivity: (info: Partial<TActivity>) => void;
	defineResponsibles: (responsibles: TActivity["responsaveis"]) => void;
	addResponsible: (responsible: TActivity["responsaveis"][number]) => void;
	removeResponsible: (index: number) => void;
	updateResponsible: (info: { index: number; changes: Partial<TActivity["responsaveis"][number]> }) => void;
	reset: () => void;
};

const initialActivity: TActivity = {
	idParceiro: "",
	titulo: "", // resume of the activity
	descricao: "", // description of what to be done
	responsaveis: [],
	oportunidade: {},
	idHomologacao: undefined,
	idAnaliseTecnica: undefined,
	subatividades: [],
	dataVencimento: null,
	dataConclusao: null,
	dataInsercao: new Date().toISOString(),
	autor: {
		id: "",
		nome: "",
		avatar_url: null,
	},
};

export const useActivityStore = create<TActivityStore>((set, get) => ({
	activity: initialActivity,
	redefineActivity: (info) => set({ activity: info }),
	getActivity: () => get().activity,
	updateActivity: (info) => set({ activity: { ...get().activity, ...info } }),
	defineResponsibles: (responsibles) => set({ activity: { ...get().activity, responsaveis: responsibles } }),
	addResponsible: (responsible) => set({ activity: { ...get().activity, responsaveis: [...get().activity.responsaveis, responsible] } }),
	removeResponsible: (index) => set({ activity: { ...get().activity, responsaveis: get().activity.responsaveis.filter((_, i) => i !== index) } }),
	updateResponsible: (info) =>
		set({
			activity: { ...get().activity, responsaveis: get().activity.responsaveis.map((responsible, i) => (i === info.index ? { ...responsible, ...info.changes } : responsible)) },
		}),
	reset: () => set({ activity: initialActivity }),
}));
