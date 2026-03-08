/**
 * BolãoMax — Rotas de Resultados de Loteria
 * Integração com a API pública da Caixa Econômica Federal
 * 
 * GET /api/resultados/:modalidade             — último resultado
 * GET /api/resultados/:modalidade/:concurso   — resultado por concurso
 * GET /api/resultados/recentes                — últimos resultados de todas as modalidades
 * POST /api/resultados/processar/:bolaoId     — processar resultado de um bolão (admin)
 */

import express from 'express';
import { rawDb, dialect } from '../database/connection.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── Helpers DB ───────────────────────────────────────────────

function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

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

async function run(sql, params = []) {
  if (!rawDb) throw new Error('DB não disponível');
  if (dialect === 'sqlite') return rawDb.prepare(sql).run(...params);
  return rawDb.query(sql, params);
}

// ── Cache de resultados (evita muitas chamadas à API) ────────
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ── Buscar resultado da API Caixa ────────────────────────────

const MODALIDADES = {
  megasena:  'mega-sena',
  lotofacil: 'lotofacil',
  quina:     'quina',
  lotomania: 'lotomania',
  timemania: 'timemania',
  duplasena: 'dupla-sena',
  diadesorte: 'dia-de-sorte',
  federal:   'federal',
  supersete: 'super-sete',
};

