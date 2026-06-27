---
name: CRM Ampère
description: Interface operacional confiável para gestão comercial e operacional da Ampère.
colors:
  ampere-blue: "#15599a"
  ink: "#0a0a0a"
  paper: "#ffffff"
  surface-muted: "#f5f5f5"
  ink-muted: "#737373"
  border-neutral: "#e5e5e5"
  primary-action: "#171717"
  primary-action-text: "#fafafa"
  destructive: "#dc2626"
typography:
  display:
    fontFamily: "Raleway, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Raleway, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Raleway, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Raleway, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-action}"
    textColor: "{colors.primary-action-text}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#262626"
    textColor: "{colors.primary-action-text}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-default:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card-default:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: CRM Ampère

## 1. Overview

**Creative North Star: "A Mesa de Operações"**

O CRM Ampère é uma ferramenta de trabalho diário — não um painel promocional. A interface prioriza leitura rápida de dados, ações diretas e densidade informacional controlada. O visual deve transmitir domínio dos dados: neutros estáveis, acento Ampère reservado para hierarquia e destaque, componentes shadcn/Radix com comportamento previsível.

O sistema rejeita explicitamente dashboards promocionais, métricas gigantes sem contexto, excesso de cartões, gradientes decorativos e animações sem função — conforme PRODUCT.md.

**Key Characteristics:**

- Neutros frios (hue ~224) como base; acento `#15599a` (Ampère Blue) para marca e destaques operacionais.
- Uma família tipográfica (Raleway) em escala fixa rem; labels de métricas frequentemente em uppercase com tracking-tight.
- Elevação sutil via sombras leves e bordas `primary/30`; sem glassmorphism.
- Componentes shadcn/ui + Radix: botões, inputs, cards, sidebar colapsável, tabelas densas.
- Dark mode suportado via `next-themes`; sidebar em dark usa acento azul mais visível.
- Motion restrita a feedback de estado (hover, focus, transições ~150–250ms).

## 2. Colors: The Ampère Palette

Paleta **Restrained**: neutros dominam a superfície; Ampère Blue aparece em blocos de destaque, gráficos, CTAs contextuais e relatórios — nunca como decoração de fundo em massa.

### Primary

- **Ampère Blue** (`#15599a`): Marca Ampère. Usado em cabeçalhos de times (SDR, Vendas), áreas de gráficos, ações primárias contextuais (kanban, propostas), laudos e templates de documento. É o acento reconhecível da operação.
- **Action Ink** (`#171717` / `primary`): Botões default shadcn, texto de ação em light mode. Neutro escuro, não azul — separa ações de UI da marca.

### Secondary

- **Cool Surface** (`#f5f5f5` / `secondary`, `muted`, `accent`): Fundos de hover, áreas secundárias, chips e estados de repouso em sidebar.

### Tertiary

- **Chart Spectrum** (azuis `#78b4e8` → `#2d5a9e`): Paleta de gráficos Recharts (`chart-1` a `chart-5`). Reservada a visualizações; não usar em botões ou navegação.

### Neutral

- **Paper** (`#ffffff` / `background`): Superfície principal de conteúdo.
- **Ink** (`#0a0a0a` / `foreground`): Texto principal, dados tabulares.
- **Ink Muted** (`#737373` / `muted-foreground`): Labels secundários, placeholders, descrições.
- **Border Neutral** (`#e5e5e5` / `border`, `input`): Bordas de cards, inputs e divisores.
- **Destructive** (`#dc2626`): Erros, ações destrutivas confirmadas.

**The Brand Accent Rule.** Ampère Blue (`#15599a`) marca seções e dados de negócio; o botão default do sistema permanece neutro escuro. Não substituir `bg-primary` global por azul sem revisão de contraste e hierarquia.

## 3. Typography

**Display Font:** Raleway (via `next/font/google`, variável `--font-raleway`)
**Body Font:** Raleway (mesma família — produto UI, uma família)
**Label Font:** Raleway, frequentemente `uppercase` + `tracking-tight`

**Character:** Geométrica-humanista, legível em densidade alta. Sem pairing display/body — consistência operacional sobre expressividade.

### Hierarchy

