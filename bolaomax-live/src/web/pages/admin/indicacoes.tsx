/**
 * BolãoMax - Página Admin: Indicações
 * Sistema completo de gerenciamento de indicações
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Save,
  BarChart3,
  Trophy
} from 'lucide-react';
import { referralService, ReferralCampaign, Referral, ReferralStats } from '@/services/referralService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import AdminLayout from '@/components/admin/admin-layout';

export default function AdminIndicacoes() {
  const { isDark } = useTheme();
  
  // Estados
  const [campaign, setCampaign] = useState<ReferralCampaign | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form states
  const [formData, setFormData] = useState<Partial<ReferralCampaign>>({});

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const campaignData = referralService.getCampaign();
    const statsData = referralService.getReferralStats();
    const referralsData = referralService.getAllReferrals();
    const topData = referralService.getTopReferrers(10);
    
    setCampaign(campaignData);
    setStats(statsData);
    setReferrals(referralsData);
    setTopReferrers(topData);
    
    if (campaignData) {
      setFormData(campaignData);
    }
  };

  const handleSaveCampaign = () => {
    if (!formData) return;
    
    const updated = referralService.saveCampaign(formData);
    setCampaign(updated);
    setIsEditing(false);
    showToastMessage('✅ Campanha salva com sucesso!');
  };

  const handleToggleCampaign = () => {
    const newStatus = referralService.toggleCampaignStatus();
    loadData();
    showToastMessage(
      newStatus 
        ? '✅ Campanha ativada com sucesso!' 
        : '⚠️ Campanha desativada'
    );
  };

  const handleUpdateStatus = (referralId: string, newStatus: 'pending' | 'confirmed' | 'paid') => {
    const success = referralService.updateReferralStatus(referralId, newStatus);
    if (success) {
      loadData();
      showToastMessage('✅ Status atualizado com sucesso!');
    }
  };

  const handleGenerateMockData = () => {
    referralService.generateMockData();
    loadData();
    showToastMessage('✅ Dados mock gerados com sucesso!');
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-500' },
      confirmed: { label: 'Confirmada', color: 'bg-blue-500/20 text-blue-500' },
      paid: { label: 'Paga', color: 'bg-green-500/20 text-green-500' },
    };
    
    const variant = variants[status] || variants.pending;
    
    return (
      <Badge className={`${variant.color} border-0`}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Gift className="inline-block w-8 h-8 mr-2 text-bolao-green" />
              Indicações
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerencie o sistema "Indique e Ganhe"
            </p>
          </div>
          <Button
            onClick={handleGenerateMockData}
            className="bg-bolao-green hover:bg-bolao-green/90"
          >
            Gerar Dados Mock
          </Button>
        </div>

        {/* Dashboard de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total de Indicações
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.totalReferrals || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-bolao-green opacity-20" />
            </div>
          </Card>

          <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Indicações Ativas
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.activeReferrals || 0}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Bônus Pagos
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats?.totalBonusPaid || 0)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </Card>

          <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Taxa de Conversão
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.conversionRate.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Configuração da Campanha */}
        <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Configuração da Campanha
            </h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={handleToggleCampaign}
                    variant={campaign?.isActive ? 'destructive' : 'default'}
                    className={campaign?.isActive ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {campaign?.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSaveCampaign}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(campaign || {});
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Título da Campanha
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <div className="flex items-center gap-2 h-10">
                <Badge className={campaign?.isActive 
                  ? 'bg-green-500/20 text-green-500 border-0' 
                  : 'bg-red-500/20 text-red-500 border-0'
                }>
                  {campaign?.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Descrição
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Bônus para Indicador (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.bonusReferrer || 0}
                onChange={(e) => setFormData({ ...formData, bonusReferrer: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Bônus para Indicado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.bonusReferred || 0}
                onChange={(e) => setFormData({ ...formData, bonusReferred: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Valor Mínimo de Compra (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minimumPurchase || 0}
                onChange={(e) => setFormData({ ...formData, minimumPurchase: parseFloat(e.target.value) })}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Bônus Plano Mensal
              </label>
              <input
                type="text"
                value={formData.monthlyPlanBonus || ''}
                onChange={(e) => setFormData({ ...formData, monthlyPlanBonus: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: 1 cota de bolão especial"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
            </div>
          </div>
        </Card>

        {/* Tabela de Indicações */}
        <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="inline-block w-5 h-5 mr-2" />
              Relatório de Indicações
            </h2>
            <div className="flex gap-2 text-sm">
              <Badge className="bg-yellow-500/20 text-yellow-500 border-0">
                <Clock className="w-3 h-3 mr-1" />
                Pendentes: {stats?.pendingCount || 0}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-500 border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmadas: {stats?.confirmedCount || 0}
              </Badge>
              <Badge className="bg-green-500/20 text-green-500 border-0">
                <DollarSign className="w-3 h-3 mr-1" />
                Pagas: {stats?.paidCount || 0}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Indicador
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Indicado
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Código
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Valor Compra
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bônus
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Nenhuma indicação encontrada
                      </p>
                    </td>
                  </tr>
                ) : (
                  referrals.map((referral) => (
                    <tr 
                      key={referral.id}
                      className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {referral.referrerName}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {referral.referredName}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <code className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {referral.referralCode}
                        </code>
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatCurrency(referral.purchaseValue)}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatCurrency(referral.bonusAmount)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(referral.status)}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(referral.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={referral.status}
                          onChange={(e) => handleUpdateStatus(referral.id, e.target.value as any)}
                          className={`text-xs px-2 py-1 rounded border ${
                            isDark 
                              ? 'bg-gray-800 border-gray-700 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="paid">Paga</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Ranking de Indicadores */}
        <Card className={`p-6 ${isDark ? 'bg-bolao-card border-bolao-card-border' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Trophy className="inline-block w-5 h-5 mr-2 text-yellow-500" />
            Top 10 Indicadores
          </h2>

          <div className="space-y-3">
            {topReferrers.length === 0 ? (
              <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Nenhum indicador encontrado
              </p>
            ) : (
              topReferrers.map((referrer, index) => (
                <div
                  key={referrer.userId}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                    </span>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {referrer.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {referrer.referralCount} indicações • {formatCurrency(referrer.totalEarned)} ganhos
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-bolao-green/20 text-bolao-green border-0">
                    {referrer.referralCount} indic.
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Toast de Notificação */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right">
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
