import { useState, useEffect } from "react";
import { Clock, AlertTriangle, RefreshCw } from "lucide-react";

interface CountdownTimerProps {
  endDate: Date | string;
  className?: string;
  compact?: boolean;
  bolaoId?: string;
  wasRecentlyUpdated?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeRemaining = (endDate: Date | string): TimeRemaining => {
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const now = new Date();
  const total = end.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);

  return { days, hours, minutes, seconds, total };
};

const getUrgencyLevel = (totalMs: number): "safe" | "warning" | "urgent" | "critical" | "expired" => {
  const hours = totalMs / (1000 * 60 * 60);
  if (totalMs <= 0) return "expired";
  if (hours < 1) return "critical";
  if (hours < 6) return "urgent";
  if (hours < 12) return "warning";
  if (hours < 24) return "warning";
  return "safe";
};

const urgencyStyles = {
  safe: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: "text-emerald-400",
    pulse: false,
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: "text-amber-400",
    pulse: false,
  },
  urgent: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    icon: "text-orange-400",
    pulse: false,
  },
  critical: {
    bg: "bg-red-500/15",
    border: "border-red-500/40",
    text: "text-red-400",
    icon: "text-red-400",
    pulse: true,
  },
  expired: {
    bg: "bg-red-500/20",
    border: "border-red-500/50",
    text: "text-red-500",
    icon: "text-red-500",
    pulse: false,
  },
};

export const CountdownTimer = ({ 
  endDate, 
  className = "", 
  compact = false,
  bolaoId,
  wasRecentlyUpdated = false,
}: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => calculateTimeRemaining(endDate));
  const [mounted, setMounted] = useState(false);
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);

  // Handle update animation
  useEffect(() => {
    if (wasRecentlyUpdated) {
      setShowUpdateAnimation(true);
      const timer = setTimeout(() => {
        setShowUpdateAnimation(false);
      }, 3000); // Animation lasts 3 seconds
      return () => clearTimeout(timer);
    }
  }, [wasRecentlyUpdated, endDate]);

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const urgency = getUrgencyLevel(timeRemaining.total);
  const styles = urgencyStyles[urgency];

  // Format display based on time remaining
  const formatDisplay = () => {
    if (!mounted) {
      return <span className="opacity-50">Carregando...</span>;
    }

    if (urgency === "expired") {
      return (
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Encerrado
        </span>
      );
    }

    const { days, hours, minutes, seconds } = timeRemaining;

    if (days > 0) {
      return (
        <span className="font-mono tracking-tight">
          <TimeUnit value={days} unit="d" />
          <Separator />
          <TimeUnit value={hours} unit="h" />
          <Separator />
          <TimeUnit value={minutes} unit="m" />
          {!compact && (
            <>
              <Separator />
              <TimeUnit value={seconds} unit="s" />
            </>
          )}
        </span>
      );
    }

    return (
      <span className="font-mono tracking-tight">
        <TimeUnit value={hours} unit="h" />
        <Separator />
        <TimeUnit value={minutes} unit="m" />
        <Separator />
        <TimeUnit value={seconds} unit="s" />
      </span>
    );
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
        ${styles.bg} ${styles.border} ${styles.text}
        border transition-all duration-300
        ${styles.pulse ? "animate-pulse" : ""}
        ${showUpdateAnimation ? "ring-2 ring-bolao-green ring-offset-1 ring-offset-transparent animate-bounce" : ""}
        ${className}
      `}
    >
      {showUpdateAnimation ? (
        <RefreshCw className={`w-3 h-3 text-bolao-green animate-spin flex-shrink-0`} />
      ) : (
        <Clock className={`w-3 h-3 ${styles.icon} flex-shrink-0`} />
      )}
      {formatDisplay()}
    </div>
  );
};

// Helper component for time units with animated transitions
const TimeUnit = ({ value, unit }: { value: number; unit: string }) => {
  return (
    <span className="inline-flex items-baseline">
      <span className="transition-all duration-300 ease-out" key={value}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] opacity-70 ml-0.5">{unit}</span>
    </span>
  );
};

const Separator = () => (
  <span className="mx-0.5 opacity-50">:</span>
);

export default CountdownTimer;
