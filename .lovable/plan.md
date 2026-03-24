

## Plano: Dashboard de Métricas + Webhook de Checkout Zouti

### Parte 1: Webhook para Eventos do Checkout Zouti

Uma Edge Function que recebe eventos POST do checkout Zouti (carrinho, pix gerado, purchase, order bumps, etc.) e armazena tudo no banco.

**Nova tabela `checkout_events`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| event_type | text | `cart`, `pix_generated`, `purchase`, `abandoned`, `order_bump`, etc. |
| order_id | text | ID do pedido no Zouti |
| customer_email | text | Email do comprador |
| customer_name | text | Nome |
| customer_phone | text | Telefone |
| amount | numeric | Valor da transação |
| currency | text | BRL |
| payment_method | text | pix, credit_card, boleto |
| payment_status | text | approved, pending, refunded |
| products | jsonb | Produtos comprados (incluindo order bumps) |
| order_bumps | jsonb | Order bumps convertidos |
| utm_source | text | |
| utm_medium | text | |
| utm_campaign | text | |
| utm_content | text | |
| utm_term | text | |
| src | text | Parâmetro src concatenado |
| raw_payload | jsonb | Payload completo do Zouti para debug |
| created_at | timestamptz | |

RLS: service_role ALL, authenticated SELECT.

**Nova Edge Function `checkout-webhook`:**
- Recebe POST do Zouti com um token secreto de verificação (header ou query param)
- Valida o token contra um secret `WEBHOOK_SECRET` (para segurança)
- Extrai: event_type, order_id, customer info, amount, payment_method, products, order bumps, UTMs
- Salva na tabela `checkout_events`
- Opcionalmente dispara evento Meta CAPI de Purchase (com valor real)
- Retorna 200 OK

Você receberá a URL do webhook para colar no painel Zouti, no formato:
`https://foxsxbhlsbxsceydldkb.supabase.co/functions/v1/checkout-webhook?token=SEU_TOKEN`

### Parte 2: Tabela de Analytics Comportamental

**Nova tabela `page_analytics`** para coletar scroll, cliques, saída e dados para mapa de calor.

**Novo hook `usePageAnalytics`** que coleta invisívelmente:
- Profundidade de scroll (25/50/75/100%)
- Cliques (posição x/y normalizada + seção)
- Seção de saída e tempo na página
- Batch insert a cada 5s ou no `beforeunload`

### Parte 3: Dashboard com Login Google Restrito

**Autenticação:**
- Google OAuth configurado via Lovable Cloud
- Tabela `authorized_dashboard_users` com os 2 emails autorizados
- Função `is_dashboard_user()` SECURITY DEFINER
- RLS nas tabelas de métricas: SELECT apenas para emails autorizados

**Rota `/dashboard`** com abas:

1. **Visão Geral** — Visitantes únicos, PageViews, funil de conversão (PageView → ViewContent → InitiateCheckout → Purchase)
2. **Tráfego Pago** — UTM breakdown, eventos/dia, taxa de conversão por fonte
3. **Checkout/Vendas** — Dados do webhook: carrinho, pix gerado, compras, order bumps, valor total, ticket médio
4. **Comportamento** — Scroll depth, taxa de saída por seção, cliques por seção, tempo médio
5. **Mapa de Calor** — Visualização de cliques via Canvas
6. **SEO & Localização** — Referrers, estados/cidades, mobile vs desktop

### Estrutura de arquivos

```text
supabase/functions/checkout-webhook/index.ts
src/pages/Dashboard.tsx
src/hooks/usePageAnalytics.ts
src/hooks/useDashboardAuth.ts
src/components/dashboard/
  ├── DashboardLogin.tsx
  ├── OverviewTab.tsx
  ├── TrafficTab.tsx
  ├── CheckoutTab.tsx
  ├── BehaviorTab.tsx
  ├── HeatmapTab.tsx
  └── SeoTab.tsx
```

### Sequência de implementação

1. Criar tabelas (`checkout_events`, `page_analytics`, `authorized_dashboard_users`) + RLS
2. Criar Edge Function `checkout-webhook` + secret `WEBHOOK_SECRET`
3. Configurar Google OAuth + inserir emails autorizados
4. Criar hook `usePageAnalytics` e integrar no `Index.tsx`
5. Construir página Dashboard com todas as abas
6. Adicionar rota `/dashboard` no `App.tsx`

