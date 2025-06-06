import DateTimeInput from "@/components/Inputs/DateTimeInput";
import TextareaInput from "@/components/Inputs/TextareaInput";
import Avatar from "@/components/utils/Avatar";
import { formatDateAsLocale, formatDateInputChange, formatDateTime } from "@/lib/methods/formatting";
import { TServiceOrder, TServiceOrderExecutionLog } from "@/utils/schemas/service-order.schema";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsCalendar } from "react-icons/bs";
import { MdDelete } from "react-icons/md";

type ExecutionLogsBlockProps = {
	infoHolder: TServiceOrder;
	setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
	session: TUserSession;
};
function ExecutionLogsBlock({ infoHolder, setInfoHolder, session }: ExecutionLogsBlockProps) {
	const [executionLogHolder, setExecutionLogHolder] = useState<TServiceOrderExecutionLog>({
		inicio: new Date().toISOString(),
		fim: null,
		anotacoes: "",
		autor: { id: session.user.id, nome: session.user.nome, avatar_url: session.user.avatar_url },
	});

	function addExecutionLog(executionLog: TServiceOrderExecutionLog) {
		const logs = [...infoHolder.registros];
		logs.push(executionLog);
		setInfoHolder((prev) => ({ ...prev, registros: logs }));
		setExecutionLogHolder({
			inicio: new Date().toISOString(),
			fim: null,
			anotacoes: "",
			autor: { id: session.user.id, nome: session.user.nome, avatar_url: session.user.avatar_url },
		});
		return toast.success("Registro de execução adicionado !", { position: "bottom-center" });
	}
	function removeExecutionLog(index: number) {
		const logs = [...infoHolder.registros];
		logs.splice(index, 1);
		setInfoHolder((prev) => ({ ...prev, registros: logs }));
		setExecutionLogHolder({
			inicio: new Date().toISOString(),
			fim: null,
			anotacoes: "",
			autor: { id: session.user.id, nome: session.user.nome, avatar_url: session.user.avatar_url },
		});
		return toast.success("Registro de execução adicionado !", { position: "bottom-center" });
	}
	return (
		<div className="flex w-full flex-col gap-y-2">
			<h1 className="w-full bg-gray-500 p-1 text-center text-xs font-medium text-white">REGISTROS DE EXECUÇÃO</h1>

			<div className="flex w-full flex-col gap-1">
				{infoHolder.registros.length > 0 ? (
					<div className="flex w-full flex-col gap-1">
						<h1 className="w-full text-start text-sm font-medium tracking-tight text-gray-500">Aqui estão os registros de execução da ordem de serviço.</h1>

						{infoHolder.registros.map((registry, index) => (
							<div key={index} className="flex w-full flex-col gap-2 rounded-md bg-yellow-100 p-2">
								<div className="flex w-full items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											<Avatar fallback={"R"} url={registry.autor?.avatar_url || undefined} height={22} width={22} />
											<p className="text-xs font-medium text-gray-500">{registry.autor.nome}</p>
										</div>
										<div className="flex items-center gap-2">
											<BsCalendar style={{ fontSize: "20px" }} />
											<p className="text-xs font-medium text-gray-500">
												{formatDateAsLocale(registry.inicio, true)} até {formatDateAsLocale(registry.fim, true) || "NÃO DEFINIDO"}
											</p>
										</div>
									</div>
									<button
										onClick={() => removeExecutionLog(index)}
										type="button"
										className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
									>
										<MdDelete style={{ color: "red" }} />
									</button>
								</div>
								<div className="flex w-full items-center justify-center border border-gray-200 bg-[#F4F0BB] p-2">
									<p className="w-full text-center text-sm text-gray-500">{registry.anotacoes || "..."}</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhum observação de execução definida.</p>
				)}
				<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="w-1/2 lg:w-full">
						<DateTimeInput
							label="INÍCIO"
							labelClassName="text-sm tracking-tight font-medium"
							value={formatDateTime(executionLogHolder.inicio)}
							handleChange={(value) => setExecutionLogHolder((prev) => ({ ...prev, inicio: formatDateInputChange(value) || prev.inicio }))}
							width="100%"
						/>
					</div>
					<div className="w-1/2 lg:w-full">
						<DateTimeInput
							label="FIM"
							labelClassName="text-sm tracking-tight font-medium"
							value={formatDateTime(executionLogHolder.fim)}
							handleChange={(value) => setExecutionLogHolder((prev) => ({ ...prev, fim: formatDateInputChange(value) }))}
							width="100%"
						/>
					</div>
				</div>
				<TextareaInput
					label="ANOTAÇÕES"
					placeholder="Preencha aqui observações e anotações acerca do registro de execução..."
					value={executionLogHolder.anotacoes}
					handleChange={(value) => setExecutionLogHolder((prev) => ({ ...prev, anotacoes: value }))}
				/>
				<div className="flex items-center justify-end gap-4">
					<button className="rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700" onClick={() => addExecutionLog(executionLogHolder)}>
						ADICIONAR REGISTRO
					</button>
				</div>
			</div>
		</div>
	);
}

export default ExecutionLogsBlock;
