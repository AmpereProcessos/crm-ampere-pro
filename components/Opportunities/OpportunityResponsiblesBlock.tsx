import type { TOpportunityDTOWithClientAndPartnerAndFunnelReferences, TOpportunityResponsible } from "@/utils/schemas/opportunity.schema";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import Avatar from "../utils/Avatar";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { UseMutateFunction } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import { AiOutlineCheck } from "react-icons/ai";
import SelectInput from "../Inputs/SelectInput";
import { OpportunityResponsibilityRoles } from "@/utils/select-options";
import SelectWithImages from "../Inputs/SelectWithImages";
import type { TUserSession } from "@/lib/auth/session";
import { useOpportunityCreators } from "@/utils/queries/users";
import type { TNotification } from "@/utils/schemas/notification.schema";
import { createNotification } from "@/utils/mutations/notifications";
import { BsCalendarPlus } from "react-icons/bs";
type OpportunityResponsiblesBlockProps = {
	infoHolder: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	setInfoHolder: Dispatch<SetStateAction<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>>;
	handleUpdateOpportunity: any;
	session: TUserSession;
};
function OpportunityResponsiblesBlock({ infoHolder, setInfoHolder, handleUpdateOpportunity, session }: OpportunityResponsiblesBlockProps) {
	const { data: opportunityCreators } = useOpportunityCreators();
	const [newResponsibleMenuIsOpen, setNewResponsibleMenuIsOpen] = useState<boolean>(false);
	const [newOpportunityResponsible, setNewOpportunityResponsible] = useState<{
		nome: string | null;
		id: string | null;
		papel: string | null;
		avatar_url?: string | null;
	}>({
		nome: session.user.nome,
		id: session.user.id,
		papel: null,
		avatar_url: session.user.avatar_url,
	});

	function handleResponsibleRemoval({
		responsibles,
		responsibleToRemoveIndex,
	}: {
		responsibles: TOpportunityDTOWithClientAndPartnerAndFunnelReferences["responsaveis"];
		responsibleToRemoveIndex: number;
	}) {
		// Validating scope for removal
		const responsibleToRemove = responsibles[responsibleToRemoveIndex];
		const responsibleToRemoveId = responsibleToRemove.id;
		if (!!session.user.permissoes.oportunidades.escopo && !session.user.permissoes.oportunidades.escopo.includes(responsibleToRemoveId))
			return toast.error("Você não possui permissão para remover esse responsável.");
		if (responsibles.length === 1) return toast.error("Não é possível remover o único responsável da oportunidade.");
		const newResponsibles = [...responsibles];
		newResponsibles.splice(responsibleToRemoveIndex, 1);

		// @ts-ignore
		return handleUpdateOpportunity({ id: infoHolder._id, changes: { responsaveis: newResponsibles } });
	}
	async function handleResponsibleAddition({
		responsibles,
		responsibleToAdd,
	}: {
		responsibles: TOpportunityDTOWithClientAndPartnerAndFunnelReferences["responsaveis"];
		responsibleToAdd: TOpportunityDTOWithClientAndPartnerAndFunnelReferences["responsaveis"][number];
	}) {
		if (!responsibleToAdd.nome || !responsibleToAdd.id) return toast.error("Responsável inválido ou não preenchido.");
		if (!responsibleToAdd.papel) return toast.error("Papel de responsável inválido.");
		const opportunityResponsibles = [...responsibles];
		const responsible: TOpportunityResponsible = {
			nome: responsibleToAdd.nome,
			id: responsibleToAdd.id,
			papel: responsibleToAdd.papel,
			avatar_url: responsibleToAdd.avatar_url,
			dataInsercao: new Date().toISOString(),
		};
		opportunityResponsibles.push(responsible);
		// @ts-ignore
		handleUpdateOpportunity({ id: infoHolder._id, changes: { responsaveis: opportunityResponsibles } });
		// Notifying the new opportunity responsible
		const newNotification: TNotification = {
			remetente: { id: null, nome: "SISTEMA" },
			idParceiro: infoHolder.idParceiro,
			destinatarios: [{ id: responsibleToAdd.id, nome: responsibleToAdd.nome, avatar_url: responsibleToAdd.avatar_url }],
			oportunidade: {
				id: infoHolder._id,
				nome: infoHolder.nome,
				identificador: infoHolder.identificador,
			},
			mensagem: `${session.user.nome} adicionou você como responsável (com o papel de ${responsibleToAdd.papel}) da oportunidade ${infoHolder.nome}.`,
			recebimentos: [],
			dataInsercao: new Date().toISOString(),
		};
		await createNotification({ info: newNotification });
	}
	return (
		<div className=" flex w-full flex-col gap-2">
			<h1 className="w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-white">RESPONSÁVEIS DA OPORTUNIDADE</h1>
			<div className="flex flex-col gap-2">
				{infoHolder.responsaveis.map((resp, index) => (
					<div key={resp.id} className="flex w-full flex-col rounded-md border border-gray-200 p-3">
						<div className="flex w-full items-center gap-2">
							<div className="flex items-center gap-2">
								<Avatar url={resp.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(resp.nome)} />
								<h1 className="font-sans font-bold  text-[#353432]">{resp.nome}</h1>
							</div>
							<div className="flex grow items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => handleResponsibleRemoval({ responsibles: infoHolder.responsaveis, responsibleToRemoveIndex: index })}
									className="flex items-center justify-center gap-2 rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
								>
									<MdDelete style={{ color: "red" }} size={15} />
								</button>
								<button
									type="button"
									// disabled={infoHolder.responsaveis[index].papel == info.responsaveis[index].papel}
									onClick={() =>
										// @ts-ignore
										handleUpdateOpportunity({
											id: infoHolder._id,
											changes: { [`responsaveis.${index}.papel`]: infoHolder.responsaveis[index].papel },
										})
									}
									className="flex items-end justify-center  text-green-200"
								>
									<AiOutlineCheck
										style={{
											fontSize: "18px",
											// color: infoHolder.responsaveis[index].papel != info.responsaveis[index].papel ? 'rgb(34,197,94)' : 'rgb(156,163,175)',
											color: "rgb(34,197,94)",
										}}
									/>
								</button>
							</div>
						</div>
						<div className="mt-1 flex grow">
							<SelectInput
								label="PAPEL"
								showLabel={false}
								value={resp.papel}
								options={OpportunityResponsibilityRoles}
								handleChange={(value) => {
									const respList = [...infoHolder.responsaveis];
									respList[index].papel = value;
									setInfoHolder((prev) => ({ ...prev, responsaveis: respList }));
								}}
								resetOptionLabel="NÃO DEFINIDO"
								onReset={() => console.log()}
								width="100%"
							/>
						</div>
						<div className="mt-2 flex w-full items-center justify-end">
							<div className={"flex items-center gap-1"}>
								<BsCalendarPlus />
								<p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(resp.dataInsercao, true)}</p>
							</div>
						</div>
					</div>
				))}
				<div className="flex w-full items-center justify-end">
					<button
						type="button"
						onClick={() => setNewResponsibleMenuIsOpen((prev) => !prev)}
						className={`${
							newResponsibleMenuIsOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
						} rounded  p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out `}
					>
						{newResponsibleMenuIsOpen ? "FECHAR" : "ADICIONAR RESPONSÁVEL"}
					</button>
				</div>
				{newResponsibleMenuIsOpen ? (
					<div className="flex w-full flex-col gap-2">
						<div className="flex w-full gap-2">
							<div className="w-2/3">
								<SelectWithImages
									label="USUÁRIO"
									value={newOpportunityResponsible.id}
									options={
										opportunityCreators?.map((user) => ({
											id: user._id.toString(),
											label: user.nome,
											value: user._id.toString(),
											url: user.avatar_url || undefined,
										})) || []
									}
									handleChange={(value) => {
										const equivalentUser = opportunityCreators?.find((opCreator) => value === opCreator._id.toString());
										setNewOpportunityResponsible((prev) => ({
											...prev,
											id: equivalentUser?._id.toString() || "",
											nome: equivalentUser?.nome || "",
											avatar_url: equivalentUser?.avatar_url || null,
										}));
									}}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() =>
										setNewOpportunityResponsible({
											nome: "",
											id: "",
											papel: "",
											avatar_url: null,
										})
									}
									width="100%"
								/>
							</div>
							<div className="w-1/3">
								<SelectInput
									label="PAPEL"
									value={newOpportunityResponsible.papel}
									options={OpportunityResponsibilityRoles}
									handleChange={(value) => setNewOpportunityResponsible((prev) => ({ ...prev, papel: value }))}
									resetOptionLabel="NÃO DEFINIDO"
									onReset={() => setNewOpportunityResponsible((prev) => ({ ...prev, papel: null }))}
									width="100%"
								/>
							</div>
						</div>
						<div className="flex w-full items-center justify-end">
							<button
								type="button"
								// @ts-ignore
								onClick={() => handleResponsibleAddition({ responsibles: infoHolder.responsaveis, responsibleToAdd: newOpportunityResponsible })}
								className={`rounded bg-green-500
               p-1  px-4 text-xs font-medium text-white duration-300 ease-in-out hover:bg-green-600 `}
							>
								ADICIONAR
							</button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default OpportunityResponsiblesBlock;
