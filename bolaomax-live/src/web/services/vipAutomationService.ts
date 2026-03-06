/**
 * VIP Automation Service
 * Handles automatic weekly distribution of bolões to VIP subscribers
 */

// Types
export type PlanType = "Bronze" | "Prata" | "Ouro";
export type LotteryType = "Lotofácil" | "Mega-Sena" | "Quina";
export type DistributionStatus = "pending" | "in_progress" | "success" | "partial" | "error";

// Subscription status types for filtering active subscriptions
export type SubscriptionStatus = "Ativo" | "Pausado" | "Cancelado" | "Expirado" | "Pendente";
export type PaymentStatus = "Em Dia" | "Atrasado" | "Pendente" | "Falhou";

// Payment validation result type
export type PaymentValidationResult = "valid" | "overdue" | "pending" | "failed" | "retry_needed";

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  active: boolean;
  // Extended subscription fields for filtering
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  subscriptionEndDate?: string;
  accountSuspended: boolean;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  overdueAmount?: number;
  paymentRetryCount?: number;
  lastContactDate?: string;
  preferences?: DistributionPreferences;
  lastDistributionDate?: string;
}

// Interface for tracking skipped subscribers during distribution
export interface SkippedSubscriber {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  reason: string;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
}

// Payment issue subscriber for reporting
export interface PaymentIssueSubscriber {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  overdueAmount: number;
  daysOverdue: number;
  paymentStatus: PaymentStatus;
  paymentRetryCount: number;
  lastContactDate?: string;
  action: "send_reminder" | "suspend" | "cancel" | "retry_payment";
}

// Payment problems report
export interface PaymentProblemsReport {
  generatedAt: Date;
  totalIssues: number;
  totalOverdueAmount: number;
  byStatus: {
    overdue: PaymentIssueSubscriber[];
    pending: PaymentIssueSubscriber[];
    failed: PaymentIssueSubscriber[];
  };
  urgentCases: PaymentIssueSubscriber[]; // > 7 days overdue
  warningCases: PaymentIssueSubscriber[]; // 3-7 days overdue
}

// Validation result for distribution eligibility
export interface DistributionValidationResult {
  totalSubscribers: number;
  activeOnly: number;
  skippedInactive: number;
  skippedSubscribers: SkippedSubscriber[];
  eligibleSubscribers: Subscriber[];
}

export interface Bolao {
  id: string;
  name: string;
  lotteryType: LotteryType;
  value: number;
  drawDate: string;
  availableSlots: number;
  prizeEstimate: number;
}

export interface DistributionPreferences {
  preferredLotteries: LotteryType[];
  maxValuePerBolao: number;
  autoParticipate: boolean;
}

export interface DistributionRecord {
  id: string;
  timestamp: Date;
  plan: PlanType;
  subscribersProcessed: number;
  boloesDistributed: number;
  status: DistributionStatus;
  errors: DistributionError[];
  dryRun: boolean;
  // New fields for tracking skipped/excluded subscribers
  totalSubscribers?: number;
  eligibleSubscribers?: number;
  skippedSubscribers?: SkippedSubscriber[];
}

export interface DistributionError {
  subscriberId: string;
  subscriberName: string;
  errorMessage: string;
  timestamp: Date;
}

export interface PlanAllocation {
  plan: PlanType;
  boloesPerWeek: number;
  lotteryDistribution: {
    [key in LotteryType]?: number;
  };
  minValue: number;
  maxValue: number;
}

export interface DistributionResult {
  success: boolean;
  subscriberId: string;
  boloesAssigned: Bolao[];
  errorMessage?: string;
}

export interface ScheduleConfig {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  hour: number;
  minute: number;
  enabled: boolean;
}

// Selection Algorithm Configuration
export interface SelectionAlgorithmConfig {
  weights: {
    prize: number;        // Weight for prize amount
    odds: number;         // Weight for odds/probability
    closing: number;      // Weight for bolões closing soon
    participants: number; // Weight for social proof
    freshness: number;    // Weight for new bolões
  };
  reserveSpecialForOuro: boolean;
  enableFairnessRotation: boolean;
  respectUserPreferences: boolean;
}

export interface EnrichedBolao extends Bolao {
  isSpecial: boolean;
  isExclusive: boolean;
  participantCount: number;
  closingDate: string;
  createdAt: string;
  score?: number;
}

export interface SubscriberDistributionHistory {
  subscriberId: string;
  receivedBolaoIds: string[];
  lastPremiumBolaoDate?: string;
  rotationIndex: number;
}

// Default algorithm configuration
let algorithmConfig: SelectionAlgorithmConfig = {
  weights: {
    prize: 0.30,
    odds: 0.20,
    closing: 0.15,
    participants: 0.15,
    freshness: 0.20,
  },
  reserveSpecialForOuro: true,
  enableFairnessRotation: true,
  respectUserPreferences: true,
};

// Track distribution history for fairness
const subscriberHistory: Map<string, SubscriberDistributionHistory> = new Map();

// Plan allocation configuration
const PLAN_ALLOCATIONS: Record<PlanType, PlanAllocation> = {
  Bronze: {
    plan: "Bronze",
    boloesPerWeek: 1,
    lotteryDistribution: {
      "Lotofácil": 1,
    },
    minValue: 50,
    maxValue: 150,
  },
  Prata: {
    plan: "Prata",
    boloesPerWeek: 2,
    lotteryDistribution: {
      "Lotofácil": 1,
      "Quina": 1,
    },
    minValue: 100,
    maxValue: 300,
  },
  Ouro: {
    plan: "Ouro",
    boloesPerWeek: 3,
    lotteryDistribution: {
      "Lotofácil": 1,
      "Mega-Sena": 1,
      "Quina": 1,
    },
    minValue: 150,
    maxValue: 500,
  },
};

// Mock data storage (in production, these would be API calls)
let distributionHistory: DistributionRecord[] = [];
let scheduleConfig: ScheduleConfig = {
  dayOfWeek: 1, // Monday
  hour: 6,
  minute: 0,
  enabled: true,
};

/**
 * Configure weekly distribution schedule
 */
export const scheduleWeeklyDistribution = (config: Partial<ScheduleConfig>): ScheduleConfig => {
  scheduleConfig = { ...scheduleConfig, ...config };
  console.log(`[VIP Automation] Schedule updated:`, scheduleConfig);
  return scheduleConfig;
};

/**
 * Get current schedule configuration
 */
export const getScheduleConfig = (): ScheduleConfig => {
  return { ...scheduleConfig };
};

/**
 * Check if a subscriber is eligible for distribution
 * Returns true if eligible, or string with reason if not eligible
 */
export const checkSubscriberEligibility = (subscriber: Subscriber): true | string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Check subscription status is 'Ativo'
  if (subscriber.subscriptionStatus !== "Ativo") {
    return `Status da assinatura: ${subscriber.subscriptionStatus}`;
  }

  // 2. Check payment status is 'Em Dia'
  if (subscriber.paymentStatus !== "Em Dia") {
    return `Status de pagamento: ${subscriber.paymentStatus}`;
  }

  // 3. Check subscription end date is in the future (for canceled but still active until end)
  if (subscriber.subscriptionEndDate) {
    const endDate = new Date(subscriber.subscriptionEndDate);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < today) {
      return `Assinatura expirada em ${subscriber.subscriptionEndDate}`;
    }
  }

  // 4. Check account is not suspended/blocked
  if (subscriber.accountSuspended) {
    return "Conta suspensa";
  }

  return true;
};

