import type { orientations } from "@/utils/constants";
import genFactors from "@/utils/json-files/generationFactors.json" with { type: "json" };
import type { TModule, TProductItem } from "@/utils/schemas/kits.schema";
import type { TProposal } from "@/utils/schemas/proposal.schema";

type GetMaxHomologationPowerEstimationParams = {
  group: TProposal["premissas"]["grupoInstalacao"];
  avgConsumption: number;
};

export function getMaxHomologationPowerEstimation({
  group,
  avgConsumption,
}: GetMaxHomologationPowerEstimationParams) {
  if (group == "RESIDENCIAL") {
    const CS = 0.68;
    const convertionFactor = 115.2 / CS;
    return avgConsumption / convertionFactor;
  }
  if (group == "COMERCIAL") {
    const CS = 0.69;
    const convertionFactor = 115.2 / CS;
    return avgConsumption / convertionFactor;
  }
  if (group == "INDUSTRIAL") {
    const CS = 0.8;
    const convertionFactor = 115.2 / CS;
    return avgConsumption / convertionFactor;
  }
  if (group == "RURAL") {
    const CS = 0.59;
    const convertionFactor = 115.2 / CS;
    return avgConsumption / convertionFactor;
  }
  const CS = 0.68;
  const convertionFactor = 115.2 / CS;
  return avgConsumption / convertionFactor;
}

export function getPeakPotByModules(modules: TModule[] | undefined) {
  if (modules) {
    let peakPotSum = 0;
    for (let i = 0; i < modules.length; i++) {
      peakPotSum += modules[i].qtde * modules[i].potencia;
    }
    return peakPotSum / 1000;
  }
  return 0;
}

export function getModulesQty(products: TProductItem[] | undefined) {
  if (!products) return 0;
  return products
    .filter((product) => product.categoria == "MÓDULO")
    .reduce((total, product) => total + product.qtde, 0);
}

export function getEstimatedGen(
  peakPower: number,
  city: string | undefined | null,
  uf: string | undefined | null,
  orientation?: (typeof orientations)[number],
): number {
  if (!(city && uf)) return 127 * peakPower;
  const cityFactor = genFactors.find((genFactor) => genFactor.CIDADE == city && genFactor.UF == uf);
  if (!cityFactor) return 127 * peakPower;

  const genFactor = orientation ? cityFactor[orientation] : cityFactor.ANUAL;
  return genFactor ? genFactor * peakPower : 127 * peakPower;
}
