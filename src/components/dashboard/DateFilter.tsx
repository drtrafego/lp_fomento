import { useState } from "react";

export type DateRange = "today" | "7d" | "30d" | "all";

const OPTIONS: { id: DateRange; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "all", label: "Tudo" },
];

export function getDateFrom(range: DateRange): string | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "today") {
    now.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    now.setDate(now.getDate() - 7);
  } else if (range === "30d") {
    now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

interface Props {
  value: DateRange;
  onChange: (v: DateRange) => void;
}

export default function DateFilter({ value, onChange }: Props) {
  return (
    <div className="flex rounded-lg border border-[#1a2d4a] overflow-hidden">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            value === opt.id
              ? "bg-[#d4a853] text-[#0a1628]"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
