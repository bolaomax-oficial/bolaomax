-- ============================================================
-- MIGRATION: Sistema de Sub-Usuários e Permissões
-- Data: 22/02/2026
-- Descrição: Sistema completo de gerenciamento de equipe com RBAC
-- ============================================================

-- Tabela: sub_usuarios
-- Armazena membros da equipe com acesso ao painel admin
CREATE TABLE IF NOT EXISTS sub_usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  telefone TEXT,
  avatar TEXT,
  cargo TEXT, -- Ex: "Gerente", "Atendente", "Analista"
  status TEXT DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo', 'bloqueado')),
  criado_por TEXT NOT NULL, -- ID do admin que criou
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso DATETIME,
  notas TEXT, -- Observações do admin sobre o sub-usuário
  FOREIGN KEY (criado_por) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela: permissoes_sub_usuario
-- Define o que cada sub-usuário pode fazer
CREATE TABLE IF NOT EXISTS permissoes_sub_usuario (
  id TEXT PRIMARY KEY,
  sub_usuario_id TEXT NOT NULL,
  modulo TEXT NOT NULL, -- 'boloes', 'usuarios', 'financeiro', 'saques', 'relatorios', 'suporte', 'whatsapp'
  permissao TEXT NOT NULL, -- 'visualizar', 'criar', 'editar', 'excluir', 'aprovar'
  ativo BOOLEAN DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_usuario_id) REFERENCES sub_usuarios(id) ON DELETE CASCADE,
  UNIQUE(sub_usuario_id, modulo, permissao)
);

-- Tabela: roles_pre_definidas (opcional - templates de permissões)
CREATE TABLE IF NOT EXISTS roles_pre_definidas (
  id TEXT PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL, -- 'Gerente', 'Atendente', 'Analista Financeiro'
  descricao TEXT,
  permissoes TEXT NOT NULL, -- JSON com array de permissões
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: logs_acesso_sub_usuario
-- Auditoria de acessos e ações
CREATE TABLE IF NOT EXISTS logs_acesso_sub_usuario (
  id TEXT PRIMARY KEY,
  sub_usuario_id TEXT NOT NULL,
  acao TEXT NOT NULL, -- 'login', 'logout', 'visualizou_boloes', 'editou_bolao', etc
  modulo TEXT, -- Qual módulo foi acessado
  detalhes TEXT, -- JSON com informações adicionais
  ip_address TEXT,
  user_agent TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_usuario_id) REFERENCES sub_usuarios(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sub_usuarios_email ON sub_usuarios(email);
CREATE INDEX IF NOT EXISTS idx_sub_usuarios_status ON sub_usuarios(status);
CREATE INDEX IF NOT EXISTS idx_permissoes_sub_usuario ON permissoes_sub_usuario(sub_usuario_id, modulo);
CREATE INDEX IF NOT EXISTS idx_logs_sub_usuario ON logs_acesso_sub_usuario(sub_usuario_id, criado_em);

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- View: Sub-usuários com resumo de permissões
CREATE VIEW IF NOT EXISTS v_sub_usuarios_resumo AS
SELECT 
  su.id,
  su.nome,
  su.email,
  su.cargo,
  su.status,
  su.criado_em,
  su.ultimo_acesso,
  COUNT(DISTINCT p.modulo) as total_modulos_permitidos,
  GROUP_CONCAT(DISTINCT p.modulo) as modulos
FROM sub_usuarios su
LEFT JOIN permissoes_sub_usuario p ON su.id = p.sub_usuario_id AND p.ativo = 1
GROUP BY su.id;

-- ============================================================
-- DADOS SEED - Roles Pré-definidas
-- ============================================================

INSERT OR IGNORE INTO roles_pre_definidas (id, nome, descricao, permissoes) VALUES
(
  'role-gerente',
  'Gerente Geral',
  'Acesso completo exceto exclusão de dados críticos',
  '[
    {"modulo":"boloes","permissoes":["visualizar","criar","editar"]},
    {"modulo":"usuarios","permissoes":["visualizar","editar"]},
    {"modulo":"financeiro","permissoes":["visualizar"]},
    {"modulo":"saques","permissoes":["visualizar","aprovar"]},
    {"modulo":"relatorios","permissoes":["visualizar"]},
    {"modulo":"suporte","permissoes":["visualizar","criar","editar"]},
    {"modulo":"whatsapp","permissoes":["visualizar","enviar"]}
  ]'
),
(
  'role-atendente',
  'Atendente',
  'Suporte ao cliente e visualização básica',
  '[
    {"modulo":"boloes","permissoes":["visualizar"]},
    {"modulo":"usuarios","permissoes":["visualizar"]},
    {"modulo":"suporte","permissoes":["visualizar","criar","editar"]},
    {"modulo":"whatsapp","permissoes":["visualizar","enviar"]}
  ]'
),
(
  'role-financeiro',
  'Analista Financeiro',
  'Gestão financeira e aprovação de saques',
  '[
    {"modulo":"financeiro","permissoes":["visualizar"]},
    {"modulo":"saques","permissoes":["visualizar","aprovar"]},
    {"modulo":"relatorios","permissoes":["visualizar"]},
    {"modulo":"usuarios","permissoes":["visualizar"]}
  ]'
),
(
  'role-operador',
  'Operador de Bolões',
  'Gerenciamento de bolões apenas',
  '[
    {"modulo":"boloes","permissoes":["visualizar","criar","editar"]},
    {"modulo":"usuarios","permissoes":["visualizar"]}
  ]'
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Atualizar campo atualizado_em automaticamente
CREATE TRIGGER IF NOT EXISTS trg_sub_usuarios_updated
AFTER UPDATE ON sub_usuarios
FOR EACH ROW
BEGIN
  UPDATE sub_usuarios 
  SET atualizado_em = datetime('now') 
  WHERE id = NEW.id;
END;

-- Log automático de mudanças de status
CREATE TRIGGER IF NOT EXISTS trg_sub_usuarios_status_log
AFTER UPDATE OF status ON sub_usuarios
FOR EACH ROW
WHEN OLD.status != NEW.status
BEGIN
  INSERT INTO logs_acesso_sub_usuario (id, sub_usuario_id, acao, detalhes)
  VALUES (
    lower(hex(randomblob(16))),
    NEW.id,
    'mudanca_status',
    json_object('status_anterior', OLD.status, 'status_novo', NEW.status)
  );
END;
