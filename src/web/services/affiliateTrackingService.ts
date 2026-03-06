/**
 * Affiliate Tracking Service
 * 
 * Tracks clicks and conversions for TheLotter affiliate program.
 * Data is stored locally for analytics purposes.
 */

// ===== Interfaces =====

export interface AffiliateClick {
  id: string;
  userId: string | null;
  lottery: string;
  timestamp: Date;
  referrer: string;
  converted: boolean;
  conversionValue: number | null;
  affiliateUrl: string;
}

export interface AffiliateAnalytics {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  byLottery: Record<string, {
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  dailyClicks: { date: string; clicks: number }[];
}

export interface ConversionEvent {
  clickId: string;
  value: number;
  currency: string;
  timestamp: Date;
}

// ===== Constants =====

const STORAGE_KEY = 'affiliate_clicks';
const MAX_STORED_CLICKS = 1000;
const CLICK_DEDUP_HOURS = 24;
const RETENTION_DAYS = 90;

// ===== Helper Functions =====

const generateClickId = (): string => {
  return `click_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const getStoredClicks = (): AffiliateClick[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const clicks = JSON.parse(stored) as AffiliateClick[];
    // Convert timestamp strings back to Date objects
    return clicks.map(c => ({
      ...c,
      timestamp: new Date(c.timestamp)
    }));
  } catch {
    return [];
  }
};

const saveClicks = (clicks: AffiliateClick[]): void => {
  try {
    // Keep only the most recent clicks up to MAX_STORED_CLICKS
    const trimmed = clicks.slice(-MAX_STORED_CLICKS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save affiliate clicks:', error);
  }
};

/**
 * Check if user has clicked on this lottery within dedup window
 */
const isDuplicateClick = (userId: string | null, lottery: string): boolean => {
  if (!userId) return false;
  
  const clicks = getStoredClicks();
  const dedupWindow = new Date(Date.now() - CLICK_DEDUP_HOURS * 60 * 60 * 1000);
  
  return clicks.some(
    click => 
      click.userId === userId && 
      click.lottery === lottery && 
      click.timestamp > dedupWindow
  );
};

// ===== Main Functions =====

/**
 * Track a click on an affiliate link
 * Returns the tracked URL with click ID appended
 */
export const trackClick = (
  lottery: string, 
  userId: string | null, 
  baseAffiliateUrl: string
): { clickId: string; trackedUrl: string } => {
  // Check for duplicate clicks
  if (isDuplicateClick(userId, lottery)) {
    // Return URL without creating new click record
    return {
      clickId: '',
      trackedUrl: baseAffiliateUrl
    };
  }
  
  const clickId = generateClickId();
  const click: AffiliateClick = {
    id: clickId,
    userId,
    lottery,
    timestamp: new Date(),
    referrer: typeof window !== 'undefined' ? window.location.href : '',
    converted: false,
    conversionValue: null,
    affiliateUrl: baseAffiliateUrl
  };
  
  // Save click
  const clicks = getStoredClicks();
  clicks.push(click);
  saveClicks(clicks);
  
  // Append click ID to URL for tracking
  const separator = baseAffiliateUrl.includes('?') ? '&' : '?';
  const trackedUrl = `${baseAffiliateUrl}${separator}subid=${clickId}`;
  
  // TODO: In production, send this to backend API
  // await fetch('/api/affiliate/track-click', { method: 'POST', body: JSON.stringify(click) });
  
  return { clickId, trackedUrl };
};

/**
 * Track a conversion (when TheLotter webhook fires)
 */
export const trackConversion = (clickId: string, value: number): boolean => {
  const clicks = getStoredClicks();
  const clickIndex = clicks.findIndex(c => c.id === clickId);
  
  if (clickIndex === -1) return false;
  
  clicks[clickIndex] = {
    ...clicks[clickIndex],
    converted: true,
    conversionValue: value
  };
  
  saveClicks(clicks);
  
  // TODO: In production, sync with backend
  // await fetch('/api/affiliate/track-conversion', { method: 'POST', body: JSON.stringify({ clickId, value }) });
  
  return true;
};

/**
 * Get affiliate analytics for a date range
 */
export const getAffiliateAnalytics = (
  startDate?: Date, 
  endDate?: Date
): AffiliateAnalytics => {
  const clicks = getStoredClicks();
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
  const end = endDate || new Date();
  
  // Filter clicks within date range
  const filteredClicks = clicks.filter(
    c => c.timestamp >= start && c.timestamp <= end
  );
  
  // Calculate stats by lottery
  const byLottery: Record<string, { clicks: number; conversions: number; revenue: number }> = {};
  
  filteredClicks.forEach(click => {
    if (!byLottery[click.lottery]) {
      byLottery[click.lottery] = { clicks: 0, conversions: 0, revenue: 0 };
    }
    byLottery[click.lottery].clicks++;
    if (click.converted) {
      byLottery[click.lottery].conversions++;
      byLottery[click.lottery].revenue += click.conversionValue || 0;
    }
  });
  
  // Calculate daily clicks for chart
  const dailyClicksMap: Record<string, number> = {};
  filteredClicks.forEach(click => {
    const dateKey = click.timestamp.toISOString().split('T')[0];
    dailyClicksMap[dateKey] = (dailyClicksMap[dateKey] || 0) + 1;
  });
  
  const dailyClicks = Object.entries(dailyClicksMap)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Calculate totals
  const totalClicks = filteredClicks.length;
  const totalConversions = filteredClicks.filter(c => c.converted).length;
  const totalRevenue = filteredClicks.reduce((sum, c) => sum + (c.conversionValue || 0), 0);
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  
  return {
    totalClicks,
    totalConversions,
    conversionRate,
    totalRevenue,
    byLottery,
    dailyClicks
  };
};

/**
 * Get recent clicks for display
 */
export const getRecentClicks = (limit = 10): AffiliateClick[] => {
  const clicks = getStoredClicks();
  return clicks.slice(-limit).reverse();
};

/**
 * Get recent conversions
 */
export const getRecentConversions = (limit = 5): AffiliateClick[] => {
  const clicks = getStoredClicks();
  return clicks
    .filter(c => c.converted)
    .slice(-limit)
    .reverse();
};

/**
 * Generate a CSV export of affiliate data
 */
export const generateAffiliateReport = (
  startDate: Date, 
  endDate: Date
): string => {
  const clicks = getStoredClicks().filter(
    c => c.timestamp >= startDate && c.timestamp <= endDate
  );
  
  const headers = ['ID', 'Lottery', 'User ID', 'Timestamp', 'Converted', 'Conversion Value', 'Referrer'];
  const rows = clicks.map(c => [
    c.id,
    c.lottery,
    c.userId || 'anonymous',
    c.timestamp.toISOString(),
    c.converted ? 'Yes' : 'No',
    c.conversionValue?.toString() || '',
    c.referrer
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Clean up old clicks (older than retention period)
 */
export const cleanOldClicks = (): number => {
  const clicks = getStoredClicks();
  const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  
  const freshClicks = clicks.filter(c => c.timestamp >= cutoffDate);
  const removedCount = clicks.length - freshClicks.length;
  
  if (removedCount > 0) {
    saveClicks(freshClicks);
  }
  
  return removedCount;
};

/**
 * Get this month's stats for dashboard widget
 */
export const getThisMonthStats = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const thisMonth = getAffiliateAnalytics(startOfMonth, now);
  const lastMonth = getAffiliateAnalytics(startOfLastMonth, endOfLastMonth);
  
  // Calculate growth percentages
  const clicksGrowth = lastMonth.totalClicks > 0 
    ? ((thisMonth.totalClicks - lastMonth.totalClicks) / lastMonth.totalClicks) * 100 
    : 100;
  const conversionsGrowth = lastMonth.totalConversions > 0 
    ? ((thisMonth.totalConversions - lastMonth.totalConversions) / lastMonth.totalConversions) * 100 
    : 100;
  
  return {
    thisMonth,
    lastMonth,
    clicksGrowth: Math.round(clicksGrowth),
    conversionsGrowth: Math.round(conversionsGrowth)
  };
};

// Initialize cleanup on load (remove old clicks)
if (typeof window !== 'undefined') {
  cleanOldClicks();
}
