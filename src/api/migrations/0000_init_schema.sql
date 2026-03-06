CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`categoria` text,
	`acao` text,
	`label` text,
	`valor` real,
	`usuario_id` text,
	`sessao_id` text,
	`dispositivo` text,
	`navegador` text,
	`origem` text,
	`metadados` text,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `boloes` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`tipo` text NOT NULL,
	`concurso` integer,
	`status` text DEFAULT 'aberto',
	`numeros_dezenas` text NOT NULL,
	`quantidade_cotas` integer NOT NULL,
	`cotas_disponiveis` integer NOT NULL,
	`valor_cota` real NOT NULL,
	`data_abertura` text NOT NULL,
	`data_fechamento` text NOT NULL,
	`data_sorteio` text NOT NULL,
	`premiado` integer DEFAULT false,
	`valor_premio` real DEFAULT 0,
	`faixa_premio` text,
	`acertos` integer,
	`criado_por` text NOT NULL,
	`aprovado` integer DEFAULT false,
	`aprovado_por` text,
	`visualizacoes` integer DEFAULT 0,
	`compartilhamentos` integer DEFAULT 0,
	`metadados` text,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	`atualizado_em` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`criado_por`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lottery_draws` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`data` text NOT NULL,
	`hora` text,
	`dia_semana` text,
	`concurso` integer,
	`premio_estimado` real,
	`local` text,
	`observacoes` text,
	`especial` integer DEFAULT false,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	`atualizado_em` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `lottery_results` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`concurso` integer NOT NULL,
	`data` text NOT NULL,
	`dezenas` text NOT NULL,
	`dezenas2` text,
	`premios` text NOT NULL,
	`acumulado` integer DEFAULT false,
	`valor_acumulado` real DEFAULT 0,
	`proximo_concurso` text,
	`time_coracao` text,
	`mes_da_sorte` text,
	`metadados` text,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	`atualizado_em` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`mensagem` text NOT NULL,
	`link` text,
	`lida` integer DEFAULT false,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `participacoes` (
	`id` text PRIMARY KEY NOT NULL,
	`bolao_id` text NOT NULL,
	`user_id` text NOT NULL,
	`quantidade_cotas` integer DEFAULT 1 NOT NULL,
	`valor_total` real NOT NULL,
	`status` text DEFAULT 'ativa',
	`pagamento_confirmado` integer DEFAULT false,
	`transacao_id` text,
	`premiado` integer DEFAULT false,
	`valor_premio` real DEFAULT 0,
	`premio_recebido` integer DEFAULT false,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	`atualizado_em` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`bolao_id`) REFERENCES `boloes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`nivel` text NOT NULL,
	`categoria` text NOT NULL,
	`mensagem` text NOT NULL,
	`detalhes` text,
	`usuario_id` text,
	`ip` text,
	`user_agent` text,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tipo` text NOT NULL,
	`valor` real NOT NULL,
	`status` text NOT NULL,
	`metodo_pagamento` text,
	`pagseguro_transaction_id` text,
	`pagseguro_status` text,
	`bolao_id` text,
	`participacao_id` text,
	`descricao` text,
	`metadados` text,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	`atualizado_em` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`cpf` text,
	`telefone` text,
	`saldo` real DEFAULT 0,
	`avatar` text,
	`role` text DEFAULT 'user',
	`status` text DEFAULT 'active',
	`email_verified` integer DEFAULT false,
	`telefone_verified` integer DEFAULT false,
	`criado_em` text DEFAULT CURRENT_TIMESTAMP,
	`atualizado_em` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);