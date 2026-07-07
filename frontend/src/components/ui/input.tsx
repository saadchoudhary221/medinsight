import { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-[--color-hairline] bg-white px-3.5 text-sm text-[--color-ink] placeholder:text-[--color-ink-soft]/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ink]/20 focus-visible:border-[--color-ink]",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-32 w-full rounded-lg border border-[--color-hairline] bg-white px-3.5 py-3 text-sm text-[--color-ink] placeholder:text-[--color-ink-soft]/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ink]/20 focus-visible:border-[--color-ink]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-[--color-ink] mb-1.5 block", className)} {...props} />;
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-sm text-red-700 mt-1.5">{children}</p>;
}
