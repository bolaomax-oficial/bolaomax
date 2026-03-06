/**
 * ============================================================
 * SERVIÇO DE BOLÕES LOTOMANIA
 * ============================================================
 * 
 * Serviço principal para operações de bolões da Lotomania.
 * Utiliza separação clara entre regras de MODALIDADE, COMERCIAIS
 * e ESTRATÉGIA.
 * ============================================================
 */

import { v4 as uuidv4 } from 'uuid';
import {
  REGRAS_MODALIDADE_LOTOMANIA,
  validarNumerosAposta,
  formatarNumero,
  calcularProximoSorteio,
  gerarApostaEspelho,
} from './regras-modalidade';

import {
  REGRAS_COMERCIAIS,
  STATUS_BOLAO,
  calcularFinanceiroBolao,
  calcularHorarioLimiteVenda,
  calcularPercentualPreenchimento,
  calcularCotasDisponiveis,
  validarCompraCotas,
  type CalculoFinanceiro,
} from './regras-comerciais';

import {
  gerarApostasEstrategia,
  calcularNivelAgressividade,
  type ModoEstrategia,
  type ApostaGerada,
  type PoolDezenas,
  type ConfiguracaoEstrategia,
  type ResultadoGeracaoApostas,
} from './regras-estrategia';

// ============================================================
// TIPOS
// ============================================================

export interface CriarBolaoInput {
  titulo: string;
  descricao?: string;
  concurso: string;
  dataSorteio: Date;
  
  // Estratégia
  modo?: ModoEstrategia;
  quantidadeApostas: number;
  poolPersonalizado?: number[];
  incluirEspelhos?: boolean;
  teimosinha?: number;
  
  // Cotas
  totalCotas: number;
  taxaPercentual?: number;
  politicaCotasNaoVendidas?: 'garantido' | 'condicionado' | 'hibrido';
  
  // Metadados
  criadoPor: string;
}

export interface BolaoLotomania {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  modalidade: 'lotomania';
  
  // Concurso
  concurso: string;
  dataSorteio: Date;
  horarioLimiteCompra: Date;
  
  // Pool e Apostas
  pool: PoolDezenas;
  apostas: ApostaGerada[];
  quantidadeApostas: number;
  quantidadeApostasEspelho: number;
  
  // Teimosinha
  teimosinhaAtiva: boolean;
  teimosinhaConcursos: number;
  
  // Cotas
  totalCotas: number;
  cotasVendidas: number;
  cotasDisponiveis: number;
  valorPorCota: number;
  
  // Valores
  calculoFinanceiro: CalculoFinanceiro;
  
  // Políticas
  politicaCotasNaoVendidas: 'garantido' | 'condicionado' | 'hibrido';
  
  // Status
  status: keyof typeof STATUS_BOLAO;
  
  // Estratégia
  configuracaoEstrategia: ConfiguracaoEstrategia;
  termometroAgressividade: {
    nivel: 'baixa' | 'media' | 'alta';
    score: number;
    descricao: string;
  };
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
  publicadoEm?: Date;
  criadoPor: string;
}

export interface BolaoComDetalhes extends BolaoLotomania {
  percentualPreenchimento: number;
  tempoRestante: TempoRestante;
  statusLabel: string;
  podeComprar: boolean;
}

export interface TempoRestante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  expirado: boolean;
}

export interface ResultadoOperacao<T = any> {
  sucesso: boolean;
  dados?: T;
  erros?: string[];
  avisos?: string[];
}

export interface ComprarCotasInput {
  bolaoId: string;
  usuarioId: string;
  quantidadeCotas: number;
  metodoPagamento: string;
}

// ============================================================
// ARMAZENAMENTO EM MEMÓRIA (SIMULAÇÃO)
// Para produção, substituir por banco de dados real
// ============================================================

const boloesEmMemoria: Map<string, BolaoLotomania> = new Map();
const cotasVendidasEmMemoria: Map<string, { 
  bolaoId: string; 
  usuarioId: string; 
  quantidade: number; 
  valor: number;
  criadoEm: Date;
}[]> = new Map();
const logsStatusEmMemoria: Map<string, { 
  status: string; 
  timestamp: Date; 
  automatico: boolean;
}[]> = new Map();

