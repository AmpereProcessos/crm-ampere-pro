import { formatToMoney } from "@/utils/methods/formatting";
import {
	FORMULA_OPERATORS,
	formulaArrToExpression,
	isFunctionToken,
	isVariableToken,
	populateFormula,
	safeEvaluate,
	stringify,
	tokenize,
} from "@/utils/pricing/formula";
import { cumulativeVariablesValues, variablesAlias } from "@/utils/pricing/helpers";
import { getCalculatedFinalValue, type TPricingVariableSource } from "@/utils/pricing/methods";
import { useMemo } from "react";

const VARIABLE_LABELS = Object.fromEntries(variablesAlias.map((v) => [v.value, v.label])) as Record<string, string>;
const OPERATOR_GLYPHS = Object.fromEntries(FORMULA_OPERATORS.map((o) => [o.insert, o.glyph])) as Record<string, string>;
const COUNT_VARIABLES = new Set([
	"numModulos",
	"numInversores",
	"potenciaPico",
	"distancia",
	"consumoEnergiaMensal",
	"tarifaEnergia",
]);

function needsSpaceBetween(prev: string, cur: string): boolean {
	if (cur === "," || cur === ")") return false;
	if (prev === "(") return false;
	if (cur === "(") return ["+", "-", "*", "/"].includes(prev) || prev === ",";
	if (prev === ",") return true;
	if (["+", "-", "*", "/"].includes(prev) || ["+", "-", "*", "/"].includes(cur)) return true;
	return false;
}

const VARIABLE_SOURCE_LABELS: Record<TPricingVariableSource, string> = {
	premissa: "Premissa",
	composicao: "Composição",
	acumulativa: "Acumulativa",
};

function formatVariableValue(name: string, value: number) {
	if (COUNT_VARIABLES.has(name)) return value.toLocaleString("pt-BR");
	return formatToMoney(value);
}

function renderToken(token: string, mode: "symbolic" | "computed", variableValues: Record<string, number | undefined | null>) {
	if (isVariableToken(token)) {
		const name = token.slice(1, -1);
		const label = VARIABLE_LABELS[name] || name;
		const rawValue = variableValues[name];
		const numericValue = rawValue === undefined || rawValue === null || Number.isNaN(Number(rawValue)) ? 0 : Number(rawValue);
		if (mode === "symbolic") {
			return (
				<span
					className="inline-flex items-center rounded bg-[#15599a]/12 px-1.5 py-0.5 font-medium text-[#15599a]"
					title={`${label} = ${formatVariableValue(name, numericValue)}`}
				>
					{label}
				</span>
			);
		}
		return (
			<span
				className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold tabular-nums text-amber-900"
				title={label}
			>
				{formatVariableValue(name, numericValue)}
			</span>
		);
	}
	if (isFunctionToken(token)) {
		return <span className="font-medium text-blue-700">{token.replace("Math.", "")}</span>;
	}
	if (OPERATOR_GLYPHS[token]) {
		return <span className="text-primary/50">{OPERATOR_GLYPHS[token]}</span>;
	}
	return <span className="tabular-nums text-primary">{token}</span>;
}

function renderFormulaLine(
	tokens: string[],
	mode: "symbolic" | "computed",
	variableValues: Record<string, number | undefined | null>,
) {
	return tokens.map((token, index) => (
		<span key={`${mode}-${index}`}>
			{index > 0 && needsSpaceBetween(tokens[index - 1], token) ? " " : null}
			{renderToken(token, mode, variableValues)}
		</span>
	));
}

type PricingFormulaBreakdownProps = {
	formulaArr: string[];
	variableValues: Record<string, number | undefined | null>;
	variableSources?: Record<string, TPricingVariableSource>;
	computedCost?: number;
	margin?: number;
};

