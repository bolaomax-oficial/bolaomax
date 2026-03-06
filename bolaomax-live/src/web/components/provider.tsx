import { Metadata } from "./metadata";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BolaoUpdateProvider } from "@/contexts/BolaoUpdateContext";
import { AuditLogProvider } from "@/contexts/AuditLogContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { WhatsAppProvider } from "@/contexts/WhatsAppContext";
import { TestimonialProvider } from "@/contexts/TestimonialContext";
import { LiveTickerProvider } from "@/contexts/LiveTickerContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { BolaoUpdateToast } from "@/components/BolaoUpdateToast";
import { LiveTickerWrapper } from "@/components/LiveTickerWrapper";
import { CartFloating } from "@/components/CartFloating";

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MenuProvider>
          <WhatsAppProvider>
            <BolaoUpdateProvider>
              <AuditLogProvider>
                <NotificationProvider>
                  <TestimonialProvider>
                    <LiveTickerProvider>
                      <Metadata />
                      {children}
                      <BolaoUpdateToast />
                      <LiveTickerWrapper />
                      <CartFloating />
                    </LiveTickerProvider>
                  </TestimonialProvider>
                </NotificationProvider>
              </AuditLogProvider>
            </BolaoUpdateProvider>
          </WhatsAppProvider>
        </MenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
