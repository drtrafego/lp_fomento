---
title: Tracking Perfeito Quickstart (Meta CAPI + Google Ads + GA4)
description: Kit prático em 7 passos para qualquer agente plugar tracking server side de qualidade em um projeto Next.js + HTMLs estáticas. Para detalhes, ver TRACKING_PERFEITO_META_GADS.md.
owner: DR.TRAFEGO
language: pt-BR
version: 1.0
date: 2026-05-25
---

# Tracking Perfeito Quickstart

> **Quando usar este documento:** você é um agente recebendo uma tarefa de adicionar tracking em projeto novo ou em página adicional. Siga estes 7 passos. Se algo travar, abra `TRACKING_PERFEITO_META_GADS.md` na mesma pasta para a versão completa com 12 blocos de código, anti padrões e roadmap.

> **Projeto de referência funcionando em produção:** `lp_charcutaria/` na mesma raiz `D:\Meu Drive\Bilder Ai\`. Copie blocos de lá quando bater dúvida.

---

## Passo 1. Pré requisitos no painel

Antes de escrever uma linha de código, garanta:

- **Meta Business Manager:** Pixel criado, anotar Pixel ID. Em Events Manager, gerar token CAPI com escopo `ads_management`.
- **Domain Verification + Aggregated Event Measurement (AEM):** configurados no Business Manager para o domínio do projeto.
- **Test Event Code:** gerar em Events Manager, aba Test Events. Você vai usar via querystring `?test_event_code=TESTxxxxx`.
- **Google Ads:** Conversion Action criada, Enhanced Conversions ligado. Anotar Customer ID, Conversion ID (`AW-XXXX`) e Conversion Label.
- **GA4:** Measurement ID (`G-XXXX`). Em Admin, Data Streams, gerar API Secret pro Measurement Protocol.
- **Gateway de pagamento (Hotmart, Stripe, Kiwify):** anotar URL de checkout e onde injetar o `external_id` (Hotmart usa `xcod`).
- **Webhook do gateway:** secret salvo para validar (Hotmart Hottok, Stripe webhook secret).

## Passo 2. Variáveis de ambiente

Cria no `.env.local` e no painel Vercel (Production e Preview):

```bash
# Meta CAPI
FB_PIXEL_ID=000000000000000
NEXT_PUBLIC_FB_PIXEL_ID=000000000000000
FB_ACCESS_TOKEN=EAA...
TRACKING_ETLD_DOMAIN=cliente.com.br
TRACKING_DOMAINS=cliente.com.br,www.cliente.com.br,localhost

# GA4
GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=xxxxxxxxxxxxxxxxxxx

# Google Ads Enhanced Conversions
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxxxxxxxxx
GOOGLE_ADS_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxxxxxxx
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxx
GOOGLE_ADS_CUSTOMER_ID=1234567890
GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890
GOOGLE_ADS_CONVERSION_ACTION=customers/1234567890/conversionActions/987654321
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=AbCdEfGhIj1234567890

# Webhook gateway
HOTMART_WEBHOOK_SECRET=xxxxxxxxxxxx
CHECKOUT_URL=https://pay.hotmart.com/EXEMPLO?off=padrao
CHECKOUT_EXTERNAL_ID_PARAM=xcod

# Produto default (placeholder)
NEXT_PUBLIC_DEFAULT_PRODUCT_ID=default-product
NEXT_PUBLIC_DEFAULT_PRODUCT_NAME=Produto Default
NEXT_PUBLIC_DEFAULT_PRODUCT_PRICE=147
NEXT_PUBLIC_DEFAULT_CURRENCY=BRL
NEXT_PUBLIC_SITE_URL=https://cliente.com.br
```

**Regra inegociável:** `FB_ACCESS_TOKEN`, `GA_API_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `HOTMART_WEBHOOK_SECRET` NUNCA com prefixo `NEXT_PUBLIC_`.

## Passo 3. Instalar SDK oficial Meta

```bash
pnpm add capi-param-builder-nodejs
```

(Ou `npm install` se o projeto não usar pnpm.)

O bundle client vem por CDN dentro do `track.js`, não precisa de install no client.

## Passo 4. Copiar os 12 blocos do projeto referência

Copie de `lp_charcutaria/` para o seu projeto, MANTENDO a estrutura:

| Origem | Destino |
|---|---|
| `lp_charcutaria/src/lib/tracking-server.ts` | `src/lib/tracking-server.ts` |
| `lp_charcutaria/src/middleware.ts` | `src/middleware.ts` |
| `lp_charcutaria/src/app/api/track/route.ts` | `src/app/api/track/route.ts` |
| `lp_charcutaria/src/app/api/track-config/route.ts` | `src/app/api/track-config/route.ts` |
| `lp_charcutaria/src/app/api/checkout/route.ts` | `src/app/api/checkout/route.ts` (ajustar para seu gateway) |
| `lp_charcutaria/src/app/api/debug-payload/route.ts` | `src/app/api/debug-payload/route.ts` |
| `lp_charcutaria/src/components/track-page-view.tsx` | `src/components/track-page-view.tsx` |
| `lp_charcutaria/public/track.js` | `public/track.js` |

No `src/app/layout.tsx`, adicione no `<head>` o snippet do Pixel base via `next/script` (ler bloco 9 da doc completa).

Se tiver páginas HTML estáticas em `/public`, adicione em cada uma, antes do `</head>`:
```html
<script src="/track.js" defer></script>
```

