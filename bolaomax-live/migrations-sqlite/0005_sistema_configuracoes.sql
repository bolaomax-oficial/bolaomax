-- Migration 0005: Sistema de Configurações
-- Data: 2026-02-22

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL,
    chave TEXT NOT NULL,
    valor TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'text', -- text, number, boolean, color, url, email, json
    descricao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria, chave)
);

-- Tabela de logs de alterações
CREATE TABLE IF NOT EXISTS logs_configuracoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL,
    chave TEXT NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario_id TEXT NOT NULL,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_configs_categoria ON configuracoes_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_configs_chave ON configuracoes_sistema(chave);
CREATE INDEX IF NOT EXISTS idx_logs_configs_data ON logs_configuracoes(data_hora DESC);

-- ============================================
-- CONFIGURAÇÕES PADRÃO
-- ============================================

-- CATEGORIA: GERAL
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('geral', 'nome_site', 'BolãoMax', 'text', 'Nome do site exibido no título e rodapé'),
('geral', 'slogan', 'Sua sorte em grande estilo', 'text', 'Slogan do site'),
('geral', 'email_contato', 'contato@bolaomax.com', 'email', 'Email de contato principal'),
('geral', 'telefone_contato', '(11) 99999-9999', 'text', 'Telefone de contato'),
('geral', 'whatsapp_numero', '5511999999999', 'text', 'Número do WhatsApp (com DDI)'),
('geral', 'endereco', 'São Paulo, SP - Brasil', 'text', 'Endereço da empresa'),
('geral', 'cnpj', '00.000.000/0000-00', 'text', 'CNPJ da empresa'),
('geral', 'razao_social', 'BolãoMax Loterias LTDA', 'text', 'Razão social da empresa'),
('geral', 'modo_manutencao', 'false', 'boolean', 'Ativa modo de manutenção (usuários não conseguem acessar)'),
('geral', 'mensagem_manutencao', 'Site em manutenção. Voltamos em breve!', 'text', 'Mensagem exibida durante manutenção');

-- CATEGORIA: APARÊNCIA
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('aparencia', 'cor_primaria', '#02CF51', 'color', 'Cor principal do site (verde)'),
('aparencia', 'cor_secundaria', '#FFA200', 'color', 'Cor secundária (laranja)'),
('aparencia', 'cor_fundo_card', '#111827', 'color', 'Cor de fundo dos cards'),
('aparencia', 'logo_url', '/logo.png', 'url', 'URL da logo principal'),
('aparencia', 'logo_mini_url', '/logo-mini.png', 'url', 'URL da logo mini (mobile)'),
('aparencia', 'favicon_url', '/favicon.ico', 'url', 'URL do favicon'),
('aparencia', 'tema_padrao', 'dark', 'text', 'Tema padrão (dark ou light)'),
('aparencia', 'mostrar_tema_toggle', 'true', 'boolean', 'Permitir usuários alternarem tema'),
('aparencia', 'banner_home_url', '/banner-home.jpg', 'url', 'Banner da página inicial'),
('aparencia', 'background_tipo', 'solid', 'text', 'Tipo de background (solid, gradient, image)');

-- CATEGORIA: PAGAMENTOS
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('pagamentos', 'pagar_me_ativo', 'true', 'boolean', 'Pagar.me ativo'),
('pagamentos', 'pagar_me_api_key', '', 'text', 'Chave de API do Pagar.me'),
('pagamentos', 'pagar_me_encryption_key', '', 'text', 'Chave de criptografia do Pagar.me'),
('pagamentos', 'pagar_me_modo_teste', 'true', 'boolean', 'Modo de teste do Pagar.me'),
('pagamentos', 'pix_ativo', 'true', 'boolean', 'Pagamento via PIX ativo'),
('pagamentos', 'cartao_credito_ativo', 'true', 'boolean', 'Pagamento via cartão ativo'),
('pagamentos', 'boleto_ativo', 'false', 'boolean', 'Pagamento via boleto ativo'),
('pagamentos', 'valor_minimo_deposito', '10', 'number', 'Valor mínimo de depósito (R$)'),
('pagamentos', 'valor_maximo_deposito', '10000', 'number', 'Valor máximo de depósito (R$)'),
('pagamentos', 'taxa_pix', '0', 'number', 'Taxa PIX em % (0 = sem taxa)');

