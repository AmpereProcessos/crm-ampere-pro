import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import SelectInput from "../Inputs/SelectInput";
import { TEquipment } from "@/utils/schemas/utils";
import TextInput from "../Inputs/TextInput";
import NumberInput from "../Inputs/NumberInput";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { createUtil } from "@/utils/mutations/utils";

type NewEquipmentMenuProps = {
	session: TUserSession;
	affectQueryKey: (string | null)[];
};
function NewEquipmentMenu({ session, affectQueryKey }: NewEquipmentMenuProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TEquipment>({
		identificador: "EQUIPMENT",
		categoria: "MÓDULO",
		fabricante: "",
		modelo: "",
		potencia: null,
		garantia: 0,
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	const { mutate: handleCreateEquipment, isPending } = useMutationWithFeedback({
		mutationKey: ["create-equipment"],
		mutationFn: createUtil,
		queryClient: queryClient,
		affectedQueryKey: affectQueryKey,
		callbackFn: () =>
			setInfoHolder({
				identificador: "EQUIPMENT",
				categoria: "MÓDULO",
				fabricante: "",
				modelo: "",
				potencia: null,
				garantia: 0,
				autor: {
					id: session.user.id,
					nome: session.user.nome,
					avatar_url: session.user.avatar_url,
				},
				dataInsercao: new Date().toISOString(),
			}),
	});
	return (
		<div className="flex w-full flex-col gap-2">
			<h1 className="w-full rounded-bl rounded-br bg-[#fead41] p-1 text-center text-xs font-bold text-white">CADASTRO DE EQUIPAMENTOS</h1>
			<div className="flex w-full flex-col items-center justify-center gap-2 px-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<SelectInput
						label="CATEGORIA DO EQUIPAMENTO"
						value={infoHolder.categoria}
						options={[
							{ id: 1, label: "INVERSOR", value: "INVERSOR" },
							{ id: 2, label: "MÓDULO", value: "MÓDULO" },
						]}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, categoria: value }))}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => setInfoHolder((prev) => ({ ...prev, categoria: "MÓDULO" }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center  gap-2 px-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<TextInput
						label="FABRICANTE"
						placeholder="Preencha aqui o fabricante do equipamento..."
						value={infoHolder.fabricante}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, fabricante: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<TextInput
						label="MODELO"
						placeholder="Preencha aqui o modelo do equipamento..."
						value={infoHolder.modelo}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, modelo: value }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full flex-col items-center  gap-2 px-2 lg:flex-row">
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="POTÊNCIA"
						placeholder="Preencha aqui o potência do equipamento..."
						value={infoHolder.potencia || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, potencia: value }))}
						width="100%"
					/>
				</div>
				<div className="w-full lg:w-1/2">
					<NumberInput
						label="GARANTIA"
						placeholder="Preencha aqui o garantia do equipamento..."
						value={infoHolder.garantia || null}
						handleChange={(value) => setInfoHolder((prev) => ({ ...prev, garantia: value }))}
						width="100%"
					/>
				</div>
			</div>
			<div className="flex w-full items-center justify-end p-2">
				<button
					disabled={isPending}
					onClick={() => {
						const equipment = {
							identificador: "EQUIPMENT",
							categoria: infoHolder.categoria,
							fabricante: infoHolder.fabricante,
							modelo: infoHolder.modelo,
							potencia: infoHolder.potencia,
							garantia: infoHolder.garantia,
							autor: {
								id: session.user.id,
								nome: session.user.nome,
								avatar_url: session.user.avatar_url,
							},
							dataInsercao: new Date().toISOString(),
						};
						// @ts-ignore
						handleCreateEquipment({ info: equipment });
					}}
					className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700"
				>
					CADASTRAR
				</button>
			</div>
		</div>
	);
}

export default NewEquipmentMenu;
