import { renderCategoryIcon } from "@/lib/methods/rendering";
import { TProductItem } from "@/utils/schemas/kits.schema";
import { AiOutlineSafety } from "react-icons/ai";
import { FaIndustry } from "react-icons/fa";
import { ImPower } from "react-icons/im";

type ProductCardProps = {
	product: TProductItem;
};
function ProductCard({ product }: ProductCardProps) {
	return (
		<div className="mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2">
			<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
				<div className="flex items-center gap-1">
					<div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black p-1 text-[20px]">
						{renderCategoryIcon(product.categoria, 15)}
					</div>
					<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
						<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
					</p>
				</div>
				<div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
					<div className="flex items-center gap-1">
						<FaIndustry size={15} />
						<p className="text-[0.6rem] font-light text-primary/70">{product.fabricante}</p>
					</div>
					<div className="flex items-center gap-1">
						<ImPower size={15} />
						<p className="text-[0.6rem] font-light text-primary/70">{product.potencia} W</p>
					</div>
					<div className="flex items-center gap-1">
						<AiOutlineSafety size={15} />
						<p className="text-[0.6rem] font-light text-primary/70">{product.garantia} ANOS</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProductCard;
