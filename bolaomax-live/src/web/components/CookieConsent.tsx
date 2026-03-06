import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, Settings, X, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const STORAGE_KEY = "bolaomax_cookie_consent";

const defaultPreferences: CookiePreferences = {
  essential: true, // Always true
  analytics: false,
  marketing: false,
  preferences: false,
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already consented
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    
    // Here you would typically initialize or disable tracking scripts
    // based on the user's preferences
    if (prefs.analytics) {
      // Initialize Google Analytics, etc.
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      // Initialize marketing pixels, etc.
      console.log("Marketing enabled");
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
      <Card className="max-w-4xl mx-auto bg-bolao-card/95 backdrop-blur-lg border-bolao-card-border shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-bolao-green/20">
                <Cookie className="w-6 h-6 text-bolao-green" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Nós usamos cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Para melhorar sua experiência em nosso site
                </p>
              </div>
            </div>
            <button
              onClick={handleRejectNonEssential}
              className="text-muted-foreground hover:text-white transition-colors p-1"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            Usamos cookies para personalizar conteúdo, analisar nosso tráfego e fornecer recursos de mídia social.
            Ao clicar em "Aceitar Todos", você concorda com o uso de todos os cookies. 
            Conforme a <strong className="text-white">LGPD</strong>, você pode personalizar suas preferências ou rejeitar cookies não essenciais.{" "}
            <Link href="/politica-cookies" className="text-bolao-green hover:underline">
              Saiba mais
            </Link>
          </p>

          {/* Customization Panel */}
          {showCustomize && (
            <div className="mb-4 p-4 rounded-lg bg-bolao-dark/50 border border-bolao-card-border space-y-3 animate-in fade-in duration-300">
              {/* Essential */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Cookies Essenciais</p>
                  <p className="text-xs text-muted-foreground">Necessários para o funcionamento do site</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-bolao-green" />
                  <span className="text-xs text-bolao-green">Sempre ativo</span>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Cookies de Análise</p>
                  <p className="text-xs text-muted-foreground">Ajudam a entender como você usa o site</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-bolao-card-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bolao-green"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Cookies de Marketing</p>
                  <p className="text-xs text-muted-foreground">Usados para mostrar anúncios relevantes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-bolao-card-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bolao-green"></div>
                </label>
              </div>

              {/* Preferences */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Cookies de Preferências</p>
                  <p className="text-xs text-muted-foreground">Lembram suas configurações e preferências</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-bolao-card-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bolao-green"></div>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => setShowCustomize(!showCustomize)}
              variant="outline"
              className="w-full sm:w-auto order-3 sm:order-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Personalizar
              {showCustomize ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </Button>
            
            <div className="flex-1" />
            
            <Button
              onClick={handleRejectNonEssential}
              variant="outline"
              className="w-full sm:w-auto order-2"
            >
              Rejeitar não essenciais
            </Button>
            
            {showCustomize ? (
              <Button
                onClick={handleSaveCustom}
                className="w-full sm:w-auto bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark order-1 sm:order-4"
              >
                Salvar preferências
              </Button>
            ) : (
              <Button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark order-1 sm:order-4"
              >
                Aceitar todos
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Hook to check cookie consent
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  return consent;
}

// Function to manually trigger the cookie banner (e.g., from footer link)
export function resetCookieConsent() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
