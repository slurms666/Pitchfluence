import { AccessForm } from "@/components/access-form";

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === "string" ? params.redirectTo : "/";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card-surface relative overflow-hidden px-8 py-10 lg:px-10 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,161,132,0.16),transparent_40%)]" />
          <div className="relative space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                Pitchfluence MVP
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-ink-900">
                A friendly outreach workspace for small teams and solo operators.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink-600">
                Score creators honestly, shortlist them into a simple pipeline, generate outreach copy without paid AI, and keep deals moving with notes, activities, and reminders.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Multiple business profiles in one workspace",
                "Demo creator library plus manual creator entry",
                "Transparent rules-based fit scoring",
                "Built-in outreach templates for email and DMs",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-sm text-ink-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card-surface px-8 py-10 lg:px-10 lg:py-12">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Protected Preview</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Enter the shared passcode</h2>
            <p className="text-sm leading-6 text-ink-600">
              This v1 build skips user accounts. The passcode gate is there to keep a public test deployment lightly protected.
            </p>
          </div>

          <div className="mt-8">
            <AccessForm redirectTo={redirectTo} />
          </div>
        </section>
      </div>
    </main>
  );
}
