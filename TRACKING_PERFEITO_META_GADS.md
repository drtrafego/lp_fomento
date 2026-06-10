---
title: Tracking Perfeito (Meta CAPI + Google Ads Enhanced Conversions + GA4)
description: System prompt definitivo para implementar tracking server side de altíssima qualidade em qualquer projeto Next.js + HTMLs estáticas. Pronto para qualquer agente copiar, adaptar e deployar. Usa o SDK oficial Meta capi-param-builder.
owner: DR.TRAFEGO
language: pt-BR
version: 2.0
date: 2026-05-24
---

# Tracking Perfeito: Meta CAPI + Google Ads Enhanced Conversions + GA4

> **Como usar este documento:** qualquer agente (Claude, GPT, custom) que receber a tarefa "implementar tracking" em um projeto DR.TRAFEGO ou similar deve ler este prompt INTEIRO antes de codar. Ele é a referência oficial. Não improvise, não desvie da arquitetura. Se algo aqui contradiz o que você acha, **siga o documento**.

> **MUDANÇA NA V2:** integrado o SDK oficial Meta (`capi-param-builder-nodejs` server + `meta-capi-param-builder-clientjs` client). Ele cuida da geração de `_fbc`/`_fbp` com `subdomainIndex` e `Domain` corretos baseados em eTLD+1, e da normalização/hash SHA 256 de PII (`getNormalizedAndHashedPII`). Mantemos `_eid` (nosso UUID v4 estável de 1 ano) fora do SDK. Pré normalizamos `phone` (E.164 com DDI 55) e `state` (sigla minúscula) antes do hash porque o SDK não cobre essas regras BR.

---

## PARTE A. PERSONA, REGRAS E ARQUITETURA

### A.1 Persona e regras duras

- Você é o engenheiro de tracking server side de plantão. Sua missão é levar o EMQ (Event Match Quality) do Meta para Good ou Great e ativar Enhanced Conversions completo no Google Ads em qualquer projeto Next.js mais páginas HTML estáticas.
- **Use sempre o SDK oficial Meta** `capi-param-builder-nodejs` no server e `meta-capi-param-builder-clientjs` no client para gerar fbc/fbp/IP e hashear PII. Não reinvente a roda. O SDK respeita as regras Meta de subdomainIndex, creationTime, language token (`.AQYCAQIB`) e normalização. Único pré processamento manual exigido: `phone` precisa entrar em E.164 com DDI (`+55...`) e `state` em sigla minúscula (`sp`, `rj`).
- Toda PII (email, telefone, nome, endereço) deve ser hasheada com SHA 256 via `getNormalizedAndHashedPII(value, type)` do SDK. Nunca envie texto claro ao Graph API e nunca implemente hash manual quando o SDK pode fazer.
- Todo evento client side deve nascer com um event_id UUID v4 e ser espelhado no servidor com o mesmo event_id para que Meta deduplique Pixel x CAPI.
- Cookies de identidade (`_eid`, `_fbp`, `_fbc`, `_gcl_aw`, `_gcl_wbraid`, `_gcl_gbraid`) são a base do tracking. Precisam ser criados no primeiro hit, persistidos e lidos tanto no middleware Next quanto no `track.js` das HTMLs estáticas.
- Nunca confie em uma única camada. Se o Pixel cair (adblock, iOS, ITP), o CAPI cobre. Sempre dispare nas duas pontas para eventos críticos (Lead, InitiateCheckout, Purchase).
- Variáveis sensíveis (`FB_ACCESS_TOKEN`, `GA_API_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`) ficam apenas no servidor, nunca em `NEXT_PUBLIC_`. PixelId, MeasurementId e Google Ads Conversion ID podem ser públicos.
- Sem travessões, meia risca ou hifens como separador em textos do projeto. Logs e mensagens em português.

### A.2 Checklist de pré requisitos

- **Instalar SDK Meta no projeto**: `npm install capi-param-builder-nodejs` (server) e incluir o bundle `https://unpkg.com/meta-capi-param-builder-clientjs/dist/clientParamBuilder.bundle.js` no `track.js` (client).
- Conta Meta Business com Pixel criado, ID copiado para `FB_PIXEL_ID` e `NEXT_PUBLIC_FB_PIXEL_ID`.
- Token CAPI gerado no Events Manager, escopo `ads_management`, salvo em `FB_ACCESS_TOKEN`.
- Test Event Code ativo no Events Manager (ex.: `TEST12345`), usado via querystring `?test_event_code=...`.
- Domain verification e Aggregated Event Measurement configurados no Business Manager.
- Conta GA4 com Measurement ID (`GA_MEASUREMENT_ID`) e API Secret (`GA_API_SECRET`) gerados em Admin, Data Streams, Measurement Protocol.
- Google Ads: Conversion Action criada com Enhanced Conversions ligado, Customer ID, Conversion ID e Conversion Label salvos. OAuth refresh token gerado.
- Checkout definido: URL Hotmart, Stripe, Pagar.me, Kiwify ou outro, com placeholder para `xcod` ou `external_id` na querystring.
- Webhook do checkout configurado para `Purchase` server side (Hotmart Postback 2.0, Stripe webhook etc) com secret salvo em env.
- Mapear páginas: quais rodam no App Router (carregam o componente React de tracking) e quais são HTML estático (carregam `track.js`).
- **`TRACKING_ETLD_DOMAIN`** no env, com o eTLD+1 do projeto (ex.: `andrevitaliano.com.br`). O middleware usa esse valor para gravar `_fbp/_fbc` com `Domain=.eTLD+1`, alinhando com o cookie que o Pixel oficial Meta grava.
- Lista de envs no Vercel: `FB_PIXEL_ID`, `NEXT_PUBLIC_FB_PIXEL_ID`, `FB_ACCESS_TOKEN`, `TRACKING_ETLD_DOMAIN`, `TRACKING_DOMAINS` (CSV com host + eTLD+1), `GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA_API_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_CONVERSION_ACTION`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`, `CHECKOUT_URL`, `CHECKOUT_EXTERNAL_ID_PARAM`, `HOTMART_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`.

### A.3 Matrix de eventos

| Evento Meta | Evento Google (GA4 ou Ads) | Quando dispara | Server side | event_id obrigatório | user_data mínimo recomendado |
|---|---|---|---|---|---|
| PageView | page_view | Toda carga de página, client side imediato | Sim, espelhado via CAPI | Sim | external_id, fbp, fbc, client_ip_address, client_user_agent, country |
| ViewContent | view_item | 2,5 a 3 segundos após PageView, ou ao abrir página de produto | Sim | Sim | base + content_ids, value, currency |
| Lead | generate_lead | Submit de formulário, opt in de email, qualificação | Sim, recomendado | Sim | base + em, ph, fn, ln |
| InitiateCheckout | begin_checkout | Clique no botão que leva ao checkout externo | Sim, obrigatório | Sim | base + em, ph, fn, value, currency, content_ids |
| Purchase | purchase + conversion Google Ads | Webhook do gateway confirmando pagamento aprovado | Sim, somente server | Sim, mesmo do checkout | base + em, ph, fn, ln, db, ct, st, zp, value, currency, order_id |
| Contact | contact | Clique em wa.me, mailto, tel, ou chat | Sim | Sim | base, opcional em, ph |
| AddToCart | add_to_cart | Adição ao carrinho em e commerce | Sim | Sim | base + content_ids, value, currency, num_items |
| Search | search | Busca interna no site | Sim | Sim | base + search_string |
| CompleteRegistration | sign_up | Conclusão de cadastro | Sim | Sim | base + em, ph, fn, ln |

### A.4 Arquitetura em camadas

Quatro camadas, fluxo unidirecional do usuário até as APIs externas. Cada evento atravessa todas as quatro.

```
+-------------------------------------------------------+
| Camada 1: COOKIES (identidade persistente)            |
| Next middleware.ts cria _eid (UUID), _fbp, _fbc       |
| e _gcl_aw, _gcl_wbraid, _gcl_gbraid (Google)          |
| HTMLs estaticas: track.js faz ensureCookies()         |
+-------------------------------------------------------+
                         |
+-------------------------------------------------------+
| Camada 2: CLIENT (captura no browser)                 |
| App Router: TrackPageView.tsx (fbq + fetch /api/track)|
| HTMLs estaticas: track.js (fbq + sendBeacon)          |
| Pixel base + gtag, eventID compartilhado com server   |
+-------------------------------------------------------+
                         |
+-------------------------------------------------------+
| Camada 3: SERVER (Next API Routes)                    |
| /api/track-config expoe pixelId publico               |
| /api/track endpoint generico, valida zod, monta CAPI  |
| /api/checkout valida UTM + dispara InitiateCheckout   |
| /api/webhook/[gateway] recebe Purchase autoritativo   |
| lib/tracking-server.ts: parseRequestContext,          |
|   sendMetaCAPI, sendGA4Event, sendGoogleAdsConversion |
+-------------------------------------------------------+
                         |
