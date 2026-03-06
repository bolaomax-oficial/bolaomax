import express from 'express';
import { db } from '../database/connection.js';
import { sql } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET - Obter todas as configurações
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const configs = await db.all(sql`
      SELECT * FROM configuracoes_sistema ORDER BY categoria, chave
    `);
    
    // Agrupar por categoria
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.categoria]) {
        acc[config.categoria] = {};
      }
      acc[config.categoria][config.chave] = {
        valor: config.valor,
        tipo: config.tipo,
        descricao: config.descricao
      };
      return acc;
    }, {});
    
    res.json({ success: true, configuracoes: grouped });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar configurações' });
  }
});

// GET - Obter configuração específica
router.get('/:categoria/:chave', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categoria, chave } = req.params;
    
    const config = await db.all(sql`
      SELECT * FROM configuracoes_sistema 
      WHERE categoria = ${categoria} AND chave = ${chave}
    `);
    
    if (config.length === 0) {
      return res.status(404).json({ success: false, error: 'Configuração não encontrada' });
    }
    
    res.json({ success: true, configuracao: config[0] });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar configuração' });
  }
});

// PUT - Atualizar configuração
router.put('/:categoria/:chave', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categoria, chave } = req.params;
    const { valor } = req.body;
    
    if (valor === undefined || valor === null) {
      return res.status(400).json({ success: false, error: 'Valor é obrigatório' });
    }
    
    // Verificar se configuração existe
    const existing = await db.all(sql`
      SELECT * FROM configuracoes_sistema 
      WHERE categoria = ${categoria} AND chave = ${chave}
    `);
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Configuração não encontrada' });
    }
    
    // Atualizar
    await db.run(sql`
      UPDATE configuracoes_sistema 
      SET valor = ${String(valor)}, atualizado_em = CURRENT_TIMESTAMP
      WHERE categoria = ${categoria} AND chave = ${chave}
    `);
    
    // Registrar log
    await db.run(sql`
      INSERT INTO logs_configuracoes (
        categoria, chave, valor_anterior, valor_novo, usuario_id, data_hora
      ) VALUES (
        ${categoria}, 
        ${chave}, 
        ${existing[0].valor}, 
        ${String(valor)}, 
        ${req.user.id}, 
        CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ success: true, message: 'Configuração atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar configuração' });
  }
});

// PUT - Atualizar múltiplas configurações de uma vez
router.put('/batch', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { configuracoes } = req.body; // Array de { categoria, chave, valor }
    
    if (!Array.isArray(configuracoes) || configuracoes.length === 0) {
      return res.status(400).json({ success: false, error: 'Configurações inválidas' });
    }
    
    const erros = [];
    const sucessos = [];
    
    for (const config of configuracoes) {
      try {
        const { categoria, chave, valor } = config;
        
        // Buscar valor anterior
        const existing = await db.all(sql`
          SELECT valor FROM configuracoes_sistema 
          WHERE categoria = ${categoria} AND chave = ${chave}
        `);
        
        if (existing.length > 0) {
          // Atualizar
          await db.run(sql`
            UPDATE configuracoes_sistema 
            SET valor = ${String(valor)}, atualizado_em = CURRENT_TIMESTAMP
            WHERE categoria = ${categoria} AND chave = ${chave}
          `);
          
          // Log
          await db.run(sql`
            INSERT INTO logs_configuracoes (
              categoria, chave, valor_anterior, valor_novo, usuario_id, data_hora
            ) VALUES (
              ${categoria}, 
              ${chave}, 
              ${existing[0].valor}, 
              ${String(valor)}, 
              ${req.user.id}, 
              CURRENT_TIMESTAMP
            )
          `);
          
          sucessos.push({ categoria, chave });
        } else {
          erros.push({ categoria, chave, erro: 'Não encontrada' });
        }
      } catch (error) {
        erros.push({ categoria: config.categoria, chave: config.chave, erro: error.message });
      }
    }
    
    res.json({ 
      success: true, 
      message: `${sucessos.length} configurações atualizadas`,
      sucessos,
      erros: erros.length > 0 ? erros : undefined
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações em lote:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar configurações' });
  }
});

// GET - Histórico de alterações
router.get('/logs/historico', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const logs = await db.all(sql`
      SELECT l.*, u.nome as usuario_nome
      FROM logs_configuracoes l
      LEFT JOIN users u ON l.usuario_id = u.id
      ORDER BY l.data_hora DESC
      LIMIT ${parseInt(limit)}
    `);
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar histórico' });
  }
});

export default router;
