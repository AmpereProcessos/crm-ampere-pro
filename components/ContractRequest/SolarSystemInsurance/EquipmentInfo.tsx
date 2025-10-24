import NumberInput from "@/components/Inputs/NumberInput";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { renderCategoryIcon } from "@/lib/methods/rendering";
import { TContractRequest } from "@/utils/schemas//contract-request.schema";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { ImPower } from "react-icons/im";
import { MdDelete } from "react-icons/md";

type TInsuranceEquipment = {
	categoria: "MÓDULO" | "INVERSOR";
	modelo: string;
	qtde: number;
	potencia: number;
};

type EquipmentProps = {
	requestInfo: TContractRequest;
	setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
};
function Equipment({ requestInfo, setRequestInfo, goToNextStage, goToPreviousStage }: EquipmentProps) {
	const [equipmentHolder, setEquipmentHolder] = useState<TInsuranceEquipment>({
		categoria: "MÓDULO",
		modelo: "",
		qtde: 0,
		potencia: 0,
	});
	const [equipmentsList, setEquipmentsList] = useState<TInsuranceEquipment[]>([]);

	function addToList(equipment: TInsuranceEquipment) {
		const equipments = [...equipmentsList];
		equipments.push(equipment);
		setEquipmentsList(equipments);
	}
	function removeFromList(index: number) {
		const equipments = [...equipmentsList];
		equipments.splice(index, 1);
		setEquipmentsList(equipments);
	}
	function handleProceed() {
		if (equipmentsList.length < 1) return toast.error("Oops, adicione ao menos um equipamento para prosseguir.");
		const joinedModulesBrand = equipmentsList
			.filter((e) => e.categoria == "MÓDULO")
			.flatMap((module) => module.modelo)
			.join("/");
		const joinedModulesQtde = equipmentsList
			.filter((e) => e.categoria == "MÓDULO")
			.flatMap((module) => module.qtde)
			.join("/");
		const joinedModulesPower = equipmentsList
			.filter((e) => e.categoria == "MÓDULO")
			.flatMap((module) => module.potencia)
			.join("/");

		const joinedInvertersBrand = equipmentsList
			.filter((e) => e.categoria == "INVERSOR")
			.flatMap((inverter) => inverter.modelo)
			.join("/");
		const joinedInvertersQtde = equipmentsList
			.filter((e) => e.categoria == "INVERSOR")
			.flatMap((inverter) => inverter.qtde)
			.join("/");
		const joinedInvertersPower = equipmentsList
			.filter((e) => e.categoria == "INVERSOR")
			.flatMap((inverter) => inverter.potencia)
			.join("/");
		setRequestInfo((prev) => ({
			...prev,
			marcaModulos: joinedModulesBrand,
			qtdeModulos: joinedModulesQtde,
			potModulos: joinedModulesPower,
			marcaInversor: joinedInvertersBrand,
			qtdeInversor: joinedInvertersQtde,
			potInversor: joinedInvertersPower,
		}));
		return goToNextStage();
	}
	return (
		<div className="flex w-full grow flex-col  bg-background pb-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DOS EQUIPAMENTOS</span>
			<div className="flex w-full grow flex-col gap-1">
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-full lg:w-[30%]">
						<SelectInput
							label="CATEGORIA"
							resetOptionLabel="NÃO DEFINIDO"
							options={[
								{ id: 1, label: "MÓDULO", value: "MÓDULO" },
								{ id: 2, label: "INVERSOR", value: "INVERSOR" },
							]}
							value={equipmentHolder.categoria}
							handleChange={(value) =>
								setEquipmentHolder((prev) => ({
									...prev,
									categoria: value,
								}))
							}
							onReset={() => {
								setEquipmentHolder((prev) => ({
									...prev,
									categoria: "MÓDULO",
								}));
							}}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-[40%]">
						<TextInput
							label="MODELO"
							placeholder="MODELO"
							value={equipmentHolder.modelo}
							handleChange={(value) =>
								setEquipmentHolder((prev) => ({
									...prev,
									modelo: value,
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-[15%]">
						<NumberInput
							label="POTÊNCIA"
							value={equipmentHolder.potencia || null}
							handleChange={(value) =>
								setEquipmentHolder((prev) => ({
									...prev,
									potencia: Number(value),
								}))
							}
							placeholder="POTÊNCIA"
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-[15%]">
						<NumberInput
							label="QTDE"
							value={equipmentHolder.qtde}
							handleChange={(value) =>
								setEquipmentHolder((prev) => ({
									...prev,
									qtde: Number(value),
								}))
							}
							placeholder="QTDE"
							width="100%"
						/>
					</div>
				</div>
				<div className="flex items-center justify-end">
					<button
						className="rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70"
						onClick={() => addToList(equipmentHolder)}
					>
						ADICIONAR EQUIPAMENTO
					</button>
				</div>
				<div className="mt-2 flex min-h-[150px] w-full flex-col rounded-md border border-primary/50 p-3 shadow-md">
					<h1 className="mb-2 text-start font-Inter font-bold leading-none tracking-tight">PRODUTOS ADICIONADOS</h1>
					<div className="flex w-full flex-wrap items-center justify-around gap-2">
						{equipmentsList.length > 0 ? (
							equipmentsList.map((product, index) => (
								<div className="flex w-full flex-col rounded-md border border-primary/30 p-2 lg:w-[450px]">
									<div className="flex w-full items-center justify-between gap-2">
										<div className="flex  items-center gap-1">
											<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
												{renderCategoryIcon(product.categoria)}
											</div>
											<p className="text-xs font-medium leading-none tracking-tight lg:text-sm">
												<strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
											</p>
										</div>

										<button
											onClick={() => removeFromList(index)}
											type="button"
											className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
										>
											<MdDelete style={{ color: "red" }} size={15} />
										</button>
									</div>

									<div className="mt-1 flex w-full items-center justify-end gap-2 pl-2">
										<div className="flex items-center gap-1">
											<ImPower size={12} />
											<p className="text-[0.6rem] font-light text-primary/70 lg:text-xs">{product.potencia} W</p>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center font-light text-primary/70">Nenhum produto adicionado</div>
						)}
					</div>
				</div>
			</div>
			<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
				<button
					onClick={() => {
						goToPreviousStage();
					}}
					className="rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105"
				>
					Voltar
				</button>
				<button
					onClick={() => {
						handleProceed();
					}}
					className="rounded p-2 font-bold hover:bg-black hover:text-primary-foreground"
				>
					Prosseguir
				</button>
			</div>
		</div>
	);
}

export default Equipment;