## Passo 5. Validar localmente

```bash
pnpm dev
```

Abra `http://localhost:3000/?test_event_code=TESTxxxxx&fbclid=test_fbclid_value` numa aba anônima. Confirme no console:

```js
document.cookie                    // deve ter _eid e (depois de ~2s) _fbp/_fbc
typeof window.clientParamBuilder   // deve ser 'object' (SDK Meta carregado)
window.clientParamBuilder.getFbc() // deve retornar fb.X.timestamp.test_fbclid_value.AQQ...
```

Valide payload via debug endpoint:
```
http://localhost:3000/api/debug-payload?event_name=Lead&email=teste@x.com&phone=11999998888&name=Joao+Silva&test_event_code=TESTxxxxx
```

O JSON retornado tem que ter, no mínimo, em `user_data`: `em`, `ph`, `fn`, `ln`, `ct`, `st`, `zp`, `country`, `external_id`, `client_ip_address`, `client_user_agent`, `fbp` (e `fbc` quando vier fbclid). Hashes com sufixo `.AQQxAQIB` (language token oficial Meta).

## Passo 6. Deploy e validar em produção

1. `git push` para o branch que aciona deploy Vercel
2. Aguardar build verde
3. Acessar `https://cliente.com.br/?test_event_code=TESTxxxxx`
4. Em Events Manager, aba Test Events com o código TESTxxxxx, deve aparecer:
   - PageView (Browser + Server, deduplicado)
   - ViewContent 2.5s depois
   - InitiateCheckout ao clicar no botão
   - Contact ao clicar em wa.me/mailto/tel
5. Cada evento mostra **Match Quality** por parâmetro. Espera-se Good ou Great em todos.
6. Disparar uma compra teste pelo gateway, validar webhook de Purchase no log Vercel (`[CAPI] OK` com `event_id = order_id`).

**Validação interativa visual (Payload Helper):** o Helper é um BUILDER VISUAL, não um campo para colar JSON inteiro. Acesse https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper, selecione o `event_name`, adicione campos `user_data` um a um (em, ph, fn, ln, ct, st, zp, country, external_id, client_ip_address, client_user_agent, fbc, fbp) e cole em cada campo o **hash** correspondente do `/api/debug-payload` (com sufixo `.AQQxAQIB`, NÃO use o botão "Hash" do próprio Helper porque ele gera SHA-256 puro sem language token). O painel direito mostra o JSON sendo construído. Procure "Não foram encontrados erros". Cole o Pixel ID no campo "Testar esta carga" e clique em **Enviar para Eventos de Teste**. Detalhes completos na seção A.11 de TRACKING_PERFEITO_META_GADS.md.

## Passo 7. Monitoramento contínuo

- **Diariamente nas primeiras 2 semanas:** Events Manager > Diagnostics. Não deve ter alerta de Duplicate events nem Modified fbclid value.
- **Semanal:** EMQ por evento no Events Manager. Meta Good ou Great. Se cair para OK ou Poor, abrir Diagnostics e ver qual parâmetro está faltando.
- **Mensal:** Google Ads > Tools > Conversions > Diagnostics. Enhanced Conversions Recording, Health > 70%.
- **A cada release:** rodar `/api/debug-payload` e colar no Payload Helper antes de subir.

---

## Anti padrões que vão te queimar

1. Gerar `_fbc`/`_fbp` manualmente em middleware ou no client (Meta detecta fbclid modificado, EMQ cai). Sempre SDK.
2. Hashear `fbc`, `fbp`, IP ou UA (devem ir em texto claro).
3. Hashear email/phone sem trim/lowercase (Meta não matcheia).
4. `event_id` diferente entre Pixel browser e CAPI server (sem dedupe, conta em dobro).
5. Disparar Purchase só no thank-you page client side (perde 30% por iOS/adblock).
6. Esquecer `xcod`/`external_id` na URL Hotmart (webhook não bate com checkout).
7. Phone sem DDI 55 ou com máscara (match Meta falha).
8. `FB_ACCESS_TOKEN` ou `GOOGLE_ADS_REFRESH_TOKEN` com prefixo `NEXT_PUBLIC_` (vaza token).
9. Bloquear redirect do checkout esperando CAPI (sempre fire-and-forget com `Promise.allSettled`).
10. Não setar `TRACKING_ETLD_DOMAIN` correto (cookies acabam em host errado, conflito com Pixel oficial).

---

## Onde estão os links oficiais

Todos os links que mandam (Meta, Google, GA4, Hotmart, Vercel) estão na **seção A.12 de `TRACKING_PERFEITO_META_GADS.md`**. Sempre cite a página oficial em PR review, não tutorial de terceiros.

---

## Squad recomendado

Quando o agente CEO ou o usuário pedir "implementa tracking", a hierarquia é:

- `/arquiteto` revisa o plano e confirma os 12 blocos a copiar
- `/dev` copia, adapta para o gateway específico, configura envs
- `/qa` valida via debug-payload + Payload Helper + Test Events Manager
- `/deployer` sobe pra produção e abre Diagnostics

Para projeto multi tenant, repetir os 7 passos por cliente trocando apenas: `TRACKING_ETLD_DOMAIN`, `TRACKING_DOMAINS`, `FB_PIXEL_ID`, `FB_ACCESS_TOKEN`, `GA_MEASUREMENT_ID`, `GOOGLE_ADS_*`, `CHECKOUT_URL`, `HOTMART_WEBHOOK_SECRET`.
