import SelectInput from "@/components/Inputs/SelectInput";
import SelectWithImages from "@/components/Inputs/SelectWithImages";
import Avatar from "@/components/utils/Avatar";
import type { TOpportunity, TOpportunityResponsible } from "@/utils/schemas/opportunity.schema";
import type { TUserDTOSimplified } from "@/utils/schemas/user.schema";
import { OpportunityResponsibilityRoles } from "@/utils/select-options";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import { Users } from "lucide-react";

type ResponsiblesInformationBlockProps = {
	session: TUserSession;
	opportunity: TOpportunity;
	setOpportunity: Dispatch<SetStateAction<TOpportunity>>;
	opportunityCreators: TUserDTOSimplified[];
};
function ResponsiblesInformationBlock({ session, opportunity, setOpportunity, opportunityCreators }: ResponsiblesInformationBlockProps) {
	const initialResponsibleHolder = opportunityCreators.find((opCreator) => opCreator._id.toString() === session.user.id);
	const [responsibleHolder, setResponsibleHolder] = useState<TOpportunityResponsible>({
		id: initialResponsibleHolder?._id || "",
		nome: initialResponsibleHolder?.nome || "",
		papel: OpportunityResponsibilityRoles[0].value,
		avatar_url: initialResponsibleHolder?.avatar_url || null,
		telefone: initialResponsibleHolder?.telefone || "",
		dataInsercao: new Date().toISOString(),
	});
	function addOpportunityResponsible(responsible: TOpportunityResponsible) {
		if (responsible.id.trim().length < 20) return toast.error("Escolha um responsável válido.");
		const responsibles = [...opportunity.responsaveis];
		responsibles.push(responsible);
		return setOpportunity((prev) => ({ ...prev, responsaveis: responsibles }));
	}
	function removeOpportunityResponsible(index: number) {
		const responsibles = [...opportunity.responsaveis];
		responsibles.splice(index, 1);
		return setOpportunity((prev) => ({ ...prev, responsaveis: responsibles }));
	}
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
				<Users size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">RESPONSÁVEIS</h1>
			</div>
			<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
				<div className="w-full lg:w-2/3">
					<SelectWithImages
						label="USUÁRIO"
						value={responsibleHolder.id}
						options={opportunityCreators.map((user) => ({
							id: user._id.toString(),
							label: user.nome,
							value: user._id.toString(),
							url: user.avatar_url || undefined,
						}))}
						handleChange={(value) => {
							const equivalentUser = opportunityCreators.find((opCreator) => value === opCreator._id.toString());
							setResponsibleHolder((prev) => ({
								...prev,
								id: equivalentUser?._id.toString() || "",
								nome: equivalentUser?.nome || "",
								avatar_url: equivalentUser?.avatar_url || null,
								telefone: equivalentUser?.telefone || "",
							}));
						}}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() =>
							setResponsibleHolder({
								nome: "",
								id: "",
								papel: "",
								avatar_url: null,
								telefone: "",
								dataInsercao: new Date().toISOString(),
							})
						}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/3">
					<SelectInput
						label="PAPEL"
						value={responsibleHolder.papel}
						options={OpportunityResponsibilityRoles}
						handleChange={(value) => setResponsibleHolder((prev) => ({ ...prev, papel: value }))}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => setResponsibleHolder((prev) => ({ ...prev, papel: OpportunityResponsibilityRoles[0].value }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full items-center justify-end">
				<button
					type="button"
					onClick={() => addOpportunityResponsible(responsibleHolder)}
					className="whitespace-nowrap rounded bg-gray-800 px-4 py-2 text-xs font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-700 enabled:hover:text-white"
				>
					ADICIONAR RESPONSÁVEL
				</button>
			</div>
			{opportunity.responsaveis.length > 0 ? (
				opportunity.responsaveis.map((resp, index) => (
					<div key={resp.id} className="flex w-full justify-between rounded-md border border-gray-300 p-3 font-Inter">
						<div className="flex grow items-center gap-1">
							<Avatar width={20} height={20} url={resp.avatar_url || undefined} fallback={resp.nome} />
							<p className="text-sm font-medium leading-none tracking-tight text-gray-500">{resp.nome}</p>{" "}
							<p className="ml-1 rounded-md border border-cyan-400 p-1 text-xxs font-bold text-cyan-400">{resp.papel}</p>
						</div>
						<button
							onClick={() => removeOpportunityResponsible(index)}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<MdDelete size={15} />
						</button>
					</div>
				))
			) : (
				<p className="w-full text-center text-xs italic leading-none tracking-tight text-gray-500">Sem responsáveis vinculados...</p>
			)}
		</div>
	);
}

export default ResponsiblesInformationBlock;
