import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  getInternationalLotteries,
  getTheLotterAffiliateLink,
  type InternationalLottery,
} from "@/services/lotteryService";
import { trackClick } from "@/services/affiliateTrackingService";
import {
  Globe,
  Trophy,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Shield,
  Award,
  Star,
  ChevronRight,
  Info,
  HelpCircle,
  CheckCircle,
  Lock,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

// Hero Section
const HeroSection = () => {
  const { isDark } = useTheme();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6bTAtNHYySDJ2LTJoMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-violet-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Globe className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white/90">Parceria Oficial TheLotter</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Participe das{" "}
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text">
              Maiores Loterias
            </span>{" "}
            do Mundo
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-purple-100/80 mb-8 max-w-2xl mx-auto">
            Acesse Powerball, Mega Millions, EuroMillions e outras loterias internacionais 
            com prêmios que chegam a bilhões de dólares.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white/90 text-sm">100% Seguro</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white/90 text-sm">Licenciado</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white/90 text-sm">+20 Anos no Mercado</span>
            </div>
          </div>

          {/* CTA */}
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/30"
          >
            <Globe className="w-5 h-5 mr-2" />
            Ver Loterias Disponíveis
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// Lottery Card Component
interface LotteryCardProps {
  lottery: InternationalLottery;
  onViewDetails: (lottery: InternationalLottery) => void;
}

const LotteryCard = ({ lottery, onViewDetails }: LotteryCardProps) => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const handlePlayClick = () => {
    // Track the click
    const { trackedUrl } = trackClick(
      lottery.id,
      user?.email || null,
      getTheLotterAffiliateLink(lottery, user?.email)
    );
    
    // Open in new tab
    window.open(trackedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isDark 
          ? "bg-[#111827] border-[#1C2432] hover:border-purple-500/50" 
          : "bg-white border-gray-200 hover:border-purple-500/50"
      }`}
    >
      {/* Top Color Bar */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: lottery.color }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${lottery.color}20` }}
            >
              {lottery.flag}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {lottery.name}
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {lottery.country}
              </p>
            </div>
          </div>
          <Badge 
            className="text-white border-0 text-xs"
            style={{ backgroundColor: lottery.color }}
          >
            {lottery.drawDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
          </Badge>
        </div>

        {/* Jackpot */}
        <div className={`p-4 rounded-xl mb-4 ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
          <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Jackpot Estimado
          </p>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span 
              className="text-2xl font-black"
              style={{ color: lottery.color }}
            >
              {lottery.currentJackpot}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Próx. Sorteio</p>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              <Calendar className="w-3 h-3 inline mr-1" />
              {lottery.drawTime}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>A partir de</p>
            <p className="text-sm font-bold text-purple-500">
              <DollarSign className="w-3 h-3 inline" />
              {lottery.ticketPrice}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(lottery)}
          >
            <Info className="w-4 h-4 mr-1" />
            Detalhes
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-white font-semibold"
            style={{ backgroundColor: lottery.color }}
            onClick={handlePlayClick}
          >
            Jogar Agora
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Lottery Details Modal
interface LotteryDetailsModalProps {
  lottery: InternationalLottery | null;
  open: boolean;
  onClose: () => void;
}

const LotteryDetailsModal = ({ lottery, open, onClose }: LotteryDetailsModalProps) => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  if (!lottery) return null;

  const handlePlayClick = () => {
    const { trackedUrl } = trackClick(
      lottery.id,
      user?.email || null,
      getTheLotterAffiliateLink(lottery, user?.email)
    );
    window.open(trackedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
        isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white"
      }`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{lottery.flag}</span>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {lottery.name}
              </h2>
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                {lottery.country}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Jackpot Banner */}
          <div 
            className="p-6 rounded-xl text-white text-center"
            style={{ 
              background: `linear-gradient(135deg, ${lottery.color}, ${lottery.color}CC)` 
            }}
          >
            <p className="text-sm opacity-80 mb-1">Jackpot Atual</p>
            <p className="text-4xl font-black">{lottery.currentJackpot}</p>
            <p className="text-sm opacity-80 mt-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Próximo sorteio: {lottery.drawTime}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Sobre a {lottery.name}
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {lottery.description}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
              <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Dias de Sorteio</p>
              <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {lottery.drawDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
              <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Horário</p>
              <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {lottery.drawTime}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
              <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Preço do Bilhete</p>
              <p className="font-semibold text-purple-500">{lottery.ticketPrice}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
              <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Chances de Ganhar</p>
              <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {lottery.odds}
              </p>
            </div>
          </div>

          {/* Prize Tiers */}
          <div>
            <h3 className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              Faixas de Prêmio
            </h3>
            <div className="space-y-2">
              {lottery.prizeTiers.map((tier, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? "bg-[#0A0E14]" : "bg-gray-50"
                  }`}
                >
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {tier.match}
                  </span>
                  <span 
                    className="font-bold"
                    style={{ color: index === 0 ? lottery.color : undefined }}
                  >
                    {tier.prize}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              className="w-full text-white font-bold py-6 text-lg"
              style={{ backgroundColor: lottery.color }}
              onClick={handlePlayClick}
            >
              Continuar no TheLotter
              <ExternalLink className="w-5 h-5 ml-2" />
            </Button>
            
            {/* Disclaimer */}
            <p className={`text-xs text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <Lock className="w-3 h-3 inline mr-1" />
              Você será redirecionado para o site oficial do TheLotter para finalizar sua compra de forma segura.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// FAQ Section
const FAQSection = () => {
  const { isDark } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Como funciona a compra de loterias internacionais?",
      answer: "Através da nossa parceria com TheLotter, você pode comprar bilhetes oficiais de loterias internacionais. Um agente local compra o bilhete em seu nome no país de origem da loteria. O bilhete é digitalizado e armazenado em cofre seguro."
    },
    {
      question: "Os bilhetes são oficiais?",
      answer: "Sim! TheLotter compra bilhetes oficiais diretamente de revendedores licenciados em cada país. Você recebe uma cópia digitalizada do seu bilhete como comprovante."
    },
    {
      question: "Como recebo o prêmio se ganhar?",
      answer: "Prêmios pequenos são creditados automaticamente na sua conta TheLotter. Para prêmios maiores, a equipe do TheLotter ajuda com todo o processo de resgate, incluindo viagem ao país se necessário."
    },
    {
      question: "É legal participar dessas loterias no Brasil?",
      answer: "Sim. Não há lei brasileira que proíba cidadãos de participar de loterias estrangeiras. Você está essencialmente comprando um bilhete através de um serviço de intermediação internacional."
    },
    {
      question: "Quais são os métodos de pagamento aceitos?",
      answer: "TheLotter aceita cartões de crédito internacionais (Visa, Mastercard), carteiras digitais e outros métodos dependendo do país. Os valores são convertidos para a moeda local."
    },
    {
      question: "Preciso pagar impostos sobre os ganhos?",
      answer: "Depende das leis do país da loteria e do Brasil. Alguns países deduzem impostos na fonte. No Brasil, ganhos do exterior podem estar sujeitos a tributação. Recomendamos consultar um contador."
    },
  ];

  return (
    <section className={`py-16 ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Perguntas Frequentes
          </h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Tire suas dúvidas sobre loterias internacionais
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`rounded-xl overflow-hidden ${
                isDark ? "bg-[#111827] border border-[#1C2432]" : "bg-white border border-gray-200"
              }`}
            >
              <button
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                  openIndex === index 
                    ? "bg-purple-500/10" 
                    : isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-50"
                }`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className={`font-semibold pr-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {faq.question}
                </span>
                <ChevronRight 
                  className={`w-5 h-5 transition-transform flex-shrink-0 ${
                    openIndex === index ? "rotate-90" : ""
                  } ${isDark ? "text-gray-400" : "text-gray-500"}`}
                />
              </button>
              {openIndex === index && (
                <div className={`px-5 pb-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Trust Section
const TrustSection = () => {
  const { isDark } = useTheme();

  return (
    <section className={`py-16 ${isDark ? "bg-[#111827]" : "bg-white"}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Por que TheLotter?
            </h2>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Nosso parceiro de confiança para loterias internacionais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className={`p-6 text-center ${
              isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                +20 Anos de Experiência
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Operando desde 2002, TheLotter é o serviço de loterias online mais confiável do mundo.
              </p>
            </Card>

            <Card className={`p-6 text-center ${
              isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                +US$ 125 Milhões Pagos
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Milhares de ganhadores já receberam seus prêmios, incluindo jackpots milionários.
              </p>
            </Card>

            <Card className={`p-6 text-center ${
              isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                100% Seguro
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Transações criptografadas, bilhetes armazenados em cofre e suporte 24/7.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Component
const InternacionalLoterias = () => {
  const { isDark } = useTheme();
  const [lotteries, setLotteries] = useState<InternationalLottery[]>([]);
  const [selectedLottery, setSelectedLottery] = useState<InternationalLottery | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLotteries(getInternationalLotteries());
  }, []);

  const handleViewDetails = (lottery: InternationalLottery) => {
    setSelectedLottery(lottery);
    setModalOpen(true);
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-bolao-dark" : "bg-gray-50"}`}>
      <SEOHead 
        title="Loterias Internacionais"
        description="Bolões das maiores loterias internacionais: Powerball, Mega Millions, EuroMillions. Prêmios em bilhões de dólares!"
        keywords={["powerball brasil", "mega millions", "euromillions", "loteria internacional", "bilhões dólares"]}
        pageType="lottery"
        canonicalUrl="https://bolaomax.com.br/internacional"
      />
      <Header activePage="internacional" />
      
      <main>
        {/* Hero */}
        <HeroSection />

        {/* Lotteries Grid */}
        <section className={`py-16 ${isDark ? "bg-bolao-dark" : "bg-white"}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Loterias Disponíveis
              </h2>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Escolha entre as maiores loterias do mundo
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lotteries.map((lottery) => (
                <LotteryCard 
                  key={lottery.id} 
                  lottery={lottery}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <TrustSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Disclaimer */}
        <section className={`py-8 ${isDark ? "bg-[#111827] border-t border-[#1C2432]" : "bg-gray-50 border-t border-gray-200"}`}>
          <div className="container mx-auto px-4">
            <div className={`max-w-3xl mx-auto text-center text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              <Info className="w-4 h-4 inline mr-2" />
              <span>
                TheLotter é nosso parceiro oficial para loterias internacionais. 
                Ao clicar em "Jogar Agora", você será redirecionado para o site do TheLotter 
                para finalizar sua compra de forma segura. BolãoMax não processa pagamentos 
                para loterias internacionais diretamente.
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />

      {/* Details Modal */}
      <LotteryDetailsModal
        lottery={selectedLottery}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default InternacionalLoterias;
