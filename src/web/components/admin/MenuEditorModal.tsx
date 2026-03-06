/**
 * Menu Editor Modal Component
 * 
 * A modal dialog for adding and editing menu items in the admin panel.
 * Provides form fields for all menu item properties with validation and preview.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useMenu } from "@/contexts/MenuContext";
import { menuIconMap, type MenuItemConfig } from "@/services/menuService";
import {
  X,
  Save,
  Trash2,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

/**
 * Props for the MenuEditorModal component
 */
interface MenuEditorModalProps {
  /** The menu item to edit (null for new item) */
  item: MenuItemConfig | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when item is saved */
  onSave: (item: MenuItemConfig) => void;
  /** Callback when item is deleted */
  onDelete?: (id: string) => void;
  /** Whether this is a new item */
  isNew?: boolean;
  /** Parent menu items for dropdown selection */
  parentOptions?: { id: string; name: string }[];
}

/**
 * Available icons for menu items
 */
const availableIcons = [
  { value: "circle", label: "Círculo" },
  { value: "clover", label: "Trevo" },
  { value: "star", label: "Estrela" },
  { value: "clock", label: "Relógio" },
  { value: "gem", label: "Gema" },
  { value: "dices", label: "Dados" },
  { value: "hash", label: "Hash" },
  { value: "layers", label: "Camadas" },
  { value: "crown", label: "Coroa" },
  { value: "fileText", label: "Documento" },
  { value: "info", label: "Info" },
  { value: "helpCircle", label: "Ajuda" },
  { value: "trophy", label: "Troféu" },
  { value: "home", label: "Home" },
  { value: "menu", label: "Menu" },
];

/**
 * Category options for menu items
 */
const categoryOptions = [
  { value: "page", label: "Página", description: "Página normal do site" },
  { value: "lottery", label: "Loteria", description: "Página de loteria com cores específicas" },
  { value: "custom", label: "Personalizado", description: "Item personalizado" },
];

/**
 * Generate a slug from a name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

/**
 * Menu Editor Modal Component
 */