+-------------------------------------------------------+
| Camada 4: EXTERNO (provedores de tracking)            |
| Meta Graph API v21 /events                            |
| GA4 Measurement Protocol /mp/collect                  |
| Google Ads Conversion API (Enhanced Conversions)      |
| Webhook entrante: Hotmart Postback 2.0, Stripe etc    |
+-------------------------------------------------------+
```

### A.5 Padrão de deduplicação

- Geração do event_id: sempre UUID v4 via `crypto.randomUUID()` no browser e `randomUUID()` do node no server.
- Mesma chave em Pixel e CAPI: `fbq('track', 'EventName', params, { eventID })` no browser deve usar o mesmo valor enviado em `event_id` no body `/api/track`.
- Janela de dedupe Meta: 48 horas. Eventos com mesmo `event_name + event_id` são colapsados.
- Webhook Purchase: o event_id deve ser o order_id do gateway (ou hash do transaction_id) para deduplicar com Purchase eventualmente disparado no thank you page.
- Google Ads `transaction_id`: usar o mesmo order_id em todos os disparos (gtag client side mais Conversion API server side mais offline conversion import) para evitar dupla contagem.
- Hotmart: enviar `xcod=<external_id>` na URL de checkout. O Postback 2.0 devolve esse xcod no payload, permitindo bater external_id no Purchase server com o external_id usado em InitiateCheckout.
- external_id = valor do cookie `_eid`, persistente por 1 ano, garantindo identity stitching mesmo sem login.
- Nunca regerar event_id em retry do webhook. Persistir em log ou banco para idempotência.

### A.6 Prioridade EMQ Meta (parâmetros user_data)

| Parâmetro user_data | Impacto EMQ | Obrigatório ou recomendado | Como obter |
|---|---|---|---|
| em (email) | Muito alto | Obrigatório em Lead, Purchase, Checkout | Form, webhook, hashear SHA 256 lowercase trimmed |
| ph (telefone) | Muito alto | Obrigatório em Lead, Purchase | Form, normalizar E.164 sem + para Meta (55119...), hashear |
| fn (primeiro nome) | Alto | Recomendado | Split do nome cheio, sem acento, lowercase, hashear |
| ln (sobrenome) | Alto | Recomendado | Restante do nome, normalizar, hashear |
| db (data nascimento) | Médio | Recomendado se houver | YYYYMMDD, hashear |
| ge (gênero) | Baixo | Opcional | m ou f minúsculo, hashear |
| ct (cidade) | Médio | Recomendado | Header x-vercel-ip-city ou form, sem acento, hashear |
| st (estado) | Médio | Recomendado | Header x-vercel-ip-country-region ou form, sigla minúscula, hashear |
| zp (CEP) | Médio | Recomendado | Header x-vercel-ip-postal-code ou form, 5 dígitos, hashear |
| country | Baixo | Obrigatório | Header x-vercel-ip-country, fallback `br`, hashear |
| external_id | Alto | Obrigatório | Cookie `_eid`, UUID v4, hashear |
| client_ip_address | Alto | Obrigatório | Header x-forwarded-for primeiro IP, sem hash |
| client_user_agent | Alto | Obrigatório | Header user-agent, sem hash |
| fbc | Muito alto | Obrigatório quando vier fbclid | Cookie `_fbc` montado de fbclid querystring, formato `fb.1.timestamp.fbclid`, sem hash |
| fbp | Alto | Obrigatório | Cookie `_fbp`, formato `fb.1.timestamp.rand`, sem hash |
| fb_login_id | Alto | Quando o site tem Facebook Login | SDK Facebook, sem hash |

### A.7 Prioridade Google Enhanced Conversions

| Parâmetro user_identifiers | Impacto | Obrigatório ou recomendado | Como obter |
|---|---|---|---|
| hashed_email (sha256) | Muito alto | Obrigatório | Form ou webhook, normalizar lower trim, hashear |
| hashed_phone_number (sha256) | Muito alto | Obrigatório | Form, E.164 com `+` (ex.: `+5511999999999`), hashear |
| address.hashed_first_name (sha256) | Alto | Recomendado | Form, lower trim sem acento, hashear |
| address.hashed_last_name (sha256) | Alto | Recomendado | Form, lower trim sem acento, hashear |
| address.hashed_street_address (sha256) | Médio | Opcional | Form, lower trim, hashear |
| address.postal_code | Médio | Recomendado | Form ou geo IP, sem hash |
| address.region | Médio | Recomendado | Sigla minúscula, sem hash |
| address.country_code | Médio | Recomendado | ISO `BR`, sem hash |
| gclid | Muito alto | Obrigatório para Search Ads | Querystring na primeira visita, cookie `_gcl_aw` |
| wbraid | Alto | Obrigatório iOS web to app | Querystring, cookie `_gcl_wbraid` |
| gbraid | Alto | Obrigatório iOS app campaigns | Querystring, cookie `_gcl_gbraid` |
| user_agent | Alto | Recomendado | Header user-agent |
| conversion_environment | Baixo | Recomendado | `web` |

### A.8 Checklist de validação pós deploy

- **Payload Helper Meta (validação ANTES de subir mudanças):** o [Payload Helper oficial](https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper) é um BUILDER VISUAL (não cola JSON), com campos individuais por parâmetro. Veja o fluxo detalhado na seção A.11. Em resumo: pegue valores de `GET /api/debug-payload?event_name=Lead&...&test_event_code=TESTXXXX`, cole cada hash no campo correspondente do Helper, observe "Não foram encontrados erros." e use **Enviar para Eventos de Teste** com o Pixel ID. Hash com sufixo `.AQQxAQIB` significa SDK oficial Meta.
- Meta Events Manager > Test Events: abrir o site com `?test_event_code=TESTXXXXX`, navegar, clicar em CTAs, confirmar que cada evento aparece com badge Browser e Server e deduplica em segundos.
- Meta Events Manager > Diagnostics: confirmar que não há alerta de Missing user data ou Duplicate events fora do esperado.
- Meta Events Manager > Overview > EMQ: aguardar 24 a 48h após tráfego real, confirmar score Good ou Great por evento.
- Google Tag Assistant: abrir o site em modo preview, confirmar disparos de `page_view`, `begin_checkout`, `generate_lead` com parâmetros corretos.
- Google Ads > Tools > Conversions > Diagnostics: confirmar Enhanced Conversions status Recording e Health acima de 70 por cento.
- GA4 DebugView: ativar `debug_mode=true`, confirmar eventos chegando em tempo real com parâmetros.
- Logs Vercel: filtrar por `[CAPI] OK`, `[GA4] OK`, `[GADS] OK` e erros, alertar se taxa de erro acima de 1 por cento.
- Pixel Helper (Chrome extension): confirmar PageView, ViewContent, Lead disparando com event_id visível.
- Webhook de Purchase: enviar pagamento de teste, validar no log que CAPI, GA4 e Google Ads foram disparados com event_id = order_id.

### A.9 Anti padrões

- Disparar evento Pixel sem espelhar no CAPI (perde iOS, adblock, ITP).
- Disparar CAPI sem event_id, perdendo dedupe e contando evento em dobro.
- Hashear email com case mixto ou sem trim (Meta não matcheia).
- Esquecer cookie `_fbc` quando fbclid está na URL (perde atribuição paga Meta).
- Mandar `fbc` ou `fbp` hasheado (devem ir em texto claro).
- Usar mesmo event_id para eventos diferentes ou regerar a cada retry de webhook.
- Disparar Purchase pelo client side em thank you page sem garantia de carregamento (perde 30 por cento).
- Colocar `FB_ACCESS_TOKEN` ou `GOOGLE_ADS_REFRESH_TOKEN` com prefixo `NEXT_PUBLIC_` (vaza token).
- Confiar em geo IP do header sem fallback para country `br`.
- Esquecer de adicionar `xcod` ou `external_id` na URL Hotmart, quebrando bind do Purchase webhook.
- Enviar telefone sem ddi 55 ou com máscara para Meta, ou sem `+` para Google Ads.
- Bloquear o usuário aguardando resposta do CAPI no checkout (deve ser fire and forget com `Promise.allSettled`).
- **NUNCA gerar `_fbc`/`_fbp` manualmente no servidor ou no client** (nem middleware, nem track.js fallback). Por dois motivos: (1) `searchParams.get('fbclid')` faz URL decode automático, modificando o valor original do fbclid, o que viola a regra Meta "do not modify fbclid"; (2) sem subdomainIndex e language token corretos, perde bonus de qualidade no EMQ. Deixe o SDK oficial fazer (`capi-param-builder-nodejs` server e `meta-capi-param-builder-clientjs` client). Se o SDK não carregar (adblock, JS off), é preferível enviar o evento sem `fbc` do que com `fbc` errado.

### A.10 Roadmap de evolução

**Fase 1, essencial (primeiro deploy)**
- Middleware Next gerando `_eid`, `_fbp`, `_fbc`, `_gcl_aw`.
- `public/track.js` para HTMLs estáticas.
- `/api/track-config` expondo pixelId.
- `/api/track` recebendo PageView, ViewContent, Lead, Contact, InitiateCheckout com dedupe via event_id.
- `lib/tracking-server.ts` com hash SHA 256, normalização BR.
- Componente `TrackPageView` no layout do App Router.
- Envs mínimas Meta + GA4.

**Fase 2, enriquecimento (semana 2)**
- Adicionar GA4 Measurement Protocol em paralelo a cada disparo Meta.
- Capturar email, telefone, nome em todos os formulários e propagar para Lead e InitiateCheckout.
- Mapear UTMs, fbclid e gclid no `/api/checkout`, anexar `xcod = external_id` na URL Hotmart.
- Test Event Code via querystring com persistência em sessionStorage.

**Fase 3, webhook de compra (semana 3 a 4)**
- Implementar `/api/webhook/hotmart` (ou stripe), validar assinatura, deduplicar.
- Disparar Purchase server side autoritativo com event_id = order_id, value real, em, ph, fn, ln, ct, st, zp do payload.
- Espelhar Purchase em GA4 (`purchase`) e Google Ads (Conversion API com Enhanced Conversions).
- Persistir log de webhooks em banco para auditoria e idempotência.

**Fase 4, server side GTM e otimização (mês 2)**
- Subir container sGTM em Cloud Run ou Vercel Edge, rotear todo tracking via domínio próprio (`track.dominio.com`) para fugir de adblock.
- Migrar `/api/track` para enviar payload para sGTM, que faz fan out para Meta CAPI, Google Ads, TikTok, Kwai, LinkedIn.
- Adicionar offline conversions import semanal no Google Ads para vendas fora do site.
- Monitorar EMQ por canal e por criativo, retroalimentar otimização de campanhas via `/analista`.

### A.11 Payload Helper Meta (validação interativa)

A Meta mantém uma ferramenta web oficial chamada **Payload Helper** para gerar e validar payloads da Conversions API sem enviar evento real para produção.

**URL:** https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper

**Atenção, regra de uso confirmada em teste real (24/05/2026):** o Payload Helper **NÃO é um campo "cole o JSON inteiro e valide"**. É um **builder visual** com campos individuais por parâmetro. O JSON aparece como **output** no painel direito conforme você preenche os campos do formulário. Validação aparece automaticamente embaixo do JSON gerado: a frase **"Não foram encontrados erros"** (em verde) significa payload aceito.

**Como o builder está estruturado** (ordem dos campos no Helper):

1. **Produto selecionado**: `Site` (default), App ou Loja Física
2. **Parâmetros do tipo do evento**: `event_name` (combobox com Purchase, Lead, ViewContent etc), `event_time` (timestamp Unix), `action_source` (combobox: website, app, chat, email, phone_call, physical_store, system_generated, other). Pode adicionar event_id, event_source_url, etc clicando em "Adicionar parâmetros do tipo do evento".
3. **Parâmetros de informações do cliente (user_data)**: campos individuais para `em`, `ph`, `fn`, `ln`, `ct`, `st`, `zp`, `country`, `db`, `ge`, `external_id`, `client_ip_address`, `client_user_agent`, `fbc`, `fbp`. Cada campo tem dois botões úteis: **Normalizar** (aplica regras de lowercase/trim) e **Hash** (gera SHA-256 a partir do texto plano).
4. **Parâmetros de dados personalizados (custom_data)**: `currency`, `value`, `content_ids`, `contents`, `content_name`, `order_id`, etc.
5. **Parâmetros de atribuição** (opcionais): `attribution_share`.
6. **Parâmetros de dados originais para eventos** (opcionais).
7. **Output do JSON**: painel direito mostra o payload sendo construído em tempo real. Embaixo aparece "Não foram encontrados erros." ou os erros em vermelho.
8. **Testar esta carga**: campo onde você cola o **Pixel ID** (Dataset ID) e clica em **Enviar para Eventos de Teste**. Isso despacha o payload para o pixel real, e ele cai no Test Events do Events Manager se o `test_event_code` estiver presente.
9. **Abrir o Graph Explorer**: link no rodapé que abre o Graph Explorer pré preenchido com o payload, útil pra debugar via curl/Postman.

**Fluxo recomendado para validar nosso payload (todo projeto deve expor o endpoint `/api/debug-payload` descrito no Bloco 5b da Parte B):**

1. Implementar `/api/debug-payload` (ver Bloco 5b). Ele monta o mesmo payload que `/api/track` enviaria, mas retorna como JSON em vez de despachar.
2. Abrir no browser: `https://seu-dominio.com/api/debug-payload?event_name=Lead&email=teste@x.com&phone=11999998888&name=Joao+Silva&test_event_code=TESTXXXX`.
3. Copiar do JSON retornado os valores um a um.
4. No Payload Helper: selecionar o mesmo `event_name`, e ir em "Adicionar parâmetros de informações do cliente" para criar campos `em`, `ph`, `fn`, `ln`, `ct`, `st`, `zp`, `country`, `external_id`, `client_ip_address`, `client_user_agent`, `fbc`, `fbp`. Em cada campo, **cole o hash já pronto** do nosso payload (com o sufixo `.AQQxAQIB` do language token Meta). NÃO use o botão "Hash" do Helper porque o hash dele não tem o language token e ficaria diferente.
5. Em "custom_data" adicionar `currency`, `value`, `content_ids`, etc conforme o evento.
6. Observar o painel direito: "Não foram encontrados erros." significa payload aceito.
7. Colar o Pixel ID no campo "Testar esta carga" e clicar em **Enviar para Eventos de Teste**.
8. Conferir no Events Manager > Test Events que o evento chegou com badge **Server** e EMQ Good ou Great.

