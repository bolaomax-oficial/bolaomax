import { useLocation } from "wouter";
import { LiveNewsTicker } from "./LiveNewsTicker";
import { useLiveTicker } from "@/contexts/LiveTickerContext";

// Routes where the ticker should NOT appear
const excludedRoutes = [
  "/admin",
  "/login",
  "/cadastro",
  "/pagamento-pix",
];

export const LiveTickerWrapper = () => {
  const [location] = useLocation();
  const { config } = useLiveTicker();

  // Check if current route is excluded
  const isExcludedRoute = excludedRoutes.some(route => location.startsWith(route));
  
  // Check if on admin route
  const isAdminRoute = location.startsWith("/admin");

  // Don't show on excluded routes or if disabled
  if (!config.enabled || isExcludedRoute) {
    return null;
  }

  // Don't show on admin unless configured
  if (isAdminRoute && !config.showOnAdmin) {
    return null;
  }

  return (
    <LiveNewsTicker 
      position={config.position}
      enabled={config.enabled && config.visible}
    />
  );
};

export default LiveTickerWrapper;
