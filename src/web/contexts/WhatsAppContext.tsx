import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  welcomeMessage: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  buttonColor: string;
  showOnMobile: boolean;
  showOnDesktop: boolean;
}

interface WhatsAppContextType {
  config: WhatsAppConfig;
  saveWhatsAppConfig: (newConfig: Partial<WhatsAppConfig>) => void;
  resetToDefault: () => void;
}

const defaultConfig: WhatsAppConfig = {
  enabled: true,
  phoneNumber: "+5511987654321",
  welcomeMessage: "Olá! Gostaria de saber mais sobre os bolões.",
  position: "bottom-right",
  buttonColor: "#25D366",
  showOnMobile: true,
  showOnDesktop: true,
};

const STORAGE_KEY = "whatsapp_config";

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<WhatsAppConfig>(defaultConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({ ...defaultConfig, ...parsed });
      }
    } catch (error) {
      console.error("Error loading WhatsApp config:", error);
    }
  }, []);

  const saveWhatsAppConfig = (newConfig: Partial<WhatsAppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (error) {
      console.error("Error saving WhatsApp config:", error);
    }
  };

  const resetToDefault = () => {
    setConfig(defaultConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
    } catch (error) {
      console.error("Error resetting WhatsApp config:", error);
    }
  };

  return (
    <WhatsAppContext.Provider value={{ config, saveWhatsAppConfig, resetToDefault }}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error("useWhatsApp must be used within a WhatsAppProvider");
  }
  return context;
};