export const MenuEditorModal = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew = false,
  parentOptions = [],
}: MenuEditorModalProps) => {
  const { isDark } = useTheme();
  const { validate, menuItems } = useMenu();
  
  // Form state
  const [formData, setFormData] = useState<MenuItemConfig>({
    id: "",
    name: "",
    slug: "",
    route: "/",
    visible: true,
    order: 999,
    icon: "fileText",
    category: "page",
    editable: true,
    color: "#00C853",
    active: true,
  });
  
  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);
  
  // Auto-generate slug
  const [autoSlug, setAutoSlug] = useState(true);
  
  // Confirm delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        color: item.color || "#00C853",
      });
      setAutoSlug(false);
    } else {
      // Reset for new item
      setFormData({
        id: `custom-${Date.now()}`,
        name: "",
        slug: "",
        route: "/",
        visible: true,
        order: 999,
        icon: "fileText",
        category: "custom",
        editable: true,
        color: "#00C853",
        active: true,
      });
      setAutoSlug(true);
    }
    setErrors([]);
    setConfirmDelete(false);
  }, [item, isOpen]);
  
  // Handle name change with auto-slug
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? generateSlug(name) : prev.slug,
      route: autoSlug ? `/${generateSlug(name)}` : prev.route,
    }));
  };
  
  // Handle slug change
  const handleSlugChange = (slug: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({
      ...prev,
      slug,
      route: `/${slug}`,
    }));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const validationErrors = validate(formData);
    
    // Additional validation
    if (!formData.name.trim()) {
      validationErrors.push("Nome é obrigatório");
    }
    
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        route: formData.route || `/${generateSlug(formData.name)}`,
      });
      onClose();
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (confirmDelete && onDelete && item) {
      onDelete(item.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };
  
  // Get preview icon
  const PreviewIcon = menuIconMap[formData.icon] || menuIconMap.menu;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl border shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col ${
          isDark 
            ? "bg-[#111827] border-[#1C2432]"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 border-b flex-shrink-0 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {isNew ? "Adicionar Nova Página" : "Editar Item do Menu"}
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {isNew ? "Configure os detalhes da nova página" : `Editando: ${item?.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${
              isDark 
                ? "bg-red-500/10 border-red-500/30"
                : "bg-red-50 border-red-200"
            }`}>
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                {errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-red-500">{error}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Sobre Nós"
              required
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all ${
                isDark 
                  ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
          
          {/* Slug and Route Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Slug */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="sobre-nos"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              {autoSlug && formData.name && (
                <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Auto-gerado do nome
                </p>
              )}
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
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
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
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              >
                {availableIcons.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category Selector */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "page" | "lottery" | "custom" })}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Parent Menu Selector (for nested items) */}
          {parentOptions.length > 0 && (
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Menu Pai (opcional)
              </label>
              <select
                value={formData.parent || ""}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value || undefined })}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              >
                <option value="">Nenhum (item de nível superior)</option>
                {parentOptions.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Lottery-specific fields */}
          {formData.category === "lottery" && (
            <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14]/50 border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                Configurações de Loteria
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Color Picker */}
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Cor
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color || "#00C853"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.color || "#00C853"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none focus:border-bolao-green ${
                        isDark 
                          ? "bg-[#111827] border-[#1C2432] text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
                
                {/* Active Toggle */}
                <div className="flex items-end">
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    formData.active 
                      ? isDark ? "bg-bolao-green/10 border-bolao-green/30" : "bg-bolao-green/5 border-bolao-green/20"
                      : isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      formData.active 
                        ? "bg-bolao-green border-bolao-green" 
                        : isDark ? "border-gray-600" : "border-gray-300"
                    }`}>
                      {formData.active && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Loteria Ativa
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Coming Soon Toggle */}
              <div className="mt-3">
                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  formData.comingSoon 
                    ? isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"
                    : isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.comingSoon === true}
                    onChange={(e) => setFormData({ ...formData, comingSoon: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    formData.comingSoon 
                      ? "bg-amber-500 border-amber-500" 
                      : isDark ? "border-gray-600" : "border-gray-300"
                  }`}>
                    {formData.comingSoon && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                    Em Breve (Coming Soon)
                  </span>
                </label>
              </div>
            </div>
          )}
          
          {/* Visibility Toggle */}
          <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
            formData.visible 
              ? isDark ? "bg-bolao-green/5 border-bolao-green/20" : "bg-bolao-green/5 border-bolao-green/10"
              : isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              {formData.visible ? (
                <Eye className="w-5 h-5 text-bolao-green" />
              ) : (
                <EyeOff className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
              )}
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  Visível no Menu
                </p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {formData.visible ? "Este item aparecerá no menu" : "Este item está oculto do menu"}
                </p>
              </div>
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
          
          {/* Preview Section */}
          <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14]/50 border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <p className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Preview do Item
            </p>
            <div className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-lg flex items-center justify-center`}
                style={{ 
                  backgroundColor: formData.category === "lottery" 
                    ? `${formData.color}20` 
                    : isDark ? "rgba(0, 200, 83, 0.2)" : "rgba(0, 200, 83, 0.1)"
                }}
              >
                <PreviewIcon 
                  className="w-5 h-5" 
                  style={{ 
                    color: formData.category === "lottery" 
                      ? formData.color 
                      : "#00C853" 
                  }} 
                />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {formData.name || "Nome do Item"}
                </p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {formData.route || "/rota"}
                </p>
              </div>
              <Badge className={`border-0 text-[10px] ${
                formData.category === "lottery" 
                  ? "bg-violet-500/20 text-violet-400"
                  : formData.category === "custom"
                    ? "bg-bolao-orange/20 text-bolao-orange"
                    : "bg-bolao-green/20 text-bolao-green"
              }`}>
                {categoryOptions.find((c) => c.value === formData.category)?.label || "Página"}
              </Badge>
            </div>
          </div>
        </form>
        
        {/* Modal Footer */}
        <div className={`flex items-center justify-between p-4 border-t flex-shrink-0 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
          {/* Delete Button (only for editing existing editable items) */}
          <div>
            {!isNew && item?.editable && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                className={`${
                  confirmDelete 
                    ? "text-white bg-red-500 hover:bg-red-600" 
                    : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                }`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {confirmDelete ? "Confirmar Exclusão" : "Excluir"}
              </Button>
            )}
          </div>
          
          {/* Save/Cancel Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="bg-bolao-green hover:bg-bolao-green-dark text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isNew ? "Adicionar" : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuEditorModal;
