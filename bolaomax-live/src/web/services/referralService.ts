/**
 * BolãoMax - Referral Service
 * Sistema de indicações (Indique e Ganhe)
 */

export interface ReferralCampaign {
  id: string;
  title: string;
  description: string;
  bonusReferrer: number;        // Bônus para quem indica (R$)
  bonusReferred: number;        // Bônus para quem foi indicado (R$)
  minimumPurchase: number;      // Valor mínimo de compra (R$)
  monthlyPlanBonus: string;     // Bônus extra (ex: "1 cota bolão")
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;           // ID do indicador
  referrerName: string;
  referredId: string;            // ID do indicado
  referredName: string;
  referralCode: string;          // Código usado
  status: 'pending' | 'confirmed' | 'paid';
  bonusAmount: number;
  purchaseValue: number;
  createdAt: string;
  paidAt?: string;
}

export interface UserReferralProfile {
  userId: string;
  name: string;
  referralCode: string;          // Código único do usuário
  referredBy?: string;           // Código de quem indicou
  referralBalance: number;       // Saldo de bônus
  totalReferrals: number;        // Total de indicações
  totalEarned: number;           // Total ganho com indicações
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalBonusPaid: number;
  conversionRate: number;
  pendingCount: number;
  confirmedCount: number;
  paidCount: number;
}

const STORAGE_KEY_CAMPAIGN = 'bolaomax_referral_campaign';
const STORAGE_KEY_REFERRALS = 'bolaomax_referrals';
const STORAGE_KEY_PROFILES = 'bolaomax_user_referral_profiles';

