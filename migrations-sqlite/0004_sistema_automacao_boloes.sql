-- ============================================================
-- Migration 0004: Sistema de Automação de Bolões
-- Data: 2026-02-22
-- Descrição: Adiciona funcionalidades de:
--   - Bolões especiais (Mega da Virada, Quina São João, etc)
--   - Configurações de automação (ativação diária 22h)
--   - Histórico de ativações/encerramentos
--   - Controle de visibilidade por data/hora
-- ============================================================

-- ============================================================
-- 1. TABELA: configuracoes_automacao
-- Configurações globais do sistema de automação
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracoes_automacao (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Configuração de ativação diária
  horario_ativacao_diaria TEXT NOT NULL DEFAULT '22:00', -- HH:MM formato 24h
  ativar_novos_boloes_automaticamente INTEGER DEFAULT 1, -- 1 = sim, 0 = não
  
  -- Configuração de encerramento
  encerrar_automaticamente INTEGER DEFAULT 1, -- 1 = sim, 0 = não
  minutos_antecedencia_encerramento INTEGER DEFAULT 120, -- 2 horas antes do sorteio
  
  -- Configuração de visibilidade
  ocultar_boloes_expirados INTEGER DEFAULT 1, -- 1 = sim (apenas ocultar), 0 = não
  mostrar_apenas_data_vigente INTEGER DEFAULT 1, -- 1 = sim, 0 = não (exceto especiais)
  
  -- Notificações
  notificar_encerramento INTEGER DEFAULT 1,
  notificar_ativacao INTEGER DEFAULT 1,
  
  -- Metadados
  ultima_execucao_cron TEXT, -- timestamp última execução
  proxima_execucao_cron TEXT, -- timestamp próxima execução
  status_sistema TEXT DEFAULT 'ativo', -- ativo, pausado, manutencao
  
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT INTO configuracoes_automacao (
  id, 
  horario_ativacao_diaria,
  ativar_novos_boloes_automaticamente,
  encerrar_automaticamente,
  status_sistema
) VALUES (
  'config-automacao-001',
  '22:00',
  1,
  1,
  'ativo'
);

-- ============================================================
-- 2. TABELA: boloes_especiais
-- Bolões especiais (Mega da Virada, Quina São João, etc)
-- ============================================================
CREATE TABLE IF NOT EXISTS boloes_especiais (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Identificação
  tipo_especial TEXT NOT NULL, -- mega_virada, quina_sao_joao, lotofacil_independencia, dupla_pascoa, federal_natal
  nome TEXT NOT NULL,
  descricao TEXT,
  ano INTEGER NOT NULL,
  
  -- Tipo de loteria base
  tipo_loteria TEXT NOT NULL, -- megasena, quina, lotofacil, duplasena, federal
  concurso TEXT, -- número do concurso especial
  
  -- Configurações do bolão
  numeros_dezenas TEXT NOT NULL, -- JSON array das dezenas
  quantidade_cotas INTEGER NOT NULL,
  cotas_disponiveis INTEGER NOT NULL,
  valor_cota REAL NOT NULL,
  valor_total_bolao REAL NOT NULL,
  
  -- Datas importantes
  data_inicio_vendas TEXT NOT NULL, -- quando começa a vender (venda antecipada)
  data_fim_vendas TEXT NOT NULL, -- quando encerra
  data_sorteio TEXT NOT NULL,
  
  -- Status e visibilidade
  status TEXT DEFAULT 'aguardando', -- aguardando, aberto, encerrado, sorteado
  visivel INTEGER DEFAULT 0, -- 1 = visível, 0 = oculto
  ativo INTEGER DEFAULT 1, -- 1 = ativo, 0 = desativado (soft delete)
  
  -- Premiação
  premiado INTEGER DEFAULT 0,
  valor_premio REAL DEFAULT 0,
  faixa_premio TEXT,
  acertos INTEGER,
  
  -- Metadados
  metadados TEXT, -- JSON com info adicional (tags, imagens, etc)
  visualizacoes INTEGER DEFAULT 0,
  compartilhamentos INTEGER DEFAULT 0,
  
  -- Auditoria
  criado_por TEXT NOT NULL,
  aprovado_por TEXT,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (criado_por) REFERENCES users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_boloes_especiais_tipo ON boloes_especiais(tipo_especial);
CREATE INDEX IF NOT EXISTS idx_boloes_especiais_status ON boloes_especiais(status);
CREATE INDEX IF NOT EXISTS idx_boloes_especiais_visivel ON boloes_especiais(visivel);
CREATE INDEX IF NOT EXISTS idx_boloes_especiais_ano ON boloes_especiais(ano);
CREATE INDEX IF NOT EXISTS idx_boloes_especiais_data_sorteio ON boloes_especiais(data_sorteio);

-- ============================================================
-- 3. TABELA: historico_automacao_boloes
-- Log de todas as ações automáticas (encerramento, ativação)
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_automacao_boloes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Tipo de ação
  tipo_acao TEXT NOT NULL, -- ativacao_diaria, encerramento_automatico, visibilidade_alterada
  descricao TEXT,
  
  -- Bolão afetado
  bolao_id TEXT,
  bolao_tipo TEXT, -- normal, especial
  tipo_loteria TEXT,
  
  -- Detalhes da ação
  status_anterior TEXT,
  status_novo TEXT,
  data_hora_execucao TEXT DEFAULT CURRENT_TIMESTAMP,
  executado_por TEXT DEFAULT 'sistema', -- sistema, admin-user-id
  
  -- Resultado
  sucesso INTEGER DEFAULT 1, -- 1 = sucesso, 0 = falha
  mensagem_erro TEXT,
  
  -- Metadados
  metadados TEXT, -- JSON com detalhes adicionais
  
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_historico_tipo_acao ON historico_automacao_boloes(tipo_acao);
CREATE INDEX IF NOT EXISTS idx_historico_bolao_id ON historico_automacao_boloes(bolao_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_automacao_boloes(data_hora_execucao);

-- ============================================================
-- 4. TABELA: templates_boloes_especiais
-- Templates pré-definidos para criação rápida
-- ============================================================
CREATE TABLE IF NOT EXISTS templates_boloes_especiais (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  tipo_especial TEXT NOT NULL UNIQUE, -- mega_virada, quina_sao_joao, etc
  nome_padrao TEXT NOT NULL,
  descricao_padrao TEXT,
  tipo_loteria TEXT NOT NULL,
  
  -- Configurações padrão
  dias_antecedencia_vendas INTEGER DEFAULT 30, -- quantos dias antes do sorteio começa a vender
  dias_antecedencia_encerramento INTEGER DEFAULT 0, -- quantos dias antes do sorteio encerra
  horas_antecedencia_encerramento INTEGER DEFAULT 2, -- quantas horas antes do sorteio encerra
  
  -- Metadados do template
  icone TEXT,
  cor_tema TEXT,
  tags TEXT, -- JSON array
  
  ativo INTEGER DEFAULT 1,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Inserir templates pré-definidos
INSERT INTO templates_boloes_especiais (tipo_especial, nome_padrao, descricao_padrao, tipo_loteria, dias_antecedencia_vendas, icone, cor_tema) VALUES
  ('mega_virada', 'Mega-Sena da Virada', 'Bolão especial do maior prêmio do ano', 'megasena', 60, '🎊', '#02CF51'),
  ('quina_sao_joao', 'Quina de São João', 'Bolão especial de São João', 'quina', 45, '🎉', '#FFA200'),
  ('lotofacil_independencia', 'Lotofácil da Independência', 'Bolão especial da Independência', 'lotofacil', 45, '🇧🇷', '#009739'),
  ('dupla_pascoa', 'Dupla Sena de Páscoa', 'Bolão especial de Páscoa', 'duplasena', 30, '🐰', '#FF69B4'),
  ('federal_natal', 'Federal de Natal', 'Bolão especial de Natal', 'federal', 30, '🎄', '#C41E3A');

-- ============================================================
-- 5. ALTERAR TABELA: boloes (adicionar campos de automação)
-- Adiciona campos para controle de encerramento/ativação automática
-- ============================================================
ALTER TABLE boloes ADD COLUMN encerramento_automatico INTEGER DEFAULT 1; -- 1 = sim, 0 = não
ALTER TABLE boloes ADD COLUMN encerrado_automaticamente INTEGER DEFAULT 0; -- flag se foi encerrado pelo sistema
ALTER TABLE boloes ADD COLUMN data_encerramento_real TEXT; -- quando foi realmente encerrado
ALTER TABLE boloes ADD COLUMN visivel INTEGER DEFAULT 1; -- 1 = visível, 0 = oculto
ALTER TABLE boloes ADD COLUMN tipo_bolao TEXT DEFAULT 'normal'; -- normal, especial
ALTER TABLE boloes ADD COLUMN bolao_especial_id TEXT; -- FK para boloes_especiais (se for especial)

-- Índices para visibilidade
CREATE INDEX IF NOT EXISTS idx_boloes_visivel ON boloes(visivel);
CREATE INDEX IF NOT EXISTS idx_boloes_tipo_bolao ON boloes(tipo_bolao);
CREATE INDEX IF NOT EXISTS idx_boloes_data_fechamento ON boloes(data_fechamento);
CREATE INDEX IF NOT EXISTS idx_boloes_status ON boloes(status);

-- ============================================================
-- 6. VIEW: v_boloes_ativos_vigentes
-- View que retorna apenas bolões visíveis e vigentes
-- ============================================================
CREATE VIEW IF NOT EXISTS v_boloes_ativos_vigentes AS
SELECT 
  b.*,
  CASE 
    WHEN b.tipo_bolao = 'especial' THEN be.nome
    ELSE b.nome
  END as nome_exibicao,
  CASE 
    WHEN b.tipo_bolao = 'especial' THEN be.tipo_especial
    ELSE NULL
  END as tipo_especial
FROM boloes b
LEFT JOIN boloes_especiais be ON b.bolao_especial_id = be.id
WHERE 
  b.visivel = 1 
  AND b.status IN ('aberto', 'em_andamento')
  AND datetime(b.data_fechamento) > datetime('now')
ORDER BY 
  CASE 
    WHEN b.tipo_bolao = 'especial' THEN 0
    ELSE 1
  END,
  b.data_sorteio ASC;

-- ============================================================
-- 7. VIEW: v_boloes_especiais_detalhados
-- View com informações completas dos bolões especiais
-- ============================================================
CREATE VIEW IF NOT EXISTS v_boloes_especiais_detalhados AS
SELECT 
  be.*,
  COUNT(DISTINCT p.user_id) as total_participantes,
  SUM(CASE WHEN p.status = 'ativo' THEN 1 ELSE 0 END) as cotas_vendidas,
  (be.quantidade_cotas - be.cotas_disponiveis) as cotas_ocupadas,
  ROUND((CAST(be.quantidade_cotas - be.cotas_disponiveis AS REAL) / be.quantidade_cotas) * 100, 2) as percentual_preenchimento
FROM boloes_especiais be
LEFT JOIN participacoes p ON p.bolao_id = be.id
WHERE be.ativo = 1
GROUP BY be.id
ORDER BY be.data_sorteio ASC;

-- ============================================================
-- 8. TRIGGER: atualizar_timestamp_configuracoes
-- ============================================================
CREATE TRIGGER IF NOT EXISTS trg_update_configuracoes_automacao
AFTER UPDATE ON configuracoes_automacao
BEGIN
  UPDATE configuracoes_automacao 
  SET atualizado_em = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- ============================================================
-- 9. TRIGGER: atualizar_timestamp_boloes_especiais
-- ============================================================
CREATE TRIGGER IF NOT EXISTS trg_update_boloes_especiais
AFTER UPDATE ON boloes_especiais
BEGIN
  UPDATE boloes_especiais 
  SET atualizado_em = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- ============================================================
-- 10. TRIGGER: registrar_mudanca_status_bolao
-- Registra automaticamente no histórico quando status do bolão muda
-- ============================================================
CREATE TRIGGER IF NOT EXISTS trg_log_status_bolao
AFTER UPDATE OF status ON boloes
WHEN OLD.status != NEW.status
BEGIN
  INSERT INTO historico_automacao_boloes (
    tipo_acao,
    descricao,
    bolao_id,
    bolao_tipo,
    tipo_loteria,
    status_anterior,
    status_novo,
    executado_por,
    sucesso
  ) VALUES (
    'mudanca_status',
    'Status do bolão alterado de ' || OLD.status || ' para ' || NEW.status,
    NEW.id,
    NEW.tipo_bolao,
    NEW.tipo,
    OLD.status,
    NEW.status,
    COALESCE(NEW.aprovado_por, 'sistema'),
    1
  );
END;

-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

-- Criar índice composto para queries de listagem
CREATE INDEX IF NOT EXISTS idx_boloes_listing ON boloes(visivel, status, data_fechamento);

-- Inserir log de migração
INSERT INTO historico_automacao_boloes (
  tipo_acao,
  descricao,
  sucesso,
  executado_por
) VALUES (
  'migracao_sistema',
  'Migration 0004: Sistema de Automação de Bolões instalado com sucesso',
  1,
  'sistema'
);

-- ============================================================
-- RESUMO DA MIGRATION
-- ============================================================
-- Tabelas criadas:
--   ✓ configuracoes_automacao (1 registro inicial)
--   ✓ boloes_especiais (estrutura)
--   ✓ historico_automacao_boloes (logs)
--   ✓ templates_boloes_especiais (5 templates)
--
-- Tabelas alteradas:
--   ✓ boloes (6 novos campos)
--
-- Views criadas:
--   ✓ v_boloes_ativos_vigentes
--   ✓ v_boloes_especiais_detalhados
--
-- Triggers criados:
--   ✓ trg_update_configuracoes_automacao
--   ✓ trg_update_boloes_especiais
--   ✓ trg_log_status_bolao
--
-- Índices criados: 10+
-- ============================================================
