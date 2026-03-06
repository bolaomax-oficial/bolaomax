import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  atualizarPermissoes,
  checkboxesParaPermissoes,
  permissoesParaCheckboxes,
  MODULOS,
  type SubUsuario,
} from "@/services/subUsuariosService";

interface EditarPermissoesModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
  subUsuario: SubUsuario;
}

export function EditarPermissoesModal({
  aberto,
  onFechar,
  onSucesso,
  subUsuario,
}: EditarPermissoesModalProps) {
  const [loading, setLoading] = useState(false);
  const [expandedModulos, setExpandedModulos] = useState<string[]>([]);
  const [permissoes, setPermissoes] = useState<{ [key: string]: boolean }>({});

  // Carregar permissões atuais quando abrir o modal
  useEffect(() => {
    if (aberto && subUsuario) {
      const checkboxes = permissoesParaCheckboxes(subUsuario.permissoes);
      setPermissoes(checkboxes);

      // Expandir módulos que têm permissões
      const modulosComPermissoes = Object.keys(subUsuario.permissoes);
      setExpandedModulos(modulosComPermissoes);
    }
  }, [aberto, subUsuario]);

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

    const permissoesArray = checkboxesParaPermissoes(permissoes);

    if (permissoesArray.length === 0) {
      alert("Selecione pelo menos uma permissão");
      return;
    }

    setLoading(true);

    const response = await atualizarPermissoes(subUsuario.id, permissoesArray);

    setLoading(false);

    if (response.success) {
      onSucesso();
    } else {
      alert(response.error || "Erro ao atualizar permissões");
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="bg-[#111827] border-[rgba(2,207,81,0.5)] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-bolao-green" />
            Editar Permissões - {subUsuario.nome}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            <div className="space-y-1">
              <p>{subUsuario.email}</p>
              <p className="text-bolao-orange">{subUsuario.cargo}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Permissões */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Permissões de Acesso
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
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
