/**
 * Live Purchase Notification Service
 * 
 * Generates mock real-time purchase notifications for the live ticker.
 * Ready for WebSocket integration in the future.
 */

// ==================== Types ====================

export type NotificationType = "purchase" | "win_small" | "win_big" | "vip_signup";
export type LotteryType = "lotofacil" | "megasena" | "quina";

export interface PurchaseNotification {
  id: string;
  type: NotificationType;
  userInitials: string;
  fullName?: string; // Only set if user allows (never exposed publicly)
  bolaoName: string;
  lotteryType: LotteryType;
  timestamp: Date;
  isSpecial?: boolean;
  dezenas?: number;
  prize?: string;
  amount?: number; // Purchase amount (hidden from public view)
}

export interface NotificationSubscriber {
  id: string;
  callback: (notification: PurchaseNotification) => void;
}

// ==================== Constants ====================

// Pool of 50+ Brazilian first names
const FIRST_NAMES = [
  "João", "Maria", "Carlos", "Ana", "Pedro", "Juliana", "Lucas", "Fernanda",
  "Rafael", "Camila", "Bruno", "Patricia", "Thiago", "Letícia", "Diego",
  "Aline", "Rodrigo", "Beatriz", "Felipe", "Mariana", "Gustavo", "Renata",
  "André", "Larissa", "Daniel", "Amanda", "Matheus", "Isabela", "Leandro",
  "Priscila", "Marcos", "Carla", "Henrique", "Tatiane", "Eduardo", "Vanessa",
  "Paulo", "Cláudia", "Roberto", "Sandra", "José", "Lucia", "Fernando", "Rita",
  "Antônio", "Teresa", "Francisco", "Helena", "Marcelo", "Adriana", "Ricardo",
  "Cristina", "Sérgio", "Paula", "Alexandre", "Daniela", "Wagner", "Simone",
  "Márcio", "Fabiana", "Rogério", "Luciana", "César", "Eliane"
];

const LAST_INITIALS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "V"];

// Bolão configurations per lottery type
const BOLAO_CONFIGS: Record<LotteryType, Array<{
  name: string;
  dezenas: number;
  prize: string;
  isSpecial: boolean;
}>> = {
  lotofacil: [
    { name: "Premium Gold", dezenas: 18, prize: "R$ 8,5 Milhões", isSpecial: false },
    { name: "Super Chance", dezenas: 17, prize: "R$ 5,2 Milhões", isSpecial: false },
    { name: "Mega Grupo", dezenas: 20, prize: "R$ 12 Milhões", isSpecial: false },
    { name: "Independência Especial", dezenas: 18, prize: "R$ 10 Milhões", isSpecial: true },
    { name: "Lucky Stars", dezenas: 16, prize: "R$ 4,8 Milhões", isSpecial: false },
    { name: "Grupo Diamante", dezenas: 19, prize: "R$ 9,3 Milhões", isSpecial: false },
    { name: "Fortuna Plus", dezenas: 17, prize: "R$ 6,1 Milhões", isSpecial: false },
    { name: "Sucesso Total", dezenas: 20, prize: "R$ 11,5 Milhões", isSpecial: false },
  ],
  megasena: [
    { name: "Virada Milionária", dezenas: 12, prize: "R$ 550 Milhões", isSpecial: true },
    { name: "Acumulada Plus", dezenas: 10, prize: "R$ 87 Milhões", isSpecial: false },
    { name: "Grupo Elite", dezenas: 15, prize: "R$ 145 Milhões", isSpecial: false },
    { name: "Sonho Grande", dezenas: 8, prize: "R$ 65 Milhões", isSpecial: false },
    { name: "Mega Chance", dezenas: 11, prize: "R$ 98 Milhões", isSpecial: false },
    { name: "Milionário VIP", dezenas: 13, prize: "R$ 120 Milhões", isSpecial: false },
    { name: "Super Mega", dezenas: 14, prize: "R$ 135 Milhões", isSpecial: false },
    { name: "Jackpot Master", dezenas: 9, prize: "R$ 78 Milhões", isSpecial: false },
  ],
  quina: [
    { name: "São João Premium", dezenas: 12, prize: "R$ 7 Milhões", isSpecial: true },
    { name: "Diária Premium", dezenas: 10, prize: "R$ 2,8 Milhões", isSpecial: false },
    { name: "Super Quina", dezenas: 8, prize: "R$ 1,9 Milhões", isSpecial: false },
    { name: "Grupo Sorte", dezenas: 15, prize: "R$ 3,2 Milhões", isSpecial: false },
    { name: "Estrela da Sorte", dezenas: 9, prize: "R$ 2,1 Milhões", isSpecial: false },
    { name: "Quina Express", dezenas: 11, prize: "R$ 2,5 Milhões", isSpecial: false },
    { name: "Fortuna Quina", dezenas: 13, prize: "R$ 3,0 Milhões", isSpecial: false },
  ],
};

// ==================== State ====================

let notifications: PurchaseNotification[] = [];
let subscribers: NotificationSubscriber[] = [];
let lastNotificationTime = 0;
const MIN_INTERVAL_MS = 5000; // Minimum 5 seconds between notifications (rate limiting)
const MAX_STORED_NOTIFICATIONS = 50;

// ==================== Helper Functions ====================

/**
 * Extract user initials from full name for privacy
 * Returns format: "First L." (e.g., "João S.")
 */
export const extractInitials = (fullName: string): string => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 0) return "Anônimo";
  
  const firstName = parts[0];
  const lastInitial = parts.length > 1 
    ? parts[parts.length - 1].charAt(0).toUpperCase() + "."
    : "";
  
  return `${firstName} ${lastInitial}`.trim();
};

