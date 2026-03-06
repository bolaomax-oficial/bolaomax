import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  Briefcase,
  Shield,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ChevronDown,
  Sparkles,
  FileText,
  Users,
  Wallet,
  ArrowDownToLine,
  BarChart3,
  MessageSquare,
  MessageCircle,
  Ticket,
} from "lucide-react";

// Types
interface Permission {
  module: string;
  actions: string[];
}

interface CriarSubUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Available modules and their actions with icons
const modulosDisponiveis = {
  boloes: { 
    label: "Bolões", 
    icon: Ticket,
    actions: [
      { key: "visualizar", label: "Visualizar" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
      { key: "excluir", label: "Excluir" },
    ]
  },
  usuarios: { 
    label: "Usuários", 
    icon: Users,
    actions: [
      { key: "visualizar", label: "Visualizar" },
      { key: "editar", label: "Editar" },
    ]
  },
  financeiro: { 
    label: "Financeiro", 
    icon: Wallet,
    actions: [
      { key: "visualizar", label: "Visualizar" },
    ]
  },
  saques: { 
    label: "Saques", 
    icon: ArrowDownToLine,
    actions: [
      { key: "visualizar", label: "Visualizar" },
      { key: "aprovar", label: "Aprovar" },
    ]
  },
  relatorios: { 
    label: "Relatórios", 
    icon: BarChart3,
    actions: [
      { key: "visualizar", label: "Visualizar" },
    ]
  },
  suporte: { 
    label: "Suporte", 
    icon: MessageSquare,
    actions: [
      { key: "visualizar", label: "Visualizar" },
      { key: "criar", label: "Criar" },
      { key: "editar", label: "Editar" },
    ]
  },
  whatsapp: { 
    label: "WhatsApp", 
    icon: MessageCircle,
    actions: [
      { key: "visualizar", label: "Visualizar" },
      { key: "enviar", label: "Enviar" },
    ]
  },
};

// Role templates
const roleTemplates: Record<string, { label: string; description: string; permissions: Permission[] }> = {
  gerente: {
    label: "Gerente",
    description: "Acesso completo a todos os módulos",
    permissions: [
      { module: "boloes", actions: ["visualizar", "criar", "editar", "excluir"] },
      { module: "usuarios", actions: ["visualizar", "editar"] },
      { module: "financeiro", actions: ["visualizar"] },
      { module: "saques", actions: ["visualizar", "aprovar"] },
      { module: "relatorios", actions: ["visualizar"] },
      { module: "suporte", actions: ["visualizar", "criar", "editar"] },
      { module: "whatsapp", actions: ["visualizar", "enviar"] },
    ]
  },
  atendente: {
    label: "Atendente",
    description: "Foco em suporte e comunicação",
    permissions: [
      { module: "boloes", actions: ["visualizar"] },
      { module: "usuarios", actions: ["visualizar"] },
      { module: "suporte", actions: ["visualizar", "criar", "editar"] },
      { module: "whatsapp", actions: ["visualizar", "enviar"] },
    ]
  },
  analista: {
    label: "Analista",
    description: "Acesso a relatórios e dados financeiros",
    permissions: [
      { module: "boloes", actions: ["visualizar"] },
      { module: "usuarios", actions: ["visualizar"] },
      { module: "financeiro", actions: ["visualizar"] },
      { module: "saques", actions: ["visualizar"] },
      { module: "relatorios", actions: ["visualizar"] },
    ]
  },
  operador: {
    label: "Operador",
    description: "Gestão operacional de bolões",
    permissions: [
      { module: "boloes", actions: ["visualizar", "criar", "editar"] },
      { module: "usuarios", actions: ["visualizar"] },
      { module: "suporte", actions: ["visualizar"] },
    ]
  },
};

// Cargo options
const cargoOptions = [
  { value: "gerente", label: "Gerente" },
  { value: "atendente", label: "Atendente" },
  { value: "analista", label: "Analista" },
  { value: "operador", label: "Operador" },
  { value: "personalizado", label: "Personalizado" },
];

export function CriarSubUsuarioModal({ isOpen, onClose, onSuccess }: CriarSubUsuarioModalProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    cargo: "atendente",
  });

  // Permissions state - track which actions are selected for each module
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});

  // Calculate total selected permissions
  const totalPermissions = useMemo(() => {
    return Object.values(selectedPermissions).reduce((acc, actions) => acc + actions.length, 0);
  }, [selectedPermissions]);

  // Check if an action is selected
  const isActionSelected = (module: string, action: string) => {
    return selectedPermissions[module]?.includes(action) ?? false;
  };

  // Toggle action selection
  const toggleAction = (module: string, action: string) => {
    setSelectedPermissions(prev => {
      const current = prev[module] || [];
      if (current.includes(action)) {
        const updated = current.filter(a => a !== action);
        if (updated.length === 0) {
          const { [module]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [module]: updated };
      }
      return { ...prev, [module]: [...current, action] };
    });
    
    // If manually changing permissions, set cargo to personalizado
    if (formData.cargo !== "personalizado") {
      setFormData(prev => ({ ...prev, cargo: "personalizado" }));
    }
  };

  // Select all actions for a module
  const selectAllModuleActions = (module: string) => {
    const moduleInfo = modulosDisponiveis[module as keyof typeof modulosDisponiveis];
    if (!moduleInfo) return;
    
    const allActions = moduleInfo.actions.map(a => a.key);
    setSelectedPermissions(prev => ({ ...prev, [module]: allActions }));
    
    if (formData.cargo !== "personalizado") {
      setFormData(prev => ({ ...prev, cargo: "personalizado" }));
    }
  };

  // Deselect all actions for a module
  const deselectAllModuleActions = (module: string) => {
    setSelectedPermissions(prev => {
      const { [module]: _, ...rest } = prev;
      return rest;
    });
    
    if (formData.cargo !== "personalizado") {
      setFormData(prev => ({ ...prev, cargo: "personalizado" }));
    }
  };

  // Apply role template
  const applyTemplate = (templateKey: string) => {
    const template = roleTemplates[templateKey];
    if (!template) return;

    const newPermissions: Record<string, string[]> = {};
    template.permissions.forEach(p => {
      newPermissions[p.module] = [...p.actions];
    });
    setSelectedPermissions(newPermissions);
    setFormData(prev => ({ ...prev, cargo: templateKey }));
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "Senhas não conferem";
    }

    if (totalPermissions === 0) {
      newErrors.permissions = "Selecione pelo menos uma permissão";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Format permissions for API
      const permissoes: Permission[] = Object.entries(selectedPermissions).map(([module, actions]) => ({
        module,
        actions,
      }));

      // API call
      const token = localStorage.getItem("bolaomax_token");
      const response = await fetch("/api/admin/sub-usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          telefone: formData.telefone,
          cargo: formData.cargo,
          permissoes,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar sub-usuário");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setErrors({ submit: "Erro ao criar sub-usuário. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      telefone: "",
      cargo: "atendente",
    });
    setSelectedPermissions({});
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <Card className={`relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col ${
        isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-5 border-b flex items-center justify-between ${
          isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-bolao-green/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-bolao-green" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Novo Sub-Usuário
              </h2>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Preencha os dados do colaborador
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Submit error */}
          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Basic Info Section */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <User className="w-4 h-4 text-bolao-green" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Nome completo *
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do colaborador"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors ${
                      isDark 
                        ? "bg-[#0A0E14] border border-[#1C2432] text-white placeholder:text-gray-500 focus:border-bolao-green/50 focus:outline-none"
                        : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-bolao-green focus:outline-none"
                    } ${errors.nome ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Email *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@bolaomax.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors ${
                      isDark 
                        ? "bg-[#0A0E14] border border-[#1C2432] text-white placeholder:text-gray-500 focus:border-bolao-green/50 focus:outline-none"
                        : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-bolao-green focus:outline-none"
                    } ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Telefone */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Telefone
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors ${
                      isDark 
                        ? "bg-[#0A0E14] border border-[#1C2432] text-white placeholder:text-gray-500 focus:border-bolao-green/50 focus:outline-none"
                        : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-bolao-green focus:outline-none"
                    }`}
                  />
                </div>
              </div>

              {/* Cargo */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Cargo
                </label>
                <div className="relative">
                  <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <select
                    value={formData.cargo}
                    onChange={(e) => {
                      const cargo = e.target.value;
                      setFormData(prev => ({ ...prev, cargo }));
                      if (cargo !== "personalizado" && roleTemplates[cargo]) {
                        applyTemplate(cargo);
                      }
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-colors appearance-none cursor-pointer ${
                      isDark 
                        ? "bg-[#0A0E14] border border-[#1C2432] text-white focus:border-bolao-green/50 focus:outline-none"
                        : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-bolao-green focus:outline-none"
                    }`}
                  >
                    {cargoOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Senha *
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-colors ${
                      isDark 
                        ? "bg-[#0A0E14] border border-[#1C2432] text-white placeholder:text-gray-500 focus:border-bolao-green/50 focus:outline-none"
                        : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-bolao-green focus:outline-none"
                    } ${errors.senha ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha}</p>}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                    placeholder="Repita a senha"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-colors ${
                      isDark 
                        ? "bg-[#0A0E14] border border-[#1C2432] text-white placeholder:text-gray-500 focus:border-bolao-green/50 focus:outline-none"
                        : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-bolao-green focus:outline-none"
                    } ${errors.confirmarSenha ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && <p className="text-xs text-red-500 mt-1">{errors.confirmarSenha}</p>}
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <Sparkles className="w-4 h-4 text-bolao-orange" />
              Templates de Permissão
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(roleTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.cargo === key
                      ? "border-bolao-green bg-bolao-green/10"
                      : isDark
                        ? "border-[#1C2432] hover:border-[#2D3748] bg-[#0A0E14]"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <p className={`text-sm font-medium ${formData.cargo === key ? "text-bolao-green" : isDark ? "text-white" : "text-gray-900"}`}>
                    {template.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <Shield className="w-4 h-4 text-blue-400" />
                Definir Permissões
              </h3>
              {errors.permissions && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.permissions}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              {Object.entries(modulosDisponiveis).map(([moduleKey, moduleInfo]) => {
                const ModuleIcon = moduleInfo.icon;
                const selectedCount = selectedPermissions[moduleKey]?.length ?? 0;
                const allSelected = selectedCount === moduleInfo.actions.length;
                
                return (
                  <div 
                    key={moduleKey}
                    className={`p-4 rounded-lg border ${
                      isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ModuleIcon className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                        <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {moduleInfo.label}
                        </span>
                        {selectedCount > 0 && (
                          <Badge className="bg-bolao-green/10 text-bolao-green border-0 text-[10px]">
                            {selectedCount} selecionada{selectedCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={() => allSelected ? deselectAllModuleActions(moduleKey) : selectAllModuleActions(moduleKey)}
                        className={`text-xs font-medium ${
                          allSelected ? "text-red-400 hover:text-red-300" : "text-bolao-green hover:text-bolao-green-dark"
                        }`}
                      >
                        {allSelected ? "Desmarcar todas" : "Selecionar todas"}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {moduleInfo.actions.map(action => {
                        const isSelected = isActionSelected(moduleKey, action.key);
                        return (
                          <button
                            key={action.key}
                            onClick={() => toggleAction(moduleKey, action.key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-bolao-green text-bolao-dark"
                                : isDark
                                  ? "bg-[#1C2432] text-gray-300 hover:bg-[#2D3748]"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview Section */}
          {totalPermissions > 0 && (
            <div className={`p-4 rounded-lg border ${
              isDark ? "bg-bolao-green/5 border-bolao-green/20" : "bg-green-50 border-green-200"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-bolao-green" />
                <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  Resumo das Permissões
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedPermissions).map(([module, actions]) => {
                  const moduleInfo = modulosDisponiveis[module as keyof typeof modulosDisponiveis];
                  if (!moduleInfo) return null;
                  return (
                    <div 
                      key={module}
                      className={`px-3 py-1.5 rounded-md text-xs ${
                        isDark ? "bg-[#1C2432] text-gray-300" : "bg-white text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{moduleInfo.label}:</span>{" "}
                      <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                        {actions.map(a => moduleInfo.actions.find(ma => ma.key === a)?.label).join(", ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 z-10 p-5 border-t flex items-center justify-between ${
          isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
        }`}>
          <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <span className="font-medium text-bolao-green">{totalPermissions}</span> permissão{totalPermissions !== 1 ? "ões" : ""} selecionada{totalPermissions !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Sub-Usuário
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CriarSubUsuarioModal;
