/**
 * ============================================================
 * SERVIÇO DE BOLÕES TIMEMANIA
 * ============================================================
 * 
 * Serviço principal para operações de bolões da Timemania.
 * Utiliza separação clara entre regras de MODALIDADE e COMERCIAIS.
 * ============================================================
 */

import { v4 as uuidv4 } from 'uuid';
import {
  REGRAS_MODALIDADE_TIMEMANIA,
  ApostaTimemania,
  validarApostaTimemania,
  validarListaApostasTimemania,
  getTimeDoCoracaoById,
  getTimesDoCoracaoAtivos,
  TimeDoCoracao,
} from './regras-modalidade';

import {
  REGRAS_COMERCIAIS_TIMEMANIA,
  BolaoTimemania,
  StatusBolao,
  CalculoBolao,
  PoliticaCotasNaoVendidas,
  calcularBolao,
  validarValorCotaComercial,
  validarTotalCotasComercial,
  validarPermissaoCompra,
  validarTransicaoStatus,
  validarBolaoCompleto,
  determinarStatusPorHorario,
  formatarMoeda,
  gerarCodigoBolao,
  STATUS_LABELS,
  STATUS_CORES,
  STATUS_PERMITIDOS_COMPRA,
} from './regras-comerciais';

// ============================================================
// TIPOS
// ============================================================

export interface CriarBolaoInput {
  titulo: string;
  descricao?: string;
  concurso: string;
  dataSorteio: Date;
  horarioLimiteCompra: Date;
  apostas: ApostaTimemania[];
  totalCotas: number;
  taxaPercentual?: number;
  politicaCotasNaoVendidas?: PoliticaCotasNaoVendidas;
  cotaMinimaConfirmacao?: number;
  estrategia?: string;
  criadoPor: string;
}

export interface AtualizarBolaoInput {
  titulo?: string;
  descricao?: string;
  concurso?: string;
  dataSorteio?: Date;
  horarioLimiteCompra?: Date;
  apostas?: ApostaTimemania[];
  totalCotas?: number;
  taxaPercentual?: number;
  politicaCotasNaoVendidas?: PoliticaCotasNaoVendidas;
  cotaMinimaConfirmacao?: number;
  estrategia?: string;
}

export interface ComprarCotasInput {
  bolaoId: string;
  usuarioId: string;
  quantidadeCotas: number;
  metodoPagamento: string;
}

export interface ResultadoOperacao<T = any> {
  sucesso: boolean;
  dados?: T;
  erros?: string[];
  avisos?: string[];
}

export interface BolaoComDetalhes extends BolaoTimemania {
  calculo: CalculoBolao;
  apostasDetalhadas: ApostaComTime[];
  statusLabel: string;
  statusCores: { bg: string; text: string; border: string };
  tempoRestante: TempoRestante;
}

export interface ApostaComTime extends ApostaTimemania {
  timeDoCoracao: TimeDoCoracao;
}

export interface TempoRestante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  expirado: boolean;
  emClosing: boolean;
}

// ============================================================
// ARMAZENAMENTO EM MEMÓRIA (SIMULAÇÃO)
// Para produção, substituir por banco de dados real
// ============================================================

const boloesEmMemoria: Map<string, BolaoTimemania> = new Map();
const cotasVendidasEmMemoria: Map<string, { bolaoId: string; usuarioId: string; quantidade: number; valor: number }[]> = new Map();
const logsStatusEmMemoria: Map<string, { status: StatusBolao; timestamp: Date; automatico: boolean }[]> = new Map();

// ============================================================
// SERVIÇO PRINCIPAL
// ============================================================

export class TimemaniaBolaoService {
  
