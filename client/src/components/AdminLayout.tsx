import { useMemo, useState, type ElementType, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Briefcase,
  Images,
  CalendarCheck,
  Users,
  Settings,
  PlusSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

type NavItemConfig = {
  href: string;
  label: string;
  icon: ElementType;
  exact?: boolean;
};

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: NavItemConfig & { onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = exact ? location === href : location.startsWith(href);

  return (
    <Link href={href}>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-white text-black font-bold"
            : "text-white/50 hover:text-white hover:bg-white/10"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </button>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: profile } = trpc.business.get.useQuery();
  const publicPageHref = profile?.slug ? `/${profile.slug}` : "/";

  const isPlatformAdmin = user?.openId === "local-admin";

  const navItems = useMemo<NavItemConfig[]>(
    () => [
      { href: "/admin", label: "Consultas", icon: CalendarCheck, exact: true },
      { href: "/admin/interesados", label: "Interesados", icon: Users },
      { href: "/admin/profile", label: "Perfil de la inmobiliaria", icon: Settings },
      { href: "/admin/services", label: "Propiedades", icon: Briefcase },
      { href: "/admin/gallery", label: "Galeria", icon: Images },
      ...(isPlatformAdmin
        ? [{ href: "/admin/nueva-inmobiliaria", label: "Crear inmobiliaria", icon: PlusSquare }]
        : []),
    ],
    [isPlatformAdmin],
  );

  const handleLogout = async () => {
    await logout();
    toast.success("Sesion cerrada");
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-14 h-14 bg-black flex items-center justify-center mx-auto mb-8">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">Panel Admin</h1>
          <p className="text-sm text-black/50 mb-8">
            Inicia sesion para acceder al panel de gestion de tu inmobiliaria.
          </p>
          <a href={getLoginUrl()}>
            <button className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
              Iniciar sesion
            </button>
          </a>
          <div className="mt-4">
            <Link href="/">
              <button className="text-xs font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors">
                Volver al inicio
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm mx-auto px-6">
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">
            Acceso restringido
          </h1>
          <p className="text-sm text-black/50 mb-6">
            No tenes permisos para acceder al panel de administracion.
          </p>
          <Link href="/">
            <button className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 hover:opacity-60 transition-opacity">
              Volver al inicio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-black">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-black text-sm tracking-widest uppercase leading-tight">
              {profile?.businessName ?? (isPlatformAdmin ? "Admin Central" : "Mi inmobiliaria")}
            </p>
            <p className="text-white/30 text-xs mt-0.5 uppercase tracking-widest">
              Panel Admin
            </p>
          </div>
          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            onClick={mobile ? () => setMobileOpen(false) : undefined}
          />
        ))}
      </nav>

      <div className="border-t border-white/10">
        {profile?.slug ? (
          <div className="px-4 py-4 border-b border-white/10">
            <a
              href={publicPageHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 border border-white/15 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {"Ver p\u00e1gina p\u00fablica"}
            </a>
          </div>
        ) : null}

        <div className="px-4 py-4 flex items-center gap-3 border-t border-white/10">
          <div className="w-7 h-7 bg-white flex items-center justify-center text-xs font-black text-black shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{user.name ?? "Admin"}</p>
            <p className="text-white/30 text-xs truncate">{user.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-white transition-colors"
            title="Cerrar sesion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">
      <aside className="hidden md:flex w-56 flex-col shrink-0">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 flex flex-col">
            <Sidebar mobile />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center gap-4 px-4 h-14 border-b border-black/10 bg-white shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-black/40 hover:text-black transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-black">
            {profile?.businessName ?? (isPlatformAdmin ? "Admin Central" : "Admin")}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
