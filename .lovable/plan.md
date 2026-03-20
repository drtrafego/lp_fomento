

## Adicionar Copy Personalizada por Estado (via IP, sem permissão)

### Abordagem

Usar a API gratuita `https://ipapi.co/json/` (não requer permissão do navegador) para detectar o estado do visitante pelo IP. Substituir a copy estática "Sua empresa pode estar a um passo de captar de R$ 39 mil a R$ 400 mil" por uma versão dinâmica citando o estado.

### Exemplo de resultado

> "Sua empresa no **Maranhão** pode estar a um passo de captar de R$ 39 mil a R$ 400 mil"

Se falhar, mantém a copy genérica atual.

### Implementação em `src/pages/Index.tsx`

1. **Hook inline `useUserState`**: Faz fetch para `https://ipapi.co/json/` no mount, extrai `region` (nome do estado). Retorna `{ estado: string | null }`
2. **Atualizar a copy** na linha 753-755: Se `estado` detectado, renderiza "Sua empresa **no {estado}**..." senão mantém texto atual
3. Animação fade-in quando o estado é detectado

### Detalhes técnicos

- `ipapi.co/json/` retorna `{ region: "São Paulo", country_name: "Brazil", ... }` — campo `region` é o estado
- Fallback: se não Brasil ou erro, copy genérica
- Sem necessidade de permissão do navegador

