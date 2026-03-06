/**
 * VIP Notification Service
 * Handles notifications for VIP distribution events
 */

export type NotificationChannel = "in_app" | "email" | "push";
export type NotificationStatus = "pending" | "sent" | "delivered" | "read" | "failed";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface VIPNotification {
  id: string;
  subscriberId: string;
  subscriberName: string;
  subscriberEmail: string;
  type: "distribution" | "special_bolao" | "win" | "reminder" | "system";
  title: string;
  message: string;
  data: {
    boloes?: { id: string; name: string; lotteryType: string }[];
    prizeAmount?: number;
    distributionId?: string;
  };
  channels: NotificationChannel[];
  status: Record<NotificationChannel, NotificationStatus>;
  priority: NotificationPriority;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: VIPNotification["type"];
  titleTemplate: string;
  messageTemplate: string;
  channels: NotificationChannel[];
  active: boolean;
}

export interface NotificationStats {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
}

// In-memory storage for notifications (in production, use database)
let notifications: VIPNotification[] = [];

// Default notification templates
const defaultTemplates: NotificationTemplate[] = [
  {
    id: "dist_weekly",
    name: "Distribuição Semanal",
    type: "distribution",
    titleTemplate: "🎉 Seus bolões da semana estão disponíveis!",
    messageTemplate: "Olá {nome}! {quantidade} novo(s) bolão(ões) foram adicionados à sua conta: {lista_boloes}. Acesse sua conta para conferir!",
    channels: ["in_app", "email"],
    active: true,
  },
  {
    id: "special_bolao",
    name: "Bolão Especial",
    type: "special_bolao",
    titleTemplate: "⭐ Bolão Especial Disponível!",
    messageTemplate: "Olá {nome}! Como assinante {plano}, você recebeu acesso ao bolão especial: {nome_bolao}. Prêmio estimado: {premio}!",
    channels: ["in_app", "email", "push"],
    active: true,
  },
  {
    id: "win_notification",
    name: "Notificação de Prêmio",
    type: "win",
    titleTemplate: "🏆 Parabéns! Você ganhou!",
    messageTemplate: "Olá {nome}! O bolão {nome_bolao} foi sorteado e você ganhou {valor}! O valor será creditado em sua conta em até 24 horas.",
    channels: ["in_app", "email", "push"],
    active: true,
  },
  {
    id: "reminder",
    name: "Lembrete de Sorteio",
    type: "reminder",
    titleTemplate: "⏰ Sorteio em breve!",
    messageTemplate: "Olá {nome}! O sorteio do bolão {nome_bolao} acontece amanhã. Boa sorte! 🍀",
    channels: ["in_app"],
    active: true,
  },
];

let templates = [...defaultTemplates];

/**
 * Generate unique notification ID
 */
const generateNotificationId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Replace template variables with actual values
 */
const processTemplate = (template: string, variables: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
};

/**
 * Create and send distribution notification
 */
