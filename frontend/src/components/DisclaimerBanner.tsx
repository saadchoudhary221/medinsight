import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="sticky bottom-4 mt-8 rounded-2xl border border-[--color-hairline] bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
      <div className="flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-[--color-ink-soft]" />
        <p className="text-sm text-[--color-ink-soft]">
          <span className="font-medium text-[--color-ink]">Strictly informational — not a medical diagnosis.</span>{" "}
          MedInsight does not replace professional healthcare advice. Discuss any findings with a qualified clinician.
        </p>
      </div>
    </div>
  );
}
