/**
 * ============================================================
 * SERVIÇO DE BOLÕES DIA DE SORTE
 * ============================================================
 * 
 * Serviço principal para operações de bolões do Dia de Sorte.
 * Utiliza separação clara entre regras de MODALIDADE, COMERCIAIS
 * e ESTRATÉGIA.
 * ============================================================
 */

import { v4 as uuidv4 } from 'uuid';
import {
  REGRAS_MODALIDADE_DIA_DE_SORTE,
  ApostaDiaDeSorte,
  validarListaApostasDiaDeSorte,
  formatarNumero,
  calcularProximoSorteio,
  getMesDaSorteById,
  MESES_DA_SORTE,
} from './regras-modalidade';

import {
  REGRAS_COMERCIAIS,
  STATUS_BOLAO,
  calcularFinanceiroBolao,
  calcularHorarioLimiteVenda,
  calcularPercentualPreenchimento,
  calcularCotasDisponiveis,
  validarCompraCotas,
  gerarCodigoBolao,
  type StatusBolao,
  type CalculoFinanceiro,
} from './regras-comerciais';

import {
  gerarApostasEstrategia,
  calcularNivelAgressividade,
  converterParaApostasDiaDeSorte,
  type ModoEstrategia,
  type ApostaGerada,
  type ConfiguracaoEstrategia,
  type ResultadoGeracaoApostas,
  type DistribuicaoMeses,
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
  numerosPorAposta?: number;
  mesDaSorteFavorito?: number;
  distribuirMeses?: boolean;
  teimosinha?: number;
  
  // Cotas
  totalCotas: number;
  taxaPercentual?: number;
  politicaCotasNaoVendidas?: 'garantido' | 'condicionado' | 'hibrido';
  
  // Metadados
  criadoPor: string;
}

export interface BolaoDiaDeSorte {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  modalidade: 'dia-de-sorte';
  
  // Concurso
  concurso: string;
  dataSorteio: Date;
  horarioLimiteCompra: Date;
  
  // Apostas
  apostas: ApostaGerada[];
  quantidadeApostas: number;
  quantidadeNumerosPorAposta: number;
  