// Contador para código do bolão
let contadorBolao = 1000;

// ============================================================
// SERVIÇO PRINCIPAL
// ============================================================

export class LotomaniaBolaoService {
  
  /**
   * Gera código único para o bolão
   */
  private static gerarCodigoBolao(): string {
    contadorBolao++;
    return `LTM-${contadorBolao.toString().padStart(5, '0')}`;
  }
  
  /**
   * Cria um novo bolão Lotomania
   */
  static criarBolao(input: CriarBolaoInput): ResultadoOperacao<BolaoLotomania> {
    const erros: string[] = [];
    const avisos: string[] = [];
    
    try {
      // 1. Validar quantidade de apostas
      if (input.quantidadeApostas < REGRAS_COMERCIAIS.apostasPorBolaoMinimo) {
        erros.push(`Quantidade mínima de apostas: ${REGRAS_COMERCIAIS.apostasPorBolaoMinimo}`);
      }
      if (input.quantidadeApostas > REGRAS_COMERCIAIS.apostasPorBolaoMaximo) {
        erros.push(`Quantidade máxima de apostas: ${REGRAS_COMERCIAIS.apostasPorBolaoMaximo}`);
      }
      
      // 2. Validar cotas
      if (input.totalCotas < REGRAS_COMERCIAIS.totalCotasMinimo) {
        erros.push(`Total mínimo de cotas: ${REGRAS_COMERCIAIS.totalCotasMinimo}`);
      }
      if (input.totalCotas > REGRAS_COMERCIAIS.totalCotasMaximo) {
        erros.push(`Total máximo de cotas: ${REGRAS_COMERCIAIS.totalCotasMaximo}`);
      }
      
      // 3. Validar teimosinha
      const teimosinha = input.teimosinha || 1;
      if (teimosinha > 1 && !REGRAS_MODALIDADE_LOTOMANIA.opcoesTeimosinhaDisponiveis.includes(teimosinha as any)) {
        erros.push(`Opção de teimosinha inválida. Opções válidas: ${REGRAS_MODALIDADE_LOTOMANIA.opcoesTeimosinhaDisponiveis.join(', ')}`);
      }
      
      // Se há erros, retornar
      if (erros.length > 0) {
        return { sucesso: false, erros, avisos };
      }
      
      // 4. Gerar apostas usando estratégia
      const resultadoEstrategia = gerarApostasEstrategia({
        modo: input.modo || 'equilibrado',
        quantidadeApostas: input.quantidadeApostas,
        poolPersonalizado: input.poolPersonalizado,
        incluirEspelhos: input.incluirEspelhos ?? false,
        teimosinha,
      });
      
      // 5. Validar apostas geradas
      for (const aposta of resultadoEstrategia.apostas) {
        const validacao = validarNumerosAposta(aposta.numeros);
        if (!validacao.valido) {
          erros.push(`Aposta ${aposta.id} inválida: ${validacao.erros.join('; ')}`);
        }
      }
      
      if (erros.length > 0) {
        return { sucesso: false, erros, avisos };
      }
      
      // 6. Calcular valores financeiros
      const apostasPrincipais = resultadoEstrategia.apostas.filter(a => a.tipo === 'principal').length;
      const incluirEspelhos = resultadoEstrategia.apostas.some(a => a.tipo === 'espelho');
      
      const calculoFinanceiro = calcularFinanceiroBolao({
        totalApostas: apostasPrincipais,
        incluirEspelhos,
        teimosinha,
        totalCotas: input.totalCotas,
      });
      
      // 7. Validar valor mínimo da cota
      if (calculoFinanceiro.valorPorCota < REGRAS_COMERCIAIS.cotaMinimaComercial) {
        avisos.push(`Valor da cota (R$ ${calculoFinanceiro.valorPorCota.toFixed(2)}) está abaixo do recomendado (R$ ${REGRAS_COMERCIAIS.cotaMinimaComercial.toFixed(2)})`);
      }
      
      // 8. Calcular termômetro de agressividade
      const termometro = calcularNivelAgressividade({
        totalApostas: resultadoEstrategia.apostas.length,
        incluirEspelhos,
        teimosinha,
      });
      
      // 9. Criar bolão
      const id = uuidv4();
      const agora = new Date();
      const horarioLimiteCompra = calcularHorarioLimiteVenda(input.dataSorteio);
      
      const bolao: BolaoLotomania = {
        id,
        codigo: this.gerarCodigoBolao(),
        titulo: input.titulo,
        descricao: input.descricao || '',
        modalidade: 'lotomania',
        
        concurso: input.concurso,
        dataSorteio: input.dataSorteio,
        horarioLimiteCompra,
        
        pool: resultadoEstrategia.pool,
        apostas: resultadoEstrategia.apostas,
        quantidadeApostas: resultadoEstrategia.estatisticas.totalApostasPrincipais,
        quantidadeApostasEspelho: resultadoEstrategia.estatisticas.totalApostasEspelho,
        
        teimosinhaAtiva: teimosinha > 1,
        teimosinhaConcursos: teimosinha,
        
        totalCotas: input.totalCotas,
        cotasVendidas: 0,
        cotasDisponiveis: input.totalCotas,
        valorPorCota: calculoFinanceiro.valorPorCota,
        
        calculoFinanceiro,
        
        politicaCotasNaoVendidas: input.politicaCotasNaoVendidas || 'garantido',
        
        status: 'rascunho',
        
        configuracaoEstrategia: resultadoEstrategia.configuracao,
        termometroAgressividade: termometro,
        
        criadoEm: agora,
        atualizadoEm: agora,
        criadoPor: input.criadoPor,
      };
      
      // Salvar
      boloesEmMemoria.set(id, bolao);
      logsStatusEmMemoria.set(id, [{ status: 'rascunho', timestamp: agora, automatico: false }]);
      
      return { sucesso: true, dados: bolao, avisos };
      
    } catch (error) {
      return { sucesso: false, erros: [`Erro ao criar bolão: ${error}`] };
    }
  }
  
