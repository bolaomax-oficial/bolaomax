CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento" text NOT NULL,
	"user_id" uuid,
	"bolao_id" uuid,
	"propriedades" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boloes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"tipo" text NOT NULL,
	"concurso" integer,
	"status" text DEFAULT 'aberto',
	"numeros_dezenas" text NOT NULL,
	"quantidade_cotas" integer NOT NULL,
	"cotas_disponiveis" integer NOT NULL,
	"valor_cota" real NOT NULL,
	"data_abertura" timestamp NOT NULL,
	"data_fechamento" timestamp NOT NULL,
	"data_sorteio" timestamp NOT NULL,
	"premiado" boolean DEFAULT false,
	"valor_premio" real DEFAULT 0,
	"faixa_premio" text,
	"acertos" integer,
	"criado_por" uuid NOT NULL,
	"aprovado" boolean DEFAULT false,
	"aprovado_por" uuid,
	"visualizacoes" integer DEFAULT 0,
	"compartilhamentos" integer DEFAULT 0,
	"metadados" text,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lottery_draws" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"concurso" integer NOT NULL,
	"data_sorteio" timestamp NOT NULL,
	"numeros_sorteados" text NOT NULL,
	"premio_total" real,
	"ganhadores" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lottery_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bolao_id" uuid NOT NULL,
	"draw_id" uuid NOT NULL,
	"acertos" integer NOT NULL,
	"faixa_premio" text,
	"valor_premio" real,
	"processado" boolean DEFAULT false,
	"processado_em" timestamp,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"mensagem" text NOT NULL,
	"lida" boolean DEFAULT false,
	"bolao_id" uuid,
	"metadados" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "participacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bolao_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"quantidade_cotas" integer DEFAULT 1 NOT NULL,
	"valor_total" real NOT NULL,
	"status" text DEFAULT 'ativa',
	"pagamento_confirmado" boolean DEFAULT false,
	"transacao_id" text,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"criado_em" timestamp DEFAULT now(),
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nivel" text NOT NULL,
	"modulo" text NOT NULL,
	"mensagem" text NOT NULL,
	"user_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"metadados" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"valor" real NOT NULL,
	"saldo_anterior" real NOT NULL,
	"saldo_novo" real NOT NULL,
	"metodo_pagamento" text,
	"status_pagamento" text DEFAULT 'pendente',
	"transacao_externa_id" text,
	"bolao_id" uuid,
	"participacao_id" uuid,
	"descricao" text,
	"metadados" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"cpf" text,
	"telefone" text,
	"saldo" real DEFAULT 0,
	"avatar" text,
	"role" text DEFAULT 'user',
	"status" text DEFAULT 'active',
	"email_verified" boolean DEFAULT false,
	"telefone_verified" boolean DEFAULT false,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "boloes" ADD CONSTRAINT "boloes_criado_por_users_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lottery_results" ADD CONSTRAINT "lottery_results_bolao_id_boloes_id_fk" FOREIGN KEY ("bolao_id") REFERENCES "public"."boloes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lottery_results" ADD CONSTRAINT "lottery_results_draw_id_lottery_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."lottery_draws"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_bolao_id_boloes_id_fk" FOREIGN KEY ("bolao_id") REFERENCES "public"."boloes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;