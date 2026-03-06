import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Shield, ChevronDown, ChevronUp } from "lucide-react";
import {
  criar,
  buscarRoles,
  checkboxesParaPermissoes,
  MODULOS,
  type RoleTemplate,
  type Permissao,
} from "@/services/subUsuariosService";

interface CriarSubUsuarioModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

export function CriarSubUsuarioModal({
  aberto,
  onFechar,
  onSucesso,
}: CriarSubUsuarioModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [expandedModulos, setExpandedModulos] = useState<string[]>([]);

  // Form data
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [permissoes, setPermissoes] = useState<{ [key: string]: boolean }>({});

  // Carregar roles templates
  useEffect(() => {
    if (aberto) {
      carregarRoles();
    }
  }, [aberto]);

  const carregarRoles = async () => {
    setLoadingRoles(true);
    const response = await buscarRoles();
    if (response.success && response.roles) {
      setRoles(response.roles);
    }
    setLoadingRoles(false);
  };

  const handleAplicarTemplate = (template: RoleTemplate) => {
    const novasPermissoes: { [key: string]: boolean } = {};

    // Marcar todas as permissões do template
    template.permissoes.forEach((perm: Permissao) => {
      const key = `${perm.modulo}.${perm.permissao}`;
      novasPermissoes[key] = true;
    });

    setPermissoes(novasPermissoes);

    // Expandir todos os módulos para visualizar
    setExpandedModulos(MODULOS.map((m) => m.id));
  };

  const toggleModulo = (moduloId: string) => {
    setExpandedModulos((prev) =>
      prev.includes(moduloId)
        ? prev.filter((id) => id !== moduloId)
        : [...prev, moduloId]
    );
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setPermissoes((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senha || !cargo) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const permissoesArray = checkboxesParaPermissoes(permissoes);

    if (permissoesArray.length === 0) {
      alert("Selecione pelo menos uma permissão");
      return;
    }

    setLoading(true);

    const response = await criar({
      nome,
      email,
      senha,
      cargo,
      telefone: telefone || undefined,
      permissoes: permissoesArray,
    });

    setLoading(false);

    if (response.success) {
      // Reset form
      setNome("");
      setEmail("");
      setSenha("");
      setCargo("");
      setTelefone("");
      setPermissoes({});
      setExpandedModulos([]);
      onSucesso();
    } else {
      alert(response.error || "Erro ao criar sub-usuário");
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-[#111827] border-[rgba(2,207,81,0.5)] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-bolao-green" />
            Adicionar Membro da Equipe
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados e defina as permissões de acesso
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Dados Básicos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="bg-[#1C2432] border-[rgba(2,207,81,0.5)] text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1C2432] border-[rgba(2,207,81,0.5)] text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-[#1C2432] border-[rgba(2,207,81,0.5)] text-white"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="bg-[#1C2432] border-[rgba(2,207,81,0.5)] text-white"
                  required
                  placeholder="Ex: Gerente, Atendente..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="telefone">Telefone (opcional)</Label>
                <Input
                  id="telefone"
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="bg-[#1C2432] border-[rgba(2,207,81,0.5)] text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Templates Rápidos (Opcional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Clique em um template para preencher as permissões automaticamente
            </p>

            {loadingRoles ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-bolao-green" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    type="button"
                    variant="outline"
                    onClick={() => handleAplicarTemplate(role)}
                    className="border-[rgba(2,207,81,0.5)] hover:bg-bolao-green/20 h-auto py-3 flex flex-col items-start"
                  >
                    <span className="font-semibold">{role.nome}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {role.descricao}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Permissões */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Permissões Específicas *
            </h3>

            <div className="space-y-2">
              {MODULOS.map((modulo) => {
                const isExpanded = expandedModulos.includes(modulo.id);
                const permissoesDoModulo = modulo.permissoes.filter(
                  (p) => permissoes[`${modulo.id}.${p}`]
                );

                return (
                  <div
                    key={modulo.id}
                    className="border border-[rgba(2,207,81,0.3)] rounded-lg overflow-hidden"
                  >
                    {/* Header do módulo */}
                    <button
                      type="button"
                      onClick={() => toggleModulo(modulo.id)}
                      className="w-full flex items-center justify-between p-4 bg-[#1C2432] hover:bg-[#232B3A] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">
                          {modulo.nome}
                        </span>
                        {permissoesDoModulo.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-bolao-green/20 text-bolao-green">
                            {permissoesDoModulo.length} selecionada
                            {permissoesDoModulo.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    {/* Checkboxes */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-[#111827]">
                        {modulo.permissoes.map((permissao) => {
                          const key = `${modulo.id}.${permissao}`;
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <Checkbox
                                id={key}
                                checked={permissoes[key] || false}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(key, checked as boolean)
                                }
                                className="border-[rgba(2,207,81,0.5)] data-[state=checked]:bg-bolao-green"
                              />
                              <Label
                                htmlFor={key}
                                className="text-sm text-white capitalize cursor-pointer"
                              >
                                {permissao}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onFechar}
              disabled={loading}
              className="border-[rgba(2,207,81,0.5)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-bolao-green hover:bg-bolao-green/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Sub-Usuário"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
