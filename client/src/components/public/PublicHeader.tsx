import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type PublicHeaderProps = {
  slug: string;
  businessName: string;
  brandImageUrl?: string | null;
  backHref: string;
  backLabel: string;
};

export function PublicHeader({
  slug,
  businessName,
  brandImageUrl,
  backHref,
  backLabel,
}: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[#e3ddd1] bg-[#fbfaf6]/95 backdrop-blur-md lg:h-[70px]">
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 lg:px-10">
        {/* Izquierda — volver */}
        <Link href={backHref}>
          <span className="flex items-center gap-2 text-sm font-medium text-[#6a716f] transition hover:text-[#12383d]">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </span>
        </Link>

        {/* Centro — marca */}
        <Link href={`/${slug}`}>
          <span className="flex min-w-0 items-center justify-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[#d8d1c4] bg-[#fffdf8]/85 text-sm font-bold text-[#12383d] shadow-[0_8px_20px_rgba(25,31,28,0.08)]">
              {brandImageUrl ? (
                <img
                  src={brandImageUrl}
                  alt={businessName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span aria-hidden="true">{businessName.trim().charAt(0).toUpperCase()}</span>
              )}
            </span>
            <span className="max-w-[180px] truncate text-xs font-black uppercase tracking-[0.12em] text-[#182125] sm:max-w-none sm:text-sm sm:tracking-[0.18em]">
              {businessName}
            </span>
          </span>
        </Link>

        {/* Derecha — Mi panel */}
        <a
          href="/admin"
          className="justify-self-end rounded-[6px] border border-[#cfc7b8] bg-[#fffdf8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#12383d] transition hover:border-[#0f646a] hover:bg-[#eef4f2] hover:text-[#0f646a]"
        >
          Mi panel
        </a>
      </div>
    </header>
  );
}
