import { useEffect, useState } from "react";
import { useBolaoUpdates } from "@/contexts/BolaoUpdateContext";
import { X, Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const BolaoUpdateToast = () => {
  const { notifications, clearNotification } = useBolaoUpdates();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-bolao-green" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return isDark ? "bg-bolao-green/10 border-bolao-green/30" : "bg-green-50 border-green-200";
      case "warning":
        return isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200";
      default:
        return isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-xl border shadow-lg backdrop-blur-sm
            ${getBgColor(notification.type)}
            ${isDark ? "bg-[#111827]/90" : "bg-white/90"}
            animate-in slide-in-from-right-5 fade-in duration-300
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Bell className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Atualização
                </span>
              </div>
              <p className={`text-sm mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                {notification.message}
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {new Date(notification.timestamp).toLocaleTimeString("pt-BR", { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })}
              </p>
            </div>
            <button
              onClick={() => clearNotification(notification.id)}
              className={`
                flex-shrink-0 p-1 rounded-lg transition-colors
                ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}
              `}
            >
              <X className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BolaoUpdateToast;