function PricingFormulaBreakdown({ formulaArr, variableValues, variableSources, computedCost, margin }: PricingFormulaBreakdownProps) {
	const tokens = useMemo(() => tokenize(formulaArr.join("")), [formulaArr]);
	const expression = useMemo(() => formulaArrToExpression(formulaArr), [formulaArr]);
	const populatedExpression = useMemo(() => {
		const populated = populateFormula(tokens, variableValues);
		try {
			return stringify(tokenize(populated));
		} catch {
			return populated;
		}
	}, [tokens, variableValues]);

	const usedVariables = useMemo(() => {
		const names = tokens.filter(isVariableToken).map((t) => t.slice(1, -1));
		return [...new Set(names)];
	}, [tokens]);

	const evaluatedCost = useMemo(() => safeEvaluate(tokens, variableValues), [tokens, variableValues]);
	const displayCost = computedCost ?? evaluatedCost;
	const usesCumulative = usedVariables.some((name) => cumulativeVariablesValues.includes(name));
	const marginFraction = margin !== undefined ? margin / 100 : null;
	const computedSale =
		displayCost != null && marginFraction !== null && marginFraction < 1
			? getCalculatedFinalValue({ value: displayCost, margin: marginFraction })
			: null;

	if (tokens.length === 0) return null;

	return (
		<div className="flex w-full flex-col gap-3 rounded-md border border-primary/20 bg-muted/30 p-3">
			<div className="flex flex-col gap-1">
				<span className="text-[0.65rem] font-semibold uppercase tracking-tight text-primary/50">Fórmula</span>
				<p className="font-mono text-xs leading-relaxed text-primary/80">{expression}</p>
			</div>

			<div className="flex flex-col gap-1.5">
				<span className="text-[0.65rem] font-semibold uppercase tracking-tight text-primary/50">Com variáveis</span>
				<div className="flex flex-wrap items-center font-mono text-xs leading-relaxed">
					{renderFormulaLine(tokens, "symbolic", variableValues)}
				</div>
			</div>

			{usedVariables.length > 0 ? (
				<div className="flex flex-col gap-1.5">
					<span className="text-[0.65rem] font-semibold uppercase tracking-tight text-primary/50">Valores aplicados</span>
					<div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
						{usedVariables.map((name) => {
							const rawValue = variableValues[name];
							const numericValue =
								rawValue === undefined || rawValue === null || Number.isNaN(Number(rawValue)) ? 0 : Number(rawValue);
							const source = variableSources?.[name];
							return (
								<div
									key={name}
									className="flex flex-col gap-0.5 rounded-md border border-primary/15 bg-background px-2 py-1.5"
								>
									<div className="flex items-center justify-between gap-2">
										<span className="text-[0.68rem] font-medium text-[#15599a]">{VARIABLE_LABELS[name] || name}</span>
										<span className="text-[0.68rem] font-semibold tabular-nums text-primary">
											{formatVariableValue(name, numericValue)}
										</span>
									</div>
									{source ? (
										<span className="text-[0.6rem] text-primary/45">{VARIABLE_SOURCE_LABELS[source]}</span>
									) : null}
								</div>
							);
						})}
					</div>
					{usesCumulative ? (
						<p className="text-[0.68rem] text-primary/50">
							Variáveis acumulativas refletem os totais atuais da precificação e podem convergir em recálculos.
						</p>
					) : null}
				</div>
			) : null}

			<div className="flex flex-col gap-1.5">
				<span className="text-[0.65rem] font-semibold uppercase tracking-tight text-primary/50">Expressão computada</span>
				<p className="font-mono text-xs leading-relaxed text-primary/80">{populatedExpression}</p>
				<div className="flex flex-wrap items-center font-mono text-xs leading-relaxed">
					{renderFormulaLine(tokens, "computed", variableValues)}
				</div>
			</div>

			{displayCost != null ? (
				<div className="flex flex-col gap-1 border-t border-primary/15 pt-2">
					<div className="flex items-center justify-between gap-2">
						<span className="text-[0.68rem] font-medium text-primary/60">Custo calculado</span>
						<span className="text-sm font-semibold tabular-nums text-primary">{formatToMoney(displayCost)}</span>
					</div>
					{computedSale != null ? (
						<div className="flex items-center justify-between gap-2">
							<span className="text-[0.68rem] font-medium text-primary/60">Venda sugerida ({margin?.toFixed(2)}% margem)</span>
							<span className="text-sm font-semibold tabular-nums text-primary">{formatToMoney(computedSale)}</span>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

export default PricingFormulaBreakdown;
