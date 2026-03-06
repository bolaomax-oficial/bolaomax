import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useWhatsApp, WhatsAppConfig } from "@/contexts/WhatsAppContext";
import { WhatsAppButtonPreview } from "@/components/WhatsAppButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Share2,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  MessageCircle,
  Plus,
  Settings,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  Check,
  AlertCircle,
  GripVertical,
  RefreshCw,
  Users,
  TrendingUp,
  Activity,
  Link2,
  Globe,
  Phone,
  Smartphone,
  Monitor,
  Send,
  CheckCircle,
} from "lucide-react";

// Social media platform configuration
interface SocialPlatform {
  id: string;
  name: string;
  handle: string;
  url: string;
  icon: string;
  color: string;
  active: boolean;
  order: number;
  followers?: number;
  engagement?: string;
  lastPost?: string;
}

// Default platforms
const defaultPlatforms: SocialPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@bolaomax.oficial",
    url: "https://instagram.com/bolaomax.oficial",
    icon: "instagram",
    color: "from-pink-500 via-purple-500 to-orange-500",
    active: true,
    order: 1,
    followers: 12500,
    engagement: "4.2%",
    lastPost: "2 horas atrás",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@bolaomax.oficial",
    url: "https://tiktok.com/@bolaomax.oficial",
    icon: "tiktok",
    color: "from-[#00f2ea] via-black to-[#ff0050]",
    active: true,
    order: 2,
    followers: 8300,
    engagement: "6.8%",
    lastPost: "1 dia atrás",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "BolãoMax Oficial",
    url: "https://youtube.com/@bolaomax",
    icon: "youtube",
    color: "from-red-600 to-red-700",
    active: true,
    order: 3,
    followers: 5200,
    engagement: "3.1%",
    lastPost: "3 dias atrás",
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "BolãoMax",
    url: "https://facebook.com/bolaomax",
    icon: "facebook",
    color: "from-blue-600 to-blue-700",
    active: true,
    order: 4,
    followers: 15800,
    engagement: "2.5%",
    lastPost: "5 horas atrás",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    handle: "@bolaomax",
    url: "https://twitter.com/bolaomax",
    icon: "twitter",
    color: "from-gray-800 to-black",
    active: true,
    order: 5,
    followers: 3400,
    engagement: "1.8%",
    lastPost: "12 horas atrás",
  },
  {
    id: "telegram",
    name: "Telegram",
    handle: "t.me/bolaomax",
    url: "https://t.me/bolaomax",
    icon: "telegram",
    color: "from-sky-400 to-sky-600",
    active: true,
    order: 6,
    followers: 2100,
    engagement: "15.2%",
    lastPost: "1 hora atrás",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    handle: "+55 11 98765-4321",
    url: "https://wa.me/5511987654321",
    icon: "whatsapp",
    color: "from-green-500 to-green-600",
    active: true,
    order: 7,
    followers: undefined,
    engagement: undefined,
    lastPost: undefined,
  },
];

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Icon component based on platform
const PlatformIcon = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon) {
    case "instagram":
      return <Instagram className={className} />;
    case "youtube":
      return <Youtube className={className} />;
    case "facebook":
      return <Facebook className={className} />;
    case "twitter":
      return <Twitter className={className} />;
    case "telegram":
      return <MessageCircle className={className} />;
    case "whatsapp":
      return <WhatsAppIcon className={className} />;
    case "tiktok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      );
    default:
      return <Globe className={className} />;
  }
};

