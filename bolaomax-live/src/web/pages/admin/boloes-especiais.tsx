import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Pause,
  Trophy,
  Clock,
  Users,
  DollarSign,
  Sparkles,
  Settings,
  History,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import * as boloesEspeciaisService from "@/services/boloesEspeciaisService";
import type { BolaoEspecial, TemplateEspecial } from "@/services/boloesEspeciaisService";

export default function BoloesEspeciaisPage() {
  const [boloes, setBoloes] = useState<BolaoEspecial[]>([]);
  const [templates, setTemplates] = useState<TemplateEspecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'lista' | 'criar' | 'config' | 'historico'>('lista');
  
  // Estados para criação
  const [criandoBolao, setCriandoBolao] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState<string>('');
  
  // Estados para automação
  const [executandoAutomacao, setExecutandoAutomacao] = useState(false);
  
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const [boloesData, templatesData] = await Promise.all([
      boloesEspeciaisService.listar(),
      boloesEspeciaisService.buscarTemplates(),
    ]);
    
    setBoloes(boloesData);
    setTemplates(templatesData);
    setLoading(false);
  };

  const handleAlterarVisibilidade = async (id: string, visivel: boolean) => {
    const result = await boloesEspeciaisService.alterarVisibilidade(id, visivel);
    if (result.success) {
      carregarDados();
    } else {
      alert(result.error || "Erro ao alterar visibilidade");
    }
  };

  const handleAlterarStatus = async (id: string, status: string) => {
    const result = await boloesEspeciaisService.alterarStatus(id, status);
    if (result.success) {
      carregarDados();
    } else {
      alert(result.error || "Erro ao alterar status");
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o bolão "${nome}"?`)) return;
    
    const result = await boloesEspeciaisService.excluir(id);
    if (result.success) {
      carregarDados();
    } else {
      alert(result.error || "Erro ao excluir bolão");
    }
  };

  const handleExecutarAutomacao = async () => {
    setExecutandoAutomacao(true);
    const result = await boloesEspeciaisService.executarAutomacao();
    setExecutandoAutomacao(false);
    
    if (result.success) {
      alert("Automação executada com sucesso!");
      carregarDados();
    } else {
      alert(result.error || "Erro ao executar automação");
    }
  };

  // Status Badge
  const StatusBadge = ({ status }: { status: string }) => {
    const configs = {
      aguardando: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        icon: Clock,
        label: "Aguardando",
      },
      aberto: {
        color: "bg-bolao-green/20 text-bolao-green border-bolao-green/50",
        icon: CheckCircle2,
        label: "Aberto",
      },
      encerrado: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/50",
        icon: XCircle,
        label: "Encerrado",
      },
      sorteado: {
        color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
        icon: Trophy,
        label: "Sorteado",
      },
    };

    const config = configs[status as keyof typeof configs] || configs.aguardando;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Tab Button
  const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
        active
          ? "text-bolao-green border-bolao-green"
          : "text-muted-foreground border-transparent hover:text-white hover:border-[#1C2432]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-bolao-green" />
              Bolões Especiais
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie bolões de Mega da Virada, Quina de São João e outros especiais
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleExecutarAutomacao}
              disabled={executandoAutomacao}
              variant="outline"
              className="border-[rgba(2,207,81,0.5)] hover:bg-bolao-green/20"
            >
              {executandoAutomacao ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Executar Automação
            </Button>
            <Button
              onClick={() => setTab('criar')}
              className="bg-bolao-green hover:bg-bolao-green/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Bolão Especial
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-bolao-green/20">
                <Trophy className="w-6 h-6 text-bolao-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-white">{boloes.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aguardando</p>
                <p className="text-2xl font-bold text-white">
                  {boloes.filter(b => b.status === 'aguardando').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-bolao-green/20">
                <CheckCircle2 className="w-6 h-6 text-bolao-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abertos</p>
                <p className="text-2xl font-bold text-white">
                  {boloes.filter(b => b.status === 'aberto').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sorteados</p>
                <p className="text-2xl font-bold text-white">
                  {boloes.filter(b => b.status === 'sorteado').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-[rgba(2,207,81,0.3)]">
          <div className="flex gap-2">
            <TabButton active={tab === 'lista'} onClick={() => setTab('lista')}>
              Lista de Bolões
            </TabButton>
            <TabButton active={tab === 'criar'} onClick={() => setTab('criar')}>
              Criar Novo
            </TabButton>
            <TabButton active={tab === 'config'} onClick={() => setTab('config')}>
              Configurações
            </TabButton>
            <TabButton active={tab === 'historico'} onClick={() => setTab('historico')}>
              Histórico
            </TabButton>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-bolao-green" />
          </div>
        ) : (
          <>
            {tab === 'lista' && (
              <Card className="bg-[#111827] border-[rgba(2,207,81,0.5)]">
                <div className="overflow-x-auto">
                  {boloes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum bolão especial cadastrado</p>
                      <Button
                        onClick={() => setTab('criar')}
                        className="mt-4 bg-bolao-green hover:bg-bolao-green/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Bolão
                      </Button>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="border-b border-[rgba(2,207,81,0.3)]">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                            Tipo
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                            Nome
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                            Concurso
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                            Status
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                            Sorteio
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                            Cotas
                          </th>
                          <th className="text-right p-4 text-sm font-semibold text-muted-foreground">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {boloes.map((bolao) => (
                          <tr
                            key={bolao.id}
                            className="border-b border-[rgba(2,207,81,0.1)] hover:bg-[#1C2432] transition-colors"
                          >
                            <td className="p-4">
                              <Badge className="bg-bolao-orange/20 text-bolao-orange border border-bolao-orange/50">
                                {boloesEspeciaisService.getNomeTemplate(bolao.tipo_especial)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-white">{bolao.nome}</p>
                                <p className="text-xs text-muted-foreground">Ano {bolao.ano}</p>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {bolao.concurso || '-'}
                            </td>
                            <td className="p-4">
                              <StatusBadge status={bolao.status} />
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {new Date(bolao.data_sorteio).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="text-sm text-white">
                                    {bolao.quantidade_cotas - bolao.cotas_disponiveis} / {bolao.quantidade_cotas}
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                    <div
                                      className="bg-bolao-green h-1.5 rounded-full"
                                      style={{
                                        width: `${((bolao.quantidade_cotas - bolao.cotas_disponiveis) / bolao.quantidade_cotas) * 100}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAlterarVisibilidade(bolao.id, !bolao.visivel)}
                                  className="border-[rgba(2,207,81,0.5)] hover:bg-bolao-green/20"
                                  title={bolao.visivel ? "Ocultar" : "Mostrar"}
                                >
                                  {bolao.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExcluir(bolao.id, bolao.nome)}
                                  className="border-red-500/50 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            )}

            {tab === 'criar' && (
              <div className="space-y-6">
                <Card className="p-6 bg-[#111827] border-[rgba(2,207,81,0.5)]">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Escolha um Template
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setTemplateSelecionado(template.tipo_especial)}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                          templateSelecionado === template.tipo_especial
                            ? "border-bolao-green bg-bolao-green/10"
                            : "border-[rgba(2,207,81,0.3)] hover:border-bolao-green/50"
                        }`}
                      >
                        <div className="text-4xl mb-3">{template.icone}</div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          {template.nome_padrao}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.descricao_padrao}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge className="bg-bolao-green/20 text-bolao-green">
                            {template.tipo_loteria}
                          </Badge>
                          <Badge className="bg-bolao-orange/20 text-bolao-orange">
                            {template.dias_antecedencia_vendas} dias antecipação
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>

                  {templateSelecionado && (
                    <div className="mt-6 p-4 bg-bolao-green/10 border border-bolao-green/30 rounded-lg">
                      <p className="text-sm text-white">
                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                        Template selecionado: {boloesEspeciaisService.getNomeTemplate(templateSelecionado)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Implemente o formulário de criação aqui com os campos necessários
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {tab === 'config' && (
              <Card className="p-6 bg-[#111827] border-[rgba(2,207,81,0.5)]">
                <h2 className="text-xl font-bold text-white mb-4">
                  Configurações de Automação
                </h2>
                <p className="text-muted-foreground">
                  Configurações serão implementadas aqui
                </p>
              </Card>
            )}

            {tab === 'historico' && (
              <Card className="p-6 bg-[#111827] border-[rgba(2,207,81,0.5)]">
                <h2 className="text-xl font-bold text-white mb-4">
                  Histórico de Automação
                </h2>
                <p className="text-muted-foreground">
                  Histórico será implementado aqui
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
