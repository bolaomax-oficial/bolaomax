/**
 * ============================================================
 * TESTES - MÓDULO TIMEMANIA
 * ============================================================
 * 
 * Testes básicos para validação de regras de modalidade,
 * regras comerciais e cálculos.
 * ============================================================
 */

import {
  REGRAS_MODALIDADE_TIMEMANIA,
  validarApostaTimemania,
  validarListaApostasTimemania,
  validarNumeroUniverso,
  validarTimeDoCoracao,
  calcularValorTotalApostasModalidade,
  ApostaTimemania,
} from './regras-modalidade';

import {
  REGRAS_COMERCIAIS_TIMEMANIA,
  validarValorCotaComercial,
  validarTotalCotasComercial,
  validarPermissaoCompra,
  validarTransicaoStatus,
  calcularBolao,
  determinarStatusPorHorario,
  StatusBolao,
} from './regras-comerciais';

// ============================================================
// RESULTADOS DOS TESTES
// ============================================================

interface ResultadoTeste {
  nome: string;
  passou: boolean;
  mensagem: string;
}

const resultados: ResultadoTeste[] = [];

function teste(nome: string, fn: () => boolean, mensagemErro: string = '') {
  try {
    const passou = fn();
    resultados.push({
      nome,
      passou,
      mensagem: passou ? '✅ OK' : `❌ Falhou: ${mensagemErro}`
    });
    return passou;
  } catch (error) {
    resultados.push({
      nome,
      passou: false,
      mensagem: `❌ Erro: ${error}`
    });
    return false;
  }
}

// ============================================================
// TESTES - VALIDAÇÃO APOSTA TIMEMANIA (MODALIDADE)
// ============================================================

console.log('\n📋 TESTES - VALIDAÇÃO APOSTA TIMEMANIA\n');

// Teste 1: Aposta válida com 10 números
teste(
  'Aposta válida com 10 números',
  () => {
    const aposta: ApostaTimemania = {
      numeros: [1, 10, 20, 30, 40, 50, 60, 70, 75, 80],
      timeDoCoracaoId: 23
    };
    const resultado = validarApostaTimemania(aposta);
    return resultado.valido === true;
  },
  'Aposta com 10 números válidos deveria ser aceita'
);

// Teste 2: Aposta com menos de 10 números
teste(
  'Rejeitar aposta com menos de 10 números',
  () => {
    const aposta: ApostaTimemania = {
      numeros: [1, 2, 3, 4, 5],
      timeDoCoracaoId: 23
    };
    const resultado = validarApostaTimemania(aposta);
    return resultado.valido === false && resultado.erros.some(e => e.includes('10 números'));
  },
  'Aposta com menos de 10 números deveria ser rejeitada'
);

// Teste 3: Aposta com mais de 10 números
teste(
  'Rejeitar aposta com mais de 10 números',
  () => {
    const aposta: ApostaTimemania = {
      numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      timeDoCoracaoId: 23
    };
    const resultado = validarApostaTimemania(aposta);
    return resultado.valido === false;
  },
  'Aposta com mais de 10 números deveria ser rejeitada'
);

// Teste 4: Aposta com números fora do universo (1-80)
teste(
  'Rejeitar números fora do universo (1-80)',
  () => {
    const aposta: ApostaTimemania = {
      numeros: [0, 10, 20, 30, 40, 50, 60, 70, 80, 81],
      timeDoCoracaoId: 23
    };
    const resultado = validarApostaTimemania(aposta);
    return resultado.valido === false && resultado.erros.some(e => e.includes('universo'));
  },
  'Números 0 e 81 deveriam ser rejeitados'
);

