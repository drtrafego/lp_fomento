import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

import { useMetaPixel } from "@/hooks/useMetaPixel";

const LEAD_KEY = "lpf_lead";

interface StoredLead {
  name: string;
  email: string;
  whatsapp: string;
}

function readStoredLead(): StoredLead {
  try {
    const raw = localStorage.getItem(LEAD_KEY);
    if (!raw) return { name: "", email: "", whatsapp: "" };
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      whatsapp: typeof parsed.whatsapp === "string" ? parsed.whatsapp : "",
    };
  } catch {
    return { name: "", email: "", whatsapp: "" };
  }
}

interface CheckoutLeadModalProps {
  open: boolean;
  onClose: () => void;
  checkoutUrl: string;
  contentName?: string;
  value?: number;
  currency?: string;
}

// Modal de captura (nome, email, WhatsApp) exibido ANTES de abrir o checkout.
// Captura PII e dispara InitiateCheckout com first_name/email/phone para elevar
// o EMQ no Meta. Sem isso o evento sairia sem dado nenhum da pessoa.
export default function CheckoutLeadModal({
  open,
  onClose,
  checkoutUrl,
  contentName,
  value,
  currency,
}: CheckoutLeadModalProps) {
  const { trackInitiateCheckout } = useMetaPixel();

  const [lead, setLead] = useState<StoredLead>({ name: "", email: "", whatsapp: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLead(readStoredLead());
    setErrors({});
    const t = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errs: Record<string, string> = {};
      if (lead.name.trim().length < 2) errs.name = "Informe seu nome";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) errs.email = "Informe um email válido";
      if (lead.whatsapp.replace(/\D/g, "").length < 10) errs.whatsapp = "Informe um WhatsApp válido";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      const clean: StoredLead = {
        name: lead.name.trim(),
        email: lead.email.trim(),
        whatsapp: lead.whatsapp.trim(),
      };

      try {
        localStorage.setItem(LEAD_KEY, JSON.stringify(clean));
      } catch {}

      trackInitiateCheckout(
        {
          content_name: contentName || "Workshop",
          value: value ?? 37,
          currency: currency || "BRL",
        },
        { first_name: clean.name, email: clean.email, phone: clean.whatsapp }
      );

      window.open(checkoutUrl, "_blank");
      onClose();
    },
    [lead, contentName, value, currency, checkoutUrl, trackInitiateCheckout, onClose]
  );

  if (!open) return null;

  const fields = [
    { key: "name", label: "Seu nome", type: "text", placeholder: "Como podemos te chamar?", autoComplete: "name" },
    { key: "email", label: "Seu melhor email", type: "email", placeholder: "voce@email.com", autoComplete: "email" },
    { key: "whatsapp", label: "Seu WhatsApp", type: "tel", placeholder: "(00) 00000-0000", autoComplete: "tel" },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-lead-title"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-default"
      />

      <div className="relative w-full max-w-md rounded-2xl bg-[#0a1628] border border-[#d4a853]/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-7">
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 mb-6 pr-6">
          <h2
            id="checkout-lead-title"
            className="text-2xl sm:text-[1.7rem] font-extrabold leading-tight text-white"
          >
            Falta pouco para <span className="text-[#d4a853]">garantir sua vaga</span>
          </h2>
          <p className="text-sm text-white/65">
            Preencha seus dados para liberar o seu ingresso e continuar para o pagamento.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {fields.map((f, i) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label htmlFor={`clm-${f.key}`} className="text-xs font-semibold text-white/70">
                {f.label}
              </label>
              <input
                ref={i === 0 ? firstInputRef : undefined}
                id={`clm-${f.key}`}
                type={f.type}
                autoComplete={f.autoComplete}
                value={lead[f.key]}
                onChange={(e) => setLead((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                aria-invalid={!!errors[f.key]}
                className="rounded-xl px-4 py-3 text-[0.95rem] bg-white/[0.04] text-white placeholder:text-white/30 outline-none border transition-colors focus:border-[#d4a853]"
                style={{ borderColor: errors[f.key] ? "#ef4444" : "rgba(255,255,255,0.12)" }}
              />
              {errors[f.key] && <span className="text-xs text-red-400">{errors[f.key]}</span>}
            </div>
          ))}

          <button
            type="submit"
            className="mt-1 rounded-xl font-bold text-lg px-8 py-4 bg-[#d4a853] text-[#0a1628] shimmer-btn active:scale-[0.97] transition-transform"
          >
            Continuar para o pagamento
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-white/40">
            <ShieldCheck size={13} /> Seus dados estão seguros e não serão compartilhados.
          </p>
        </form>
      </div>
    </div>
  );
}
