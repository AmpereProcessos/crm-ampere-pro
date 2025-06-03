import { getInverterStr, getModulesStr, getPeakPotByModules } from "@/utils/methods";
import { InverterType, ModuleType } from "@/utils/models";
import React, { useEffect, useState } from "react";
import ProposalKit from "../../Cards/ProposalKit";
import LoadingComponent from "../../utils/LoadingComponent";

import { toast } from "react-hot-toast";
import Suppliers from "../../../utils/json-files/pvsuppliers.json";
import { IoMdRemoveCircle } from "react-icons/io";
import TextInput from "@/components/Inputs/TextInput";
import { AiOutlineSearch } from "react-icons/ai";
import MultipleSelectInput from "@/components/Inputs/MultipleSelectInput";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { FaSolarPanel } from "react-icons/fa";
import { TbTopologyStar } from "react-icons/tb";
import { useKits } from "@/utils/queries/kits";
import { TKitDTO } from "@/utils/schemas/kits.schema";
type SystemInfoProps = {
	requestInfo: TTechnicalAnalysis;
	setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
	requireFiles?: boolean;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
	proposal: IProposalInfo | undefined;
};
type SelectedKitsState = {
	kitId: string | string[];
	tipo?: "TRADICIONAL" | "PROMOCIONAL";
	nome: string;
	topologia: "INVERSOR" | "MICRO-INVERSOR";
	modulos: ModuleType[];
	inversores: InverterType[];
	fornecedor: string;
	preco: number;
}[];
type Filters = {
	suppliers: string[];
	topology: string[];
	search: string;
	potOrder: null | "ASC" | "DESC";
};
function getSelectedKitsPowerPeak(selectedKits: SelectedKitsState) {
	var totalSum = 0;
	selectedKits.forEach((kit) => {
		const kitPeakPower = getPeakPotByModules(kit.modulos);
		totalSum = totalSum + kitPeakPower;
	});
	return totalSum;
}
function SystemInfo({ requestInfo, setRequestInfo, requireFiles = true, goToNextStage, goToPreviousStage, proposal }: SystemInfoProps) {
	const { data: kits = [], isFetching: kitsFetching, isSuccess: kitsSuccess } = useKits();
	const [filteredKits, setFilteredKits] = useState<TKitDTO[] | undefined>(kits);
	const [filters, setFilters] = useState<Filters>({
		suppliers: [],
		topology: [],
		search: "",
		potOrder: null,
	});

	const [selectedKits, setSelectedKits] = useState<SelectedKitsState>([]);

	function handleOptionFilters() {
		var newArr;
		if (filters.suppliers.length > 0) {
			if (!newArr) newArr = kits;
			newArr = newArr?.filter((x) => filters.suppliers.includes(x.fornecedor));
		}
		if (filters.topology.length > 0) {
			if (!newArr) newArr = kits;
			newArr = newArr?.filter((x) => filters.topology.includes(x.topologia));
		}
		if (!newArr) {
			setFilteredKits(kits);
			return kits;
		} else {
			setFilteredKits(newArr);
			return newArr;
		}
	}

	function handleSearchFilter(value: string) {
		setFilters((prev) => ({ ...prev, search: value }));
		if (value.trim().length > 0) {
			if (filters.search.trim().length > 0) {
				let filtered = handleOptionFilters();
				let newArr = filtered?.filter((x) => x.nome.toUpperCase().includes(value.toUpperCase()));
				setFilteredKits(newArr);
			}
		} else {
			setFilteredKits(kits);
		}
	}
	function ordenateKitsByPower(param: string) {
		if (!filteredKits) return;
		var dumpyCopyOfKits = [...filteredKits];
		var newArr;
		console.log("PARAMETRO", param);
		switch (param) {
			case "ASC":
				newArr = dumpyCopyOfKits.sort((a, b) => getPeakPotByModules(a.modulos) - getPeakPotByModules(b.modulos));
				setFilteredKits(newArr);
				setFilters((prev) => ({ ...prev, potOrder: "ASC", order: null }));
				break;
			case "DESC":
				newArr = dumpyCopyOfKits.sort((a, b) => getPeakPotByModules(b.modulos) - getPeakPotByModules(a.modulos));
				setFilteredKits(newArr);
				setFilters((prev) => ({ ...prev, potOrder: "DESC", order: null }));
				break;
			default:
				setFilters((prev) => ({ ...prev, potOrder: null, order: null }));
				setFilteredKits(dumpyCopyOfKits);
				break;
		}
	}
	function validateFields() {
		if (selectedKits.length == 0) {
			toast.error("Escolha ao menos um kit para prosseguir.");
			return false;
		}
		return true;
	}
	function formatAndProceed() {
		var selectedKitsCopy = [...selectedKits];
		var kitIdsArr = selectedKitsCopy.flatMap((x) => x.kitId);
		var invQtdeArr = selectedKitsCopy.flatMap((x) => x.inversores).map((inv) => inv.qtde);
		var invPotArr = selectedKitsCopy.flatMap((x) => x.inversores).map((inv) => inv.potenciaNominal);
		var invBrandArr = selectedKitsCopy.flatMap((x) => x.inversores).map((inv) => `(${inv.fabricante}) ${inv.modelo}`);
		var modQtdeArr = selectedKitsCopy.flatMap((x) => x.modulos).map((mod) => mod.qtde);
		var modPotArr = selectedKitsCopy.flatMap((x) => x.modulos).map((mod) => mod.potencia);
		var modBrandArr = selectedKitsCopy.flatMap((x) => x.modulos).map((mod) => `(${mod.fabricante}) ${mod.modelo}`);

		// Joining into string
		var joinedInvQtdeArr = invQtdeArr.join("/");
		var joinedInvPotArr = invPotArr.join("/");
		var joinedInvBrandArr = invBrandArr.join("/");
		var joinedModQtdeArr = modQtdeArr.join("/");
		var joinedModPotArr = modPotArr.join("/");
		var joinedModBrandArr = modBrandArr.join("/");

		// console.log({ joinedInvQtdeArr, joinedInvPotArr, joinedInvBrandArr });
		setRequestInfo((prev) => ({
			...prev,
			kitIds: kitIdsArr,
			equipamentos: {
				...prev.equipamentos,
				modulos: {
					modelo: joinedModBrandArr,
					potencia: joinedModPotArr,
					qtde: joinedModQtdeArr,
				},
				inversor: { modelo: joinedInvBrandArr, potencia: joinedInvPotArr, qtde: joinedInvQtdeArr },
			},
			detalhes: {
				...prev.detalhes,
				topologia: selectedKitsCopy[0].topologia == "MICRO-INVERSOR" ? "MICRO-INVERSOR" : "INVERSOR",
			},
		}));
		goToNextStage();
	}
	function selectKit(kit: TKitDTO) {
		const modules = kit.modulos;
		const inverters = kit.inversores;
		const price = kit.preco;
		const topology = kit.topologia;
		const supplier = kit.fornecedor;
		if (selectedKits.some((prevKit) => prevKit.topologia != topology)) {
			toast.error("Não é possível selecionar kits de topologia diferente.");
			return;
		}
		if (selectedKits.some((prevKit) => prevKit.tipo != kit.tipo)) {
			toast.error("Não é possível selecionar kits tradicionais e promocionais numa única proposta.");
			return;
		}
		if (selectedKits.some((prevKit) => prevKit.fornecedor != kit.fornecedor)) {
			toast.error("Não é possível selecionar kits de diferentes fornecedores numa única proposta.");
			return;
		}
		var currentSelectedKitsCopy = [...selectedKits];
		currentSelectedKitsCopy.push({
			kitId: kit._id ? kit._id : "",
			tipo: kit.tipo,
			nome: kit.nome,
			topologia: topology,
			modulos: modules,
			inversores: inverters,
			fornecedor: supplier,
			preco: price,
		});
		toast.success("Kit adicionado !");
		setSelectedKits(currentSelectedKitsCopy);
	}
	console.log(selectedKits.length);
	useEffect(() => {
		setFilteredKits(kits);
	}, [kits]);
	return (
		<div className="flex w-full grow flex-col bg-[#fff] px-2">
			<span className="py-2 text-center text-lg font-bold uppercase text-[#15599a]">DADOS DO SISTEMA</span>
			<div className="flex w-full grow flex-col gap-2">
				{proposal?.kit ? (
					<div className="flex w-full flex-col self-center rounded border border-gray-200 p-3 shadow-sm lg:w-[60%]">
						<div className="flex w-full items-center justify-between">
							<h1 className="font-bold leading-none tracking-tight">{proposal.kit.nome}</h1>
							<h1 className="rounded-md border border-blue-500 p-1 text-xs font-medium tracking-tight text-blue-500">KIT DA PROPOSTA ATIVA</h1>
						</div>
						<div className="flex items-center gap-2">
							<FaSolarPanel />
							<h1 className="text-sm font-medium text-[#fead41]">MÓDULOS</h1>
						</div>
						<h1 className="text-xs font-medium text-gray-500">{getModulesStr(proposal.kit.modulos, proposal.kit.tipo)}</h1>
						<div className="flex items-center gap-2">
							<TbTopologyStar />
							<h1 className="text-sm font-medium text-[#fead41]">INVERSORES</h1>
						</div>
						<h1 className="text-xs font-medium text-gray-500">{getInverterStr(proposal.kit.inversores, proposal.kit.tipo)}</h1>
						<div className="flex w-full items-center justify-end">
							<button
								onClick={() => selectKit(proposal.kit)}
								className="rounded border border-black p-1 px-4 text-xs font-medium duration-300 ease-in-out hover:bg-black hover:text-white"
							>
								UTILIZAR KIT
							</button>
						</div>
					</div>
				) : null}
				<div className="flex w-full flex-col items-center justify-between gap-2 px-1">
					<h1 className="w-full text-start font-bold">KITS SELECIONADOS</h1>
					{selectedKits.length > 0 ? (
						<>
							{selectedKits.map((kit, index) => (
								<div key={index} className="flex w-full items-center justify-between pb-1">
									<p className="italic text-gray-500">{kit.nome}</p>
									<button
										onClick={() => {
											var currentSelectedKitsCopy = [...selectedKits];
											currentSelectedKitsCopy.splice(index, 1);
											setSelectedKits(currentSelectedKitsCopy);
										}}
										className="text-gray-500 hover:text-red-500"
									>
										<IoMdRemoveCircle />
									</button>
								</div>
							))}
							<div className="flex w-full items-center justify-center gap-2">
								<div className="flex flex-col rounded border border-[#15599a] p-2 text-[#15599a]">
									<h1 className="text-center">POTÊNCIA PICO TOTAL</h1>
									<h1 className="text-center font-medium">{getSelectedKitsPowerPeak(selectedKits).toLocaleString("pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWp </h1>
								</div>
							</div>
						</>
					) : (
						<div className="flex h-[80px] w-full items-center justify-center">
							<p className="text-sm italic text-gray-500">Sem kits selecionados...</p>
						</div>
					)}
				</div>
				<div className="mt-2 flex w-full flex-wrap items-center justify-between gap-1">
					<div className="flex w-full items-end gap-2">
						<div className="w-full lg:w-[50%]">
							<TextInput
								label="PESQUISA"
								value={filters.search}
								handleChange={(value) => {
									handleSearchFilter(value);
								}}
								placeholder="Pesquisa aqui o nome do kit..."
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[50%]">
							<div className="flex w-full justify-center gap-2">
								<div
									onClick={() => ordenateKitsByPower("ASC")}
									className={`flex h-[46px] w-full cursor-pointer items-center justify-center rounded-md border border-[#FEAD41] p-1 text-center lg:w-fit ${
										filters.potOrder == "ASC" ? "bg-[#FEAD41] text-white" : "bg-transparent text-[#FEAD41]"
									}`}
								>
									POTÊNCIA CRESCENTE
								</div>
								<div
									onClick={() => ordenateKitsByPower("DESC")}
									className={`flex h-[46px] w-full cursor-pointer items-center justify-center rounded-md border border-[#FEAD41] p-1 text-center lg:w-fit ${
										filters.potOrder == "DESC" ? "bg-[#FEAD41] text-white" : "bg-transparent text-[#FEAD41]"
									}`}
								>
									POTÊNCIA DECRESCENTE
								</div>
							</div>
						</div>
					</div>
					<div className="flex w-full items-end justify-center gap-2">
						<MultipleSelectInput
							label="FORNECEDORES"
							selected={filters.suppliers.length > 0 ? filters.suppliers.map((supplier) => supplier) : null}
							options={Suppliers.map((supplier) => {
								return {
									id: supplier.id,
									label: supplier.nome,
									value: supplier.nome,
								};
							})}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value: string[] | []) => {
								setFilters((prev) => ({
									...prev,
									suppliers: value,
								}));
							}}
							onReset={() => {
								setFilters((prev) => ({
									...prev,
									suppliers: [],
								}));
							}}
						/>
						<MultipleSelectInput
							label="TOPOLOGIA"
							selected={filters.topology.length > 0 ? filters.topology.map((supplier) => supplier) : null}
							options={[
								{ id: 1, label: "INVERSOR", value: "INVERSOR" },
								{
									id: 2,
									label: "MICRO-INVERSOR",
									value: "MICRO-INVERSOR",
								},
							]}
							resetOptionLabel="NÃO DEFINIDO"
							handleChange={(value: string[] | []) => {
								setFilters((prev) => ({
									...prev,
									topology: value,
								}));
							}}
							onReset={() => {
								setFilters((prev) => ({
									...prev,
									topology: [],
								}));
							}}
						/>
						<button
							onClick={() => handleOptionFilters()}
							className="flex h-[46px] w-full items-center justify-center rounded border border-[#fead61] p-3 text-[#fead61] hover:bg-[#fead61] hover:text-black lg:w-fit"
						>
							<AiOutlineSearch />
						</button>
					</div>
				</div>
				<div className="flex max-h-[500px] grow flex-wrap items-center justify-center gap-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 lg:justify-between">
					{kitsSuccess && filteredKits ? filteredKits.map((kit) => <TechAnalysisKit key={kit._id} kit={kit} handleSelect={(value) => selectKit(value)} />) : null}
					{kitsFetching ? <LoadingComponent /> : null}
				</div>
			</div>

			<div className="mt-2 flex w-full justify-between">
				<button onClick={() => goToPreviousStage()} className="rounded p-2 font-bold text-gray-500 duration-300 ease-in-out hover:scale-105">
					Voltar
				</button>
				<button
					onClick={() => {
						if (validateFields()) {
							formatAndProceed();
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

export default SystemInfo;
