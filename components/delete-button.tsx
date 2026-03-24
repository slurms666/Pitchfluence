"use client";

type DeleteButtonProps = {
  label: string;
  confirmText?: string;
  className?: string;
};

export function DeleteButton({ label, confirmText, className }: DeleteButtonProps) {
  return (
    <button
      className={className ?? "button-secondary"}
      formAction={undefined}
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmText ?? "Are you sure?")) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