-- CATEGORIA: INTEGRACOES
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('integracoes', 'thelotter_ativo', 'false', 'boolean', 'TheLotter integração ativa'),
('integracoes', 'thelotter_affiliate_id', '', 'text', 'ID de afiliado TheLotter'),
('integracoes', 'thelotter_commission_rate', '25', 'number', 'Taxa de comissão (%)'),
('integracoes', 'smtp_ativo', 'true', 'boolean', 'SMTP para emails ativo'),
('integracoes', 'smtp_host', 'smtp.gmail.com', 'text', 'Host SMTP'),
('integracoes', 'smtp_port', '587', 'number', 'Porta SMTP'),
('integracoes', 'smtp_user', '', 'email', 'Usuário SMTP'),
('integracoes', 'smtp_password', '', 'text', 'Senha SMTP'),
('integracoes', 'smtp_from_name', 'BolãoMax', 'text', 'Nome do remetente'),
('integracoes', 'smtp_from_email', 'noreply@bolaomax.com', 'email', 'Email do remetente'),
('integracoes', 'sms_ativo', 'false', 'boolean', 'SMS ativo'),
('integracoes', 'sms_provider', 'twilio', 'text', 'Provedor SMS (twilio, zenvia)'),
('integracoes', 'sms_api_key', '', 'text', 'API Key do provedor SMS'),
('integracoes', 'google_analytics_id', '', 'text', 'Google Analytics ID'),
('integracoes', 'facebook_pixel_id', '', 'text', 'Facebook Pixel ID'),
('integracoes', 'whatsapp_api_url', '', 'url', 'URL da API do WhatsApp'),
('integracoes', 'whatsapp_api_token', '', 'text', 'Token da API do WhatsApp');

-- CATEGORIA: SEGURANCA
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('seguranca', 'two_factor_obrigatorio', 'false', 'boolean', '2FA obrigatório para admins'),
('seguranca', 'senha_min_caracteres', '8', 'number', 'Mínimo de caracteres na senha'),
('seguranca', 'senha_exigir_maiusculas', 'true', 'boolean', 'Exigir letras maiúsculas'),
('seguranca', 'senha_exigir_minusculas', 'true', 'boolean', 'Exigir letras minúsculas'),
('seguranca', 'senha_exigir_numeros', 'true', 'boolean', 'Exigir números'),
('seguranca', 'senha_exigir_especiais', 'false', 'boolean', 'Exigir caracteres especiais'),
('seguranca', 'tentativas_login_max', '5', 'number', 'Máximo de tentativas de login'),
('seguranca', 'tempo_bloqueio_minutos', '30', 'number', 'Tempo de bloqueio após falhas (min)'),
('seguranca', 'sessao_timeout_horas', '24', 'number', 'Tempo de expiração da sessão (horas)'),
('seguranca', 'ip_whitelist', '[]', 'json', 'IPs autorizados (admin) - JSON array');

-- CATEGORIA: BOLOES
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('boloes', 'valor_minimo_cota', '5', 'number', 'Valor mínimo de cota (R$)'),
('boloes', 'valor_maximo_cota', '500', 'number', 'Valor máximo de cota (R$)'),
('boloes', 'cotas_minimas_bolao', '2', 'number', 'Mínimo de cotas por bolão'),
('boloes', 'cotas_maximas_bolao', '100', 'number', 'Máximo de cotas por bolão'),
('boloes', 'permitir_boloes_privados', 'true', 'boolean', 'Permitir criação de bolões privados'),
('boloes', 'comissao_bolao_publico', '10', 'number', 'Comissão em bolões públicos (%)'),
('boloes', 'comissao_bolao_privado', '5', 'number', 'Comissão em bolões privados (%)'),
('boloes', 'horas_antes_encerrar', '2', 'number', 'Horas antes do sorteio para encerrar'),
('boloes', 'permitir_compra_multiplas_cotas', 'true', 'boolean', 'Permitir comprar múltiplas cotas'),
('boloes', 'max_cotas_por_usuario', '10', 'number', 'Máximo de cotas por usuário no mesmo bolão');

