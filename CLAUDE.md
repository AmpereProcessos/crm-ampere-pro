# CRM Ampère

Next.js 16 CRM para operação comercial e operacional da Ampère (clientes, oportunidades, propostas, projetos).

## Design Context

Estratégia e visual documentados para agentes de design/UI:

- **PRODUCT.md** — register `product`, usuários (gestores e equipes comerciais), princípios estratégicos e anti-referências.
- **DESIGN.md** — tokens (cores, tipografia, componentes), North Star **"A Mesa de Operações"**, paleta Ampère Blue `#15599a`, shadcn/ui + Raleway.

**Princípios que guiam UI:**

1. Priorizar ação e diagnóstico, não ornamentação.
2. Expor contexto suficiente para métricas verificáveis (tabelas > gráficos isolados).
3. Ampère Blue para marca/blocos de negócio; botões default neutros escuros.
4. Respeitar permissões e escopos em toda visualização.
5. Rejeitar dashboards promocionais, excesso de cartões, gradientes e animação sem função.

Para trabalho visual: `/impeccable` (craft, polish, audit, live). Live mode configurado em `.impeccable/live/config.json`.