class ReferralService {
  /**
   * Gera código de indicação único para o usuário
   */
  generateReferralCode(userId: string, userName: string): string {
    // Formato: NOME{YEAR}{RANDOM}
    const year = new Date().getFullYear();
    const name = userName
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z]/g, '')
      .slice(0, 5);
    
    const random = Math.floor(Math.random() * 999) + 1;
    return `${name}${year}${random}`;
  }

  /**
   * Cria ou atualiza perfil de indicação do usuário
   */
  createOrUpdateUserProfile(userId: string, userName: string, referredBy?: string): UserReferralProfile {
    const profiles = this.getAllProfiles();
    
    let profile = profiles.find(p => p.userId === userId);
    
    if (!profile) {
      // Criar novo perfil
      profile = {
        userId,
        name: userName,
        referralCode: this.generateReferralCode(userId, userName),
        referredBy,
        referralBalance: 0,
        totalReferrals: 0,
        totalEarned: 0,
      };
      profiles.push(profile);
    } else if (referredBy && !profile.referredBy) {
      // Atualizar apenas se ainda não tem indicador
      profile.referredBy = referredBy;
    }
    
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    return profile;
  }

  /**
   * Busca perfil por código de indicação
   */
  getProfileByCode(code: string): UserReferralProfile | null {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.referralCode === code) || null;
  }

  /**
   * Busca perfil por userId
   */
  getProfileByUserId(userId: string): UserReferralProfile | null {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.userId === userId) || null;
  }

  /**
   * Retorna todos os perfis
   */
  getAllProfiles(): UserReferralProfile[] {
    const data = localStorage.getItem(STORAGE_KEY_PROFILES);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Cria uma nova indicação
   */
  createReferral(
    referrerId: string,
    referrerName: string,
    referredId: string,
    referredName: string,
    referralCode: string,
    purchaseValue: number
  ): Referral | null {
    // Validações
    if (referrerId === referredId) {
      console.error('Usuário não pode indicar a si mesmo');
      return null;
    }

    const campaign = this.getCampaign();
    if (!campaign || !campaign.isActive) {
      console.error('Campanha de indicações não está ativa');
      return null;
    }

    if (purchaseValue < campaign.minimumPurchase) {
      console.error(`Compra mínima de R$ ${campaign.minimumPurchase} não atingida`);
      return null;
    }

    // Verificar se indicado já foi indicado antes
    const existingReferral = this.getAllReferrals().find(r => r.referredId === referredId);
    if (existingReferral) {
      console.error('Cliente já foi indicado anteriormente');
      return null;
    }

    const referral: Referral = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      referrerId,
      referrerName,
      referredId,
      referredName,
      referralCode,
      status: 'pending',
      bonusAmount: campaign.bonusReferrer,
      purchaseValue,
      createdAt: new Date().toISOString(),
    };

    const referrals = this.getAllReferrals();
    referrals.push(referral);
    localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(referrals));

    return referral;
  }

  /**
   * Atualiza status da indicação
   */
  updateReferralStatus(id: string, status: 'pending' | 'confirmed' | 'paid'): boolean {
    const referrals = this.getAllReferrals();
    const index = referrals.findIndex(r => r.id === id);
    
    if (index === -1) return false;
    
    referrals[index].status = status;
    
    if (status === 'paid') {
      referrals[index].paidAt = new Date().toISOString();
      
      // Creditar bônus no perfil do indicador
      const profile = this.getProfileByUserId(referrals[index].referrerId);
      if (profile) {
        profile.referralBalance += referrals[index].bonusAmount;
        profile.totalEarned += referrals[index].bonusAmount;
        this.updateProfile(profile);
      }
    }
    
    localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(referrals));
    return true;
  }

  /**
   * Retorna todas as indicações
   */
  getAllReferrals(): Referral[] {
    const data = localStorage.getItem(STORAGE_KEY_REFERRALS);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Retorna indicações de um usuário específico
   */
  getReferralsByUser(userId: string): Referral[] {
    return this.getAllReferrals().filter(r => r.referrerId === userId);
  }

  /**
   * Credita bônus manualmente
   */
  creditBonus(userId: string, amount: number, description: string): boolean {
    const profile = this.getProfileByUserId(userId);
    if (!profile) return false;
    
    profile.referralBalance += amount;
    profile.totalEarned += amount;
    this.updateProfile(profile);
    
    return true;
  }

  /**
   * Debita bônus (usado ao usar saldo)
   */
  debitBonus(userId: string, amount: number): boolean {
    const profile = this.getProfileByUserId(userId);
    if (!profile || profile.referralBalance < amount) return false;
    
    profile.referralBalance -= amount;
    this.updateProfile(profile);
    
    return true;
  }

  /**
   * Atualiza perfil
   */
  private updateProfile(profile: UserReferralProfile): void {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.userId === profile.userId);
    
    if (index !== -1) {
      profiles[index] = profile;
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    }
  }

  /**
   * Retorna estatísticas gerais
   */
  getReferralStats(userId?: string): ReferralStats {
    const referrals = userId 
      ? this.getReferralsByUser(userId)
      : this.getAllReferrals();
    
    const totalReferrals = referrals.length;
    const pendingCount = referrals.filter(r => r.status === 'pending').length;
    const confirmedCount = referrals.filter(r => r.status === 'confirmed').length;
    const paidCount = referrals.filter(r => r.status === 'paid').length;
    const activeReferrals = confirmedCount + paidCount;
    const totalBonusPaid = referrals
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.bonusAmount, 0);
    
    const conversionRate = totalReferrals > 0 
      ? (paidCount / totalReferrals) * 100 
      : 0;
    
    return {
      totalReferrals,
      activeReferrals,
      totalBonusPaid,
      conversionRate,
      pendingCount,
      confirmedCount,
      paidCount,
    };
  }

  /**
   * Retorna top indicadores
   */
  getTopReferrers(limit: number = 10): Array<UserReferralProfile & { referralCount: number }> {
    const profiles = this.getAllProfiles();
    const referrals = this.getAllReferrals();
    
    // Contar indicações por usuário
    const referralCounts = new Map<string, number>();
    referrals
      .filter(r => r.status !== 'pending')
      .forEach(r => {
        const count = referralCounts.get(r.referrerId) || 0;
        referralCounts.set(r.referrerId, count + 1);
      });
    
    // Mapear e ordenar
    const topReferrers = profiles
      .map(profile => ({
        ...profile,
        referralCount: referralCounts.get(profile.userId) || 0,
      }))
      .filter(p => p.referralCount > 0)
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, limit);
    
    return topReferrers;
  }

  /**
   * Retorna configuração da campanha
   */
  getCampaign(): ReferralCampaign | null {
    const data = localStorage.getItem(STORAGE_KEY_CAMPAIGN);
    return data ? JSON.parse(data) : this.getDefaultCampaign();
  }

  /**
   * Salva configuração da campanha
   */
  saveCampaign(campaign: Partial<ReferralCampaign>): ReferralCampaign {
    const current = this.getCampaign() || this.getDefaultCampaign();
    
    const updated: ReferralCampaign = {
      ...current,
      ...campaign,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY_CAMPAIGN, JSON.stringify(updated));
    return updated;
  }

  /**
   * Retorna campanha padrão
   */
  private getDefaultCampaign(): ReferralCampaign {
    return {
      id: 'default_campaign',
      title: 'Indique e Ganhe',
      description: 'Convide amigos e ganhe R$ 10,00 para cada um que fizer a primeira compra!',
      bonusReferrer: 10.00,
      bonusReferred: 10.00,
      minimumPurchase: 40.00,
      monthlyPlanBonus: '1 cota de bolão especial',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Ativa/desativa campanha
   */
  toggleCampaignStatus(): boolean {
    const campaign = this.getCampaign();
    if (!campaign) return false;
    
    campaign.isActive = !campaign.isActive;
    campaign.updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY_CAMPAIGN, JSON.stringify(campaign));
    return campaign.isActive;
  }

  /**
   * Gera dados mock para desenvolvimento
   */
  generateMockData(): void {
    // Criar perfis mock
    const mockProfiles: UserReferralProfile[] = [
      {
        userId: 'user_1',
        name: 'João Silva',
        referralCode: 'JOAO202601',
        referralBalance: 50.00,
        totalReferrals: 5,
        totalEarned: 50.00,
      },
      {
        userId: 'user_2',
        name: 'Maria Santos',
        referralCode: 'MARIA202602',
        referralBalance: 30.00,
        totalReferrals: 3,
        totalEarned: 30.00,
      },
      {
        userId: 'user_3',
        name: 'Pedro Oliveira',
        referralCode: 'PEDRO202603',
        referralBalance: 20.00,
        totalReferrals: 2,
        totalEarned: 20.00,
      },
    ];
    
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(mockProfiles));
    
    // Criar indicações mock
    const mockReferrals: Referral[] = [
      {
        id: 'ref_1',
        referrerId: 'user_1',
        referrerName: 'João Silva',
        referredId: 'user_10',
        referredName: 'Ana Costa',
        referralCode: 'JOAO202601',
        status: 'paid',
        bonusAmount: 10.00,
        purchaseValue: 50.00,
        createdAt: new Date('2026-02-15').toISOString(),
        paidAt: new Date('2026-02-15').toISOString(),
      },
      {
        id: 'ref_2',
        referrerId: 'user_1',
        referrerName: 'João Silva',
        referredId: 'user_11',
        referredName: 'Carlos Almeida',
        referralCode: 'JOAO202601',
        status: 'confirmed',
        bonusAmount: 10.00,
        purchaseValue: 60.00,
        createdAt: new Date('2026-02-16').toISOString(),
      },
      {
        id: 'ref_3',
        referrerId: 'user_2',
        referrerName: 'Maria Santos',
        referredId: 'user_12',
        referredName: 'Beatriz Lima',
        referralCode: 'MARIA202602',
        status: 'pending',
        bonusAmount: 10.00,
        purchaseValue: 45.00,
        createdAt: new Date('2026-02-17').toISOString(),
      },
    ];
    
    localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(mockReferrals));
    
    console.log('✅ Dados mock de indicações gerados com sucesso!');
  }

  /**
   * Limpa todos os dados
   */
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY_CAMPAIGN);
    localStorage.removeItem(STORAGE_KEY_REFERRALS);
    localStorage.removeItem(STORAGE_KEY_PROFILES);
    console.log('🗑️ Todos os dados de indicações foram limpos!');
  }
}

export const referralService = new ReferralService();