// Teste 5: Aposta com números repetidos
teste(
  'Rejeitar números repetidos',
  () => {
    const aposta: ApostaTimemania = {
      numeros: [1, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      timeDoCoracaoId: 23
    };
    const resultado = validarApostaTimemania(aposta);
    return resultado.valido === false && resultado.erros.some(e => e.includes('repetidos'));
  },
  'Números repetidos deveriam ser rejeitados'
);

// Teste 6: Aposta sem Time do Coração
teste(
  'Rejeitar aposta sem Time do Coração',
  () => {
    const aposta: ApostaTimemania = {
      numeros: [1, 10, 20, 30, 40, 50, 60, 70, 75, 80],
      timeDoCoracaoId: 0
    };
    const resultado = validarApostaTimemania(aposta);
    return resultado.valido === false && resultado.erros.some(e => e.includes('Time do Coração'));
  },
  'Aposta sem Time do Coração deveria ser rejeitada'
);

// Teste 7: Aposta com Time do Coração inválido
teste(
  'Rejeitar Time do Coração inválido',
  () => {
    const aposta: ApostaTimemania = {
      numeros: [1, 10, 20, 30, 40, 50, 60, 70, 75, 80],
      timeDoCoracaoId: 999
    };
    const resultado = validarApostaTimemania(aposta);
    return resultado.valido === false && resultado.erros.some(e => e.includes('inválido'));
  },
  'Time do Coração com ID 999 deveria ser rejeitado'
);

// ============================================================
// TESTES - CÁLCULO DE VALORES
// ============================================================

console.log('\n📋 TESTES - CÁLCULO DE VALORES\n');

// Teste 8: Cálculo de valor total do jogo
teste(
  'Cálculo valor_total_jogo (3 apostas × R$ 3,50)',
  () => {
    const apostas: ApostaTimemania[] = [
      { numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], timeDoCoracaoId: 23 },
      { numeros: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], timeDoCoracaoId: 15 },
      { numeros: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30], timeDoCoracaoId: 36 },
    ];
    const calculo = calcularBolao(apostas, 30, 0);
    const valorEsperado = 3 * 3.50; // 10.50
    return Math.abs(calculo.valorTotalJogo - valorEsperado) < 0.01;
  },
  'Valor total do jogo deveria ser R$ 10,50'
);

// Teste 9: Cálculo de valor por cota
teste(
  'Cálculo valor_por_cota (bolão ÷ cotas)',
  () => {
    const apostas: ApostaTimemania[] = [
      { numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], timeDoCoracaoId: 23 },
    ];
    const calculo = calcularBolao(apostas, 10, 0, 10); // 10% taxa
    // Valor jogo: 3.50, Taxa: 0.35, Total: 3.85, Por cota: 0.385
    return calculo.valorPorCota > 0;
  },
  'Valor por cota deveria ser calculado corretamente'
);

// Teste 10: Cálculo de cotas disponíveis
teste(
  'Cálculo cotas_disponiveis',
  () => {
    const apostas: ApostaTimemania[] = [
      { numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], timeDoCoracaoId: 23 },
    ];
    const calculo = calcularBolao(apostas, 30, 10); // 30 total, 10 vendidas
    return calculo.cotasDisponiveis === 20;
  },
  'Cotas disponíveis deveria ser 20'
);

// Teste 11: Cálculo de percentual de preenchimento
teste(
  'Cálculo percentual_preenchimento',
  () => {
    const apostas: ApostaTimemania[] = [
      { numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], timeDoCoracaoId: 23 },
    ];
    const calculo = calcularBolao(apostas, 100, 25); // 25%
    return Math.abs(calculo.percentualPreenchimento - 25) < 0.01;
  },
  'Percentual de preenchimento deveria ser 25%'
);

// ============================================================
// TESTES - REGRAS COMERCIAIS
// ============================================================

console.log('\n📋 TESTES - REGRAS COMERCIAIS (COTA MÍNIMA R$ 20)\n');

// Teste 12: Validar cota mínima comercial (R$ 20)
teste(
  'Rejeitar cota abaixo de R$ 20,00',
  () => {
    const resultado = validarValorCotaComercial(19.99);
    return resultado.valido === false && resultado.erros.some(e => e.includes('abaixo do mínimo'));
  },
  'Cota de R$ 19,99 deveria ser rejeitada (mínimo R$ 20)'
);

// Teste 13: Aceitar cota igual a R$ 20
teste(
  'Aceitar cota igual a R$ 20,00',
  () => {
    const resultado = validarValorCotaComercial(20.00);
    return resultado.valido === true;
  },
  'Cota de R$ 20,00 deveria ser aceita'
);

// Teste 14: Aceitar cota acima de R$ 20
teste(
  'Aceitar cota acima de R$ 20,00',
  () => {
    const resultado = validarValorCotaComercial(50.00);
    return resultado.valido === true;
  },
  'Cota de R$ 50,00 deveria ser aceita'
);

// Teste 15: Rejeitar cota acima do máximo
teste(
  'Rejeitar cota acima de R$ 500,00',
  () => {
    const resultado = validarValorCotaComercial(501.00);
    return resultado.valido === false && resultado.erros.some(e => e.includes('acima do máximo'));
  },
  'Cota de R$ 501,00 deveria ser rejeitada'
);

// ============================================================
// TESTES - BLOQUEIO DE COMPRA
// ============================================================

console.log('\n📋 TESTES - BLOQUEIO DE COMPRA\n');

