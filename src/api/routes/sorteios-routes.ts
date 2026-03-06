/**
 * API REST para Sistema de Calendário de Sorteios
 * 6 Endpoints: lista, mês, exportar, alertas (get/create/delete)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { formatarTodosSorteios } from '../services/sorteios-precadastrados';

const app = new Hono();

app.use('/*', cors());

// Mock storage para desenvolvimento
const sorteiosStore = new Map();
const alertasStore = new Map();

// Inicializar com dados pré-cadastrados
const sorteiosPrecadastrados = formatarTodosSorteios();
sorteiosPrecadastrados.forEach(s => {
  sorteiosStore.set(s.id, s);
});

/**
 * GET /
 * Lista todos os sorteios com filtros
 */
app.get('/', (c) => {
  const tipo = c.req.query('tipo');
  const mes = c.req.query('mes');
  const ano = c.req.query('ano');
  
  let sorteios = Array.from(sorteiosStore.values());
  
  // Aplicar filtros
  if (tipo) {
    sorteios = sorteios.filter(s => s.tipo === tipo);
  }
  if (mes) {
    sorteios = sorteios.filter(s => s.mes === parseInt(mes));
  }
  if (ano) {
    sorteios = sorteios.filter(s => s.ano === parseInt(ano));
  }
  
  // Ordenar por data
  sorteios.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  return c.json({
    success: true,
    total: sorteios.length,
    data: sorteios,
  });
});

/**
 * GET /mes/:mes
 * Sorteios do mês específico
 */
app.get('/mes/:mes', (c) => {
  const mes = parseInt(c.req.param('mes'));
  const ano = parseInt(c.req.query('ano') || new Date().getFullYear());
  
  const sorteios = Array.from(sorteiosStore.values())
    .filter(s => s.mes === mes && s.ano === ano)
    .sort((a, b) => parseInt(a.data.split('-')[2]) - parseInt(b.data.split('-')[2]));
  
  return c.json({
    success: true,
    mes,
    ano,
    total: sorteios.length,
    data: sorteios,
  });
});

/**
 * GET /proximos
 * Próximos sorteios
 */
app.get('/proximos', (c) => {
  const dias = parseInt(c.req.query('dias') || '30');
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limiteData = new Date(hoje);
  limiteData.setDate(limiteData.getDate() + dias);
  
  const sorteios = Array.from(sorteiosStore.values())
    .filter(s => {
      const dataSorteio = new Date(s.data);
      dataSorteio.setHours(0, 0, 0, 0);
      return dataSorteio >= hoje && dataSorteio <= limiteData;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  // Adicionar badges
  const comBadges = sorteios.map(s => {
    const dataSorteio = new Date(s.data);
    const dataFormatada = dataSorteio.toLocaleDateString('pt-BR');
    const hoje2 = new Date();
    hoje2.setHours(0, 0, 0, 0);
    
    let badge = null;
    if (dataFormatada === hoje2.toLocaleDateString('pt-BR')) {
      badge = 'Hoje';
    } else if (dataFormatada === new Date(hoje2.getTime() + 24*60*60*1000).toLocaleDateString('pt-BR')) {
      badge = 'Amanhã';
    } else if (dataSorteio.getTime() - hoje2.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      badge = 'Esta Semana';
    }
    
    return { ...s, badge };
  });
  
  return c.json({
    success: true,
    total: comBadges.length,
    data: comBadges,
  });
});

/**
 * GET /exportar?formato=ics&loterias=megasena,lotofacil&mes=2&ano=2025
 * Exportar sorteios em formato .ics (iCal)
 */
app.get('/exportar', (c) => {
  const formato = c.req.query('formato') || 'ics'; // ics, json, csv
  const loteriasParam = c.req.query('loterias');
  const mes = c.req.query('mes');
  const ano = c.req.query('ano') || new Date().getFullYear();
  
  let sorteios = Array.from(sorteiosStore.values());
  
  if (loteriasParam) {
    const loterias = loteriasParam.split(',');
    sorteios = sorteios.filter(s => loterias.includes(s.tipo));
  }
  if (mes) {
    sorteios = sorteios.filter(s => s.mes === parseInt(mes));
  }
  
  if (formato === 'ics') {
    const ics = gerarICS(sorteios);
    return c.text(ics, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="sorteios-bolaomax.ics"',
      }
    });
  } else if (formato === 'json') {
    return c.json({
      success: true,
      formato: 'json',
      total: sorteios.length,
      data: sorteios,
    });
  } else if (formato === 'csv') {
    const csv = gerarCSV(sorteios);
    return c.text(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="sorteios-bolaomax.csv"',
      }
    });
  }
  
  return c.json({ success: false, error: 'Formato inválido' }, 400);
});

