import { cn } from "@/lib/utils";
import {
  FORMULA_FUNCTIONS,
  FORMULA_OPERATORS,
  formulaArrToExpression,
  isFunctionToken,
  isVariableToken,
  safeEvaluate,
  stringify,
  tokenize,
  validateFormula,
} from "@/utils/pricing/formula";
import { cumulativeVariablesValues, variablesAlias } from "@/utils/pricing/helpers";
import { getCalculatedFinalValue } from "@/utils/pricing/methods";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdCheckCircle, MdErrorOutline, MdInfoOutline, MdSearch } from "react-icons/md";

const ALLOWED_VARIABLES = variablesAlias.map((v) => v.value as string);
const VARIABLE_LABELS = Object.fromEntries(
  variablesAlias.map((v) => [v.value as string, v.label]),
) as Record<string, string>;
const OPERATOR_GLYPHS = Object.fromEntries(
  FORMULA_OPERATORS.map((o) => [o.insert, o.glyph]),
) as Record<string, string>;
const FUNCTION_PT = Object.fromEntries(FORMULA_FUNCTIONS.map((f) => [f.token, f.pt])) as Record<
  string,
  string
>;

const VARIABLE_GROUPS: { key: string; label: string }[] = [
  { key: "general", label: "Gerais" },
  { key: "cumulative", label: "Acumulativas" },
  { key: "technical-analysis", label: "Estimadas em análise técnica" },
];

const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type HighlightSegment = { type: string; value: string };

function buildSegments(text: string): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      let ws = "";
      while (i < text.length && /\s/.test(text[i])) {
        ws += text[i];
        i++;
      }
      segments.push({ type: "ws", value: ws });
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < text.length && /[0-9.]/.test(text[i])) {
        num += text[i];
        i++;
      }
      segments.push({ type: "num", value: num });
      continue;
    }
    if (ch === "[") {
      let variable = "[";
      i++;
      while (i < text.length && text[i] !== "]") {
        variable += text[i];
        i++;
      }
      if (i < text.length) {
        variable += "]";
        i++;
      }
      const name = variable.replace("[", "").replace("]", "");
      segments.push({ type: ALLOWED_VARIABLES.includes(name) ? "var" : "bad", value: variable });
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let id = "";
      while (i < text.length && /[A-Za-z0-9.]/.test(text[i])) {
        id += text[i];
        i++;
      }
      segments.push({ type: isFunctionToken(id) ? "fn" : "bad", value: id });
      continue;
    }
    if ("+-*/".includes(ch)) {
      segments.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if ("(),".includes(ch)) {
      segments.push({ type: "punct", value: ch });
      i++;
      continue;
    }
    segments.push({ type: "bad", value: ch });
    i++;
  }
  return segments;
}

const SEGMENT_CLASS: Record<string, string> = {
  var: "font-semibold text-[#15599a]",
  fn: "font-semibold text-blue-700",
  op: "text-primary/60",
  punct: "text-primary/50",
  num: "text-primary",
  bad: "rounded-[3px] bg-red-100 text-red-600",
  ws: "",
};

type FormulaEditorProps = {
  value: string[];
  onChange: (formulaArr: string[]) => void;
  margin: number;
  onValidityChange?: (valid: boolean) => void;
  /** Quando false, mostra só a expressão + validação; paleta e preview ficam ocultos até o foco. */
  expanded?: boolean;
  /** Disparado quando o usuário foca o editor — usado para expandir só o resultado ativo. */
  onActivate?: () => void;
};