/**
 * Get all subscribers by plan type (unfiltered)
 * This returns ALL subscribers regardless of status
 */
export const getAllSubscribersByPlan = async (planType: PlanType): Promise<Subscriber[]> => {
  // In production, this would be an API call
  // Mock data for demonstration with extended fields
  const mockSubscribers: Subscriber[] = [
    { 
      id: "1", name: "João Silva", email: "joao@email.com", plan: "Ouro", active: true,
      subscriptionStatus: "Ativo", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-12-31", lastPaymentDate: "2025-02-01"
    },
    { 
      id: "2", name: "Maria Santos", email: "maria@email.com", plan: "Ouro", active: true,
      subscriptionStatus: "Ativo", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-12-31", lastPaymentDate: "2025-02-01"
    },
    { 
      id: "3", name: "Pedro Costa", email: "pedro@email.com", plan: "Prata", active: true,
      subscriptionStatus: "Ativo", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-06-30", lastPaymentDate: "2025-02-01"
    },
    { 
      id: "4", name: "Ana Lima", email: "ana@email.com", plan: "Prata", active: true,
      subscriptionStatus: "Ativo", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-12-31", lastPaymentDate: "2025-02-01"
    },
    { 
      id: "5", name: "Carlos Mendes", email: "carlos@email.com", plan: "Bronze", active: true,
      subscriptionStatus: "Ativo", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-03-31", lastPaymentDate: "2025-02-01"
    },
    { 
      id: "6", name: "Patricia Alves", email: "patricia@email.com", plan: "Bronze", active: true,
      subscriptionStatus: "Ativo", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-12-31", lastPaymentDate: "2025-02-01"
    },
    { 
      id: "7", name: "Roberto Gomes", email: "roberto@email.com", plan: "Ouro", active: false,
      subscriptionStatus: "Cancelado", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-01-15", lastPaymentDate: "2025-01-01"
    },
    { 
      id: "8", name: "Fernanda Costa", email: "fernanda@email.com", plan: "Prata", active: false,
      subscriptionStatus: "Pausado", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2025-06-30", lastPaymentDate: "2025-01-15"
    },
    { 
      id: "9", name: "Ricardo Oliveira", email: "ricardo@email.com", plan: "Bronze", active: false,
      subscriptionStatus: "Ativo", paymentStatus: "Atrasado", accountSuspended: false,
      subscriptionEndDate: "2025-04-30", lastPaymentDate: "2024-12-15"
    },
    { 
      id: "10", name: "Juliana Pereira", email: "juliana@email.com", plan: "Ouro", active: false,
      subscriptionStatus: "Expirado", paymentStatus: "Em Dia", accountSuspended: false,
      subscriptionEndDate: "2024-12-31", lastPaymentDate: "2024-12-01"
    },
    { 
      id: "11", name: "Marcos Silva", email: "marcos@email.com", plan: "Prata", active: false,
      subscriptionStatus: "Ativo", paymentStatus: "Em Dia", accountSuspended: true,
      subscriptionEndDate: "2025-12-31", lastPaymentDate: "2025-02-01"
    },
    { 
      id: "12", name: "Camila Santos", email: "camila@email.com", plan: "Bronze", active: false,
      subscriptionStatus: "Pendente", paymentStatus: "Pendente", accountSuspended: false,
      subscriptionEndDate: "2025-03-31", lastPaymentDate: undefined
    },
  ];

  return mockSubscribers.filter(s => s.plan === planType);
};

/**
 * Validate and filter subscribers for distribution eligibility
 * Returns detailed validation results with reasons for skipped subscribers
 */
export const validateSubscribersForDistribution = async (
  planType: PlanType
): Promise<DistributionValidationResult> => {
  const allSubscribers = await getAllSubscribersByPlan(planType);
  const eligibleSubscribers: Subscriber[] = [];
  const skippedSubscribers: SkippedSubscriber[] = [];

  for (const subscriber of allSubscribers) {
    const eligibilityResult = checkSubscriberEligibility(subscriber);
    
    if (eligibilityResult === true) {
      eligibleSubscribers.push(subscriber);
    } else {
      skippedSubscribers.push({
        id: subscriber.id,
        name: subscriber.name,
        email: subscriber.email,
        plan: subscriber.plan,
        reason: eligibilityResult,
        subscriptionStatus: subscriber.subscriptionStatus,
        paymentStatus: subscriber.paymentStatus,
      });
    }
  }

  const result: DistributionValidationResult = {
    totalSubscribers: allSubscribers.length,
    activeOnly: eligibleSubscribers.length,
    skippedInactive: skippedSubscribers.length,
    skippedSubscribers,
    eligibleSubscribers,
  };

  // Log validation results
  console.log(`[VIP Automation] Validation for ${planType}:`);
  console.log(`[VIP Automation]   Total subscribers: ${result.totalSubscribers}`);
  console.log(`[VIP Automation]   Active only: ${result.activeOnly}`);
  console.log(`[VIP Automation]   Skipped (inactive): ${result.skippedInactive}`);
  
  if (skippedSubscribers.length > 0) {
    console.log(`[VIP Automation]   Skipped subscribers:`);
    skippedSubscribers.forEach(s => {
      console.log(`[VIP Automation]     - ${s.name} (${s.id}): ${s.reason}`);
    });
  }

  return result;
};

/**
 * Get subscribers by plan type - ONLY returns eligible (active) subscribers
 * Filters by: status='Ativo', payment_status='Em Dia', valid end date, not suspended
 */
export const getSubscribersByPlan = async (planType: PlanType): Promise<Subscriber[]> => {
  const validation = await validateSubscribersForDistribution(planType);
  return validation.eligibleSubscribers;
};

/**
 * Get all active subscribers grouped by plan
 */
export const getAllActiveSubscribers = async (): Promise<Record<PlanType, Subscriber[]>> => {
  const [bronze, prata, ouro] = await Promise.all([
    getSubscribersByPlan("Bronze"),
    getSubscribersByPlan("Prata"),
    getSubscribersByPlan("Ouro"),
  ]);

  return {
    Bronze: bronze,
    Prata: prata,
    Ouro: ouro,
  };
};

/**
 * Get comprehensive validation results for all plans
 * Useful for admin dashboard to show subscriber eligibility overview
 */
export const getAllSubscribersValidation = async (): Promise<{
  Bronze: DistributionValidationResult;
  Prata: DistributionValidationResult;
  Ouro: DistributionValidationResult;
  totals: {
    totalSubscribers: number;
    totalActive: number;
    totalSkipped: number;
  };
}> => {
  const [bronze, prata, ouro] = await Promise.all([
    validateSubscribersForDistribution("Bronze"),
    validateSubscribersForDistribution("Prata"),
    validateSubscribersForDistribution("Ouro"),
  ]);

  return {
    Bronze: bronze,
    Prata: prata,
    Ouro: ouro,
    totals: {
      totalSubscribers: bronze.totalSubscribers + prata.totalSubscribers + ouro.totalSubscribers,
      totalActive: bronze.activeOnly + prata.activeOnly + ouro.activeOnly,
      totalSkipped: bronze.skippedInactive + prata.skippedInactive + ouro.skippedInactive,
    },
  };
};

// ============================================
// PAYMENT VALIDATION FUNCTIONS
// ============================================

/**
 * Validate payment status for a subscriber
 * Returns detailed payment validation result
 */