export const createDistributionNotification = async (
  subscriberId: string,
  subscriberName: string,
  subscriberEmail: string,
  planType: string,
  boloes: { id: string; name: string; lotteryType: string }[],
  channels: NotificationChannel[] = ["in_app", "email"],
  dryRun: boolean = false
): Promise<VIPNotification> => {
  const template = templates.find(t => t.id === "dist_weekly") || defaultTemplates[0];
  
  const bolaoNames = boloes.map(b => b.name).join(", ");
  const variables = {
    nome: subscriberName,
    quantidade: boloes.length.toString(),
    lista_boloes: bolaoNames,
    plano: planType,
  };

  const notification: VIPNotification = {
    id: generateNotificationId(),
    subscriberId,
    subscriberName,
    subscriberEmail,
    type: "distribution",
    title: processTemplate(template.titleTemplate, variables),
    message: processTemplate(template.messageTemplate, variables),
    data: { boloes },
    channels,
    status: {
      in_app: channels.includes("in_app") ? "pending" : "sent",
      email: channels.includes("email") ? "pending" : "sent",
      push: channels.includes("push") ? "pending" : "sent",
    },
    priority: "normal",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  if (!dryRun) {
    // Send via each channel
    for (const channel of channels) {
      await sendViaChannel(notification, channel);
    }
    
    notifications.unshift(notification);
    // Keep only last 1000 notifications
    if (notifications.length > 1000) {
      notifications = notifications.slice(0, 1000);
    }
  }

  console.log(
    `[VIP Notification] ${dryRun ? "[DRY RUN] " : ""}Distribution notification ${dryRun ? "would be " : ""}sent to ${subscriberName}:`,
    notification.title
  );

  return notification;
};

/**
 * Create special bolão notification
 */
export const createSpecialBolaoNotification = async (
  subscriberId: string,
  subscriberName: string,
  subscriberEmail: string,
  planType: string,
  bolao: { id: string; name: string; prizeEstimate: number },
  dryRun: boolean = false
): Promise<VIPNotification> => {
  const template = templates.find(t => t.id === "special_bolao") || defaultTemplates[1];
  
  const variables = {
    nome: subscriberName,
    plano: planType,
    nome_bolao: bolao.name,
    premio: `R$ ${(bolao.prizeEstimate / 1000000).toFixed(1)} Milhões`,
  };

  const notification: VIPNotification = {
    id: generateNotificationId(),
    subscriberId,
    subscriberName,
    subscriberEmail,
    type: "special_bolao",
    title: processTemplate(template.titleTemplate, variables),
    message: processTemplate(template.messageTemplate, variables),
    data: {
      boloes: [{ id: bolao.id, name: bolao.name, lotteryType: "Special" }],
    },
    channels: template.channels,
    status: {
      in_app: "pending",
      email: "pending",
      push: "pending",
    },
    priority: "high",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
  };

  if (!dryRun) {
    for (const channel of template.channels) {
      await sendViaChannel(notification, channel);
    }
    notifications.unshift(notification);
  }

  return notification;
};

/**
 * Create win notification
 */
export const createWinNotification = async (
  subscriberId: string,
  subscriberName: string,
  subscriberEmail: string,
  bolaoName: string,
  prizeAmount: number,
  dryRun: boolean = false
): Promise<VIPNotification> => {
  const template = templates.find(t => t.id === "win_notification") || defaultTemplates[2];
  
  const variables = {
    nome: subscriberName,
    nome_bolao: bolaoName,
    valor: `R$ ${prizeAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
  };

  const notification: VIPNotification = {
    id: generateNotificationId(),
    subscriberId,
    subscriberName,
    subscriberEmail,
    type: "win",
    title: processTemplate(template.titleTemplate, variables),
    message: processTemplate(template.messageTemplate, variables),
    data: {
      prizeAmount,
    },
    channels: template.channels,
    status: {
      in_app: "pending",
      email: "pending",
      push: "pending",
    },
    priority: "urgent",
    createdAt: new Date(),
  };

  if (!dryRun) {
    for (const channel of template.channels) {
      await sendViaChannel(notification, channel);
    }
    notifications.unshift(notification);
  }

  return notification;
};

/**
 * Send notification via specific channel
 */
const sendViaChannel = async (
  notification: VIPNotification,
  channel: NotificationChannel
): Promise<boolean> => {
  try {
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 50));

    switch (channel) {
      case "in_app":
        // In production: Store in user's notification queue
        console.log(`[VIP Notification] In-app notification created for ${notification.subscriberName}`);
        notification.status.in_app = "sent";
        break;
        
      case "email":
        // In production: Call email service (SendGrid, SES, etc.)
        console.log(`[VIP Notification] Email sent to ${notification.subscriberEmail}`);
        notification.status.email = "sent";
        break;
        
      case "push":
        // In production: Call push notification service (Firebase, etc.)
        console.log(`[VIP Notification] Push notification sent to ${notification.subscriberName}`);
        notification.status.push = "sent";
        break;
    }

    notification.sentAt = new Date();
    return true;
  } catch (error) {
    console.error(`[VIP Notification] Failed to send via ${channel}:`, error);
    notification.status[channel] = "failed";
    return false;
  }
};

/**
 * Mark notification as delivered
 */
export const markAsDelivered = (notificationId: string, channel: NotificationChannel): boolean => {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.status[channel] = "delivered";
    notification.deliveredAt = new Date();
    return true;
  }
  return false;
};

/**
 * Mark notification as read
 */
export const markAsRead = (notificationId: string): boolean => {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    Object.keys(notification.status).forEach(channel => {
      if (notification.status[channel as NotificationChannel] === "delivered") {
        notification.status[channel as NotificationChannel] = "read";
      }
    });
    notification.readAt = new Date();
    return true;
  }
  return false;
};

/**
 * Get notifications for a subscriber
 */
export const getSubscriberNotifications = (
  subscriberId: string,
  limit: number = 20,
  unreadOnly: boolean = false
): VIPNotification[] => {
  let filtered = notifications.filter(n => n.subscriberId === subscriberId);
  
  if (unreadOnly) {
    filtered = filtered.filter(n => !n.readAt);
  }
  
  return filtered.slice(0, limit);
};

/**
 * Get all notifications (admin view)
 */
export const getAllNotifications = (
  limit: number = 100,
  filter?: {
    type?: VIPNotification["type"];
    channel?: NotificationChannel;
    status?: NotificationStatus;
  }
): VIPNotification[] => {
  let filtered = notifications;

  if (filter?.type) {
    filtered = filtered.filter(n => n.type === filter.type);
  }
  if (filter?.channel) {
    filtered = filtered.filter(n => n.channels.includes(filter.channel!));
  }
  if (filter?.status) {
    filtered = filtered.filter(n => 
      Object.values(n.status).includes(filter.status!)
    );
  }

  return filtered.slice(0, limit);
};

/**
 * Get notification statistics
 */
export const getNotificationStats = (): NotificationStats => {
  const totalSent = notifications.length;
  const delivered = notifications.filter(n => n.deliveredAt).length;
  const read = notifications.filter(n => n.readAt).length;
  const failed = notifications.filter(n => 
    Object.values(n.status).includes("failed")
  ).length;

  return {
    totalSent,
    delivered,
    read,
    failed,
    deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
    readRate: delivered > 0 ? (read / delivered) * 100 : 0,
  };
};

/**
 * Get unread count for a subscriber
 */
export const getUnreadCount = (subscriberId: string): number => {
  return notifications.filter(
    n => n.subscriberId === subscriberId && !n.readAt
  ).length;
};

/**
 * Get notification templates
 */
export const getNotificationTemplates = (): NotificationTemplate[] => {
  return [...templates];
};

/**
 * Update notification template
 */
export const updateNotificationTemplate = (
  templateId: string,
  updates: Partial<NotificationTemplate>
): NotificationTemplate | null => {
  const index = templates.findIndex(t => t.id === templateId);
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updates };
    return templates[index];
  }
  return null;
};

/**
 * Create batch notifications for distribution event
 */
export const createBatchDistributionNotifications = async (
  distributions: Array<{
    subscriberId: string;
    subscriberName: string;
    subscriberEmail: string;
    planType: string;
    boloes: { id: string; name: string; lotteryType: string }[];
  }>,
  channels: NotificationChannel[] = ["in_app", "email"],
  dryRun: boolean = false
): Promise<{
  totalSent: number;
  successful: number;
  failed: number;
  notifications: VIPNotification[];
}> => {
  console.log(
    `[VIP Notification] ${dryRun ? "[DRY RUN] " : ""}Creating batch notifications for ${distributions.length} subscribers`
  );

  const results: VIPNotification[] = [];
  let successful = 0;
  let failed = 0;

  for (const dist of distributions) {
    try {
      const notification = await createDistributionNotification(
        dist.subscriberId,
        dist.subscriberName,
        dist.subscriberEmail,
        dist.planType,
        dist.boloes,
        channels,
        dryRun
      );
      results.push(notification);
      successful++;
    } catch (error) {
      console.error(`[VIP Notification] Failed for ${dist.subscriberName}:`, error);
      failed++;
    }
  }

  console.log(
    `[VIP Notification] Batch complete: ${successful} successful, ${failed} failed`
  );

  return {
    totalSent: distributions.length,
    successful,
    failed,
    notifications: results,
  };
};

/**
 * Clear old notifications
 */
export const clearOldNotifications = (daysOld: number = 30): number => {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  const beforeCount = notifications.length;
  
  notifications = notifications.filter(n => n.createdAt > cutoff);
  
  const removed = beforeCount - notifications.length;
  console.log(`[VIP Notification] Cleared ${removed} old notifications`);
  return removed;
};

export default {
  createDistributionNotification,
  createSpecialBolaoNotification,
  createWinNotification,
  markAsDelivered,
  markAsRead,
  getSubscriberNotifications,
  getAllNotifications,
  getNotificationStats,
  getUnreadCount,
  getNotificationTemplates,
  updateNotificationTemplate,
  createBatchDistributionNotifications,
  clearOldNotifications,
};
