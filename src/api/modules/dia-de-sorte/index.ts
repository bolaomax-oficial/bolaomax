/**
 * ============================================================
 * MÓDULO DIA DE SORTE - EXPORTAÇÕES
 * ============================================================
 */

// Regras da Modalidade
export {
  REGRAS_MODALIDADE_DIA_DE_SORTE,
  MESES_DA_SORTE,
  validarNumeroUniverso,
  validarQuantidadeNumeros,
  validarMesDaSorte,
  getMesDaSorteById,
  getLimitesCotasPorNumeros,
  calcularValorAposta,
  validarApostaDiaDeSorte,
  validarListaApostasDiaDeSorte,
  calcularValorTotalBolao,
  formatarNumero,
  formatarNumerosAposta,
  calcularProximoSorteio,
  gerarSurpresinha,
  gerarMesDaSorteAleatorio,
  type RegrasModalidadeDiaDeSorte,
  type LimiteCotasPorNumeros,
  type FaixaPremiacao,
  type MesDaSorte,
  type ApostaDiaDeSorte,
  type ResultadoValidacaoAposta,
} from './regras-modalidade';

// Regras Comerciais
export {
  REGRAS_COMERCIAIS_DIA_DE_SORTE,
  REGRAS_COMERCIAIS,
  STATUS_BOLAO,
  STATUS_PERMITIDOS_COMPRA,
  STATUS_PERMITIDOS_EDICAO,
  STATUS_PERMITIDOS_CANCELAMENTO,
  TRANSICOES_STATUS,
  STATUS_LABELS,
  STATUS_CORES,
  validarValorCotaComercial,
  validarTotalCotasComercial,
  validarPermissaoCompra,
  validarTransicaoStatus,
  validarCompraCotas,
  calcularBolao,
  calcularFinanceiroBolao,
  calcularTermometroAgressividade,
  calcularHorarioLimiteVenda,
  calcularPercentualPreenchimento,
  calcularCotasDisponiveis,
  formatarMoeda,
  gerarCodigoBolao,
  validarBolaoCompleto,
  type RegrasComerciais,
  type PoliticaCotasNaoVendidas,
  type TermometroConfig,
  type StatusBolao,
  type ResultadoValidacaoComercial,
  type CalculoBolao,
  type BolaoDiaDeSorte as BolaoDiaDeSorteComercial,
  type CalculoFinanceiro,
} from './regras-comerciais';

// Regras de Estratégia
export {
  CONFIGURACOES_ESTRATEGIA,
  TERMOMETRO_AGRESSIVIDADE,
  gerarApostaAleatoria,
  gerarApostasCoberturMaxima,
  distribuirApostasPorMeses,
  gerarApostasSurpresinha,
  gerarApostasEstrategia,
  calcularEstatisticasApostas,
  calcularDistribuicaoMeses,
  calcularNivelAgressividade,
  converterParaApostasDiaDeSorte,
  type ModoEstrategia,
  type ConfiguracaoEstrategia,
  type ApostaGerada,
  type DistribuicaoMeses,
  type ResultadoGeracaoApostas,
  type EstatisticasGeracao,
} from './regras-estrategia';

// Schema
export {
  boloesDiaDeSorte,
  apostasDiaDeSorte,
  cotasVendidasDiaDeSorte,
  logStatusDiaDeSorte,
  type BolaoDiaDeSorteDrizzle,
  type BolaoDiaDeSorteInsert,
  type ApostaDiaDeSorteDrizzle,
  type ApostaDiaDeSorteInsert,
  type CotaVendidaDiaDeSorteDrizzle,
  type CotaVendidaDiaDeSorteInsert,
  type LogStatusDiaDeSorteDrizzle,
  type LogStatusDiaDeSorteInsert,
} from './schema';

// Service
export {
  DiaDeSorteBolaoService,
  inicializarDadosExemploDiaDeSorte,
  type CriarBolaoInput,
  type BolaoDiaDeSorte,
  type BolaoComDetalhes,
  type TempoRestante,
  type ResultadoOperacao,
  type ComprarCotasInput,
} from './service';

// Routes
export {
  diaDeSorteRoutes,
  diaDeSorteAdminRoutes,
} from './routes';