export const validatePaymentStatus = (subscriber: Subscriber): {
  result: PaymentValidationResult;
  daysOverdue: number;
  overdueAmount: number;
  shouldRetry: boolean;
  action: "send_reminder" | "suspend" | "cancel" | "retry_payment" | "none";
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If payment is "Em Dia", no issues
  if (subscriber.paymentStatus === "Em Dia") {
    return {
      result: "valid",
      daysOverdue: 0,
      overdueAmount: 0,
      shouldRetry: false,
      action: "none",
    };
  }

  // Calculate days overdue
  let daysOverdue = 0;
  if (subscriber.nextPaymentDate) {
    const nextPayment = new Date(subscriber.nextPaymentDate);
    nextPayment.setHours(0, 0, 0, 0);
    daysOverdue = Math.floor((today.getTime() - nextPayment.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue < 0) daysOverdue = 0;
  }

  const overdueAmount = subscriber.overdueAmount || 0;
  const retryCount = subscriber.paymentRetryCount || 0;
  const maxRetries = 3;

  // Payment failed - check retry status
  if (subscriber.paymentStatus === "Falhou") {
    if (retryCount < maxRetries) {
      return {
        result: "retry_needed",
        daysOverdue,
        overdueAmount,
        shouldRetry: true,
        action: "retry_payment",
      };
    } else {
      // Max retries reached
      return {
        result: "failed",
        daysOverdue,
        overdueAmount,
        shouldRetry: false,
        action: daysOverdue > 7 ? "cancel" : "suspend",
      };
    }
  }

  // Payment pending (processing)
  if (subscriber.paymentStatus === "Pendente") {
    return {
      result: "pending",
      daysOverdue: 0,
      overdueAmount: 0,
      shouldRetry: false,
      action: "none",
    };
  }

  // Payment overdue
  if (subscriber.paymentStatus === "Atrasado") {
    let action: "send_reminder" | "suspend" | "cancel" = "send_reminder";
    if (daysOverdue > 14) {
      action = "cancel";
    } else if (daysOverdue > 7) {
      action = "suspend";
    } else if (daysOverdue > 3) {
      action = "send_reminder";
    }

    return {
      result: "overdue",
      daysOverdue,
      overdueAmount,
      shouldRetry: retryCount < maxRetries,
      action,
    };
  }

  // Default case
  return {
    result: "valid",
    daysOverdue: 0,
    overdueAmount: 0,
    shouldRetry: false,
    action: "none",
  };
};

/**
 * Run payment validation for all subscribers before distribution
 */
export const runPreDistributionPaymentValidation = async (): Promise<{
  totalValidated: number;
  validPayments: number;
  invalidPayments: number;
  skippedForPayment: Subscriber[];
  paymentReport: PaymentProblemsReport;
}> => {
  console.log(`[VIP Automation] ========================================`);
  console.log(`[VIP Automation] Running Pre-Distribution Payment Validation`);
  console.log(`[VIP Automation] ========================================`);

  const allSubscribers = await Promise.all([
    getAllSubscribersByPlan("Bronze"),
    getAllSubscribersByPlan("Prata"),
    getAllSubscribersByPlan("Ouro"),
  ]);

  const flatSubscribers = allSubscribers.flat();
  const validPayments: Subscriber[] = [];
  const skippedForPayment: Subscriber[] = [];
  const overdueList: PaymentIssueSubscriber[] = [];
  const pendingList: PaymentIssueSubscriber[] = [];
  const failedList: PaymentIssueSubscriber[] = [];
  const urgentCases: PaymentIssueSubscriber[] = [];
  const warningCases: PaymentIssueSubscriber[] = [];

  for (const subscriber of flatSubscribers) {
    const validation = validatePaymentStatus(subscriber);

    if (validation.result === "valid") {
      validPayments.push(subscriber);
    } else {
      skippedForPayment.push(subscriber);

      const issueEntry: PaymentIssueSubscriber = {
        id: subscriber.id,
        name: subscriber.name,
        email: subscriber.email,
        plan: subscriber.plan,
        lastPaymentDate: subscriber.lastPaymentDate,
        nextPaymentDate: subscriber.nextPaymentDate,
        overdueAmount: validation.overdueAmount,
        daysOverdue: validation.daysOverdue,
        paymentStatus: subscriber.paymentStatus,
        paymentRetryCount: subscriber.paymentRetryCount || 0,
        lastContactDate: subscriber.lastContactDate,
        action: validation.action as "send_reminder" | "suspend" | "cancel" | "retry_payment",
      };

      // Categorize by status
      switch (validation.result) {
        case "overdue":
          overdueList.push(issueEntry);
          break;
        case "pending":
          pendingList.push(issueEntry);
          break;
        case "failed":
        case "retry_needed":
          failedList.push(issueEntry);
          break;
      }

      // Categorize by urgency
      if (validation.daysOverdue > 7) {
        urgentCases.push(issueEntry);
      } else if (validation.daysOverdue >= 3) {
        warningCases.push(issueEntry);
      }
    }
  }

  const paymentReport: PaymentProblemsReport = {
    generatedAt: new Date(),
    totalIssues: skippedForPayment.length,
    totalOverdueAmount: [...overdueList, ...failedList].reduce((sum, s) => sum + s.overdueAmount, 0),
    byStatus: {
      overdue: overdueList,
      pending: pendingList,
      failed: failedList,
    },
    urgentCases,
    warningCases,
  };

  console.log(`[VIP Automation] Payment Validation Complete:`);
  console.log(`[VIP Automation]   Total validated: ${flatSubscribers.length}`);
  console.log(`[VIP Automation]   Valid payments: ${validPayments.length}`);
  console.log(`[VIP Automation]   Payment issues: ${skippedForPayment.length}`);
  console.log(`[VIP Automation]     - Overdue: ${overdueList.length}`);
  console.log(`[VIP Automation]     - Pending: ${pendingList.length}`);
  console.log(`[VIP Automation]     - Failed: ${failedList.length}`);
  console.log(`[VIP Automation]   Urgent cases (>7 days): ${urgentCases.length}`);
  console.log(`[VIP Automation]   Warning cases (3-7 days): ${warningCases.length}`);
  console.log(`[VIP Automation] ========================================`);

  return {
    totalValidated: flatSubscribers.length,
    validPayments: validPayments.length,
    invalidPayments: skippedForPayment.length,
    skippedForPayment,
    paymentReport,
  };
};

/**
 * Retry payment for a subscriber (up to 3 times)
 */
export const retryPayment = async (
  subscriberId: string
): Promise<{
  success: boolean;
  retryCount: number;
  message: string;
}> => {
  // In production, this would call the payment provider API
  console.log(`[VIP Automation] Retrying payment for subscriber ${subscriberId}`);
  
  // Mock implementation - simulates 70% success rate on retry
  const success = Math.random() > 0.3;
  
  if (success) {
    console.log(`[VIP Automation] Payment retry successful for ${subscriberId}`);
    return {
      success: true,
      retryCount: 1,
      message: "Pagamento processado com sucesso na nova tentativa",
    };
  } else {
    console.log(`[VIP Automation] Payment retry failed for ${subscriberId}`);
    return {
      success: false,
      retryCount: 1,
      message: "Tentativa de pagamento falhou",
    };
  }
};

/**
 * Send payment reminder notification to subscriber
 */
export const sendPaymentReminderNotification = async (
  subscriber: Subscriber,
  daysUntilSuspension: number
): Promise<boolean> => {
  // In production, this would send email/push notification
  const message = daysUntilSuspension > 0
    ? `Olá ${subscriber.name}, seu pagamento está pendente. Regularize em ${daysUntilSuspension} dias para continuar recebendo seus bolões VIP.`
    : `Olá ${subscriber.name}, sua assinatura foi suspensa devido a pagamento pendente. Regularize para reativar seus benefícios.`;

  console.log(`[VIP Automation] Sending payment reminder to ${subscriber.email}: ${message}`);
  
  // In production, this would actually send the notification
  return true;
};

/**
 * Generate payment problems report for admin review
 */
export const generatePaymentProblemsReport = async (): Promise<PaymentProblemsReport> => {
  const validation = await runPreDistributionPaymentValidation();
  return validation.paymentReport;
};

/**
 * Process automatic payment actions based on validation
 * - Send reminders for 3+ days overdue
 * - Suspend accounts for 7+ days overdue  
 * - Cancel accounts for 14+ days overdue
 */
export const processAutomaticPaymentActions = async (): Promise<{
  remindersSent: number;
  accountsSuspended: number;
  accountsCanceled: number;
  paymentsRetried: number;
  successfulRetries: number;
}> => {
  console.log(`[VIP Automation] Processing automatic payment actions...`);
  
  const validation = await runPreDistributionPaymentValidation();
  const report = validation.paymentReport;

  let remindersSent = 0;
  let accountsSuspended = 0;
  let accountsCanceled = 0;
  let paymentsRetried = 0;
  let successfulRetries = 0;

  // Process each case based on suggested action
  const allIssues = [
    ...report.byStatus.overdue,
    ...report.byStatus.failed,
  ];

  for (const issue of allIssues) {
    switch (issue.action) {
      case "send_reminder":
        // Get subscriber for notification
        const subForReminder = validation.skippedForPayment.find(s => s.id === issue.id);
        if (subForReminder) {
          const daysUntilSuspension = 7 - issue.daysOverdue;
          await sendPaymentReminderNotification(subForReminder, daysUntilSuspension);
          remindersSent++;
        }
        break;

      case "retry_payment":
        const retryResult = await retryPayment(issue.id);
        paymentsRetried++;
        if (retryResult.success) {
          successfulRetries++;
        }
        break;

      case "suspend":
        // In production, update database to suspend account
        console.log(`[VIP Automation] Suspending account for ${issue.name} (${issue.id})`);
        accountsSuspended++;
        break;

      case "cancel":
        // In production, update database to cancel subscription
        console.log(`[VIP Automation] Canceling subscription for ${issue.name} (${issue.id})`);
        accountsCanceled++;
        break;
    }
  }

  console.log(`[VIP Automation] Payment actions complete:`);
  console.log(`[VIP Automation]   Reminders sent: ${remindersSent}`);
  console.log(`[VIP Automation]   Payments retried: ${paymentsRetried}`);
  console.log(`[VIP Automation]   Successful retries: ${successfulRetries}`);
  console.log(`[VIP Automation]   Accounts suspended: ${accountsSuspended}`);
  console.log(`[VIP Automation]   Accounts canceled: ${accountsCanceled}`);

  return {
    remindersSent,
    accountsSuspended,
    accountsCanceled,
    paymentsRetried,
    successfulRetries,
  };
};

/**
 * Get available bolões for distribution
 */
export const getAvailableBoloesForDistribution = async (
  lotteryType: LotteryType,
  minValue: number,
  maxValue: number
): Promise<Bolao[]> => {
  // Mock data - in production, this would query the database
  const mockBoloes: Bolao[] = [
    { id: "b1", name: "Lotofácil 18 Dez", lotteryType: "Lotofácil", value: 100, drawDate: "2025-01-20", availableSlots: 50, prizeEstimate: 2500000 },
    { id: "b2", name: "Lotofácil 20 Dez", lotteryType: "Lotofácil", value: 150, drawDate: "2025-01-22", availableSlots: 30, prizeEstimate: 3000000 },
    { id: "b3", name: "Mega-Sena Semanal", lotteryType: "Mega-Sena", value: 200, drawDate: "2025-01-25", availableSlots: 100, prizeEstimate: 45000000 },
    { id: "b4", name: "Quina Diária", lotteryType: "Quina", value: 80, drawDate: "2025-01-19", availableSlots: 40, prizeEstimate: 2000000 },
    { id: "b5", name: "Quina Premium", lotteryType: "Quina", value: 120, drawDate: "2025-01-21", availableSlots: 25, prizeEstimate: 2500000 },
  ];

  return mockBoloes.filter(
    b => b.lotteryType === lotteryType && b.value >= minValue && b.value <= maxValue && b.availableSlots > 0
  );
};

/**
 * Get all available bolões with enriched data
 */
export const getAllAvailableBoloesEnriched = async (): Promise<EnrichedBolao[]> => {
  // Mock enriched data - in production, this would query the database with additional fields
  const mockEnrichedBoloes: EnrichedBolao[] = [
    { 
      id: "b1", name: "Lotofácil 18 Dez", lotteryType: "Lotofácil", value: 100, 
      drawDate: "2025-01-20", availableSlots: 50, prizeEstimate: 2500000,
      isSpecial: false, isExclusive: false, participantCount: 150, 
      closingDate: "2025-01-19", createdAt: "2025-01-10"
    },
    { 
      id: "b2", name: "Lotofácil 20 Dez", lotteryType: "Lotofácil", value: 150, 
      drawDate: "2025-01-22", availableSlots: 30, prizeEstimate: 3000000,
      isSpecial: false, isExclusive: false, participantCount: 220, 
      closingDate: "2025-01-21", createdAt: "2025-01-15"
    },
    { 
      id: "b3", name: "Mega-Sena Semanal", lotteryType: "Mega-Sena", value: 200, 
      drawDate: "2025-01-25", availableSlots: 100, prizeEstimate: 45000000,
      isSpecial: false, isExclusive: false, participantCount: 320, 
      closingDate: "2025-01-24", createdAt: "2025-01-12"
    },
    { 
      id: "b4", name: "Mega da Virada VIP", lotteryType: "Mega-Sena", value: 500, 
      drawDate: "2025-12-31", availableSlots: 50, prizeEstimate: 550000000,
      isSpecial: true, isExclusive: true, participantCount: 450, 
      closingDate: "2025-12-30", createdAt: "2025-01-01"
    },
    { 
      id: "b5", name: "Quina Diária", lotteryType: "Quina", value: 80, 
      drawDate: "2025-01-19", availableSlots: 40, prizeEstimate: 2000000,
      isSpecial: false, isExclusive: false, participantCount: 85, 
      closingDate: "2025-01-18", createdAt: "2025-01-16"
    },
    { 
      id: "b6", name: "Quina Premium", lotteryType: "Quina", value: 120, 
      drawDate: "2025-01-21", availableSlots: 25, prizeEstimate: 2500000,
      isSpecial: false, isExclusive: false, participantCount: 175, 
      closingDate: "2025-01-20", createdAt: "2025-01-14"
    },
    { 
      id: "b7", name: "Quina de São João VIP", lotteryType: "Quina", value: 300, 
      drawDate: "2025-06-24", availableSlots: 30, prizeEstimate: 10000000,
      isSpecial: true, isExclusive: true, participantCount: 280, 
      closingDate: "2025-06-23", createdAt: "2025-01-05"
    },
    { 
      id: "b8", name: "Lotofácil Independência", lotteryType: "Lotofácil", value: 250, 
      drawDate: "2025-09-07", availableSlots: 40, prizeEstimate: 12000000,
      isSpecial: true, isExclusive: true, participantCount: 320, 
      closingDate: "2025-09-06", createdAt: "2025-01-02"
    },
  ];

  return mockEnrichedBoloes.filter(b => b.availableSlots > 0);
};

/**
 * Configure the selection algorithm weights
 */
export const configureAlgorithm = (config: Partial<SelectionAlgorithmConfig>): SelectionAlgorithmConfig => {
  algorithmConfig = { 
    ...algorithmConfig, 
    ...config,
    weights: { ...algorithmConfig.weights, ...(config.weights || {}) }
  };
  console.log(`[VIP Automation] Algorithm configuration updated:`, algorithmConfig);
  return algorithmConfig;
};

/**
 * Get current algorithm configuration
 */
export const getAlgorithmConfig = (): SelectionAlgorithmConfig => {
  return { ...algorithmConfig };
};

/**
 * Calculate score for a bolão based on algorithm weights
 */
const calculateBolaoScore = (bolao: EnrichedBolao, maxPrize: number, maxParticipants: number): number => {
  const weights = algorithmConfig.weights;
  const now = new Date();
  
  // Normalize prize (0-1 scale)
  const prizeScore = bolao.prizeEstimate / maxPrize;
  
  // Calculate odds score (simplified - in production would use actual probability)
  // Higher available slots = better odds for individual win
  const oddsScore = bolao.availableSlots / 100;
  
  // Calculate closing urgency (closer to closing = higher score)
  const closingDate = new Date(bolao.closingDate);
  const daysUntilClosing = Math.max(0, (closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const closingScore = daysUntilClosing <= 7 ? (7 - daysUntilClosing) / 7 : 0;
  
  // Social proof score (more participants = more popular)
  const participantScore = bolao.participantCount / maxParticipants;
  
  // Freshness score (newer bolões get higher score)
  const createdDate = new Date(bolao.createdAt);
  const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  const freshnessScore = daysSinceCreation <= 14 ? (14 - daysSinceCreation) / 14 : 0;
  
  // Calculate weighted total score
  const totalScore = 
    (prizeScore * weights.prize) +
    (oddsScore * weights.odds) +
    (closingScore * weights.closing) +
    (participantScore * weights.participants) +
    (freshnessScore * weights.freshness);
  
  return totalScore;
};

/**
 * Get subscriber's distribution history
 */
const getSubscriberHistory = (subscriberId: string): SubscriberDistributionHistory => {
  if (!subscriberHistory.has(subscriberId)) {
    subscriberHistory.set(subscriberId, {
      subscriberId,
      receivedBolaoIds: [],
      rotationIndex: 0,
    });
  }
  return subscriberHistory.get(subscriberId)!;
};

/**
 * Update subscriber's distribution history
 */
const updateSubscriberHistory = (
  subscriberId: string, 
  bolaoIds: string[], 
  includedPremium: boolean
): void => {
  const history = getSubscriberHistory(subscriberId);
  history.receivedBolaoIds.push(...bolaoIds);
  // Keep only last 20 bolão IDs to prevent memory issues
  if (history.receivedBolaoIds.length > 20) {
    history.receivedBolaoIds = history.receivedBolaoIds.slice(-20);
  }
  if (includedPremium) {
    history.lastPremiumBolaoDate = new Date().toISOString();
  }
  history.rotationIndex++;
  subscriberHistory.set(subscriberId, history);
};

/**
 * Check if a bolão was already distributed to subscriber recently
 */
const wasBolaoRecentlyDistributed = (subscriberId: string, bolaoId: string): boolean => {
  const history = getSubscriberHistory(subscriberId);
  return history.receivedBolaoIds.includes(bolaoId);
};

/**
 * Determine if subscriber should get premium bolão (fairness rotation)
 */
const shouldGetPremiumBolao = (subscriberId: string, totalOuroSubscribers: number): boolean => {
  if (!algorithmConfig.enableFairnessRotation) return true;
  
  const history = getSubscriberHistory(subscriberId);
  
  // Check if subscriber recently received premium
  if (history.lastPremiumBolaoDate) {
    const daysSinceLastPremium = (Date.now() - new Date(history.lastPremiumBolaoDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastPremium < 7) return false; // Already got premium this week
  }
  
  // Rotation based on index - ensures fair distribution
  return (history.rotationIndex % Math.ceil(totalOuroSubscribers / 10)) === 0;
};

/**
 * Smart bolão selection algorithm
 * Selects optimal bolões for a subscriber based on plan and various criteria
 */
export const selectBoloesForDistribution = async (
  subscriber: Subscriber,
  availableBoloes: EnrichedBolao[],
  totalSubscribersInPlan: number
): Promise<EnrichedBolao[]> => {
  const plan = subscriber.plan;
  const allocation = PLAN_ALLOCATIONS[plan];
  const selectedBoloes: EnrichedBolao[] = [];
  
  // Calculate max values for normalization
  const maxPrize = Math.max(...availableBoloes.map(b => b.prizeEstimate));
  const maxParticipants = Math.max(...availableBoloes.map(b => b.participantCount));
  
  // Score all bolões
  const scoredBoloes = availableBoloes.map(bolao => ({
    ...bolao,
    score: calculateBolaoScore(bolao, maxPrize, maxParticipants),
  }));
  
  // Filter based on plan rules
  let eligibleBoloes = scoredBoloes.filter(bolao => {
    // Check value limits
    if (bolao.value < allocation.minValue || bolao.value > allocation.maxValue) {
      return false;
    }
    
    // Check if exclusive bolão is reserved for Ouro
    if (algorithmConfig.reserveSpecialForOuro && bolao.isExclusive && plan !== "Ouro") {
      return false;
    }
    
    // Check if already distributed to this subscriber recently
    if (wasBolaoRecentlyDistributed(subscriber.id, bolao.id)) {
      return false;
    }
    
    // Respect user preferences if enabled and preferences exist
    if (algorithmConfig.respectUserPreferences && subscriber.preferences) {
      const prefs = subscriber.preferences;
      
      // Check preferred lotteries
      if (prefs.preferredLotteries.length > 0 && !prefs.preferredLotteries.includes(bolao.lotteryType)) {
        return false;
      }
      
      // Check max value preference
      if (prefs.maxValuePerBolao && bolao.value > prefs.maxValuePerBolao) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort by score (descending)
  eligibleBoloes.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Select bolões per lottery type according to plan allocation
  for (const [lotteryType, requiredCount] of Object.entries(allocation.lotteryDistribution)) {
    if (!requiredCount || requiredCount <= 0) continue;
    
    // Get eligible bolões of this lottery type
    const lotteryBoloes = eligibleBoloes.filter(b => b.lotteryType === lotteryType);
    
    // For Ouro plan with special games enabled, check premium rotation
    let selectedForLottery: EnrichedBolao[] = [];
    
    if (plan === "Ouro" && algorithmConfig.reserveSpecialForOuro) {
      // Check if should include premium bolão
      const shouldGetPremium = shouldGetPremiumBolao(subscriber.id, totalSubscribersInPlan);
      
      if (shouldGetPremium) {
        // Prioritize special/exclusive bolões
        const premiumBoloes = lotteryBoloes.filter(b => b.isSpecial || b.isExclusive);
        const regularBoloes = lotteryBoloes.filter(b => !b.isSpecial && !b.isExclusive);
        
        selectedForLottery = [
          ...premiumBoloes.slice(0, 1),
          ...regularBoloes.slice(0, requiredCount - 1),
        ].slice(0, requiredCount);
      } else {
        // Only regular bolões
        selectedForLottery = lotteryBoloes
          .filter(b => !b.isSpecial && !b.isExclusive)
          .slice(0, requiredCount);
      }
    } else {
      // Non-Ouro plans or no special reservation
      selectedForLottery = lotteryBoloes
        .filter(b => !b.isExclusive)
        .slice(0, requiredCount);
    }
    
    selectedBoloes.push(...selectedForLottery);
    
    // Remove selected from eligible pool to avoid duplicates across lottery types
    const selectedIds = new Set(selectedForLottery.map(b => b.id));
    eligibleBoloes = eligibleBoloes.filter(b => !selectedIds.has(b.id));
  }
  
  // Update subscriber history
  const includedPremium = selectedBoloes.some(b => b.isSpecial || b.isExclusive);
  updateSubscriberHistory(subscriber.id, selectedBoloes.map(b => b.id), includedPremium);
  
  console.log(
    `[VIP Automation] Selected ${selectedBoloes.length} bolões for ${subscriber.name} (${plan}):`,
    selectedBoloes.map(b => `${b.name} (score: ${b.score?.toFixed(3)})`)
  );
  
  return selectedBoloes;
};

/**
 * Calculate which bolões to assign based on plan
 */
export const calculateBolaoAllocation = async (plan: PlanType): Promise<Bolao[]> => {
  const allocation = PLAN_ALLOCATIONS[plan];
  const selectedBoloes: Bolao[] = [];

  for (const [lottery, count] of Object.entries(allocation.lotteryDistribution)) {
    if (count && count > 0) {
      const availableBoloes = await getAvailableBoloesForDistribution(
        lottery as LotteryType,
        allocation.minValue,
        allocation.maxValue
      );

      // Select the best bolões (by prize estimate)
      const sortedBoloes = availableBoloes.sort((a, b) => b.prizeEstimate - a.prizeEstimate);
      selectedBoloes.push(...sortedBoloes.slice(0, count));
    }
  }

  return selectedBoloes;
};

/**
 * Calculate smart allocation using the selection algorithm
 */
export const calculateSmartBolaoAllocation = async (
  subscriber: Subscriber,
  totalSubscribersInPlan: number
): Promise<EnrichedBolao[]> => {
  const availableBoloes = await getAllAvailableBoloesEnriched();
  return selectBoloesForDistribution(subscriber, availableBoloes, totalSubscribersInPlan);
};

/**
 * Reset subscriber history (useful for testing)
 */
export const resetSubscriberHistory = (subscriberId?: string): void => {
  if (subscriberId) {
    subscriberHistory.delete(subscriberId);
  } else {
    subscriberHistory.clear();
  }
  console.log(`[VIP Automation] Subscriber history reset${subscriberId ? ` for ${subscriberId}` : ''}`);
};

/**
 * Assign bolões to a subscriber's account
 */
export const assignBoloesToSubscriber = async (
  subscriber: Subscriber,
  boloes: Bolao[],
  dryRun: boolean = false
): Promise<DistributionResult> => {
  try {
    if (dryRun) {
      console.log(`[DRY RUN] Would assign ${boloes.length} bolões to ${subscriber.name}`);
      return {
        success: true,
        subscriberId: subscriber.id,
        boloesAssigned: boloes,
      };
    }

    // In production, this would make API calls to:
    // 1. Create participation records
    // 2. Update user's bolão list
    // 3. Deduct from available slots
    console.log(`[VIP Automation] Assigning ${boloes.length} bolões to ${subscriber.name}`);

    // Simulate occasional failure for testing (10% chance)
    if (Math.random() < 0.1) {
      throw new Error("Simulated network error");
    }

    return {
      success: true,
      subscriberId: subscriber.id,
      boloesAssigned: boloes,
    };
  } catch (error) {
    return {
      success: false,
      subscriberId: subscriber.id,
      boloesAssigned: [],
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Send distribution notification to subscriber
 */
export const sendDistributionNotification = async (
  subscriber: Subscriber,
  boloes: Bolao[],
  dryRun: boolean = false
): Promise<boolean> => {
  if (dryRun) {
    console.log(`[DRY RUN] Would send notification to ${subscriber.email}`);
    return true;
  }

  // In production, this would send an email/push notification
  const bolaoNames = boloes.map(b => b.name).join(", ");
  console.log(
    `[VIP Automation] Notification sent to ${subscriber.email}: ` +
    `"Você recebeu ${boloes.length} novo(s) bolão(ões): ${bolaoNames}"`
  );

  return true;
};

/**
 * Log distribution history
 */
export const logDistributionHistory = (record: DistributionRecord): void => {
  distributionHistory.unshift(record);
  // Keep only last 100 records
  if (distributionHistory.length > 100) {
    distributionHistory = distributionHistory.slice(0, 100);
  }
  console.log(`[VIP Automation] Distribution logged:`, {
    id: record.id,
    plan: record.plan,
    subscribers: record.subscribersProcessed,
    boloes: record.boloesDistributed,
    status: record.status,
  });
};

/**
 * Get distribution history
 */
export const getDistributionHistory = (limit: number = 10): DistributionRecord[] => {
  return distributionHistory.slice(0, limit);
};

/**
 * Get skipped/excluded subscribers for a specific distribution record
 */
export const getExcludedSubscribersForDistribution = (recordId: string): SkippedSubscriber[] | null => {
  const record = distributionHistory.find(r => r.id === recordId);
  if (!record) return null;
  return record.skippedSubscribers || [];
};

/**
 * Generate exclusion report for a distribution
 * Returns a formatted report of why subscribers were excluded
 */
export const generateExclusionReport = (recordId: string): {
  distributionId: string;
  planType: PlanType | null;
  timestamp: Date | null;
  totalSubscribers: number;
  eligibleSubscribers: number;
  excludedSubscribers: number;
  exclusionReasons: {
    reason: string;
    count: number;
    subscribers: Array<{ id: string; name: string; email: string }>;
  }[];
} | null => {
  const record = distributionHistory.find(r => r.id === recordId);
  if (!record) return null;

  const skipped = record.skippedSubscribers || [];
  
  // Group by reason
  const reasonGroups = new Map<string, Array<{ id: string; name: string; email: string }>>();
  
  for (const sub of skipped) {
    const existing = reasonGroups.get(sub.reason) || [];
    existing.push({ id: sub.id, name: sub.name, email: sub.email });
    reasonGroups.set(sub.reason, existing);
  }

  const exclusionReasons = Array.from(reasonGroups.entries()).map(([reason, subscribers]) => ({
    reason,
    count: subscribers.length,
    subscribers,
  }));

  // Sort by count descending
  exclusionReasons.sort((a, b) => b.count - a.count);

  return {
    distributionId: record.id,
    planType: record.plan,
    timestamp: record.timestamp,
    totalSubscribers: record.totalSubscribers || 0,
    eligibleSubscribers: record.eligibleSubscribers || 0,
    excludedSubscribers: skipped.length,
    exclusionReasons,
  };
};

/**
 * Get summary of all exclusion reasons across recent distributions
 */
export const getExclusionSummary = (daysBack: number = 30): {
  totalExcluded: number;
  reasonBreakdown: { reason: string; count: number; percentage: number }[];
  byPlan: Record<PlanType, number>;
} => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const recentRecords = distributionHistory.filter(
    r => r.timestamp >= cutoffDate && !r.dryRun
  );

  const allSkipped: SkippedSubscriber[] = [];
  const byPlan: Record<PlanType, number> = { Bronze: 0, Prata: 0, Ouro: 0 };

  for (const record of recentRecords) {
    const skipped = record.skippedSubscribers || [];
    allSkipped.push(...skipped);
    byPlan[record.plan] += skipped.length;
  }

  // Group by reason
  const reasonCounts = new Map<string, number>();
  for (const sub of allSkipped) {
    const count = reasonCounts.get(sub.reason) || 0;
    reasonCounts.set(sub.reason, count + 1);
  }

  const totalExcluded = allSkipped.length;
  const reasonBreakdown = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: totalExcluded > 0 ? (count / totalExcluded) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalExcluded,
    reasonBreakdown,
    byPlan,
  };
};

/**
 * Execute distribution for a specific plan
 * Double-checks subscriber eligibility before assigning bolões
 */
export const executeDistributionForPlan = async (
  planType: PlanType,
  dryRun: boolean = false
): Promise<DistributionRecord> => {
  const recordId = `dist_${Date.now()}_${planType}`;
  const errors: DistributionError[] = [];
  let boloesDistributed = 0;
  let subscribersSkipped = 0;

  console.log(`[VIP Automation] Starting ${dryRun ? "DRY RUN " : ""}distribution for ${planType} plan`);

  try {
    // Get validation results with detailed eligibility info
    const validation = await validateSubscribersForDistribution(planType);
    const subscribers = validation.eligibleSubscribers;
    
    // Log comprehensive validation summary
    console.log(`[VIP Automation] ----------------------------------------`);
    console.log(`[VIP Automation] Subscriber Eligibility Check for ${planType}:`);
    console.log(`[VIP Automation]   Total subscribers: ${validation.totalSubscribers}`);
    console.log(`[VIP Automation]   Active only: ${validation.activeOnly}`);
    console.log(`[VIP Automation]   Skipped (inactive): ${validation.skippedInactive}`);
    console.log(`[VIP Automation] ----------------------------------------`);

    if (subscribers.length === 0) {
      console.log(`[VIP Automation] No eligible subscribers found for ${planType} plan`);
      const record: DistributionRecord = {
        id: recordId,
        timestamp: new Date(),
        plan: planType,
        subscribersProcessed: 0,
        boloesDistributed: 0,
        status: "success",
        errors: [],
        dryRun,
        // Include validation info
        totalSubscribers: validation.totalSubscribers,
        eligibleSubscribers: validation.activeOnly,
        skippedSubscribers: validation.skippedSubscribers,
      };
      logDistributionHistory(record);
      return record;
    }

    // Calculate bolões allocation for this plan
    const boloes = await calculateBolaoAllocation(planType);
    console.log(`[VIP Automation] Selected ${boloes.length} bolões for distribution`);

    // Process each subscriber with double-check validation
    for (const subscriber of subscribers) {
      // Double-check eligibility right before assigning (status could have changed)
      const eligibilityCheck = checkSubscriberEligibility(subscriber);
      
      if (eligibilityCheck !== true) {
        // Subscriber became ineligible between validation and assignment
        console.log(`[VIP Automation] Subscriber ${subscriber.name} (${subscriber.id}) failed re-check: ${eligibilityCheck}`);
        subscribersSkipped++;
        errors.push({
          subscriberId: subscriber.id,
          subscriberName: subscriber.name,
          errorMessage: `Re-verificação falhou: ${eligibilityCheck}`,
          timestamp: new Date(),
        });
        continue;
      }

      const result = await assignBoloesToSubscriber(subscriber, boloes, dryRun);

      if (result.success) {
        boloesDistributed += result.boloesAssigned.length;
        await sendDistributionNotification(subscriber, result.boloesAssigned, dryRun);
      } else {
        errors.push({
          subscriberId: subscriber.id,
          subscriberName: subscriber.name,
          errorMessage: result.errorMessage || "Unknown error",
          timestamp: new Date(),
        });
      }
    }

    // Log final distribution stats with eligibility summary
    console.log(`[VIP Automation] ----------------------------------------`);
    console.log(`[VIP Automation] Distribution Complete for ${planType}:`);
    console.log(`[VIP Automation]   Elegíveis para distribuição: ${validation.activeOnly} de ${validation.totalSubscribers} total`);
    console.log(`[VIP Automation]   Processed: ${subscribers.length - subscribersSkipped}`);
    console.log(`[VIP Automation]   Skipped during distribution: ${subscribersSkipped}`);
    console.log(`[VIP Automation]   Bolões distributed: ${boloesDistributed}`);
    console.log(`[VIP Automation]   Errors: ${errors.length}`);
    console.log(`[VIP Automation] ----------------------------------------`);

    const status: DistributionStatus = 
      errors.length === 0 ? "success" :
      errors.length < subscribers.length ? "partial" : "error";

    const record: DistributionRecord = {
      id: recordId,
      timestamp: new Date(),
      plan: planType,
      subscribersProcessed: subscribers.length - subscribersSkipped,
      boloesDistributed,
      status,
      errors,
      dryRun,
      // Include validation info for admin review
      totalSubscribers: validation.totalSubscribers,
      eligibleSubscribers: validation.activeOnly,
      skippedSubscribers: validation.skippedSubscribers,
    };

    logDistributionHistory(record);
    return record;

  } catch (error) {
    const record: DistributionRecord = {
      id: recordId,
      timestamp: new Date(),
      plan: planType,
      subscribersProcessed: 0,
      boloesDistributed: 0,
      status: "error",
      errors: [{
        subscriberId: "system",
        subscriberName: "System",
        errorMessage: error instanceof Error ? error.message : "Unknown system error",
        timestamp: new Date(),
      }],
      dryRun,
    };
    logDistributionHistory(record);
    return record;
  }
};

/**
 * Main distribution execution function
 * Processes all plans in order: Ouro -> Prata -> Bronze
 * Includes comprehensive validation logging
 */
export const executeDistribution = async (
  dryRun: boolean = false
): Promise<{
  success: boolean;
  records: DistributionRecord[];
  summary: {
    totalSubscribers: number;
    totalBoloes: number;
    totalErrors: number;
  };
  validationSummary: {
    totalAll: number;
    totalActive: number;
    totalSkipped: number;
  };
}> => {
  console.log(`[VIP Automation] ========================================`);
  console.log(`[VIP Automation] Starting ${dryRun ? "DRY RUN " : ""}weekly distribution`);
  console.log(`[VIP Automation] Timestamp: ${new Date().toISOString()}`);
  console.log(`[VIP Automation] ========================================`);

  // Get comprehensive validation for all plans before distribution
  const allValidation = await getAllSubscribersValidation();
  
  console.log(`[VIP Automation] ========================================`);
  console.log(`[VIP Automation] PRE-DISTRIBUTION VALIDATION SUMMARY`);
  console.log(`[VIP Automation] ========================================`);
  console.log(`[VIP Automation] Total subscribers: ${allValidation.totals.totalSubscribers}`);
  console.log(`[VIP Automation] Active only: ${allValidation.totals.totalActive}`);
  console.log(`[VIP Automation] Skipped (inactive): ${allValidation.totals.totalSkipped}`);
  console.log(`[VIP Automation] ----------------------------------------`);
  console.log(`[VIP Automation] By Plan:`);
  console.log(`[VIP Automation]   Ouro: ${allValidation.Ouro.activeOnly}/${allValidation.Ouro.totalSubscribers} eligible`);
  console.log(`[VIP Automation]   Prata: ${allValidation.Prata.activeOnly}/${allValidation.Prata.totalSubscribers} eligible`);
  console.log(`[VIP Automation]   Bronze: ${allValidation.Bronze.activeOnly}/${allValidation.Bronze.totalSubscribers} eligible`);
  console.log(`[VIP Automation] ========================================`);

  const records: DistributionRecord[] = [];
  const planOrder: PlanType[] = ["Ouro", "Prata", "Bronze"]; // Priority order

  for (const plan of planOrder) {
    console.log(`\n[VIP Automation] Processing ${plan} plan...`);
    const record = await executeDistributionForPlan(plan, dryRun);
    records.push(record);

    // Small delay between plans to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const summary = {
    totalSubscribers: records.reduce((sum, r) => sum + r.subscribersProcessed, 0),
    totalBoloes: records.reduce((sum, r) => sum + r.boloesDistributed, 0),
    totalErrors: records.reduce((sum, r) => sum + r.errors.length, 0),
  };

  const validationSummary = {
    totalAll: allValidation.totals.totalSubscribers,
    totalActive: allValidation.totals.totalActive,
    totalSkipped: allValidation.totals.totalSkipped,
  };

  const success = summary.totalErrors === 0;

  console.log(`\n[VIP Automation] ========================================`);
  console.log(`[VIP Automation] Distribution ${dryRun ? "(DRY RUN) " : ""}completed`);
  console.log(`[VIP Automation] ----------------------------------------`);
  console.log(`[VIP Automation] VALIDATION SUMMARY:`);
  console.log(`[VIP Automation]   Total subscribers: ${validationSummary.totalAll}`);
  console.log(`[VIP Automation]   Active only: ${validationSummary.totalActive}`);
  console.log(`[VIP Automation]   Skipped (inactive): ${validationSummary.totalSkipped}`);
  console.log(`[VIP Automation] ----------------------------------------`);
  console.log(`[VIP Automation] DISTRIBUTION RESULTS:`);
  console.log(`[VIP Automation]   Subscribers processed: ${summary.totalSubscribers}`);
  console.log(`[VIP Automation]   Bolões distributed: ${summary.totalBoloes}`);
  console.log(`[VIP Automation]   Errors: ${summary.totalErrors}`);
  console.log(`[VIP Automation] ----------------------------------------`);
  console.log(`[VIP Automation] Status: ${success ? "SUCCESS" : "COMPLETED WITH ERRORS"}`);
  console.log(`[VIP Automation] ========================================\n`);

  return { success, records, summary, validationSummary };
};

/**
 * Check if distribution should run based on schedule
 */
export const shouldRunDistribution = (): boolean => {
  if (!scheduleConfig.enabled) {
    return false;
  }

  const now = new Date();
  return (
    now.getDay() === scheduleConfig.dayOfWeek &&
    now.getHours() === scheduleConfig.hour &&
    now.getMinutes() === scheduleConfig.minute
  );
};

/**
 * Get next scheduled distribution date
 */
export const getNextDistributionDate = (): Date => {
  const now = new Date();
  const daysUntilTarget = (scheduleConfig.dayOfWeek - now.getDay() + 7) % 7 || 7;
  
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntilTarget);
  nextDate.setHours(scheduleConfig.hour, scheduleConfig.minute, 0, 0);
  
  // If the time has already passed today and it's the target day, move to next week
  if (now.getDay() === scheduleConfig.dayOfWeek && now > nextDate) {
    nextDate.setDate(nextDate.getDate() + 7);
  }
  
  return nextDate;
};

/**
 * Get plan allocation configuration
 */
export const getPlanAllocation = (plan: PlanType): PlanAllocation => {
  return { ...PLAN_ALLOCATIONS[plan] };
};

/**
 * Get all plan allocations
 */
export const getAllPlanAllocations = (): Record<PlanType, PlanAllocation> => {
  return { ...PLAN_ALLOCATIONS };
};

/**
 * Retry failed distributions for specific subscribers
 */
export const retryFailedDistributions = async (
  recordId: string,
  dryRun: boolean = false
): Promise<{
  success: boolean;
  retriedCount: number;
  stillFailing: DistributionError[];
}> => {
  const record = distributionHistory.find(r => r.id === recordId);
  
  if (!record || record.errors.length === 0) {
    return {
      success: true,
      retriedCount: 0,
      stillFailing: [],
    };
  }

  console.log(`[VIP Automation] Retrying ${record.errors.length} failed distributions from ${record.id}`);
  
  const boloes = await calculateBolaoAllocation(record.plan);
  const stillFailing: DistributionError[] = [];
  let retriedCount = 0;

  for (const error of record.errors) {
    const subscribers = await getSubscribersByPlan(record.plan);
    const subscriber = subscribers.find(s => s.id === error.subscriberId);
    
    if (subscriber) {
      const result = await assignBoloesToSubscriber(subscriber, boloes, dryRun);
      
      if (result.success) {
        retriedCount++;
        await sendDistributionNotification(subscriber, result.boloesAssigned, dryRun);
      } else {
        stillFailing.push({
          ...error,
          errorMessage: result.errorMessage || "Retry failed",
          timestamp: new Date(),
        });
      }
    }
  }

  return {
    success: stillFailing.length === 0,
    retriedCount,
    stillFailing,
  };
};

/**
 * Get distribution statistics
 */
export const getDistributionStats = (): {
  totalDistributions: number;
  successRate: number;
  lastDistributionDate: Date | null;
  totalSubscribersServed: number;
  totalBoloesDistributed: number;
} => {
  const successfulDistributions = distributionHistory.filter(
    r => r.status === "success" && !r.dryRun
  ).length;
  
  const nonDryRunHistory = distributionHistory.filter(r => !r.dryRun);
  
  return {
    totalDistributions: nonDryRunHistory.length,
    successRate: nonDryRunHistory.length > 0 
      ? (successfulDistributions / nonDryRunHistory.length) * 100 
      : 100,
    lastDistributionDate: nonDryRunHistory.length > 0 
      ? nonDryRunHistory[0].timestamp 
      : null,
    totalSubscribersServed: nonDryRunHistory.reduce((sum, r) => sum + r.subscribersProcessed, 0),
    totalBoloesDistributed: nonDryRunHistory.reduce((sum, r) => sum + r.boloesDistributed, 0),
  };
};

export default {
  scheduleWeeklyDistribution,
  getScheduleConfig,
  executeDistribution,
  executeDistributionForPlan,
  getSubscribersByPlan,
  getAllSubscribersByPlan,
  getAllActiveSubscribers,
  validateSubscribersForDistribution,
  getAllSubscribersValidation,
  checkSubscriberEligibility,
  calculateBolaoAllocation,
  assignBoloesToSubscriber,
  sendDistributionNotification,
  logDistributionHistory,
  getDistributionHistory,
  shouldRunDistribution,
  getNextDistributionDate,
  getPlanAllocation,
  getAllPlanAllocations,
  retryFailedDistributions,
  getDistributionStats,
  getExcludedSubscribersForDistribution,
  generateExclusionReport,
  getExclusionSummary,
  // Payment validation functions
  validatePaymentStatus,
  runPreDistributionPaymentValidation,
  retryPayment,
  sendPaymentReminderNotification,
  generatePaymentProblemsReport,
  processAutomaticPaymentActions,
};
