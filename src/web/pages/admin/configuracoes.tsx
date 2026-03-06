import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { configuracoesService } from "@/services/configuracoesService";
import {
  Settings,
  Palette,
  Link2,
  Shield,
  Save,
  Upload,
  Sun,
  Moon,
  Mail,
  Phone,
  Globe,
  CreditCard,
  MessageSquare,
  BarChart3,
  Key,
  Lock,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Menu,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Circle,
  Clover,
  Star,
  Crown,
  FileText,
  Info,
  HelpCircle,
  Trophy,
  Home,
  ExternalLink,
  Copy,
} from "lucide-react";

// Tab Button Component
const TabButton = ({ active, onClick, children, icon: Icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ElementType }) => {
  const { isDark } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
        active
          ? "bg-bolao-green text-bolao-dark"
          : isDark 
            ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
};

// Input Field Component
const InputField = ({ label, type = "text", placeholder, defaultValue }: { label: string; type?: string; placeholder?: string; defaultValue?: string }) => {
  const { isDark } = useTheme();
  
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green transition-colors ${
          isDark 
            ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
};

// Toggle Switch Component with theme support
const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description?: string }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${
      isDark 
        ? "bg-[#0A0E14] border-[#1C2432]"
        : "bg-gray-50 border-gray-200"
    }`}>
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{label}</p>
        {description && <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${checked ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
};

// Theme Toggle Component with Preview
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`p-4 rounded-lg border ${
      isDark 
        ? "bg-[#0A0E14] border-[#1C2432]"
        : "bg-gray-50 border-gray-200"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Modo Escuro</p>
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ative para usar o tema escuro em todo o site</p>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
            isDark 
              ? "bg-bolao-green" 
              : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md flex items-center justify-center ${
            isDark ? "left-8" : "left-1"
          }`}>
            {isDark 
              ? <Moon className="w-3 h-3 text-bolao-green" />
              : <Sun className="w-3 h-3 text-yellow-500" />
            }
          </span>
        </button>
      </div>
      
      {/* Live Preview */}
      <div className={`mt-4 p-4 rounded-lg border ${
        isDark 
          ? "bg-[#111827] border-[#1C2432]"
          : "bg-white border-gray-200"
      }`}>
        <p className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Preview do tema atual</p>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDark ? "bg-[#0A0E14]" : "bg-gray-100"
          }`}>
            {isDark ? <Moon className="w-4 h-4 text-bolao-green" /> : <Sun className="w-4 h-4 text-yellow-500" />}
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {isDark ? "Tema Escuro" : "Tema Claro"}
            </p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {isDark ? "Fundo #0A0E14, textos claros" : "Fundo claro, textos escuros"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Color Picker Component
const ColorPicker = ({ label, defaultValue, variable }: { label: string; defaultValue: string; variable: string }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isDark 
        ? "bg-[#0A0E14] border-[#1C2432]"
        : "bg-gray-50 border-gray-200"
    }`}>
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{label}</p>
        <p className={`text-xs font-mono ${isDark ? "text-gray-400" : "text-gray-500"}`}>{variable}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          defaultValue={defaultValue}
          className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          defaultValue={defaultValue}
          className={`w-24 px-2 py-1.5 rounded-md border text-xs font-mono focus:outline-none focus:border-bolao-green ${
            isDark 
              ? "bg-[#111827] border-[#1C2432] text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        />
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUpload = ({ label, description, currentImage }: { label: string; description: string; currentImage?: string }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="space-y-3">
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{label}</p>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
      </div>
      <div className="flex items-start gap-4">
        {currentImage && (
          <div className={`w-20 h-20 rounded-lg border flex items-center justify-center overflow-hidden ${
            isDark 
              ? "bg-[#0A0E14] border-[#1C2432]"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        <div className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center hover:border-bolao-green/50 transition-colors cursor-pointer ${
          isDark ? "border-[#1C2432]" : "border-gray-300"
        }`}>
          <Upload className={`w-6 h-6 mx-auto mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Arraste ou clique para enviar</p>
          <p className={`text-[10px] mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>PNG, JPG até 2MB</p>
        </div>
      </div>
    </div>
  );
};

// Integration Card Component
const IntegrationCard = ({ 
  icon: Icon, 
  iconBg, 
  iconColor,
  name, 
  description, 
  connected,
  onConnect 
}: { 
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  name: string;
  description: string;
  connected: boolean;
  onConnect: () => void;
}) => {
  const { isDark } = useTheme();
  
  return (
    <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{name}</p>
              {connected && (
                <Badge className="bg-bolao-green/10 text-bolao-green border-0 text-[10px]">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Conectado
                </Badge>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
          </div>
        </div>
        <Button 
          variant={connected ? "outline" : "default"}
          size="sm"
          className={connected ? "" : "bg-bolao-green hover:bg-bolao-green-dark text-white"}
          onClick={onConnect}
        >
          {connected ? "Configurar" : "Conectar"}
        </Button>
      </div>
      {connected && (
        <div className={`mt-4 pt-4 border-t space-y-3 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
          <InputField label="API Key" type="password" placeholder="sk_live_..." defaultValue="sk_live_••••••••••••" />
          <InputField label="Webhook URL" placeholder="https://..." defaultValue="https://bolaomax.com/api/webhooks/integration" />
        </div>
      )}
    </Card>
  );
};

// Security Log Item
const SecurityLogItem = ({ action, user, date, ip }: { action: string; user: string; date: string; ip: string }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{action}</p>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user}</p>
      </div>
      <div className="text-right">
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{date}</p>
        <p className={`text-[10px] font-mono ${isDark ? "text-gray-500" : "text-gray-400"}`}>{ip}</p>
      </div>
    </div>
  );
};

// Active Session Item
const ActiveSessionItem = ({ device, location, current, lastActive }: { device: string; location: string; current?: boolean; lastActive: string }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isDark 
        ? "bg-[#0A0E14] border-[#1C2432]"
        : "bg-gray-50 border-gray-200"
    }`}>
      <div>
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{device}</p>
          {current && <Badge className="bg-bolao-green/10 text-bolao-green border-0 text-[10px]">Atual</Badge>}
        </div>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{location} • {lastActive}</p>
      </div>
      {!current && (
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
          Encerrar
        </Button>
      )}
    </div>
  );
};

// Menu Item Interface for internal use
interface MenuItemConfig {
  id: string;
  name: string;
  slug: string;
  route: string;
  visible: boolean;
  order: number;
  icon: string;
  category: "page" | "lottery" | "custom";
  editable: boolean;
  parent?: string;
  children?: MenuItemConfig[];
  color?: string;
  colorName?: string;
  active?: boolean;
}

// Default Menu Configuration
const defaultMenuConfig: MenuItemConfig[] = [
  {
    id: "loterias",
    name: "Loterias",
    slug: "loterias",
    route: "#",
    visible: true,
    order: 1,
    icon: "clover",
    category: "page",
    editable: false,
    children: [
      {
        id: "lotofacil",
        name: "Lotofácil",
        slug: "lotofacil",
        route: "/lotofacil",
        visible: true,
        order: 1,
        icon: "circle",
        category: "lottery",
        editable: true,
        parent: "loterias",
        color: "#9C27B0",
        colorName: "violet",
        active: true,
      },
      {
        id: "megasena",
        name: "Mega-Sena",
        slug: "megasena",
        route: "/megasena",
        visible: true,
        order: 2,
        icon: "clover",
        category: "lottery",
        editable: true,
        parent: "loterias",
        color: "#00C853",
        colorName: "emerald",
        active: true,
      },
      {
        id: "quina",
        name: "Quina",
        slug: "quina",
        route: "/quina",
        visible: true,
        order: 3,
        icon: "star",
        category: "lottery",
        editable: true,
        parent: "loterias",
        color: "#2196F3",
        colorName: "sky",
        active: true,
      },
    ],
  },
  {
    id: "como-funciona",
    name: "Como Funciona",
    slug: "como-funciona",
    route: "/como-funciona",
    visible: true,
    order: 2,
    icon: "helpCircle",
    category: "page",
    editable: true,
  },
  {
    id: "sobre-nos",
    name: "Sobre Nós",
    slug: "sobre-nos",
    route: "/sobre-nos",
    visible: true,
    order: 3,
    icon: "info",
    category: "page",
    editable: true,
  },
  {
    id: "por-que-bolaomax",
    name: "Por que BolãoMax",
    slug: "por-que-bolaomax",
    route: "/por-que-bolaomax",
    visible: true,
    order: 4,
    icon: "trophy",
    category: "page",
    editable: true,
  },
  {
    id: "resultados",
    name: "Resultados",
    slug: "resultados",
    route: "/resultados",
    visible: true,
    order: 5,
    icon: "trophy",
    category: "page",
    editable: true,
  },
  {
    id: "clube-vip",
    name: "Clube VIP",
    slug: "clube-vip",
    route: "/clube-vip",
    visible: true,
    order: 6,
    icon: "crown",
    category: "page",
    editable: true,
  },
];

// Icon Map for menu items
const menuIconMap: Record<string, React.ElementType> = {
  circle: Circle,
  clover: Clover,
  star: Star,
  crown: Crown,
  fileText: FileText,
  info: Info,
  helpCircle: HelpCircle,
  trophy: Trophy,
  home: Home,
  menu: Menu,
};

// Menu Item Card Component with Drag and Drop support
const MenuItemCard = ({ 
  item, 
  onEdit, 
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  expanded,
  onToggleExpand,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
  index,
}: { 
  item: MenuItemConfig;
  onEdit: (item: MenuItemConfig) => void;
  onToggleVisibility: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onDragStart?: (e: React.DragEvent, id: string, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  index?: number;
}) => {
  const { isDark } = useTheme();
  const Icon = menuIconMap[item.icon] || Menu;
  const hasChildren = item.children && item.children.length > 0;
  
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart && index !== undefined) {
      onDragStart(e, item.id, index);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragOver && index !== undefined) {
      onDragOver(e, index);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop && index !== undefined) {
      onDrop(e, index);
    }
  };
  
  return (
    <div className="space-y-2">
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={onDragEnd}
        onDrop={handleDrop}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
          isDark 
            ? "bg-[#0A0E14] border-[#1C2432] hover:border-[#2D3748]"
            : "bg-gray-50 border-gray-200 hover:border-gray-300"
        } ${!item.visible ? "opacity-50" : ""} ${
          isDragging ? "opacity-50 scale-[0.98] ring-2 ring-bolao-green/50" : ""
        } ${
          isDragOver ? "border-bolao-green border-2 bg-bolao-green/5" : ""
        }`}
      >
        {/* Drag Handle */}
        <div className={`cursor-grab active:cursor-grabbing touch-none ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
          <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Expand Toggle for items with children */}
        {hasChildren && (
          <button 
            onClick={onToggleExpand}
            className={`p-1 rounded hover:bg-bolao-green/10 transition-colors ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          item.color 
            ? `bg-[${item.color}]/20` 
            : isDark ? "bg-bolao-green/20" : "bg-bolao-green/10"
        }`}>
          <Icon className={`w-4 h-4 ${item.color ? `text-[${item.color}]` : "text-bolao-green"}`} />
        </div>
        
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            {item.name}
          </p>
          <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {item.route}
          </p>
        </div>
        
        {/* Order Badge */}
        <Badge className={`${isDark ? "bg-[#1C2432] text-gray-300" : "bg-gray-200 text-gray-600"} border-0 text-[10px]`}>
          #{item.order}
        </Badge>
        
        {/* Category Badge */}
        <Badge className={`border-0 text-[10px] ${
          item.category === "lottery" 
            ? "bg-violet-500/20 text-violet-400"
            : item.category === "custom"
              ? "bg-bolao-orange/20 text-bolao-orange"
              : "bg-bolao-green/20 text-bolao-green"
        }`}>
          {item.category === "lottery" ? "Loteria" : item.category === "custom" ? "Custom" : "Página"}
        </Badge>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Move Up/Down */}
          <button
            onClick={() => onMoveUp(item.id)}
            disabled={isFirst}
            className={`p-1.5 rounded transition-colors ${
              isFirst 
                ? "opacity-30 cursor-not-allowed" 
                : isDark 
                  ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title="Mover para cima"
          >
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
          </button>
          <button
            onClick={() => onMoveDown(item.id)}
            disabled={isLast}
            className={`p-1.5 rounded transition-colors ${
              isLast 
                ? "opacity-30 cursor-not-allowed" 
                : isDark 
                  ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title="Mover para baixo"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          
          {/* Visibility Toggle */}
          <button
            onClick={() => onToggleVisibility(item.id)}
            className={`p-1.5 rounded transition-colors ${
              isDark 
                ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title={item.visible ? "Ocultar do menu" : "Mostrar no menu"}
          >
            {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          {/* Edit Button */}
          {item.editable && (
            <button
              onClick={() => onEdit(item)}
              className={`p-1.5 rounded transition-colors ${
                isDark 
                  ? "hover:bg-bolao-green/20 text-gray-400 hover:text-bolao-green"
                  : "hover:bg-bolao-green/10 text-gray-500 hover:text-bolao-green"
              }`}
              title="Editar item"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Children Items */}
      {hasChildren && expanded && (
        <div className="ml-8 space-y-2 border-l-2 border-dashed pl-4 py-2 border-bolao-green/30">
          {item.children?.map((child, idx) => (
            <MenuItemCard
              key={child.id}
              item={child}
              onEdit={onEdit}
              onToggleVisibility={onToggleVisibility}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={idx === 0}
              isLast={idx === (item.children?.length || 1) - 1}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Menu Edit Modal Component
const MenuEditModal = ({
  item,
  isOpen,
  onClose,
  onSave,
  isNew,
}: {
  item: MenuItemConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItemConfig) => void;
  isNew?: boolean;
}) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<MenuItemConfig>(
    item || {
      id: `custom-${Date.now()}`,
      name: "",
      slug: "",
      route: "/",
      visible: true,
      order: 999,
      icon: "fileText",
      category: "custom",
      editable: true,
    }
  );
  
  // Update form data when item changes
  useState(() => {
    if (item) {
      setFormData(item);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-generate slug from name if empty
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const route = formData.route || `/${slug}`;
    onSave({ ...formData, slug, route });
    onClose();
  };
  
  if (!isOpen) return null;
  
  const iconOptions = Object.keys(menuIconMap);
  const categoryOptions = [
    { value: "page", label: "Página" },
    { value: "lottery", label: "Loteria" },
    { value: "custom", label: "Personalizado" },
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-xl border shadow-2xl animate-in slide-in-from-bottom-4 duration-300 ${
        isDark 
          ? "bg-[#111827] border-[#1C2432]"
          : "bg-white border-gray-200"
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {isNew ? "Adicionar Nova Página" : "Editar Item do Menu"}
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark 
                ? "hover:bg-[#1C2432] text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Sobre Nós"
              required
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                isDark 
                  ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
          
          {/* Slug */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="sobre-nos (auto-gerado)"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                isDark 
                  ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
          
          {/* Route */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Rota
            </label>
            <input
              type="text"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              placeholder="/sobre-nos"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                isDark 
                  ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
          
          {/* Icon and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Icon Selector */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Ícone
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            
            {/* Category */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "page" | "lottery" | "custom" })}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Lottery-specific fields */}
          {formData.category === "lottery" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Cor
                </label>
                <input
                  type="color"
                  value={formData.color || "#00C853"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded-lg border-0 cursor-pointer"
                />
              </div>
              <div className="flex items-end">
                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432]"
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                  />
                  <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Ativo</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Visibility */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            isDark 
              ? "bg-[#0A0E14] border-[#1C2432]"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Visível no Menu</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mostrar este item no menu de navegação</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, visible: !formData.visible })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.visible ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                formData.visible ? "left-7" : "left-1"
              }`} />
            </button>
          </div>
          
          {/* Preview */}
          <div className={`p-3 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <p className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Preview</p>
            <div className="flex items-center gap-3">
              {(() => {
                const PreviewIcon = menuIconMap[formData.icon] || Menu;
                return (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      formData.color 
                        ? "bg-opacity-20" 
                        : "bg-bolao-green/20"
                    }`} style={{ backgroundColor: formData.color ? `${formData.color}20` : undefined }}>
                      <PreviewIcon className="w-4 h-4" style={{ color: formData.color || "#00C853" }} />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formData.name || "Nome do Item"}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isNew ? "Adicionar" : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Content Management Section Component
const ContentManagementSection = () => {
  const { isDark } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  // Default content for each page (would be loaded from localStorage/backend in production)
  const [pageContent, setPageContent] = useState({
    "como-funciona": {
      title: "Como Funciona o BolãoMax",
      description: "Entenda o processo de participação em bolões de forma simples e transparente.",
      steps: [
        { title: "Escolha seu bolão", description: "Navegue pelos bolões disponíveis e escolha o que mais combina com você." },
        { title: "Defina sua participação", description: "Escolha quanto quer investir no bolão selecionado." },
        { title: "Pagamento seguro", description: "Realize o pagamento via PIX ou cartão de crédito." },
        { title: "Acompanhe o resultado", description: "Receba notificações e acompanhe os sorteios em tempo real." },
      ],
    },
    "sobre-nos": {
      title: "Sobre o BolãoMax",
      mission: "Nossa missão é democratizar o acesso aos grandes bolões de loteria, permitindo que qualquer pessoa participe de prêmios milionários com pouco investimento.",
      vision: "Ser a maior e mais confiável plataforma de bolões do Brasil, conectando milhões de brasileiros aos seus sonhos.",
      history: "Fundada em 2024, a BolãoMax nasceu da paixão por loterias e da vontade de criar uma forma mais acessível e segura de participar de bolões.",
      team: "Nossa equipe é formada por especialistas em tecnologia, loterias e segurança digital.",
    },
    "por-que-bolaomax": {
      title: "Por que escolher o BolãoMax?",
      benefits: [
        "Segurança garantida em todas as transações",
        "Transparência total nos resultados",
        "Suporte 24/7 via chat e WhatsApp",
        "Prêmios pagos automaticamente na sua conta",
        "Maiores bolões do Brasil com as melhores cotas",
      ],
      differentials: "Somos a única plataforma que oferece bolões com participação acessível a partir de R$ 20,00, permitindo que qualquer pessoa participe dos maiores prêmios do Brasil com investimento consciente e responsável.",
    },
    "resultados": {
      title: "Resultados dos Sorteios",
      updateFrequency: "Atualizamos os resultados automaticamente após cada sorteio oficial da Caixa Econômica Federal.",
      dataSource: "Todos os dados são obtidos diretamente da API oficial da Caixa.",
    },
  });
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  const handleSave = (section: string) => {
    // In production, this would save to backend/localStorage
    localStorage.setItem(`bolaomax_content_${section}`, JSON.stringify(pageContent[section as keyof typeof pageContent]));
    setSavedMessage(`Conteúdo de "${section}" salvo com sucesso!`);
    setTimeout(() => setSavedMessage(null), 3000);
  };
  
  const handleRestore = (section: string) => {
    // Restore default content (in production, would fetch from backend)
    setSavedMessage(`Conteúdo de "${section}" restaurado para o padrão.`);
    setTimeout(() => setSavedMessage(null), 3000);
  };
  
  const ContentSection = ({ 
    id, 
    title, 
    icon: Icon 
  }: { 
    id: string; 
    title: string; 
    icon: React.ElementType;
  }) => {
    const isExpanded = expandedSection === id;
    const content = pageContent[id as keyof typeof pageContent];
    
    return (
      <div className={`border rounded-lg overflow-hidden transition-all ${
        isDark 
          ? "border-[#1C2432] bg-[#0A0E14]/50"
          : "border-gray-200 bg-gray-50"
      }`}>
        {/* Section Header - Clickable */}
        <button
          onClick={() => toggleSection(id)}
          className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
            isExpanded
              ? isDark ? "bg-bolao-green/5" : "bg-bolao-green/5"
              : isDark ? "hover:bg-[#1C2432]/50" : "hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? "bg-bolao-green/20" : "bg-bolao-green/10"
            }`}>
              <Icon className="w-4 h-4 text-bolao-green" />
            </div>
            <div>
              <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h4>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Editar conteúdo da página
              </p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${
            isExpanded ? "rotate-180" : ""
          } ${isDark ? "text-gray-400" : "text-gray-500"}`} />
        </button>
        
        {/* Section Content - Expandable */}
        {isExpanded && (
          <div className={`p-4 border-t space-y-4 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
            {/* Warning Banner */}
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              isDark 
                ? "bg-amber-500/10 border border-amber-500/20"
                : "bg-amber-50 border border-amber-200"
            }`}>
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className={`text-xs ${isDark ? "text-amber-200" : "text-amber-800"}`}>
                Alterações afetarão a página "{title}" em todo o site.
              </p>
            </div>
            
            {/* Dynamic Fields based on section */}
            {id === "como-funciona" && content && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Título da Página
                  </label>
                  <input
                    type="text"
                    value={(content as typeof pageContent["como-funciona"]).title}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "como-funciona": { ...prev["como-funciona"], title: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={(content as typeof pageContent["como-funciona"]).description}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "como-funciona": { ...prev["como-funciona"], description: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Passos do Processo
                  </label>
                  {(content as typeof pageContent["como-funciona"]).steps.map((step, idx) => (
                    <div key={idx} className={`p-3 rounded-lg mb-2 ${isDark ? "bg-[#111827]" : "bg-white"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-bolao-green/20 text-bolao-green text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...(content as typeof pageContent["como-funciona"]).steps];
                            newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                            setPageContent(prev => ({
                              ...prev,
                              "como-funciona": { ...prev["como-funciona"], steps: newSteps }
                            }));
                          }}
                          className={`flex-1 px-2 py-1 rounded border text-sm focus:outline-none focus:border-bolao-green ${
                            isDark 
                              ? "bg-[#0A0E14] border-[#1C2432] text-white"
                              : "bg-gray-50 border-gray-200 text-gray-900"
                          }`}
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={step.description}
                        onChange={(e) => {
                          const newSteps = [...(content as typeof pageContent["como-funciona"]).steps];
                          newSteps[idx] = { ...newSteps[idx], description: e.target.value };
                          setPageContent(prev => ({
                            ...prev,
                            "como-funciona": { ...prev["como-funciona"], steps: newSteps }
                          }));
                        }}
                        className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:border-bolao-green resize-none ${
                          isDark 
                            ? "bg-[#0A0E14] border-[#1C2432] text-white"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {id === "sobre-nos" && content && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Título
                  </label>
                  <input
                    type="text"
                    value={(content as typeof pageContent["sobre-nos"]).title}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "sobre-nos": { ...prev["sobre-nos"], title: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Missão
                  </label>
                  <textarea
                    rows={3}
                    value={(content as typeof pageContent["sobre-nos"]).mission}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "sobre-nos": { ...prev["sobre-nos"], mission: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Visão
                  </label>
                  <textarea
                    rows={3}
                    value={(content as typeof pageContent["sobre-nos"]).vision}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "sobre-nos": { ...prev["sobre-nos"], vision: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    História
                  </label>
                  <textarea
                    rows={3}
                    value={(content as typeof pageContent["sobre-nos"]).history}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "sobre-nos": { ...prev["sobre-nos"], history: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Sobre a Equipe
                  </label>
                  <textarea
                    rows={2}
                    value={(content as typeof pageContent["sobre-nos"]).team}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "sobre-nos": { ...prev["sobre-nos"], team: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            )}
            
            {id === "por-que-bolaomax" && content && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Título
                  </label>
                  <input
                    type="text"
                    value={(content as typeof pageContent["por-que-bolaomax"]).title}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "por-que-bolaomax": { ...prev["por-que-bolaomax"], title: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Benefícios (um por linha)
                  </label>
                  <textarea
                    rows={6}
                    value={(content as typeof pageContent["por-que-bolaomax"]).benefits.join("\n")}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "por-que-bolaomax": { ...prev["por-que-bolaomax"], benefits: e.target.value.split("\n") }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Diferencial Principal
                  </label>
                  <textarea
                    rows={3}
                    value={(content as typeof pageContent["por-que-bolaomax"]).differentials}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "por-que-bolaomax": { ...prev["por-que-bolaomax"], differentials: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            )}
            
            {id === "resultados" && content && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Título
                  </label>
                  <input
                    type="text"
                    value={(content as typeof pageContent["resultados"]).title}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "resultados": { ...prev["resultados"], title: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Frequência de Atualização
                  </label>
                  <textarea
                    rows={2}
                    value={(content as typeof pageContent["resultados"]).updateFrequency}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "resultados": { ...prev["resultados"], updateFrequency: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Fonte dos Dados
                  </label>
                  <textarea
                    rows={2}
                    value={(content as typeof pageContent["resultados"]).dataSource}
                    onChange={(e) => setPageContent(prev => ({
                      ...prev,
                      "resultados": { ...prev["resultados"], dataSource: e.target.value }
                    }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore(id)}
                className={`text-xs ${isDark ? "border-[#1C2432]" : ""}`}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Restaurar Padrão
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave(id)}
                className="bg-bolao-green hover:bg-bolao-green-dark text-white text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            Gerenciamento de Conteúdo
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Edite o conteúdo das páginas principais
          </p>
        </div>
      </div>
      
      {/* Success Message */}
      {savedMessage && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          isDark 
            ? "bg-bolao-green/10 border border-bolao-green/20"
            : "bg-bolao-green/5 border border-bolao-green/20"
        }`}>
          <CheckCircle className="w-4 h-4 text-bolao-green" />
          <p className="text-sm text-bolao-green">{savedMessage}</p>
        </div>
      )}
      
      {/* Content Sections */}
      <div className="space-y-3">
        <ContentSection id="como-funciona" title="Como Funciona" icon={HelpCircle} />
        <ContentSection id="sobre-nos" title="Sobre Nós" icon={Info} />
        <ContentSection id="por-que-bolaomax" title="Por que BolãoMax" icon={Trophy} />
        <ContentSection id="resultados" title="Resultados" icon={Trophy} />
      </div>
    </Card>
  );
};

// NOTE: LotteryManagementSection has been moved to its own dedicated page at /admin/loterias
// See src/web/pages/admin/loterias.tsx for lottery management functionality

// General Tab Content
const GeneralTab = () => {
  const { isDark } = useTheme();
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>(defaultMenuConfig);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["loterias"]));
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemConfig | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  
  // Drag and drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Toggle item expansion
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };
  
  // Toggle visibility
  const toggleVisibility = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, visible: !item.visible };
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child) =>
              child.id === id ? { ...child, visible: !child.visible } : child
            ),
          };
        }
        return item;
      })
    );
  };
  
  // Move item up/down
  const moveItem = (id: string, direction: "up" | "down") => {
    setMenuItems((prev) => {
      const items = [...prev];
      const idx = items.findIndex((item) => item.id === id);
      
      if (idx !== -1) {
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx >= 0 && newIdx < items.length) {
          [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
          // Update order numbers
          items.forEach((item, i) => {
            item.order = i + 1;
          });
        }
      }
      
      return items;
    });
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string, index: number) => {
    setDraggedItemId(id);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };
  
  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }
    
    setMenuItems((prev) => {
      const items = [...prev];
      const [draggedItem] = items.splice(draggedIndex, 1);
      items.splice(dropIndex, 0, draggedItem);
      
      // Update order numbers
      items.forEach((item, i) => {
        item.order = i + 1;
      });
      
      return items;
    });
    
    handleDragEnd();
  };
  
  // Reset to default order
  const handleResetOrder = () => {
    if (showResetConfirm) {
      setMenuItems(defaultMenuConfig);
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };
  
  // Open edit modal
  const openEditModal = (item: MenuItemConfig) => {
    setSelectedItem(item);
    setIsNewItem(false);
    setEditModalOpen(true);
  };
  
  // Open new item modal
  const openNewItemModal = () => {
    setSelectedItem(null);
    setIsNewItem(true);
    setEditModalOpen(true);
  };
  
  // Save item
  const saveItem = (item: MenuItemConfig) => {
    if (isNewItem) {
      setMenuItems((prev) => [...prev, { ...item, order: prev.length + 1 }]);
    } else {
      setMenuItems((prev) =>
        prev.map((existing) => {
          if (existing.id === item.id) {
            return item;
          }
          if (existing.children) {
            return {
              ...existing,
              children: existing.children.map((child) =>
                child.id === item.id ? item : child
              ),
            };
          }
          return existing;
        })
      );
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Site Information Card */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Informações do Site</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Nome do Site" defaultValue="BolãoMax" />
          <InputField label="URL do Site" defaultValue="https://bolaomax.com" />
          <div className="md:col-span-2">
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Descrição</label>
            <textarea
              rows={3}
              defaultValue="A melhor plataforma de bolões de loteria do Brasil. Participe de bolões maiores com pouco investimento."
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                isDark 
                  ? "bg-[#0A0E14] border-[#1C2432] text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>
          <InputField label="Email de Contato" type="email" defaultValue="contato@bolaomax.com" />
          <InputField label="Telefone" type="tel" defaultValue="(11) 99999-9999" />
        </div>
      </Card>
      
      {/* Site Visibility Card */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <Eye className="w-5 h-5 text-bolao-green" />
          Visibilidade no Site
        </h3>
        <p className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Controle quais seções aparecem no site. Desative temporariamente recursos sem excluir dados.
        </p>
        <div className="space-y-3">
          <ToggleSwitch 
            label="Mostrar Loterias Internacionais"
            description="Exibe a página /internacional com sistema de afiliados TheLotter"
            checked={true}
            onChange={() => {}}
          />
          <ToggleSwitch 
            label="Mostrar Sistema de Bolões"
            description="Oculta todos os cards de bolões nas páginas de loterias (mantém apenas informações)"
            checked={true}
            onChange={() => {}}
          />
        </div>
        <div className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${
          isDark 
            ? "bg-amber-500/5 border-amber-500/20"
            : "bg-amber-50 border-amber-200"
        }`}>
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              <strong>Nota:</strong> As configurações de visibilidade são salvas no localStorage. 
              Desativar não exclui dados, apenas oculta do frontend.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Menu Management Card */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Gerenciamento de Menu e Páginas
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Arraste para reordenar ou use as setas. Alterações são salvas automaticamente.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetOrder}
              className={`text-sm ${showResetConfirm ? "border-red-500 text-red-500 hover:bg-red-500/10" : ""}`}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              {showResetConfirm ? "Confirmar Reset" : "Resetar Ordem"}
            </Button>
            <Button
              onClick={openNewItemModal}
              className="bg-bolao-green hover:bg-bolao-green-dark text-white text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Adicionar Página
            </Button>
          </div>
        </div>
        
        {/* Menu Items List with Drag and Drop */}
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <MenuItemCard
              key={item.id}
              item={item}
              index={idx}
              onEdit={openEditModal}
              onToggleVisibility={toggleVisibility}
              onMoveUp={(id) => moveItem(id, "up")}
              onMoveDown={(id) => moveItem(id, "down")}
              isFirst={idx === 0}
              isLast={idx === menuItems.length - 1}
              expanded={expandedItems.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDragging={draggedItemId === item.id}
              isDragOver={dragOverIndex === idx}
            />
          ))}
        </div>
        
        {/* Info Banner */}
        <div className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${
          isDark 
            ? "bg-bolao-green/5 border-bolao-green/20"
            : "bg-bolao-green/5 border-bolao-green/20"
        }`}>
          <Info className="w-4 h-4 text-bolao-green mt-0.5 flex-shrink-0" />
          <div>
            <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              <strong>Arraste</strong> os itens pelo ícone <GripVertical className="w-3 h-3 inline mx-0.5" /> para reordenar, 
              ou use as <strong>setas ↑↓</strong> para mover. O <strong>botão de olho</strong> <Eye className="w-3 h-3 inline mx-0.5" /> 
              controla a visibilidade no menu. Clique em <strong>"Resetar Ordem"</strong> para restaurar a ordem padrão.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Content Management Card */}
      <ContentManagementSection />
      
      {/* Lottery Management Link Card */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? "bg-bolao-green/10" : "bg-bolao-green/5"}`}>
              <Trophy className="w-6 h-6 text-bolao-green" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Gerenciamento de Loterias
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Gerencie todas as loterias disponíveis na plataforma em uma página dedicada
              </p>
            </div>
          </div>
          <Link href="/admin/loterias">
            <Button className="bg-bolao-green hover:bg-bolao-green-dark text-white">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ir para Loterias
            </Button>
          </Link>
        </div>
      </Card>
      
      {/* Edit Modal */}
      <MenuEditModal
        item={selectedItem}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={saveItem}
        isNew={isNewItem}
      />
    </div>
  );
};

// Campanhas Especiais por Loteria Component
const CampanhasLoteriasSection = () => {
  const { isDark } = useTheme();
  const [campanhas, setCampanhas] = useState([
    {
      id: 1,
      loteria: "Mega-Sena",
      campanha: "Mega da Virada 2026",
      cor: "#10B981",
      corBg: "from-emerald-600 to-amber-500",
      icon: "🎰",
      titulo: "Mega da Virada 2026",
      subtitulo: "O maior prêmio do ano!",
      prêmio: "R$ 550 milhões",
      data: "31/12/2026",
      ativo: true,
      banner: "/banners/mega-virada-2026.jpg",
      descricao: "Participe da Mega da Virada e concorra ao maior prêmio do ano",
    },
    {
      id: 2,
      loteria: "Lotofácil",
      campanha: "Lotofácil da Independência",
      cor: "#8B5CF6",
      corBg: "from-violet-600 to-purple-500",
      icon: "✨",
      titulo: "Lotofácil da Independência",
      subtitulo: "Prêmio especial de setembro",
      prêmio: "R$ 200 milhões",
      data: "07/09/2026",
      ativo: false,
      banner: "",
      descricao: "Sorteio especial da Independência com prêmio garantido",
    },
    {
      id: 3,
      loteria: "Dupla Sena",
      campanha: "Dupla Sena de Páscoa",
      cor: "#A855F7",
      corBg: "from-purple-600 to-pink-500",
      icon: "🔄",
      titulo: "Dupla Sena de Páscoa",
      subtitulo: "Duas chances de ganhar!",
      prêmio: "R$ 35 milhões",
      data: "20/04/2026",
      ativo: false,
      banner: "",
      descricao: "Sorteio especial de Páscoa com prêmio dobrado",
    },
    {
      id: 4,
      loteria: "Quina",
      campanha: "Quina de São João",
      cor: "#0EA5E9",
      corBg: "from-sky-600 to-blue-500",
      icon: "⭐",
      titulo: "Quina de São João",
      subtitulo: "Festa junina com prêmios!",
      prêmio: "R$ 220 milhões",
      data: "24/06/2026",
      ativo: false,
      banner: "",
      descricao: "Sorteio especial de São João com prêmio garantido",
    },
    {
      id: 5,
      loteria: "Lotomania",
      campanha: "Lotomania Especial",
      cor: "#EC4899",
      corBg: "from-pink-600 to-rose-500",
      icon: "⭐",
      titulo: "Lotomania Especial",
      subtitulo: "Prêmio acumulado!",
      prêmio: "R$ 15 milhões",
      data: "15/11/2026",
      ativo: false,
      banner: "",
      descricao: "Sorteio especial com prêmio acumulado",
    },
    {
      id: 6,
      loteria: "Timemania",
      campanha: "Timemania do Brasileirão",
      cor: "#22C55E",
      corBg: "from-green-600 to-emerald-500",
      icon: "⚽",
      titulo: "Timemania do Brasileirão",
      subtitulo: "Especial do Campeão",
      prêmio: "R$ 10 milhões",
      data: "08/12/2026",
      ativo: false,
      banner: "",
      descricao: "Campanha especial em homenagem ao campeão brasileiro",
    },
    {
      id: 7,
      loteria: "Dia de Sorte",
      campanha: "Dia de Sorte Especial de Natal",
      cor: "#F59E0B",
      corBg: "from-amber-600 to-yellow-500",
      icon: "☀️",
      titulo: "Dia de Sorte de Natal",
      subtitulo: "Sorte em dobro no Natal",
      prêmio: "R$ 18 milhões",
      data: "25/12/2026",
      ativo: false,
      banner: "",
      descricao: "Sorteio especial de Natal com prêmio garantido",
    },
    {
      id: 8,
      loteria: "Super Sete",
      campanha: "Super Sete do Ano Novo",
      cor: "#EC4899",
      corBg: "from-rose-600 to-pink-500",
      icon: "💎",
      titulo: "Super Sete do Ano Novo",
      subtitulo: "7 colunas da sorte",
      prêmio: "R$ 8 milhões",
      data: "30/12/2026",
      ativo: false,
      banner: "",
      descricao: "Sorteio especial de fim de ano",
    },
    {
      id: 9,
      loteria: "Federal",
      campanha: "Federal do Carnaval",
      cor: "#3B82F6",
      corBg: "from-blue-600 to-indigo-500",
      icon: "🏆",
      titulo: "Federal do Carnaval",
      subtitulo: "Bilhetes premiados",
      prêmio: "R$ 1.5 milhão",
      data: "01/03/2026",
      ativo: false,
      banner: "",
      descricao: "Sorteio especial do Carnaval com bilhetes únicos",
    },
  ]);

  const [editando, setEditando] = useState<number | null>(null);
  const [campanhaEdit, setCampanhaEdit] = useState<typeof campanhas[0] | null>(null);

  const handleEdit = (id: number) => {
    const campanha = campanhas.find(c => c.id === id);
    if (campanha) {
      setCampanhaEdit({...campanha});
      setEditando(id);
    }
  };

  const handleSave = () => {
    if (campanhaEdit && editando) {
      setCampanhas(prev => prev.map(c => c.id === editando ? campanhaEdit : c));
      setEditando(null);
      setCampanhaEdit(null);
    }
  };

  const handleCancel = () => {
    setEditando(null);
    setCampanhaEdit(null);
  };

  const toggleAtivo = (id: number) => {
    setCampanhas(prev => prev.map(c => 
      c.id === id ? {...c, ativo: !c.ativo} : c
    ));
  };

  return (
    <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            Campanhas Especiais por Loteria
          </h3>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Configure banners especiais como Mega da Virada, Lotofácil da Independência, etc.
          </p>
        </div>
        <Button 
          className="bg-bolao-green hover:bg-bolao-green-dark text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="space-y-4">
        {campanhas.map((campanha) => (
          <Card 
            key={campanha.id}
            className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}
          >
            {editando === campanha.id && campanhaEdit ? (
              // Modo de Edição
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Loteria
                    </label>
                    <input
                      type="text"
                      value={campanhaEdit.loteria}
                      onChange={(e) => setCampanhaEdit({...campanhaEdit, loteria: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white" 
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                      disabled
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Nome da Campanha
                    </label>
                    <input
                      type="text"
                      value={campanhaEdit.campanha}
                      onChange={(e) => setCampanhaEdit({...campanhaEdit, campanha: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white" 
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Título do Banner
                    </label>
                    <input
                      type="text"
                      value={campanhaEdit.titulo}
                      onChange={(e) => setCampanhaEdit({...campanhaEdit, titulo: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white" 
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={campanhaEdit.subtitulo}
                      onChange={(e) => setCampanhaEdit({...campanhaEdit, subtitulo: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white" 
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Prêmio Estimado
                    </label>
                    <input
                      type="text"
                      value={campanhaEdit.prêmio}
                      onChange={(e) => setCampanhaEdit({...campanhaEdit, prêmio: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white" 
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Data do Sorteio
                    </label>
                    <input
                      type="text"
                      value={campanhaEdit.data}
                      onChange={(e) => setCampanhaEdit({...campanhaEdit, data: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white" 
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Descrição
                  </label>
                  <textarea
                    value={campanhaEdit.descricao}
                    onChange={(e) => setCampanhaEdit({...campanhaEdit, descricao: e.target.value})}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark 
                        ? "bg-[#111827] border-[#1C2432] text-white" 
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Banner/Imagem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={campanhaEdit.banner}
                      onChange={(e) => setCampanhaEdit({...campanhaEdit, banner: e.target.value})}
                      placeholder="/banners/campanha.jpg"
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white" 
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-bolao-green hover:bg-bolao-green-dark text-white"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              // Modo de Visualização
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Preview do Banner */}
                  <div 
                    className={`relative w-32 h-20 rounded-lg bg-gradient-to-br ${campanha.corBg} flex items-center justify-center overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="relative text-3xl">{campanha.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {campanha.campanha}
                      </h4>
                      <Badge 
                        className={campanha.ativo ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                      >
                        {campanha.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {campanha.loteria} • {campanha.data}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        <strong className="text-bolao-green">Prêmio:</strong> {campanha.prêmio}
                      </span>
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        <strong>Título:</strong> {campanha.titulo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleAtivo(campanha.id)}
                    variant="outline"
                    size="sm"
                    className={campanha.ativo ? "border-green-500/50 text-green-400" : ""}
                  >
                    {campanha.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => handleEdit(campanha.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:border-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <div className={`mt-4 p-3 rounded-lg border ${
        isDark ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-200"
      }`}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <p className="font-medium mb-1">Como usar as campanhas:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Ative uma campanha para exibir o banner especial na página da loteria</li>
              <li>Configure título, prêmio e data para cada campanha</li>
              <li>Faça upload de uma imagem personalizada ou use o padrão</li>
              <li>Apenas uma campanha pode estar ativa por loteria por vez</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Appearance Tab Content
const AppearanceTab = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* Dashboard de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-8 h-8 text-emerald-400" />
            <Badge className="bg-emerald-500/20 text-emerald-400">Ativo</Badge>
          </div>
          <div className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            9
          </div>
          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Campanhas Totais
          </div>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-400" />
            <Badge className="bg-blue-500/20 text-blue-400">Live</Badge>
          </div>
          <div className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            1
          </div>
          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Campanhas Ativas
          </div>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20" : "bg-purple-50 border-purple-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-purple-400" />
            <Badge className="bg-purple-500/20 text-purple-400">Info</Badge>
          </div>
          <div className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            9
          </div>
          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Loterias Cobertas
          </div>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <Upload className="w-8 h-8 text-amber-400" />
            <Badge className="bg-amber-500/20 text-amber-400">Assets</Badge>
          </div>
          <div className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
            24
          </div>
          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Banners Totais
          </div>
        </Card>
      </div>

      {/* Logo & Favicon */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Logo e Favicon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload label="Logo" description="Imagem principal do site (recomendado: 200x60px)" currentImage="logo" />
          <ImageUpload label="Favicon" description="Ícone da aba do navegador (32x32px)" />
        </div>
      </Card>

      {/* Banners */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Banners</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUpload label="Banner Home" description="1920x600px" />
          <ImageUpload label="Banner Login" description="600x800px" />
          <ImageUpload label="Banner Cadastro" description="600x800px" />
        </div>
      </Card>

      {/* Theme */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Tema</h3>
        <ThemeToggle />
      </Card>

      {/* Colors */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Cores Personalizadas</h3>
        <div className="space-y-3">
          <ColorPicker label="Cor Primária" defaultValue="#00C853" variable="--primary" />
          <ColorPicker label="Cor Secundária" defaultValue="#1F2937" variable="--secondary" />
          <ColorPicker label="Cor de Destaque" defaultValue="#FF9500" variable="--accent" />
        </div>

        {/* Preview */}
        <div className={`mt-6 p-4 rounded-lg border ${
          isDark 
            ? "bg-[#0A0E14] border-[#1C2432]"
            : "bg-gray-50 border-gray-200"
        }`}>
          <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Preview</p>
          <div className="flex items-center gap-3">
            <Button className="bg-bolao-green hover:bg-bolao-green-dark text-white">
              Botão Primário
            </Button>
            <Button variant="outline">
              Botão Secundário
            </Button>
            <Badge className="bg-bolao-orange/10 text-bolao-orange border-0">
              Badge
            </Badge>
          </div>
        </div>
      </Card>

      {/* Campanhas Especiais por Loteria */}
      <CampanhasLoteriasSection />
    </div>
  );
};

// TheLotter Integration Card Component
const TheLotterIntegrationSection = () => {
  const { isDark } = useTheme();
  const [config, setConfig] = useState({
    affiliateId: '',
    affiliateUrl: 'https://www.thelotter.com',
    commissionRate: 25,
    trackingEnabled: true,
    trackingCode: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    testMode: true,
    paymentThreshold: 100,
    currency: 'BRL' as 'BRL' | 'USD',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Load config on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('thelotter_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load TheLotter config:', error);
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('thelotter_config', JSON.stringify({ ...config, lastSync: new Date() }));
      setTimeout(() => {
        setSaving(false);
        setConnectionStatus('success');
      }, 1000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaving(false);
    }
  };

  const testConnection = () => {
    if (!config.affiliateId) {
      setConnectionStatus('error');
      return;
    }
    setTestingConnection(true);
    setConnectionStatus('idle');
    // Simulate connection test
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionStatus('success');
    }, 2000);
  };

  // Mock stats for display
  const stats = {
    totalReferrals: 156,
    totalCommissions: 2340.50,
    conversionRate: 4.2,
  };

  return (
    <Card className={`overflow-hidden ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      {/* Header */}
      <div 
        className={`p-5 flex items-center justify-between cursor-pointer ${
          isDark ? "hover:bg-[#1C2432]/50" : "hover:bg-gray-50"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                TheLotter - Loterias Internacionais
              </h3>
              <Badge className={config.affiliateId 
                ? "bg-bolao-green/20 text-bolao-green" 
                : "bg-amber-500/20 text-amber-400"
              }>
                {config.affiliateId ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Não Configurado
                  </>
                )}
              </Badge>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Programa de afiliados para loterias internacionais
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""} ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`} />
      </div>

      {expanded && (
        <div className={`p-5 pt-0 space-y-6 border-t ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
          
          {/* Connection Status */}
          {connectionStatus === 'success' && (
            <div className={`p-4 rounded-lg border ${isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className={`font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  Configuração salva com sucesso!
                </span>
              </div>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className={`p-4 rounded-lg border ${isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className={`font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>
                  Por favor, preencha o Affiliate ID
                </span>
              </div>
            </div>
          )}

          {/* Stats Preview */}
          {config.affiliateId && (
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Referências este mês</p>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.totalReferrals}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Comissões (R$)</p>
                <p className="text-2xl font-bold text-bolao-green">R$ {stats.totalCommissions.toLocaleString('pt-BR')}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Taxa de Conversão</p>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.conversionRate}%</p>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Modo de Operação</p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {config.testMode 
                    ? "Sandbox - Links de teste (sem comissões reais)" 
                    : "Produção - Links de afiliado ativos"
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium ${!config.testMode ? "text-bolao-green" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Produção
                </span>
                <button
                  onClick={() => setConfig({ ...config, testMode: !config.testMode })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    config.testMode ? "bg-amber-500" : "bg-bolao-green"
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow ${
                    config.testMode ? "left-8" : "left-1"
                  }`} />
                </button>
                <span className={`text-sm font-medium ${config.testMode ? "text-amber-500" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Sandbox
                </span>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Credenciais do Afiliado
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Affiliate ID *
                </label>
                <input
                  type="text"
                  value={config.affiliateId}
                  onChange={(e) => setConfig({ ...config, affiliateId: e.target.value })}
                  placeholder="Seu ID de afiliado TheLotter"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  URL Base do Afiliado
                </label>
                <input
                  type="url"
                  value={config.affiliateUrl}
                  onChange={(e) => setConfig({ ...config, affiliateUrl: e.target.value })}
                  placeholder="https://www.thelotter.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Taxa de Comissão (%)
                </label>
                <input
                  type="number"
                  value={config.commissionRate}
                  onChange={(e) => setConfig({ ...config, commissionRate: Number(e.target.value) })}
                  min="0"
                  max="100"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Limite de Pagamento (R$)
                </label>
                <input
                  type="number"
                  value={config.paymentThreshold}
                  onChange={(e) => setConfig({ ...config, paymentThreshold: Number(e.target.value) })}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* API Keys (Optional) */}
          <div className="space-y-4">
            <h4 className={`font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              API (Opcional - para integração futura)
              <Badge variant="outline" className="text-xs">Em breve</Badge>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Sua API Key (opcional)"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-orange-500 ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${
                      isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-200"
                    }`}
                  >
                    {showApiKey ? (
                      <EyeOff className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    ) : (
                      <Eye className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  API Secret
                </label>
                <div className="relative">
                  <input
                    type={showApiSecret ? "text" : "password"}
                    value={config.apiSecret}
                    onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                    placeholder="Seu API Secret (opcional)"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-orange-500 ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${
                      isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-200"
                    }`}
                  >
                    {showApiSecret ? (
                      <EyeOff className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    ) : (
                      <Eye className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook & Tracking */}
          <div className="space-y-4">
            <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Tracking e Webhook
            </h4>
            
            <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14]/50 border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Webhook URL para Conversões</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-orange-500 break-all flex-1">
                  https://bolaomax.com/api/webhooks/thelotter
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="shrink-0"
                  onClick={() => navigator.clipboard.writeText('https://bolaomax.com/api/webhooks/thelotter')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Código de Tracking / Pixel (opcional)
              </label>
              <textarea
                value={config.trackingCode}
                onChange={(e) => setConfig({ ...config, trackingCode: e.target.value })}
                placeholder="Cole aqui seu código de tracking do TheLotter (se houver)"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 resize-none font-mono text-sm ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Tracking Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
            }`}>
              <div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  Tracking de Cliques Ativo
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Registra todos os cliques nos links de afiliado
                </p>
              </div>
              <button
                onClick={() => setConfig({ ...config, trackingEnabled: !config.trackingEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.trackingEnabled ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                  config.trackingEnabled ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className={`p-4 rounded-lg border ${isDark ? "bg-purple-500/5 border-purple-500/20" : "bg-purple-50 border-purple-200"}`}>
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className={`font-medium mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Como funciona a integração?
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Configure seu Affiliate ID do TheLotter para ativar os links de afiliado na página de Loterias Internacionais. 
                  Cada clique em "Jogar Agora" redireciona o usuário para o TheLotter com seu ID de rastreamento.
                  Você recebe comissões por cada compra realizada através dos seus links.
                </p>
                <a 
                  href="https://www.thelotter.com/pt/affiliates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-purple-500 hover:text-purple-400"
                >
                  Acessar painel de afiliados TheLotter
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1C2432]">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testingConnection}
              className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
            >
              {testingConnection ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Integrations Tab Content
const IntegrationsTab = () => (
  <div className="space-y-4">
    {/* TheLotter Integration */}
    <TheLotterIntegrationSection />
    
    {/* Other Integrations */}
    <IntegrationCard
      icon={Mail}
      iconBg="bg-purple-500/10"
      iconColor="text-purple-400"
      name="Email (SMTP)"
      description="Envio de emails transacionais"
      connected={true}
      onConnect={() => {}}
    />
    <IntegrationCard
      icon={MessageSquare}
      iconBg="bg-bolao-green/10"
      iconColor="text-bolao-green"
      name="SMS"
      description="Notificações por SMS"
      connected={false}
      onConnect={() => {}}
    />
    <IntegrationCard
      icon={BarChart3}
      iconBg="bg-bolao-orange/10"
      iconColor="text-bolao-orange"
      name="Analytics"
      description="Google Analytics e métricas"
      connected={false}
      onConnect={() => {}}
    />
  </div>
);

// Security Tab Content
const SecurityTab = () => {
  const { isDark } = useTheme();
  const [twoFA, setTwoFA] = useState(true);

  const logs = [
    { action: "Login realizado", user: "admin@bolaomax.com", date: "19/12/2024 14:32", ip: "189.123.45.67" },
    { action: "Configurações alteradas", user: "admin@bolaomax.com", date: "19/12/2024 10:15", ip: "189.123.45.67" },
    { action: "Saque aprovado", user: "admin@bolaomax.com", date: "18/12/2024 16:45", ip: "189.123.45.67" },
    { action: "Usuário bloqueado", user: "admin@bolaomax.com", date: "18/12/2024 14:20", ip: "189.123.45.67" },
  ];

  const sessions = [
    { device: "Chrome em Windows", location: "São Paulo, BR", current: true, lastActive: "Agora" },
    { device: "Safari em iPhone", location: "São Paulo, BR", current: false, lastActive: "Há 2 horas" },
  ];

  return (
    <div className="space-y-6">
      {/* 2FA */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Autenticação de Dois Fatores</h3>
        <ToggleSwitch
          checked={twoFA}
          onChange={() => setTwoFA(!twoFA)}
          label="2FA obrigatório para administradores"
          description="Exigir autenticação de dois fatores para todos os acessos admin"
        />
      </Card>

      {/* Password Policy */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Política de Senhas</h3>
        <div className="space-y-3">
          <ToggleSwitch checked={true} onChange={() => {}} label="Mínimo de 8 caracteres" />
          <ToggleSwitch checked={true} onChange={() => {}} label="Exigir letras maiúsculas e minúsculas" />
          <ToggleSwitch checked={true} onChange={() => {}} label="Exigir números" />
          <ToggleSwitch checked={false} onChange={() => {}} label="Exigir caracteres especiais" />
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Sessões Ativas</h3>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            Encerrar todas as outras
          </Button>
        </div>
        <div className="space-y-2">
          {sessions.map((session, i) => (
            <ActiveSessionItem key={i} {...session} />
          ))}
        </div>
      </Card>

      {/* Access Logs */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Logs de Acesso</h3>
        <div>
          {logs.map((log, i) => (
            <SecurityLogItem key={i} {...log} />
          ))}
        </div>
      </Card>
    </div>
  );
};

// Pagar.me (Stone) Settings Tab Content - Gateway Oficial de Pagamentos
const PagarmeSettingsTab = () => {
  const { isDark } = useTheme();
  const [sandboxMode, setSandboxMode] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connected" | "disconnected">("idle");
  
  // Form state
  const [apiKey, setApiKey] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  const testConnection = () => {
    setTestingConnection(true);
    setConnectionStatus("idle");
    // Simulate API connection test
    setTimeout(() => {
      setTestingConnection(false);
      // Check if keys are filled to determine connection status
      if (apiKey && encryptionKey) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("disconnected");
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Pagar.me Header Card */}
      <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00A868] to-[#008B56] flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Pagar.me</h3>
                <Badge className="bg-[#00A868]/20 text-[#00A868] border-0 text-[10px]">
                  <Star className="w-3 h-3 mr-1" />
                  Gateway Oficial
                </Badge>
                {connectionStatus === "connected" && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {connectionStatus === "disconnected" && (
                  <Badge className="bg-red-500/20 text-red-400 border-0">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Desconectado
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Processamento de pagamentos via PIX, Cartão e Boleto • Powered by Stone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="https://docs.pagar.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? "bg-[#1C2432] text-gray-300 hover:bg-[#252D3D]" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              Documentação
              <ExternalLink className="w-3 h-3" />
            </a>
            <Button 
              onClick={testConnection}
              disabled={testingConnection}
              variant="outline"
              className="border-[#00A868] text-[#00A868] hover:bg-[#00A868]/10"
            >
              {testingConnection ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Connection Status Alerts */}
        {connectionStatus === "connected" && (
          <div className={`p-4 rounded-lg border mb-6 ${isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className={`font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                Conexão com Pagar.me estabelecida com sucesso!
              </span>
            </div>
            <p className={`mt-1 text-sm ${isDark ? "text-emerald-400/70" : "text-emerald-600/70"}`}>
              Seu sistema está pronto para processar pagamentos.
            </p>
          </div>
        )}

        {connectionStatus === "disconnected" && (
          <div className={`p-4 rounded-lg border mb-6 ${isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className={`font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>
                Erro na conexão. Verifique suas credenciais.
              </span>
            </div>
            <p className={`mt-1 text-sm ${isDark ? "text-red-400/70" : "text-red-600/70"}`}>
              Certifique-se de que a API Key e Encryption Key estão corretas.
            </p>
          </div>
        )}

        {/* Environment Toggle */}
        <div className={`p-4 rounded-lg border mb-6 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Ambiente de Operação</p>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {sandboxMode 
                  ? "🧪 Ambiente de testes - nenhuma cobrança real será processada" 
                  : "🚀 Ambiente de produção - cobranças reais ativas"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${!sandboxMode ? "text-[#00A868]" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                Produção
              </span>
              <button
                onClick={() => setSandboxMode(!sandboxMode)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  sandboxMode ? "bg-amber-500" : "bg-[#00A868]"
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow ${
                  sandboxMode ? "left-8" : "left-1"
                }`} />
              </button>
              <span className={`text-sm font-medium ${sandboxMode ? "text-amber-500" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                Sandbox
              </span>
            </div>
          </div>
        </div>

        {/* API Credentials Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Credenciais da API</h4>
          </div>

          {/* API Key */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              API Key {sandboxMode ? "(Sandbox)" : "(Produção)"}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                placeholder={sandboxMode ? "sk_test_..." : "sk_live_..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-[#00A868] font-mono text-sm ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${
                  isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-200"
                }`}
              >
                {showApiKey ? (
                  <EyeOff className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                ) : (
                  <Eye className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                )}
              </button>
            </div>
            <p className={`text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Encontre sua API Key no Dashboard Pagar.me → Configurações → Chaves de API
            </p>
          </div>

          {/* Encryption Key */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Encryption Key {sandboxMode ? "(Sandbox)" : "(Produção)"}
            </label>
            <div className="relative">
              <input
                type={showEncryptionKey ? "text" : "password"}
                placeholder={sandboxMode ? "ek_test_..." : "ek_live_..."}
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-[#00A868] font-mono text-sm ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              <button
                onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${
                  isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-200"
                }`}
              >
                {showEncryptionKey ? (
                  <EyeOff className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                ) : (
                  <Eye className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                )}
              </button>
            </div>
            <p className={`text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Usada para criptografar dados sensíveis de cartão no frontend
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Webhook Secret
            </label>
            <div className="relative">
              <input
                type={showWebhookSecret ? "text" : "password"}
                placeholder="whsec_..."
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-[#00A868] font-mono text-sm ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              <button
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${
                  isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-200"
                }`}
              >
                {showWebhookSecret ? (
                  <EyeOff className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                ) : (
                  <Eye className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                )}
              </button>
            </div>
            <p className={`text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Usado para validar webhooks recebidos do Pagar.me
            </p>
          </div>
        </div>

        {/* Webhook URL Info */}
        <div className={`mt-6 p-4 rounded-lg border ${isDark ? "bg-[#0A0E14]/50 border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Webhook URL</p>
              <p className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Configure esta URL no seu Dashboard Pagar.me para receber notificações de pagamento
              </p>
              <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-white"} border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                <p className="font-mono text-sm text-[#00A868] break-all">
                  https://bolaomax.com/api/webhooks/pagarme
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Methods & Fees Configuration */}
      <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <Settings className="w-5 h-5 text-[#00A868]" />
          Métodos de Pagamento e Taxas
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-sky-400" />
              </div>
              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Cartão de Crédito</span>
            </div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Taxa (%)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue="3.99"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[#00A868] ${
                isDark 
                  ? "bg-[#111827] border-[#1C2432] text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>
          <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>PIX</span>
            </div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Taxa Fixa (R$)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue="0.00"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[#00A868] ${
                isDark 
                  ? "bg-[#111827] border-[#1C2432] text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>
          <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Boleto Bancário</span>
            </div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Taxa Fixa (R$)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue="3.49"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[#00A868] ${
                isDark 
                  ? "bg-[#111827] border-[#1C2432] text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>
        </div>
      </Card>

      {/* Transaction Logs */}
      <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <Clock className="w-5 h-5 text-[#00A868]" />
          Últimas Transações Pagar.me
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                <th className={`text-left py-3 px-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Data/Hora</th>
                <th className={`text-left py-3 px-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Método</th>
                <th className={`text-left py-3 px-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Valor</th>
                <th className={`text-left py-3 px-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Status</th>
                <th className={`text-left py-3 px-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>ID Transação</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "21/02 14:32", type: "PIX", amount: "R$ 500,00", status: "paid", id: "tran_XkL9...3mN" },
                { date: "21/02 13:15", type: "Cartão", amount: "R$ 199,00", status: "paid", id: "tran_Yw8P...7qR" },
                { date: "21/02 11:42", type: "PIX", amount: "R$ 1.000,00", status: "paid", id: "tran_Zu6T...1sV" },
                { date: "20/02 18:20", type: "Boleto", amount: "R$ 79,00", status: "waiting_payment", id: "tran_Av5W...9uX" },
                { date: "20/02 15:55", type: "PIX", amount: "R$ 250,00", status: "paid", id: "tran_Bx4Y...3wZ" },
              ].map((tx, idx) => (
                <tr key={idx} className={`border-b ${isDark ? "border-[#1C2432]/50" : "border-gray-100"}`}>
                  <td className={`py-3 px-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{tx.date}</td>
                  <td className="py-3 px-2">
                    <Badge className={
                      tx.type === "PIX" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : tx.type === "Boleto"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-sky-500/20 text-sky-400"
                    }>
                      {tx.type}
                    </Badge>
                  </td>
                  <td className={`py-3 px-2 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{tx.amount}</td>
                  <td className="py-3 px-2">
                    <Badge className={
                      tx.status === "paid" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : tx.status === "waiting_payment"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    }>
                      {tx.status === "paid" ? "Pago" : tx.status === "waiting_payment" ? "Aguardando" : "Recusado"}
                    </Badge>
                  </td>
                  <td className={`py-3 px-2 font-mono text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{tx.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Links */}
      <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <HelpCircle className="w-5 h-5 text-[#00A868]" />
          Links Úteis
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <a 
            href="https://docs.pagar.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
              isDark 
                ? "bg-[#0A0E14] border-[#1C2432] hover:border-[#00A868]/50" 
                : "bg-gray-50 border-gray-200 hover:border-[#00A868]/50"
            }`}
          >
            <FileText className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Documentação API</span>
            <ExternalLink className={`w-3 h-3 ml-auto ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </a>
          <a 
            href="https://dashboard.pagar.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
              isDark 
                ? "bg-[#0A0E14] border-[#1C2432] hover:border-[#00A868]/50" 
                : "bg-gray-50 border-gray-200 hover:border-[#00A868]/50"
            }`}
          >
            <Home className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Dashboard</span>
            <ExternalLink className={`w-3 h-3 ml-auto ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </a>
          <a 
            href="https://docs.pagar.me/docs/webhooks" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
              isDark 
                ? "bg-[#0A0E14] border-[#1C2432] hover:border-[#00A868]/50" 
                : "bg-gray-50 border-gray-200 hover:border-[#00A868]/50"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Webhooks</span>
            <ExternalLink className={`w-3 h-3 ml-auto ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </a>
          <a 
            href="https://suporte.pagar.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
              isDark 
                ? "bg-[#0A0E14] border-[#1C2432] hover:border-[#00A868]/50" 
                : "bg-gray-50 border-gray-200 hover:border-[#00A868]/50"
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Suporte</span>
            <ExternalLink className={`w-3 h-3 ml-auto ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </a>
        </div>
      </Card>
    </div>
  );
};

// Main Component
const AdminConfiguracoes = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("geral");
  const [configuracoes, setConfiguracoes] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar configurações ao montar
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const configs = await configuracoesService.obterTodas();
      setConfiguracoes(configs);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Converter objeto de configurações para array
      const updates: any[] = [];
      Object.keys(configuracoes).forEach(categoria => {
        Object.keys(configuracoes[categoria]).forEach(chave => {
          updates.push({
            categoria,
            chave,
            valor: configuracoes[categoria][chave].valor
          });
        });
      });

      await configuracoesService.atualizarEmLote(updates);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const atualizarConfiguracao = (categoria: string, chave: string, valor: any) => {
    setConfiguracoes((prev: any) => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [chave]: {
          ...prev[categoria]?.[chave],
          valor: String(valor)
        }
      }
    }));
  };

  if (loading) {
    return (
      <AdminLayout title="Configurações" subtitle="Gerencie as configurações do sistema">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-bolao-green" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações" subtitle="Gerencie as configurações do sistema">
      {/* Mensagem de feedback */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-bolao-green/10 border-bolao-green text-bolao-green'
            : 'bg-red-500/10 border-red-500 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className={`p-2 sticky top-24 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <nav className="space-y-1">
              <TabButton active={activeTab === "geral"} onClick={() => setActiveTab("geral")} icon={Settings}>
                Geral
              </TabButton>
              <TabButton active={activeTab === "aparencia"} onClick={() => setActiveTab("aparencia")} icon={Palette}>
                Aparência
              </TabButton>
              <TabButton active={activeTab === "pagamentos"} onClick={() => setActiveTab("pagamentos")} icon={CreditCard}>
                Pagamentos
              </TabButton>
              <TabButton active={activeTab === "integracoes"} onClick={() => setActiveTab("integracoes")} icon={Link2}>
                Integrações
              </TabButton>
              <TabButton active={activeTab === "seguranca"} onClick={() => setActiveTab("seguranca")} icon={Shield}>
                Segurança
              </TabButton>
            </nav>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "geral" && <GeneralTab />}
          {activeTab === "aparencia" && <AppearanceTab />}
          {activeTab === "pagamentos" && <PagarmeSettingsTab />}
          {activeTab === "integracoes" && <IntegrationsTab />}
          {activeTab === "seguranca" && <SecurityTab />}
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          onClick={salvarConfiguracoes}
          disabled={saving}
          className="bg-bolao-green hover:bg-bolao-green-dark text-white font-semibold shadow-lg shadow-bolao-green/20"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminConfiguracoes;