function FormulaEditor({
  value,
  onChange,
  margin,
  onValidityChange,
  expanded = true,
  onActivate,
}: FormulaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string>(() => formulaArrToExpression(value));
  const [variableSearch, setVariableSearch] = useState("");
  const [sampleValues, setSampleValues] = useState<Record<string, number>>({});

  const tokens = useMemo(() => tokenize(text), [text]);
  const isEmpty = tokens.length === 0;
  const validation = useMemo(() => validateFormula(tokens, ALLOWED_VARIABLES), [tokens]);
  const segments = useMemo(() => buildSegments(text), [text]);

  const usedVariables = useMemo(() => {
    const names = tokens.filter(isVariableToken).map((t) => t.replace("[", "").replace("]", ""));
    return [...new Set(names)].filter((name) => ALLOWED_VARIABLES.includes(name));
  }, [tokens]);
  const usesCumulative = usedVariables.some((name) => cumulativeVariablesValues.includes(name));

  const readable = useMemo(() => {
    if (isEmpty) return "";
    return stringify(tokens, (token) => {
      if (isVariableToken(token)) {
        const name = token.replace("[", "").replace("]", "");
        return VARIABLE_LABELS[name] || token;
      }
      if (isFunctionToken(token)) return FUNCTION_PT[token] || token;
      if (OPERATOR_GLYPHS[token]) return OPERATOR_GLYPHS[token];
      return token;
    });
  }, [tokens, isEmpty]);

  const previewCost = useMemo(() => {
    if (!validation.ok) return null;
    return safeEvaluate(tokens, sampleValues);
  }, [tokens, sampleValues, validation.ok]);
  const previewMarginFraction = margin / 100;
  const previewSale =
    previewCost != null && previewMarginFraction < 1
      ? getCalculatedFinalValue({ value: previewCost, margin: previewMarginFraction })
      : null;

  // Sincroniza o texto quando o valor externo diverge (reset após salvar, carga de fórmula existente)
  useEffect(() => {
    const fromText = tokenize(text).join("");
    const fromValue = value.join("");
    if (fromText !== fromValue) setText(formulaArrToExpression(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Garante valor de amostra para cada variável usada
  useEffect(() => {
    setSampleValues((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const name of usedVariables) {
        if (next[name] === undefined) {
          next[name] = 1;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [usedVariables]);

  useEffect(() => {
    onValidityChange?.(validation.ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.ok]);

  function applyText(next: string) {
    setText(next);
    onChange(tokenize(next));
  }

  function insertSnippet(snippet: string, caretBack = 0) {
    const textarea = textareaRef.current;
    const start = textarea ? textarea.selectionStart : text.length;
    const end = textarea ? textarea.selectionEnd : text.length;
    const next = text.slice(0, start) + snippet + text.slice(end);
    applyText(next);
    const caret = start + snippet.length - caretBack;
    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
      syncScroll();
    });
  }

  function syncScroll() {
    if (!textareaRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }

  const filteredVariables = (groupKey: string) =>
    variablesAlias
      .filter((v) => v.type === groupKey)
      .filter(
        (v) => !variableSearch || v.label.toLowerCase().includes(variableSearch.toLowerCase()),
      );

  const editorFontClass = "font-mono text-sm leading-6";
  const editorPadClass = "px-3 py-2.5";

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Barra de expressão */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-tight text-primary/80">
            EXPRESSÃO DA FÓRMULA
          </label>
          {isEmpty ? (
            <span className="text-[0.7rem] text-primary/40">
              comece digitando ou use a paleta abaixo
            </span>
          ) : validation.ok ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <MdCheckCircle size={13} /> VÁLIDA
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
              <MdErrorOutline size={13} /> INVÁLIDA
            </span>
          )}
        </div>
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-md border bg-background",
            isEmpty
              ? "border-primary/30"
              : validation.ok
                ? "border-emerald-500/60"
                : "border-red-400/70",
          )}
        >
          <div
            ref={highlightRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words",
              editorFontClass,
              editorPadClass,
            )}
          >
            {segments.map((seg, index) => (
              <span key={index} className={SEGMENT_CLASS[seg.type] ?? ""}>
                {seg.value}
              </span>
            ))}
            {"​"}
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            spellCheck={false}
            rows={2}
            placeholder="Ex.: Math.max(1, Math.ceil([numModulos] / 10)) * 68.75"
            onChange={(e) => applyText(e.target.value)}
            onFocus={() => onActivate?.()}
            onScroll={syncScroll}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            className={cn(
              "relative w-full resize-none bg-transparent text-transparent caret-[#15599a] outline-none placeholder:text-primary/30",
              editorFontClass,
              editorPadClass,
            )}
          />
        </div>
        {!isEmpty && validation.ok ? (
          <p className="text-[0.72rem] text-primary/50">Lê-se: {readable}</p>
        ) : null}
      </div>

      {/* Erros de validação */}
      {!isEmpty && !validation.ok ? (
        <ul className="flex flex-col gap-1 rounded-md border border-red-200 bg-red-50 p-2">
          {validation.errors.map((err, index) => (
            <li key={index} className="flex items-start gap-1.5 text-[0.72rem] text-red-700">
              <MdErrorOutline size={13} className="mt-0.5 shrink-0" />
              {err}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Paleta de inserção */}
      {expanded ? (
        <div className="flex flex-col gap-2.5 rounded-md border border-primary/20 p-2.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-tight text-primary/50">
            Inserir no cursor
          </span>

          {/* Variáveis */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-background px-2 py-1">
              <MdSearch size={14} className="text-primary/40" />
              <input
                value={variableSearch}
                onChange={(e) => setVariableSearch(e.target.value)}
                placeholder="Buscar variável..."
                className="w-full bg-transparent text-xs outline-none placeholder:italic placeholder:text-primary/30"
              />
            </div>
            {VARIABLE_GROUPS.map((group) => {
              const options = filteredVariables(group.key);
              if (options.length === 0) return null;
              return (
                <div key={group.key} className="flex flex-col gap-1">
                  <span className="text-[0.65rem] font-medium uppercase tracking-tight text-primary/40">
                    {group.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() => insertSnippet(`[${v.value}]`)}
                        className="rounded-md bg-[#15599a]/10 px-2 py-1 text-xs font-medium text-[#15599a] duration-150 hover:bg-[#15599a]/20"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Funções */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.65rem] font-medium uppercase tracking-tight text-primary/40">
              Funções
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FORMULA_FUNCTIONS.map((fn) => (
                <button
                  key={fn.token}
                  type="button"
                  title={fn.hint}
                  onClick={() => insertSnippet(`${fn.token}()`, 1)}
                  className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs duration-150 hover:bg-primary/10"
                >
                  <span className="font-medium text-primary/80">{fn.pt}</span>
                  <span className="font-mono text-[0.65rem] text-primary/40">
                    {fn.token.replace("Math.", "")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Operadores */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.65rem] font-medium uppercase tracking-tight text-primary/40">
              Operadores
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FORMULA_OPERATORS.map((op) => (
                <button
                  key={op.insert}
                  type="button"
                  title={op.label}
                  onClick={() => insertSnippet(op.insert)}
                  className="min-w-[34px] rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-center font-mono text-sm text-primary/70 duration-150 hover:bg-primary/10"
                >
                  {op.glyph}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Preview ao vivo */}
      {expanded ? (
        <div className="flex flex-col gap-2 rounded-md border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] font-semibold uppercase tracking-tight text-primary/50">
              Preview com valores de amostra
            </span>
            {usedVariables.length > 0 ? (
              <span className="text-[0.65rem] text-primary/40">edite para simular</span>
            ) : null}
          </div>

          {usedVariables.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {usedVariables.map((name) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span className="rounded bg-[#15599a]/10 px-1.5 py-0.5 text-[0.7rem] font-medium text-[#15599a]">
                    {VARIABLE_LABELS[name] || name}
                  </span>
                  <span className="text-xs text-primary/40">=</span>
                  <input
                    type="number"
                    value={Number.isFinite(sampleValues[name]) ? sampleValues[name] : 0}
                    onChange={(e) =>
                      setSampleValues((prev) => ({ ...prev, [name]: Number(e.target.value) }))
                    }
                    className="w-20 rounded-md border border-primary/20 bg-background px-2 py-1 text-xs outline-none focus:border-[#15599a]"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col rounded-md bg-background px-2.5 py-1.5">
              <span className="text-[0.65rem] text-primary/50">Custo calculado</span>
              <span className="text-sm font-semibold text-primary">
                {previewCost != null ? brl(previewCost) : "—"}
              </span>
            </div>
            <div className="flex flex-col rounded-md bg-background px-2.5 py-1.5">
              <span className="text-[0.65rem] text-primary/50">Margem</span>
              <span className="text-sm font-semibold text-primary">{margin}%</span>
            </div>
            <div className="flex flex-col rounded-md bg-background px-2.5 py-1.5">
              <span className="text-[0.65rem] text-primary/50">Preço de venda</span>
              <span className="text-sm font-semibold text-emerald-600">
                {previewSale != null ? brl(previewSale) : "—"}
              </span>
            </div>
          </div>

          {usesCumulative ? (
            <p className="flex items-start gap-1.5 text-[0.68rem] text-primary/45">
              <MdInfoOutline size={13} className="mt-0.5 shrink-0" />
              Esta fórmula usa variáveis acumulativas (totais). O preview é uma estimativa — o valor
              real depende do cálculo completo da metodologia.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default FormulaEditor;
