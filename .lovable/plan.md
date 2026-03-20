

## Geolocalização + Pin no Mapa + Copy Personalizada por Estado

### Objetivo

Detectar a localização do visitante via API de geolocalização do navegador, colocar um **pino animado** no mapa do Brasil na posição do estado detectado, e exibir uma mensagem personalizada tipo:

> "Você está no **Maranhão** e pode ter **VERBA LIBERADA** para sua ideia ou negócio!"

Se o estado tiver uma fundação de amparo (FAP) conhecida, mencionar também (ex: FAPEMA no Maranhão).

### Implementação

**1. Copiar logo FAPEMA**
- `user-uploads://fapema.png` → `src/assets/logos/fapema.png`
- Adicionar "FAPEMA" ao array `orgaos`

**2. Hook `useUserLocation` (inline em Index.tsx)**
- Usa `navigator.geolocation.getCurrentPosition()` para obter lat/lng
- Mapeia coordenadas para estado brasileiro usando ranges simples de lat/lng (tabela de bounding boxes dos 27 estados)
- Retorna: `{ estado: string | null, sigla: string | null, loading: boolean }`
- Fallback: se o usuário negar permissão, usa API gratuita de IP (ex: `https://ipapi.co/json/`) para estimar o estado

**3. Mapeamento estado → posição no mapa**
- Tabela com coordenadas relativas (%) de cada estado no mapa SVG/imagem do Brasil
- Ex: Maranhão → `{ top: "25%", left: "55%" }`, São Paulo → `{ top: "68%", left: "48%" }`

**4. Pin animado sobre o mapa**
- Div posicionada absolutamente sobre a imagem do mapa, na posição do estado detectado
- Ícone de pin dourado (SVG inline) com animação `bounce` + `pulse-glow`
- Tooltip/label: "📍 Você está aqui"

**5. Copy personalizada abaixo do mapa**
- Mensagem dinâmica: "Você está no **{Estado}** e pode ter **VERBA LIBERADA** para sua ideia ou negócio!"
- Se estado tem FAP conhecida, adiciona: "O(a) **{FAP}** disponibiliza programas para empresas da sua região."
- Animação fade-in quando a localização é detectada
- Se não conseguir detectar: fallback genérico "Existem programas disponíveis para **todo o Brasil**"

**6. Tabela estado → FAP**
- MA → FAPEMA, SP → FAPESP, RJ → FAPERJ, MG → FAPEMIG, SC → FAPESC, etc.

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Hook de geolocalização, pin no mapa, copy dinâmica, import FAPEMA |
| `src/assets/logos/fapema.png` | Logo copiado |

### Fluxo do usuário

1. Página carrega → pede permissão de localização (ou usa IP como fallback)
2. Detecta estado → pin aparece no mapa com animação bounce
3. Abaixo do mapa, copy personalizada surge com fade-in
4. Se falhar tudo → mensagem genérica sem pin

