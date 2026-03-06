/**
 * Sorteios Pré-Cadastrados - Geração Dinâmica
 * Gera sorteios a partir da data atual para garantir que sempre há dados futuros
 */

interface SorteioBase {
  tipo: string;
  numero: number;
  data: string;
  hora: string;
  dia_semana: string;
  mes: number;
  ano: number;
  local_sorteio: string;
  destaque?: boolean;
  descricao?: string;
}

/**
 * Dias da semana em português
 */
const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Formatar data como YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Obter dia da semana em português
 */
function getDiaSemana(date: Date): string {
  return DIAS_SEMANA[date.getDay()];
}

/**
 * Gerar sorteios para uma loteria específica
 */
function gerarSorteiosLoteria(
  tipo: string,
  diasSorteio: number[], // 0=Dom, 1=Seg, etc.
  numeroInicial: number,
  localSorteio: string,
  diasFuturos: number = 90
): SorteioBase[] {
  const sorteios: SorteioBase[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  let numero = numeroInicial;
  
  for (let i = 0; i <= diasFuturos; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);
    
    if (diasSorteio.includes(data.getDay())) {
      sorteios.push({
        tipo,
        numero,
        data: formatDate(data),
        hora: "20:00",
        dia_semana: getDiaSemana(data),
        mes: data.getMonth() + 1,
        ano: data.getFullYear(),
        local_sorteio: localSorteio,
        destaque: false,
      });
      numero++;
    }
  }
  
  return sorteios;
}

/**
 * Gerar todos os sorteios pré-cadastrados
 */
function gerarTodosSorteios(): SorteioBase[] {
  const sorteios: SorteioBase[] = [];
  
  // Mega-Sena: Quarta e Sábado
  sorteios.push(...gerarSorteiosLoteria("megasena", [3, 6], 2795, "São Paulo"));
  
  // Lotofácil: Segunda a Sábado
  sorteios.push(...gerarSorteiosLoteria("lotofacil", [1, 2, 3, 4, 5, 6], 3260, "São Paulo"));
  
  // Quina: Segunda a Sábado
  sorteios.push(...gerarSorteiosLoteria("quina", [1, 2, 3, 4, 5, 6], 6590, "São Paulo"));
  
  // Lotomania: Terça, Quinta e Sábado
  sorteios.push(...gerarSorteiosLoteria("lotomania", [2, 4, 6], 2860, "São Paulo"));
  
  // Dupla Sena: Terça, Quinta e Sábado
  sorteios.push(...gerarSorteiosLoteria("duplasena", [2, 4, 6], 2790, "São Paulo"));
  
  // Timemania: Terça, Quinta e Sábado
  sorteios.push(...gerarSorteiosLoteria("timemania", [2, 4, 6], 2150, "São Paulo"));
  
  // Dia de Sorte: Terça, Quinta e Sábado
  sorteios.push(...gerarSorteiosLoteria("diadesorte", [2, 4, 6], 1060, "São Paulo"));
  
  // Super Sete: Segunda, Quarta e Sexta
  sorteios.push(...gerarSorteiosLoteria("supersete", [1, 3, 5], 680, "São Paulo"));
  
  // Federal: Quarta e Sábado
  sorteios.push(...gerarSorteiosLoteria("federal", [3, 6], 5990, "Rio de Janeiro"));
  
  // Adicionar eventos especiais do ano
  const anoAtual = new Date().getFullYear();
  
  // Mega da Virada - 31 de dezembro
  const megaVirada = sorteios.find(s => s.tipo === "megasena" && s.data === `${anoAtual}-12-31`);
  if (megaVirada) {
    megaVirada.destaque = true;
    megaVirada.descricao = "MEGA DA VIRADA";
  }
  
  // Quina de São João - 24 de junho
  const quinaSaoJoao = sorteios.find(s => s.tipo === "quina" && s.data === `${anoAtual}-06-24`);
  if (quinaSaoJoao) {
    quinaSaoJoao.destaque = true;
    quinaSaoJoao.descricao = "QUINA DE SÃO JOÃO";
  }
  
  // Lotofácil da Independência - 7 de setembro
  const lotofacilIndependencia = sorteios.find(s => s.tipo === "lotofacil" && s.data === `${anoAtual}-09-07`);
  if (lotofacilIndependencia) {
    lotofacilIndependencia.destaque = true;
    lotofacilIndependencia.descricao = "LOTOFÁCIL DA INDEPENDÊNCIA";
  }
  
  return sorteios;
}

// Exportar sorteios pré-gerados
export const sorteiosPrecadastrados = gerarTodosSorteios();

/**
 * Função para gerar ID único
 */
export function gerarIdSorteio(tipo: string, data: string, numero: number): string {
  return `${tipo}_${data.replace(/-/g, '')}_${numero}`;
}

/**
 * Formatar sorteio para inserção no banco
 */
export function formatarSorteioParaBanco(sorteio: SorteioBase) {
  return {
    ...sorteio,
    id: gerarIdSorteio(sorteio.tipo, sorteio.data, sorteio.numero),
    cor: getCoresPorLoteria(sorteio.tipo),
    icone: getIconesPorLoteria(sorteio.tipo),
  };
}

/**
 * Cores por loteria
 */
function getCoresPorLoteria(tipo: string): string {
  const cores: Record<string, string> = {
    megasena: "#10B981",
    lotofacil: "#8B5CF6",
    quina: "#0EA5E9",
    lotomania: "#F97316",
    duplasena: "#A855F7",
    timemania: "#10B981",
    diadesorte: "#F59E0B",
    supersete: "#EC4899",
    federal: "#3B82F6",
  };
  return cores[tipo] || "#6B7280";
}

/**
 * Ícones por loteria
 */
function getIconesPorLoteria(tipo: string): string {
  const icones: Record<string, string> = {
    megasena: "trophy",
    lotofacil: "sparkles",
    quina: "star",
    lotomania: "star",
    duplasena: "repeat",
    timemania: "trophy",
    diadesorte: "calendar",
    supersete: "star",
    federal: "trophy",
  };
  return icones[tipo] || "calendar";
}

/**
 * Formatar todos os sorteios
 */
export function formatarTodosSorteios() {
  return sorteiosPrecadastrados.map(formatarSorteioParaBanco);
}
