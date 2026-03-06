-- ============================================================
-- MIGRATION: Sistema de Carrinho com Timer
-- Data: 21/02/2026
-- Descrição: Adiciona carrinho temporário com reservas de 5min
-- ============================================================

-- Tabela: carrinho_itens
-- Armazena itens no carrinho com expiracao
CREATE TABLE IF NOT EXISTS carrinho_itens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bolao_id TEXT NOT NULL,
  quantidade_cotas INTEGER NOT NULL DEFAULT 1,
  valor_unitario REAL NOT NULL,
  valor_total REAL NOT NULL,
  expira_em DATETIME NOT NULL, -- 5 minutos após adicionar
  status TEXT DEFAULT 'reservado' CHECK(status IN ('reservado', 'expirado', 'comprado', 'cancelado')),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bolao_id) REFERENCES boloes(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_carrinho_user_id ON carrinho_itens(user_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_bolao_id ON carrinho_itens(bolao_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_status ON carrinho_itens(status);
CREATE INDEX IF NOT EXISTS idx_carrinho_expira_em ON carrinho_itens(expira_em);

-- Tabela: recarga_carteira
-- Histórico de adições de saldo na carteira
CREATE TABLE IF NOT EXISTS recarga_carteira (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  valor REAL NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK(forma_pagamento IN ('pix', 'credit_card', 'boleto')),
  gateway_transaction_id TEXT, -- ID da transação no Pagar.me
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'confirmado', 'cancelado', 'expirado')),
  qr_code TEXT, -- Para PIX
  qr_code_url TEXT, -- URL da imagem do QR Code
  boleto_url TEXT, -- URL do boleto
  expira_em DATETIME, -- Expiração do PIX/Boleto
  confirmado_em DATETIME,
  metadata TEXT, -- JSON com dados extras
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recarga_user_id ON recarga_carteira(user_id);
CREATE INDEX IF NOT EXISTS idx_recarga_status ON recarga_carteira(status);
CREATE INDEX IF NOT EXISTS idx_recarga_gateway_id ON recarga_carteira(gateway_transaction_id);

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- View: Carrinho Ativo por Usuário
CREATE VIEW IF NOT EXISTS v_carrinho_ativo AS
SELECT 
  c.id,
  c.user_id,
  c.bolao_id,
  b.nome as bolao_nome,
  b.tipo_loteria,
  c.quantidade_cotas,
  c.valor_unitario,
  c.valor_total,
  c.expira_em,
  -- Tempo restante em segundos
  CAST((julianday(c.expira_em) - julianday('now')) * 86400 AS INTEGER) as segundos_restantes,
  c.status,
  c.criado_em
FROM carrinho_itens c
JOIN boloes b ON c.bolao_id = b.id
WHERE c.status = 'reservado' 
  AND c.expira_em > datetime('now');

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: Atualizar status para expirado automaticamente
-- (Complementar ao serviço de limpeza)
CREATE TRIGGER IF NOT EXISTS trg_carrinho_expiracao
AFTER UPDATE ON carrinho_itens
FOR EACH ROW
WHEN NEW.expira_em < datetime('now') AND NEW.status = 'reservado'
BEGIN
  UPDATE carrinho_itens 
  SET status = 'expirado' 
  WHERE id = NEW.id;
END;

-- ============================================================
-- DADOS SEED (OPCIONAL)
-- ============================================================

-- Nenhum seed necessário - tabelas vazias inicialmente
