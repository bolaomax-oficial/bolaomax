/**
 * BolãoMax — Serviço de Bolões
 * CRUD completo com SQL nativo (SQLite dev / PostgreSQL prod)
 */

import { rawDb, dialect } from '../database/connection.js';
import { randomUUID }     from 'crypto';

// ── helpers SQL ──────────────────────────────────────────────

function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

async function run(sql, params = []) {
  if (!rawDb) return;
  if (dialect === 'sqlite') rawDb.prepare(sql).run(...params);
  else await rawDb.query(sql, params);
}

async function one(sql, params = []) {
  if (!rawDb) return null;
  if (dialect === 'sqlite') return rawDb.prepare(sql).get(...params) ?? null;
  const { rows } = await rawDb.query(sql, params);
  return rows[0] ?? null;
}

async function all(sql, params = []) {
  if (!rawDb) return [];
  if (dialect === 'sqlite') return rawDb.prepare(sql).all(...params);
  const { rows } = await rawDb.query(sql, params);
  return rows;
}

// ── helpers de formato ────────────────────────────────────────

function parseBolao(b) {
  if (!b) return null;
  return {
    ...b,
    premiado:    b.premiado    === 1 || b.premiado    === true,
    aprovado:    b.aprovado    === 1 || b.aprovado    === true,
    visivel:     b.visivel     === 1 || b.visivel     === true,
    cotasVendidas: (b.quantidade_cotas ?? 0) - (b.cotas_disponiveis ?? 0),
    percentualVendido: b.quantidade_cotas
      ? Math.round(((b.quantidade_cotas - b.cotas_disponiveis) / b.quantidade_cotas) * 100)
      : 0,
  };
}

// ── LISTAR (público) ──────────────────────────────────────────

