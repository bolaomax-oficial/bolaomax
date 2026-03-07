-- BolãoMax — Migration 0001: Schema inicial
-- Compatível com PostgreSQL (Railway)

-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USUÁRIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  cpf           TEXT,
  telefone      TEXT,
  saldo         REAL        DEFAULT 0,
  avatar        TEXT,
  role          TEXT        DEFAULT 'user',   -- user | admin
  status        TEXT        DEFAULT 'active', -- active | suspended | deleted
  email_verified     BOOLEAN DEFAULT FALSE,
  telefone_verified  BOOLEAN DEFAULT FALSE,
  criado_em     TIMESTAMP   DEFAULT NOW(),
  atualizado_em TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- SESSÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMP   NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  criado_em   TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- BOLÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS boloes (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT    NOT NULL,
  descricao           TEXT,
  tipo                TEXT    NOT NULL,   -- megasena | lotofacil | quina | ...
  concurso            INTEGER,
  status              TEXT    DEFAULT 'aberto',  -- aberto | fechado | sorteado | finalizado
  numeros_dezenas     TEXT    NOT NULL,           -- JSON array
  quantidade_cotas    INTEGER NOT NULL,
  cotas_disponiveis   INTEGER NOT NULL,
  valor_cota          REAL    NOT NULL,
  data_abertura       TIMESTAMP NOT NULL,
  data_fechamento     TIMESTAMP NOT NULL,
  data_sorteio        TIMESTAMP NOT NULL,
  premiado            BOOLEAN DEFAULT FALSE,
  valor_premio        REAL    DEFAULT 0,
  faixa_premio        TEXT,
  acertos             INTEGER,
  criado_por          UUID    NOT NULL REFERENCES users(id),
  aprovado            BOOLEAN DEFAULT FALSE,
  aprovado_por        UUID,
  visualizacoes       INTEGER DEFAULT 0,
  compartilhamentos   INTEGER DEFAULT 0,
  metadados           TEXT,
  criado_em           TIMESTAMP DEFAULT NOW(),
  atualizado_em       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PARTICIPAÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS participacoes (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  bolao_id              UUID    NOT NULL REFERENCES boloes(id)  ON DELETE CASCADE,
  user_id               UUID    NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  quantidade_cotas      INTEGER NOT NULL DEFAULT 1,
  valor_total           REAL    NOT NULL,
  status                TEXT    DEFAULT 'ativa',  -- ativa | cancelada | premiada
  pagamento_confirmado  BOOLEAN DEFAULT FALSE,
  transacao_id          TEXT,
  premiado              BOOLEAN DEFAULT FALSE,
  valor_premio          REAL    DEFAULT 0,
  premio_recebido       BOOLEAN DEFAULT FALSE,
  criado_em             TIMESTAMP DEFAULT NOW(),
  atualizado_em         TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TRANSAÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id                        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID    NOT NULL REFERENCES users(id),
  tipo                      TEXT    NOT NULL,    -- compra_cota | premio | recarga | saque
  valor                     REAL    NOT NULL,
  status                    TEXT    NOT NULL,    -- pendente | aprovado | rejeitado | cancelado
  metodo_pagamento          TEXT,
  pagseguro_transaction_id  TEXT,
  pagseguro_status          TEXT,
  bolao_id                  UUID,
  participacao_id           UUID,
  descricao                 TEXT,
  metadados                 TEXT,
  criado_em                 TIMESTAMP DEFAULT NOW(),
  atualizado_em             TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- RESULTADOS DE SORTEIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS lottery_results (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             TEXT    NOT NULL,
  concurso         INTEGER NOT NULL,
  data             TEXT    NOT NULL,
  dezenas          TEXT    NOT NULL,  -- JSON array
  dezenas2         TEXT,
  premios          TEXT    NOT NULL,  -- JSON array
  acumulado        BOOLEAN DEFAULT FALSE,
  valor_acumulado  REAL    DEFAULT 0,
  proximo_concurso TEXT,
  time_coracao     TEXT,
  mes_da_sorte     TEXT,
  metadados        TEXT,
  criado_em        TIMESTAMP DEFAULT NOW(),
  atualizado_em    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CALENDAR / SORTEIOS PROGRAMADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS lottery_draws (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo            TEXT    NOT NULL,
  data            TEXT    NOT NULL,
  hora            TEXT,
  dia_semana      TEXT,
  concurso        INTEGER,
  premio_estimado REAL,
  local           TEXT,
  observacoes     TEXT,
  especial        BOOLEAN DEFAULT FALSE,
  criado_em       TIMESTAMP DEFAULT NOW(),
  atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- NOTIFICAÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo      TEXT    NOT NULL,
  titulo    TEXT    NOT NULL,
  mensagem  TEXT    NOT NULL,
  link      TEXT,
  lida      BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- LOGS DO SISTEMA
-- ============================================================
CREATE TABLE IF NOT EXISTS system_logs (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nivel      TEXT    NOT NULL,
  categoria  TEXT    NOT NULL,
  mensagem   TEXT    NOT NULL,
  detalhes   TEXT,
  usuario_id UUID,
  ip         TEXT,
  user_agent TEXT,
  criado_em  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo       TEXT    NOT NULL,
  categoria  TEXT,
  acao       TEXT,
  label      TEXT,
  valor      REAL,
  usuario_id UUID,
  sessao_id  UUID,
  dispositivo TEXT,
  navegador  TEXT,
  origem     TEXT,
  metadados  TEXT,
  criado_em  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CARRINHO
-- ============================================================
CREATE TABLE IF NOT EXISTS carrinho_itens (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bolao_id         UUID    NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  quantidade_cotas INTEGER NOT NULL DEFAULT 1,
  valor_unitario   REAL    NOT NULL,
  valor_total      REAL    NOT NULL,
  expira_em        TIMESTAMP NOT NULL,
  status           TEXT    DEFAULT 'reservado',
  criado_em        TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CONFIGURAÇÕES DO SISTEMA
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id            SERIAL  PRIMARY KEY,
  categoria     TEXT    NOT NULL,
  chave         TEXT    NOT NULL,
  valor         TEXT    NOT NULL,
  tipo          TEXT    NOT NULL DEFAULT 'text',
  descricao     TEXT,
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(categoria, chave)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id      ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token        ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_boloes_status         ON boloes(status);
CREATE INDEX IF NOT EXISTS idx_boloes_tipo           ON boloes(tipo);
CREATE INDEX IF NOT EXISTS idx_participacoes_user    ON participacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_bolao   ON participacoes(bolao_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user     ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_user         ON carrinho_itens(user_id);
CREATE INDEX IF NOT EXISTS idx_configs_categoria     ON configuracoes_sistema(categoria);

-- ============================================================
-- SEED INICIAL — usuário admin + configurações base
-- ============================================================

-- senha: admin123  (bcrypt hash)
INSERT INTO users (name, email, password_hash, role, status, email_verified)
VALUES (
  'Administrador',
  'admin@bolaomax.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  'admin', 'active', TRUE
) ON CONFLICT (email) DO NOTHING;

-- configurações padrão
INSERT INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao)
VALUES
  ('geral',     'nome_site',        'BolãoMax',                   'text',  'Nome do site'),
  ('geral',     'slogan',           'Sua sorte em grande estilo',  'text',  'Slogan do site'),
  ('geral',     'email_contato',    'contato@bolaomax.com',        'email', 'Email de contato'),
  ('aparencia', 'cor_primaria',     '#02CF51',                     'color', 'Cor principal (verde)'),
  ('aparencia', 'cor_secundaria',   '#FFA200',                     'color', 'Cor secundária (laranja)'),
  ('aparencia', 'tema_padrao',      'dark',                        'text',  'Tema padrão')
ON CONFLICT (categoria, chave) DO NOTHING;
