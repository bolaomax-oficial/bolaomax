import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Ban,
  Shield,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  listar,
  alterarStatus,
  excluir,
  type SubUsuario,
} from "@/services/subUsuariosService";
import { CriarSubUsuarioModal } from "@/components/CriarSubUsuarioModal";
import { EditarPermissoesModal } from "@/components/EditarPermissoesModal";

export default function SubUsuariosPage() {
  const [subUsuarios, setSubUsuarios] = useState<SubUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [subUsuarioEditando, setSubUsuarioEditando] = useState<SubUsuario | null>(null);

  // Carregar lista de sub-usuários
  useEffect(() => {
    carregarSubUsuarios();
  }, []);

  const carregarSubUsuarios = async () => {
    setLoading(true);
    const response = await listar();
    if (response.success && response.subUsuarios) {
      setSubUsuarios(response.subUsuarios);
    }
    setLoading(false);
  };

  // Filtrar sub-usuários
  const subUsuariosFiltrados = subUsuarios.filter((su) => {
    const matchSearch =
      su.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      su.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      su.cargo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "todos" || su.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Handlers
  const handleAlterarStatus = async (id: string, novoStatus: 'ativo' | 'inativo' | 'bloqueado') => {
    const response = await alterarStatus(id, novoStatus);
    if (response.success) {
      carregarSubUsuarios();
    } else {
      alert(response.error || "Erro ao alterar status");
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${nome}?`)) return;

    const response = await excluir(id);
    if (response.success) {
      carregarSubUsuarios();
    } else {
      alert(response.error || "Erro ao excluir sub-usuário");
    }
  };

  const handleEditar = (subUsuario: SubUsuario) => {
    setSubUsuarioEditando(subUsuario);
    setModalEditarAberto(true);
  };

  const handleCriadoComSucesso = () => {
    setModalCriarAberto(false);
    carregarSubUsuarios();
  };

  const handleEditadoComSucesso = () => {
    setModalEditarAberto(false);
    setSubUsuarioEditando(null);
    carregarSubUsuarios();
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const configs = {
      ativo: {
        color: "bg-bolao-green/20 text-bolao-green border-bolao-green/50",
        icon: CheckCircle2,
        label: "Ativo",
      },
      inativo: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/50",
        icon: PowerOff,
        label: "Inativo",
      },
      bloqueado: {
        color: "bg-red-500/20 text-red-400 border-red-500/50",
        icon: XCircle,
        label: "Bloqueado",
      },
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-bolao-green" />
              Sub-Usuários
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie membros da equipe e suas permissões
            </p>
          </div>
          <Button
            onClick={() => setModalCriarAberto(true)}
            className="bg-bolao-green hover:bg-bolao-green/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Membro
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-bolao-green/20">
                <CheckCircle2 className="w-6 h-6 text-bolao-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-white">
                  {subUsuarios.filter((su) => su.status === "ativo").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gray-500/20">
                <PowerOff className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-white">
                  {subUsuarios.filter((su) => su.status === "inativo").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/20">
                <Ban className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
                <p className="text-2xl font-bold text-white">
                  {subUsuarios.filter((su) => su.status === "bloqueado").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-[#111827] border-[rgba(2,207,81,0.5)]">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1C2432] border border-[rgba(2,207,81,0.5)] rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-bolao-green"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "todos" ? "default" : "outline"}
                onClick={() => setStatusFilter("todos")}
                className={
                  statusFilter === "todos"
                    ? "bg-bolao-green hover:bg-bolao-green/90"
                    : "border-[rgba(2,207,81,0.5)] hover:bg-bolao-green/20"
                }
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "ativo" ? "default" : "outline"}
                onClick={() => setStatusFilter("ativo")}
                className={
                  statusFilter === "ativo"
                    ? "bg-bolao-green hover:bg-bolao-green/90"
                    : "border-[rgba(2,207,81,0.5)] hover:bg-bolao-green/20"
                }
              >
                Ativos
              </Button>
              <Button
                variant={statusFilter === "inativo" ? "default" : "outline"}
                onClick={() => setStatusFilter("inativo")}
                className={
                  statusFilter === "inativo"
                    ? "bg-bolao-green hover:bg-bolao-green/90"
                    : "border-[rgba(2,207,81,0.5)] hover:bg-bolao-green/20"
                }
              >
                Inativos
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-[#111827] border-[rgba(2,207,81,0.5)]">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-bolao-green" />
              </div>
            ) : subUsuariosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "todos"
                    ? "Nenhum sub-usuário encontrado"
                    : "Nenhum sub-usuário cadastrado"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-[rgba(2,207,81,0.3)]">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                      Nome
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                      Cargo
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                      Permissões
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subUsuariosFiltrados.map((subUsuario) => (
                    <tr
                      key={subUsuario.id}
                      className="border-b border-[rgba(2,207,81,0.1)] hover:bg-[#1C2432] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-bolao-green/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-bolao-green" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{subUsuario.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {subUsuario.telefone || "Sem telefone"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {subUsuario.email}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-bolao-orange/20 text-bolao-orange border border-bolao-orange/50">
                          {subUsuario.cargo}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={subUsuario.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(subUsuario.permissoes).slice(0, 3).map((modulo) => (
                            <Badge
                              key={modulo}
                              className="bg-bolao-green/20 text-bolao-green border border-bolao-green/50 text-xs"
                            >
                              {modulo}
                            </Badge>
                          ))}
                          {Object.keys(subUsuario.permissoes).length > 3 && (
                            <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/50 text-xs">
                              +{Object.keys(subUsuario.permissoes).length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditar(subUsuario)}
                            className="border-[rgba(2,207,81,0.5)] hover:bg-bolao-green/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {subUsuario.status === "ativo" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlterarStatus(subUsuario.id, "inativo")}
                              className="border-gray-500/50 hover:bg-gray-500/20"
                            >
                              <PowerOff className="w-4 h-4" />
                            </Button>
                          ) : subUsuario.status === "inativo" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlterarStatus(subUsuario.id, "ativo")}
                              className="border-bolao-green/50 hover:bg-bolao-green/20"
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlterarStatus(subUsuario.id, "ativo")}
                              className="border-bolao-green/50 hover:bg-bolao-green/20"
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExcluir(subUsuario.id, subUsuario.nome)}
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
      </div>

      {/* Modals */}
      <CriarSubUsuarioModal
        aberto={modalCriarAberto}
        onFechar={() => setModalCriarAberto(false)}
        onSucesso={handleCriadoComSucesso}
      />

      {subUsuarioEditando && (
        <EditarPermissoesModal
          aberto={modalEditarAberto}
          onFechar={() => {
            setModalEditarAberto(false);
            setSubUsuarioEditando(null);
          }}
          onSucesso={handleEditadoComSucesso}
          subUsuario={subUsuarioEditando}
        />
      )}
    </AdminLayout>
  );
}
