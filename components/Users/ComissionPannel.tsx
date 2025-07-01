import React, { useState } from "react";
import CheckboxInput from "../Inputs/CheckboxInput";
import type { TPricingMethodConditionType, TPricingMethodItemResultItem } from "@/utils/schemas/pricing-method.schema";
import ComissionScenariosMenu from "./Utils/ComissionScenariosMenu";

import type { TUser } from "@/utils/schemas/user.schema";
import toast from "react-hot-toast";

export type TComissionSpecs = {
	aplicavel: boolean;
	resultados: {
		condicao: TPricingMethodItemResultItem["condicao"];
		formulaArr: string[];
	}[];
};

type ComissionPannelProps = {
	infoHolder: TUser;
	updateUserInfo: (info: Partial<TUser>) => void;
};
function ComissionPannel({ infoHolder, updateUserInfo }: ComissionPannelProps) {
	function addComissionConfigItem(item: TUser["comissionamento"][number]) {
		const isProjectTypeAlreadyInConfig = infoHolder.comissionamento.some((config) => config.tipoProjeto.id === item.tipoProjeto.id);
		if (isProjectTypeAlreadyInConfig) {
			return toast.error("Este tipo de projeto já está configurado");
		}
		updateUserInfo({
			comissionamento: [...infoHolder.comissionamento, item],
		});
	}
	function updateComissionConfigItem(info: { index: number; item: Partial<TUser["comissionamento"][number]> }) {
		updateUserInfo({
			comissionamento: infoHolder.comissionamento.map((item, index) => (index === info.index ? { ...item, ...info.item } : item)),
		});
	}

	return (
		<div className="flex w-full flex-col gap-2 rounded border border-orange-500">
			<div className="flex w-full items-center justify-center gap-1 rounded bg-orange-500 p-2 text-white">
				<h1 className="text-sm font-medium text-white">PAINEL DE COMISSÃO</h1>
			</div>
			<div className="w-full flex flex-col p-3">
				<ComissionScenariosMenu
					userComissionConfig={infoHolder.comissionamento}
					addComissionConfigItem={addComissionConfigItem}
					updateComissionConfigItem={updateComissionConfigItem}
				/>
			</div>
		</div>
	);
}

export default ComissionPannel;
