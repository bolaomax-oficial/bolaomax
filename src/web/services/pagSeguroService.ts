/**
 * PagSeguro Payment Integration Service
 * Handles credit/debit card payments and PIX generation
 */

// ============================================================
// Type Definitions
// ============================================================

export interface PagSeguroCredentials {
  email: string;
  token: string;
  sandboxMode: boolean;
}

export interface CardData {
  number: string;
  holderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  cpf: string;
}

export interface PaymentAmount {
  value: number;
  currency?: string;
}

export interface InstallmentOption {
  quantity: number;
  totalAmount: number;
  installmentAmount: number;
  interestFree: boolean;
}

export interface PixQRCodeResponse {
  qrCode: string;
  qrCodeBase64: string;
  copyPasteCode: string;
  expirationDate: string;
  transactionId: string;
}

export interface CardPaymentResponse {
  transactionId: string;
  status: PaymentStatus;
  authorizationCode?: string;
  nsu?: string;
  installments: number;
  amount: number;
  paidAt?: string;
}

export interface TransactionStatus {
  transactionId: string;
  status: PaymentStatus;
  statusDescription: string;
  amount: number;
  paidAmount?: number;
  refundedAmount?: number;
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
  createdAt: string;
  updatedAt: string;
}

export interface WebhookPayload {
  notificationCode: string;
  notificationType: string;
  transactionId?: string;
  status?: PaymentStatus;
}

export type PaymentStatus = 
  | 'PENDING'
  | 'WAITING_PAYMENT'
  | 'IN_ANALYSIS'
  | 'PAID'
  | 'AVAILABLE'
  | 'IN_DISPUTE'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'DEBITED'
  | 'TEMPORARY_RETENTION';

export interface PagSeguroConfig {
  apiUrl: string;
  sandboxApiUrl: string;
  credentials: PagSeguroCredentials;
}

export interface PaymentSession {
  sessionId: string;
  expiresAt: string;
}

// ============================================================
// PagSeguro Service Class
// ============================================================

class PagSeguroService {
  private config: PagSeguroConfig | null = null;
  private sessionId: string | null = null;
  private isInitialized = false;

  /**
   * Initialize PagSeguro SDK with credentials
   * Must be called before any other method
   */
  async initializePagSeguro(credentials?: PagSeguroCredentials): Promise<boolean> {
    try {
      // Get credentials from environment or parameter
      const creds = credentials || {
        email: import.meta.env.VITE_PAGSEGURO_EMAIL || '',
        token: import.meta.env.VITE_PAGSEGURO_TOKEN || '',
        sandboxMode: import.meta.env.VITE_PAGSEGURO_SANDBOX === 'true',
      };

      if (!creds.email || !creds.token) {
        console.warn('PagSeguro: Missing credentials');
        return false;
      }

      this.config = {
        apiUrl: 'https://ws.pagseguro.uol.com.br/v2',
        sandboxApiUrl: 'https://ws.sandbox.pagseguro.uol.com.br/v2',
        credentials: creds,
      };

      // Load PagSeguro JavaScript library if not already loaded
      await this.loadPagSeguroScript();

      this.isInitialized = true;
      console.log('PagSeguro: Initialized successfully', creds.sandboxMode ? '(SANDBOX)' : '(PRODUCTION)');
      return true;
    } catch (error) {
      console.error('PagSeguro: Initialization failed', error);
      return false;
    }
  }