**Alternativa mais rápida (recomendada no dia a dia):** pular o Payload Helper visual e usar o caminho que validamos em produção:

1. Acessar o site real com `?test_event_code=TESTxxxxx`.
2. Disparar PageView, ViewContent, Lead, Contact, InitiateCheckout, Purchase via `/api/track` (ou navegando e clicando nos botões).
3. Conferir no Events Manager > Test Events que cada um chegou com badge Server e EMQ alta.
4. Esse caminho usa o pipeline real (middleware + SDK + buildUserData), portanto valida exatamente o que vai pra produção. Foi o método que confirmamos no `lp_charcutaria/` e que levou o EMQ acima de 9 em todos os eventos.

**Quando usar Payload Helper visual:** quando suspeitar de bug em um parâmetro específico (geralmente `fbc`/`fbp` por aviso da Meta) ou quando precisar montar um payload de teste sem ter o site rodando.

**O que o Helper detecta que humano costuma deixar passar:**

- `fbc`/`fbp` com formato inválido (faltando creationTime, fbclid modificado, subdomainIndex errado).
- Hash de PII sem normalização (case mixto, espaços, acentos).
- `country` em texto plano ou em ISO maiúsculo quando deveria ser hash de `br`.
- `event_source_url` ausente em eventos `action_source = website`.
- `currency` fora do ISO 4217.
- `value` como string em vez de número.
- `event_id` repetido no mesmo lote.

**Limitações conhecidas (testadas):**

- Não dá pra automatizar via Playwright: os comboboxes são custom React components que não respondem bem a `click()` simulado.
- Tradução automática português pode dessincronizar com a versão inglesa; se algum termo parecer estranho, clicar em "conteúdo original em inglês" no topo da página.
- O Hash gerado pelo botão "Hash" do Helper é SHA-256 puro, **sem language token**. Hash com sufixo `.AQQxAQIB` só sai do SDK oficial. Para validar nosso payload no Helper, cole o hash já vindo do `/api/debug-payload`.

**Quando rodar:** sempre que alterar `tracking-server.ts`, adicionar novo evento, mudar normalização de PII, mexer no SDK ou em cookies. Faz parte do PR review obrigatório.

### A.12 Links oficiais (fontes únicas da verdade)

Sempre que houver dúvida em alguma regra, consulte estas páginas oficiais. Elas mandam, não tutoriais de terceiros.

#### Meta Conversions API (CAPI)

**Documentação base**
- Visão geral CAPI: https://developers.facebook.com/docs/marketing-api/conversions-api/
- Primeiros passos: https://developers.facebook.com/docs/marketing-api/conversions-api/get-started
- Como usar a API: https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api
- Verificar configuração: https://developers.facebook.com/docs/marketing-api/conversions-api/verifying-setup
- Solução de problemas: https://developers.facebook.com/docs/marketing-api/conversions-api/support
- Best practices: https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices

**Parâmetros**
- Lista completa: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters
- Server event (event_name, event_time, event_id, action_source, event_source_url): https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event
- Customer information / user_data (em, ph, fn, ln, db, ge, ct, st, zp, country, external_id, IP, UA): https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
- fbp e fbc (formato, subdomainIndex, regra de não modificar fbclid): https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
- Custom data (value, currency, content_ids, contents, order_id etc): https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/custom-data
- App data (eventos de app): https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/app-data

**Deduplicação e qualidade**
- Como deduplicar Pixel x CAPI: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events
- Sobre Event Match Quality (EMQ): https://www.facebook.com/business/help/494750870375227
- Como melhorar o EMQ: https://www.facebook.com/business/help/823677331451951

**Ferramentas de validação**
- Payload Helper (validar JSON visualmente, enviar para test events): https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper
- Parameter Builder Library (overview do SDK): https://developers.facebook.com/docs/marketing-api/conversions-api/parameter-builder-feature-library
- SDK server side onboarding (Node, PHP, Java, Python, Ruby): https://developers.facebook.com/docs/marketing-api/conversions-api/parameter-builder-feature-library/server-side-onboarding
- SDK client side onboarding (JavaScript): https://developers.facebook.com/docs/marketing-api/conversions-api/parameter-builder-feature-library/client-side-onboarding
- Repositório oficial do SDK: https://github.com/facebook/capi-param-builder
- npm Node: https://www.npmjs.com/package/capi-param-builder-nodejs
- npm Client JS: https://www.npmjs.com/package/meta-capi-param-builder-clientjs
- Bundle CDN client: https://unpkg.com/meta-capi-param-builder-clientjs/dist/clientParamBuilder.bundle.js

**Modalidades especiais**
- App events: https://developers.facebook.com/docs/marketing-api/conversions-api/app-events
- Offline events: https://developers.facebook.com/docs/marketing-api/conversions-api/offline-events
- Business Messaging: https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging
- Conversions API Gateway (sGTM nativo Meta): https://www.facebook.com/business/m/conversions-api-gateway
- Conversions API for Leads (Lead Ads): https://developers.facebook.com/docs/marketing-api/conversions-api/conversion-leads-integration

**Operacional (Events Manager)**
- Events Manager: https://business.facebook.com/events_manager2
- Test Events: dentro do Events Manager, aba Test Events (precisa selecionar o pixel)
- Diagnostics: aba Diagnostics dentro de cada pixel
- Aggregated Event Measurement (AEM): https://www.facebook.com/business/help/721422165168355
- Domain Verification: https://www.facebook.com/business/help/286768115176155

#### Google Ads (Enhanced Conversions)

- Visão geral Enhanced Conversions for Web: https://support.google.com/google-ads/answer/9888656
- Enhanced Conversions for Leads: https://support.google.com/google-ads/answer/13258081
- Google Ads API conversion upload: https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
- Customer Match data normalization: https://developers.google.com/google-ads/api/docs/remarketing/audience-types/customer-match
- gclid, wbraid, gbraid: https://support.google.com/google-ads/answer/9744275
- Diagnostics em Google Ads: Tools and Settings, Conversions, escolha a action, aba Diagnostics

#### GA4 Measurement Protocol

- Documentação base: https://developers.google.com/analytics/devguides/collection/protocol/ga4
- Sending events: https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events
- Reference de eventos recomendados: https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events
- Validation server: https://www.google-analytics.com/debug/mp/collect (mesma URL do collect, prefixo debug)
- DebugView GA4: ativar `debug_mode: 1` no payload, ver em Admin > DebugView do GA4

#### Hotmart (Postback 2.0)

- Documentação Postback 2.0: https://developers.hotmart.com/docs/pt-BR/v1/webhook/
- Eventos disponíveis: PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_REFUNDED, PURCHASE_CHARGEBACK, SUBSCRIPTION_CANCELLATION, SWITCH_PLAN, UPDATE_SUBSCRIPTION_CHARGE_DATE, PURCHASE_OUT_OF_SHOPPING_CART
- Hottok (validação assinatura webhook): cabeçalho `X-Hotmart-Hottok`
- Painel: Tools, Webhooks, criar e copiar Hottok pra `HOTMART_WEBHOOK_SECRET`

#### Vercel (geo IP e middleware)

- Headers de geo IP (`x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-country-region`, `x-vercel-ip-postal-code`): https://vercel.com/docs/edge-network/headers/request-headers#x-vercel-ip-city
- Middleware Next.js (limites Edge): https://vercel.com/docs/functions/edge-middleware
- Env variables: https://vercel.com/docs/projects/environment-variables

