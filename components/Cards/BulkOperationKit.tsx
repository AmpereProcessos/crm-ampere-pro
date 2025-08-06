import { renderCategoryIcon } from "@/lib/methods/rendering";
import { formatToMoney } from "@/utils/methods";
import { TKit } from "@/utils/schemas/kits.schema";
import React, { useState } from "react";
import { AiOutlineSafety } from "react-icons/ai";
import { BsStack } from "react-icons/bs";
import { FaIndustry, FaTag } from "react-icons/fa";
import { ImPower } from "react-icons/im";
import { MdAttachMoney, MdOutlineMiscellaneousServices } from "react-icons/md";
import { TbTopologyFull } from "react-icons/tb";

function getOperationTag({ hasId, toDelete }: { hasId: boolean; toDelete: boolean }) {
	if (!hasId) return <h1 className="rounded-full bg-green-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">CRIAR</h1>;
	if (toDelete) return <h1 className="rounded-full bg-red-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">EXCLUIR</h1>;
	return <h1 className="rounded-full bg-orange-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">ALTERAR</h1>;
}

type BulkOperationKitProps = {
	kit: TKit & { _id: string | null; excluir: boolean };
};
function BulkOperationKit({ kit }: BulkOperationKitProps) {
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const productsSimplified = kit.produtos.map((p) => `${p.qtde}x ${p.modelo}`);
	const servicesSimplified = kit.servicos.map((p) => `${p.descricao}`);
	const composition = [...productsSimplified, ...servicesSimplified];
	// return (
	//   <div className="flex w-full flex-col gap-2 border border-gray-500 bg-[#fff] p-4 font-Inter shadow-md">
	//     <div className="flex w-full items-center justify-between gap-2">
	//       <div className="flex items-center gap-1">
	//         <div className="flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1">
	//           <FaTag size={12} />
	//         </div>
	//         <h1 className="text-sm font-black leading-none tracking-tight">{kit.nome}</h1>
	//       </div>
	//       {getOperationTag({ hasId: !!kit._id, toDelete: !!kit.excluir })}
	//     </div>
	//     <div className="flex w-full flex-wrap items-center gap-2">
	//       <div className="flex items-center gap-1 text-green-500">
	//         <MdAttachMoney />
	//         <p className="text-[0.6rem] font-medium leading-none tracking-tight">{formatToMoney(kit.preco)}</p>
	//       </div>

	//       <div className="flex items-center gap-1 text-red-500">
	//         <ImPower color="rgb(239,68,68)" />
	//         <p className="text-[0.6rem] font-medium leading-none tracking-tight">{kit.potenciaPico} kW</p>
	//       </div>
	//       <div className="flex items-center gap-1">
	//         <TbTopologyFull />
	//         <p className="text-[0.6rem] font-medium leading-none tracking-tight">{kit.topologia}</p>
	//       </div>
	//     </div>
	//     <div className="flex w-full flex-col gap-1">
	//       <div className="flex items-center gap-1">
	//         <BsStack size={12} />
	//         <p className="text-[0.65rem] font-medium text-gray-500">COMPOSIÇÃO</p>
	//       </div>
	//       <div className="flex w-full flex-wrap items-center gap-2">
	//         {composition.map((item, index) => (
	//           <div key={index} className="rounded border border-gray-500 bg-[#f8f8f8] p-2 text-center shadow-md">
	//             <p className="text-[0.6rem] font-medium leading-none tracking-tight">{item}</p>
	//           </div>
	//         ))}
	//       </div>
	//     </div>
	//   </div>
	// )

	return (
		<div className="flex w-full gap-2 rounded-md border border-gray-500 bg-[#fff] font-Inter shadow-md lg:w-[600px]">
			<div className="flex grow flex-col p-4">
				<div className="flex w-full items-center justify-between gap-2">
					<div className="flex items-center gap-1">
						<div className="flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1">
							<FaTag size={12} />
						</div>

						<h1 className="text-sm font-black leading-none tracking-tight">{kit.nome}</h1>
					</div>
					{getOperationTag({ hasId: !!kit._id, toDelete: !!kit.excluir })}
				</div>

				<div className="flex w-full grow flex-col">
					<div className="mt-2 flex w-full items-center gap-2">
						<div className="flex items-center gap-1 text-green-500">
							<MdAttachMoney />
							<p className="text-[0.65rem] font-bold lg:text-xs">{formatToMoney(kit.preco)}</p>
						</div>

						<div className="flex items-center gap-1 text-red-500">
							<ImPower color="rgb(239,68,68)" />
							<p className="text-[0.65rem] font-bold lg:text-xs">{kit.potenciaPico} kW</p>
						</div>
						<div className="flex items-center gap-1">
							<TbTopologyFull />
							<p className="text-[0.65rem] font-light lg:text-xs">{kit.topologia}</p>
						</div>
					</div>
					<h1 className="my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-gray-500 lg:text-xs">PRODUTOS</h1>
					{kit.produtos.map((product, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-300 p-2">
							<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
								<div className="flex items-center gap-1">
									<div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1 text-[15px]">{renderCategoryIcon(product.categoria)}</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
										<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
									</p>
								</div>
								<div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
									<div className="flex items-center gap-1">
										<FaIndustry size={12} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.fabricante}</p>
									</div>
									<div className="flex items-center gap-1">
										<ImPower size={12} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.potencia} W</p>
									</div>
									<div className="flex items-center gap-1">
										<AiOutlineSafety size={12} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.garantia} ANOS</p>
									</div>
								</div>
							</div>
						</div>
						// <ProductItem product={module} index={index} removeProductFromKit={(index) => console.log()} showRemoveButton={false} />
					))}
					<h1 className="my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-gray-500 lg:text-xs">SERVIÇOS</h1>
					<div className="flex w-full flex-wrap items-center gap-2">
						{kit.servicos.map((service, index) => (
							<div key={index} className="mt-1 flex flex-col gap-1 rounded-md border border-gray-300 p-2">
								<div className="flex w-full items-center justify-between gap-2">
									<div className="flex items-center gap-1">
										<div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1">
											<MdOutlineMiscellaneousServices />
										</div>
										<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
									</div>
								</div>
								<div className="flex w-full items-center justify-end gap-1">
									<AiOutlineSafety size={12} />
									<p className="text-[0.6rem] font-light text-gray-500">{service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`} </p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default BulkOperationKit;
