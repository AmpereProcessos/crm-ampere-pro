export interface OeMPricing {
	manutencaoSimples: {
		vendaProposto: number;
		vendaFinal: number;
	};
	planoSol: {
		vendaProposto: number;
		vendaFinal: number;
	};
	planoSolPlus: {
		vendaProposto: number;
		vendaFinal: number;
	};
}
export type GetOeMPricesParams = {
	modulesQty: number;
	distance: number;
};
export function getOeMPrices({ modulesQty, distance }: GetOeMPricesParams) {
	const priceByModule = findPriceByRange(modulesQty) >= 0 ? findPriceByRange(modulesQty) : 19.9;
	var prices: OeMPricing = {
		manutencaoSimples: {
			vendaProposto: priceByModule * modulesQty + 1.5 * 2 * distance,
			vendaFinal: priceByModule * modulesQty + 1.5 * 2 * distance,
		},
		planoSol: {
			vendaProposto: 1.3 * priceByModule * modulesQty + 1.5 * 2 * distance,
			vendaFinal: 1.3 * priceByModule * modulesQty + 1.5 * 2 * distance,
		},
		planoSolPlus: {
			vendaProposto: 1.5 * priceByModule * modulesQty + 1.5 * 4 * distance,
			vendaFinal: 1.5 * priceByModule * modulesQty + 1.5 * 4 * distance,
		},
	};
	return prices;
}

export const oemPricesByModuleQty = [
	{
		min: 0,
		max: 12,
		price: 19.9,
	},
	{
		min: 13,
		max: 19,
		price: 18.91,
	},
	{
		min: 20,
		max: 29,
		price: 17.96,
	},
	{
		min: 30,
		max: 49,
		price: 17.06,
	},
	{
		min: 50,
		max: 79,
		price: 16.21,
	},
	{
		min: 80,
		max: 109,
		price: 15.4,
	},
	{
		min: 110,
		max: 149,
		price: 13.86,
	},
	{
		min: 150,
		max: 199,
		price: 12.47,
	},
	{
		min: 200,
		max: 299,
		price: 11.23,
	},
	{
		min: 300,
		max: 499,
		price: 10.1,
	},
	{
		min: 500,
		max: 2000,
		price: 9.09,
	},
];
function findPriceByRange(modulesQty: number): number {
	var priceByModule;
	priceByModule = oemPricesByModuleQty.find((param) => modulesQty >= param.min && modulesQty <= param.max);
	console.log("PREÇO POR MÓDULO", priceByModule?.price);
	return priceByModule?.price || 19.9;
	for (let i = 0; i < oemPricesByModuleQty.length; i++) {
		if (modulesQty >= oemPricesByModuleQty[i].min && modulesQty <= oemPricesByModuleQty[i].max) {
			priceByModule = oemPricesByModuleQty[i].price;
		} else {
			priceByModule = 19.9;
		}
	}

	return priceByModule ? priceByModule : 19.9;
}
