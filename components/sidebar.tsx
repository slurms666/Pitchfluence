"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions";
import { APP_NAME, dashboardLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[288px] shrink-0 flex-col border-r border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,251,255,0.82))] px-5 py-6 backdrop-blur-xl lg:flex">
      <div className="mb-9">
        <Link className="inline-flex items-center gap-3.5" href="/">
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-ink-900 via-ink-900 to-ink-700 font-mono text-sm font-semibold tracking-[0.18em] text-white shadow-soft">
            PF
          </div>
          <div>
            <p className="font-display text-[1.2rem] font-semibold tracking-[-0.04em] text-ink-900">{APP_NAME}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">Influencer outreach copilot</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1.5">
        {dashboardLinks.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              className={cn(
                "flex items-center rounded-[20px] px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-gradient-to-br from-ink-900 via-ink-900 to-ink-700 text-white shadow-soft"
                  : "text-ink-600 hover:bg-white/90 hover:text-ink-900",
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(249,251,253,0.9),rgba(243,247,250,0.85))] p-5 shadow-soft">
        <p className="font-display text-lg font-semibold text-ink-900">Access Gate</p>
        <p className="mt-1 text-sm leading-6 text-ink-600">
          Protected by a shared passcode so you can demo the app without full auth in v1.
        </p>
        <form action={logoutAction} className="mt-4">
          <button className="button-secondary w-full" type="submit">
            Lock workspace
          </button>
        </form>
      </div>
    </aside>
  );
}
