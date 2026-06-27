import { renderConditionPhrase } from "@/utils/pricing/helpers";
import type { TPricingMethodActions } from "@/utils/pricing/usePricingMethodEditor";
import { usePartnersSimplified } from "@/utils/queries/partners";
import { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";
import { TPricingMethod, TPricingMethodItemResultItem } from "@/utils/schemas/pricing-method.schema";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import CheckboxInput from "../Inputs/CheckboxInput";
import ConditionMenu from "./ConditionMenu";
import FormulaEditor from "./FormulaEditor";

type TResult = TPricingMethodItemResultItem;

function prefersReducedMotion() {
	return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

type ControlPricingUnitProps = {
	methodology: TPricingMethod;
	actions: TPricingMethodActions;
};

function ControlPricingUnit({ methodology, actions }: ControlPricingUnitProps) {
	const { data: partners } = usePartnersSimplified();
	const [activeKey, setActiveKey] = useState<string | null>(null);
	// Índice da unidade recém-criada — sinaliza qual linha deve receber foco/scroll/destaque.
	const [focusUnitIndex, setFocusUnitIndex] = useState<number | null>(null);

	const handleActivate = useCallback((key: string) => setActiveKey(key), []);
	const handleFocusConsumed = useCallback(() => setFocusUnitIndex(null), []);
	const handleAddUnit = useCallback(() => {
		setFocusUnitIndex(methodology.itens.length); // nova unidade entra no fim → este é o índice dela
		actions.addUnit();
	}, [methodology.itens.length, actions]);

	return (
		<div className="flex w-full flex-col gap-3 font-Inter">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="rounded-md bg-[#15599a] px-3 py-1 text-center text-sm font-bold text-primary-foreground sm:text-start">UNIDADES DE PREÇO</h1>
				<button
					type="button"
					onClick={handleAddUnit}
					className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground duration-150 hover:bg-primary/80"
				>
					<MdAdd size={16} /> NOVA UNIDADE DE PREÇO
				</button>
			</div>

			{methodology.itens.length > 0 ? (
				<div className="flex flex-col gap-3">
					{methodology.itens.map((unit, unitIndex) => (
						<UnitRow
							key={unitIndex}
							unitIndex={unitIndex}
							unit={unit}
							actions={actions}
							partners={partners}
							activeKey={activeKey}
							onActivate={handleActivate}
							shouldFocus={focusUnitIndex === unitIndex}
							onFocusConsumed={handleFocusConsumed}
						/>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-primary/30 p-6 text-center">
					<p className="text-sm font-medium text-primary/70">Nenhuma unidade de preço ainda</p>
					<p className="max-w-md text-xs text-primary/50">
						Cada unidade de preço é uma linha de custo (mão de obra, deslocamento, alimentação...). Adicione a primeira para começar a montar a metodologia.
					</p>
					<button
						type="button"
						onClick={handleAddUnit}
						className="mt-1 flex items-center gap-1 rounded-md bg-[#15599a] px-3 py-1.5 text-xs font-medium text-primary-foreground duration-150 hover:bg-[#15599a]/85"
					>
						<MdAdd size={16} /> Adicionar unidade
					</button>
				</div>
			)}
		</div>
	);
}

type UnitRowProps = {
	unitIndex: number;
	unit: TPricingMethod["itens"][number];
	actions: TPricingMethodActions;
	partners: TPartnerSimplifiedDTO[] | undefined;
	activeKey: string | null;
	onActivate: (key: string) => void;
	shouldFocus: boolean;
	onFocusConsumed: () => void;
};

const UnitRow = React.memo(function UnitRow({ unitIndex, unit, actions, partners, activeKey, onActivate, shouldFocus, onFocusConsumed }: UnitRowProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const [highlight, setHighlight] = useState(false);

	// Feedback ao criar a unidade: roda uma vez, na montagem da linha nova.
	useEffect(() => {
		if (!shouldFocus) return;
		nameRef.current?.focus({ preventScroll: true });
		containerRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
		setHighlight(true);
		const timer = window.setTimeout(() => setHighlight(false), 1200);
		onFocusConsumed();
		return () => window.clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAddResult = () => {
		onActivate(`${unitIndex}:${unit.resultados.length}`); // já deixa o novo resultado expandido/ativo
		actions.addResult(unitIndex);
	};

	return (
		<div
			ref={containerRef}
			className={`flex flex-col gap-3 rounded-md border p-3 shadow-sm transition-shadow duration-700 ${
				highlight ? "border-[#15599a]/50 ring-2 ring-[#15599a]/50" : "border-primary/30"
			}`}
		>
			<div className="flex items-center gap-2">
				<input
					ref={nameRef}
					value={unit.nome}
					onChange={(e) => actions.setUnitName(unitIndex, e.target.value)}
					placeholder="Nome da unidade de preço (ex.: Deslocamento)"
					className="w-full rounded-md border border-primary/30 px-3 py-2 text-sm font-semibold outline-none placeholder:font-normal placeholder:italic placeholder:text-primary/30 focus:border-[#15599a]"
				/>
				<button
					type="button"
					title="Remover unidade"
					onClick={() => actions.removeUnit(unitIndex)}
					className="flex shrink-0 items-center justify-center rounded-md p-2 text-red-500 duration-150 hover:bg-red-100"
				>
					<MdDeleteOutline size={18} />
				</button>
			</div>

			<div className="flex flex-col gap-3 border-l border-primary/15 pl-3">
				{unit.resultados.map((result, resultIndex) => {
					const key = `${unitIndex}:${resultIndex}`;
					return (
						<ResultRow
							key={resultIndex}
							rowKey={key}
							unitIndex={unitIndex}
							resultIndex={resultIndex}
							result={result}
							actions={actions}
							partners={partners}
							isActive={activeKey === key}
							onActivate={onActivate}
						/>
					);
				})}
				<button
					type="button"
					onClick={handleAddResult}
					className="flex w-fit items-center gap-1 rounded-md border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary/70 duration-150 hover:bg-primary/5"
				>
					<MdAdd size={14} /> Adicionar fórmula condicional
				</button>
			</div>
		</div>
	);
});

type ResultRowProps = {
	rowKey: string;
	unitIndex: number;
	resultIndex: number;
	result: TResult;
	actions: TPricingMethodActions;
	partners: TPartnerSimplifiedDTO[] | undefined;
	isActive: boolean;
	onActivate: (key: string) => void;
};

const ResultRow = React.memo(function ResultRow({ rowKey, unitIndex, resultIndex, result, actions, partners, isActive, onActivate }: ResultRowProps) {
	// Adaptador para reusar o ConditionMenu (que espera um setState de resultado) sobre o reducer
	const setResultHolder: React.Dispatch<React.SetStateAction<TResult>> = (value) => {
		const next = typeof value === "function" ? (value as (prev: TResult) => TResult)(result) : value;
		actions.patchResult(unitIndex, resultIndex, next);
	};

	return (
		<div className={`flex flex-col gap-2.5 rounded-md p-2.5 duration-150 ${isActive ? "bg-[#15599a]/5 ring-1 ring-[#15599a]/30" : "bg-primary/[0.02]"}`}>
			<div className="flex items-center justify-between gap-2">
				{renderConditionPhrase({ condition: result.condicao, partners: partners || [] })}
				<button
					type="button"
					title="Remover fórmula"
					onClick={() => actions.removeResult(unitIndex, resultIndex)}
					className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-red-500 duration-150 hover:bg-red-100"
				>
					<MdDeleteOutline size={16} />
				</button>
			</div>

			<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
				<div className="w-fit">
					<CheckboxInput
						labelTrue="APLICAR CONDIÇÃO"
						labelFalse="APLICAR CONDIÇÃO"
						checked={result.condicao.aplicavel}
						handleChange={(value) => actions.patchCondition(unitIndex, resultIndex, { aplicavel: value })}
						justify="justify-start"
						padding="0"
					/>
				</div>
				<div className="w-fit">
					<CheckboxInput
						labelTrue="FATURÁVEL"
						labelFalse="FATURÁVEL"
						checked={result.faturavel}
						handleChange={(value) => actions.patchResult(unitIndex, resultIndex, { faturavel: value })}
						justify="justify-start"
						padding="0"
					/>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs font-medium text-primary/70">MARGEM (%)</span>
					<input
						type="number"
						step={0.01}
						value={Number.isFinite(result.margemLucro) ? result.margemLucro : 0}
						onChange={(e) => actions.patchResult(unitIndex, resultIndex, { margemLucro: Number(e.target.value) })}
						className="w-20 rounded-md border border-primary/20 bg-background px-2 py-1 text-xs outline-none focus:border-[#15599a]"
					/>
				</div>
			</div>

			{result.condicao.aplicavel ? <ConditionMenu resultHolder={result} setResultHolder={setResultHolder} partners={partners} /> : null}

			<FormulaEditor
				value={result.formulaArr}
				onChange={(formulaArr) => actions.patchResult(unitIndex, resultIndex, { formulaArr })}
				margin={result.margemLucro}
				expanded={isActive}
				onActivate={() => onActivate(rowKey)}
			/>
		</div>
	);
});

export default ControlPricingUnit;
