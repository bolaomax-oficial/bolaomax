import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Types for bolão updates
interface BolaoUpdate {
  id: string;
  codigoBolao: string;
  type: "lotofacil" | "megasena" | "quina";
  dataSorteio: string;
  horarioSorteio: string;
  dataEncerramento: string;
  horarioEncerramento: string;
  premioEstimado: string;
  status: string;
  updatedAt: number; // timestamp
}

interface UpdateNotification {
  id: string;
  bolaoCode: string;
  message: string;
  type: "info" | "success" | "warning";
  timestamp: number;
}

interface BolaoUpdateContextType {
  // Store bolão updates
  updates: Record<string, BolaoUpdate>;
  
  // Notifications for UI
  notifications: UpdateNotification[];
  
  // Dispatch an update (called from admin)
  dispatchUpdate: (update: BolaoUpdate) => void;
  
  // Get latest update for a bolão
  getLatestUpdate: (bolaoId: string) => BolaoUpdate | null;
  
  // Clear a notification
  clearNotification: (notificationId: string) => void;
  
  // Clear all notifications
  clearAllNotifications: () => void;
  
  // Check if a bolão was recently updated (within last 30 seconds)
  wasRecentlyUpdated: (bolaoId: string) => boolean;
}

const BolaoUpdateContext = createContext<BolaoUpdateContextType | null>(null);

const STORAGE_KEY = "bolaomax_updates";
const NOTIFICATION_DURATION = 5000; // 5 seconds

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export const BolaoUpdateProvider = ({ children }: { children: ReactNode }) => {
  const [updates, setUpdates] = useState<Record<string, BolaoUpdate>>({});
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);

  // Load updates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUpdates(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load bolão updates from storage:", e);
    }
  }, []);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newUpdates = JSON.parse(event.newValue);
          setUpdates((prev) => {
            // Find newly added updates
            Object.keys(newUpdates).forEach((id) => {
              if (!prev[id] || newUpdates[id].updatedAt > prev[id].updatedAt) {
                // Create notification for new update
                const update = newUpdates[id];
                const notification: UpdateNotification = {
                  id: generateId(),
                  bolaoCode: update.codigoBolao,
                  message: `Bolão ${update.codigoBolao} atualizado! Nova data: ${update.dataSorteio} às ${update.horarioSorteio}`,
                  type: "info",
                  timestamp: Date.now(),
                };
                setNotifications((n) => [...n, notification]);
                
                // Auto-remove notification after duration
                setTimeout(() => {
                  setNotifications((n) => n.filter((notif) => notif.id !== notification.id));
                }, NOTIFICATION_DURATION);
              }
            });
            return newUpdates;
          });
        } catch (e) {
          console.error("Failed to parse storage update:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Dispatch update
  const dispatchUpdate = useCallback((update: BolaoUpdate) => {
    const updatedData = {
      ...update,
      updatedAt: Date.now(),
    };

    setUpdates((prev) => {
      const newUpdates = { ...prev, [update.id]: updatedData };
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUpdates));
      } catch (e) {
        console.error("Failed to save bolão update:", e);
      }
      return newUpdates;
    });

    // Create local notification
    const notification: UpdateNotification = {
      id: generateId(),
      bolaoCode: update.codigoBolao,
      message: `Bolão ${update.codigoBolao} atualizado com sucesso!`,
      type: "success",
      timestamp: Date.now(),
    };
    setNotifications((n) => [...n, notification]);

    // Auto-remove notification after duration
    setTimeout(() => {
      setNotifications((n) => n.filter((notif) => notif.id !== notification.id));
    }, NOTIFICATION_DURATION);
  }, []);

  // Get latest update
  const getLatestUpdate = useCallback(
    (bolaoId: string): BolaoUpdate | null => {
      return updates[bolaoId] || null;
    },
    [updates]
  );

  // Check if recently updated (within 30 seconds)
  const wasRecentlyUpdated = useCallback(
    (bolaoId: string): boolean => {
      const update = updates[bolaoId];
      if (!update) return false;
      return Date.now() - update.updatedAt < 30000;
    },
    [updates]
  );

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((n) => n.filter((notif) => notif.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <BolaoUpdateContext.Provider
      value={{
        updates,
        notifications,
        dispatchUpdate,
        getLatestUpdate,
        clearNotification,
        clearAllNotifications,
        wasRecentlyUpdated,
      }}
    >
      {children}
    </BolaoUpdateContext.Provider>
  );
};

export const useBolaoUpdates = (): BolaoUpdateContextType => {
  const context = useContext(BolaoUpdateContext);
  if (!context) {
    throw new Error("useBolaoUpdates must be used within a BolaoUpdateProvider");
  }
  return context;
};

export default BolaoUpdateContext;
