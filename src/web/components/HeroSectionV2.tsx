import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Trophy,
  Sparkles,
  ChevronRight,
  Zap,
  Shield,
} from "lucide-react";

interface HeroSectionV2Props {
  onOpenLotteryModal: () => void;
  onNavigate?: (path: string) => void;
}

export const HeroSectionV2 = ({ onOpenLotteryModal, onNavigate }: HeroSectionV2Props) => {
  const [activeWinner, setActiveWinner] = useState(0);
  const [prizeAmount, setPrizeAmount] = useState(0);

  // Simulated recent winners data
  const recentWinners = [
    { name: "Maria S.", amount: 15000, lottery: "Lotofácil", time: "há 2h" },
    { name: "João P.", amount: 45000, lottery: "Mega-Sena", time: "há 4h" },
    { name: "Carlos M.", amount: 8500, lottery: "Quina", time: "há 6h" },
    { name: "Ana B.", amount: 22000, lottery: "Lotofácil", time: "há 8h" },
  ];

  // Animate prize counter
  useEffect(() => {
    const winner = recentWinners[activeWinner];
    let current = 0;
    const target = winner.amount;
    const increment = target / 50;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setPrizeAmount(target);
        clearInterval(timer);
      } else {
        setPrizeAmount(Math.floor(current));
      }
    }, 30);

    // Rotate winners every 8 seconds
    const rotateTimer = setTimeout(() => {
      setActiveWinner((prev) => (prev + 1) % recentWinners.length);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(rotateTimer);
    };
  }, [activeWinner]);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Background gradient with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-bolao-dark via-bolao-dark to-bolao-darker" />
      
      {/* Animated background circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-bolao-green/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-bolao-orange/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-bolao-green/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,207,81,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(2,207,81,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-bolao-card border border-bolao-green/20 hover:border-bolao-green/40 transition-colors">
              <div className="w-2 h-2 bg-bolao-green rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-300">
                700+ apostadores participando agora
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="block text-white">Participe de</span>
                <span className="block bg-gradient-to-r from-bolao-green via-bolao-green-light to-bolao-green-dark bg-clip-text text-transparent">
                  bolões maiores
                </span>
                <span className="block text-white">com pouco investimento</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed">
                Invista a partir de R$ 10 em bolões coletivos e multiplique suas chances de ganhar. 
                Milhares de brasileiros já realizaram o sonho com BolãoMax.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 py-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-bolao-green flex-shrink-0" />
                <span className="text-sm text-gray-300">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-bolao-green flex-shrink-0" />
                <span className="text-sm text-gray-300">Saque Instantâneo</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-bolao-green flex-shrink-0" />
                <span className="text-sm text-gray-300">Prêmios Reais</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={onOpenLotteryModal}
                className="bg-gradient-to-r from-bolao-orange to-bolao-orange-dark hover:from-bolao-orange-dark hover:to-bolao-orange text-white font-bold text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all glow-orange"
              >
                Ver Bolões Disponíveis
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate?.("/como-funciona")}
                className="border-bolao-green/50 hover:border-bolao-green hover:bg-bolao-green/10 text-white font-semibold px-8 h-14"
              >
                Como Funciona
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-700">
              <div>
                <div className="text-2xl font-bold text-bolao-green">R$ 50M+</div>
                <div className="text-xs text-gray-400">Distribuídos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-bolao-green">10K+</div>
                <div className="text-xs text-gray-400">Ganhadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-bolao-green">24/7</div>
                <div className="text-xs text-gray-400">Suporte</div>
              </div>
            </div>
          </div>

          {/* Right Column - Live Winners Widget */}
          <div className="relative h-[500px] md:h-[600px]">
            {/* Winner Card */}
            <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/10 to-bolao-orange/5 rounded-3xl border border-bolao-green/20 p-8 flex flex-col justify-between">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-bolao-gold animate-spin" />
                  <span className="text-sm font-semibold text-bolao-gold">Ganhador em Tempo Real</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Parabéns! 🎉</h2>
              </div>

              {/* Main Content */}
              <div className="space-y-6 py-8">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Apostador:</p>
                  <p className="text-3xl font-bold text-white">
                    {recentWinners[activeWinner].name}
                  </p>
                </div>

                <div className="border-t border-gray-600 pt-6">
                  <p className="text-sm text-gray-400 mb-2">Prêmio:</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-bolao-green">
                      R$ {prizeAmount.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bolao-card/50 rounded-lg p-4 border border-bolao-green/10">
                    <p className="text-xs text-gray-400">Loteria</p>
                    <p className="font-semibold text-white text-sm">
                      {recentWinners[activeWinner].lottery}
                    </p>
                  </div>
                  <div className="bg-bolao-card/50 rounded-lg p-4 border border-bolao-green/10">
                    <p className="text-xs text-gray-400">Tempo</p>
                    <p className="font-semibold text-white text-sm">
                      {recentWinners[activeWinner].time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="space-y-4 pt-6 border-t border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Próximo ganhador em:</span>
                  <div className="flex gap-1">
                    {recentWinners.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all ${
                          i === activeWinner
                            ? "bg-bolao-green w-6"
                            : "bg-gray-600 w-1"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <TrendingUp className="w-4 h-4 text-bolao-green flex-shrink-0 mt-1" />
                  <span className="text-xs text-gray-400">
                    Seus ganhos podem ser ainda maiores participando de mais bolões
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-bolao-green/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-bolao-orange/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bolao-darker to-transparent" />
    </section>
  );
};
