import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import Avatar from "../utils/Avatar";
import { IUsuario } from "@/utils/models";
import { IoMdCall } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { BsFillCalendarFill, BsTelephone } from "react-icons/bs";
import NumberInput from "../Inputs/NumberInput";
import { MdAttachMoney, MdCreate, MdSell } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import { useEditUser } from "@/utils/mutations/users";
import toast from "react-hot-toast";
import SelectInput from "../Inputs/SelectInput";
import dayjs from "dayjs";
import { usePromoterSaleGoals } from "@/utils/queries/sale-goals";
import { checkQueryEnableStatus, formatToMoney } from "@/utils/methods";
import { useSession } from "next-auth/react";
import LoadingComponent from "../utils/LoadingComponent";
import { ImPower } from "react-icons/im";
import { FaPercentage } from "react-icons/fa";
import SaleGoals from "../Cards/SaleGoals";
import { createSaleGoal, editSaleGoal } from "@/utils/mutations/sale-goals";
import { AiOutlineClear } from "react-icons/ai";
import { getMonthPeriodsStrings } from "@/lib/methods/dates";
import { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
import { Session } from "next-auth";
import { TSaleGoal, TSaleGoalDTO } from "@/utils/schemas/sale-goal.schema";
import ErrorComponent from "../utils/ErrorComponent";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const periodStr = dayjs(currentDate).format("MM/YYYY");
const periodOptions = getMonthPeriodsStrings({ initialYear: currentYear - 1, endYear: currentYear + 1 });
type EditPromoterProps = {
	session: Session;
	closeModal: () => void;
	promoter: TUserDTOWithSaleGoals;
};
function EditPromoter({ session, closeModal, promoter }: EditPromoterProps) {
	const queryClient = useQueryClient();

	const { data: goals, isLoading, isError, isSuccess } = usePromoterSaleGoals(promoter._id);
	const [activeSaleGoalId, setActiveSaleGoalId] = useState<string | null>(null);
	const [goalsHolder, setGoalsHolder] = useState<TSaleGoalDTO["metas"]>({
		projetosCriados: null,
		potenciaVendida: null,
		valorVendido: null,
		projetosVendidos: null,
		projetosEnviados: null,
		conversao: null,
	});
	const [period, setPeriod] = useState<string>(periodStr);

	const { mutate: handleCreateSaleGoal, isPending: creatingGoal } = useMutationWithFeedback({
		mutationKey: ["create-sale-goal"],
		mutationFn: createSaleGoal,
		queryClient: queryClient,
		affectedQueryKey: ["user-sale-goals", promoter._id],
		callbackFn: () => clearGoalsHolder(),
	});
	const { mutate: handleEditSaleGoal, isPending: updatingGoal } = useMutationWithFeedback({
		mutationKey: ["edit-sale-goal", activeSaleGoalId],
		mutationFn: editSaleGoal,
		queryClient: queryClient,
		affectedQueryKey: ["user-sale-goals", promoter._id],
		callbackFn: () => clearGoalsHolder(),
	});

	function handleSaleGoalClick({ info, id, period }: { info: TSaleGoal["metas"]; id: string; period: string }) {
		setPeriod(period);
		setActiveSaleGoalId(id);
		setGoalsHolder(info);
	}
	function clearGoalsHolder() {
		setActiveSaleGoalId(null);
		setGoalsHolder({
			projetosCriados: null,
			potenciaVendida: null,
			valorVendido: null,
			projetosVendidos: null,
			projetosEnviados: null,
			conversao: null,
		});
	}

	function getInsertionObject({ goals }: { goals: TSaleGoal["metas"] }): TSaleGoal {
		return {
			periodo: period,
			idParceiro: session.user.idParceiro || "",
			usuario: {
				id: promoter._id || "",
				nome: promoter.nome,
			},
			autor: {
				id: session.user.id,
				nome: session.user.nome,
				avatar_url: session.user.avatar_url,
			},
			metas: goals,
			dataInsercao: new Date().toISOString(),
		};
	}

	return (
		<div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] xl:w-[60%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">CONTROLE DE METAS</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex h-full flex-col items-center gap-y-2 overflow-y-auto overscroll-y-auto py-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
						<div className="flex w-full items-center justify-center gap-4 self-center px-4">
							<Avatar fallback="U" height={50} width={50} url={promoter.avatar_url || undefined} />
							<div className="flex flex-col items-start gap-2">
								<h1 className="text-lg font-bold leading-none tracking-tight">{promoter.nome}</h1>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										<BsTelephone />
										<p className="text-sm text-gray-500">{promoter.telefone}</p>
									</div>
									<div className="flex items-center gap-2">
										<HiOutlineMail />
										<p className="text-sm text-gray-500">{promoter.email}</p>
									</div>
								</div>
							</div>
						</div>
						<h1 className="mb-2 mt-4 w-full text-center font-bold leading-none tracking-tight text-blue-500">DEFINIÇÃO DE METAS</h1>
						{activeSaleGoalId ? (
							<button onClick={clearGoalsHolder} className="text-2xl text-gray-700 duration-300 ease-in-out hover:text-gray-400">
								<AiOutlineClear />
							</button>
						) : null}
						<div className="flex w-full items-center justify-center">
							<div className="w-full lg:w-[50%]">
								<SelectInput
									label="PERÍODO"
									labelClassName="font-semibold leading-none tracking-tight"
									value={period}
									options={periodOptions.map((p, index) => ({ id: index + 1, label: p, value: p }))}
									handleChange={(value) => setPeriod(value)}
									onReset={() => setPeriod(periodStr)}
									resetOptionLabel="PERÍODO ATUAL"
									width="100%"
								/>
							</div>
						</div>
						<div className="flex w-full items-center gap-2">
							<div className="w-full lg:w-[50%]">
								<NumberInput
									label="POTÊNCIA PICO (kW)"
									labelClassName="font-semibold leading-none tracking-tight"
									placeholder="Preencha aqui a meta para potência pico..."
									value={goalsHolder?.potenciaVendida || null}
									handleChange={(value) => setGoalsHolder((prev) => ({ ...prev, potenciaVendida: value }))}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[50%]">
								<NumberInput
									label="VALOR VENDIDO"
									labelClassName="font-semibold leading-none tracking-tight"
									placeholder="Preencha aqui a meta para valor vendido..."
									value={goalsHolder?.valorVendido || null}
									handleChange={(value) => setGoalsHolder((prev) => ({ ...prev, valorVendido: value }))}
									width="100%"
								/>
							</div>
						</div>
						<div className="flex w-full items-center gap-2">
							<div className="w-full lg:w-[50%]">
								<NumberInput
									label="Nº DE PROJETOS VENDIDOS"
									labelClassName="font-semibold leading-none tracking-tight"
									placeholder="Preencha aqui a meta para o nº de projetos vendidos..."
									value={goalsHolder?.projetosVendidos || null}
									handleChange={(value) => setGoalsHolder((prev) => ({ ...prev, projetosVendidos: value }))}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[50%]">
								<NumberInput
									label="CONVERSÃO"
									labelClassName="font-semibold leading-none tracking-tight"
									placeholder="Preencha aqui a meta para % de conversão..."
									value={goalsHolder?.conversao || null}
									handleChange={(value) => setGoalsHolder((prev) => ({ ...prev, conversao: value }))}
									width="100%"
								/>
							</div>
						</div>
						<div className="flex w-full items-center gap-2">
							<div className="w-full lg:w-[50%]">
								<NumberInput
									label="PROJETOS CRIADOS"
									labelClassName="font-semibold leading-none tracking-tight"
									placeholder="Preencha aqui a meta para o nº de projetos criados..."
									value={goalsHolder?.projetosCriados || null}
									handleChange={(value) => setGoalsHolder((prev) => ({ ...prev, projetosCriados: value }))}
									width="100%"
								/>
							</div>
							<div className="w-full lg:w-[50%]">
								<NumberInput
									label="PROJETOS ENVIADOS"
									labelClassName="font-semibold leading-none tracking-tight"
									placeholder="Preencha aqui a meta para o nº de projetos enviados..."
									value={goalsHolder?.projetosEnviados || null}
									handleChange={(value) => setGoalsHolder((prev) => ({ ...prev, projetosEnviados: value }))}
									width="100%"
								/>
							</div>
						</div>
						<div className="flex w-full items-center justify-end  px-2 py-2">
							{activeSaleGoalId ? (
								<button
									onClick={() => {
										// @ts-ignore
										handleEditSaleGoal({ id: activeSaleGoalId, changes: { metas: goalsHolder } });
									}}
									disabled={updatingGoal}
									className="rounded p-1 font-medium text-[#15599a] duration-300 ease-in-out disabled:text-gray-300 hover:scale-110 hover:bg-blue-50"
								>
									SALVAR
								</button>
							) : (
								<button
									onClick={() => {
										const obj = getInsertionObject({ goals: goalsHolder });
										// @ts-ignore
										handleCreateSaleGoal(obj);
									}}
									disabled={creatingGoal}
									className="rounded p-1 font-medium text-green-500 duration-300 ease-in-out disabled:text-gray-300 hover:scale-110 hover:bg-blue-50"
								>
									CRIAR
								</button>
							)}
						</div>
						<h1 className="w-full text-start font-bold tracking-tight">METAS DEFINIDAS</h1>
						<div className="flex w-full flex-col gap-2 pr-2">
							{isLoading ? <LoadingComponent /> : null}
							{isError ? <ErrorComponent msg="Erro ao buscar metas do usuário." /> : null}
							{isSuccess ? (
								goals.length > 0 ? (
									goals.map((goal) => <SaleGoals key={goal._id} saleGoal={goal} handleClick={handleSaleGoalClick} promoterId={promoter._id} />)
								) : (
									<p className="w-full py-2 text-center italic text-gray-500">Sem metas definidas...</p>
								)
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default EditPromoter;