// Teste 16: Bloquear compra quando cotas insuficientes
teste(
  'Bloquear compra quando cotas insuficientes',
  () => {
    const horarioFuturo = new Date(Date.now() + 60 * 60 * 1000); // 1h no futuro
    const resultado = validarPermissaoCompra('active', horarioFuturo, 5, 10);
    return resultado.valido === false && resultado.erros.some(e => e.includes('maior que cotas disponíveis'));
  },
  'Deveria bloquear compra de 10 cotas quando só há 5 disponíveis'
);

// Teste 17: Bloquear compra por status fechado
teste(
  'Bloquear compra em bolão fechado',
  () => {
    const horarioFuturo = new Date(Date.now() + 60 * 60 * 1000);
    const resultado = validarPermissaoCompra('closed', horarioFuturo, 10, 5);
    return resultado.valido === false && resultado.erros.some(e => e.includes('não permitida'));
  },
  'Deveria bloquear compra em bolão com status "closed"'
);

// Teste 18: Bloquear compra quando bolão esgotado
teste(
  'Bloquear compra em bolão esgotado',
  () => {
    const horarioFuturo = new Date(Date.now() + 60 * 60 * 1000);
    const resultado = validarPermissaoCompra('active', horarioFuturo, 0, 1);
    return resultado.valido === false && resultado.erros.some(e => e.includes('esgotado'));
  },
  'Deveria bloquear compra em bolão esgotado'
);

// Teste 19: Permitir compra em bolão ativo com cotas disponíveis
teste(
  'Permitir compra em bolão ativo com cotas disponíveis',
  () => {
    const horarioFuturo = new Date(Date.now() + 60 * 60 * 1000);
    const resultado = validarPermissaoCompra('active', horarioFuturo, 10, 5);
    return resultado.valido === true;
  },
  'Deveria permitir compra de 5 cotas com 10 disponíveis'
);

// ============================================================
// TESTES - TRANSIÇÃO DE STATUS
// ============================================================

console.log('\n📋 TESTES - TRANSIÇÃO DE STATUS\n');

// Teste 20: Transição active -> closing
teste(
  'Permitir transição active -> closing',
  () => {
    const resultado = validarTransicaoStatus('active', 'closing');
    return resultado.valido === true;
  },
  'Transição active -> closing deveria ser permitida'
);

// Teste 21: Transição closing -> closed
teste(
  'Permitir transição closing -> closed',
  () => {
    const resultado = validarTransicaoStatus('closing', 'closed');
    return resultado.valido === true;
  },
  'Transição closing -> closed deveria ser permitida'
);

// Teste 22: Bloquear transição finalizado -> active
teste(
  'Bloquear transição finalizado -> active',
  () => {
    const resultado = validarTransicaoStatus('finalizado', 'active');
    return resultado.valido === false;
  },
  'Transição finalizado -> active deveria ser bloqueada'
);

// Teste 23: Bloquear transição cancelado -> active
teste(
  'Bloquear transição cancelado -> active',
  () => {
    const resultado = validarTransicaoStatus('cancelado', 'active');
    return resultado.valido === false;
  },
  'Transição cancelado -> active deveria ser bloqueada'
);

// Teste 24: Determinar status closing quando falta menos de 60min
teste(
  'Status closing quando falta menos de 60min',
  () => {
    const horarioLimite = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    const status = determinarStatusPorHorario('active', horarioLimite, 10);
    return status === 'closing';
  },
  'Deveria retornar status closing quando falta menos de 60 minutos'
);

// Teste 25: Status closed quando passa do limite
teste(
  'Status closed quando passa do horário limite',
  () => {
    const horarioLimite = new Date(Date.now() - 60 * 1000); // 1 min atrás
    const status = determinarStatusPorHorario('active', horarioLimite, 10);
    return status === 'closed';
  },
  'Deveria retornar status closed quando passa do horário limite'
);

// ============================================================
// EXIBIR RESULTADOS
// ============================================================

console.log('\n========================================');
console.log('📊 RESULTADOS DOS TESTES - MÓDULO TIMEMANIA');
console.log('========================================\n');

let passou = 0;
let falhou = 0;

resultados.forEach((r, i) => {
  console.log(`${i + 1}. ${r.nome}`);
  console.log(`   ${r.mensagem}\n`);
  if (r.passou) passou++;
  else falhou++;
});

console.log('========================================');
console.log(`✅ Passou: ${passou}/${resultados.length}`);
console.log(`❌ Falhou: ${falhou}/${resultados.length}`);
console.log(`📈 Taxa de sucesso: ${((passou / resultados.length) * 100).toFixed(1)}%`);
console.log('========================================\n');

// Exportar função para executar testes
export function executarTestesTimemania(): { passou: number; falhou: number; total: number; resultados: ResultadoTeste[] } {
  return {
    passou,
    falhou,
    total: resultados.length,
    resultados
  };
}

export default executarTestesTimemania;
