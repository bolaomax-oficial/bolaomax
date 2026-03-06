/**
 * Menu Configuration Service
 * 
 * This service provides centralized menu management for the BolãoMax application.
 * Menu items can be dynamically configured through the admin panel.
 * 
 * Features:
 * - Get, add, update, remove menu items
 * - Reorder menu items
 * - Integration with localStorage for persistence
 * - Validation for slugs and routes
 */

import { type LucideIcon, Circle, Clover, Star, Clock, Gem, Dices, Hash, Layers, Crown, FileText, Info, HelpCircle, Trophy, Home, Menu } from "lucide-react";
import { getActiveLotteries, getComingSoonLotteries, type LotteryConfig } from "./lotteryService";

/**
 * Configuration interface for a menu item
 */
export interface MenuItemConfig {
  /** Unique identifier for the menu item */
  id: string;
  /** Display name shown in the menu */
  name: string;
  /** URL slug (used for routing) */
  slug: string;
  /** Full route path (e.g., /sobre-nos) */
  route: string;
  /** Whether the item is visible in the menu */
  visible: boolean;
  /** Order/position in the menu (lower = first) */
  order: number;
  /** Icon identifier from the iconMap */
  icon: string;
  /** Child menu items (for dropdowns like Loterias) */
  children?: MenuItemConfig[];
  /** Category type for styling and behavior */
  category: "page" | "lottery" | "custom";
  /** Whether the item can be edited by admin */
  editable: boolean;
  /** Parent menu item ID (for nested items) */
  parent?: string;
  /** Primary color (for lottery items) */
  color?: string;
  /** Tailwind color name (for lottery items) */
  colorName?: string;
  /** Whether the lottery is active (for lottery items) */
  active?: boolean;
  /** Whether the item is coming soon */
  comingSoon?: boolean;
}

/**
 * Icon mapping from string identifiers to Lucide components
 */
export const menuIconMap: Record<string, LucideIcon> = {
  circle: Circle,
  clover: Clover,
  star: Star,
  clock: Clock,
  gem: Gem,
  dices: Dices,
  hash: Hash,
  layers: Layers,
  crown: Crown,
  fileText: FileText,
  info: Info,
  helpCircle: HelpCircle,
  trophy: Trophy,
  home: Home,
  menu: Menu,
};

/**
 * LocalStorage key for menu configuration
 */
const MENU_STORAGE_KEY = "bolaomax_menu_config";

/**
 * Default menu configuration
 * This is used when no custom configuration is stored
 */
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
    children: [], // Will be populated from lotteryService
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

/**
 * Convert LotteryConfig to MenuItemConfig
 */
const lotteryToMenuItem = (lottery: LotteryConfig, parent: string): MenuItemConfig => ({
  id: lottery.id,
  name: lottery.name,
  slug: lottery.slug,
  route: lottery.route,
  visible: lottery.active,
  order: 0, // Will be set based on position
  icon: lottery.icon,
  category: "lottery",
  editable: true,
  parent,
  color: lottery.color,
  colorName: lottery.colorName,
  active: lottery.active,
  comingSoon: lottery.comingSoon,
});

/**
 * Get lottery items from lotteryService and convert to menu items
 */
const getLotteryMenuItems = (): MenuItemConfig[] => {
  const activeLotteries = getActiveLotteries();
  const comingSoonLotteries = getComingSoonLotteries();
  
  const activeItems = activeLotteries.map((lottery, idx) => ({
    ...lotteryToMenuItem(lottery, "loterias"),
    order: idx + 1,
  }));
  
  const comingSoonItems = comingSoonLotteries.map((lottery, idx) => ({
    ...lotteryToMenuItem(lottery, "loterias"),
    order: activeItems.length + idx + 1,
    comingSoon: true,
  }));
  
  return [...activeItems, ...comingSoonItems];
};

/**
 * Initialize menu with lottery children
 */
const initializeMenuWithLotteries = (config: MenuItemConfig[]): MenuItemConfig[] => {
  const lotteryItems = getLotteryMenuItems();
  
  return config.map((item) => {
    if (item.id === "loterias") {
      return {
        ...item,
        children: lotteryItems,
      };
    }
    return item;
  });
};

/**
 * Get stored menu configuration from localStorage
 */
const getStoredConfig = (): MenuItemConfig[] | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading menu config from localStorage:", error);
  }
  return null;
};

/**
 * Save menu configuration to localStorage
 */
const saveConfig = (config: MenuItemConfig[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving menu config to localStorage:", error);
  }
};

/**
 * Get all menu items
 * Returns stored config if available, otherwise default with lottery items
 */
export const getMenuItems = (): MenuItemConfig[] => {
  const storedConfig = getStoredConfig();
  
  if (storedConfig) {
    // Ensure lottery items are always up to date
    return initializeMenuWithLotteries(storedConfig);
  }
  
  return initializeMenuWithLotteries(defaultMenuConfig);
};

/**
 * Get visible menu items sorted by order
 */