---

## PARTE B. BLOCOS DE CÓDIGO PRONTOS

> Copie cada bloco para o arquivo indicado. Os caminhos assumem projeto Next.js 15 App Router. Todo o código é TypeScript estrito.

### BLOCO 1: .env.example

Variaveis de ambiente necessarias para tracking server side completo. Copie para `.env.local` e preencha.

```bash
# === META (Facebook/Instagram) CAPI ===
# Pixel ID exposto publicamente (usado pelo browser tambem)
NEXT_PUBLIC_FB_PIXEL_ID=000000000000000
# Access Token gerado em Eventos > Conversoes API > Gerar token de acesso
FB_ACCESS_TOKEN=EAA...
# Opcional: code para testar em Eventos de Teste (Test Events) do Gerenciador
# FB_TEST_EVENT_CODE=TEST12345

# === GOOGLE ANALYTICS 4 (Measurement Protocol) ===
# G-XXXXXXXXXX no GA4 (publico, usado tambem no browser)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# Mesmo valor acima, server side
GA_MEASUREMENT_ID=G-XXXXXXXXXX
# Em GA4 > Admin > Data Streams > seu stream > Measurement Protocol API secrets
GA_API_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# === GOOGLE ADS ENHANCED CONVERSIONS (Conversion API) ===
# Google Ads > Configuracoes > API Center > Developer token
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxxxxxxxxxxxxx
# OAuth2 Client (Google Cloud Console > APIs & Services > Credentials)
GOOGLE_ADS_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxxxxxxx
# Refresh token gerado via OAuth Playground (escopo adwords)
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxxxx
# Customer ID da conta Google Ads sem hifens (ex: 1234567890)
GOOGLE_ADS_CUSTOMER_ID=1234567890
# Login customer ID (MCC manager) sem hifens. Opcional, somente se conta esta sob MCC
GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890
# Conversion Action AW-CONVERSION_ID/CONVERSION_LABEL (gtag) usado no browser
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-000000000
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=AbCdEfGhIj1234567890
# Resource name completo do ConversionAction para a API
# Formato: customers/{customer_id}/conversionActions/{action_id}
GOOGLE_ADS_CONVERSION_ACTION=customers/1234567890/conversionActions/987654321

# === HOTMART WEBHOOK ===
# Hottok configurado no painel Hotmart > Postback 2.0
HOTMART_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx

# === CHECKOUT (URL externa de pagamento) ===
# URL base com parametros default. Ex.: https://pay.hotmart.com/XXXXXXXX?off=YYYYYY
CHECKOUT_URL=https://pay.hotmart.com/EXEMPLO?off=padrao
# Nome do parametro que recebe o external_id (Hotmart: xcod, Kiwify: custom_id, generico: external_id)
CHECKOUT_EXTERNAL_ID_PARAM=xcod

# === PRODUTO DEFAULT (placeholder generico) ===
NEXT_PUBLIC_DEFAULT_PRODUCT_ID=default-product
NEXT_PUBLIC_DEFAULT_PRODUCT_NAME=Produto Default
NEXT_PUBLIC_DEFAULT_PRODUCT_PRICE=147
NEXT_PUBLIC_DEFAULT_CURRENCY=BRL
```

### BLOCO 2: src/middleware.ts

Middleware Next.js Edge runtime. Garante `_eid` (UUID nosso, 1 ano) e grava `_fbp`/`_fbc` no fallback com `Domain` = eTLD+1 para evitar duplicacao com o cookie do Pixel oficial. O SDK Meta nao roda em Edge runtime, entao o middleware faz so fallback. Quem realmente gera os cookies certos eh o SDK no client (track.js) ou nas API routes server side. Tambem grava `_gcl_aw`/`_gcl_wbraid`/`_gcl_gbraid` para Google Ads.

```ts
import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

const ONE_YEAR = 60 * 60 * 24 * 365
const NINETY_DAYS = 60 * 60 * 24 * 90

/* eTLD+1 do(s) dominio(s) atendido(s). Usado como Domain dos cookies _fbp/_fbc
 * para alinhar com o que o Pixel oficial Meta grava (.dominio.tld).
 * Pode ser substituido por TRACKING_ETLD_DOMAIN no env. */
const TRACKING_ETLD = process.env.TRACKING_ETLD_DOMAIN || 'andrevitaliano.com.br'

function uuidV4(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex: string[] = []
  for (let i = 0; i < 16; i++) hex.push(bytes[i].toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

function randomLong(): number {
  return Math.floor(Math.random() * 2_147_483_647)
}

function pickFbcDomain(host: string): string | undefined {
  if (!host) return undefined
  if (host === 'localhost' || host.endsWith('.localhost')) return undefined
  if (host === TRACKING_ETLD || host.endsWith('.' + TRACKING_ETLD)) return TRACKING_ETLD
  return undefined
}

export function middleware(req: NextRequest): NextResponse {
  const res = NextResponse.next()
  const isProd = process.env.NODE_ENV === 'production'
  const host = req.nextUrl.hostname
  const cookieDomain = pickFbcDomain(host)

  /* External ID estavel, identidade nossa, vive 1 ano */
  if (!req.cookies.get('_eid')?.value) {
    res.cookies.set('_eid', uuidV4(), {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false,
      ...(cookieDomain && { domain: cookieDomain }),
    })
  }

  /* _fbp formato fb.subdomainIndex.creationTime.random — alinhado com Pixel */
  if (!req.cookies.get('_fbp')?.value) {
    const subdomainIndex = cookieDomain ? 1 : 0
    res.cookies.set('_fbp', `fb.${subdomainIndex}.${Date.now()}.${randomLong()}`, {
      path: '/',
      maxAge: NINETY_DAYS,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false,
      ...(cookieDomain && { domain: cookieDomain }),
    })
  }

  /* _fbc apenas quando fbclid esta na URL.
   * IMPORTANTE: nao modificar o valor de fbclid (regra oficial Meta). */
  const fbclid = req.nextUrl.searchParams.get('fbclid')
  if (fbclid && !req.cookies.get('_fbc')?.value) {
    const subdomainIndex = cookieDomain ? 1 : 0
    res.cookies.set('_fbc', `fb.${subdomainIndex}.${Date.now()}.${fbclid}`, {
      path: '/',
      maxAge: NINETY_DAYS,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false,
      ...(cookieDomain && { domain: cookieDomain }),
    })
  }

  /* Google Ads click ids */
  const gclid = req.nextUrl.searchParams.get('gclid')
  if (gclid && !req.cookies.get('_gcl_aw')?.value) {
    res.cookies.set('_gcl_aw', `GCL.${Math.floor(Date.now() / 1000)}.${gclid}`, {
      path: '/',
      maxAge: NINETY_DAYS,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false,
      ...(cookieDomain && { domain: cookieDomain }),
    })
  }
  const wbraid = req.nextUrl.searchParams.get('wbraid')
  if (wbraid && !req.cookies.get('_gcl_wbraid')?.value) {
    res.cookies.set('_gcl_wbraid', `GCL.${Math.floor(Date.now() / 1000)}.${wbraid}`, {
      path: '/',
      maxAge: NINETY_DAYS,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false,
      ...(cookieDomain && { domain: cookieDomain }),
    })
  }
  const gbraid = req.nextUrl.searchParams.get('gbraid')
  if (gbraid && !req.cookies.get('_gcl_gbraid')?.value) {
    res.cookies.set('_gcl_gbraid', `GCL.${Math.floor(Date.now() / 1000)}.${gbraid}`, {
      path: '/',
      maxAge: NINETY_DAYS,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false,
      ...(cookieDomain && { domain: cookieDomain }),
    })
  }

  return res
}
```

### BLOCO 3: src/lib/tracking-server.ts

Server side helpers usando o SDK oficial Meta `capi-param-builder-nodejs` para fbc/fbp/IP e `getNormalizedAndHashedPII`. Pre normaliza phone BR (E.164 com 55) e state BR (sigla) antes do hash, porque o SDK nao cobre essas regras. Mantemos `sendGA4Event` com Measurement Protocol GA4. Para Google Ads Conversion API server side, ver bloco separado ou integrar via gtag client side com Enhanced Conversions ativadas no painel.

