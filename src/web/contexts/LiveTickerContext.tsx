import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LiveTickerConfig {
  enabled: boolean;
  visible: boolean;
  position: "top" | "bottom";
  showOnAdmin: boolean;
}

interface LiveTickerContextType {
  config: LiveTickerConfig;
  setConfig: (config: Partial<LiveTickerConfig>) => void;
  toggleVisible: () => void;
}

const defaultConfig: LiveTickerConfig = {
  enabled: true,
  visible: true,
  position: "bottom",
  showOnAdmin: false,
};

const LiveTickerContext = createContext<LiveTickerContextType | undefined>(undefined);

const STORAGE_KEY = "bolaomax_live_ticker_config";

export const LiveTickerProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<LiveTickerConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...defaultConfig, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.error("Error reading live ticker config:", e);
      }
    }
    return defaultConfig;
  });

  // Persist config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Error saving live ticker config:", e);
    }
  }, [config]);

  const setConfig = (newConfig: Partial<LiveTickerConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }));
  };

  const toggleVisible = () => {
    setConfigState(prev => ({ ...prev, visible: !prev.visible }));
  };

  return (
    <LiveTickerContext.Provider value={{ config, setConfig, toggleVisible }}>
      {children}
    </LiveTickerContext.Provider>
  );
};

export const useLiveTicker = () => {
  const context = useContext(LiveTickerContext);
  if (context === undefined) {
    throw new Error("useLiveTicker must be used within a LiveTickerProvider");
  }
  return context;
};