/**
 * Generate a random user name with initials
 */
const generateRandomUser = (): { fullName: string; initials: string } => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
  
  return {
    fullName: `${firstName} ${lastInitial}oberto`, // Mock full name
    initials: `${firstName} ${lastInitial}.`,
  };
};

/**
 * Generate a unique ID for notifications
 */
const generateId = (): string => {
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Get random bolão configuration
 */
const getRandomBolao = (lotteryType?: LotteryType) => {
  const type = lotteryType || (["lotofacil", "megasena", "quina"] as LotteryType[])[
    Math.floor(Math.random() * 3)
  ];
  const bolaos = BOLAO_CONFIGS[type];
  const bolao = bolaos[Math.floor(Math.random() * bolaos.length)];
  
  return { ...bolao, lotteryType: type };
};

/**
 * Get notification type based on weighted probability
 */
const getRandomNotificationType = (): NotificationType => {
  const random = Math.random();
  
  // 85% purchases, 8% small wins, 4% big wins, 3% VIP signups
  if (random < 0.85) return "purchase";
  if (random < 0.93) return "win_small";
  if (random < 0.97) return "win_big";
  return "vip_signup";
};

// ==================== Main Functions ====================

/**
 * Generate a new mock purchase notification
 */
export const generateMockPurchase = (options?: {
  type?: NotificationType;
  lotteryType?: LotteryType;
}): PurchaseNotification => {
  const user = generateRandomUser();
  const bolao = getRandomBolao(options?.lotteryType);
  const type = options?.type || getRandomNotificationType();
  
  const notification: PurchaseNotification = {
    id: generateId(),
    type,
    userInitials: user.initials,
    bolaoName: bolao.name,
    lotteryType: bolao.lotteryType,
    timestamp: new Date(),
    isSpecial: bolao.isSpecial,
    dezenas: bolao.dezenas,
    prize: bolao.prize,
    amount: Math.floor(Math.random() * 450) + 50, // R$ 50 - R$ 500
  };
  
  return notification;
};

/**
 * Add a notification to the store and notify subscribers
 * Respects rate limiting to avoid spam
 */
export const addNotification = (notification: PurchaseNotification): boolean => {
  const now = Date.now();
  
  // Rate limiting check
  if (now - lastNotificationTime < MIN_INTERVAL_MS) {
    return false;
  }
  
  lastNotificationTime = now;
  
  // Add to store (prepend)
  notifications = [notification, ...notifications].slice(0, MAX_STORED_NOTIFICATIONS);
  
  // Notify all subscribers
  subscribers.forEach(sub => {
    try {
      sub.callback(notification);
    } catch (error) {
      console.error(`Error notifying subscriber ${sub.id}:`, error);
    }
  });
  
  return true;
};

/**
 * Get recent notifications
 */
export const getRecentPurchases = (limit: number = 20): PurchaseNotification[] => {
  return notifications.slice(0, limit);
};

/**
 * Subscribe to new notifications
 * Returns unsubscribe function
 */
export const subscribeToNewPurchases = (
  callback: (notification: PurchaseNotification) => void
): () => void => {
  const id = generateId();
  
  subscribers.push({ id, callback });
  
  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter(sub => sub.id !== id);
  };
};

/**
 * Get current subscriber count (for debugging/admin)
 */
export const getSubscriberCount = (): number => {
  return subscribers.length;
};

/**
 * Clear all notifications (for testing/admin)
 */
export const clearNotifications = (): void => {
  notifications = [];
};

/**
 * Generate initial batch of notifications for ticker startup
 */
export const generateInitialNotifications = (count: number = 15): PurchaseNotification[] => {
  const initialNotifications: PurchaseNotification[] = [];
  
  for (let i = 0; i < count; i++) {
    const notification = generateMockPurchase();
    // Spread timestamps over the last 10 minutes
    notification.timestamp = new Date(Date.now() - i * 40000);
    initialNotifications.push(notification);
  }
  
  notifications = initialNotifications;
  return initialNotifications;
};

/**
 * Start automatic notification generation
 * Returns cleanup function
 */
export const startAutoGeneration = (
  minInterval: number = 10000,
  maxInterval: number = 30000
): () => void => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isRunning = true;
  
  const scheduleNext = () => {
    if (!isRunning) return;
    
    const delay = minInterval + Math.random() * (maxInterval - minInterval);
    
    timeoutId = setTimeout(() => {
      if (!isRunning) return;
      
      const notification = generateMockPurchase();
      addNotification(notification);
      scheduleNext();
    }, delay);
  };
  
  scheduleNext();
  
  // Return cleanup function
  return () => {
    isRunning = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

// ==================== WebSocket Integration (Placeholder) ====================

/**
 * TODO: Future WebSocket integration
 * 
 * When implementing real-time notifications via WebSocket:
 * 
 * 1. Create WebSocket connection to server:
 *    const ws = new WebSocket('wss://api.bolaomax.com/notifications');
 * 
 * 2. On message received, parse and add notification:
 *    ws.onmessage = (event) => {
 *      const data = JSON.parse(event.data);
 *      const notification = mapServerNotification(data);
 *      addNotification(notification);
 *    };
 * 
 * 3. Handle reconnection logic with exponential backoff
 * 
 * 4. Server should send anonymized data only:
 *    - User initials (never full name)
 *    - Bolão public info
 *    - Timestamp
 */

// ==================== Export Service Object ====================

export const liveNotificationService = {
  generateMockPurchase,
  addNotification,
  getRecentPurchases,
  subscribeToNewPurchases,
  getSubscriberCount,
  clearNotifications,
  generateInitialNotifications,
  startAutoGeneration,
  extractInitials,
};

export default liveNotificationService;