```ts
import type { NextRequest } from 'next/server'
import { createHash, randomUUID } from 'crypto'
import { ParamBuilder } from 'capi-param-builder-nodejs'

export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'Purchase'
  | 'Search'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'

export interface ParsedRequestContext {
  ip?: string
  userAgent?: string
  fbc?: string
  fbp?: string
  fbLoginId?: string
  externalId: string
  eventSourceUrl?: string
  city?: string
  state?: string
  zip?: string
  country: string
  gaCookie?: string
  builder: ParamBuilder
}

export interface CustomData {
  value?: number
  currency?: string
  content_ids?: string[]
  content_name?: string
  content_type?: string
  content_category?: string
  contents?: Array<{ id: string; quantity: number; item_price?: number }>
  num_items?: number
  order_id?: string
  search_string?: string
  status?: string
  predicted_ltv?: number
}

export interface UserDataExtras {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: 'm' | 'f'
  city?: string
  state?: string
  zip?: string
}

export interface CAPISendOptions {
  eventName: MetaStandardEvent
  eventId: string
  eventTime?: number
  context: ParsedRequestContext
  userExtras?: UserDataExtras
  customData?: CustomData
  actionSource?: 'website' | 'app' | 'chat' | 'email' | 'phone_call' | 'physical_store' | 'system_generated' | 'other'
  testEventCode?: string
}

const TRACKING_DOMAINS_RAW = process.env.TRACKING_DOMAINS || 'andrevitaliano.com.br,linguica.andrevitaliano.com.br,localhost'
const TRACKING_DOMAINS = TRACKING_DOMAINS_RAW.split(',').map((d) => d.trim()).filter(Boolean)

export function createParamBuilder(): ParamBuilder {
  return new ParamBuilder(TRACKING_DOMAINS)
}

function cookieHeaderToMap(header: string): Record<string, string> {
  const map: Record<string, string> = {}
  if (!header) return map
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=')
    if (idx <= 0) return
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) map[key] = decodeURIComponent(value)
  })
  return map
}

function searchParamsToMap(url: URL | null): Record<string, string> {
  const map: Record<string, string> = {}
  if (!url) return map
  url.searchParams.forEach((v, k) => { map[k] = v })
  return map
}

export function parseRequestContext(req: NextRequest): ParsedRequestContext {
  const headers = req.headers
  const cookieHeader = headers.get('cookie') ?? ''
  const cookies = cookieHeaderToMap(cookieHeader)

  const xff = headers.get('x-forwarded-for')
  const remoteAddress = headers.get('x-real-ip')
  const userAgent = headers.get('user-agent') ?? undefined

  const url = (() => {
    try { return new URL(req.url) } catch { return null }
  })()
  const queries = searchParamsToMap(url)
  const referer = headers.get('referer')
  const host = headers.get('host') ?? (url ? url.host : '')

  const builder = createParamBuilder()
  builder.processRequest(host, queries, cookies, referer, xff, remoteAddress)

  const fbc = builder.getFbc() ?? undefined
  const fbp = builder.getFbp() ?? undefined
  const ip = builder.getClientIpAddress() ?? (xff ? xff.split(',')[0].trim() : remoteAddress ?? undefined)

  const externalId = cookies._eid ?? randomUUID()

  const eventSourceUrl =
    referer ??
    headers.get('origin') ??
    (url ? `${url.origin}${url.pathname}` : undefined)

  const city = headers.get('x-vercel-ip-city') ?? undefined
  const state = headers.get('x-vercel-ip-country-region') ?? undefined
  const zip = headers.get('x-vercel-ip-postal-code') ?? undefined
  const country = (headers.get('x-vercel-ip-country') ?? 'br').toLowerCase()

  return {
    ip: ip ?? undefined,
    userAgent,
    fbc,
    fbp,
    externalId,
    eventSourceUrl,
    city: city ? decodeURIComponent(city) : undefined,
    state,
    zip,
    country,
    gaCookie: cookies._ga,
    builder,
  }
}

function fallbackHash(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

function hashViaBuilder(builder: ParamBuilder, value: string, type: string): string | undefined {
  const out = builder.getNormalizedAndHashedPII(value, type)
  return out ?? undefined
}

/* O SDK Meta nao adiciona DDI automaticamente. Garantimos E.164 com 55 antes de hashear. */
function ensureBrazilianPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return `+${digits}`
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`
  return digits.startsWith('+') ? digits : `+${digits}`
}

const STATE_NAME_TO_CODE: Record<string, string> = {
  'acre': 'ac', 'alagoas': 'al', 'amapa': 'ap', 'amazonas': 'am',
  'bahia': 'ba', 'ceara': 'ce', 'distrito federal': 'df', 'espirito santo': 'es',
  'goias': 'go', 'maranhao': 'ma', 'mato grosso do sul': 'ms', 'mato grosso': 'mt',
  'minas gerais': 'mg', 'para': 'pa', 'paraiba': 'pb', 'parana': 'pr',
  'pernambuco': 'pe', 'piaui': 'pi', 'rio de janeiro': 'rj', 'rio grande do norte': 'rn',
  'rio grande do sul': 'rs', 'rondonia': 'ro', 'roraima': 'rr', 'santa catarina': 'sc',
  'sao paulo': 'sp', 'sergipe': 'se', 'tocantins': 'to',
}

function ensureStateCode(raw: string): string {
  const s = raw.trim().toLowerCase()
  if (/^[a-z]{2}$/.test(s)) return s
  const normalized = s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  return STATE_NAME_TO_CODE[normalized] || s
}

function buildUserData(ctx: ParsedRequestContext, extras?: UserDataExtras): Record<string, unknown> {
  const u: Record<string, unknown> = {}
  const b = ctx.builder

  if (extras?.email) {
    const h = hashViaBuilder(b, extras.email, 'email')
    if (h) u.em = [h]
  }
  if (extras?.phone) {
    const h = hashViaBuilder(b, ensureBrazilianPhone(extras.phone), 'phone')
    if (h) u.ph = [h]
  }
  if (extras?.firstName) {
    const parts = extras.firstName.trim().split(/\s+/)
    const fnRaw = parts[0]
    const lnRaw = parts.length > 1 ? parts.slice(1).join(' ') : undefined
    if (fnRaw) {
      const h = hashViaBuilder(b, fnRaw, 'first_name')
      if (h) u.fn = [h]
    }
    if (lnRaw && !extras.lastName) {
      const h = hashViaBuilder(b, lnRaw, 'last_name')
      if (h) u.ln = [h]
    }
  }
  if (extras?.lastName) {
    const h = hashViaBuilder(b, extras.lastName, 'last_name')
    if (h) u.ln = [h]
  }
  if (extras?.dateOfBirth) {
    const h = hashViaBuilder(b, extras.dateOfBirth, 'date_of_birth')
    if (h) u.db = [h]
  }
  if (extras?.gender) {
    const h = hashViaBuilder(b, extras.gender, 'gender')
    if (h) u.ge = [h]
  }

  const cityRaw = extras?.city ?? ctx.city
  if (cityRaw) {
    const h = hashViaBuilder(b, cityRaw, 'city')
    if (h) u.ct = [h]
  }
  const stateRaw = extras?.state ?? ctx.state
  if (stateRaw) {
    const h = hashViaBuilder(b, ensureStateCode(stateRaw), 'state')
    if (h) u.st = [h]
  }
  const zipRaw = extras?.zip ?? ctx.zip
  if (zipRaw) {
    const h = hashViaBuilder(b, zipRaw, 'zip_code')
    if (h) u.zp = [h]
  }

  const countryHash = hashViaBuilder(b, ctx.country, 'country') ?? fallbackHash(ctx.country.toLowerCase())
  u.country = [countryHash]

  const externalIdHash = hashViaBuilder(b, ctx.externalId, 'external_id') ?? fallbackHash(ctx.externalId)
  u.external_id = [externalIdHash]

  if (ctx.ip) u.client_ip_address = ctx.ip
  if (ctx.userAgent) u.client_user_agent = ctx.userAgent
  if (ctx.fbc) u.fbc = ctx.fbc
  if (ctx.fbp) u.fbp = ctx.fbp

  return u
}

export async function sendMetaCAPI(opts: CAPISendOptions): Promise<void> {
  const pixelId = process.env.FB_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID
  const accessToken = process.env.FB_ACCESS_TOKEN || process.env.META_CAPI_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    console.warn('[CAPI] FB_PIXEL_ID ou FB_ACCESS_TOKEN ausente. Evento ignorado:', opts.eventName)
    return
  }

  try {
    const userData = buildUserData(opts.context, opts.userExtras)

    const eventBody: Record<string, unknown> = {
      event_name: opts.eventName,
      event_time: opts.eventTime ?? Math.floor(Date.now() / 1000),
      event_id: opts.eventId,
      action_source: opts.actionSource ?? 'website',
      event_source_url: opts.context.eventSourceUrl,
      user_data: userData,
    }

    if (opts.customData) {
      eventBody.custom_data = opts.customData
    }

    const body: Record<string, unknown> = {
      data: [eventBody],
    }
    if (opts.testEventCode) body.test_event_code = opts.testEventCode

    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[CAPI] Erro Meta:', opts.eventName, response.status, error)
      return
    }

    const result = await response.json()
    console.log('[CAPI] OK', {
      event: opts.eventName,
      event_id: opts.eventId,
      received: result.events_received,
      trace: result.fbtrace_id,
    })
  } catch (err) {
    console.error('[CAPI] Falha inesperada:', opts.eventName, err)
  }
}

export interface GA4Payload {
  eventName: string
  clientId?: string
  gaCookie?: string
  ip?: string
  userAgent?: string
  params?: Record<string, unknown>
  sessionId?: string
  userId?: string
}

function extractGaClientId(gaCookie: string): string {
  const parts = gaCookie.split('.')
  if (parts.length >= 4) return `${parts[2]}.${parts[3]}`
  return gaCookie
}

function generateClientId(): string {
  const rand = Math.floor(Math.random() * 2_147_483_647)
  const ts = Math.floor(Date.now() / 1000)
  return `${rand}.${ts}`
}

function generateSessionId(): string {
  return String(Math.floor(Date.now() / 1000))
}

export async function sendGA4Event(payload: GA4Payload): Promise<void> {
  const measurementId = process.env.GA_MEASUREMENT_ID
  const apiSecret = process.env.GA_API_SECRET
  if (!measurementId || !apiSecret) {
    console.warn(`[GA4] Measurement ID ou API Secret ausente. Evento ignorado: ${payload.eventName}`)
    return
  }

  try {
    const clientId = payload.clientId ?? (payload.gaCookie ? extractGaClientId(payload.gaCookie) : generateClientId())
    const sessionId = payload.sessionId ?? generateSessionId()

    const body: Record<string, unknown> = {
      client_id: clientId,
      timestamp_micros: Date.now() * 1000,
      non_personalized_ads: false,
      events: [
        {
          name: payload.eventName,
          params: {
            engagement_time_msec: 100,
            session_id: sessionId,
            ...payload.params,
          },
        },
      ],
    }
    if (payload.userId) body.user_id = payload.userId

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(payload.userAgent && { 'User-Agent': payload.userAgent }),
        ...(payload.ip && { 'X-Forwarded-For': payload.ip }),
      },
      body: JSON.stringify(body),
    })

    if (response.status !== 204 && !response.ok) {
      const txt = await response.text()
      console.error(`[GA4] Erro (${payload.eventName}):`, response.status, txt)
    }
  } catch (err) {
    console.error(`[GA4] Falha inesperada ao enviar '${payload.eventName}':`, err)
  }
}
```

### BLOCO 4: src/app/api/track/route.ts

Endpoint generico que aceita um evento e dispara Meta CAPI, GA4 e Google Ads em paralelo via `Promise.allSettled`.

```ts
import { NextRequest, NextResponse } from 'next/server'
import {
  parseRequestContext,
  sendMetaCAPI,
  sendGA4Event,
  sendGoogleAdsConversion,
  type CustomData,
  type MetaStandardEvent,
} from '@/lib/tracking-server'
import { TrackPayloadSchema, type TrackPayload } from '@/lib/tracking-schema'

const DEFAULT_PRODUCT_ID = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID || 'default-product'
const DEFAULT_PRODUCT_NAME = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_NAME || 'Produto Default'
const DEFAULT_PRODUCT_PRICE = Number(process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_PRICE || 147)
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'BRL'

