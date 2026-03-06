import { useState, useEffect } from "react";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  buttonColor?: string;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  className?: string;
}

export const WhatsAppButton = ({
  phoneNumber: propPhoneNumber,
  message: propMessage,
  position: propPosition,
  buttonColor: propButtonColor,
  showOnMobile: propShowOnMobile,
  showOnDesktop: propShowOnDesktop,
  className = "",
}: WhatsAppButtonProps) => {
  const { config } = useWhatsApp();
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use props if provided, otherwise use context config
  const phoneNumber = propPhoneNumber || config.phoneNumber;
  const message = propMessage || config.welcomeMessage;
  const position = propPosition || config.position;
  const buttonColor = propButtonColor || config.buttonColor;
  const showOnMobile = propShowOnMobile ?? config.showOnMobile;
  const showOnDesktop = propShowOnDesktop ?? config.showOnDesktop;
  const enabled = config.enabled;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle responsive visibility
  useEffect(() => {
    const checkVisibility = () => {
      const isMobileScreen = window.innerWidth < 768;
      if (isMobileScreen && !showOnMobile) {
        setIsVisible(false);
      } else if (!isMobileScreen && !showOnDesktop) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    checkVisibility();
    window.addEventListener("resize", checkVisibility);
    return () => window.removeEventListener("resize", checkVisibility);
  }, [showOnMobile, showOnDesktop]);

  // Don't render if not enabled or not visible
  if (!isMounted || !enabled || !isVisible) {
    return null;
  }

  // Format phone number for WhatsApp URL (remove all non-numeric characters)
  const formattedPhone = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-24 right-6",
    "top-left": "top-24 left-6",
  };

  // Tooltip position based on button position
  const tooltipPositionClasses = {
    "bottom-right": "right-full mr-3 top-1/2 -translate-y-1/2",
    "bottom-left": "left-full ml-3 top-1/2 -translate-y-1/2",
    "top-right": "right-full mr-3 top-1/2 -translate-y-1/2",
    "top-left": "left-full ml-3 top-1/2 -translate-y-1/2",
  };

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`absolute ${tooltipPositionClasses[position]} whitespace-nowrap px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg animate-fade-in`}
        >
          Fale conosco no WhatsApp
          <div
            className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
              position.includes("right")
                ? "right-[-4px] top-1/2 -translate-y-1/2"
                : "left-[-4px] top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        className="relative group min-w-[56px] min-h-[56px] w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2"
        style={{
          backgroundColor: buttonColor,
          boxShadow: `0 4px 14px ${buttonColor}40`,
        }}
        aria-label="Abrir WhatsApp"
      >
        {/* Pulse Animation Ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: buttonColor }}
        />
        <span
          className="absolute inset-0 rounded-full animate-pulse opacity-20"
          style={{ backgroundColor: buttonColor }}
        />

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="white"
          className="w-7 h-7 relative z-10"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>
    </div>
  );
};

// Preview component for admin page
export const WhatsAppButtonPreview = ({
  position,
  buttonColor,
}: {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  buttonColor: string;
}) => {
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  return (
    <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Simulated page content */}
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>

      {/* Preview button */}
      <div className={`absolute ${positionClasses[position]}`}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: buttonColor }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
      </div>

      {/* Position label */}
      <div className="absolute inset-x-0 bottom-0 bg-gray-900/80 text-white text-xs py-1 text-center">
        Posição: {position}
      </div>
    </div>
  );
};
