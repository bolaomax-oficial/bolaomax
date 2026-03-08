/**
 * BolãoMax — Rotas de Perfil do Usuário
 * GET    /api/perfil           — dados do perfil
 * PUT    /api/perfil           — atualizar perfil
 * POST   /api/perfil/senha     — alterar senha
 * GET    /api/perfil/historico — histórico completo (participações + recargas)
 * GET    /api/perfil/stats     — estatísticas pessoais
 */

import express from 'express';
import { rawDb, dialect } from '../database/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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

// ── GET /api/perfil ──────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await one(
      `SELECT id, name, email, cpf, telefone, saldo, avatar, role, status, email_verified, telefone_verified, criado_em
       FROM users WHERE id = ${ph(1)}`,
      [req.user.id]
    );
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    res.json({
      success: true,
      usuario: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        telefone: user.telefone,
        saldo: Number(user.saldo ?? 0),
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        emailVerified: user.email_verified === 1 || user.email_verified === true,
        telefoneVerified: user.telefone_verified === 1 || user.telefone_verified === true,
        criadoEm: user.criado_em,
      },
    });
  } catch (error) {
    console.error('[PERFIL] Erro ao buscar perfil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PUT /api/perfil ──────────────────────────────────────────
router.put('/', requireAuth, async (req, res) => {
  try {
    const { name, telefone, cpf, avatar } = req.body;

    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Nome deve ter pelo menos 2 caracteres' });
    }

    const sets = [];
    const params = [];
    let i = 1;

    if (name     !== undefined) { sets.push(`name = ${ph(i++)}`);     params.push(name.trim()); }
    if (telefone !== undefined) { sets.push(`telefone = ${ph(i++)}`); params.push(telefone); }
    if (cpf      !== undefined) { sets.push(`cpf = ${ph(i++)}`);      params.push(cpf); }
    if (avatar   !== undefined) { sets.push(`avatar = ${ph(i++)}`);   params.push(avatar); }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum campo para atualizar' });
    }

    sets.push(`atualizado_em = ${ph(i++)}`);
    params.push(new Date().toISOString());
    params.push(req.user.id);

    if (!rawDb) throw new Error('DB não disponível');
    if (dialect === 'sqlite') {
      rawDb.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ${ph(i)}`).run(...params);
    } else {
      await rawDb.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ${ph(i)}`, params);
    }

    const updated = await one(`SELECT id, name, email, cpf, telefone, saldo, avatar, role, status FROM users WHERE id = ${ph(1)}`, [req.user.id]);
    res.json({ success: true, message: 'Perfil atualizado', usuario: updated });
  } catch (error) {
    console.error('[PERFIL] Erro ao atualizar:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── POST /api/perfil/senha ───────────────────────────────────
router.post('/senha', requireAuth, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ success: false, error: 'senhaAtual e novaSenha são obrigatórios' });
    }
    if (novaSenha.length < 6) {
      return res.status(400).json({ success: false, error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Buscar hash atual
    const user = await one(`SELECT password_hash FROM users WHERE id = ${ph(1)}`, [req.user.id]);
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    // Verificar senha atual
    const { default: bcrypt } = await import('bcryptjs');
    const valid = await bcrypt.compare(senhaAtual, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Senha atual incorreta' });

    // Hash nova senha
    const novoHash = await bcrypt.hash(novaSenha, 10);
    const now = new Date().toISOString();

    if (dialect === 'sqlite') {
      rawDb.prepare(`UPDATE users SET password_hash = ?, atualizado_em = ? WHERE id = ?`).run(novoHash, now, req.user.id);
    } else {
      await rawDb.query(`UPDATE users SET password_hash = $1, atualizado_em = $2 WHERE id = $3`, [novoHash, now, req.user.id]);
    }

    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('[PERFIL] Erro ao alterar senha:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── GET /api/perfil/historico ────────────────────────────────
router.get('/historico', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [participacoes, recargas, transacoes] = await Promise.all([
      all(
        `SELECT p.*, b.nome as bolao_nome, b.tipo as tipo_loteria, b.data_sorteio, b.premiado as bolao_premiado
         FROM participacoes p LEFT JOIN boloes b ON b.id = p.bolao_id
         WHERE p.user_id = ${ph(1)} ORDER BY p.criado_em DESC LIMIT ${ph(2)} OFFSET ${ph(3)}`,
        [req.user.id, parseInt(limit), offset]
      ),
      all(
        `SELECT * FROM recarga_carteira WHERE user_id = ${ph(1)} ORDER BY criado_em DESC LIMIT 5`,
        [req.user.id]
      ),
      all(
        `SELECT * FROM transactions WHERE user_id = ${ph(1)} ORDER BY criado_em DESC LIMIT 10`,
        [req.user.id]
      ),
    ]);

    res.json({
      success: true,
      participacoes: participacoes.map(p => ({
        id: p.id,
        bolaoId: p.bolao_id,
        bolaoNome: p.bolao_nome ?? 'Bolão',
        tipoLoteria: p.tipo_loteria ?? '',
        quantidadeCotas: p.quantidade_cotas,
        valorTotal: Number(p.valor_total),
        status: p.status,
        dataSorteio: p.data_sorteio,
        premiado: p.premiado === 1 || p.premiado === true,
        valorPremio: Number(p.valor_premio ?? 0),
        criadoEm: p.criado_em,
      })),
      recargas: recargas.map(r => ({
        id: r.id,
        valor: Number(r.valor),
        formaPagamento: r.forma_pagamento,
        status: r.status,
        criadoEm: r.criado_em,
      })),
      transacoes: transacoes.map(t => ({
        id: t.id,
        tipo: t.tipo,
        valor: Number(t.valor),
        status: t.status,
        descricao: t.descricao,
        criadoEm: t.criado_em,
      })),
    });
  } catch (error) {
    console.error('[PERFIL] Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/perfil/stats ────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [statsPartic, statsFinan, statsCarrinho] = await Promise.all([
      one(
        `SELECT
           COUNT(*) as total_participacoes,
           SUM(valor_total) as total_investido,
           SUM(CASE WHEN status='confirmado' THEN 1 ELSE 0 END) as confirmadas,
           SUM(CASE WHEN premiado=1 OR premiado='true' THEN 1 ELSE 0 END) as premiadas,
           SUM(CASE WHEN premiado=1 OR premiado='true' THEN COALESCE(valor_premio,0) ELSE 0 END) as total_premio
         FROM participacoes WHERE user_id = ${ph(1)}`,
        [req.user.id]
      ),
      one(
        `SELECT
           SUM(CASE WHEN tipo='recarga' AND status='aprovado' THEN valor ELSE 0 END) as total_recarregado,
           COUNT(CASE WHEN tipo='recarga' AND status='aprovado' THEN 1 END) as qtd_recargas
         FROM transactions WHERE user_id = ${ph(1)}`,
        [req.user.id]
      ),
      one(`SELECT COUNT(*) as boloes_distintos FROM participacoes WHERE user_id = ${ph(1)}`, [req.user.id]),
    ]);

    const user = await one(`SELECT saldo, criado_em FROM users WHERE id = ${ph(1)}`, [req.user.id]);
    const diasCadastrado = Math.floor((Date.now() - new Date(user?.criado_em).getTime()) / 86400000);

    res.json({
      success: true,
      stats: {
        saldoAtual: Number(user?.saldo ?? 0),
        totalParticipacoes: Number(statsPartic?.total_participacoes ?? 0),
        totalInvestido: Number(statsPartic?.total_investido ?? 0),
        participacoesConfirmadas: Number(statsPartic?.confirmadas ?? 0),
        boloesPremiados: Number(statsPartic?.premiadas ?? 0),
        totalPremios: Number(statsPartic?.total_premio ?? 0),
        totalRecarregado: Number(statsFinan?.total_recarregado ?? 0),
        quantidadeRecargas: Number(statsFinan?.qtd_recargas ?? 0),
        boloesDistintos: Number(statsCarrinho?.boloes_distintos ?? 0),
        diasCadastrado,
      },
    });
  } catch (error) {
    console.error('[PERFIL] Erro ao buscar stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