-- CATEGORIA: SAQUES
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('saques', 'valor_minimo_saque', '50', 'number', 'Valor mínimo de saque (R$)'),
('saques', 'valor_maximo_saque', '50000', 'number', 'Valor máximo de saque (R$)'),
('saques', 'taxa_saque', '0', 'number', 'Taxa de saque em % (0 = sem taxa)'),
('saques', 'prazo_processamento_dias', '3', 'number', 'Prazo para processar saques (dias úteis)'),
('saques', 'limite_saques_dia', '3', 'number', 'Limite de saques por dia por usuário'),
('saques', 'permitir_saque_fds', 'false', 'boolean', 'Permitir saques em fins de semana'),
('saques', 'pix_automatico', 'false', 'boolean', 'Saques via PIX automáticos (sem aprovação manual)');

-- CATEGORIA: NOTIFICACOES
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('notificacoes', 'email_novo_usuario', 'true', 'boolean', 'Email boas-vindas para novos usuários'),
('notificacoes', 'email_confirmacao_compra', 'true', 'boolean', 'Email confirmação de compra'),
('notificacoes', 'email_resultado_sorteio', 'true', 'boolean', 'Email com resultado do sorteio'),
('notificacoes', 'email_premio_ganho', 'true', 'boolean', 'Email quando ganhar prêmio'),
('notificacoes', 'email_saque_aprovado', 'true', 'boolean', 'Email quando saque for aprovado'),
('notificacoes', 'sms_premio_ganho', 'false', 'boolean', 'SMS quando ganhar prêmio'),
('notificacoes', 'whatsapp_resultado_bolao', 'false', 'boolean', 'WhatsApp com resultado do bolão'),
('notificacoes', 'push_novos_boloes', 'true', 'boolean', 'Notificação push para novos bolões');

-- CATEGORIA: SEO
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('seo', 'meta_title', 'BolãoMax - Bolões de Loteria Online', 'text', 'Título da página (SEO)'),
('seo', 'meta_description', 'Participe de bolões de loteria online com segurança e praticidade. Mega-Sena, Quina, Lotofácil e muito mais!', 'text', 'Descrição meta (SEO)'),
('seo', 'meta_keywords', 'bolão, loteria, mega-sena, quina, lotofácil, online', 'text', 'Palavras-chave (SEO)'),
('seo', 'og_image', '/og-image.jpg', 'url', 'Imagem Open Graph (compartilhamento redes sociais)'),
('seo', 'twitter_card', 'summary_large_image', 'text', 'Tipo de card do Twitter'),
('seo', 'google_site_verification', '', 'text', 'Código verificação Google Search Console'),
('seo', 'robots_txt_allow', 'true', 'boolean', 'Permitir indexação pelos buscadores');

-- CATEGORIA: JURIDICO
INSERT OR IGNORE INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
('juridico', 'termos_uso_url', '/termos-de-uso', 'url', 'URL dos Termos de Uso'),
('juridico', 'politica_privacidade_url', '/politica-de-privacidade', 'url', 'URL da Política de Privacidade'),
('juridico', 'idade_minima', '18', 'number', 'Idade mínima para participar'),
('juridico', 'lgpd_ativo', 'true', 'boolean', 'Banner LGPD ativo'),
('juridico', 'cookie_policy_url', '/politica-de-cookies', 'url', 'URL da Política de Cookies');

-- Log inicial de criação
INSERT INTO logs_configuracoes (categoria, chave, valor_anterior, valor_novo, usuario_id, data_hora)
VALUES ('sistema', 'inicializacao', NULL, 'Configurações inicializadas', 'sistema-fundo-geral', CURRENT_TIMESTAMP);

-- Criação finalizada
SELECT 'Migration 0005 executada com sucesso!' as status;
