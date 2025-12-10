import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TOpportunityHistory, TOpportunityInteractionTypeEnum } from "../schemas/opportunity-history.schema";
import { OpportunityInteractionTypes } from "../select-options";

type TOpportunityHistoryStore = {
	opportunityHistory: TOpportunityHistory;
	redefineOpportunityHistory: (info: TOpportunityHistory) => void;
	getOpportunityHistory: () => TOpportunityHistory;
	updateOpportunityHistory: (info: Partial<TOpportunityHistory>) => void;
	setCategory: (category: TOpportunityHistory["categoria"]) => void;
	setInteractionType: (type: TOpportunityInteractionTypeEnum) => void;
	setContent: (content: string) => void;
	reset: () => void;
};

const createInitialOpportunityHistory = (category: TOpportunityHistory["categoria"] = "ANOTAÇÃO"): TOpportunityHistory => {
	const baseHistory = {
		oportunidade: {
			id: "",
			nome: "",
			identificador: "",
		},
		idParceiro: "",
		conteudo: "",
		autor: {
			id: "",
			nome: "",
			avatar_url: null,
		},
		dataInsercao: new Date().toISOString(),
	};

	if (category === "INTERAÇÃO") {
		return {
			...baseHistory,
			categoria: "INTERAÇÃO" as const,
			tipoInteracao: OpportunityInteractionTypes[0].value as TOpportunityInteractionTypeEnum,
			conteudo: OpportunityInteractionTypes[0].generalContent,
			idProposta: null,
		};
	}

	return {
		...baseHistory,
		categoria: "ANOTAÇÃO" as const,
	};
};

const initialOpportunityHistory = createInitialOpportunityHistory();

export const useOpportunityHistoryStore = create<TOpportunityHistoryStore>()(
	persist(
		(set, get) => ({
			opportunityHistory: initialOpportunityHistory,
			redefineOpportunityHistory: (info) => set({ opportunityHistory: info }),
			getOpportunityHistory: () => get().opportunityHistory,
			updateOpportunityHistory: (info) => {
				const current = get().opportunityHistory;
				if (current.categoria === "INTERAÇÃO" && info.categoria !== "ANOTAÇÃO") {
					set({
						opportunityHistory: {
							...current,
							...info,
							categoria: "INTERAÇÃO" as const,
						} as TOpportunityHistory,
					});
				} else if (current.categoria === "ANOTAÇÃO" && info.categoria !== "INTERAÇÃO") {
					set({
						opportunityHistory: {
							...current,
							...info,
							categoria: "ANOTAÇÃO" as const,
						} as TOpportunityHistory,
					});
				} else {
					// If categories don't match, preserve the current category and update safe fields
					const safeFields = {
						oportunidade: info.oportunidade || current.oportunidade,
						idParceiro: info.idParceiro || current.idParceiro,
						autor: info.autor || current.autor,
						dataInsercao: info.dataInsercao || current.dataInsercao,
						conteudo: info.conteudo || current.conteudo,
					};
					set({
						opportunityHistory: {
							...current,
							...safeFields,
						},
					});
				}
			},
			setCategory: (category) => {
				const currentHistory = get().opportunityHistory;
				if (currentHistory.categoria === category) return;

				// Create new history object based on category
				if (category === "INTERAÇÃO") {
					const newHistory: TOpportunityHistory = {
						categoria: "INTERAÇÃO" as const,
						tipoInteracao: OpportunityInteractionTypes[0].value as TOpportunityInteractionTypeEnum,
						conteudo: OpportunityInteractionTypes[0].generalContent,
						idProposta: null,
						oportunidade: currentHistory.oportunidade,
						idParceiro: currentHistory.idParceiro,
						autor: currentHistory.autor,
						dataInsercao: currentHistory.dataInsercao,
					};
					set({ opportunityHistory: newHistory });
				} else {
					const newHistory: TOpportunityHistory = {
						categoria: "ANOTAÇÃO" as const,
						conteudo: currentHistory.conteudo,
						oportunidade: currentHistory.oportunidade,
						idParceiro: currentHistory.idParceiro,
						autor: currentHistory.autor,
						dataInsercao: currentHistory.dataInsercao,
					};
					set({ opportunityHistory: newHistory });
				}
			},
			setInteractionType: (type) => {
				const current = get().opportunityHistory;
				if (current.categoria === "INTERAÇÃO") {
					const interactionType = OpportunityInteractionTypes.find((t) => t.value === type);
					set({
						opportunityHistory: {
							...current,
							tipoInteracao: type,
							conteudo: interactionType?.generalContent || current.conteudo,
						},
					});
				}
			},
			setContent: (content) => set({ opportunityHistory: { ...get().opportunityHistory, conteudo: content } }),
			reset: () => set({ opportunityHistory: initialOpportunityHistory }),
		}),
		{
			name: "opportunity-history-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