- **Display** (600, `text-2xl` / 1.5rem, leading-tight): Títulos de card (`CardTitle`), cabeçalhos de seção em dashboards.
- **Headline** (600–700, `text-xl`, leading-tight): Títulos de time/bloco (`TIME DE VENDAS`), seções em modais.
- **Title** (500–600, `text-sm`–`text-base`): Subtítulos, labels de grupo em formulários.
- **Body** (400, `text-sm` / 0.875rem, leading-normal): Texto de tabela, descrições, conteúdo de formulário. Prosa longa: máx. 65–75ch.
- **Label** (500, `text-xs`–`text-xxs`, uppercase, tracking-tight): Métricas em `StatListItem`, cabeçalhos de colunas estatísticas, rótulos de KPI. Uso concentrado em stats — não em todo heading da app.

**The Metric Label Rule.** Uppercase + tracking-tight é vocabulário de métricas e totais tabulares. Títulos de página e navegação usam case normal.

## 4. Elevation

Sistema **layered-flat**: profundidade por tonalidade de superfície e bordas, com sombras leves apenas em cards, sheets e popovers.

### Shadow Vocabulary

- **Rest** (`shadow-md`): `0 1px 3px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1)` — cards padrão.
- **Popover** (`shadow-lg`): Dropdowns, tooltips com container.
- **Ambient** (`shadow-sm`): Elementos elevados leves, botões outline em sidebar.

**The Flat-By-Default Rule.** Superfícies de conteúdo são planas. Sombra indica container (card, modal, sheet) ou hover em ação — nunca decoração de hero.

## 5. Components

### Buttons

- **Shape:** Cantos suaves (`rounded-md`, 10px via `--radius: 0.625rem`).
- **Primary (default):** `bg-primary` neutro escuro, texto `primary-foreground`, hover `primary/90`. Padding `h-10 px-4`.
- **Outline:** Borda `border-input`, fundo `background`, hover `accent`.
- **Ghost / Link:** Sem fundo; link usa `text-primary` com underline no hover.
- **Destructive:** `bg-destructive`, hover `destructive/90`.
- **Focus:** `ring-2 ring-ring ring-offset-2` — sempre visível para WCAG.

### Cards / Containers

- **Corner Style:** `rounded-lg` (10px).
- **Background:** `bg-background` light / `dark:bg-gray-950` dark.
- **Border:** `border-primary/30` (light), `dark:border-primary/80` — borda sutil com tinte da primária.
- **Shadow:** `shadow-md` no card base.
- **Internal Padding:** `p-6` header/content padrão shadcn.

### Inputs / Fields

- **Style:** `h-10`, borda `border-primary/30`, fundo `background`, `text-sm`.
- **Placeholder:** `text-primary/70` — contraste verificado contra fundo.
- **Focus:** `ring-2` — em light `ring-gray-950`; em dark `ring-primary/30`.
- **Disabled:** `opacity-50`, cursor not-allowed.

### Navigation (Sidebar)

- **Width:** 16rem expandido, 3rem colapsado (ícones), 18rem em mobile sheet.
- **Item default:** `rounded-md p-2 text-sm`, hover `sidebar-accent`.
- **Active:** `bg-sidebar-accent font-medium`.
- **Mobile:** Sheet overlay; atalho `b` para toggle.
- **Dark accent:** `sidebar-primary` azul saturado para item ativo em dark mode.

### Stat Block (signature)

- **Pattern:** Label uppercase `text-xxs`/`text-xs` `text-primary/70` + valor `font-medium uppercase tracking-tight`.
- **Section headers:** Barra `bg-[#15599a]` com texto branco, `font-black`/`font-bold`, `rounded-md`.
- **Uso:** Dashboards comerciais, análises técnicas, rankings — não reutilizar em formulários genéricos.

## 6. Do's and Don'ts

### Do:

- **Do** manter dados tabulares visíveis e verificáveis; gráficos complementam, não substituem tabelas.
- **Do** usar Ampère Blue (`#15599a`) para marca e blocos de negócio reconhecíveis.
- **Do** respeitar estados completos: hover, focus-visible, disabled, loading (skeleton > spinner central).
- **Do** usar densidade alta em tabelas e listas quando o usuário está em fluxo operacional.
- **Do** oferecer alternativa tabular para informações em gráficos e mapas.

### Don't:

- **Don't** usar dashboards promocionais com métricas gigantes sem contexto verificável.
- **Don't** empilhar cartões idênticos como única estrutura de página.
- **Don't** aplicar gradientes decorativos ou animações sem função operacional.
- **Don't** esconder dados tabulares necessários para conferência atrás de visualizações.
- **Don't** usar uppercase tracking-tight em todos os títulos — reservar para métricas e labels de stats.
- **Don't** usar `border-left` colorido >1px como acento em cards ou alertas.
- **Don't** aplicar glassmorphism ou gradient text como decoração padrão.
