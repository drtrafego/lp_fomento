import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

// Botão de CTA compartilhado por todas as versões da LP Dunas.
// Cores 100% via CSS vars do tema aplicado no container raiz.
export function CtaButton({
  onClick,
  children,
  size = "lg",
}: {
  onClick: () => void;
  children: ReactNode;
  size?: "lg" | "md";
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold font-sans-dunas shimmer-btn active:scale-[0.97] transition-transform ${
        size === "lg" ? "text-lg px-9 py-4" : "text-base px-7 py-3.5"
      }`}
      style={{
        background: "var(--gradient-cta)",
        color: "var(--color-text-inverse)",
        boxShadow: "0 10px 40px -10px var(--color-gold)",
      }}
    >
      {children}
      <ArrowRight size={size === "lg" ? 20 : 18} />
    </button>
  );
}
