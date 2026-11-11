import { site } from "@/lib/content";

export function Footer() {
  const f = site.footer;
  return (
    <footer className="border-t border-white/10 px-5 py-12 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-lg tracking-[0.24em]">{f.company.toUpperCase()}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">{site.meta.tagline}</p>
        </div>
        <dl className="grid gap-2 text-sm text-muted">
          <div className="flex gap-2">
            <dt className="text-white/50">Address</dt>
            <dd>{f.address}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-white/50">Email</dt>
            <dd>{f.email}</dd>
          </div>
        </dl>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-white/40">{f.legal}</p>
    </footer>
  );
}
