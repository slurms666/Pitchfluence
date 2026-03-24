"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({ label, pendingLabel, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={className ?? "button-primary"} disabled={pending} type="submit">
      {pending ? pendingLabel ?? "Working..." : label}
    </button>
  );
}
