/**
 * BolãoMax - Página: Indique Amigos
 * Sistema de indicações para clientes
 */

import { useState, useEffect } from 'react';
import { 
  Gift, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Info
} from 'lucide-react';
import { referralService, UserReferralProfile, Referral, ReferralCampaign } from '@/services/referralService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ShareButtons from '@/components/ShareButtons';
import { useTheme } from '@/contexts/ThemeContext';

export default function IndiqueAmigos() {
  const { isDark } = useTheme();
  
  // Estados
  const [profile, setProfile] = useState<UserReferralProfile | null>(null);
  const [campaign, setCampaign] = useState<ReferralCampaign | null>(null);
  const [myReferrals, setMyReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user ID - em produção virá da autenticação
  const currentUserId = 'user_1';
  const currentUserName = 'João Silva';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    
    // Criar ou buscar perfil do usuário
    let userProfile = referralService.getProfileByUserId(currentUserId);
    if (!userProfile) {
      userProfile = referralService.createOrUpdateUserProfile(currentUserId, currentUserName);
    }
    
    // Buscar campanha ativa
    const activeCampaign = referralService.getCampaign();
    
    // Buscar indicações do usuário
    const referrals = referralService.getReferralsByUser(currentUserId);
    
    setProfile(userProfile);
    setCampaign(activeCampaign);
    setMyReferrals(referrals);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
      confirmed: { label: 'Confirmada', color: 'bg-blue-500/20 text-blue-500', icon: CheckCircle },
      paid: { label: 'Paga', color: 'bg-green-500/20 text-green-500', icon: CheckCircle },
    };
    
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bolao-green"></div>
      </div>
    );
  }

  if (!campaign?.isActive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className={`p-8 text-center ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
          <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Campanha Temporariamente Indisponível
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            A campanha "Indique e Ganhe" está temporariamente desativada.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0D1117]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Gift className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3 text-bolao-green" />
            {campaign.title}
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {campaign.description}
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Saldo Disponível
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(profile?.referralBalance || 0)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total de Indicações
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {myReferrals.length}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Ganho
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(profile?.totalEarned || 0)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-bolao-green opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compartilhe seu Código */}
          <div>
            <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Compartilhe e Ganhe
              </h2>
              
              {profile && (
                <ShareButtons 
                  referralCode={profile.referralCode}
                  message={campaign.description}
                />
              )}
            </Card>

            {/* Como Funciona */}
            <Card className={`mt-6 p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Info className="inline-block w-5 h-5 mr-2 text-bolao-green" />
                Como Funciona
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bolao-green/20 flex items-center justify-center text-bolao-green font-bold">
                    1
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Compartilhe seu código
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Envie para amigos e familiares via WhatsApp, email ou redes sociais
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bolao-green/20 flex items-center justify-center text-bolao-green font-bold">
                    2
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Amigo faz primeira compra
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Valor mínimo de {formatCurrency(campaign.minimumPurchase)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bolao-green/20 flex items-center justify-center text-bolao-green font-bold">
                    3
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Vocês dois ganham!
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Você: {formatCurrency(campaign.bonusReferrer)} • Amigo: {formatCurrency(campaign.bonusReferred)}
                    </p>
                  </div>
                </div>

                {campaign.monthlyPlanBonus && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                      ★
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Bônus Extra
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Se o indicado assinar plano mensal: {campaign.monthlyPlanBonus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Minhas Indicações */}
          <div>
            <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Minhas Indicações
                </h2>
                <Badge className="bg-bolao-green/20 text-bolao-green border-0">
                  {myReferrals.length} total
                </Badge>
              </div>

              {myReferrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Nenhuma indicação ainda
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Comece compartilhando seu código com amigos!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {myReferrals.map((referral) => (
                    <div
                      key={referral.id}
                      className={`p-4 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {referral.referredName}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Compra: {formatCurrency(referral.purchaseValue)}
                          </p>
                        </div>
                        {getStatusBadge(referral.status)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(referral.createdAt)}
                        </span>
                        <span className={`text-sm font-medium ${
                          referral.status === 'paid' 
                            ? 'text-green-500' 
                            : isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {referral.status === 'paid' 
                            ? `+${formatCurrency(referral.bonusAmount)}` 
                            : formatCurrency(referral.bonusAmount)
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Usar Saldo */}
            {profile && profile.referralBalance > 0 && (
              <Card className={`mt-6 p-6 ${isDark ? 'bg-gradient-to-br from-bolao-green/10 to-bolao-green/5 border-bolao-green/30' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Saldo Disponível para Usar
                    </p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(profile.referralBalance)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-bolao-green opacity-30" />
                </div>
                <Button className="w-full bg-bolao-green hover:bg-bolao-green/90">
                  Usar Saldo em Compra
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
