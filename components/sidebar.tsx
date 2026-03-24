"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions";
import { APP_NAME, dashboardLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/70 bg-white/80 px-5 py-6 backdrop-blur lg:flex">
      <div className="mb-8">
        <Link className="inline-flex items-center gap-3" href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-sm font-bold text-white">
            PF
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink-900">{APP_NAME}</p>
            <p className="text-xs text-ink-500">Influencer outreach copilot</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1">
        {dashboardLinks.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              className={cn(
                "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-ink-900 text-white shadow-soft"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-ink-100 bg-ink-50 p-4">
        <p className="text-sm font-semibold text-ink-900">Access Gate</p>
        <p className="mt-1 text-sm text-ink-600">
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
