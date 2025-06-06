import CheckboxInput from "@/components/Inputs/CheckboxInput";
import Avatar from "@/components/utils/Avatar";
import { formatDateAsLocale, formatLocation, formatNameAsInitials, formatToMoney } from "@/lib/methods/formatting";
import { TExpenseWithProject } from "@/utils/schemas/expenses.schema";
import { AnimatePresence } from "framer-motion";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import { BsBank, BsCalendarPlus, BsPersonVcard } from "react-icons/bs";
import { FaPhone, FaUserAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import ExpenseProjectVinculationMenu from "./Utils/ProjectVinculationMenu";
import FilesBlock from "./FilesBlock";

type ProjectInformationBlockProps = {
	expenseId?: string;
	infoHolder: TExpenseWithProject;
	setInfoHolder: React.Dispatch<React.SetStateAction<TExpenseWithProject>>;
	session: TUserSession;
};
function ProjectInformationBlock({ expenseId, session, infoHolder, setInfoHolder }: ProjectInformationBlockProps) {
	const [vinculationMenuIsOpen, setVinculationMenuIsOpen] = useState<boolean>(false);
	const [showFiles, setShowFiles] = useState<boolean>(false);
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES DO PROJETO</h1>
			<div className="flex w-full flex-col gap-1">
				{infoHolder.projetoDados ? (
					<>
						<h1 className="w-full bg-gray-500 p-1 text-center text-xs font-medium text-white">GERAIS</h1>
						<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
							<div className="flex flex-col items-center gap-1 lg:items-start">
								<p className="text-[0.65rem] font-medium text-gray-500">PROJETO</p>
								<div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
									<div className="flex items-center gap-1">
										<FaUserAlt />
										<p className="text-[0.6rem] font-medium leading-none tracking-tight">{infoHolder.projetoDados.nome}</p>
									</div>
									<div className="flex items-center gap-1">
										<FaLocationDot />
										<p className="text-[0.6rem] font-medium leading-none tracking-tight">
											{formatLocation({ location: infoHolder.projetoDados.localizacao, includeCity: true, includeUf: true })}
										</p>
									</div>
									<div className="flex items-center gap-1">
										<MdDashboard />
										<p className="text-[0.6rem] font-medium leading-none tracking-tight">{infoHolder.projetoDados.tipo.titulo}</p>
									</div>
								</div>
							</div>
						</div>
						<h1 className="w-full bg-gray-500 p-1 text-center text-xs font-medium text-white">OBSERVAÇÕES</h1>
						{infoHolder.projetoDados.observacoes.length > 0 ? (
							infoHolder.projetoDados.observacoes.map((obs, index) => (
								<div key={index} className="flex w-full flex-col rounded-md border border-gray-500">
									<div className="flex min-h-[25px] w-full flex-col items-start justify-between gap-1 lg:flex-row">
										<div className="flex w-full items-center justify-center rounded-br-md rounded-tl-md bg-cyan-700 lg:w-[40%]">
											<p className="w-full text-center text-xs font-medium text-white">{obs.assunto}</p>
										</div>
										<div className="flex grow items-center justify-end gap-2 p-2">
											<div className="flex items-center gap-2">
												<div className={`flex items-center gap-1`}>
													<BsCalendarPlus />
													<p className="text-[0.6rem] font-medium">{formatDateAsLocale(obs.data)}</p>
												</div>
												<div className="flex items-center gap-1">
													<Avatar fallback={formatNameAsInitials(obs.autor.nome)} url={obs.autor.avatar_url || undefined} height={20} width={20} />
													<p className="text-[0.6rem] font-medium">{obs.autor.nome}</p>
												</div>
											</div>
										</div>
									</div>
									<h1 className="w-full p-2 text-center text-xs font-medium tracking-tight text-gray-500">{obs.descricao}</h1>
								</div>
							))
						) : (
							<p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhuma observação adicionada ao projeto.</p>
						)}
						{expenseId ? (
							<>
								<div className="flex w-full items-center justify-center py-2">
									<div className="w-fit">
										<CheckboxInput labelFalse="MOSTRAR ARQUIVOS" labelTrue="MOSTRAR ARQUIVOS" checked={showFiles} handleChange={(value) => setShowFiles(value)} />
									</div>
								</div>
								{showFiles ? (
									<FilesBlock
										expenseId={expenseId}
										projectId={infoHolder.projetoDados?._id}
										clientId={infoHolder.projetoDados?.cliente.id}
										opportunityId={infoHolder.projetoDados?.oportunidade.id}
										analysisId={infoHolder.projetoDados?.idAnaliseTecnica || undefined}
										session={session}
									/>
								) : null}
							</>
						) : null}
					</>
				) : null}

				<div className="flex w-full items-center justify-center py-2">
					<div className="w-fit">
						<CheckboxInput
							labelFalse="ABRIR MENU DE VINCULAÇÃO"
							labelTrue="ABRIR MENU DE VINCULAÇÃO"
							checked={vinculationMenuIsOpen}
							handleChange={(value) => setVinculationMenuIsOpen(value)}
						/>
					</div>
				</div>
				<AnimatePresence>
					{vinculationMenuIsOpen ? (
						<ExpenseProjectVinculationMenu vinculatedId={infoHolder.projeto.id} infoHolder={infoHolder} setInfoHolder={setInfoHolder} closeMenu={() => setVinculationMenuIsOpen(false)} />
					) : null}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default ProjectInformationBlock;
