import { useState, useEffect, useCallback, useRef } from "react";
import { useBolaoUpdates } from "@/contexts/BolaoUpdateContext";

export interface LiveBolaoData {
  id: string;
  dataSorteio?: string;
  horarioSorteio?: string;
  premioEstimado?: string;
  status?: string;
  updatedAt?: number;
}

interface UseLiveBolaoUpdatesOptions {
  pollingInterval?: number; // in milliseconds, default 30000 (30 seconds)
  enablePolling?: boolean;
}

interface UseLiveBolaoUpdatesReturn {
  // Get live data for a specific bolão
  getLiveData: (bolaoId: string) => LiveBolaoData | null;
  
  // Check if a bolão was recently updated (within recentThreshold ms)
  wasRecentlyUpdated: (bolaoId: string) => boolean;
  
  // Last poll timestamp
  lastPolled: number | null;
  
  // Force a refresh
  refresh: () => void;
  
  // Dev mode: manually trigger an update
  triggerDevUpdate: (bolaoId: string, data: Partial<LiveBolaoData>) => void;
  
  // Dev mode toggle
  devMode: boolean;
  setDevMode: (enabled: boolean) => void;
}

const RECENT_THRESHOLD = 30000; // 30 seconds

export const useLiveBolaoUpdates = (
  options: UseLiveBolaoUpdatesOptions = {}
): UseLiveBolaoUpdatesReturn => {
  const { pollingInterval = 30000, enablePolling = true } = options;
  const { updates, getLatestUpdate, wasRecentlyUpdated: contextRecentlyUpdated } = useBolaoUpdates();
  
  const [lastPolled, setLastPolled] = useState<number | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUpdates, setDevUpdates] = useState<Record<string, LiveBolaoData>>({});
  const pollingRef = useRef<NodeJS.Timer | null>(null);

  // Polling effect
  useEffect(() => {
    if (!enablePolling) return;
    
    const poll = () => {
      setLastPolled(Date.now());
      // In a real app, this would fetch updates from the server
      // For now, we just trigger a re-render by updating lastPolled
    };

    // Initial poll
    poll();

    // Set up interval
    pollingRef.current = setInterval(poll, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [enablePolling, pollingInterval]);

  // Get live data for a bolão
  const getLiveData = useCallback((bolaoId: string): LiveBolaoData | null => {
    // Check dev updates first
    if (devMode && devUpdates[bolaoId]) {
      return devUpdates[bolaoId];
    }
    
    // Then check context updates
    const update = getLatestUpdate(bolaoId);
    if (update) {
      return {
        id: update.id,
        dataSorteio: update.dataSorteio,
        horarioSorteio: update.horarioSorteio,
        premioEstimado: update.premioEstimado,
        status: update.status,
        updatedAt: update.updatedAt,
      };
    }
    
    return null;
  }, [devMode, devUpdates, getLatestUpdate]);

  // Check if recently updated
  const wasRecentlyUpdated = useCallback((bolaoId: string): boolean => {
    // Check dev updates
    if (devMode && devUpdates[bolaoId]) {
      const update = devUpdates[bolaoId];
      return update.updatedAt ? Date.now() - update.updatedAt < RECENT_THRESHOLD : false;
    }
    
    return contextRecentlyUpdated(bolaoId);
  }, [devMode, devUpdates, contextRecentlyUpdated]);

  // Force refresh
  const refresh = useCallback(() => {
    setLastPolled(Date.now());
  }, []);

  // Dev mode: trigger update
  const triggerDevUpdate = useCallback((bolaoId: string, data: Partial<LiveBolaoData>) => {
    setDevUpdates(prev => ({
      ...prev,
      [bolaoId]: {
        ...prev[bolaoId],
        id: bolaoId,
        ...data,
        updatedAt: Date.now(),
      },
    }));
  }, []);

  return {
    getLiveData,
    wasRecentlyUpdated,
    lastPolled,
    refresh,
    triggerDevUpdate,
    devMode,
    setDevMode,
  };
};

// Utility hook for animated number counting
export const useAnimatedNumber = (
  targetValue: number,
  duration: number = 1000
): number => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (targetValue === displayValue) return;

    startValueRef.current = displayValue;
    startTimeRef.current = Date.now();

    const animate = () => {
      if (!startTimeRef.current) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValueRef.current + 
        (targetValue - startValueRef.current) * eased;
      
      setDisplayValue(Math.round(newValue));
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration]);

  return displayValue;
};

export default useLiveBolaoUpdates;
