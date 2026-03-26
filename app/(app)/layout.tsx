import { BusinessSwitcher } from "@/components/business-switcher";
import { Sidebar } from "@/components/sidebar";
import { assertWorkspaceAccess } from "@/lib/auth";
import { getSelectedBusinessContext } from "@/lib/business";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await assertWorkspaceAccess();
  const { businesses, selectedBusiness } = await getSelectedBusinessContext();

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
        <header className="sticky top-0 z-20 border-b border-white/80 bg-white/70 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-500">Single-user workspace</p>
              <p className="mt-1 text-sm leading-6 text-ink-600">
                Switch the active business profile to score creators and view the right pipeline.
              </p>
            </div>
            <BusinessSwitcher
              businesses={businesses.map((business) => ({ id: business.id, name: business.name }))}
              selectedBusinessId={selectedBusiness?.id}
            />
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