  /**
   * Cria um novo bolão Timemania
   */
  static criarBolao(input: CriarBolaoInput): ResultadoOperacao<BolaoTimemania> {
    const erros: string[] = [];
    const avisos: string[] = [];
    
    // 1. Validar apostas (CAMADA: MODALIDADE)
    const validacaoModalidade = validarListaApostasTimemania(input.apostas);
    if (!validacaoModalidade.valido) {
      erros.push(...validacaoModalidade.erros);
    }
    
    // 2. Calcular valores do bolão
    const calculo = calcularBolao(input.apostas, input.totalCotas, 0, input.taxaPercentual);
    
    // 3. Validar regras comerciais (CAMADA: COMERCIAL)
    const validacaoCota = validarValorCotaComercial(calculo.valorPorCota);
    const validacaoCotas = validarTotalCotasComercial(input.totalCotas);
    
    if (!validacaoCota.valido) erros.push(...validacaoCota.erros);
    if (!validacaoCotas.valido) erros.push(...validacaoCotas.erros);
    
    avisos.push(...validacaoCota.avisos, ...validacaoCotas.avisos);
    
    // 4. Se houver erros, retornar
    if (erros.length > 0) {
      return { sucesso: false, erros, avisos };
    }
    
    // 5. Criar o bolão
    const id = uuidv4();
    const agora = new Date();
    
    const bolao: BolaoTimemania = {
      id,
      titulo: input.titulo,
      descricao: input.descricao || '',
      modalidade: 'timemania',
      concurso: input.concurso,
      dataSorteio: input.dataSorteio,
      horarioLimiteCompra: input.horarioLimiteCompra,
      apostas: input.apostas,
      quantidadeApostas: input.apostas.length,
      totalCotas: input.totalCotas,
      cotasVendidas: 0,
      cotasDisponiveis: input.totalCotas,
      valorPorCota: calculo.valorPorCota,
      valorTotalBolao: calculo.valorTotalBolao,
      taxaPlataforma: calculo.taxaPlataforma,
      politicaCotasNaoVendidas: input.politicaCotasNaoVendidas || 'garantido',
      cotaMinimaConfirmacao: input.cotaMinimaConfirmacao,
      status: 'draft',
      estrategia: input.estrategia || '',
      criadoEm: agora,
      atualizadoEm: agora,
      criadoPor: input.criadoPor,
    };
    
    // Salvar
    boloesEmMemoria.set(id, bolao);
    logsStatusEmMemoria.set(id, [{ status: 'draft', timestamp: agora, automatico: false }]);
    
    return { sucesso: true, dados: bolao, avisos };
  }
  
  /**
   * Obtém bolão por ID com detalhes calculados
   */
  static obterBolao(id: string): ResultadoOperacao<BolaoComDetalhes> {
    const bolao = boloesEmMemoria.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Calcular valores atualizados
    const calculo = calcularBolao(
      bolao.apostas, 
      bolao.totalCotas, 
      bolao.cotasVendidas
    );
    
    // Montar apostas com detalhes do time
    const apostasDetalhadas: ApostaComTime[] = bolao.apostas.map(aposta => ({
      ...aposta,
      timeDoCoracao: getTimeDoCoracaoById(aposta.timeDoCoracaoId)!,
    }));
    
    // Calcular tempo restante
    const tempoRestante = this.calcularTempoRestante(bolao.horarioLimiteCompra);
    
    const bolaoComDetalhes: BolaoComDetalhes = {
      ...bolao,
      calculo,
      apostasDetalhadas,
      statusLabel: STATUS_LABELS[bolao.status],
      statusCores: STATUS_CORES[bolao.status],
      tempoRestante,
    };
    
    return { sucesso: true, dados: bolaoComDetalhes };
  }
  
  /**
   * Lista bolões com filtros
   */
  static listarBoloes(filtros?: {
    status?: StatusBolao[];
    limite?: number;
    pagina?: number;
  }): ResultadoOperacao<BolaoComDetalhes[]> {
    let boloes = Array.from(boloesEmMemoria.values());
    
    // Filtrar por status
    if (filtros?.status && filtros.status.length > 0) {
      boloes = boloes.filter(b => filtros.status!.includes(b.status));
    }
    
    // Ordenar por data de sorteio
    boloes.sort((a, b) => a.dataSorteio.getTime() - b.dataSorteio.getTime());
    
    // Paginação
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 20;
    const inicio = (pagina - 1) * limite;
    boloes = boloes.slice(inicio, inicio + limite);
    
    // Adicionar detalhes
    const boloesComDetalhes = boloes.map(bolao => {
      const resultado = this.obterBolao(bolao.id);
      return resultado.dados!;
    });
    
    return { sucesso: true, dados: boloesComDetalhes };
  }
  
  /**
   * Publica um bolão (draft -> active)
   */
  static publicarBolao(id: string, usuarioId: string): ResultadoOperacao<BolaoTimemania> {
    const bolao = boloesEmMemoria.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Validar transição
    const validacao = validarTransicaoStatus(bolao.status, 'active');
    if (!validacao.valido) {
      return { sucesso: false, erros: validacao.erros };
    }
    
    // Atualizar status
    const agora = new Date();
    bolao.status = 'active';
    bolao.publicadoEm = agora;
    bolao.atualizadoEm = agora;
    
    // Log
    const logs = logsStatusEmMemoria.get(id) || [];
    logs.push({ status: 'active', timestamp: agora, automatico: false });
    logsStatusEmMemoria.set(id, logs);
    
    boloesEmMemoria.set(id, bolao);
    
    return { sucesso: true, dados: bolao };
  }
  
