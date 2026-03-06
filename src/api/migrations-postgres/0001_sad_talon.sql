CREATE TABLE "audit_financeira" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"user_id" uuid,
	"admin_id" uuid,
	"dados_antes" text,
	"dados_depois" text,
	"ip_address" text,
	"user_agent" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "config_financeira" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taxa_saque_percentual" real DEFAULT 0,
	"taxa_saque_fixa" real DEFAULT 0,
	"taxa_saque_minima" real DEFAULT 2,
	"saque_minimo" real DEFAULT 20,
	"saque_maximo" real DEFAULT 10000,
	"saque_diario_maximo" real DEFAULT 5000,
	"prazo_aprovacao_saque" integer DEFAULT 24,
	"prazo_processamento_saque" integer DEFAULT 2,
	"fundo_aportes_automaticos" boolean DEFAULT true,
	"fundo_percentual_reserva" real DEFAULT 150,
	"alerta_fundo_baixo" boolean DEFAULT true,
	"alerta_fundo_baixo_percentual" real DEFAULT 20,
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fundo_registro" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saldo_disponivel" real DEFAULT 0 NOT NULL,
	"saldo_bloqueado" real DEFAULT 0 NOT NULL,
	"saldo_total" real DEFAULT 0 NOT NULL,
	"limite_minimo" real DEFAULT 5000,
	"limite_ideal" real DEFAULT 20000,
	"total_utilizado" real DEFAULT 0,
	"total_reposto" real DEFAULT 0,
	"ultima_atualizacao" timestamp DEFAULT now(),
	"historico" text
);
--> statement-breakpoint
CREATE TABLE "repasses_gateway" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway_id" text,
	"valor_bruto" real NOT NULL,
	"valor_taxas" real NOT NULL,
	"valor_liquido" real NOT NULL,
	"periodo_inicio" timestamp NOT NULL,
	"periodo_fim" timestamp NOT NULL,
	"status" text DEFAULT 'pendente',
	"data_previsao" timestamp,
	"data_recebimento" timestamp,
	"data_conciliacao" timestamp,
	"transacoes" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reservas_fundo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bolao_id" uuid NOT NULL,
	"valor_reservado" real NOT NULL,
	"valor_utilizado" real DEFAULT 0,
	"valor_reposto" real DEFAULT 0,
	"status" text DEFAULT 'reservado',
	"data_reserva" timestamp DEFAULT now(),
	"data_utilizacao" timestamp,
	"data_reposicao" timestamp,
	"codigo_registro" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "saques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"valor_solicitado" real NOT NULL,
	"valor_taxa" real DEFAULT 0,
	"valor_liquido" real NOT NULL,
	"tipo_conta" text,
	"chave_pix" text,
	"banco" text,
	"agencia" text,
	"conta" text,
	"tipo_conta2" text,
	"status" text DEFAULT 'solicitado',
	"motivo_recusa" text,
	"comprovante" text,
	"data_solicitacao" timestamp DEFAULT now(),
	"data_aprovacao" timestamp,
	"data_processamento" timestamp,
	"data_conclusao" timestamp,
	"aprovado_por" uuid,
	"processado_por" uuid
);
