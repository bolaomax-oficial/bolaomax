/**
 * Menu Context
 * 
 * Provides global state management for the menu configuration.
 * Components can use this context to read menu items and trigger updates.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  getMenuItems,
  getVisibleMenuItems,
  updateMenuItem,
  addMenuItem,
  removeMenuItem,
  reorderMenuItems,
  resetMenuConfig,
  toggleMenuItemVisibility,
  getLotteryChildren,
  getActiveLotteryChildren,
  getComingSoonLotteryChildren,
  getMenuItemById,
  getMenuItemBySlug,
  validateMenuItem,
  exportMenuConfig,
  importMenuConfig,
  type MenuItemConfig,
} from "@/services/menuService";

/**
 * Context value interface
 */
interface MenuContextValue {
  /** All menu items */
  menuItems: MenuItemConfig[];
  /** Visible menu items sorted by order */
  visibleMenuItems: MenuItemConfig[];
  /** Lottery children from Loterias dropdown */
  lotteryItems: MenuItemConfig[];
  /** Active lottery items */
  activeLotteryItems: MenuItemConfig[];
  /** Coming soon lottery items */
  comingSoonLotteryItems: MenuItemConfig[];
  /** Update a menu item by ID */
  updateItem: (id: string, data: Partial<MenuItemConfig>) => void;
  /** Add a new menu item */
  addItem: (item: MenuItemConfig) => void;
  /** Remove a menu item by ID */
  removeItem: (id: string) => void;
  /** Reorder menu items */
  reorder: (orderedIds: string[]) => void;
  /** Reset to default configuration */
  reset: () => void;
  /** Toggle visibility of a menu item */
  toggleVisibility: (id: string) => void;
  /** Get menu item by ID */
  getById: (id: string) => MenuItemConfig | undefined;
  /** Get menu item by slug */
  getBySlug: (slug: string) => MenuItemConfig | undefined;
  /** Validate a menu item */
  validate: (item: Partial<MenuItemConfig>) => string[];
  /** Export configuration as JSON */
  exportConfig: () => string;
  /** Import configuration from JSON */
  importConfig: (json: string) => boolean;
  /** Refresh menu items from storage */
  refresh: () => void;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Create the context with undefined default
 */
const MenuContext = createContext<MenuContextValue | undefined>(undefined);

/**
 * Menu Provider Props
 */
interface MenuProviderProps {
  children: ReactNode;
}

/**
 * Menu Provider Component
 * Wrap your app with this to provide menu context
 */
export const MenuProvider = ({ children }: MenuProviderProps) => {
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize menu items on mount
  useEffect(() => {
    setMenuItems(getMenuItems());
    setIsLoading(false);
  }, []);

  // Refresh menu items from storage
  const refresh = useCallback(() => {
    setMenuItems(getMenuItems());
  }, []);

  // Visible menu items (filtered and sorted)
  const visibleMenuItems = menuItems
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  // Lottery items
  const lotteryItems = menuItems.find((item) => item.id === "loterias")?.children || [];
  const activeLotteryItems = lotteryItems.filter((item) => item.active && !item.comingSoon);
  const comingSoonLotteryItems = lotteryItems.filter((item) => item.comingSoon);

  // Update a menu item
  const updateItem = useCallback((id: string, data: Partial<MenuItemConfig>) => {
    const updated = updateMenuItem(id, data);
    setMenuItems(updated);
  }, []);

  // Add a new menu item
  const addItem = useCallback((item: MenuItemConfig) => {
    const updated = addMenuItem(item);
    setMenuItems(updated);
  }, []);

  // Remove a menu item
  const removeItem = useCallback((id: string) => {
    const updated = removeMenuItem(id);
    setMenuItems(updated);
  }, []);

  // Reorder menu items
  const reorder = useCallback((orderedIds: string[]) => {
    const updated = reorderMenuItems(orderedIds);
    setMenuItems(updated);
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    const updated = resetMenuConfig();
    setMenuItems(updated);
  }, []);

  // Toggle visibility
  const toggleVisibility = useCallback((id: string) => {
    const updated = toggleMenuItemVisibility(id);
    setMenuItems(updated);
  }, []);

  // Get by ID
  const getById = useCallback((id: string) => {
    return getMenuItemById(id);
  }, []);

  // Get by slug
  const getBySlug = useCallback((slug: string) => {
    return getMenuItemBySlug(slug);
  }, []);

  // Validate
  const validate = useCallback((item: Partial<MenuItemConfig>) => {
    return validateMenuItem(item, menuItems);
  }, [menuItems]);

  // Export config
  const exportConfigCallback = useCallback(() => {
    return exportMenuConfig();
  }, []);

  // Import config
  const importConfigCallback = useCallback((json: string) => {
    const result = importMenuConfig(json);
    if (result) {
      setMenuItems(result);
      return true;
    }
    return false;
  }, []);

  const value: MenuContextValue = {
    menuItems,
    visibleMenuItems,
    lotteryItems,
    activeLotteryItems,
    comingSoonLotteryItems,
    updateItem,
    addItem,
    removeItem,
    reorder,
    reset,
    toggleVisibility,
    getById,
    getBySlug,
    validate,
    exportConfig: exportConfigCallback,
    importConfig: importConfigCallback,
    refresh,
    isLoading,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

/**
 * useMenu Hook
 * Use this in components to access menu context
 */
export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext);
  
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  
  return context;
};

/**
 * useMenuOptional Hook
 * Use this when the menu context might not be available
 * Returns null if not within a MenuProvider
 */
export const useMenuOptional = (): MenuContextValue | null => {
  const context = useContext(MenuContext);
  return context ?? null;
};

export default MenuContext;
