/**
 * Endpoints da API de Calendário de Sorteios
 * 
 * GET  /calendar/draws                - Todos os sorteios (com filtros)
 * GET  /calendar/draws/:tipo          - Sorteios de uma loteria
 * GET  /calendar/month/:mes/:ano      - Sorteios do mês
 * GET  /calendar/upcoming             - Próximos sorteios
 * GET  /calendar/:id/google           - Link Google Calendar
 * GET  /calendar/export/:formato      - Exportação (ical, csv)
 * GET  /calendar/special              - Sorteios especiais
 */

export const calendarRoutes = (app: any) => {
  /**
   * GET /api/calendar/draws
   * Retorna sorteios com filtros opcionais
   */
  app.get('/api/calendar/draws', (c: any) => {
    const tipo = c.req.query('tipo');
    const mes = parseInt(c.req.query('mes') || new Date().getMonth() + 1);
    const ano = parseInt(c.req.query('ano') || new Date().getFullYear());

    return c.json({
      success: true,
      data: {
        sorteios: [
          // Mock data
          {
            id: 'megasena_2025_02_19',
            tipo: 'megasena',
            data: '2025-02-19',
            hora: '20:00',
            diaSemana: 'quarta',
            concurso: 2789,
            premioEstimado: 5000000,
            local: 'Auditório da Caixa Econômica Federal, Brasília - DF',
            especial: false,
          },
          {
            id: 'lotofacil_2025_02_18',
            tipo: 'lotofacil',
            data: '2025-02-18',
            hora: '20:00',
            diaSemana: 'terça',
            concurso: 3258,
            premioEstimado: 1500000,
            local: 'Auditório da Caixa Econômica Federal, Brasília - DF',
            especial: false,
          },
        ],
        filtros: { tipo, mes, ano },
      },
    });
  });

  /**
   * GET /api/calendar/draws/:tipo
   * Sorteios de uma loteria específica
   */
  app.get('/api/calendar/draws/:tipo', (c: any) => {
    const tipo = c.req.param('tipo');
    const mes = parseInt(c.req.query('mes') || new Date().getMonth() + 1);
    const ano = parseInt(c.req.query('ano') || new Date().getFullYear());

    return c.json({
      success: true,
      loteria: tipo,
      mes,
      ano,
      sorteios: [
        {
          id: `${tipo}_2025_02_19`,
          tipo,
          data: '2025-02-19',
          hora: '20:00',
          diaSemana: 'quarta',
        },
      ],
    });
  });

  /**
   * GET /api/calendar/month/:mes/:ano
   * Sorteios de um mês específico
   */
  app.get('/api/calendar/month/:mes/:ano', (c: any) => {
    const mes = parseInt(c.req.param('mes'));
    const ano = parseInt(c.req.param('ano'));

    const ultimoDia = new Date(ano, mes, 0).getDate();
    const sorteios = [];

    // Simula sorteios do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
      if ([3, 6].includes(new Date(ano, mes - 1, dia).getDay())) {
        sorteios.push({
          id: `megasena_${ano}_${mes.toString().padStart(2, '0')}_${dia.toString().padStart(2, '0')}`,
          tipo: 'megasena',
          data: `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`,
          hora: '20:00',
        });
      }
    }

    return c.json({
      success: true,
      mes,
      ano,
      sorteios,
    });
  });

  /**
   * GET /api/calendar/upcoming
   * Próximos sorteios (próximos 30 dias)
   */
  app.get('/api/calendar/upcoming', (c: any) => {
    const dias = parseInt(c.req.query('dias') || '30');

    return c.json({
      success: true,
      dias,
      sorteios: [
        {
          id: 'megasena_2025_02_19',
          tipo: 'megasena',
          data: '2025-02-19',
          hora: '20:00',
          badge: '📅 Amanhã',
          premioEstimado: 5000000,
        },
        {
          id: 'lotofacil_2025_02_18',
          tipo: 'lotofacil',
          data: '2025-02-18',
          hora: '20:00',
          badge: '📅 Hoje',
          premioEstimado: 1500000,
        },
      ],
    });
  });

  /**
   * GET /api/calendar/:id/google
   * Link direto para Google Calendar
   */
  app.get('/api/calendar/:id/google', (c: any) => {
    const id = c.req.param('id');

    const googleCalendarUrl =
      'https://calendar.google.com/calendar/r/eventedit?' +
      'text=Sorteio%20Mega-Sena&' +
      'dates=20250219T200000/20250219T210000&' +
      'ctz=America/Sao_Paulo';

    return c.json({
      success: true,
      url: googleCalendarUrl,
      redirect: true,
    });
  });

  /**
   * GET /api/calendar/export/:formato
   * Exportação de calendário
   */
  app.get('/api/calendar/export/:formato', (c: any) => {
    const formato = c.req.param('formato'); // ical, csv, google
    const loterias = c.req.query('loterias')?.split(',') || [];
    const mes = parseInt(c.req.query('mes') || new Date().getMonth() + 1);
    const ano = parseInt(c.req.query('ano') || new Date().getFullYear());

    if (formato === 'ical') {
      // Retorna .ics
      const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BolãoMax//Lottery Calendar//EN
CALSCALE:GREGORIAN
X-WR-CALNAME:Calendário de Sorteios
BEGIN:VEVENT
UID:megasena_2025_02_19@bolaomax.com.br
DTSTART:20250219T200000
SUMMARY:🎰 Sorteio Mega-Sena
LOCATION:Brasília - DF
END:VEVENT
END:VCALENDAR`;

      return c.text(icalContent, 200, {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="sorteios.ics"',
      });
    }

    return c.json({
      success: true,
      formato,
      loterias,
      mes,
      ano,
      message: 'Exportação gerada com sucesso',
    });
  });

  /**
   * GET /api/calendar/special
   * Sorteios especiais (Mega da Virada, etc)
   */
  app.get('/api/calendar/special', (c: any) => {
    return c.json({
      success: true,
      especiais: [
        {
          id: 'megasena_2025_12_31',
          tipo: 'megasena',
          nome: '🎄 Mega da Virada 2025/2026',
          data: '2025-12-31',
          hora: '20:00',
          premioEstimado: 300000000,
          descricao: 'O maior prêmio do ano em sorteio especial de final de ano',
          historico: {
            2024: 162000000,
            2023: 248000000,
            2022: 378000000,
          },
        },
      ],
    });
  });

  /**
   * POST /api/calendar/alerts
   * Criar alerta para sorteio
   */
  app.post('/api/calendar/alerts', async (c: any) => {
    const { drawId, tipo, diasAntes } = await c.req.json();

    return c.json({
      success: true,
      alertId: `alert_${Date.now()}`,
      drawId,
      tipo,
      diasAntes,
      message: 'Alerta criado com sucesso',
    });
  });

  /**
   * DELETE /api/calendar/alerts/:alertId
   * Remover alerta
   */
  app.delete('/api/calendar/alerts/:alertId', (c: any) => {
    const alertId = c.req.param('alertId');

    return c.json({
      success: true,
      alertId,
      message: 'Alerta removido com sucesso',
    });
  });
};

export default calendarRoutes;