  /**
   * Load PagSeguro DirectPayment script
   */
  private loadPagSeguroScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.PagSeguroDirectPayment) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      const isSandbox = this.config?.credentials.sandboxMode;
      script.src = isSandbox 
        ? 'https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
        : 'https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PagSeguro script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Create a payment session for checkout
   * Required before processing card payments
   */
  async createPaymentSession(): Promise<PaymentSession> {
    this.ensureInitialized();

    try {
      // In a real implementation, this would call your backend API
      // which then communicates with PagSeguro's API
      const response = await this.mockApiCall('/sessions', 'POST', {
        email: this.config!.credentials.email,
        token: this.config!.credentials.token,
      });

      this.sessionId = response.sessionId;

      // Set session in PagSeguro DirectPayment
      if (window.PagSeguroDirectPayment) {
        window.PagSeguroDirectPayment.setSessionId(this.sessionId);
      }

      return {
        sessionId: response.sessionId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
      };
    } catch (error) {
      console.error('PagSeguro: Failed to create session', error);
      throw new Error('Falha ao criar sessão de pagamento');
    }
  }

  /**
   * Process credit/debit card payment
   */
  async processCardPayment(
    cardData: CardData,
    amount: PaymentAmount,
    installments: number = 1
  ): Promise<CardPaymentResponse> {
    this.ensureInitialized();

    try {
      // Validate card data
      this.validateCardData(cardData);

      // Get card token (would use PagSeguroDirectPayment in production)
      const cardToken = await this.tokenizeCard(cardData);

      // Process payment through backend
      const response = await this.mockApiCall('/transactions', 'POST', {
        paymentMode: 'default',
        paymentMethod: 'creditCard',
        currency: amount.currency || 'BRL',
        itemAmount: amount.value.toFixed(2),
        creditCardToken: cardToken,
        installmentQuantity: installments,
        creditCardHolderName: cardData.holderName,
        creditCardHolderCPF: cardData.cpf.replace(/\D/g, ''),
        billingAddressRequired: false,
      });

      return {
        transactionId: response.transactionId,
        status: response.status,
        authorizationCode: response.authorizationCode,
        nsu: response.nsu,
        installments,
        amount: amount.value,
        paidAt: response.status === 'PAID' ? new Date().toISOString() : undefined,
      };
    } catch (error) {
      console.error('PagSeguro: Card payment failed', error);
      throw new Error('Falha no processamento do cartão');
    }
  }

  /**
   * Generate PIX QR Code for payment
   */
  async generatePixQRCode(
    amount: PaymentAmount,
    description: string
  ): Promise<PixQRCodeResponse> {
    this.ensureInitialized();

    try {
      const response = await this.mockApiCall('/pix/qrcode', 'POST', {
        amount: amount.value.toFixed(2),
        description,
        expiresIn: 3600, // 1 hour expiry
      });

      return {
        qrCode: response.qrCode,
        qrCodeBase64: response.qrCodeBase64,
        copyPasteCode: response.copyPasteCode,
        expirationDate: response.expirationDate,
        transactionId: response.transactionId,
      };
    } catch (error) {
      console.error('PagSeguro: PIX generation failed', error);
      throw new Error('Falha ao gerar código PIX');
    }
  }

  /**
   * Get transaction status by ID
   */
  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    this.ensureInitialized();

    try {
      const response = await this.mockApiCall(`/transactions/${transactionId}`, 'GET');

      return {
        transactionId: response.transactionId,
        status: response.status,
        statusDescription: this.getStatusDescription(response.status),
        amount: response.amount,
        paidAmount: response.paidAmount,
        refundedAmount: response.refundedAmount,
        paymentMethod: response.paymentMethod,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
    } catch (error) {
      console.error('PagSeguro: Status check failed', error);
      throw new Error('Falha ao consultar status da transação');
    }
  }

  /**
   * Handle webhook notification from PagSeguro
   */
  async handleWebhook(data: WebhookPayload): Promise<TransactionStatus | null> {
    try {
      if (data.notificationType !== 'transaction') {
        console.log('PagSeguro: Ignoring non-transaction notification');
        return null;
      }

      // Fetch transaction details using notification code
      const transactionDetails = await this.mockApiCall(
        `/notifications/${data.notificationCode}`,
        'GET'
      );

      console.log('PagSeguro: Webhook processed', {
        transactionId: transactionDetails.transactionId,
        status: transactionDetails.status,
      });

      return {
        transactionId: transactionDetails.transactionId,
        status: transactionDetails.status,
        statusDescription: this.getStatusDescription(transactionDetails.status),
        amount: transactionDetails.amount,
        paymentMethod: transactionDetails.paymentMethod,
        createdAt: transactionDetails.createdAt,
        updatedAt: transactionDetails.updatedAt,
      };
    } catch (error) {
      console.error('PagSeguro: Webhook handling failed', error);
      throw new Error('Falha ao processar notificação');
    }
  }

  /**
   * Get installment options for a given amount
   */
  async getInstallmentOptions(amount: number, maxInstallments: number = 12): Promise<InstallmentOption[]> {
    this.ensureInitialized();

    // In production, this would call PagSeguro API
    const options: InstallmentOption[] = [];
    
    for (let i = 1; i <= maxInstallments; i++) {
      // Simulating interest rates (interest-free up to 3x)
      const interestFree = i <= 3;
      const interestRate = interestFree ? 0 : 0.0199 * (i - 3); // ~2% per month after 3x
      const totalAmount = amount * (1 + interestRate);
      
      options.push({
        quantity: i,
        totalAmount: Number(totalAmount.toFixed(2)),
        installmentAmount: Number((totalAmount / i).toFixed(2)),
        interestFree,
      });
    }

    return options;
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.config !== null;
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): { sandboxMode: boolean; email: string } | null {
    if (!this.config) return null;
    return {
      sandboxMode: this.config.credentials.sandboxMode,
      email: this.config.credentials.email,
    };
  }

  // ============================================================
  // Private Helper Methods
  // ============================================================

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.config) {
      throw new Error('PagSeguro não inicializado. Chame initializePagSeguro() primeiro.');
    }
  }

  private validateCardData(cardData: CardData): void {
    const errors: string[] = [];

    if (!cardData.number || cardData.number.replace(/\D/g, '').length < 13) {
      errors.push('Número do cartão inválido');
    }
    if (!cardData.holderName || cardData.holderName.trim().split(' ').length < 2) {
      errors.push('Nome do titular inválido');
    }
    if (!cardData.expirationMonth || !cardData.expirationYear) {
      errors.push('Data de validade inválida');
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.push('CVV inválido');
    }
    if (!cardData.cpf || cardData.cpf.replace(/\D/g, '').length !== 11) {
      errors.push('CPF inválido');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  private async tokenizeCard(cardData: CardData): Promise<string> {
    // In production, this would use PagSeguroDirectPayment.createCardToken
    return new Promise((resolve) => {
      // Simulate card tokenization
      const mockToken = `CARD_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTimeout(() => resolve(mockToken), 500);
    });
  }

  private async mockApiCall(endpoint: string, method: string, data?: unknown): Promise<any> {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    // Generate mock responses based on endpoint
    if (endpoint === '/sessions') {
      return {
        sessionId: `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    }

    if (endpoint === '/transactions') {
      return {
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'PAID' as PaymentStatus,
        authorizationCode: Math.random().toString().substr(2, 6),
        nsu: Math.random().toString().substr(2, 12),
      };
    }

    if (endpoint === '/pix/qrcode') {
      const txnId = `PIX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        transactionId: txnId,
        qrCode: `00020126580014br.gov.bcb.pix0136${txnId}`,
        qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        copyPasteCode: `00020126580014BR.GOV.BCB.PIX0136${txnId}520400005303986540${(data as any)?.amount}5802BR5924BOLAOMAX PAGAMENTOS LTDA6009SAO PAULO62070503***6304`,
        expirationDate: new Date(Date.now() + 3600000).toISOString(),
      };
    }

    if (endpoint.startsWith('/transactions/')) {
      return {
        transactionId: endpoint.split('/').pop(),
        status: 'PAID' as PaymentStatus,
        amount: 100,
        paidAmount: 100,
        paymentMethod: 'CREDIT_CARD',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (endpoint.startsWith('/notifications/')) {
      return {
        transactionId: `TXN_${Date.now()}`,
        status: 'PAID' as PaymentStatus,
        amount: 100,
        paymentMethod: 'PIX',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {};
  }

  private getStatusDescription(status: PaymentStatus): string {
    const descriptions: Record<PaymentStatus, string> = {
      PENDING: 'Aguardando pagamento',
      WAITING_PAYMENT: 'Aguardando pagamento',
      IN_ANALYSIS: 'Em análise',
      PAID: 'Pago',
      AVAILABLE: 'Disponível',
      IN_DISPUTE: 'Em disputa',
      REFUNDED: 'Devolvido',
      CANCELLED: 'Cancelado',
      DEBITED: 'Debitado',
      TEMPORARY_RETENTION: 'Retenção temporária',
    };
    return descriptions[status] || 'Status desconhecido';
  }
}

// ============================================================
// Singleton Instance & Exports
// ============================================================

export const pagSeguroService = new PagSeguroService();

// Convenience exports
export const initializePagSeguro = pagSeguroService.initializePagSeguro.bind(pagSeguroService);
export const createPaymentSession = pagSeguroService.createPaymentSession.bind(pagSeguroService);
export const processCardPayment = pagSeguroService.processCardPayment.bind(pagSeguroService);
export const generatePixQRCode = pagSeguroService.generatePixQRCode.bind(pagSeguroService);
export const getTransactionStatus = pagSeguroService.getTransactionStatus.bind(pagSeguroService);
export const handleWebhook = pagSeguroService.handleWebhook.bind(pagSeguroService);
export const getInstallmentOptions = pagSeguroService.getInstallmentOptions.bind(pagSeguroService);

// Type declaration for PagSeguro DirectPayment
declare global {
  interface Window {
    PagSeguroDirectPayment?: {
      setSessionId: (sessionId: string) => void;
      createCardToken: (params: {
        cardNumber: string;
        cvv: string;
        expirationMonth: string;
        expirationYear: string;
        success: (response: { card: { token: string } }) => void;
        error: (response: { errors: unknown }) => void;
      }) => void;
      getBrand: (params: {
        cardBin: string;
        success: (response: { brand: { name: string } }) => void;
        error: (response: { errors: unknown }) => void;
      }) => void;
      getInstallments: (params: {
        amount: number;
        brand: string;
        maxInstallmentNoInterest: number;
        success: (response: { installments: Record<string, InstallmentOption[]> }) => void;
        error: (response: { errors: unknown }) => void;
      }) => void;
    };
  }
}

export default pagSeguroService;
