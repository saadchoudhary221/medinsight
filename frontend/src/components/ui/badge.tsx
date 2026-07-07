import { cn } from "@/lib/utils";

type Status = "normal" | "borderline" | "attention" | "processing" | "completed" | "failed";

const STYLES: Record<Status, string> = {
  normal: "text-[--color-status-normal] bg-[--color-status-normal-bg]",
  completed: "text-[--color-status-normal] bg-[--color-status-normal-bg]",
  borderline: "text-[--color-status-borderline] bg-[--color-status-borderline-bg]",
  processing: "text-[--color-status-borderline] bg-[--color-status-borderline-bg]",
  attention: "text-[--color-status-attention] bg-[--color-status-attention-bg]",
  failed: "text-[--color-status-attention] bg-[--color-status-attention-bg]",
};

const LABELS: Record<Status, string> = {
  normal: "Normal",
  completed: "Completed",
  borderline: "Borderline",
  processing: "Processing",
  attention: "Attention needed",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: string }) {
  const key = (status in STYLES ? status : "processing") as Status;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", STYLES[key])}>
      {LABELS[key]}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[--color-hairline]/60", className)} />;
}
