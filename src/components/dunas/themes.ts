// Sistema de temas da LP Dunas. Cada tema é um conjunto de CSS custom properties
// aplicado no container raiz de cada versão via style inline. As seções consomem
// essas variáveis (var(--color-...)) e nunca cores hardcoded, então a mesma seção
// renderiza em qualquer paleta.
//
// As chaves replicam os tokens globais definidos em src/index.css. Ao aplicar um
// tema no container, ele sobrescreve os globais apenas no escopo daquela página.

import type { CSSProperties } from "react";

export type DunasTheme = CSSProperties & Record<`--${string}`, string>;

// ─── Tema A · Capital em Fluxo (paleta atual de /dunas) ───
export const dunasThemeA: DunasTheme = {
  "--color-void": "#060d1a",
  "--color-deep": "#0a1628",
  "--color-surface-1": "#0f1f3d",
  "--color-surface-2": "#162847",
  "--color-surface-3": "#1e3358",

  "--color-gold-dim": "#8a6830",
  "--color-gold-muted": "#b88a3f",
  "--color-gold": "#d4a853",
  "--color-gold-bright": "#e8c070",
  "--color-gold-light": "#f5d98a",
  "--color-gold-halo": "#d4a85318",

  "--color-text-primary": "#f0e6d0",
  "--color-text-secondary": "#a89880",
  "--color-text-muted": "#6b7280",
  "--color-text-inverse": "#060d1a",

  "--color-accent": "#2dd4bf",
  "--color-line": "#d4a85333",
  "--color-line-soft": "#d4a85326",

  "--gradient-flow": "linear-gradient(135deg, #d4a853 0%, #e8c070 40%, #d4a853 70%, #b88a3f 100%)",
  "--gradient-hero-bg": "radial-gradient(ellipse 80% 60% at 50% 0%, #162847 0%, #060d1a 70%)",
  "--gradient-surface": "linear-gradient(180deg, #162847 0%, #0f1f3d 100%)",
  "--gradient-cta": "linear-gradient(135deg, #d4a853 0%, #f5d98a 50%, #d4a853 100%)",
  "--gradient-glow-h": "radial-gradient(ellipse 40% 30% at 50% 50%, #d4a85340 0%, transparent 70%)",
};

// ─── Tema B · Private Banking (pretos profundos + ouro champagne discreto) ───
export const dunasThemeB: DunasTheme = {
  "--color-void": "#000000",
  "--color-deep": "#070707",
  "--color-surface-1": "#101010",
  "--color-surface-2": "#161616",
  "--color-surface-3": "#1f1d18",

  "--color-gold-dim": "#7a6c4a",
  "--color-gold-muted": "#a8966a",
  "--color-gold": "#c9b78d",
  "--color-gold-bright": "#dccaa0",
  "--color-gold-light": "#ece0c4",
  "--color-gold-halo": "#c9b78d18",

  "--color-text-primary": "#f4f0e8",
  "--color-text-secondary": "#9c958a",
  "--color-text-muted": "#5e5a52",
  "--color-text-inverse": "#070707",

  "--color-accent": "#c9b78d",
  "--color-line": "#c9b78d2e",
  "--color-line-soft": "#c9b78d24",

  "--gradient-flow": "linear-gradient(135deg, #c9b78d 0%, #dccaa0 50%, #a8966a 100%)",
  "--gradient-hero-bg": "radial-gradient(ellipse 80% 60% at 50% 0%, #1a1814 0%, #000000 72%)",
  "--gradient-surface": "linear-gradient(180deg, #101010 0%, #070707 100%)",
  "--gradient-cta": "linear-gradient(135deg, #c9b78d 0%, #ece0c4 50%, #c9b78d 100%)",
  "--gradient-glow-h": "radial-gradient(ellipse 40% 30% at 50% 50%, #c9b78d33 0%, transparent 70%)",
};

// ─── Tema C · Prova e Números (base grafite de fintech + dourado, teal só como dado) ───
export const dunasThemeC: DunasTheme = {
  "--color-void": "#070b12",
  "--color-deep": "#0a1018",
  "--color-surface-1": "#101824",
  "--color-surface-2": "#15202f",
  "--color-surface-3": "#1c2a3c",

  "--color-gold-dim": "#8a6830",
  "--color-gold-muted": "#b88a3f",
  "--color-gold": "#d4a853",
  "--color-gold-bright": "#e8c070",
  "--color-gold-light": "#f5d98a",
  "--color-gold-halo": "#d4a85318",

  "--color-text-primary": "#eef3f8",
  "--color-text-secondary": "#94a3b5",
  "--color-text-muted": "#5b6b80",
  "--color-text-inverse": "#070b12",

  "--color-accent": "#2dd4bf",
  "--color-line": "#2dd4bf2b",
  "--color-line-soft": "#2dd4bf1f",

  "--gradient-flow": "linear-gradient(135deg, #2dd4bf 0%, #d4a853 60%, #b88a3f 100%)",
  "--gradient-hero-bg": "radial-gradient(ellipse 80% 60% at 50% 0%, #15202f 0%, #070b12 72%)",
  "--gradient-surface": "linear-gradient(180deg, #101824 0%, #0a1018 100%)",
  "--gradient-cta": "linear-gradient(135deg, #d4a853 0%, #f5d98a 50%, #d4a853 100%)",
  "--gradient-glow-h": "radial-gradient(ellipse 40% 30% at 50% 50%, #d4a85333 0%, transparent 70%)",
};

// ─── Tema D · Mecanismo Legal (azul institucional + dourado) ───
export const dunasThemeD: DunasTheme = {
  "--color-void": "#040a16",
  "--color-deep": "#08152b",
  "--color-surface-1": "#0d2148",
  "--color-surface-2": "#122a5c",
  "--color-surface-3": "#1a386f",

  "--color-gold-dim": "#8a6830",
  "--color-gold-muted": "#b88a3f",
  "--color-gold": "#d4a853",
  "--color-gold-bright": "#e8c070",
  "--color-gold-light": "#f5d98a",
  "--color-gold-halo": "#d4a85318",

  "--color-text-primary": "#eef2f9",
  "--color-text-secondary": "#9aa8c2",
  "--color-text-muted": "#5d6b85",
  "--color-text-inverse": "#040a16",

  "--color-accent": "#5b8def",
  "--color-line": "#5b8def33",
  "--color-line-soft": "#5b8def26",

  "--gradient-flow": "linear-gradient(135deg, #5b8def 0%, #d4a853 70%, #b88a3f 100%)",
  "--gradient-hero-bg": "radial-gradient(ellipse 80% 60% at 50% 0%, #122a5c 0%, #040a16 72%)",
  "--gradient-surface": "linear-gradient(180deg, #0d2148 0%, #08152b 100%)",
  "--gradient-cta": "linear-gradient(135deg, #d4a853 0%, #f5d98a 50%, #d4a853 100%)",
  "--gradient-glow-h": "radial-gradient(ellipse 40% 30% at 50% 50%, #5b8def33 0%, transparent 70%)",
};
