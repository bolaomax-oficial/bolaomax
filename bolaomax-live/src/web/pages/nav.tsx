import { Link } from "wouter";
import {
  Home,
  LogIn,
  UserPlus,
  Ticket,
  Star,
  HelpCircle,
  Info,
  BookOpen,
  Eye,
  FileText,
  Shield,
  RefreshCcw,
  Headphones,
  User,
  ShoppingCart,
  QrCode,
  LayoutDashboard,
  Users,
  Wallet,
  Banknote,
  Settings,
  Compass,
  Clover,
  Sparkles,
  Building2,
  Trophy,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface Category {
  name: string;
  icon: React.ElementType;
  items: NavItem[];
  accentColor: string;
}

const categories: Category[] = [
  {
    name: "Principal",
    icon: Home,
    accentColor: "emerald",
    items: [
      { name: "Home", path: "/", icon: Home, color: "text-emerald-400", bgColor: "bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30" },
    ]
  },
  {
    name: "Loterias",
    icon: Ticket,
    accentColor: "amber",
    items: [
      { name: "Lotofácil", path: "/lotofacil", icon: Clover, color: "text-purple-400", bgColor: "bg-purple-500/20 hover:bg-purple-500/40 border-purple-500/30" },
      { name: "Mega-Sena", path: "/megasena", icon: Sparkles, color: "text-emerald-400", bgColor: "bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30" },
      { name: "Quina", path: "/quina", icon: Star, color: "text-blue-400", bgColor: "bg-blue-500/20 hover:bg-blue-500/40 border-blue-500/30" },
      { name: "Resultados", path: "/resultados", icon: Trophy, color: "text-amber-400", bgColor: "bg-amber-500/20 hover:bg-amber-500/40 border-amber-500/30" },
    ]
  },
  {
    name: "Informações",
    icon: Info,
    accentColor: "blue",
    items: [
      { name: "Sobre Nós", path: "/sobre-nos", icon: Building2, color: "text-emerald-400", bgColor: "bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30" },
      { name: "Como Funciona", path: "/como-funciona", icon: HelpCircle, color: "text-blue-400", bgColor: "bg-blue-500/20 hover:bg-blue-500/40 border-blue-500/30" },
      { name: "Por que BolãoMax", path: "/por-que-bolaomax", icon: Info, color: "text-cyan-400", bgColor: "bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-500/30" },
      { name: "Conteúdo Educativo", path: "/conteudo-educativo", icon: BookOpen, color: "text-violet-400", bgColor: "bg-violet-500/20 hover:bg-violet-500/40 border-violet-500/30" },
      { name: "Transparência", path: "/transparencia", icon: Eye, color: "text-teal-400", bgColor: "bg-teal-500/20 hover:bg-teal-500/40 border-teal-500/30" },
      { name: "FAQ", path: "/perguntas-frequentes", icon: HelpCircle, color: "text-sky-400", bgColor: "bg-sky-500/20 hover:bg-sky-500/40 border-sky-500/30" },
      { name: "Suporte", path: "/suporte", icon: Headphones, color: "text-indigo-400", bgColor: "bg-indigo-500/20 hover:bg-indigo-500/40 border-indigo-500/30" },
    ]
  },
  {
    name: "Documentos Legais",
    icon: FileText,
    accentColor: "purple",
    items: [
      { name: "Termos de Uso", path: "/termos-de-uso", icon: FileText, color: "text-purple-400", bgColor: "bg-purple-500/20 hover:bg-purple-500/40 border-purple-500/30" },
      { name: "Privacidade", path: "/politica-privacidade", icon: Shield, color: "text-fuchsia-400", bgColor: "bg-fuchsia-500/20 hover:bg-fuchsia-500/40 border-fuchsia-500/30" },
      { name: "Reembolso", path: "/politica-reembolso", icon: RefreshCcw, color: "text-pink-400", bgColor: "bg-pink-500/20 hover:bg-pink-500/40 border-pink-500/30" },
    ]
  },
  {
    name: "Conta do Usuário",
    icon: User,
    accentColor: "cyan",
    items: [
      { name: "Login", path: "/login", icon: LogIn, color: "text-cyan-400", bgColor: "bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-500/30" },
      { name: "Cadastro", path: "/cadastro", icon: UserPlus, color: "text-teal-400", bgColor: "bg-teal-500/20 hover:bg-teal-500/40 border-teal-500/30" },
      { name: "Minha Conta", path: "/minha-conta", icon: User, color: "text-emerald-400", bgColor: "bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30" },
      { name: "Checkout", path: "/checkout", icon: ShoppingCart, color: "text-lime-400", bgColor: "bg-lime-500/20 hover:bg-lime-500/40 border-lime-500/30" },
      { name: "Pagamento PIX", path: "/pagamento-pix", icon: QrCode, color: "text-green-400", bgColor: "bg-green-500/20 hover:bg-green-500/40 border-green-500/30" },
    ]
  },
  {
    name: "Painel Admin",
    icon: Settings,
    accentColor: "red",
    items: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard, color: "text-red-400", bgColor: "bg-red-500/20 hover:bg-red-500/40 border-red-500/30" },
      { name: "Bolões", path: "/admin/boloes", icon: Ticket, color: "text-orange-400", bgColor: "bg-orange-500/20 hover:bg-orange-500/40 border-orange-500/30" },
      { name: "Usuários", path: "/admin/usuarios", icon: Users, color: "text-amber-400", bgColor: "bg-amber-500/20 hover:bg-amber-500/40 border-amber-500/30" },
      { name: "Financeiro", path: "/admin/financeiro", icon: Wallet, color: "text-yellow-400", bgColor: "bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-500/30" },
      { name: "Saques", path: "/admin/saques", icon: Banknote, color: "text-rose-400", bgColor: "bg-rose-500/20 hover:bg-rose-500/40 border-rose-500/30" },
      { name: "Configurações", path: "/admin/configuracoes", icon: Settings, color: "text-slate-400", bgColor: "bg-slate-500/20 hover:bg-slate-500/40 border-slate-500/30" },
    ]
  },
  {
    name: "Desenvolvimento",
    icon: Compass,
    accentColor: "yellow",
    items: [
      { name: "Teste de Páginas", path: "/teste-paginas", icon: Compass, color: "text-yellow-400", bgColor: "bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-500/30" },
      { name: "Diagnóstico", path: "/diagnostico", icon: Eye, color: "text-orange-400", bgColor: "bg-orange-500/20 hover:bg-orange-500/40 border-orange-500/30" },
    ]
  },
];

