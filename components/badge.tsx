import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "brand" | "warn" | "success";
};

const toneMap: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-ink-200 bg-ink-50 text-ink-700",
  brand: "border-brand-200 bg-brand-50 text-brand-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return <span className={cn("badge", toneMap[tone])}>{children}</span>;
}