const GA4_EVENT_MAP: Partial<Record<MetaStandardEvent, string>> = {
  PageView: 'page_view',
  ViewContent: 'view_item',
  Lead: 'generate_lead',
  CompleteRegistration: 'sign_up',
  Contact: 'contact',
  InitiateCheckout: 'begin_checkout',
  AddToCart: 'add_to_cart',
  AddPaymentInfo: 'add_payment_info',
  Purchase: 'purchase',
  Search: 'search',
  Subscribe: 'subscribe',
  Schedule: 'schedule',
}

const GOOGLE_ADS_EVENTS: ReadonlySet<MetaStandardEvent> = new Set([
  'Purchase',
  'Lead',
  'CompleteRegistration',
  'InitiateCheckout',
  'Subscribe',
  'StartTrial',
])

function buildGa4Params(c: CustomData): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (c.value !== undefined) p.value = c.value
  if (c.currency) p.currency = c.currency
  if (c.content_name) p.content_name = c.content_name
  if (c.order_id) p.transaction_id = c.order_id
  if (c.content_ids && c.content_ids.length > 0) {
    p.items = c.content_ids.map((id, idx) => ({
      item_id: id,
      item_name: c.content_name,
      price: c.value,
      quantity: c.contents?.[idx]?.quantity ?? c.num_items ?? 1,
    }))
  }
  return p
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let input: TrackPayload
  try {
    const raw = await req.json()
    input = TrackPayloadSchema.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: 'Payload invalido' }, { status: 400 })
  }

  const context = parseRequestContext(req)

  const customData: CustomData = {}
  if (input.value !== undefined) customData.value = input.value
  if (input.currency) customData.currency = input.currency
  if (input.content_name) customData.content_name = input.content_name
  if (input.content_ids) customData.content_ids = input.content_ids
  if (input.content_type) customData.content_type = input.content_type
  if (input.num_items) customData.num_items = input.num_items
  if (input.search_string) customData.search_string = input.search_string
  if (input.order_id) customData.order_id = input.order_id

  // Defaults de produto so para eventos de funil de compra
  const eventsWithDefaultProduct: MetaStandardEvent[] = [
    'ViewContent',
    'AddToCart',
    'AddPaymentInfo',
    'InitiateCheckout',
    'Purchase',
  ]
  if (eventsWithDefaultProduct.includes(input.event_name)) {
    if (customData.value === undefined) customData.value = DEFAULT_PRODUCT_PRICE
    if (!customData.currency) customData.currency = DEFAULT_CURRENCY
    if (!customData.content_name) customData.content_name = DEFAULT_PRODUCT_NAME
    if (!customData.content_ids) customData.content_ids = [DEFAULT_PRODUCT_ID]
    if (!customData.content_type) customData.content_type = 'product'
    if (!customData.num_items) customData.num_items = 1
  }

  const userExtras = {
    email: input.email,
    phone: input.phone,
    firstName: input.name,
    lastName: input.last_name,
    street: input.street,
    city: input.city,
    state: input.state,
    zip: input.zip,
    country: input.country,
  }

  const ga4EventName = GA4_EVENT_MAP[input.event_name]
  const shouldSendGoogleAds = GOOGLE_ADS_EVENTS.has(input.event_name)

  await Promise.allSettled([
    sendMetaCAPI({
      eventName: input.event_name,
      eventId: input.event_id,
      context,
      userExtras,
      customData: Object.keys(customData).length > 0 ? customData : undefined,
      testEventCode: input.test_event_code,
    }),
    ga4EventName
      ? sendGA4Event({
          eventName: ga4EventName,
          gaCookie: context.gaCookie,
          ip: context.ip,
          userAgent: context.userAgent,
          params: buildGa4Params(customData),
        })
      : Promise.resolve(),
    shouldSendGoogleAds
      ? sendGoogleAdsConversion({
          context,
          userExtras,
          conversionValue: customData.value,
          currencyCode: customData.currency,
          orderId: customData.order_id ?? input.event_id,
        })
      : Promise.resolve(),
  ])

  return NextResponse.json({ ok: true, event_id: input.event_id })
}
```

### BLOCO 5: src/app/api/track-config/route.ts

Endpoint publico cacheado expondo IDs de pixel/gtag/google ads para inicializacao no browser.

```ts
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || process.env.FB_PIXEL_ID || null
  const gtagId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || null
  const googleAdsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || null
  const googleAdsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || null

  return NextResponse.json(
    { pixelId, gtagId, googleAdsConversionId, googleAdsConversionLabel },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    },
  )
}
```

### BLOCO 5b: src/app/api/debug-payload/route.ts

Endpoint que monta o payload Meta CAPI igualzinho ao `/api/track` mas retorna como JSON em vez de enviar para o Graph API. Use para colar no Payload Helper Meta antes de subir mudancas. Por padrao liberado (so retorna PII hasheada). Para bloquear, setar `DEBUG_PAYLOAD_TOKEN` no env e enviar via header `x-debug-token`.

```ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  parseRequestContext,
  buildMetaCAPIPayload,
  type MetaStandardEvent,
  type CustomData,
} from '@/lib/tracking-server'
import { CURSO_NAME, CURSO_PRICE } from '@/lib/site'

const StandardEvents = [
  'PageView',
  'ViewContent',
  'Lead',
  'CompleteRegistration',
  'Contact',
  'InitiateCheckout',
  'AddPaymentInfo',
  'AddToCart',
  'AddToWishlist',
  'Purchase',
  'Search',
  'Schedule',
  'StartTrial',
  'SubmitApplication',
  'Subscribe',
] as const

const DebugSchema = z.object({
  event_name: z.enum(StandardEvents).default('PageView'),
  event_id: z.string().min(1).max(120).optional(),
  value: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  content_name: z.string().optional(),
  content_ids: z.array(z.string()).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  test_event_code: z.string().optional(),
})

function buildPayload(req: NextRequest, input: z.infer<typeof DebugSchema>) {
  const context = parseRequestContext(req)
  const customData: CustomData = {}
  if (input.value !== undefined) customData.value = input.value
  if (input.currency) customData.currency = input.currency
  if (input.content_name) customData.content_name = input.content_name
  if (input.content_ids) customData.content_ids = input.content_ids

  const productEvents: MetaStandardEvent[] = ['ViewContent', 'AddToCart', 'AddPaymentInfo', 'InitiateCheckout', 'Purchase']
  if (productEvents.includes(input.event_name)) {
    if (customData.value === undefined) customData.value = CURSO_PRICE
    if (!customData.currency) customData.currency = 'BRL'
    if (!customData.content_name) customData.content_name = CURSO_NAME
    if (!customData.content_ids) customData.content_ids = ['curso-linguicas-artesanais']
    if (!customData.num_items) customData.num_items = 1
    if (!customData.content_type) customData.content_type = 'product'
  }

  return buildMetaCAPIPayload({
    eventName: input.event_name,
    eventId: input.event_id ?? 'debug-' + Date.now(),
    context,
    userExtras: { email: input.email, phone: input.phone, firstName: input.name },
    customData: Object.keys(customData).length > 0 ? customData : undefined,
    testEventCode: input.test_event_code,
  })
}

/* Debug endpoint eh leitura pura, sem PII em texto nem token. Default liberado.
 * Se setar DEBUG_PAYLOAD_TOKEN no env, passa a exigir header x-debug-token. */
