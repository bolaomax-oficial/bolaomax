import { useState, useEffect } from "react";
import { Users, TrendingUp, Zap, Award } from "lucide-react";

export const SocialProofSection = () => {
  const [stats, setStats] = useState({
    users: 0,
    distributed: 0,
    draws: 0,
    winRate: 0,
  });

  const targetStats = {
    users: 12500,
    distributed: 50000000,
    draws: 450,
    winRate: 98.5,
  };

  useEffect(() => {
    const animateCounter = (target: number, duration: number) => {
      let current = 0;
      const increment = target / (duration / 16);
      
      return setInterval(() => {
        current += increment;
        setStats((prev) => ({
          ...prev,
          users: Math.min(Math.floor(current * 0.25), targetStats.users),
          distributed: Math.min(Math.floor(current * 0.25), targetStats.distributed),
          draws: Math.min(Math.floor(current * 0.25), targetStats.draws),
          winRate: Math.min((current * 0.0197), targetStats.winRate),
        }));
        
        if (current >= target) clearInterval(interval);
      }, 16);
    };

    const interval = animateCounter(200000, 3000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      icon: Users,
      value: `${stats.users.toLocaleString("pt-BR")}+`,
      label: "Apostadores Ativos",
      color: "text-bolao-green",
    },
    {
      icon: TrendingUp,
      value: `R$ ${(stats.distributed / 1000000).toFixed(0)}M+`,
      label: "Prêmios Distribuídos",
      color: "text-bolao-orange",
    },
    {
      icon: Award,
      value: `${stats.draws}+`,
      label: "Sorteios Realizados",
      color: "text-bolao-gold",
    },
    {
      icon: Zap,
      value: `${stats.winRate.toFixed(1)}%`,
      label: "Taxa de Satisfação",
      color: "text-bolao-green-light",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bolao-dark via-transparent to-bolao-dark" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,207,81,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Números que falam por si só
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            BolãoMax é a plataforma de confiança de milhares de apostadores brasileiros
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {metrics.map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="group relative bg-gradient-to-br from-bolao-card/40 to-bolao-card/20 backdrop-blur-sm border border-bolao-green/10 rounded-2xl p-8 hover:border-bolao-green/30 transition-all duration-300 overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Content */}
              <div className="relative z-10 space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-bolao-card border border-bolao-green/20 flex items-center justify-center group-hover:border-bolao-green/50 transition-colors ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {value}
                  </div>
                  <p className="text-sm text-gray-400">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-bolao-green/5 to-bolao-orange/5 border border-bolao-green/10 rounded-2xl p-8 md:p-12">
          <h3 className="text-xl font-bold text-white mb-8 text-center">
            Segurança Garantida por Líderes da Indústria
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-lg bg-bolao-card/50 flex items-center justify-center mx-auto mb-3 border border-bolao-green/20">
                <span className="text-sm font-bold text-bolao-green">SSL</span>
              </div>
              <p className="text-sm text-gray-300">Criptografia 256-bit</p>
            </div>
            
            <div>
              <div className="w-12 h-12 rounded-lg bg-bolao-card/50 flex items-center justify-center mx-auto mb-3 border border-bolao-green/20">
                <span className="text-sm font-bold text-bolao-orange">PCI</span>
              </div>
              <p className="text-sm text-gray-300">Conformidade PCI-DSS</p>
            </div>
            
            <div>
              <div className="w-12 h-12 rounded-lg bg-bolao-card/50 flex items-center justify-center mx-auto mb-3 border border-bolao-green/20">
                <span className="text-sm font-bold text-bolao-gold">LGPD</span>
              </div>
              <p className="text-sm text-gray-300">Proteção de Dados</p>
            </div>
            
            <div>
              <div className="w-12 h-12 rounded-lg bg-bolao-card/50 flex items-center justify-center mx-auto mb-3 border border-bolao-green/20">
                <span className="text-sm font-bold text-bolao-green-light">✓</span>
              </div>
              <p className="text-sm text-gray-300">Regulamentado Legalmente</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 relative bg-gradient-to-r from-bolao-green/20 via-bolao-dark to-bolao-orange/20 border border-bolao-green/30 rounded-2xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,207,81,0.1),transparent)]" />
          <div className="relative z-10">
            <p className="text-gray-300 mb-4">Pronto para começar?</p>
            <p className="text-3xl font-bold text-white mb-2">
              Sua próxima grande vitória pode estar esperando
            </p>
            <p className="text-gray-400 mb-6">
              Não é necessário cartão de crédito para começar. Crie uma conta em 60 segundos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
