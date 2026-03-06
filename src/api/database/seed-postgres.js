/**
 * Seeds para PostgreSQL (Railway)
 * Popula database com dados iniciais
 */

import { db, schema } from './connection.js';
import crypto from 'crypto';

async function seed() {
  console.log('🌱 [SEED] Iniciando seeds...\n');

  try {
    // ============================================================
    // 1. CRIAR USUÁRIO ADMIN
    // ============================================================
    
    console.log('👤 [SEED] Criando usuário admin...');
    
    const adminId = crypto.randomUUID();
    const passwordHash = crypto.createHash('sha256').update('admin123').digest('hex');
    
    await db.insert(schema.users).values({
      id: adminId,
      name: 'Administrador',
      email: 'admin@bolaomax.com',
      passwordHash,
      role: 'admin',
      status: 'active',
      emailVerified: true,
    }).onConflictDoNothing();
    
    console.log('✅ Admin criado: admin@bolaomax.com / admin123');

    // ============================================================
    // 2. CRIAR USUÁRIO TESTE
    // ============================================================
    
    console.log('👤 [SEED] Criando usuário teste...');
    
    const userId = crypto.randomUUID();
    const userPasswordHash = crypto.createHash('sha256').update('123456').digest('hex');
    
    await db.insert(schema.users).values({
      id: userId,
      name: 'Usuário Teste',
      email: 'usuario@teste.com',
      passwordHash: userPasswordHash,
      role: 'user',
      status: 'active',
      saldo: 100.00,
    }).onConflictDoNothing();
    
    console.log('✅ Usuário criado: usuario@teste.com / 123456');

    // ============================================================
    // 3. CRIAR BOLÕES DE EXEMPLO
    // ============================================================
    
    console.log('🎲 [SEED] Criando bolões de exemplo...');
    
    const boloes = [
      {
        id: crypto.randomUUID(),
        nome: 'Mega da Virada 2024',
        descricao: 'Bolão especial de final de ano com premiação milionária',
        tipo: 'megasena',
        concurso: 2700,
        status: 'aberto',
        numerosDezenas: JSON.stringify([3, 7, 12, 23, 34, 45, 51, 58]),
        quantidadeCotas: 100,
        cotasDisponiveis: 75,
        valorCota: 50.00,
        dataAbertura: new Date('2024-12-01'),
        dataFechamento: new Date('2024-12-30'),
        dataSorteio: new Date('2024-12-31T20:00:00'),
        criadoPor: adminId,
        aprovado: true,
        aprovadoPor: adminId,
      },
      {
        id: crypto.randomUUID(),
        nome: 'Lotofácil Independência',
        descricao: 'Sorteio especial do dia da independência',
        tipo: 'lotofacil',
        concurso: 3000,
        status: 'aberto',
        numerosDezenas: JSON.stringify([1, 2, 3, 5, 6, 8, 9, 11, 13, 14, 15, 18, 20, 22, 25]),
        quantidadeCotas: 50,
        cotasDisponiveis: 20,
        valorCota: 30.00,
        dataAbertura: new Date('2024-09-01'),
        dataFechamento: new Date('2024-09-06'),
        dataSorteio: new Date('2024-09-07T20:00:00'),
        criadoPor: adminId,
        aprovado: true,
        aprovadoPor: adminId,
      },
      {
        id: crypto.randomUUID(),
        nome: 'Quina de São João',
        descricao: 'Bolão tradicional de São João',
        tipo: 'quina',
        concurso: 6500,
        status: 'aberto',
        numerosDezenas: JSON.stringify([15, 27, 38, 49, 62, 71, 80]),
        quantidadeCotas: 80,
        cotasDisponiveis: 45,
        valorCota: 25.00,
        dataAbertura: new Date('2024-06-01'),
        dataFechamento: new Date('2024-06-23'),
        dataSorteio: new Date('2024-06-24T20:00:00'),
        criadoPor: adminId,
        aprovado: true,
        aprovadoPor: adminId,
      },
      {
        id: crypto.randomUUID(),
        nome: 'Timemania Especial',
        descricao: 'Bolão especial Timemania com time do coração',
        tipo: 'timemania',
        concurso: 2000,
        status: 'aberto',
        numerosDezenas: JSON.stringify([5, 12, 23, 34, 45, 56, 67]),
        quantidadeCotas: 60,
        cotasDisponiveis: 30,
        valorCota: 20.00,
        dataAbertura: new Date('2024-11-01'),
        dataFechamento: new Date('2024-11-29'),
        dataSorteio: new Date('2024-11-30T20:00:00'),
        criadoPor: adminId,
        aprovado: true,
        aprovadoPor: adminId,
      },
    ];

    for (const bolao of boloes) {
      await db.insert(schema.boloes).values(bolao).onConflictDoNothing();
      console.log(`  ✅ ${bolao.nome}`);
    }

    console.log('\n🎉 [SEED] Seeds concluídos com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('  - 2 usuários criados');
    console.log('  - 4 bolões criados');
    console.log('\n🔐 Credenciais:');
    console.log('  Admin: admin@bolaomax.com / admin123');
    console.log('  User: usuario@teste.com / 123456');
    
  } catch (error) {
    console.error('❌ [SEED] Erro ao executar seeds:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seed };