export const getVisibleMenuItems = (): MenuItemConfig[] => {
  return getMenuItems()
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get a menu item by its slug
 */
export const getMenuItemBySlug = (slug: string): MenuItemConfig | undefined => {
  const items = getMenuItems();
  
  // Check top-level items
  const found = items.find((item) => item.slug === slug);
  if (found) return found;
  
  // Check children
  for (const item of items) {
    if (item.children) {
      const child = item.children.find((c) => c.slug === slug);
      if (child) return child;
    }
  }
  
  return undefined;
};

/**
 * Get a menu item by its ID
 */
export const getMenuItemById = (id: string): MenuItemConfig | undefined => {
  const items = getMenuItems();
  
  // Check top-level items
  const found = items.find((item) => item.id === id);
  if (found) return found;
  
  // Check children
  for (const item of items) {
    if (item.children) {
      const child = item.children.find((c) => c.id === id);
      if (child) return child;
    }
  }
  
  return undefined;
};

/**
 * Validate a menu item
 * Returns an array of error messages (empty if valid)
 */
export const validateMenuItem = (item: Partial<MenuItemConfig>, existingItems: MenuItemConfig[]): string[] => {
  const errors: string[] = [];
  
  // Name is required
  if (!item.name || item.name.trim() === "") {
    errors.push("Nome é obrigatório");
  }
  
  // Check slug uniqueness (excluding the item being edited)
  if (item.slug) {
    const slugExists = existingItems.some(
      (existing) => existing.slug === item.slug && existing.id !== item.id
    );
    
    // Also check children
    for (const existing of existingItems) {
      if (existing.children) {
        const childSlugExists = existing.children.some(
          (child) => child.slug === item.slug && child.id !== item.id
        );
        if (childSlugExists) {
          errors.push("Este slug já está em uso");
          break;
        }
      }
    }
    
    if (slugExists) {
      errors.push("Este slug já está em uso");
    }
  }
  
  // Validate route format
  if (item.route && item.route !== "#" && !item.route.startsWith("/")) {
    errors.push("Rota deve começar com /");
  }
  
  return errors;
};

/**
 * Update a menu item
 */
export const updateMenuItem = (id: string, data: Partial<MenuItemConfig>): MenuItemConfig[] => {
  const items = getMenuItems();
  
  const updatedItems = items.map((item) => {
    if (item.id === id) {
      return { ...item, ...data };
    }
    
    if (item.children) {
      return {
        ...item,
        children: item.children.map((child) =>
          child.id === id ? { ...child, ...data } : child
        ),
      };
    }
    
    return item;
  });
  
  saveConfig(updatedItems);
  return updatedItems;
};

/**
 * Add a new menu item
 */
export const addMenuItem = (item: MenuItemConfig): MenuItemConfig[] => {
  const items = getMenuItems();
  
  // Generate slug if not provided
  if (!item.slug) {
    item.slug = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  
  // Generate route if not provided
  if (!item.route) {
    item.route = `/${item.slug}`;
  }
  
  // Set order to be last
  item.order = Math.max(...items.map((i) => i.order), 0) + 1;
  
  const updatedItems = [...items, item];
  saveConfig(updatedItems);
  return updatedItems;
};

/**
 * Remove a menu item
 */
export const removeMenuItem = (id: string): MenuItemConfig[] => {
  const items = getMenuItems();
  
  // Don't allow removing non-editable items
  const itemToRemove = getMenuItemById(id);
  if (itemToRemove && !itemToRemove.editable) {
    console.warn("Cannot remove non-editable menu item:", id);
    return items;
  }
  
  const updatedItems = items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => child.id !== id),
        };
      }
      return item;
    });
  
  // Recalculate order numbers
  updatedItems.forEach((item, idx) => {
    item.order = idx + 1;
  });
  
  saveConfig(updatedItems);
  return updatedItems;
};

/**
 * Reorder menu items
 * @param orderedIds Array of IDs in the new order
 */
export const reorderMenuItems = (orderedIds: string[]): MenuItemConfig[] => {
  const items = getMenuItems();
  
  const reorderedItems = orderedIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is MenuItemConfig => item !== undefined);
  
  // Update order numbers
  reorderedItems.forEach((item, idx) => {
    item.order = idx + 1;
  });
  
  // Add any items that weren't in the orderedIds list (shouldn't happen normally)
  const missingItems = items.filter((item) => !orderedIds.includes(item.id));
  missingItems.forEach((item, idx) => {
    item.order = reorderedItems.length + idx + 1;
  });
  
  const finalItems = [...reorderedItems, ...missingItems];
  saveConfig(finalItems);
  return finalItems;
};

/**
 * Reset menu configuration to defaults
 */
export const resetMenuConfig = (): MenuItemConfig[] => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(MENU_STORAGE_KEY);
  }
  return initializeMenuWithLotteries(defaultMenuConfig);
};

/**
 * Export menu configuration as JSON string
 */
export const exportMenuConfig = (): string => {
  const items = getMenuItems();
  return JSON.stringify(items, null, 2);
};

/**
 * Import menu configuration from JSON string
 */
export const importMenuConfig = (jsonString: string): MenuItemConfig[] | null => {
  try {
    const items = JSON.parse(jsonString) as MenuItemConfig[];
    
    // Basic validation
    if (!Array.isArray(items)) {
      throw new Error("Invalid format: expected an array");
    }
    
    for (const item of items) {
      if (!item.id || !item.name || !item.slug) {
        throw new Error("Invalid item: missing required fields");
      }
    }
    
    saveConfig(items);
    return items;
  } catch (error) {
    console.error("Error importing menu config:", error);
    return null;
  }
};

/**
 * Toggle visibility of a menu item
 */
export const toggleMenuItemVisibility = (id: string): MenuItemConfig[] => {
  const item = getMenuItemById(id);
  if (!item) return getMenuItems();
  
  return updateMenuItem(id, { visible: !item.visible });
};

/**
 * Get lottery children from the Loterias menu item
 */
export const getLotteryChildren = (): MenuItemConfig[] => {
  const items = getMenuItems();
  const loteriasItem = items.find((item) => item.id === "loterias");
  return loteriasItem?.children || [];
};

/**
 * Get active lottery children only
 */
export const getActiveLotteryChildren = (): MenuItemConfig[] => {
  return getLotteryChildren().filter((child) => child.active && !child.comingSoon);
};

/**
 * Get coming soon lottery children only
 */
export const getComingSoonLotteryChildren = (): MenuItemConfig[] => {
  return getLotteryChildren().filter((child) => child.comingSoon);
};