  // Mês da Sorte
  mesDaSorteId: number;
  mesDaSorteNome: string;
  distribuicaoMeses: DistribuicaoMeses[];
  
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
  status: StatusBolao;
  
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

export interface BolaoComDetalhes extends BolaoDiaDeSorte {
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
// ============================================================

const boloes: Map<string, BolaoDiaDeSorte> = new Map();
const logsStatus: Map<string, Array<{
  id: string;
  bolaoId: string;
  statusAnterior: StatusBolao;
  statusNovo: StatusBolao;
  motivo?: string;
  usuarioId?: string;
  automatico: boolean;
  criadoEm: Date;
}>> = new Map();

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function calcularTempoRestante(dataLimite: Date): TempoRestante {
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

function adicionarLogStatus(
  bolaoId: string,
  statusAnterior: StatusBolao,
  statusNovo: StatusBolao,
  motivo?: string,
  usuarioId?: string,
  automatico: boolean = false
): void {
  const logs = logsStatus.get(bolaoId) || [];
  logs.push({
    id: uuidv4(),
    bolaoId,
    statusAnterior,
    statusNovo,
    motivo,
    usuarioId,
    automatico,
    criadoEm: new Date(),
  });
  logsStatus.set(bolaoId, logs);
}

// ============================================================
// CLASSE DE SERVIÇO
// ============================================================

export class DiaDeSorteBolaoService {
  
  /**
   * Cria um novo bolão
   */
  static criarBolao(input: CriarBolaoInput): ResultadoOperacao<BolaoDiaDeSorte> {
    const erros: string[] = [];
    const avisos: string[] = [];
    
    // Validar entrada básica
    if (!input.titulo || input.titulo.trim().length < 3) {
      erros.push('Título deve ter pelo menos 3 caracteres');
    }
    if (!input.concurso) {
      erros.push('Número do concurso é obrigatório');
    }
    if (input.quantidadeApostas < 1 || input.quantidadeApostas > REGRAS_MODALIDADE_DIA_DE_SORTE.apostasPorBolaoMax) {
      erros.push(`Quantidade de apostas deve ser entre 1 e ${REGRAS_MODALIDADE_DIA_DE_SORTE.apostasPorBolaoMax}`);
    }
    
    if (erros.length > 0) {
      return { sucesso: false, erros };
    }
    
    // Gerar apostas usando estratégia
    const resultadoGeracao = gerarApostasEstrategia({
      modo: input.modo,
      quantidadeApostas: input.quantidadeApostas,
      numerosPorAposta: input.numerosPorAposta,
      mesDaSorteFavorito: input.mesDaSorteFavorito,
      distribuirMeses: input.distribuirMeses,
      teimosinha: input.teimosinha,
    });
    
    // Converter para formato de aposta e validar
    const apostasModalidade = converterParaApostasDiaDeSorte(resultadoGeracao.apostas);
    const validacaoModalidade = validarListaApostasDiaDeSorte(apostasModalidade);
    
    if (!validacaoModalidade.valido) {
      erros.push(...validacaoModalidade.erros);
      return { sucesso: false, erros };
    }
    
    // Calcular valores financeiros
    const calculoFinanceiro = calcularFinanceiroBolao({
      apostas: apostasModalidade,
      totalCotas: input.totalCotas,
      taxaPercentual: input.taxaPercentual,
    });
    
    // Validar valor da cota comercialmente
    if (calculoFinanceiro.valorPorCota < REGRAS_COMERCIAIS.cotaMinimaComercial) {
      erros.push(`Valor por cota (R$ ${calculoFinanceiro.valorPorCota.toFixed(2)}) abaixo do mínimo comercial (R$ ${REGRAS_COMERCIAIS.cotaMinimaComercial.toFixed(2)})`);
    }
    
    if (erros.length > 0) {
      return { sucesso: false, erros };
    }
    
    // Calcular termômetro de agressividade
    const termometro = calcularNivelAgressividade(resultadoGeracao.apostas, resultadoGeracao.configuracao);
    
    // Determinar mês da sorte principal
    const mesPrincipal = resultadoGeracao.distribuicaoMeses[0] || {
      mesId: input.mesDaSorteFavorito || 1,
      mesNome: getMesDaSorteById(input.mesDaSorteFavorito || 1)?.nome || 'Janeiro',
    };
    
    // Criar bolão
    const agora = new Date();
    const bolao: BolaoDiaDeSorte = {
      id: uuidv4(),
      codigo: gerarCodigoBolao(),
      titulo: input.titulo.trim(),
      descricao: input.descricao?.trim() || '',
      modalidade: 'dia-de-sorte',
      
      concurso: input.concurso,
      dataSorteio: input.dataSorteio,
      horarioLimiteCompra: calcularHorarioLimiteVenda(input.dataSorteio),
      
      apostas: resultadoGeracao.apostas,
      quantidadeApostas: resultadoGeracao.apostas.length,
      quantidadeNumerosPorAposta: resultadoGeracao.configuracao.numerosPorAposta,
      
      mesDaSorteId: mesPrincipal.mesId,
      mesDaSorteNome: mesPrincipal.mesNome,
      distribuicaoMeses: resultadoGeracao.distribuicaoMeses,
      
      teimosinhaAtiva: (input.teimosinha || 1) > 1,
      teimosinhaConcursos: input.teimosinha || 1,
      
      totalCotas: input.totalCotas,
      cotasVendidas: 0,
      cotasDisponiveis: input.totalCotas,
      valorPorCota: calculoFinanceiro.valorPorCota,
      
      calculoFinanceiro,
      
      politicaCotasNaoVendidas: input.politicaCotasNaoVendidas || 'garantido',
      
      status: 'rascunho',
      
      configuracaoEstrategia: resultadoGeracao.configuracao,
      termometroAgressividade: termometro,
      
      criadoEm: agora,
      atualizadoEm: agora,
      criadoPor: input.criadoPor,
    };
    
    // Salvar
    boloes.set(bolao.id, bolao);
    
    // Log inicial
    adicionarLogStatus(bolao.id, 'rascunho', 'rascunho', 'Bolão criado', input.criadoPor, false);
    
    return {
      sucesso: true,
      dados: bolao,
      avisos: avisos.length > 0 ? avisos : undefined,
    };
  }
  
  /**
   * Pré-visualiza um bolão sem salvar
   */
  static preVisualizarBolao(input: CriarBolaoInput): ResultadoOperacao<BolaoDiaDeSorte> {
    // Mesma lógica do criarBolao, mas não salva
    const resultadoGeracao = gerarApostasEstrategia({
      modo: input.modo,
      quantidadeApostas: input.quantidadeApostas,
      numerosPorAposta: input.numerosPorAposta,
      mesDaSorteFavorito: input.mesDaSorteFavorito,
      distribuirMeses: input.distribuirMeses,
      teimosinha: input.teimosinha,
    });
    
    const apostasModalidade = converterParaApostasDiaDeSorte(resultadoGeracao.apostas);
    
    const calculoFinanceiro = calcularFinanceiroBolao({
      apostas: apostasModalidade,
      totalCotas: input.totalCotas,
      taxaPercentual: input.taxaPercentual,
    });
    
    const termometro = calcularNivelAgressividade(resultadoGeracao.apostas, resultadoGeracao.configuracao);
    
    const mesPrincipal = resultadoGeracao.distribuicaoMeses[0] || {
      mesId: input.mesDaSorteFavorito || 1,
      mesNome: getMesDaSorteById(input.mesDaSorteFavorito || 1)?.nome || 'Janeiro',
    };
    
    const agora = new Date();
    const preview: BolaoDiaDeSorte = {
      id: 'preview',
      codigo: 'PREVIEW',
      titulo: input.titulo || 'Preview',
      descricao: input.descricao || '',
      modalidade: 'dia-de-sorte',
      
      concurso: input.concurso,
      dataSorteio: input.dataSorteio,
      horarioLimiteCompra: calcularHorarioLimiteVenda(input.dataSorteio),
      
      apostas: resultadoGeracao.apostas,
      quantidadeApostas: resultadoGeracao.apostas.length,
      quantidadeNumerosPorAposta: resultadoGeracao.configuracao.numerosPorAposta,
      
      mesDaSorteId: mesPrincipal.mesId,
      mesDaSorteNome: mesPrincipal.mesNome,
      distribuicaoMeses: resultadoGeracao.distribuicaoMeses,
      
      teimosinhaAtiva: (input.teimosinha || 1) > 1,
      teimosinhaConcursos: input.teimosinha || 1,
      
      totalCotas: input.totalCotas,
      cotasVendidas: 0,
      cotasDisponiveis: input.totalCotas,
      valorPorCota: calculoFinanceiro.valorPorCota,
      
      calculoFinanceiro,
      
      politicaCotasNaoVendidas: input.politicaCotasNaoVendidas || 'garantido',
      
      status: 'rascunho',
      
      configuracaoEstrategia: resultadoGeracao.configuracao,
      termometroAgressividade: termometro,
      
      criadoEm: agora,
      atualizadoEm: agora,
      criadoPor: 'preview',
    };
    
    return { sucesso: true, dados: preview };
  }
  
  /**
   * Obtém um bolão pelo ID
   */
  static obterBolao(id: string): ResultadoOperacao<BolaoComDetalhes> {
    const bolao = boloes.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    const detalhes: BolaoComDetalhes = {
      ...bolao,
      percentualPreenchimento: calcularPercentualPreenchimento(bolao.cotasVendidas, bolao.totalCotas),
      tempoRestante: calcularTempoRestante(bolao.horarioLimiteCompra),
      statusLabel: STATUS_BOLAO[bolao.status].label,
      podeComprar: ['ativo', 'encerrando'].includes(bolao.status) && 
                   bolao.cotasDisponiveis > 0 &&
                   new Date() < bolao.horarioLimiteCompra,
    };
    
    return { sucesso: true, dados: detalhes };
  }
  
  /**
   * Lista bolões com filtros
   */
  static listarBoloes(filtros?: {
    status?: string[];
    limite?: number;
    pagina?: number;
  }): ResultadoOperacao<BolaoComDetalhes[]> {
    let lista = Array.from(boloes.values());
    
    // Filtrar por status
    if (filtros?.status && filtros.status.length > 0) {
      lista = lista.filter(b => filtros.status!.includes(b.status));
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    lista.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    
    // Paginação
    const limite = filtros?.limite || 20;
    const pagina = filtros?.pagina || 1;
    const inicio = (pagina - 1) * limite;
    lista = lista.slice(inicio, inicio + limite);
    
    // Adicionar detalhes
    const listaComDetalhes: BolaoComDetalhes[] = lista.map(bolao => ({
      ...bolao,
      percentualPreenchimento: calcularPercentualPreenchimento(bolao.cotasVendidas, bolao.totalCotas),
      tempoRestante: calcularTempoRestante(bolao.horarioLimiteCompra),
      statusLabel: STATUS_BOLAO[bolao.status].label,
      podeComprar: ['ativo', 'encerrando'].includes(bolao.status) && 
                   bolao.cotasDisponiveis > 0 &&
                   new Date() < bolao.horarioLimiteCompra,
    }));
    
    return { sucesso: true, dados: listaComDetalhes };
  }
  
  /**
   * Publica um bolão
   */
  static publicarBolao(id: string, usuarioId: string): ResultadoOperacao<BolaoDiaDeSorte> {
    const bolao = boloes.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    if (bolao.status !== 'rascunho') {
      return { sucesso: false, erros: ['Apenas bolões em rascunho podem ser publicados'] };
    }
    
    const statusAnterior = bolao.status;
    bolao.status = 'publicado';
    bolao.publicadoEm = new Date();
    bolao.atualizadoEm = new Date();
    
    boloes.set(id, bolao);
    adicionarLogStatus(id, statusAnterior, 'publicado', 'Bolão publicado', usuarioId, false);
    
    return { sucesso: true, dados: bolao };
  }
  
  /**
   * Altera status do bolão
   */
  static alterarStatus(
    id: string, 
    novoStatus: StatusBolao, 
    usuarioId: string,
    motivo?: string
  ): ResultadoOperacao<BolaoDiaDeSorte> {
    const bolao = boloes.get(id);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    const statusAnterior = bolao.status;
    bolao.status = novoStatus;
    bolao.atualizadoEm = new Date();
    
    if (novoStatus === 'ativo' && statusAnterior === 'publicado') {
      bolao.publicadoEm = new Date();
    }
    
    boloes.set(id, bolao);
    adicionarLogStatus(id, statusAnterior, novoStatus, motivo, usuarioId, false);
    
    return { sucesso: true, dados: bolao };
  }
  
  /**
   * Compra cotas
   */
  static comprarCotas(input: ComprarCotasInput): ResultadoOperacao<{
    bolao: BolaoDiaDeSorte;
    cotasCompradas: number;
    valorTotal: number;
  }> {
    const bolao = boloes.get(input.bolaoId);
    
    if (!bolao) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    // Validar compra
    const validacao = validarCompraCotas({
      status: bolao.status,
      horarioLimiteCompra: bolao.horarioLimiteCompra,
      cotasDisponiveis: bolao.cotasDisponiveis,
      quantidadeCotas: input.quantidadeCotas,
    });
    
    if (!validacao.valido) {
      return { sucesso: false, erros: validacao.erros, avisos: validacao.avisos };
    }
    
    // Atualizar bolão
    bolao.cotasVendidas += input.quantidadeCotas;
    bolao.cotasDisponiveis = calcularCotasDisponiveis(bolao.totalCotas, bolao.cotasVendidas);
    bolao.atualizadoEm = new Date();
    
    boloes.set(input.bolaoId, bolao);
    
    return {
      sucesso: true,
      dados: {
        bolao,
        cotasCompradas: input.quantidadeCotas,
        valorTotal: input.quantidadeCotas * bolao.valorPorCota,
      },
      avisos: validacao.avisos,
    };
  }
  
  /**
   * Duplica um bolão
   */
  static duplicarBolao(id: string, criadoPor: string): ResultadoOperacao<BolaoDiaDeSorte> {
    const bolaoOriginal = boloes.get(id);
    
    if (!bolaoOriginal) {
      return { sucesso: false, erros: ['Bolão não encontrado'] };
    }
    
    const agora = new Date();
    const novoBolao: BolaoDiaDeSorte = {
      ...bolaoOriginal,
      id: uuidv4(),
      codigo: gerarCodigoBolao(),
      titulo: `${bolaoOriginal.titulo} (cópia)`,
      status: 'rascunho',
      cotasVendidas: 0,
      cotasDisponiveis: bolaoOriginal.totalCotas,
      criadoEm: agora,
      atualizadoEm: agora,
      publicadoEm: undefined,
      criadoPor,
    };
    
    boloes.set(novoBolao.id, novoBolao);
    adicionarLogStatus(novoBolao.id, 'rascunho', 'rascunho', `Duplicado de ${bolaoOriginal.codigo}`, criadoPor, false);
    
    return { sucesso: true, dados: novoBolao };
  }
  
  /**
   * Obtém logs de status
   */
  static obterLogsStatus(bolaoId: string): ResultadoOperacao<Array<{
    id: string;
    statusAnterior: StatusBolao;
    statusNovo: StatusBolao;
    motivo?: string;
    usuarioId?: string;
    automatico: boolean;
    criadoEm: Date;
  }>> {
    const logs = logsStatus.get(bolaoId);
    
    if (!logs) {
      return { sucesso: true, dados: [] };
    }
    
    return { sucesso: true, dados: logs };
  }
  
  /**
   * Obtém regras da modalidade
   */
  static obterRegrasModalidade() {
    return REGRAS_MODALIDADE_DIA_DE_SORTE;
  }
  
  /**
   * Obtém regras comerciais
   */
  static obterRegrasComerciais() {
    return REGRAS_COMERCIAIS;
  }
  
  /**
   * Obtém lista de meses da sorte
   */
  static obterMesesDaSorte() {
    return MESES_DA_SORTE;
  }
}

// ============================================================
// INICIALIZAÇÃO COM DADOS DE EXEMPLO
// ============================================================

export function inicializarDadosExemploDiaDeSorte(): void {
  // Limpar dados existentes
  boloes.clear();
  logsStatus.clear();
  
  const proximoSorteio = calcularProximoSorteio();
  
  // Criar bolões de exemplo
  const exemplos = [
    {
      titulo: 'Dia de Sorte Premium',
      descricao: 'Bolão premium com 10 apostas de 10 números cada',
      concurso: '1000',
      quantidadeApostas: 10,
      numerosPorAposta: 10,
      totalCotas: 50,
      modo: 'equilibrado' as ModoEstrategia,
      mesDaSorteFavorito: 3, // Março
    },
    {
      titulo: 'Dia de Sorte Básico',
      descricao: 'Bolão básico com apostas simples de 7 números',
      concurso: '1000',
      quantidadeApostas: 5,
      numerosPorAposta: 7,
      totalCotas: 25,
      modo: 'conservador' as ModoEstrategia,
      distribuirMeses: true,
    },
    {
      titulo: 'Dia de Sorte Mega',
      descricao: 'Bolão com cobertura máxima - 10 apostas de 15 números',
      concurso: '1000',
      quantidadeApostas: 10,
      numerosPorAposta: 15,
      totalCotas: 100,
      modo: 'agressivo' as ModoEstrategia,
      mesDaSorteFavorito: 12, // Dezembro
    },
  ];
  
  exemplos.forEach((exemplo, index) => {
    const resultado = DiaDeSorteBolaoService.criarBolao({
      titulo: exemplo.titulo,
      descricao: exemplo.descricao,
      concurso: exemplo.concurso,
      dataSorteio: new Date(proximoSorteio.getTime() + index * 2 * 24 * 60 * 60 * 1000),
      quantidadeApostas: exemplo.quantidadeApostas,
      numerosPorAposta: exemplo.numerosPorAposta,
      totalCotas: exemplo.totalCotas,
      modo: exemplo.modo,
      mesDaSorteFavorito: exemplo.mesDaSorteFavorito,
      distribuirMeses: exemplo.distribuirMeses,
      criadoPor: 'sistema',
    });
    
    if (resultado.sucesso && resultado.dados) {
      // Publicar e ativar alguns
      if (index < 2) {
        DiaDeSorteBolaoService.publicarBolao(resultado.dados.id, 'sistema');
        DiaDeSorteBolaoService.alterarStatus(resultado.dados.id, 'ativo', 'sistema', 'Ativado para vendas');
        
        // Simular algumas vendas
        const cotasVendidas = Math.floor(resultado.dados.totalCotas * 0.5);
        const bolao = boloes.get(resultado.dados.id);
        if (bolao) {
          bolao.cotasVendidas = cotasVendidas;
          bolao.cotasDisponiveis = bolao.totalCotas - cotasVendidas;
          boloes.set(bolao.id, bolao);
        }
      }
    }
  });
  
  console.log('[DIA DE SORTE] Dados de exemplo inicializados:', boloes.size, 'bolões');
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export default DiaDeSorteBolaoService;
