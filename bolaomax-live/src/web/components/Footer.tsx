import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Shield,
  Wallet,
  Clock,
  Mail,
  HelpCircle,
  FileText,
  Eye,
  BookOpen,
  User,
  UserPlus,
  Headphones,
  Lock,
  Crown,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  MessageCircle,
} from "lucide-react";

interface FooterProps {
  activePage?: string;
}

export const Footer = ({ activePage }: FooterProps) => {
  const { isLoggedIn } = useAuth();

  return (
    <footer className="relative py-16 border-t border-bolao-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-bolao-dark" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Bolão<span className="text-bolao-green">Max</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              A maior plataforma de bolões do Brasil. Participe, compartilhe e ganhe junto com milhares de apostadores.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-bolao-card/30 border border-bolao-card-border">
              <Clock className="w-5 h-5 text-bolao-green flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Atendimento</p>
                <p className="text-sm font-semibold">Seg-Sex: 9h às 18h</p>
              </div>
            </div>
          </div>

          {/* Sobre */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Sobre
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/sobre-nos" 
                  className={`text-sm transition-colors ${activePage === "sobre-nos" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link 
                  href="/por-que-bolaomax" 
                  className={`text-sm transition-colors ${activePage === "por-que-bolaomax" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Por que BolãoMax
                </Link>
              </li>
              <li>
                <Link 
                  href="/como-funciona" 
                  className={`text-sm transition-colors ${activePage === "como-funciona" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link 
                  href="/transparencia" 
                  className={`text-sm transition-colors ${activePage === "transparencia" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Transparência
                </Link>
              </li>
              <li>
                <Link 
                  href="/conteudo-educativo" 
                  className={`text-sm transition-colors ${activePage === "conteudo-educativo" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Conteúdo Educativo
                </Link>
              </li>
              <li>
                <Link 
                  href="/clube-vip" 
                  className={`text-sm transition-colors flex items-center gap-1.5 ${activePage === "clube-vip" ? "text-amber-400 font-medium" : "text-muted-foreground hover:text-amber-400"}`}
                >
                  <Crown className="w-3 h-3" />
                  Clube VIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/termos-de-uso" 
                  className={`text-sm transition-colors ${activePage === "termos-de-uso" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  href="/politica-privacidade" 
                  className={`text-sm transition-colors flex items-center gap-1 ${activePage === "politica-privacidade" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  <Lock className="w-3 h-3" />
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  href="/politica-reembolso" 
                  className={`text-sm transition-colors ${activePage === "politica-reembolso" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Política de Reembolso
                </Link>
              </li>
              <li>
                <Link 
                  href="/perguntas-frequentes" 
                  className={`text-sm transition-colors ${activePage === "perguntas-frequentes" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Atendimento
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/suporte" 
                  className={`text-sm transition-colors ${activePage === "suporte" ? "text-bolao-green font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <a href="mailto:suporte@bolaomax.com" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  suporte@bolaomax.com
                </a>
              </li>
            </ul>
          </div>

          {/* Sua Conta */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Sua Conta
            </h4>
            <ul className="space-y-2">
              {isLoggedIn ? (
                <li>
                  <Link href="/minha-conta" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Minha Conta
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-white transition-colors">
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link href="/cadastro" className="text-sm text-bolao-green font-medium hover:text-bolao-green-light transition-colors flex items-center gap-2">
                      <UserPlus className="w-3 h-3" />
                      Criar Conta
                    </Link>
                  </li>
                </>
              )}
            </ul>
            
            {/* Loterias */}
            <h4 className="font-bold mt-6 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Loterias
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/lotofacil" 
                  className={`text-sm transition-colors ${activePage === "lotofacil" ? "text-violet-400 font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Lotofácil
                </Link>
              </li>
              <li>
                <Link 
                  href="/megasena" 
                  className={`text-sm transition-colors ${activePage === "megasena" ? "text-emerald-400 font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Mega-Sena
                </Link>
              </li>
              <li>
                <Link 
                  href="/quina" 
                  className={`text-sm transition-colors ${activePage === "quina" ? "text-sky-400 font-medium" : "text-muted-foreground hover:text-white"}`}
                >
                  Quina
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="py-8 border-t border-bolao-card-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Siga-nos</h4>
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a 
                  href="https://instagram.com/bolaomax.oficial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30"
                  aria-label="Instagram @bolaomax.oficial"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                
                {/* TikTok */}
                <a 
                  href="https://tiktok.com/@bolaomax.oficial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f2ea] via-black to-[#ff0050] flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-[#00f2ea]/30"
                  aria-label="TikTok @bolaomax.oficial"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                
                {/* YouTube */}
                <a 
                  href="https://youtube.com/@bolaomax" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-red-500/30"
                  aria-label="YouTube BolãoMax Oficial"
                >
                  <Youtube className="w-5 h-5 text-white" />
                </a>
                
                {/* Facebook */}
                <a 
                  href="https://facebook.com/bolaomax" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
                  aria-label="Facebook BolãoMax"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                
                {/* Twitter/X */}
                <a 
                  href="https://twitter.com/bolaomax" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-gray-500/30"
                  aria-label="Twitter/X @bolaomax"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                
                {/* Telegram */}
                <a 
                  href="https://t.me/bolaomax" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-sky-500/30"
                  aria-label="Telegram t.me/bolaomax"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground mb-1">Acompanhe nosso conteúdo exclusivo</p>
              <p className="text-xs text-muted-foreground">Dicas, resultados e novidades sobre bolões</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-bolao-card-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 BolãoMax. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-bolao-green" />
              <span>Site Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="w-4 h-4 text-bolao-green" />
              <span>Pagamento Protegido</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