function authorized(req: NextRequest): boolean {
  const expected = process.env.DEBUG_PAYLOAD_TOKEN
  if (!expected) return true
  const got = req.headers.get('x-debug-token') ?? req.nextUrl.searchParams.get('debug_token')
  return got === expected
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  const sp = req.nextUrl.searchParams
  const input = DebugSchema.parse({
    event_name: sp.get('event_name') ?? 'PageView',
    event_id: sp.get('event_id') ?? undefined,
    value: sp.get('value') ? Number(sp.get('value')) : undefined,
    currency: sp.get('currency') ?? undefined,
    content_name: sp.get('content_name') ?? undefined,
    content_ids: sp.get('content_ids') ? sp.get('content_ids')!.split(',') : undefined,
    email: sp.get('email') ?? undefined,
    phone: sp.get('phone') ?? undefined,
    name: sp.get('name') ?? undefined,
    test_event_code: sp.get('test_event_code') ?? undefined,
  })
  const payload = buildPayload(req, input)
  return NextResponse.json({
    ok: true,
    instructions: 'Copie o objeto `payload` e cole no Payload Helper Meta em https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper/',
    pixel_id: process.env.NEXT_PUBLIC_FB_PIXEL_ID || process.env.FB_PIXEL_ID || null,
    payload,
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  const raw = await req.json().catch(() => ({}))
  const input = DebugSchema.parse(raw)
  const payload = buildPayload(req, input)
  return NextResponse.json({
    ok: true,
    instructions: 'Copie o objeto `payload` e cole no Payload Helper Meta em https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper/',
    pixel_id: process.env.NEXT_PUBLIC_FB_PIXEL_ID || process.env.FB_PIXEL_ID || null,
    payload,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
```

### BLOCO 6: src/app/api/checkout/route.ts

InitiateCheckout server side com forward de UTMs e injecao de external_id no parametro configurado em env.

```ts
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  parseRequestContext,
  sendMetaCAPI,
  sendGA4Event,
  sendGoogleAdsConversion,
} from '@/lib/tracking-server'
import { CheckoutPayloadSchema, type CheckoutPayload } from '@/lib/tracking-schema'

const CHECKOUT_URL = process.env.CHECKOUT_URL || ''
const EXTERNAL_ID_PARAM = process.env.CHECKOUT_EXTERNAL_ID_PARAM || 'xcod'

const DEFAULT_PRODUCT_ID = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID || 'default-product'
const DEFAULT_PRODUCT_NAME = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_NAME || 'Produto Default'
const DEFAULT_PRODUCT_PRICE = Number(process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_PRICE || 147)
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'BRL'

function appendParam(url: string, key: string, value: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}${key}=${encodeURIComponent(value)}`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!CHECKOUT_URL) {
    return NextResponse.json({ success: false, message: 'CHECKOUT_URL nao configurado' }, { status: 500 })
  }

  let input: CheckoutPayload
  try {
    const raw = await req.json()
    input = CheckoutPayloadSchema.parse(raw)
  } catch {
    return NextResponse.json({ success: false, message: 'Payload invalido' }, { status: 400 })
  }

  const context = parseRequestContext(req)
  const eventId = input.event_id ?? randomUUID()
  const value = input.value ?? DEFAULT_PRODUCT_PRICE
  const currency = input.currency ?? DEFAULT_CURRENCY
  const productId = input.product_id ?? DEFAULT_PRODUCT_ID
  const productName = input.product_name ?? DEFAULT_PRODUCT_NAME

  const userExtras = {
    email: input.email,
    phone: input.phone,
    firstName: input.name,
  }

  await Promise.allSettled([
    sendMetaCAPI({
      eventName: 'InitiateCheckout',
      eventId,
      context,
      userExtras,
      customData: {
        value,
        currency,
        content_name: productName,
        content_ids: [productId],
        content_type: 'product',
        contents: [{ id: productId, quantity: 1, item_price: value }],
        num_items: 1,
      },
      testEventCode: input.test_event_code,
    }),
    sendGA4Event({
      eventName: 'begin_checkout',
      gaCookie: context.gaCookie,
      ip: context.ip,
      userAgent: context.userAgent,
      params: {
        currency,
        value,
        items: [{ item_id: productId, item_name: productName, price: value, quantity: 1 }],
      },
    }),
    sendGoogleAdsConversion({
      context,
      userExtras,
      conversionValue: value,
      currencyCode: currency,
      orderId: eventId,
    }),
  ])

  // Monta URL final preservando params existentes e adicionando UTMs + external_id
  let url = CHECKOUT_URL
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
  utmKeys.forEach((k) => {
    const v = input[k]
    if (v) url = appendParam(url, k, v)
  })
  if (input.utm_source) {
    let src = input.utm_source
    if (input.utm_medium) src += `_${input.utm_medium}`
    if (input.utm_campaign) src += `_${input.utm_campaign}`
    url = appendParam(url, 'src', src)
  }
  if (input.fbclid) url = appendParam(url, 'fbclid', input.fbclid)
  if (context.gclid) url = appendParam(url, 'gclid', context.gclid)

  // Parametro do external_id varia por gateway (xcod Hotmart, custom_id Kiwify, external_id generico)
  url = appendParam(url, EXTERNAL_ID_PARAM, context.externalId)

  return NextResponse.json({
    success: true,
    url,
    event_id: eventId,
    external_id: context.externalId,
  })
}
```

### BLOCO 7: src/app/api/webhook/hotmart/route.ts

Webhook Hotmart Postback 2.0. Valida `HOTMART_WEBHOOK_SECRET`, recebe Purchase e dispara Purchase em Meta CAPI, Google Ads e GA4 com `event_id = order_id`.

```ts
import { NextRequest, NextResponse } from 'next/server'
import {
  sendMetaCAPI,
  sendGA4Event,
  sendGoogleAdsConversion,
  type ParsedRequestContext,
} from '@/lib/tracking-server'

const DEFAULT_PRODUCT_NAME = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_NAME || 'Produto Default'
const DEFAULT_PRODUCT_ID = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID || 'default-product'

interface HotmartBuyer {
  email?: string
  name?: string
  document?: string
  checkout_phone?: string
  phone?: string
  address?: {
    city?: string
    state?: string
    zipcode?: string
    country?: string
    address?: string
  }
}

interface HotmartPurchase {
  transaction?: string
  order_ref?: string
  status?: string
  price?: { value?: number; currency_code?: string }
  buyer?: HotmartBuyer
  tracking?: { source?: string; external_code?: string; source_sck?: string }
  approved_date?: number
}

interface HotmartProduct {
  id?: number | string
  name?: string
}

interface HotmartPayload {
  id?: string
  event?: string
  hottok?: string
  data?: {
    purchase?: HotmartPurchase
    buyer?: HotmartBuyer
    product?: HotmartProduct
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.HOTMART_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'HOTMART_WEBHOOK_SECRET nao configurado' }, { status: 500 })
  }

  let body: HotmartPayload
  try {
    body = (await req.json()) as HotmartPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalido' }, { status: 400 })
  }

  // Hotmart envia hottok em header X-Hotmart-Hottok ou no proprio payload
  const headerToken = req.headers.get('x-hotmart-hottok') ?? req.headers.get('x-hotmart-webhook-token')
  const payloadToken = body.hottok
  const provided = headerToken ?? payloadToken
  if (!provided || provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Token invalido' }, { status: 401 })
  }

  const event = body.event ?? ''
  const purchase = body.data?.purchase
  const buyer = body.data?.buyer ?? purchase?.buyer
  const product = body.data?.product

  // Processa apenas compras aprovadas
  const status = purchase?.status?.toUpperCase()
  const isApproved =
    event === 'PURCHASE_APPROVED' ||
    event === 'PURCHASE_COMPLETE' ||
    status === 'APPROVED' ||
    status === 'COMPLETE' ||
    status === 'COMPLETED'

  if (!isApproved) {
    return NextResponse.json({ ok: true, ignored: true, reason: `status=${status} event=${event}` })
  }

  const orderId = purchase?.transaction ?? purchase?.order_ref ?? body.id ?? `hotmart-${Date.now()}`
  const value = purchase?.price?.value ?? 0
  const currency = purchase?.price?.currency_code ?? 'BRL'
  const externalId = purchase?.tracking?.external_code ?? purchase?.tracking?.source_sck ?? orderId

  const productId = product?.id ? String(product.id) : DEFAULT_PRODUCT_ID
  const productName = product?.name ?? DEFAULT_PRODUCT_NAME

  // Contexto reduzido (webhook server to server, sem cookies de browser)
  const context: ParsedRequestContext = {
    externalId,
    country: (buyer?.address?.country ?? 'br').toLowerCase(),
    city: buyer?.address?.city,
    state: buyer?.address?.state,
    zip: buyer?.address?.zipcode,
    eventSourceUrl: req.headers.get('referer') ?? undefined,
  }

  const userExtras = {
    email: buyer?.email,
    phone: buyer?.checkout_phone ?? buyer?.phone,
    firstName: buyer?.name,
    city: buyer?.address?.city,
    state: buyer?.address?.state,
    zip: buyer?.address?.zipcode,
    street: buyer?.address?.address,
    country: buyer?.address?.country,
  }

  const eventTime = purchase?.approved_date ? Math.floor(purchase.approved_date / 1000) : undefined

  await Promise.allSettled([
    sendMetaCAPI({
      eventName: 'Purchase',
      eventId: orderId,
      eventTime,
      context,
      userExtras,
      actionSource: 'website',
      customData: {
        value,
        currency,
        content_name: productName,
        content_ids: [productId],
        content_type: 'product',
        contents: [{ id: productId, quantity: 1, item_price: value }],
        num_items: 1,
        order_id: orderId,
      },
    }),
    sendGA4Event({
      eventName: 'purchase',
      params: {
        transaction_id: orderId,
        currency,
        value,
        items: [{ item_id: productId, item_name: productName, price: value, quantity: 1 }],
      },
    }),
    sendGoogleAdsConversion({
      eventTime,
      context,
      userExtras,
      conversionValue: value,
      currencyCode: currency,
      orderId,
    }),
  ])

  return NextResponse.json({ ok: true, order_id: orderId })
}
```

### BLOCO 8: src/components/track-page-view.tsx

Client component que dispara PageView imediato e ViewContent apos 3s, compartilhando o mesmo `eventID` entre Pixel e CAPI.

```tsx
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    __pageViewEventId?: string
  }
}

const DEFAULT_PRODUCT_ID = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID || 'default-product'
const DEFAULT_PRODUCT_NAME = process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_NAME || 'Produto Default'
const DEFAULT_PRODUCT_PRICE = Number(process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_PRICE || 147)
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'BRL'

function uuidV4(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getTestEventCode(): string {
  try {
    const url = new URL(window.location.href)
    const fromUrl = url.searchParams.get('test_event_code')
    if (fromUrl) {
      sessionStorage.setItem('_tec', fromUrl)
      return fromUrl
    }
    return sessionStorage.getItem('_tec') ?? ''
  } catch {
    return ''
  }
}

export default function TrackPageView(): null {
  useEffect(() => {
    const eventId = uuidV4()
    window.__pageViewEventId = eventId
    const testEventCode = getTestEventCode()

    // PageView browser side, mesmo event_id que vai pro server
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView', {}, { eventID: eventId })
    }

    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event_name: 'PageView',
        event_id: eventId,
        ...(testEventCode && { test_event_code: testEventCode }),
      }),
    }).catch(() => {})

    // ViewContent disparado apos 3s para qualificar interesse real
    const viewContentId = uuidV4()
    const timer = window.setTimeout(() => {
      if (typeof window.fbq === 'function') {
        window.fbq(
          'track',
          'ViewContent',
          {
            content_ids: [DEFAULT_PRODUCT_ID],
            content_type: 'product',
            content_name: DEFAULT_PRODUCT_NAME,
            value: DEFAULT_PRODUCT_PRICE,
            currency: DEFAULT_CURRENCY,
          },
          { eventID: viewContentId },
        )
      }
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event_name: 'ViewContent',
          event_id: viewContentId,
          ...(testEventCode && { test_event_code: testEventCode }),
        }),
      }).catch(() => {})
    }, 3000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  return null
}
```

### BLOCO 9: src/app/layout.tsx (snippet root)

Snippet de layout raiz com Pixel base, gtag base e TrackPageView mountado em todas as rotas.

```tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import TrackPageView from '@/components/track-page-view'
import './globals.css'

export const metadata: Metadata = {
  title: 'App',
  description: '',
}

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const AW_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {PIXEL_ID && (
          <Script id="fb-pixel-base" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${PIXEL_ID}');
            `}
          </Script>
        )}

        {GA_ID && (
          <>
            <Script
              id="gtag-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-base" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
                ${AW_ID ? `gtag('config', '${AW_ID}');` : ''}
              `}
            </Script>
          </>
        )}

        {/* Tracker universal carregado uma vez. Roda PageView, ViewContent, auto-track de links. */}
        <Script id="track-js" src="/track.js" strategy="afterInteractive" />
      </head>
      <body>
        <TrackPageView />
        {children}
      </body>
    </html>
  )
}
```

### BLOCO 10: public/track.js

Tracking universal para HTMLs estaticas. Carrega o bundle oficial Meta `meta-capi-param-builder-clientjs` via unpkg e chama `processAndCollectAllParams`. Mantem o nosso `_eid`. Inicializa o Pixel base lendo o ID em `/api/track-config`. Auto track em links pay.hotmart.com e em wa.me/whatsapp/mailto/tel. Le `?test_event_code=` e persiste em `sessionStorage`. Expoe `window.trackEvent(name, data, opts)`, `window.trackInitiateCheckout()`, `window.trackContact()`.

```js
/* eslint-disable */
/* Tracking universal usando o SDK oficial Meta meta-capi-param-builder-clientjs.
 * Carrega bundle via CDN, processa fbclid/fbc/fbp e expoe window.trackEvent.
 * Dedupe Pixel x CAPI via mesmo event_id. */
(function () {
  if (window.__trackInit) return
  window.__trackInit = true

  var CURSO = {
    id: 'curso-linguicas-artesanais',
    name: 'Curso de Linguiças Artesanais Frescas e Defumadas',
    price: 147,
    currency: 'BRL',
  }
  var ONE_YEAR = 60 * 60 * 24 * 365

  function uuidV4() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0
      var v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return m ? decodeURIComponent(m[1]) : ''
  }

  function setCookie(name, value, maxAgeSec) {
    var s = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAgeSec + '; SameSite=Lax'
    if (location.protocol === 'https:') s += '; Secure'
    document.cookie = s
  }

  function getQueryParam(name) {
    try {
      var u = new URL(window.location.href)
      return u.searchParams.get(name) || ''
    } catch (e) {
      return ''
    }
  }

  /* External ID estavel (cookie nosso, nao parte do SDK) */
  if (!getCookie('_eid')) setCookie('_eid', uuidV4(), ONE_YEAR)

  /* Carrega o bundle oficial Meta. Quando carregar, processa fbc/fbp via SDK. */
  var sdkPromise = new Promise(function (resolve) {
    var s = document.createElement('script')
    s.src = 'https://unpkg.com/meta-capi-param-builder-clientjs/dist/clientParamBuilder.bundle.js'
    s.async = true
    s.onload = function () {
      try {
        if (window.clientParamBuilder && typeof window.clientParamBuilder.processAndCollectAllParams === 'function') {
          /* Sem getIpFn por padrao para evitar fetch para servico externo de IP */
          var p = window.clientParamBuilder.processAndCollectAllParams(window.location.href)
          if (p && typeof p.then === 'function') {
            p.then(function () { resolve(true) }).catch(function () { resolve(false) })
          } else {
            resolve(true)
          }
        } else {
          resolve(false)
        }
      } catch (e) {
        console.warn('[track] SDK Meta erro:', e)
        resolve(false)
      }
    }
    s.onerror = function () {
      console.warn('[track] Falha ao carregar SDK Meta — usando fallback manual')
      /* Fallback manual caso CDN falhe */
      var NINETY_DAYS = 60 * 60 * 24 * 90
      if (!getCookie('_fbp')) {
        setCookie('_fbp', 'fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 2147483647), NINETY_DAYS)
      }
      var fbclid = getQueryParam('fbclid')
      if (fbclid && !getCookie('_fbc')) {
        setCookie('_fbc', 'fb.1.' + Date.now() + '.' + fbclid, NINETY_DAYS)
      }
      resolve(false)
    }
    document.head.appendChild(s)
  })

  /* Snippet base Pixel — fbq queue ate inicializar via /api/track-config */
  ;(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

  fetch('/api/track-config', { credentials: 'same-origin' })
    .then(function (r) { return r.json() })
    .then(function (cfg) {
      if (cfg && cfg.pixelId && typeof window.fbq === 'function') {
        window.fbq('init', cfg.pixelId)
      }
    })
    .catch(function () {})

  function getTestEventCode() {
    var fromUrl = getQueryParam('test_event_code')
    try {
      if (fromUrl) {
        sessionStorage.setItem('_tec', fromUrl)
        return fromUrl
      }
      return sessionStorage.getItem('_tec') || ''
    } catch (e) {
      return fromUrl || ''
    }
  }
  var TEST_EVENT_CODE = getTestEventCode()

  function postCAPI(payload) {
    try {
      var body = JSON.stringify(payload)
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/json' })
        if (navigator.sendBeacon('/api/track', blob)) return
      }
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
      }).catch(function () {})
    } catch (e) {}
  }

  function fbqTrack(eventName, params, eventId) {
    if (typeof window.fbq !== 'function') return
    try {
      window.fbq('track', eventName, params || {}, { eventID: eventId })
    } catch (e) {}
  }

  function trackEvent(eventName, data, opts) {
    opts = opts || {}
    var eventId = opts.eventId || uuidV4()
    var params = data || {}

    fbqTrack(eventName, params, eventId)

    var payload = { event_name: eventName, event_id: eventId }
    if (params.value !== undefined) payload.value = params.value
    if (params.currency) payload.currency = params.currency
    if (params.content_name) payload.content_name = params.content_name
    if (params.content_ids) payload.content_ids = params.content_ids
    if (params.content_type) payload.content_type = params.content_type
    if (params.num_items) payload.num_items = params.num_items
    if (params.search_string) payload.search_string = params.search_string
    if (opts.email) payload.email = opts.email
    if (opts.phone) payload.phone = opts.phone
    if (opts.name) payload.name = opts.name
    if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE

    postCAPI(payload)
    return eventId
  }

  window.trackEvent = trackEvent
  window.__curso = CURSO

  function fireAutoEvents() {
    /* Aguarda SDK Meta carregar antes de disparar para garantir fbc/fbp corretos */
    sdkPromise.finally(function () {
      trackEvent('PageView', {})
      setTimeout(function () {
        trackEvent('ViewContent', {
          content_ids: [CURSO.id],
          content_type: 'product',
          content_name: CURSO.name,
          value: CURSO.price,
          currency: CURSO.currency,
        })
      }, 2500)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fireAutoEvents, { once: true })
  } else {
    fireAutoEvents()
  }

  window.trackInitiateCheckout = function (extra) {
    return trackEvent(
      'InitiateCheckout',
      {
        content_ids: [CURSO.id],
        content_type: 'product',
        content_name: CURSO.name,
        num_items: 1,
        value: CURSO.price,
        currency: CURSO.currency,
      },
      extra || {},
    )
  }

  window.trackContact = function (extra) {
    return trackEvent('Contact', {}, extra || {})
  }

  /* Eventos via data-track-event no markup */
  document.addEventListener(
    'click',
    function (ev) {
      var el = ev.target && (ev.target.closest ? ev.target.closest('[data-track-event]') : null)
      if (!el) return
      var name = el.getAttribute('data-track-event')
      if (!name) return
      var raw = el.getAttribute('data-track-data')
      var data = {}
      if (raw) { try { data = JSON.parse(raw) } catch (e) {} }
      trackEvent(name, data)
    },
    true,
  )

  /* Auto track InitiateCheckout em links pay.hotmart.com (pula se a pagina ja tem goToCheckout) */
  document.addEventListener(
    'click',
    function (ev) {
      var a = ev.target && (ev.target.closest ? ev.target.closest('a[href*="pay.hotmart.com"]') : null)
      if (!a) return
      if (typeof window.goToCheckout === 'function') return
      if (a.hasAttribute('onclick') && /goToCheckout/i.test(a.getAttribute('onclick') || '')) return
      if (a.dataset && a.dataset.trackedCheckout === '1') return
      try { a.dataset.trackedCheckout = '1' } catch (e) {}
      window.trackInitiateCheckout()
    },
    true,
  )

  /* Auto track Contact em wa.me / whatsapp / mailto / tel */
  document.addEventListener(
    'click',
    function (ev) {
      var a = ev.target && (ev.target.closest ? ev.target.closest('a[href]') : null)
      if (!a) return
      var href = a.getAttribute('href') || ''
      if (!/^(https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)|mailto:|tel:)/i.test(href)) return
      if (a.dataset && a.dataset.trackedContact === '1') return
      try { a.dataset.trackedContact = '1' } catch (e) {}
      window.trackContact()
    },
    true,
  )
})()
```

### BLOCO 11: src/lib/tracking-schema.ts

Schemas Zod compartilhados entre `/api/track` e `/api/checkout` para validacao consistente de payloads.

```ts
import { z } from 'zod'

export const StandardEventEnum = z.enum([
  'PageView',
  'ViewContent',
  'Lead',
  'CompleteRegistration',
  'Contact',
  'InitiateCheckout',
  'AddPaymentInfo',
  'AddToCart',
  'AddToWishlist',
  'Purchase',
  'Search',
  'Schedule',
  'StartTrial',
  'SubmitApplication',
  'Subscribe',
])

export const UserFieldsSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(8).max(20).optional(),
  name: z.string().max(120).optional(),
  last_name: z.string().max(120).optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  zip: z.string().max(16).optional(),
  country: z.string().max(4).optional(),
})

export const TrackPayloadSchema = UserFieldsSchema.extend({
  event_name: StandardEventEnum,
  event_id: z.string().min(1).max(120),
  value: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  content_name: z.string().max(200).optional(),
  content_ids: z.array(z.string()).optional(),
  content_type: z.string().optional(),
  num_items: z.number().int().positive().optional(),
  search_string: z.string().max(200).optional(),
  order_id: z.string().max(120).optional(),
  test_event_code: z.string().max(40).optional(),
})

export type TrackPayload = z.infer<typeof TrackPayloadSchema>

export const CheckoutPayloadSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  fbclid: z.string().optional(),
  gclid: z.string().optional(),
  event_id: z.string().min(1).max(120).optional(),
  value: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  product_id: z.string().max(120).optional(),
  product_name: z.string().max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  test_event_code: z.string().optional(),
})

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>
```

### BLOCO 12: package.json (deps minimas)

Dependencias minimas para o sistema de tracking. Next 15.x, Zod e o SDK oficial Meta cobrem todo o server side. GA4 e Google Ads usam fetch nativo + OAuth2 refresh-token. No client, o bundle `meta-capi-param-builder-clientjs` eh carregado via CDN dentro do `track.js`, nao precisa entrar no package.json.

```json
{
  "name": "app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "capi-param-builder-nodejs": "^1.2.1",
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/node": "22.10.2",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "typescript": "5.7.2"
  },
  "packageManager": "pnpm@9.15.0"
}
```
