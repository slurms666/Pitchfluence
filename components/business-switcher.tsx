"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { setSelectedBusinessAction } from "@/app/actions";

type BusinessSwitcherProps = {
  businesses: Array<{
    id: string;
    name: string;
  }>;
  selectedBusinessId?: string | null;
};

export function BusinessSwitcher({ businesses, selectedBusinessId }: BusinessSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.size ? `${pathname}?${searchParams.toString()}` : pathname;

  if (!businesses.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-3 text-sm text-ink-500">
        Create a business profile to unlock scoring.
      </div>
    );
  }

  return (
    <form action={setSelectedBusinessAction} className="flex min-w-[260px] items-center gap-3">
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <select
        className="select min-w-[280px] rounded-[20px] border-white/70 bg-white/90"
        defaultValue={selectedBusinessId ?? businesses[0]?.id}
        name="businessProfileId"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {businesses.map((business) => (
          <option key={business.id} value={business.id}>
            {business.name}
          </option>
        ))}
      </select>
    </form>
  );
}
