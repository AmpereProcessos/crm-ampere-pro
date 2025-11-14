export type TOpportunityConflictPayload = {
	code: "ONGOING_OPPORTUNITY_EXISTS";
	message: string;
	data: {
		client: {
			id: string;
			nome: string;
			cpfCnpj: string | null;
			telefonePrimario: string;
			email: string;
		};
		opportunity: {
			id: string;
			identificador: string;
			nome: string;
			tipoId: string;
			responsaveis: Array<{
				id: string;
				nome: string;
				papel: string;
				avatar_url: string | null;
			}>;
		};
	};
};