const totalPages = categories.reduce((acc, cat) => acc + cat.items.length, 0);

const NavButton = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;
  
  return (
    <Link href={item.path}>
      <button 
        className={`
          w-full p-5 rounded-2xl border-2 transition-all duration-300
          flex flex-col items-center justify-center gap-3
          ${item.bgColor}
          hover:scale-105 hover:shadow-lg hover:shadow-black/30
          active:scale-95
          group cursor-pointer
        `}
      >
        <div className={`p-3 rounded-xl bg-black/20 ${item.color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7" />
        </div>
        <span className={`font-bold text-sm ${item.color}`}>
          {item.name}
        </span>
      </button>
    </Link>
  );
};

export default function Nav() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bolao-darker via-bolao-dark to-[#0d1424] text-white">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-[120px]" />
      </div>
      
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-green/20 border border-bolao-green/30 mb-6">
              <Compass className="w-5 h-5 text-bolao-green animate-pulse" />
              <span className="text-bolao-green font-semibold text-sm">Hub de Navegação</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BolãoMax
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Navegue por todas as páginas do sistema
            </p>
            
            {/* Stats counter */}
            <div className="mt-8 inline-flex items-center gap-6 px-6 py-4 rounded-2xl bg-bolao-card/60 border border-bolao-card-border backdrop-blur-sm">
              <div className="text-center">
                <p className="text-4xl font-black text-bolao-green">{totalPages}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Páginas</p>
              </div>
              <div className="w-px h-10 bg-bolao-card-border" />
              <div className="text-center">
                <p className="text-4xl font-black text-blue-400">{categories.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Categorias</p>
              </div>
            </div>
          </div>
          
          {/* Categories Grid */}
          <div className="space-y-12">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <section key={category.name}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2.5 rounded-xl bg-${category.accentColor}-500/20`}>
                      <CategoryIcon className={`w-5 h-5 text-${category.accentColor}-400`} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 font-medium">
                      {category.items.length} {category.items.length === 1 ? "página" : "páginas"}
                    </span>
                  </div>
                  
                  {/* Buttons Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {category.items.map((item) => (
                      <NavButton key={item.path} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-400">
                Sistema BolãoMax • Todas as rotas funcionais
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