async function buscarResultadoCaixa(modalidade, concurso = '') {
  const api = MODALIDADES[modalidade] ?? modalidade;
  const url = concurso
    ? `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}/${concurso}`
    : `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}`;

  const cacheKey = `${api}-${concurso || 'latest'}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'BolaoMax/1.0' },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`API Caixa retornou ${response.status}`);
    }

    const data = await response.json();
    const resultado = normalizarResultado(api, data);
    setCache(cacheKey, resultado);
    return resultado;
  } catch (err) {
    console.warn(`[RESULTADOS] Erro ao buscar ${api}: ${err.message}`);
    return null;
  }
}

function normalizarResultado(modalidade, raw) {
  return {
    modalidade,
    concurso: raw.numero ?? raw.concurso,
    dataApuracao: raw.dataApuracao ?? raw.data_apuracao,
    numerosDezenasOrdemSorteio: raw.listaDezenas ?? raw.dezenas ?? raw.numerosDezenas ?? [],
    premiacoes: (raw.listaRateioPremio ?? raw.premiacoes ?? []).map(p => ({
      descricaoFaixa: p.descricaoFaixa ?? p.descricao ?? '',
      faixa: p.faixa,
      numeroDeGanhadores: p.numeroDeGanhadores ?? p.ganhadores ?? 0,
      valorPremio: p.valorPremio ?? p.valor ?? 0,
    })),
    acumulado: raw.acumulado ?? false,
    valorAcumuladoEspecial: raw.valorAcumuladoEspecial ?? 0,
    valorAcumuladoProximoConcurso: raw.valorAcumuladoProximoConcurso ?? 0,
    dataProximoConcurso: raw.dataProximoConcurso ?? '',
    localDoSorteio: raw.localSorteio ?? '',
    estadosPremiados: raw.municipioUFGanhadores ?? [],
    raw: raw,
  };
}

// ── DADOS MOCK (fallback quando API Caixa estiver indisponível) ──
function getMockResultado(modalidade) {
  const mock = {
    megasena:  { concurso: 2870, dezenas: ['04','12','23','35','41','57'], acumulado: true, valorAcumulado: 95_000_000 },
    lotofacil: { concurso: 3258, dezenas: ['01','02','05','07','09','11','13','15','17','19','21','22','23','24','25'], acumulado: false },
    quina:     { concurso: 6540, dezenas: ['05','18','29','43','68'], acumulado: false },
    lotomania: { concurso: 2470, dezenas: ['04','08','13','19','22','28','35','40','47','54','61','65','72','78','83','89','95','02','11','17'], acumulado: false },
    timemania: { concurso: 2115, dezenas: ['12','18','25','31','37','42','49'], acumulado: false },
    duplasena: { concurso: 2525, dezenas: ['03','15','24','38','49','58'], acumulado: false },
  };

  const m = mock[modalidade] ?? mock.megasena;
  return {
    modalidade: MODALIDADES[modalidade] ?? modalidade,
    concurso: m.concurso,
    dataApuracao: new Date().toLocaleDateString('pt-BR'),
    numerosDezenasOrdemSorteio: m.dezenas,
    premiacoes: [
      { descricaoFaixa: '6 acertos', faixa: 1, numeroDeGanhadores: m.acumulado ? 0 : 3, valorPremio: m.acumulado ? 0 : 12_345_678 },
      { descricaoFaixa: '5 acertos', faixa: 2, numeroDeGanhadores: 124, valorPremio: 35_000 },
      { descricaoFaixa: '4 acertos', faixa: 3, numeroDeGanhadores: 8_543, valorPremio: 985 },
    ],
    acumulado: m.acumulado ?? false,
    valorAcumuladoProximoConcurso: m.valorAcumulado ?? 0,
    isMock: true,
  };
}

// ── GET /api/resultados/recentes ─────────────────────────────
router.get('/recentes', async (_req, res) => {
  try {
    const modalidades = ['megasena', 'lotofacil', 'quina', 'lotomania', 'timemania', 'duplasena'];
    const resultados = await Promise.allSettled(
      modalidades.map(m => buscarResultadoCaixa(m))
    );

    const dados = resultados.map((r, i) => {
      if (r.status === 'fulfilled' && r.value) return r.value;
      return getMockResultado(modalidades[i]);
    });

    res.json({ success: true, resultados: dados });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/resultados/:modalidade ──────────────────────────
router.get('/:modalidade', async (req, res) => {
  try {
    const { modalidade } = req.params;
    if (!MODALIDADES[modalidade] && !Object.values(MODALIDADES).includes(modalidade)) {
      return res.status(400).json({ success: false, error: `Modalidade inválida. Use: ${Object.keys(MODALIDADES).join(', ')}` });
    }

    let resultado = await buscarResultadoCaixa(modalidade);
    if (!resultado) resultado = getMockResultado(modalidade);

    res.json({ success: true, resultado, fonte: resultado.isMock ? 'mock' : 'caixa' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/resultados/:modalidade/:concurso ─────────────────
router.get('/:modalidade/:concurso', async (req, res) => {
  try {
    const { modalidade, concurso } = req.params;
    if (!MODALIDADES[modalidade]) {
      return res.status(400).json({ success: false, error: 'Modalidade inválida' });
    }

    let resultado = await buscarResultadoCaixa(modalidade, concurso);
    if (!resultado) resultado = getMockResultado(modalidade);

    res.json({ success: true, resultado, fonte: resultado.isMock ? 'mock' : 'caixa' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/resultados/processar/:bolaoId ── admin
router.post('/processar/:bolaoId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bolao = await one(
      `SELECT * FROM boloes WHERE id = ${ph(1)}`,
      [req.params.bolaoId]
    );
    if (!bolao) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });

    // Buscar resultado real ou usar body fornecido
    let resultado = req.body.resultado;
    if (!resultado) {
      resultado = await buscarResultadoCaixa(bolao.tipo, bolao.concurso);
    }
    if (!resultado) return res.status(400).json({ success: false, error: 'Resultado não disponível' });

    const dezenas = resultado.numerosDezenasOrdemSorteio ?? resultado.dezenas ?? [];
    const premiacao = resultado.premiacoes?.[0] ?? {};
    const acertou = premiacao.numeroDeGanhadores > 0;

    // Atualizar bolão
    await run(
      `UPDATE boloes SET status = 'encerrado', premiado = ${ph(1)}, faixa_premio = ${ph(2)},
       valor_premio = ${ph(3)}, numeros_dezenas = ${ph(4)}, atualizado_em = ${ph(5)}
       WHERE id = ${ph(6)}`,
      [
        acertou ? 1 : 0,
        premiacao.descricaoFaixa ?? null,
        Number(premiacao.valorPremio ?? 0),
        JSON.stringify(dezenas),
        new Date().toISOString(),
        bolao.id,
      ]
    );

    // Processar participações (mock: todos ganhadores se acertou)
    if (acertou) {
      const participacoes = await all(
        `SELECT * FROM participacoes WHERE bolao_id = ${ph(1)} AND status = 'confirmado'`,
        [bolao.id]
      );

      const valorPorCota = Number(premiacao.valorPremio ?? 0) / Math.max(1, participacoes.reduce((s, p) => s + p.quantidade_cotas, 0));

      for (const p of participacoes) {
        const premio = valorPorCota * p.quantidade_cotas;
        await run(
          `UPDATE participacoes SET premiado = 1, valor_premio = ${ph(1)} WHERE id = ${ph(2)}`,
          [premio, p.id]
        );

        // Creditar prêmio
        await run(
          `UPDATE users SET saldo = COALESCE(saldo, 0) + ${ph(1)}, atualizado_em = ${ph(2)} WHERE id = ${ph(3)}`,
          [premio, new Date().toISOString(), p.user_id]
        );
      }
    }

    res.json({
      success: true,
      message: `Bolão ${bolao.nome} processado`,
      dezenas,
      premiado: acertou,
      valorPremio: Number(premiacao.valorPremio ?? 0),
    });
  } catch (error) {
    console.error('[RESULTADOS] Erro ao processar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
