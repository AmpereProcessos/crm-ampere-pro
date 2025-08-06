import { getModulesQty, getInverterQty, getInverterPeakPowerByProducts } from "@/lib/methods/extracting";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import { TProject } from "@/utils/schemas/project.schema";
import React from "react";
import { AiOutlineSafety } from "react-icons/ai";
import { FaIndustry, FaSolarPanel } from "react-icons/fa";
import { ImPower } from "react-icons/im";
import { MdOutlineMiscellaneousServices } from "react-icons/md";
import { TbTopologyFull } from "react-icons/tb";

type EquipmentsAndServicesProps = {
	requestInfo: TProject;
	setRequestInfo: React.Dispatch<React.SetStateAction<TProject>>;
	goToNextState: () => void;
};
function EquipmentsAndServices({ requestInfo, setRequestInfo, goToNextState }: EquipmentsAndServicesProps) {
	function validateAndProceed() {
		goToNextState();
	}
	return (
		<div className="flex w-full grow flex-col gap-2">
			<div className="flex w-full grow flex-col gap-2">
				<h1 className="w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-white">EQUIPAMENTOS</h1>
				<div className="mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
					<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-300 bg-[#fff] p-4 shadow-md lg:w-1/4 lg:p-6">
						<div className="flex items-center justify-between">
							<h1 className="text-sm font-medium uppercase tracking-tight">POTÊNCIA DE MÓDULOS</h1>
							<ImPower />
						</div>
						<div className="mt-2 flex w-full flex-col">
							<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{requestInfo.potenciaPico} kWp</div>
						</div>
					</div>
					<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-300 bg-[#fff] p-4 shadow-md lg:w-1/4 lg:p-6">
						<div className="flex items-center justify-between">
							<h1 className="text-sm font-medium uppercase tracking-tight">POTÊNCIA DE INVERSORES</h1>
							<ImPower />
						</div>
						<div className="mt-2 flex w-full flex-col">
							<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{getInverterPeakPowerByProducts(requestInfo.equipamentos)} kWp</div>
						</div>
					</div>
					<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-300 bg-[#fff] p-4 shadow-md lg:w-1/4 lg:p-6">
						<div className="flex items-center justify-between">
							<h1 className="text-sm font-medium uppercase tracking-tight">NÚMERO DE MÓDULOS</h1>
							<FaSolarPanel />
						</div>
						<div className="mt-2 flex w-full flex-col">
							<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{getModulesQty(requestInfo.equipamentos)}</div>
						</div>
					</div>
					<div className="flex min-h-[80px] w-full flex-col rounded-xl border border-gray-300 bg-[#fff] p-4 shadow-md lg:w-1/4 lg:p-6">
						<div className="flex items-center justify-between">
							<h1 className="text-sm font-medium uppercase tracking-tight">NÚMERO DE INVERSORES</h1>
							<TbTopologyFull />
						</div>
						<div className="mt-2 flex w-full flex-col">
							<div className="text-xl font-bold text-[#15599a] lg:text-2xl">{getInverterQty(requestInfo.equipamentos)}</div>
						</div>
					</div>
				</div>
				<h1 className="w-full text-start font-medium text-gray-500">LISTA DE EQUIPAMENTOS</h1>
				<div className="flex w-full flex-col flex-wrap justify-around gap-2 lg:flex-row">
					{requestInfo.equipamentos.map((product, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-300 p-2">
							<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
								<div className="flex items-center gap-1">
									<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]">{renderCategoryIcon(product.categoria)}</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
										<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
									</p>
								</div>
								<div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
									<div className="flex items-center gap-1">
										<FaIndustry size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.fabricante}</p>
									</div>
									<div className="flex items-center gap-1">
										<ImPower size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.potencia} W</p>
									</div>
									<div className="flex items-center gap-1">
										<AiOutlineSafety size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{product.garantia} ANOS</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
				<h1 className="w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-white">SERVIÇOS</h1>
				<h1 className="w-full text-start font-medium text-gray-500">LISTA DE SERVIÇOS</h1>
				<div className="flex w-full flex-col flex-wrap justify-around gap-2 lg:flex-row">
					{requestInfo.servicos.map((service, index) => (
						<div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-300 p-2">
							<div className="flex w-full items-center justify-between gap-2">
								<div className="flex  items-center gap-1">
									<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
										<MdOutlineMiscellaneousServices />
									</div>
									<p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
								</div>
								<div className="flex  grow items-center justify-end gap-2 pl-2">
									<div className="flex items-center gap-1">
										<AiOutlineSafety size={15} />
										<p className="text-[0.6rem] font-light text-gray-500">{service.garantia} ANOS</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="flex w-full items-center justify-end">
				<button onClick={() => validateAndProceed()} className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700">
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default EquipmentsAndServices;
