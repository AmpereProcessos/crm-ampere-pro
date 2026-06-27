/**
 * Núcleo de fórmulas de precificação — compartilhado pela UI (FormulaEditor) e pela
 * regra de negócio (methods.ts).
 *
 * Contrato persistido: `formulaArr: string[]` (mantido por compatibilidade com dados
 * existentes e com proposal.schema). Aqui ele é tratado como uma lista de "átomos"
 * canônicos: números, variáveis `[nome]`, funções `Math.*`, operadores e pontuação.
 *
 * A avaliação continua usando `eval`, porém SEMPRE precedida por uma whitelist
 * (`isSafeExpression`) que garante que nada além de números, operadores e as funções
 * permitidas chegue ao interpretador.
 */

export const FORMULA_FUNCTION_NAMES = ["Math.ceil", "Math.floor", "Math.round", "Math.min", "Math.max", "Math.abs"] as const;
export type TFormulaFunctionName = (typeof FORMULA_FUNCTION_NAMES)[number];

export type TFormulaFunction = {
	token: TFormulaFunctionName;
	insert: string; // o que é inserido no editor (já com o parêntese de abertura)
	pt: string; // apelido curto em português, usado na leitura natural
	label: string; // rótulo de negócio para a paleta
	hint: string; // explicação de uma linha
};

export const FORMULA_FUNCTIONS: TFormulaFunction[] = [
	{ token: "Math.ceil", insert: "Math.ceil(", pt: "teto", label: "Arredondar p/ cima", hint: "Arredonda para o inteiro acima — Math.ceil(2,1) = 3" },
	{ token: "Math.floor", insert: "Math.floor(", pt: "piso", label: "Arredondar p/ baixo", hint: "Arredonda para o inteiro abaixo — Math.floor(2,9) = 2" },
	{ token: "Math.round", insert: "Math.round(", pt: "arred", label: "Arredondar", hint: "Arredonda para o inteiro mais próximo" },
	{ token: "Math.min", insert: "Math.min(", pt: "mín", label: "Mínimo", hint: "Menor valor entre os argumentos — Math.min(a, b)" },
	{ token: "Math.max", insert: "Math.max(", pt: "máx", label: "Máximo", hint: "Maior valor entre os argumentos — Math.max(a, b)" },
	{ token: "Math.abs", insert: "Math.abs(", pt: "abs", label: "Valor absoluto", hint: "Remove o sinal negativo — Math.abs(-5) = 5" },
];

export type TFormulaOperator = {
	insert: string; // caractere canônico (válido em JS)
	glyph: string; // símbolo amigável exibido na paleta / leitura natural
	label: string;
};

export const FORMULA_OPERATORS: TFormulaOperator[] = [
	{ insert: "+", glyph: "+", label: "Somar" },
	{ insert: "-", glyph: "−", label: "Subtrair" },
	{ insert: "*", glyph: "×", label: "Multiplicar" },
	{ insert: "/", glyph: "÷", label: "Dividir" },
	{ insert: "(", glyph: "(", label: "Abrir parêntese" },
	{ insert: ")", glyph: ")", label: "Fechar parêntese" },
	{ insert: ",", glyph: ",", label: "Separar argumentos" },
];

const BINARY_OPERATORS = ["+", "-", "*", "/"];
const PUNCTUATION = ["(", ")", ","];

// ---------------------------------------------------------------------------
// Classificação de átomos
// ---------------------------------------------------------------------------
export function isVariableToken(token: string): boolean {
	return token.startsWith("[") && token.endsWith("]");
}
export function isNumberToken(token: string): boolean {
	return /^\d*\.?\d+$|^\d+\.$/.test(token);
}
function isIdentifierToken(token: string): boolean {
	return /^[A-Za-z]/.test(token);
}
export function isFunctionToken(token: string): boolean {
	return (FORMULA_FUNCTION_NAMES as readonly string[]).includes(token);
}
function isOperatorToken(token: string): boolean {
	return BINARY_OPERATORS.includes(token);
}

// ---------------------------------------------------------------------------
// Tokenização — expressão em texto → átomos canônicos (formulaArr)
// ---------------------------------------------------------------------------
function normalizeExpression(expression: string): string {
	// Aceita os glifos amigáveis e o sinal de menos tipográfico vindos de cópias/colagens.
	return expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
}

export function tokenize(expression: string): string[] {
	const src = normalizeExpression(expression);
	const tokens: string[] = [];
	let i = 0;
	while (i < src.length) {
		const ch = src[i];
		if (/\s/.test(ch)) {
			i++;
			continue;
		}
		// número
		if (/[0-9.]/.test(ch)) {
			let num = "";
			while (i < src.length && /[0-9.]/.test(src[i])) {
				num += src[i];
				i++;
			}
			tokens.push(num);
			continue;
		}
		// variável [nome]
		if (ch === "[") {
			let variable = "[";
			i++;
			while (i < src.length && src[i] !== "]") {
				variable += src[i];
				i++;
			}
			if (i < src.length) {
				variable += "]";
				i++;
			}
			tokens.push(variable);
			continue;
		}
		// identificador (função): letras, dígitos e ponto (ex.: Math.ceil)
		if (/[A-Za-z]/.test(ch)) {
			let id = "";
			while (i < src.length && /[A-Za-z0-9.]/.test(src[i])) {
				id += src[i];
				i++;
			}
			tokens.push(id);
			continue;
		}
		// operadores, parênteses e vírgula
		if (BINARY_OPERATORS.includes(ch) || PUNCTUATION.includes(ch)) {
			tokens.push(ch);
			i++;
			continue;
		}
		// caractere desconhecido — preservado para a validação acusar
		tokens.push(ch);
		i++;
	}
	return tokens;
}

