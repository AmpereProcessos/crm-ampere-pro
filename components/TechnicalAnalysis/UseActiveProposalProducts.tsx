import { fetchProposalById } from "@/utils/queries/proposals";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";

type UseActiveProposalProductsProps = {
	activeProposalId: string;
	getProducts: (products: TTechnicalAnalysis["equipamentos"]) => void;
};
function UseActiveProposalProducts({ activeProposalId, getProducts }: UseActiveProposalProductsProps) {
	async function handleUseProducts(id: string) {
		try {
			const proposal = await fetchProposalById(id);
			const products: TTechnicalAnalysis["equipamentos"] = proposal.produtos.map((p) => ({
				id: p.id,
				categoria: p.categoria,
				fabricante: p.fabricante,
				modelo: p.modelo,
				qtde: p.qtde,
				potencia: p.potencia,
			}));
			return getProducts(products);
		} catch (error) {
			throw error;
		}
	}
	return (
		<div className="my-2 flex w-full flex-col gap-1">
			<p className="w-full text-center text-sm leading-none tracking-tight text-primary/70">
				Deseja utilizar os equipamentos da proposta ativa ? <strong className="text-cyan-500">Clique no botão abaixo</strong>
			</p>
			<div className="flex w-full items-center justify-center">
				<button onClick={() => handleUseProducts(activeProposalId)} className="rounded-md bg-black px-2 py-1 text-sm font-bold text-primary-foreground">
					UTILIZAR EQUIPAMENTOS
				</button>
			</div>
		</div>
	);
}

export default UseActiveProposalProducts;