export async function listarBoloes({ status = 'aberto', tipo, page = 1, limit = 20, search } = {}) {
  const offset = (page - 1) * limit;
  const conditions = ['1=1'];
  const params     = [];
  let i = 1;

  if (status && status !== 'todos') {
    conditions.push(`b.status = ${ph(i++)}`);
    params.push(status);
  }
  if (tipo && tipo !== 'todos') {
    conditions.push(`b.tipo = ${ph(i++)}`);
    params.push(tipo);
  }
  if (search) {
    conditions.push(`(b.nome LIKE ${ph(i)} OR b.descricao LIKE ${ph(i + 1)})`);
    params.push(`%${search}%`, `%${search}%`);
    i += 2;
  }

  const where = conditions.join(' AND ');
  const countSql = `SELECT COUNT(*) as n FROM boloes b WHERE ${where}`;
  const listSql  = `
    SELECT b.*, u.name as criador_nome
    FROM boloes b
    LEFT JOIN users u ON u.id = b.criado_por
    WHERE ${where}
    ORDER BY b.criado_em DESC
    LIMIT ${ph(i)} OFFSET ${ph(i + 1)}
  `;

  params.push(limit, offset);

  const [countRow, rows] = await Promise.all([
    one(countSql,  params.slice(0, params.length - 2)),
    all(listSql,   params),
  ]);

  const total = Number(countRow?.n ?? countRow?.count ?? 0);

  return {
    boloes:     rows.map(parseBolao),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ── BUSCAR POR ID ─────────────────────────────────────────────

export async function buscarBolaoPorId(id) {
  const b = await one(`
    SELECT b.*, u.name as criador_nome
    FROM boloes b
    LEFT JOIN users u ON u.id = b.criado_por
    WHERE b.id = ${ph(1)}
  `, [id]);
  return parseBolao(b);
}

// ── CRIAR ─────────────────────────────────────────────────────

export async function criarBolao({
  nome, descricao = '', tipo, concurso,
  numerosDezenas = '[]', quantidadeCotas, valorCota,
  dataAbertura, dataFechamento, dataSorteio,
  valorPremio = 0, criadoPor,
}) {
  if (!nome || !tipo || !quantidadeCotas || !valorCota)
    throw new Error('Campos obrigatórios: nome, tipo, quantidadeCotas, valorCota');

  const id  = randomUUID();
  const now = new Date().toISOString();

  await run(`
    INSERT INTO boloes
      (id, nome, descricao, tipo, concurso, status,
       numeros_dezenas, quantidade_cotas, cotas_disponiveis,
       valor_cota, data_abertura, data_fechamento, data_sorteio,
       premiado, valor_premio, criado_por, aprovado,
       visualizacoes, compartilhamentos, visivel,
       criado_em, atualizado_em)
    VALUES
      (${ph(1)},${ph(2)},${ph(3)},${ph(4)},${ph(5)},'aberto',
       ${ph(6)},${ph(7)},${ph(8)},
       ${ph(9)},${ph(10)},${ph(11)},${ph(12)},
       0,${ph(13)},${ph(14)},1,
       0,0,1,
       ${ph(15)},${ph(16)})
  `, [
    id, nome, descricao, tipo, concurso ?? null,
    typeof numerosDezenas === 'string' ? numerosDezenas : JSON.stringify(numerosDezenas),
    Number(quantidadeCotas),
    Number(quantidadeCotas),  // cotas_disponiveis = quantidade_cotas ao criar
    Number(valorCota),
    dataAbertura  ?? now,
    dataFechamento ?? new Date(Date.now() + 7 * 86_400_000).toISOString(),
    dataSorteio    ?? new Date(Date.now() + 7 * 86_400_000).toISOString(),
    Number(valorPremio),
    criadoPor ?? null,
    now,
    now,
  ]);

  return buscarBolaoPorId(id);
}

// ── ATUALIZAR ─────────────────────────────────────────────────

export async function atualizarBolao(id, campos) {
  const allowed = [
    'nome','descricao','tipo','concurso','status',
    'numeros_dezenas','quantidade_cotas','cotas_disponiveis',
    'valor_cota','data_abertura','data_fechamento','data_sorteio',
    'premiado','valor_premio','faixa_premio','acertos',
    'aprovado','visivel','metadados',
  ];

  const sets   = [];
  const params = [];
  let i = 1;

  for (const [k, v] of Object.entries(campos)) {
    const col = k.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase → snake_case
    if (!allowed.includes(col) && !allowed.includes(k)) continue;
    sets.push(`${allowed.includes(col) ? col : k} = ${ph(i++)}`);
    params.push(typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
  }

  if (!sets.length) return buscarBolaoPorId(id);

  sets.push(`atualizado_em = ${ph(i++)}`);
  params.push(new Date().toISOString(), id);

  await run(`UPDATE boloes SET ${sets.join(', ')} WHERE id = ${ph(i)}`, params);
  return buscarBolaoPorId(id);
}

// ── ALTERAR STATUS ────────────────────────────────────────────

export async function alterarStatus(id, status) {
  const validos = ['aberto','fechado','em_andamento','encerrado','cancelado'];
  if (!validos.includes(status))
    throw new Error(`Status inválido. Use: ${validos.join(', ')}`);

  await run(
    `UPDATE boloes SET status = ${ph(1)}, atualizado_em = ${ph(2)} WHERE id = ${ph(3)}`,
    [status, new Date().toISOString(), id]
  );
  return buscarBolaoPorId(id);
}

// ── EXCLUIR ───────────────────────────────────────────────────

export async function excluirBolao(id) {
  const b = await buscarBolaoPorId(id);
  if (!b) throw new Error('Bolão não encontrado');
  if (b.status === 'em_andamento')
    throw new Error('Não é possível excluir bolão em andamento');

  await run(`DELETE FROM boloes WHERE id = ${ph(1)}`, [id]);
  return { success: true };
}

// ── DUPLICAR ──────────────────────────────────────────────────

export async function duplicarBolao(id) {
  const original = await buscarBolaoPorId(id);
  if (!original) throw new Error('Bolão não encontrado');

  return criarBolao({
    nome:            `${original.nome} (cópia)`,
    descricao:       original.descricao,
    tipo:            original.tipo,
    concurso:        null,
    numerosDezenas:  original.numeros_dezenas ?? '[]',
    quantidadeCotas: original.quantidade_cotas,
    valorCota:       original.valor_cota,
    valorPremio:     original.valor_premio,
    criadoPor:       original.criado_por,
  });
}

// ── STATS ─────────────────────────────────────────────────────

export async function estatisticas() {
  const rows = await all(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'aberto'       THEN 1 ELSE 0 END) as abertos,
      SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) as em_andamento,
      SUM(CASE WHEN status = 'encerrado'    THEN 1 ELSE 0 END) as encerrados,
      SUM(CASE WHEN status = 'fechado'      THEN 1 ELSE 0 END) as fechados,
      SUM(quantidade_cotas - cotas_disponiveis) as total_cotas_vendidas,
      SUM((quantidade_cotas - cotas_disponiveis) * valor_cota) as receita_total
    FROM boloes
  `);
  return rows[0] ?? {};
}

// ── SEED (dados iniciais) ─────────────────────────────────────

export async function seedBoloes(adminId) {
  const existentes = await one('SELECT COUNT(*) as n FROM boloes');
  if (Number(existentes?.n) > 0) return { seeded: false };

  const now    = new Date().toISOString();
  const em7d   = new Date(Date.now() + 7  * 86_400_000).toISOString();
  const em14d  = new Date(Date.now() + 14 * 86_400_000).toISOString();
  const em3d   = new Date(Date.now() + 3  * 86_400_000).toISOString();

  const seed = [
    { nome:'Mega-Sena Especial',   tipo:'megasena',  concurso:2856, cotas:100, valorCota:50,  premio:550_000_000, vendidas:35, fechamento:em7d  },
    { nome:'Lotofácil Semanal',    tipo:'lotofacil', concurso:3245, cotas:50,  valorCota:25,  premio:3_500_000,   vendidas:22, fechamento:em7d  },
    { nome:'Quina Premium',         tipo:'quina',     concurso:6523, cotas:80,  valorCota:30,  premio:10_000_000,  vendidas:68, fechamento:em3d  },
    { nome:'Timemania Gold',        tipo:'timemania', concurso:2100, cotas:120, valorCota:15,  premio:5_000_000,   vendidas:55, fechamento:em14d },
    { nome:'Dupla Sena Relâmpago',  tipo:'duplasena', concurso:2512, cotas:60,  valorCota:20,  premio:1_200_000,   vendidas:20, fechamento:em7d  },
    { nome:'Lotomania Semanal',     tipo:'lotomania', concurso:2456, cotas:70,  valorCota:20,  premio:2_000_000,   vendidas:30, fechamento:em14d },
  ];

  for (const s of seed) {
    const id = randomUUID();
    await run(`
      INSERT INTO boloes
        (id,nome,descricao,tipo,concurso,status,
         numeros_dezenas,quantidade_cotas,cotas_disponiveis,
         valor_cota,data_abertura,data_fechamento,data_sorteio,
         premiado,valor_premio,criado_por,aprovado,
         visualizacoes,compartilhamentos,visivel,criado_em,atualizado_em)
      VALUES
        (${ph(1)},${ph(2)},${ph(3)},${ph(4)},${ph(5)},'aberto',
         '[]',${ph(6)},${ph(7)},
         ${ph(8)},${ph(9)},${ph(10)},${ph(11)},
         0,${ph(12)},${ph(13)},1,
         0,0,1,${ph(14)},${ph(15)})
    `, [
      id, s.nome, `Bolão ${s.nome} — participe agora!`,
      s.tipo, s.concurso,
      s.cotas, s.cotas - s.vendidas,
      s.valorCota, now, s.fechamento, s.fechamento,
      s.premio, adminId ?? null, now, now,
    ]);
  }
  return { seeded: true, total: seed.length };
}
