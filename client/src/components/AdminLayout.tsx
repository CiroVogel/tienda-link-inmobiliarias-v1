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
  Search,
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
        className={`w-full flex items-center gap-3 rounded-[8px] px-3 py-2.5 lg:px-4 text-[15px] font-semibold transition ${
          isActive
            ? "bg-[#d9eeee] text-[#0b3438]"
            : "text-[#172124] hover:bg-[#eef8f6] hover:text-[#12383d]"
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

  const businessName =
    profile?.businessName ?? (isPlatformAdmin ? "Admin Central" : "Mi inmobiliaria");

  const navItems = useMemo<NavItemConfig[]>(
    () => [
      { href: "/admin/profile", label: "Perfil de la inmobiliaria", icon: Settings },
      { href: "/admin/services", label: "Propiedades", icon: Briefcase },
      { href: "/admin/gallery", label: "Galería", icon: Images },
      { href: "/admin", label: "Consultas", icon: CalendarCheck, exact: true },
      { href: "/admin/interesados", label: "Interesados", icon: Users },
      { href: "/admin/busquedas-guardadas", label: "Búsquedas recibidas", icon: Search },
      ...(isPlatformAdmin
        ? [{ href: "/admin/nueva-inmobiliaria", label: "Crear inmobiliaria", icon: PlusSquare }]
        : []),
    ],
    [isPlatformAdmin],
  );

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5ef]">
        <div className="w-6 h-6 border border-[#ded8cc] border-t-[#0f646a] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5ef]">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-14 h-14 bg-[#12383d] rounded-xl flex items-center justify-center mx-auto mb-8">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#172124] mb-2 tracking-tight">Panel Admin</h1>
          <p className="text-sm text-[#465153] mb-8">
            Iniciá sesión para acceder al panel de gestión de tu inmobiliaria.
          </p>
          <a href={getLoginUrl()}>
            <button className="w-full py-4 rounded-[8px] bg-[#12383d] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#0f646a] transition-colors">
              Iniciar sesión
            </button>
          </a>
          <div className="mt-4">
            <Link href="/">
              <button className="text-xs font-bold uppercase tracking-[0.14em] text-[#465153] hover:text-[#12383d] transition-colors">
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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5ef]">
        <div className="text-center max-w-sm mx-auto px-6">
          <h1 className="text-3xl font-black text-[#172124] mb-2 tracking-tight">
            Acceso restringido
          </h1>
          <p className="text-sm text-[#465153] mb-6">
            No tenés permisos para acceder al panel de administración.
          </p>
          <Link href="/">
            <button className="text-xs font-bold uppercase tracking-[0.14em] text-[#465153] border-b border-[#ded8cc] pb-1 hover:text-[#12383d] hover:border-[#0f646a] transition-colors">
              Volver al inicio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Encabezado */}
      <div className="shrink-0 border-b border-[#ded8cc] px-3 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#172124] leading-tight">
              {businessName}
            </p>
            <p className="text-xs text-[#465153] mt-0.5 uppercase tracking-[0.14em]">
              Panel Admin
            </p>
          </div>
          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="text-[#465153] hover:text-[#12383d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            onClick={mobile ? () => setMobileOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Pie */}
      <div className="shrink-0 border-t border-[#ded8cc]">
        {/* Ver página pública — solo en mobile drawer */}
        {mobile && profile?.slug ? (
          <div className="px-3 py-3 border-b border-[#ded8cc]">
            <a
              href={publicPageHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#ded8cc] bg-white px-3 py-2 text-sm font-semibold text-[#172124] transition hover:border-[#0f646a] hover:bg-[#eef8f6] hover:text-[#12383d]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver página pública
            </a>
          </div>
        ) : null}

        {/* Usuario y logout */}
        <div className="px-3 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-[8px] border border-[#ded8cc] bg-[#f6f2ea] flex items-center justify-center text-xs font-black text-[#12383d] shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#172124] truncate">{user.name ?? "Admin"}</p>
            <p className="text-xs text-[#465153] truncate">{user.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-[8px] p-1.5 text-[#465153] transition hover:bg-[#eef8f6] hover:text-[#12383d]"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f5ef] text-[#172124]">
      {/* Header único full-width */}
      <header className="shrink-0 border-b border-[#ded8cc] bg-[#fbfaf6]/95 backdrop-blur-md shadow-[0_1px_0_rgba(25,31,28,0.04)]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 md:h-16 lg:px-8 xl:px-10">
          {/* Mobile: hamburger + nombre */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-[#465153] hover:text-[#12383d] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#172124]">
                {businessName}
              </p>
              <p className="text-[10px] text-[#465153] uppercase tracking-[0.12em]">
                Administración
              </p>
            </div>
          </div>

          {/* Desktop: marca + subtítulo */}
          <div className="hidden md:block">
            <p className="text-lg font-black tracking-tight text-[#172124]">{businessName}</p>
            <p className="text-sm text-[#465153]">Administración</p>
          </div>

          {/* Acción: Ver página pública */}
          {profile?.slug ? (
            <a
              href={publicPageHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-[8px] border border-[#ded8cc] bg-white px-3 py-2 text-sm font-semibold text-[#172124] transition hover:border-[#0f646a] hover:bg-[#eef8f6] hover:text-[#12383d]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver página pública</span>
            </a>
          ) : null}
        </div>
      </header>

      {/* Row de trabajo: sidebar + main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar desktop flotante */}
        <aside className="hidden h-full shrink-0 p-3 md:flex md:w-[260px] lg:w-[268px] lg:p-4">
          <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[12px] border border-[#ded8cc] bg-white p-1.5 lg:p-2 shadow-[0_16px_42px_rgba(25,31,28,0.06)]">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile: overlay + drawer lateral */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-[#172124]/25"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute bottom-0 left-0 top-0 flex w-56 flex-col bg-white shadow-[0_16px_42px_rgba(25,31,28,0.12)]">
              <SidebarContent mobile />
            </aside>
          </div>
        )}

        {/* Área principal */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="min-h-full p-3 md:p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