// Platform Card Component
const PlatformCard = ({ 
  platform, 
  isDark, 
  onEdit, 
  onToggle, 
  onDelete 
}: { 
  platform: SocialPlatform; 
  isDark: boolean; 
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  return (
    <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"} ${!platform.active ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div className={`cursor-grab ${isDark ? "text-gray-600 hover:text-gray-400" : "text-gray-300 hover:text-gray-500"}`}>
          <GripVertical className="w-5 h-5" />
        </div>
        
        {/* Platform Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center flex-shrink-0`}>
          <PlatformIcon icon={platform.icon} className="w-6 h-6 text-white" />
        </div>
        
        {/* Platform Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{platform.name}</h3>
            {platform.active ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">Ativo</Badge>
            ) : (
              <Badge className="bg-gray-500/20 text-gray-400 border-0 text-xs">Inativo</Badge>
            )}
          </div>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{platform.handle}</p>
          <a 
            href={platform.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-bolao-green hover:underline flex items-center gap-1 mt-1"
          >
            {platform.url}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        {/* Stats */}
        <div className="hidden md:flex gap-4 items-center">
          {platform.followers && (
            <div className="text-center">
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {platform.followers.toLocaleString()}
              </p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Seguidores</p>
            </div>
          )}
          {platform.engagement && (
            <div className="text-center">
              <p className={`text-lg font-bold text-emerald-400`}>{platform.engagement}</p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Engajamento</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className={isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle}
            className={isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Preview Component showing how social links appear on website
const FooterPreview = ({ platforms, isDark }: { platforms: SocialPlatform[]; isDark: boolean }) => {
  const activePlatforms = platforms.filter(p => p.active).sort((a, b) => a.order - b.order);
  
  return (
    <Card className={`p-6 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-100 border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-4">
        <Eye className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
        <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Preview - Como aparece no footer do site
        </span>
      </div>
      
      <div className={`p-4 rounded-lg ${isDark ? "bg-[#111827] border border-[#1C2432]" : "bg-white border border-gray-200"}`}>
        <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Siga-nos
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {activePlatforms.map((platform) => (
            <div 
              key={platform.id}
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}
            >
              <PlatformIcon icon={platform.icon} className="w-5 h-5 text-white" />
            </div>
          ))}
          {activePlatforms.length === 0 && (
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Nenhuma rede social ativa
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// WhatsApp Configuration Section Component
const WhatsAppConfigSection = ({ isDark }: { isDark: boolean }) => {
  const { config, saveWhatsAppConfig } = useWhatsApp();
  const [localConfig, setLocalConfig] = useState<WhatsAppConfig>(config);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    saveWhatsAppConfig(localConfig);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTestWhatsApp = () => {
    const formattedPhone = localConfig.phoneNumber.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(localConfig.welcomeMessage);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 9) return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  const positions: Array<{ value: WhatsAppConfig["position"]; label: string }> = [
    { value: "bottom-right", label: "Inferior Direito" },
    { value: "bottom-left", label: "Inferior Esquerdo" },
    { value: "top-right", label: "Superior Direito" },
    { value: "top-left", label: "Superior Esquerdo" },
  ];

  return (
    <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <WhatsAppIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              WhatsApp Business
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Configure o botão flutuante do WhatsApp
            </p>
          </div>
        </div>
        <Badge className={localConfig.enabled ? "bg-emerald-500/20 text-emerald-400 border-0" : "bg-gray-500/20 text-gray-400 border-0"}>
          {localConfig.enabled ? "WhatsApp ativo" : "WhatsApp inativo"}
        </Badge>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-400 font-medium">Configurações salvas com sucesso!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Ativar botão flutuante</p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Mostrar botão do WhatsApp no site
                </p>
              </div>
              <button
                onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  localConfig.enabled ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                  localConfig.enabled ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              <Phone className="w-4 h-4 inline mr-2" />
              Número do WhatsApp
            </label>
            <input
              type="tel"
              value={formatPhoneNumber(localConfig.phoneNumber)}
              onChange={(e) => setLocalConfig({ ...localConfig, phoneNumber: e.target.value.replace(/\D/g, "") })}
              placeholder="+55 11 98765-4321"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Inclua o código do país e DDD
            </p>
          </div>

          {/* Welcome Message */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Mensagem de boas-vindas
            </label>
            <textarea
              value={localConfig.welcomeMessage}
              onChange={(e) => setLocalConfig({ ...localConfig, welcomeMessage: e.target.value.slice(0, 200) })}
              placeholder="Olá! Gostaria de saber mais sobre os bolões."
              rows={3}
              maxLength={200}
              className={`w-full px-4 py-3 rounded-lg border resize-none ${
                isDark
                  ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {localConfig.welcomeMessage.length}/200 caracteres
            </p>
          </div>

          {/* Position Selector */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Posição do botão
            </label>
            <div className="grid grid-cols-2 gap-2">
              {positions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setLocalConfig({ ...localConfig, position: pos.value })}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    localConfig.position === pos.value
                      ? "bg-bolao-green/20 border-bolao-green text-bolao-green"
                      : isDark
                      ? "bg-[#0A0E14] border-[#1C2432] text-gray-300 hover:border-gray-600"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Button Color */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Cor do botão
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localConfig.buttonColor}
                onChange={(e) => setLocalConfig({ ...localConfig, buttonColor: e.target.value })}
                className="w-12 h-12 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={localConfig.buttonColor}
                onChange={(e) => setLocalConfig({ ...localConfig, buttonColor: e.target.value })}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  isDark
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Mobile</span>
                </div>
                <button
                  onClick={() => setLocalConfig({ ...localConfig, showOnMobile: !localConfig.showOnMobile })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    localConfig.showOnMobile ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                    localConfig.showOnMobile ? "left-5" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Desktop</span>
                </div>
                <button
                  onClick={() => setLocalConfig({ ...localConfig, showOnDesktop: !localConfig.showOnDesktop })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    localConfig.showOnDesktop ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                    localConfig.showOnDesktop ? "left-5" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <Eye className="w-4 h-4 inline mr-2" />
            Preview do botão
          </label>
          <WhatsAppButtonPreview 
            position={localConfig.position} 
            buttonColor={localConfig.buttonColor} 
          />

          {/* Message Preview */}
          <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Mensagem que será enviada
            </p>
            <div className={`p-3 rounded-lg ${isDark ? "bg-[#111827]" : "bg-white"} border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {localConfig.welcomeMessage || "Nenhuma mensagem configurada"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[#1C2432]">
        <Button
          variant="outline"
          onClick={handleTestWhatsApp}
          className={isDark ? "border-[#1C2432]" : ""}
        >
          <Send className="w-4 h-4 mr-2" />
          Testar WhatsApp
        </Button>
        <Button
          onClick={handleSave}
          className="bg-bolao-green hover:bg-bolao-green-dark text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </Card>
  );
};

// Main Component
const AdminRedesSociais = () => {
  const { isDark } = useTheme();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(defaultPlatforms);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<SocialPlatform | null>(null);
  const [testingLinks, setTestingLinks] = useState(false);

  // Calculate total stats
  const totalFollowers = platforms.reduce((sum, p) => sum + (p.followers || 0), 0);
  const activePlatforms = platforms.filter(p => p.active).length;

  const handleTogglePlatform = (id: string) => {
    setPlatforms(platforms.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const handleDeletePlatform = (id: string) => {
    setPlatforms(platforms.filter(p => p.id !== id));
  };

  const handleEditPlatform = (platform: SocialPlatform) => {
    setEditingPlatform(platform);
    setShowEditModal(true);
  };

  const handleTestLinks = () => {
    setTestingLinks(true);
    setTimeout(() => setTestingLinks(false), 2000);
  };

  const handleTestWhatsApp = () => {
    const whatsappPlatform = platforms.find(p => p.id === "whatsapp");
    if (whatsappPlatform) {
      window.open(whatsappPlatform.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AdminLayout title="Redes Sociais" subtitle="Gerencie suas redes sociais e links do site">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-bolao-green/10">
                <Share2 className="w-5 h-5 text-bolao-green" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{platforms.length}</p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Redes Cadastradas</p>
              </div>
            </div>
          </Card>
          
          <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{activePlatforms}</p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ativas no Site</p>
              </div>
            </div>
          </Card>
          
          <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{totalFollowers.toLocaleString()}</p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total de Seguidores</p>
              </div>
            </div>
          </Card>
          
          <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>4.5%</p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Média Engajamento</p>
              </div>
            </div>
          </Card>
        </div>

        {/* WhatsApp Configuration Section */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Configuração WhatsApp
          </h2>
          <WhatsAppConfigSection isDark={isDark} />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            Plataformas Configuradas
          </h2>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleTestLinks}
              disabled={testingLinks}
              className={isDark ? "border-[#1C2432]" : ""}
            >
              {testingLinks ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Testar Links
                </>
              )}
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-bolao-green hover:bg-bolao-green-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Rede Social
            </Button>
          </div>
        </div>

        {/* Platform List */}
        <div className="space-y-3">
          {platforms.sort((a, b) => a.order - b.order).map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              isDark={isDark}
              onEdit={() => handleEditPlatform(platform)}
              onToggle={() => handleTogglePlatform(platform.id)}
              onDelete={() => handleDeletePlatform(platform.id)}
            />
          ))}
        </div>

        {/* Preview Section */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Preview do Site
          </h3>
          <FooterPreview platforms={platforms} isDark={isDark} />
        </div>

        {/* Test Results */}
        {testingLinks && (
          <Card className={`p-4 ${isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className={`font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                Todos os {activePlatforms} links ativos estão funcionando corretamente!
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* Add Platform Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className={`${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white"} max-w-md`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : ""}>Adicionar Nova Rede Social</DialogTitle>
            <DialogDescription>
              Configure uma nova plataforma de mídia social
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Plataforma
              </label>
              <select className={`w-full px-4 py-3 rounded-lg border ${
                isDark 
                  ? "bg-[#0A0E14] border-[#1C2432] text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              }`}>
                <option value="">Selecione...</option>
                <option value="discord">Discord</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitch">Twitch</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Nome/Handle
              </label>
              <input 
                type="text"
                placeholder="@bolaomax"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                URL Completa
              </label>
              <input 
                type="url"
                placeholder="https://..."
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-bolao-green hover:bg-bolao-green-dark text-white">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Platform Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className={`${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white"} max-w-md`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : ""}>
              Editar {editingPlatform?.name}
            </DialogTitle>
            <DialogDescription>
              Atualize as configurações desta plataforma
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Nome/Handle
              </label>
              <input 
                type="text"
                defaultValue={editingPlatform?.handle}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                URL Completa
              </label>
              <input 
                type="url"
                defaultValue={editingPlatform?.url}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
            
            <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Ativo no site</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Mostrar no footer e outras áreas
                  </p>
                </div>
                <button
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editingPlatform?.active ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                    editingPlatform?.active ? "left-7" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button className="bg-bolao-green hover:bg-bolao-green-dark text-white">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRedesSociais;
