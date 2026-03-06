import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCog,
  Wallet,
  ArrowDownToLine,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Crown,
  History,
  Medal,
  Share2,
  Gift,
  Bot,
  MessageSquare,
  Trophy,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Painel", href: "/admin" },
  { icon: Ticket, label: "Bolões", href: "/admin/boloes" },
  { icon: UserCog, label: "Sub-Usuários", href: "/admin/sub-usuarios", badge: 3 },
  { icon: Trophy, label: "Loterias", href: "/admin/loterias", badge: 10 },
  { icon: Calendar, label: "Calendário", href: "/admin/calendario" },
  { icon: Users, label: "Usuários", href: "/admin/usuarios" },
  { icon: Crown, label: "Assinantes", href: "/admin/assinantes" },
  { icon: Medal, label: "Planos VIP", href: "/admin/planos-vip" },
  { icon: Bot, label: "Automação VIP", href: "/admin/automacao-vip" },
  { icon: Wallet, label: "Financeiro", href: "/admin/financeiro" },
  { icon: ArrowDownToLine, label: "Saques", href: "/admin/saques", badge: 8 },
  { icon: MessageSquare, label: "Depoimentos", href: "/admin/depoimentos", badge: 5 },
  { icon: Gift, label: "Indicações", href: "/admin/indicacoes" },
  { icon: Share2, label: "Redes Sociais", href: "/admin/redes-sociais" },
  { icon: History, label: "Auditoria", href: "/admin/auditoria" },
  { icon: Settings, label: "Configurações", href: "/admin/configuracoes" },
];

const AdminSidebar = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
  const [location] = useLocation();
  const { isDark } = useTheme();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } ${
        isDark 
          ? "bg-gradient-to-b from-[#0D1117] to-[#0A0E14] border-[#1C2432]"
          : "bg-gradient-to-b from-white to-gray-50 border-gray-200"
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center gap-3 p-5 border-b ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center flex-shrink-0 shadow-lg shadow-bolao-green/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className={`text-lg font-bold tracking-tight whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
              Bolão<span className="text-bolao-green">Max</span>
            </span>
            <p className={`text-[10px] -mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Painel de administração</p>
          </div>
        )}
      </div>

      {/* Admin Profile */}
      <div className={`p-4 border-b ${isDark ? "border-[#1C2432]" : "border-gray-200"} ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "" : ""}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border border-bolao-green/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <span className="text-bolao-green font-bold text-sm">UM</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>Administrador</p>
              <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>admin@bolaomax.com</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? "bg-bolao-green text-bolao-dark font-semibold shadow-lg shadow-bolao-green/20"
                    : isDark 
                      ? "text-gray-400 hover:bg-[#1C2432] hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "" : "group-hover:text-bolao-green"}`} />
                {!collapsed && (
                  <>
                    <span className="text-sm flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isActive ? "bg-bolao-dark/20 text-bolao-dark" : "bg-bolao-orange/20 text-bolao-orange"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-bolao-orange text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className={`p-3 border-t space-y-1 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
        <Link href="/">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
            isDark 
              ? "text-gray-400 hover:bg-[#1C2432] hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}>
            <ExternalLink className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Voltar ao Site</span>}
          </div>
        </Link>
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isDark 
              ? "text-gray-400 hover:bg-[#1C2432] hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span className="text-sm">Recolher</span>}
        </button>
      </div>
    </aside>
  );
};

const AdminHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl border-b ${
      isDark 
        ? "bg-[#0A0E14]/80 border-[#1C2432]"
        : "bg-white/80 border-gray-200"
    }`}>
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h1>
          {subtitle && <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className={`relative ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-bolao-orange text-[10px] font-bold text-white">
              3
            </span>
          </Button>
          <div className={`flex items-center gap-3 pl-4 border-l ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border border-bolao-green/30 flex items-center justify-center overflow-hidden">
              <span className="text-bolao-green font-bold text-xs">UM</span>
            </div>
            <div className="hidden sm:block">
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Administrador</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