// ---------------------------------------------------------------------------
// Serialização — átomos → expressão legível
// ---------------------------------------------------------------------------
function needsSpaceBetween(prev: string, cur: string): boolean {
	if (cur === "," || cur === ")") return false;
	if (prev === "(") return false;
	if (cur === "(") return isOperatorToken(prev) || prev === ",";
	if (prev === ",") return true;
	if (isOperatorToken(prev) || isOperatorToken(cur)) return true;
	return false;
}

/**
 * Monta a expressão em texto a partir dos átomos. `transform` permite trocar a
 * aparência de cada token (ex.: rótulo amigável de variável, glifo de operador)
 * mantendo as mesmas regras de espaçamento — usado na leitura em linguagem natural.
 */
export function stringify(tokens: string[], transform?: (token: string) => string): string {
	let out = "";
	tokens.forEach((token, index) => {
		const rendered = transform ? transform(token) : token;
		if (index > 0 && needsSpaceBetween(tokens[index - 1], token)) out += " ";
		out += rendered;
	});
	return out;
}

export function formulaArrToExpression(formulaArr: string[]): string {
	const raw = formulaArr.join("");
	if (!raw.trim()) return "";
	try {
		return stringify(tokenize(raw));
	} catch {
		return raw;
	}
}

// ---------------------------------------------------------------------------
// Validação — whitelist + balanceamento + dry-run de sintaxe
// ---------------------------------------------------------------------------
export type TFormulaValidation = { ok: boolean; errors: string[] };

export function validateFormula(tokens: string[], allowedVariables: string[]): TFormulaValidation {
	// Normaliza para átomos canônicos antes de validar. Isso torna a validação tolerante a
	// `formulaArr` legado, cujos tokens podem vir "colados" (ex.: "Math.max(", "Math.ceil(").
	const normalized = tokenize(tokens.join(""));
	const errors: string[] = [];
	if (normalized.length === 0) return { ok: false, errors: ["A fórmula está vazia."] };

	let depth = 0;
	let unbalanced = false;
	for (const token of normalized) {
		if (token === "(") {
			depth++;
		} else if (token === ")") {
			depth--;
			if (depth < 0) {
				errors.push("Há um parêntese ) sem a abertura correspondente.");
				unbalanced = true;
				break;
			}
		} else if (isVariableToken(token)) {
			const name = token.slice(1, -1);
			if (!allowedVariables.includes(name)) errors.push(`A variável [${name}] não existe.`);
		} else if (isNumberToken(token)) {
			if (Number.isNaN(Number(token))) errors.push(`Número inválido: "${token}".`);
		} else if (isIdentifierToken(token)) {
			if (!isFunctionToken(token)) errors.push(`A função "${token}" não é permitida.`);
		} else if (isOperatorToken(token) || token === ",") {
			// permitido
		} else {
			errors.push(`Símbolo não reconhecido: "${token}".`);
		}
	}
	if (!unbalanced && depth > 0) errors.push(depth === 1 ? "Falta fechar 1 parêntese." : `Faltam fechar ${depth} parênteses.`);

	const unique = [...new Set(errors)];
	if (unique.length > 0) return { ok: false, errors: unique };

	// Sintaxe geral: roda a fórmula com 1 em toda variável; se quebrar, há erro estrutural.
	const sampleValues = Object.fromEntries(allowedVariables.map((v) => [v, 1]));
	const dryRun = safeEvaluate(normalized, sampleValues);
	if (dryRun === null || !Number.isFinite(dryRun)) {
		return { ok: false, errors: ["Expressão inválida — verifique operadores, vírgulas e parênteses."] };
	}
	return { ok: true, errors: [] };
}

// ---------------------------------------------------------------------------
// Avaliação — segura por whitelist, depois eval
// ---------------------------------------------------------------------------
export function populateFormula(tokens: string[], variableValues: Record<string, number | undefined | null>): string {
	return tokens
		.map((token) => {
			if (!isVariableToken(token)) return token;
			const name = token.slice(1, -1);
			const value = variableValues[name];
			if (value === undefined || value === null || Number.isNaN(Number(value))) return "0";
			return String(Number(value));
		})
		.join("");
}

function isSafeExpression(expression: string): boolean {
	// Remove as funções permitidas; o que sobra só pode ser número/operador/parêntese/vírgula.
	const stripped = expression.replace(/Math\.(ceil|floor|round|min|max|abs)/g, "");
	return /^[0-9.\s+\-*/(),]*$/.test(stripped);
}

/**
 * Popula as variáveis e avalia a fórmula. Lança se a expressão não passar pela
 * whitelist (proteção do eval). É a função que a regra de negócio deve usar.
 */
export function evaluateFormula(tokens: string[], variableValues: Record<string, number | undefined | null>): number {
	const populated = populateFormula(tokens, variableValues);
	if (!isSafeExpression(populated)) throw new Error("Expressão de fórmula não permitida.");
	// eslint-disable-next-line no-eval
	const result = eval(populated);
	const numeric = typeof result === "number" ? result : Number(result);
	if (Number.isNaN(numeric)) throw new Error("Fórmula resultou em valor não numérico.");
	return numeric;
}

/** Versão tolerante: retorna null em vez de lançar. Usada na validação e no preview. */
export function safeEvaluate(tokens: string[], variableValues: Record<string, number | undefined | null>): number | null {
	try {
		return evaluateFormula(tokens, variableValues);
	} catch {
		return null;
	}
}
