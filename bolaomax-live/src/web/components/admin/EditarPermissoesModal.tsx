import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  X,
  Key,
  Shield,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Minus,
  Users,
  Wallet,
  ArrowDownToLine,
  BarChart3,
  MessageSquare,
  MessageCircle,
  Ticket,
  Save,
  ArrowRight,
} from "lucide-react";

// Types
interface Permission {
  module: string;
  actions: string[];
}

interface SubUsuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  permissoes: Permission[];
  initials: string;
  avatarColor: string;
}

interface EditarPermissoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subUsuario: SubUsuario | null;
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

export function EditarPermissoesModal({ isOpen, onClose, onSuccess, subUsuario }: EditarPermissoesModalProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Permissions state - track which actions are selected for each module
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});

  // Original permissions for diff calculation
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, string[]>>({});

  // Initialize permissions when modal opens with a sub-user
  useEffect(() => {
    if (isOpen && subUsuario) {
      const perms: Record<string, string[]> = {};
      subUsuario.permissoes.forEach(p => {
        perms[p.module] = [...p.actions];
      });
      setSelectedPermissions(perms);
      setOriginalPermissions(perms);
      setErrors({});
    }
  }, [isOpen, subUsuario]);

  // Calculate total selected permissions
  const totalPermissions = useMemo(() => {
    return Object.values(selectedPermissions).reduce((acc, actions) => acc + actions.length, 0);
  }, [selectedPermissions]);

  // Calculate diff (added and removed permissions)
  const diff = useMemo(() => {
    const added: { module: string; action: string }[] = [];
    const removed: { module: string; action: string }[] = [];

    // Check for added permissions
    Object.entries(selectedPermissions).forEach(([module, actions]) => {
      const originalActions = originalPermissions[module] || [];
      actions.forEach(action => {
        if (!originalActions.includes(action)) {
          added.push({ module, action });
        }
      });
    });

    // Check for removed permissions
    Object.entries(originalPermissions).forEach(([module, actions]) => {
      const currentActions = selectedPermissions[module] || [];
      actions.forEach(action => {
        if (!currentActions.includes(action)) {
          removed.push({ module, action });
        }
      });
    });

    return { added, removed, hasChanges: added.length > 0 || removed.length > 0 };
  }, [selectedPermissions, originalPermissions]);

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
  };

  // Select all actions for a module
  const selectAllModuleActions = (module: string) => {
    const moduleInfo = modulosDisponiveis[module as keyof typeof modulosDisponiveis];
    if (!moduleInfo) return;
    
    const allActions = moduleInfo.actions.map(a => a.key);
    setSelectedPermissions(prev => ({ ...prev, [module]: allActions }));
  };

  // Deselect all actions for a module
  const deselectAllModuleActions = (module: string) => {
    setSelectedPermissions(prev => {
      const { [module]: _, ...rest } = prev;
      return rest;
    });
  };

  // Confirmation state for removing many permissions
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    if (totalPermissions === 0) {
      setErrors({ permissions: "Selecione pelo menos uma permissão" });
      return;
    }

    if (!diff.hasChanges) {
      onClose();
      return;
    }

    // Show confirmation if removing 3 or more permissions
    if (diff.removed.length >= 3 && !showRemoveConfirm) {
      setShowRemoveConfirm(true);
      return;
    }

    await performSave();
  };

  // Perform the actual save operation
  const performSave = async () => {
    setShowRemoveConfirm(false);
    setLoading(true);
    try {
      // Format permissions for API
      const permissoes: Permission[] = Object.entries(selectedPermissions).map(([module, actions]) => ({
        module,
        actions,
      }));

      // API call
      const token = localStorage.getItem("bolaomax_token");
      const response = await fetch(`/api/admin/sub-usuarios/${subUsuario?.id}/permissoes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ permissoes }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar permissões");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setErrors({ submit: "Erro ao atualizar permissões. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  // Get action label from module
  const getActionLabel = (module: string, actionKey: string) => {
    const moduleInfo = modulosDisponiveis[module as keyof typeof modulosDisponiveis];
    return moduleInfo?.actions.find(a => a.key === actionKey)?.label || actionKey;
  };

  if (!isOpen || !subUsuario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className={`relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col ${
        isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-5 border-b flex items-center justify-between ${
          isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${subUsuario.avatarColor} flex items-center justify-center text-sm font-bold text-white`}>
              {subUsuario.initials}
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Editar Permissões
              </h2>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {subUsuario.nome} • {subUsuario.email}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
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

          {/* Permissions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <Shield className="w-4 h-4 text-blue-400" />
                Permissões
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

          {/* Diff Section */}
          {diff.hasChanges && (
            <div className={`p-4 rounded-lg border ${
              isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
            }`}>
              <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <ArrowRight className="w-4 h-4 text-bolao-orange" />
                Alterações Pendentes
              </h3>
              
              <div className="space-y-3">
                {/* Added permissions */}
                {diff.added.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="w-4 h-4 text-bolao-green" />
                      <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Permissões a adicionar ({diff.added.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {diff.added.map((item, i) => {
                        const moduleInfo = modulosDisponiveis[item.module as keyof typeof modulosDisponiveis];
                        return (
                          <span 
                            key={i}
                            className="px-2 py-1 rounded-md text-xs bg-bolao-green/10 text-bolao-green border border-bolao-green/20"
                          >
                            {moduleInfo?.label}: {getActionLabel(item.module, item.action)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Removed permissions */}
                {diff.removed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="w-4 h-4 text-red-400" />
                      <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Permissões a remover ({diff.removed.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {diff.removed.map((item, i) => {
                        const moduleInfo = modulosDisponiveis[item.module as keyof typeof modulosDisponiveis];
                        return (
                          <span 
                            key={i}
                            className="px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20"
                          >
                            {moduleInfo?.label}: {getActionLabel(item.module, item.action)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
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
            {diff.hasChanges && (
              <span className="ml-2 text-bolao-orange">
                • {diff.added.length + diff.removed.length} alteração{diff.added.length + diff.removed.length !== 1 ? "ões" : ""}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
              onClick={handleSubmit}
              disabled={loading || !diff.hasChanges}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Confirmation Modal for Removing Many Permissions */}
        {showRemoveConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowRemoveConfirm(false)} />
            <Card className={`relative z-30 w-full max-w-md mx-4 p-6 ${
              isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
            }`}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Remover muitas permissões?
                </h3>
                <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Você está removendo <strong className="text-red-400">{diff.removed.length} permissões</strong> de {subUsuario?.nome}. 
                  Isso pode impedir o acesso a funcionalidades importantes.
                </p>
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  {diff.removed.map((item, i) => {
                    const moduleInfo = modulosDisponiveis[item.module as keyof typeof modulosDisponiveis];
                    return (
                      <span 
                        key={i}
                        className="px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        {moduleInfo?.label}: {getActionLabel(item.module, item.action)}
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRemoveConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    onClick={performSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-2" />
                    )}
                    Confirmar Remoção
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}

export default EditarPermissoesModal;