  /**
   * Compra cotas de um bolão
   */
  static comprarCotas(input: ComprarCotasInput): ResultadoOperacao<{ cotas: number; valorTotal: number }> {
    const bolao = boloesEmMemoria.get(input.bolaoId);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Validar permissão de compra (CAMADA: COMERCIAL)
    const validacao = validarPermissaoCompra(
      bolao.status,
      bolao.horarioLimiteCompra,
      bolao.cotasDisponiveis,
      input.quantidadeCotas
    );
    
    if (!validacao.valido) {
      return { sucesso: false, erros: validacao.erros, avisos: validacao.avisos };
    }
    
    // Calcular valor
    const valorTotal = input.quantidadeCotas * bolao.valorPorCota;
    
    // Atualizar bolão
    bolao.cotasVendidas += input.quantidadeCotas;
    bolao.cotasDisponiveis -= input.quantidadeCotas;
    bolao.atualizadoEm = new Date();
    
    // Registrar compra
    const compras = cotasVendidasEmMemoria.get(input.bolaoId) || [];
    compras.push({
      bolaoId: input.bolaoId,
      usuarioId: input.usuarioId,
      quantidade: input.quantidadeCotas,
      valor: valorTotal,
    });
    cotasVendidasEmMemoria.set(input.bolaoId, compras);
    
    boloesEmMemoria.set(input.bolaoId, bolao);
    
    return { 
      sucesso: true, 
      dados: { cotas: input.quantidadeCotas, valorTotal },
      avisos: validacao.avisos
    };
  }
  
  /**
   * Atualiza status dos bolões automaticamente
   * [AUTOMAÇÃO - DEVE SER CHAMADA POR CRON JOB]
   */
  static atualizarStatusAutomatico(): ResultadoOperacao<{ atualizados: string[] }> {
    const atualizados: string[] = [];
    const agora = new Date();
    
    for (const [id, bolao] of boloesEmMemoria) {
      // Ignorar status finais
      if (['finalizado', 'cancelado'].includes(bolao.status)) {
        continue;
      }
      
      // Determinar novo status
      const novoStatus = determinarStatusPorHorario(
        bolao.status,
        bolao.horarioLimiteCompra,
        bolao.cotasVendidas,
        bolao.cotaMinimaConfirmacao,
        bolao.politicaCotasNaoVendidas
      );
      
      // Se status mudou, atualizar
      if (novoStatus !== bolao.status) {
        const statusAnterior = bolao.status;
        bolao.status = novoStatus;
        bolao.atualizadoEm = agora;
        
        // Log
        const logs = logsStatusEmMemoria.get(id) || [];
        logs.push({ status: novoStatus, timestamp: agora, automatico: true });
        logsStatusEmMemoria.set(id, logs);
        
        boloesEmMemoria.set(id, bolao);
        atualizados.push(`${id}: ${STATUS_LABELS[statusAnterior]} -> ${STATUS_LABELS[novoStatus]}`);
      }
    }
    
    return { sucesso: true, dados: { atualizados } };
  }
  
  /**
   * Altera status manualmente (admin)
   */
  static alterarStatus(id: string, novoStatus: StatusBolao, usuarioId: string, motivo?: string): ResultadoOperacao<BolaoTimemania> {
    const bolao = boloesEmMemoria.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Validar transição
    const validacao = validarTransicaoStatus(bolao.status, novoStatus);
    if (!validacao.valido) {
      return { sucesso: false, erros: validacao.erros };
    }
    
    // Atualizar
    const agora = new Date();
    bolao.status = novoStatus;
    bolao.atualizadoEm = agora;
    
    // Log
    const logs = logsStatusEmMemoria.get(id) || [];
    logs.push({ status: novoStatus, timestamp: agora, automatico: false });
    logsStatusEmMemoria.set(id, logs);
    
    boloesEmMemoria.set(id, bolao);
    
    return { sucesso: true, dados: bolao };
  }
  
  /**
   * Duplica um bolão existente
   */
  static duplicarBolao(id: string, criadoPor: string): ResultadoOperacao<BolaoTimemania> {
    const bolaoOriginal = boloesEmMemoria.get(id);
    
    if (!bolaoOriginal) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Criar cópia
    return this.criarBolao({
      titulo: `${bolaoOriginal.titulo} (Cópia)`,
      descricao: bolaoOriginal.descricao,
      concurso: bolaoOriginal.concurso,
      dataSorteio: bolaoOriginal.dataSorteio,
      horarioLimiteCompra: bolaoOriginal.horarioLimiteCompra,
      apostas: [...bolaoOriginal.apostas],
      totalCotas: bolaoOriginal.totalCotas,
      politicaCotasNaoVendidas: bolaoOriginal.politicaCotasNaoVendidas,
      cotaMinimaConfirmacao: bolaoOriginal.cotaMinimaConfirmacao,
      estrategia: bolaoOriginal.estrategia,
      criadoPor,
    });
  }
  
