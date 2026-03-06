import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Types for notifications
export interface BolaoNotification {
  id: string;
  timestamp: number;
  bolaoId: string;
  bolaoCode: string;
  bolaoName: string;
  bolaoType: "lotofacil" | "megasena" | "quina";
  changesSummary: string;
  customMessage?: string;
  recipientCount: number;
  methods: NotificationMethod[];
  status: "pending" | "sent" | "partial" | "failed";
  deliveryStats: {
    total: number;
    sent: number;
    failed: number;
  };
  isSpecialEvent?: boolean;
  hasReminder?: boolean;
  reminderDate?: string;
}

export type NotificationMethod = "in_app" | "email" | "whatsapp" | "telegram";

interface NotificationContextType {
  // All notifications sent
  notifications: BolaoNotification[];
  
  // Send a new notification
  sendNotification: (notification: Omit<BolaoNotification, "id" | "timestamp" | "status" | "deliveryStats">) => Promise<string>;
  
  // Get notification by ID
  getNotification: (id: string) => BolaoNotification | null;
  
  // Get notifications by bolão
  getNotificationsByBolao: (bolaoId: string) => BolaoNotification[];
  
  // Get pending reminders
  getPendingReminders: () => BolaoNotification[];
  
  // Cancel a reminder
  cancelReminder: (notificationId: string) => void;
  
  // User notifications (for the logged-in user)
  userNotifications: UserNotification[];
  
  // Mark user notification as read
  markAsRead: (notificationId: string) => void;
  
  // Mark all as read
  markAllAsRead: () => void;
  
  // Unread count
  unreadCount: number;
}

export interface UserNotification {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  type: "bolao_update" | "payment" | "winner" | "system";
  bolaoId?: string;
  read: boolean;
  link?: string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = "bolaomax_notifications";
const USER_NOTIF_KEY = "bolaomax_user_notifications";

// Helper to generate unique IDs
const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Format changes into a human-readable summary
export const formatChangesForNotification = (changes: Array<{ fieldLabel: string; oldValue: string; newValue: string }>): string => {
  if (changes.length === 0) return "Informações atualizadas";
  if (changes.length === 1) {
    return `${changes[0].fieldLabel} alterado de "${changes[0].oldValue}" para "${changes[0].newValue}"`;
  }
  return changes.map(c => `${c.fieldLabel}: ${c.newValue}`).join(", ");
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<BolaoNotification[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
      
      const userStored = localStorage.getItem(USER_NOTIF_KEY);
      if (userStored) {
        setUserNotifications(JSON.parse(userStored));
      } else {
        // Demo notifications for user
        setUserNotifications([
          {
            id: "user_notif_1",
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            title: "Bolão Atualizado!",
            message: "O prêmio da Mega da Virada foi atualizado para R$ 550.000.000",
            type: "bolao_update",
            bolaoId: "BOL002",
            read: false,
            link: "/megasena",
          },
          {
            id: "user_notif_2",
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
            title: "Sorteio Realizado",
            message: "O resultado da Quina concurso 6522 foi divulgado. Verifique seus bilhetes!",
            type: "bolao_update",
            bolaoId: "BOL006",
            read: true,
            link: "/resultados",
          },
        ]);
      }
    } catch (e) {
      console.error("Failed to load notifications from storage:", e);
    }
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications to storage:", e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_NOTIF_KEY, JSON.stringify(userNotifications));
    } catch (e) {
      console.error("Failed to save user notifications to storage:", e);
    }
  }, [userNotifications]);

  // Unread count
  const unreadCount = userNotifications.filter(n => !n.read).length;

  // Send notification (simulated)
  const sendNotification = useCallback(async (
    notification: Omit<BolaoNotification, "id" | "timestamp" | "status" | "deliveryStats">
  ): Promise<string> => {
    const id = generateId();
    
    // Simulate sending process
    const newNotification: BolaoNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
      status: "pending",
      deliveryStats: {
        total: notification.recipientCount,
        sent: 0,
        failed: 0,
      },
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Simulate async sending (in real app, this would call an API)
    setTimeout(() => {
      setNotifications(prev => prev.map(n => {
        if (n.id === id) {
          // Simulate mostly successful delivery
          const sent = Math.floor(notification.recipientCount * 0.95);
          const failed = notification.recipientCount - sent;
          return {
            ...n,
            status: failed === 0 ? "sent" : "partial",
            deliveryStats: {
              total: notification.recipientCount,
              sent,
              failed,
            },
          };
        }
        return n;
      }));
      
      // Also add to user notifications for demo
      const userNotif: UserNotification = {
        id: generateId(),
        timestamp: Date.now(),
        title: `${notification.bolaoName} Atualizado`,
        message: notification.customMessage || `O bolão ${notification.bolaoCode} foi atualizado: ${notification.changesSummary}`,
        type: "bolao_update",
        bolaoId: notification.bolaoId,
        read: false,
        link: notification.bolaoType === "lotofacil" ? "/lotofacil" : notification.bolaoType === "megasena" ? "/megasena" : "/quina",
      };
      setUserNotifications(prev => [userNotif, ...prev]);
    }, 1500);
    
    return id;
  }, []);

  // Get notification by ID
  const getNotification = useCallback((id: string): BolaoNotification | null => {
    return notifications.find(n => n.id === id) || null;
  }, [notifications]);

  // Get notifications by bolão
  const getNotificationsByBolao = useCallback((bolaoId: string): BolaoNotification[] => {
    return notifications.filter(n => n.bolaoId === bolaoId);
  }, [notifications]);

  // Get pending reminders
  const getPendingReminders = useCallback((): BolaoNotification[] => {
    return notifications.filter(n => n.hasReminder && n.reminderDate);
  }, [notifications]);

  // Cancel reminder
  const cancelReminder = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        return { ...n, hasReminder: false, reminderDate: undefined };
      }
      return n;
    }));
  }, []);

  // Mark as read
  const markAsRead = useCallback((notificationId: string) => {
    setUserNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        return { ...n, read: true };
      }
      return n;
    }));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setUserNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        sendNotification,
        getNotification,
        getNotificationsByBolao,
        getPendingReminders,
        cancelReminder,
        userNotifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationContext;