  /**
   * Obtém bolão por ID com detalhes calculados
   */
  static obterBolao(id: string): ResultadoOperacao<BolaoComDetalhes> {
    const bolao = boloesEmMemoria.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Calcular detalhes adicionais
    const percentualPreenchimento = calcularPercentualPreenchimento(
      bolao.cotasVendidas, 
      bolao.totalCotas
    );
    
    const tempoRestante = this.calcularTempoRestante(bolao.horarioLimiteCompra);
    
    const statusConfig = STATUS_BOLAO[bolao.status];
    const podeComprar = statusConfig?.podeComprar && !tempoRestante.expirado;
    
    const bolaoComDetalhes: BolaoComDetalhes = {
      ...bolao,
      percentualPreenchimento,
      tempoRestante,
      statusLabel: statusConfig?.nome || bolao.status,
      podeComprar,
    };
    
    return { sucesso: true, dados: bolaoComDetalhes };
  }
  
  /**
   * Lista bolões com filtros
   */
  static listarBoloes(filtros?: {
    status?: string[];
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
   * Publica um bolão (rascunho -> ativo)
   */
  static publicarBolao(id: string, usuarioId: string): ResultadoOperacao<BolaoLotomania> {
    const bolao = boloesEmMemoria.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    if (bolao.status !== 'rascunho') {
      return { sucesso: false, erros: [`Bolão não pode ser publicado. Status atual: ${bolao.status}`] };
    }
    
    // Atualizar status
    const agora = new Date();
    bolao.status = 'ativo';
    bolao.publicadoEm = agora;
    bolao.atualizadoEm = agora;
    
    // Log
    const logs = logsStatusEmMemoria.get(id) || [];
    logs.push({ status: 'ativo', timestamp: agora, automatico: false });
    logsStatusEmMemoria.set(id, logs);
    
    boloesEmMemoria.set(id, bolao);
    
    return { sucesso: true, dados: bolao };
  }
  
  /**
   * Compra cotas de um bolão
   */
  static comprarCotas(input: ComprarCotasInput): ResultadoOperacao<{ 
    cotas: number; 
    valorTotal: number;
    novoSaldo: { cotasVendidas: number; cotasDisponiveis: number };
  }> {
    const bolao = boloesEmMemoria.get(input.bolaoId);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Validar compra
    const validacao = validarCompraCotas({
      status: bolao.status,
      horarioLimite: bolao.horarioLimiteCompra,
      cotasDisponiveis: bolao.cotasDisponiveis,
      quantidadeSolicitada: input.quantidadeCotas,
    });
    
    if (!validacao.permitido) {
      return { sucesso: false, erros: [validacao.erro!] };
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
      criadoEm: new Date(),
    });
    cotasVendidasEmMemoria.set(input.bolaoId, compras);
    
    boloesEmMemoria.set(input.bolaoId, bolao);
    
    return { 
      sucesso: true, 
      dados: { 
        cotas: input.quantidadeCotas, 
        valorTotal,
        novoSaldo: {
          cotasVendidas: bolao.cotasVendidas,
          cotasDisponiveis: bolao.cotasDisponiveis,
        }
      }
    };
  }
  
  /**
   * Altera status manualmente (admin)
   */
  static alterarStatus(
    id: string, 
    novoStatus: keyof typeof STATUS_BOLAO, 
    usuarioId: string, 
    motivo?: string
  ): ResultadoOperacao<BolaoLotomania> {
    const bolao = boloesEmMemoria.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Atualizar
    const agora = new Date();
    const statusAnterior = bolao.status;
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
  static duplicarBolao(id: string, criadoPor: string): ResultadoOperacao<BolaoLotomania> {
    const bolaoOriginal = boloesEmMemoria.get(id);
    
    if (!bolaoOriginal) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Calcular próximo sorteio
    const proximoSorteio = calcularProximoSorteio();
    
    // Criar cópia
    return this.criarBolao({
      titulo: `${bolaoOriginal.titulo} (Cópia)`,
      descricao: bolaoOriginal.descricao,
      concurso: bolaoOriginal.concurso,
      dataSorteio: proximoSorteio,
      modo: bolaoOriginal.configuracaoEstrategia.modo,
      quantidadeApostas: bolaoOriginal.quantidadeApostas,
      incluirEspelhos: bolaoOriginal.quantidadeApostasEspelho > 0,
      teimosinha: bolaoOriginal.teimosinhaConcursos,
      totalCotas: bolaoOriginal.totalCotas,
      politicaCotasNaoVendidas: bolaoOriginal.politicaCotasNaoVendidas,
      criadoPor,
    });
  }
  
  /**
   * Obtém logs de status
   */
  static obterLogsStatus(id: string): ResultadoOperacao<{ status: string; timestamp: Date; automatico: boolean }[]> {
    const logs = logsStatusEmMemoria.get(id);
    
    if (!logs) {
      return { sucesso: false, erros: ['Logs não encontrados'] };
    }
    
    return { sucesso: true, dados: logs };
  }
  
  /**
   * Pré-visualização de bolão (sem salvar)
   */
  static preVisualizarBolao(input: CriarBolaoInput): ResultadoOperacao<{
    apostas: ApostaGerada[];
    pool: PoolDezenas;
    calculoFinanceiro: CalculoFinanceiro;
    termometro: { nivel: string; score: number; descricao: string };
  }> {
    try {
      const teimosinha = input.teimosinha || 1;
      
      // Gerar apostas
      const resultadoEstrategia = gerarApostasEstrategia({
        modo: input.modo || 'equilibrado',
        quantidadeApostas: input.quantidadeApostas,
        poolPersonalizado: input.poolPersonalizado,
        incluirEspelhos: input.incluirEspelhos ?? false,
        teimosinha,
      });
      
      // Calcular financeiro
      const apostasPrincipais = resultadoEstrategia.apostas.filter(a => a.tipo === 'principal').length;
      const incluirEspelhos = resultadoEstrategia.apostas.some(a => a.tipo === 'espelho');
      
      const calculoFinanceiro = calcularFinanceiroBolao({
        totalApostas: apostasPrincipais,
        incluirEspelhos,
        teimosinha,
        totalCotas: input.totalCotas,
      });
      
      // Termômetro
      const termometro = calcularNivelAgressividade({
        totalApostas: resultadoEstrategia.apostas.length,
        incluirEspelhos,
        teimosinha,
      });
      
      return {
        sucesso: true,
        dados: {
          apostas: resultadoEstrategia.apostas,
          pool: resultadoEstrategia.pool,
          calculoFinanceiro,
          termometro,
        }
      };
    } catch (error) {
      return { sucesso: false, erros: [`Erro na pré-visualização: ${error}`] };
    }
  }
  
  /**
   * Obtém regras da modalidade
   */
  static obterRegrasModalidade() {
    return REGRAS_MODALIDADE_LOTOMANIA;
  }
  
  /**
   * Obtém regras comerciais
   */
  static obterRegrasComerciais() {
    return REGRAS_COMERCIAIS;
  }
  
  /**
   * Calcula tempo restante até uma data
   */
  private static calcularTempoRestante(dataLimite: Date): TempoRestante {
    const agora = new Date();
    const diff = dataLimite.getTime() - agora.getTime();
    
    if (diff <= 0) {
      return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true };
    }
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { dias, horas, minutos, segundos, expirado: false };
  }
}

// ============================================================
// INICIALIZAÇÃO DE DADOS DE EXEMPLO
// ============================================================

export function inicializarDadosExemploLotomania(): void {
  // Verificar se já existem dados
  if (boloesEmMemoria.size > 0) return;
  
  const agora = new Date();
  const proximoSorteio = calcularProximoSorteio();
  
  // Criar bolão de exemplo 1 - Conservador
  LotomaniaBolaoService.criarBolao({
    titulo: "Lotomania Básico",
    descricao: "Bolão conservador com estratégia de baixo risco",
    concurso: "2851",
    dataSorteio: proximoSorteio,
    modo: 'conservador',
    quantidadeApostas: 3,
    incluirEspelhos: false,
    teimosinha: 1,
    totalCotas: 30,
    criadoPor: 'sistema',
  });
  
  // Criar bolão de exemplo 2 - Equilibrado com espelhos
  const sorteioEq = new Date(proximoSorteio);
  sorteioEq.setDate(sorteioEq.getDate() + 2);
  
  LotomaniaBolaoService.criarBolao({
    titulo: "Lotomania Premium",
    descricao: "Bolão equilibrado com apostas espelho para maior cobertura",
    concurso: "2852",
    dataSorteio: sorteioEq,
    modo: 'equilibrado',
    quantidadeApostas: 8,
    incluirEspelhos: true,
    teimosinha: 1,
    totalCotas: 50,
    criadoPor: 'sistema',
  });
  
  // Criar bolão de exemplo 3 - Agressivo com teimosinha
  const sorteioAg = new Date(proximoSorteio);
  sorteioAg.setDate(sorteioAg.getDate() + 4);
  
  LotomaniaBolaoService.criarBolao({
    titulo: "Lotomania Mega",
    descricao: "Bolão agressivo com teimosinha para múltiplos concursos",
    concurso: "2853",
    dataSorteio: sorteioAg,
    modo: 'agressivo',
    quantidadeApostas: 15,
    incluirEspelhos: true,
    teimosinha: 3,
    totalCotas: 100,
    criadoPor: 'sistema',
  });
  
  // Publicar os bolões criados
  for (const [id, bolao] of boloesEmMemoria) {
    LotomaniaBolaoService.publicarBolao(id, 'sistema');
  }
  
  console.log('[LOTOMANIA] Dados de exemplo inicializados:', boloesEmMemoria.size, 'bolões');
}

export default LotomaniaBolaoService;
