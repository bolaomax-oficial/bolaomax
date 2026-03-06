/**
 * Script para criar database e popular com dados de teste
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar ao database
const db = new Database('bolaomax.db');
db.pragma('foreign_keys = ON');

console.log('🚀 Iniciando setup do database...\n');

// 1. Executar migrations
console.log('📋 Aplicando migrations...');
const migrationSQL = fs.readFileSync(
  path.join(__dirname, '../migrations/0000_init_schema.sql'),
  'utf-8'
);

// Executar cada statement separadamente
const statements = migrationSQL
  .split('--> statement-breakpoint')
  .map(s => s.trim())
  .filter(s => s.length > 0);

for (const statement of statements) {
  try {
    db.exec(statement);
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      console.error('❌ Erro ao executar statement:', error.message);
    }
  }
}

console.log('✅ Migrations aplicadas\n');

// 2. Criar usuários de teste
console.log('👥 Criando usuários de teste...');

const adminId = crypto.randomUUID();
const userId = crypto.randomUUID();

// Hash simples para teste (em produção, usar bcrypt)
const hashPassword = (pass: string) => {
  return crypto.createHash('sha256').update(pass).digest('hex');
};

const users = [
  {
    id: adminId,
    name: 'Admin BolãoMax',
    email: 'admin@bolaomax.com',
    passwordHash: hashPassword('admin123'),
    cpf: '111.111.111-11',
    telefone: '(11) 99999-9999',
    saldo: 1000.00,
    role: 'admin',
    status: 'active',
    emailVerified: 1,
    criadoEm: new Date().toISOString(),
  },
  {
    id: userId,
    name: 'Usuário Teste',
    email: 'usuario@teste.com',
    passwordHash: hashPassword('123456'),
    cpf: '222.222.222-22',
    telefone: '(11) 98888-8888',
    saldo: 50.00,
    role: 'user',
    status: 'active',
    emailVerified: 1,
    criadoEm: new Date().toISOString(),
  },
];

const insertUser = db.prepare(`
  INSERT INTO users (
    id, name, email, password_hash, cpf, telefone, 
    saldo, role, status, email_verified, criado_em, atualizado_em
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const user of users) {
  try {
    insertUser.run(
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.cpf,
      user.telefone,
      user.saldo,
      user.role,
      user.status,
      user.emailVerified,
      user.criadoEm,
      user.criadoEm
    );
    console.log(`  ✓ ${user.name} (${user.email})`);
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
      console.log(`  ⊘ ${user.email} já existe`);
    } else {
      console.error(`  ✗ Erro: ${error.message}`);
    }
  }
}

console.log('✅ Usuários criados\n');

// 3. Criar bolões de teste
console.log('🎰 Criando bolões de teste...');

const boloes = [
  {
    id: crypto.randomUUID(),
    nome: 'Mega-Sena da Virada 2026',
    descricao: 'Bolão especial para o maior prêmio do ano!',
    tipo: 'megasena',
    concurso: 2700,
    status: 'aberto',
    numerosDezenas: JSON.stringify([3, 7, 12, 23, 34, 45, 52, 58]),
    quantidadeCotas: 100,
    cotasDisponiveis: 75,
    valorCota: 25.00,
    dataAbertura: new Date().toISOString(),
    dataFechamento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dataSorteio: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    premiado: 0,
    valorPremio: 0,
    criadoPor: adminId,
    aprovado: 1,
    visualizacoes: 0,
    criadoEm: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    nome: 'Lotofácil - Bolão Rápido',
    descricao: 'Sorteio de amanhã, participe!',
    tipo: 'lotofacil',
    concurso: 3100,
    status: 'aberto',
    numerosDezenas: JSON.stringify([1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 20, 22, 23, 25]),
    quantidadeCotas: 50,
    cotasDisponiveis: 30,
    valorCota: 10.00,
    dataAbertura: new Date().toISOString(),
    dataFechamento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    dataSorteio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    premiado: 0,
    valorPremio: 0,
    criadoPor: adminId,
    aprovado: 1,
    visualizacoes: 45,
    criadoEm: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    nome: 'Quina - Cotas Baratas',
    descricao: 'Apenas R$ 5 por cota',
    tipo: 'quina',
    concurso: 6400,
    status: 'aberto',
    numerosDezenas: JSON.stringify([5, 15, 25, 35, 45, 50, 60]),
    quantidadeCotas: 40,
    cotasDisponiveis: 40,
    valorCota: 5.00,
    dataAbertura: new Date().toISOString(),
    dataFechamento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    dataSorteio: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    premiado: 0,
    valorPremio: 0,
    criadoPor: adminId,
    aprovado: 1,
    visualizacoes: 12,
    criadoEm: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    nome: 'Mega-Sena - Bolão Fechado (Teste)',
    descricao: 'Bolão já fechado para testes',
    tipo: 'megasena',
    concurso: 2699,
    status: 'fechado',
    numerosDezenas: JSON.stringify([8, 14, 21, 28, 35, 42]),
    quantidadeCotas: 20,
    cotasDisponiveis: 0,
    valorCota: 30.00,
    dataAbertura: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dataFechamento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dataSorteio: new Date().toISOString(),
    premiado: 0,
    valorPremio: 0,
    criadoPor: adminId,
    aprovado: 1,
    visualizacoes: 120,
    criadoEm: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const insertBolao = db.prepare(`
  INSERT INTO boloes (
    id, nome, descricao, tipo, concurso, status, 
    numeros_dezenas, quantidade_cotas, cotas_disponiveis, valor_cota,
    data_abertura, data_fechamento, data_sorteio,
    premiado, valor_premio, criado_por, aprovado, visualizacoes,
    criado_em, atualizado_em
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const bolao of boloes) {
  try {
    insertBolao.run(
      bolao.id,
      bolao.nome,
      bolao.descricao,
      bolao.tipo,
      bolao.concurso,
      bolao.status,
      bolao.numerosDezenas,
      bolao.quantidadeCotas,
      bolao.cotasDisponiveis,
      bolao.valorCota,
      bolao.dataAbertura,
      bolao.dataFechamento,
      bolao.dataSorteio,
      bolao.premiado,
      bolao.valorPremio,
      bolao.criadoPor,
      bolao.aprovado,
      bolao.visualizacoes,
      bolao.criadoEm,
      bolao.criadoEm
    );
    console.log(`  ✓ ${bolao.nome}`);
  } catch (error: any) {
    console.error(`  ✗ Erro: ${error.message}`);
  }
}

console.log('✅ Bolões criados\n');

// Estatísticas finais
const stats = {
  users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
  boloes: db.prepare('SELECT COUNT(*) as count FROM boloes').get(),
  tables: db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get(),
};

console.log('📊 Estatísticas do Database:');
console.log(`  • Tabelas: ${(stats.tables as any).count}`);
console.log(`  • Usuários: ${(stats.users as any).count}`);
console.log(`  • Bolões: ${(stats.boloes as any).count}`);
console.log('');
console.log('✅ Setup completo!\n');

console.log('👤 Credenciais de teste:');
console.log('  Admin:');
console.log('    Email: admin@bolaomax.com');
console.log('    Senha: admin123');
console.log('');
console.log('  Usuário:');
console.log('    Email: usuario@teste.com');
console.log('    Senha: 123456');
console.log('');

db.close();
