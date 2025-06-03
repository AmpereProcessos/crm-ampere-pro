import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { IContractRequest } from "@/utils/models";
import { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillDelete, AiOutlinePlus } from "react-icons/ai";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { FaRegListAlt, FaSolarPanel } from "react-icons/fa";
type PersonalizedSystemInfoProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
type ItemState = {
	brand: string;
	qtde: number | null;
	power: number | null;
};
function PersonalizedSystemInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage }: PersonalizedSystemInfoProps) {
	const [inverterList, setInverterList] = useState<ItemState[]>([]);
	const [moduleList, setModuleList] = useState<ItemState[]>([]);
	const [inverterHolder, setInverterHolder] = useState<ItemState>({
		brand: "",
		qtde: 0,
		power: 0,
	});
	const [moduleHolder, setModuleHolder] = useState<ItemState>({
		brand: "",
		qtde: 0,
		power: 0,
	});
	function addInverter() {
		// Validations
		if (inverterHolder.brand.trim().length < 2) {
			toast.error("Por favor, preencha uma marca de ao menos 2 letras pro inversor.");
			return;
		}
		if (!inverterHolder.qtde || inverterHolder.qtde <= 0) {
			toast.error("Por favor, adicione uma quantidade válida de inversores.");
			return;
		}
		if (!inverterHolder.power || inverterHolder.power <= 0) {
			toast.error("Por favor, adicione uma potência válida para o inversor.");
			return;
		}
		// Adding to current list
		var invListCopy = [...inverterList];
		invListCopy.push(inverterHolder);
		setInverterList(invListCopy);

		// Cleaning state for next addition
		setInverterHolder({
			brand: "",
			qtde: 1,
			power: 1,
		});
		toast.success("Inversor adicionado com sucesso!");
	}
	function addModule() {
		// Validations
		if (moduleHolder.brand.trim().length < 2) {
			toast.error("Por favor, preencha uma marca de ao menos 2 letras pro inversor.");
			return;
		}
		if (!moduleHolder.qtde || moduleHolder.qtde <= 0) {
			toast.error("Por favor, adicione uma quantidade válida de inversores.");
			return;
		}
		if (!moduleHolder.power || moduleHolder.power <= 0) {
			toast.error("Por favor, adicione uma potência válida para o inversor.");
			return;
		}
		// Adding to current list
		var moduleListCopy = [...moduleList];
		moduleListCopy.push(moduleHolder);
		setModuleList(moduleListCopy);

		// Cleaning state for next addition
		setModuleHolder({
			brand: "",
			qtde: 1,
			power: 1,
		});
		toast.success("Módulo adicionado com sucesso!");
	}
	function formatListsToRequestFields() {
		const joinedModulesBrand = moduleList.flatMap((module) => module.brand).join("/");
		const joinedModulesQtde = moduleList.flatMap((module) => module.qtde).join("/");
		const joinedModulesPower = moduleList.flatMap((module) => module.power).join("/");

		const joinedInvertersBrand = inverterList.flatMap((inverter) => inverter.brand).join("/");
		const joinedInvertersQtde = inverterList.flatMap((inverter) => inverter.qtde).join("/");
		const joinedInvertersPower = inverterList.flatMap((inverter) => inverter.power).join("/");

		setRequestInfo((prev) => ({
			...prev,
			marcaModulos: joinedModulesBrand,
			qtdeModulos: joinedModulesQtde,
			potModulos: joinedModulesPower,
			marcaInversor: joinedInvertersBrand,
			qtdeInversor: joinedInvertersQtde,
			potInversor: joinedInvertersPower,
		}));
		return;
	}
	function validateFields() {
		if (!requestInfo.topologia) {
			toast.error("Preencha a topologia do sistema.");
			return false;
		}
		if (inverterList.length == 0) {
			toast.error("Adicione no mínimo um inversor à lista.");
			return false;
		}
		if (moduleList.length == 0) {
			toast.error("Adicione no mínimo um módulo à lista.");
			return false;
		}
		formatListsToRequestFields();

		return true;
	}
	return (
		<div className="flex w-full grow flex-col bg-[#fff] pb-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DO SISTEMA</span>
			<div className="flex w-full grow flex-col">
				<div className="flex w-full items-center justify-center">
					<SelectInput
						label="TOPOLOGIA"
						value={requestInfo.topologia}
						options={[
							{ id: 1, label: "MICRO-INVERSOR", value: "MICRO-INVERSOR" },
							{ id: 2, label: "INVERSOR", value: "INVERSOR" },
						]}
						resetOptionLabel="NÃO DEFINIDO"
						handleChange={(value) => setRequestInfo((prev) => ({ ...prev, topologia: value }))}
						onReset={() => setRequestInfo((prev) => ({ ...prev, topologia: null }))}
					/>
				</div>
				<h1 className="mt-4 w-full text-center font-medium text-[#fead41]">INVERSORES</h1>
				<div className="flex w-full items-center gap-2">
					<div className="w-[30%]">
						<TextInput
							label="MARCA DO INVERSOR"
							placeholder="Digite aqui a marca do inversor..."
							value={inverterHolder.brand}
							handleChange={(value) => setInverterHolder((prev) => ({ ...prev, brand: value }))}
							width="100%"
						/>
					</div>
					<div className="w-[30%]">
						<NumberInput
							label="QUANTIDADE DE INVERSORES"
							placeholder="Digite aqui a quantidade de inversores..."
							value={inverterHolder.qtde}
							handleChange={(value) => setInverterHolder((prev) => ({ ...prev, qtde: value }))}
							width="100%"
						/>
					</div>
					<div className="w-[30%]">
						<NumberInput
							label="POTÊNCIA DOS INVERSORES"
							placeholder="Digite aqui a potência dos inversores..."
							value={inverterHolder.power}
							handleChange={(value) => setInverterHolder((prev) => ({ ...prev, power: value }))}
							width="100%"
						/>
					</div>
					<div className="flex h-full w-[10%] items-end justify-center">
						<button onClick={addInverter} className="mb-4 cursor-pointer text-lg text-green-500 duration-300 ease-in-out hover:scale-125">
							<AiOutlinePlus />
						</button>
					</div>
				</div>
				<div className="flex min-h-[80px] w-full flex-col py-1">
					{inverterList.length > 0 ? (
						inverterList.map((inv, index) => (
							<div key={index} className="flex w-full items-center justify-center gap-2 py-2">
								<BsBoundingBoxCircles style={{ fontSize: "25px" }} />
								<p className="text-md font-medium text-gray-500">
									<strong className="text-green-500">{inv.qtde}</strong>x<strong className="text-green-500">{inv.brand}</strong> de <strong className="text-green-500">
										{inv.power}W
									</strong>{" "}
								</p>
								<button
									onClick={() => {
										let arr = inverterList;
										arr.splice(index, 1);
										setInverterList([...arr]);
									}}
									className="text-lg text-red-300 duration-300 ease-in-out hover:scale-110 hover:text-red-500"
								>
									<AiFillDelete />
								</button>
							</div>
						))
					) : (
						<div className="flex w-full grow flex-col items-center justify-center">
							<FaRegListAlt />
							<p className="text-center text-sm italic text-gray-500">Lista de inversores vazia...</p>
						</div>
					)}
				</div>
				<h1 className="mt-4 w-full text-center font-medium text-[#fead41]">MÓDULOS</h1>
				<div className="flex w-full items-center gap-2">
					<div className="w-[30%]">
						<TextInput
							label="MARCA DO MÓDULO"
							placeholder="Digite aqui a marca do módulo..."
							value={moduleHolder.brand}
							handleChange={(value) => setModuleHolder((prev) => ({ ...prev, brand: value }))}
							width="100%"
						/>
					</div>
					<div className="w-[30%]">
						<NumberInput
							label="QUANTIDADE DE MÓDULOS"
							placeholder="Digite aqui a quantidade de módulos..."
							value={moduleHolder.qtde}
							handleChange={(value) => setModuleHolder((prev) => ({ ...prev, qtde: value }))}
							width="100%"
						/>
					</div>
					<div className="w-[30%]">
						<NumberInput
							label="POTÊNCIA DOS MÓDULOS"
							placeholder="Digite aqui a potência dos módulos..."
							value={moduleHolder.power}
							handleChange={(value) => setModuleHolder((prev) => ({ ...prev, power: value }))}
							width="100%"
						/>
					</div>
					<div className="flex h-full w-[10%] items-end justify-center">
						<button onClick={addModule} className="mb-4 cursor-pointer text-lg text-green-500 duration-300 ease-in-out hover:scale-125">
							<AiOutlinePlus />
						</button>
					</div>
				</div>
				<div className="flex min-h-[80px] w-full flex-col py-1">
					{moduleList.length > 0 ? (
						moduleList.map((module, index) => (
							<div key={index} className="flex w-full items-center justify-center gap-2 py-2">
								<FaSolarPanel style={{ fontSize: "25px" }} />
								<p className="text-md font-medium text-gray-500">
									<strong className="text-green-500">{module.qtde}</strong>x<strong className="text-green-500">{module.brand}</strong> de{" "}
									<strong className="text-green-500">{module.power}W</strong>{" "}
								</p>
								<button
									onClick={() => {
										let arr = moduleList;
										arr.splice(index, 1);
										setModuleList([...arr]);
									}}
									className="text-lg text-red-300 duration-300 ease-in-out hover:scale-110 hover:text-red-500"
								>
									<AiFillDelete />
								</button>
							</div>
						))
					) : (
						<div className="flex w-full grow flex-col items-center justify-center">
							<FaRegListAlt />
							<p className="text-center text-sm italic text-gray-500">Lista de módulos vazia...</p>
						</div>
					)}
				</div>
			</div>
			<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
				<button
					onClick={() => {
						goToPreviousStage();
					}}
					className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
				>
					Voltar
				</button>
				<button
					onClick={() => {
						if (validateFields()) {
							goToNextStage();
						}
					}}
					className="rounded p-2 font-bold hover:bg-black hover:text-white"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default PersonalizedSystemInfo;
