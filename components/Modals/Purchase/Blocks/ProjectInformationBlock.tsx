import CheckboxInput from "@/components/Inputs/CheckboxInput";
import ProductCard from "@/components/ProjectRequest/RequestStages/Utils/ProductCard";
import type { TUserSession } from "@/lib/auth/session";
import { TProjectDTO } from "@/utils/schemas/project.schema";
import { useState } from "react";
import { BsBank, BsCode, BsPersonVcard } from "react-icons/bs";
import { FaPhone, FaUserAlt } from "react-icons/fa";
import FilesBlock from "./FilesBlock";

type ProjectInformationBlockProps = {
	purchaseId: string;
	project: TProjectDTO;
	session: TUserSession;
};
function ProjectInformationBlock({ purchaseId, project, session }: ProjectInformationBlockProps) {
	const [showFiles, setShowFiles] = useState<boolean>(false);
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-primary/70 p-1 text-center font-medium text-primary-foreground">INFORMAÇÕES DO PROJETO</h1>
			<div className="flex w-full flex-col gap-1 pb-2">
				<div className="flex items-center gap-1 self-center">
					<BsCode />
					<p className="font-raleway text-sm font-medium duration-300 ease-in-out hover:text-cyan-500">{project.nome}</p>
				</div>
				<h1 className="w-full bg-primary/50 p-1 text-center text-xs font-medium text-primary-foreground">EQUIPAMENTOS</h1>
				<div className="flex w-full flex-wrap items-center justify-start gap-2">
					{project.produtos.map((product, index) => (
						<div className="w-full lg:w-[400px]">
							<ProductCard key={index} product={product} />
						</div>
					))}
				</div>
				<h1 className="w-full bg-primary/50 p-1 text-center text-xs font-medium text-primary-foreground">PAGAMENTO</h1>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex flex-col items-center gap-1 lg:items-start">
						<p className="text-[0.65rem] font-medium text-primary/70">PAGADOR</p>
						<div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
							<div className="flex items-center gap-1">
								<FaUserAlt />
								<p className="text-[0.6rem] font-medium leading-none tracking-tight">{project.pagamento.pagador.nome}</p>
							</div>
							<div className="flex items-center gap-1">
								<FaPhone />
								<p className="text-[0.6rem] font-medium leading-none tracking-tight">{project.pagamento.pagador.telefone}</p>
							</div>
							<div className="flex items-center gap-1">
								<BsPersonVcard />
								<p className="text-[0.6rem] font-medium leading-none tracking-tight">{project.pagamento.pagador.cpfCnpj}</p>
							</div>
						</div>
					</div>
					<div className="flex flex-col items-center gap-1 lg:items-end">
						<p className="text-[0.65rem] font-medium text-primary/70">CREDOR</p>
						<div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
							<div className="flex items-center gap-1">
								<BsBank />
								<p className="text-[0.6rem] font-medium leading-none tracking-tight">{project.pagamento.credito.credor || "NÃO DEFINIDO"}</p>
							</div>
							{project.pagamento.credito.credor ? (
								<>
									<div className="flex items-center gap-1">
										<FaUserAlt />
										<p className="text-[0.6rem] font-medium leading-none tracking-tight">{project.pagamento.credito.nomeResponsavel}</p>
									</div>
									<div className="flex items-center gap-1">
										<FaPhone />
										<p className="text-[0.6rem] font-medium leading-none tracking-tight">{project.pagamento.credito.telefoneResponsavel}</p>
									</div>
								</>
							) : null}
						</div>
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-center py-2">
				<div className="w-fit">
					<CheckboxInput labelFalse="MOSTRAR ARQUIVOS" labelTrue="MOSTRAR ARQUIVOS" checked={showFiles} handleChange={(value) => setShowFiles(value)} />
				</div>
			</div>
			{showFiles ? (
				<FilesBlock
					purchaseId={purchaseId}
					projectId={project._id}
					clientId={project.cliente.id}
					opportunityId={project.oportunidade.id}
					analysisId={project.idAnaliseTecnica || undefined}
					session={session}
				/>
			) : null}
		</div>
	);
}

export default ProjectInformationBlock;