/**
 * GET /google-calendar
 * URL para adicionar ao Google Calendar
 */
app.get('/google-calendar', (c) => {
  const loteriasParam = c.req.query('loterias') || 'megasena';
  const mes = c.req.query('mes');
  
  // Construir URL do Google Calendar
  const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/settings/addbyemail';
  
  return c.json({
    success: true,
    url: calendarUrl,
    descricao: 'Adicione o calendário de sorteios do BolãoMax ao Google Calendar',
    email: 'sorteios@bolaomax.com.br', // Email fictício para adicionar
  });
});

/**
 * POST /alertas
 * Criar alerta de sorteio
 */
app.post('/alertas', async (c) => {
  const body = await c.req.json();
  const { usuarioId, sorteioId, tipo, diasAntes } = body;
  
  const alertaId = `alerta_${Date.now()}`;
  const alerta = {
    id: alertaId,
    usuarioId,
    sorteioId,
    tipo: tipo || 'email',
    diasAntes: diasAntes || 1,
    ativo: true,
    enviado: false,
    criadoEm: new Date().toISOString(),
  };
  
  alertasStore.set(alertaId, alerta);
  
  return c.json({
    success: true,
    message: 'Alerta criado com sucesso',
    data: alerta,
  });
});

/**
 * GET /alertas/usuario/:usuarioId
 * Alertas de um usuário
 */
app.get('/alertas/usuario/:usuarioId', (c) => {
  const usuarioId = c.req.param('usuarioId');
  
  const alertas = Array.from(alertasStore.values())
    .filter(a => a.usuarioId === usuarioId);
  
  return c.json({
    success: true,
    total: alertas.length,
    data: alertas,
  });
});

/**
 * DELETE /alertas/:id
 * Remover alerta
 */
app.delete('/alertas/:id', (c) => {
  const alertaId = c.req.param('id');
  
  if (alertasStore.has(alertaId)) {
    alertasStore.delete(alertaId);
    
    return c.json({
      success: true,
      message: 'Alerta removido com sucesso',
    });
  }
  
  return c.json({
    success: false,
    error: 'Alerta não encontrado',
  }, 404);
});

/**
 * Gerar arquivo iCal (.ics)
 */
function gerarICS(sorteios: any[]): string {
  const agora = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const eventos = sorteios.map((sorteio, index) => {
    const dataHora = sorteio.data + 'T' + sorteio.hora;
    const dtstart = dataHora.replace(/-/g, '').replace(':', '');
    const uid = `${sorteio.id}@bolaomax.com.br`;
    
    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${agora}
DTSTART:${dtstart}
SUMMARY:${sorteio.tipo.toUpperCase()} - Sorteio ${sorteio.numero}
DESCRIPTION:Loteria: ${sorteio.tipo}\\nConcurso: ${sorteio.numero}\\nLocal: ${sorteio.local_sorteio}
LOCATION:${sorteio.local_sorteio}
COLOR:${sorteio.cor}
END:VEVENT`;
  }).join('\n');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BolãoMax//Calendário de Sorteios//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Sorteios BolãoMax
X-WR-TIMEZONE:America/Sao_Paulo
X-WR-CALDESC:Calendário de todos os sorteios das loterias brasileiras
${eventos}
END:VCALENDAR`;
}

/**
 * Gerar arquivo CSV
 */
function gerarCSV(sorteios: any[]): string {
  const headers = 'Loteria,Concurso,Data,Hora,Dia da Semana,Local,Valor Estimado';
  const linhas = sorteios.map(s => 
    `${s.tipo},${s.numero},${s.data},${s.hora},${s.dia_semana},${s.local_sorteio},${s.valor_estimado || 'N/A'}`
  ).join('\n');
  
  return `${headers}\n${linhas}`;
}

export default app;
