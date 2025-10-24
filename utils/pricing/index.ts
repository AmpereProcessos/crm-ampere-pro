import { projectTypes } from "../constants";
import { DisassemblyAssemblyPricing, GetDisassemblyAssemblyParams, getDisassemblyAssemblyPrices } from "./disassembly-assembly/methods";
import { ONGridPricing } from "./methods";
import { GetOeMPricesParams, OeMPricing, getOeMPrices } from "./oem/methods";
import { GetONGridPricesParams, getONGridPrices } from "./on-grid/methods";
type FunctionMap = {
	"SISTEMA FOTOVOLTAICO": ({ project, proposal, technicalAnalysis }: GetONGridPricesParams) => ONGridPricing;
	"OPERAÇÃO E MANUTENÇÃO": ({ modulesQty, distance }: GetOeMPricesParams) => OeMPricing;
	"MONTAGEM E DESMONTAGEM": ({ project, proposal, technicalAnalysis }: GetDisassemblyAssemblyParams) => DisassemblyAssemblyPricing;
};

const GetPricingFunctions: FunctionMap = {
	"SISTEMA FOTOVOLTAICO": getONGridPrices,
	"OPERAÇÃO E MANUTENÇÃO": getOeMPrices,
	"MONTAGEM E DESMONTAGEM": getDisassemblyAssemblyPrices,
};

export function getPricingFunction<T extends keyof FunctionMap>(projectType: T) {
	return GetPricingFunctions[projectType] as FunctionMap[T];
}
