type EmptyStateProps = {
  title: string;
  body: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="card-surface flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        <p className="max-w-xl text-sm text-ink-600">{body}</p>
      </div>
      {action}
    </div>
  );
}