  /**
   * Obtém logs de status de um bolão
   */
  static obterLogsStatus(id: string): ResultadoOperacao<{ status: StatusBolao; timestamp: Date; automatico: boolean }[]> {
    const logs = logsStatusEmMemoria.get(id);
    
    if (!logs) {
      return { sucesso: false, erros: ['Logs não encontrados'] };
    }
    
    return { sucesso: true, dados: logs };
  }
  
  /**
   * Calcula tempo restante até o horário limite
   */
  static calcularTempoRestante(horarioLimite: Date): TempoRestante {
    const agora = new Date();
    const diff = horarioLimite.getTime() - agora.getTime();
    const { minutosAntesParaClosing } = REGRAS_COMERCIAIS_TIMEMANIA;
    
    if (diff <= 0) {
      return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true, emClosing: false };
    }
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);
    
    const minutosRestantes = diff / (1000 * 60);
    const emClosing = minutosRestantes <= minutosAntesParaClosing;
    
    return { dias, horas, minutos, segundos, expirado: false, emClosing };
  }
  
  /**
   * Obtém times do coração disponíveis
   */
  static obterTimesDoCoracao(): TimeDoCoracao[] {
    return [...getTimesDoCoracaoAtivos()];
  }
  
  /**
   * Obtém regras da modalidade (para exibição)
   */
  static obterRegrasModalidade() {
    return { ...REGRAS_MODALIDADE_TIMEMANIA };
  }
  
  /**
   * Obtém regras comerciais (para exibição)
   */
  static obterRegrasComerciais() {
    return { ...REGRAS_COMERCIAIS_TIMEMANIA };
  }
  
  /**
   * Pré-visualização de bolão (sem salvar)
   */
  static preVisualizarBolao(input: CriarBolaoInput): ResultadoOperacao<{
    calculo: CalculoBolao;
    validacaoModalidade: { valido: boolean; erros: string[] };
    validacaoComercial: { valido: boolean; erros: string[]; avisos: string[] };
    preview: {
      titulo: string;
      valorPorCota: string;
      valorTotalBolao: string;
      termometroAgressividade: string;
      totalCotas: number;
      quantidadeApostas: number;
    };
  }> {
    // Validar modalidade
    const validacaoModalidade = validarListaApostasTimemania(input.apostas);
    
    // Calcular
    const calculo = calcularBolao(input.apostas, input.totalCotas, 0, input.taxaPercentual);
    
    // Validar comercial
    const validacaoCota = validarValorCotaComercial(calculo.valorPorCota);
    const validacaoCotas = validarTotalCotasComercial(input.totalCotas);
    
    return {
      sucesso: true,
      dados: {
        calculo,
        validacaoModalidade,
        validacaoComercial: {
          valido: validacaoCota.valido && validacaoCotas.valido,
          erros: [...validacaoCota.erros, ...validacaoCotas.erros],
          avisos: [...validacaoCota.avisos, ...validacaoCotas.avisos],
        },
        preview: {
          titulo: input.titulo,
          valorPorCota: formatarMoeda(calculo.valorPorCota),
          valorTotalBolao: formatarMoeda(calculo.valorTotalBolao),
          termometroAgressividade: calculo.termometroAgressividade,
          totalCotas: input.totalCotas,
          quantidadeApostas: input.apostas.length,
        }
      }
    };
  }
}

// ============================================================
// INICIALIZAÇÃO COM DADOS DE EXEMPLO
// ============================================================

export function inicializarDadosExemploTimemania() {
  // Criar alguns bolões de exemplo
  const agora = new Date();
  const proximaSemana = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Bolão 1 - Ativo
  TimemaniaBolaoService.criarBolao({
    titulo: "Timemania Premium #001",
    descricao: "Bolão especial com estratégia balanceada",
    concurso: "2150",
    dataSorteio: proximaSemana,
    horarioLimiteCompra: new Date(proximaSemana.getTime() - 2 * 60 * 60 * 1000),
    apostas: [
      { numeros: [5, 12, 23, 34, 45, 56, 67, 78, 8, 19], timeDoCoracaoId: 23 }, // Flamengo
      { numeros: [3, 14, 25, 36, 47, 58, 69, 80, 11, 22], timeDoCoracaoId: 15 }, // Corinthians
      { numeros: [7, 18, 29, 40, 51, 62, 73, 4, 15, 26], timeDoCoracaoId: 36 }, // Palmeiras
    ],
    totalCotas: 30,
    estrategia: "Estratégia balanceada com números frequentes",
    criadoPor: "admin",
  });
  
  // Publicar o primeiro bolão
  const boloes = Array.from(boloesEmMemoria.values());
  if (boloes.length > 0) {
    TimemaniaBolaoService.publicarBolao(boloes[0].id, "admin");
  }
  
  console.log(`✅ [TIMEMANIA] ${boloesEmMemoria.size} bolões de exemplo inicializados`);
}

export default TimemaniaBolaoService;
