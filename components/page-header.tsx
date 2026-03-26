type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {eyebrow ? <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-700">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="font-display text-[clamp(2rem,2.8vw,3.35rem)] font-semibold leading-none text-ink-900">{title}</h1>
          {description ? <p className="max-w-3xl text-[15px] leading-7 text-ink-600">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
