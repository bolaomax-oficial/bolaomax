/**
 * BolãoMax - Componente: Share Buttons
 * Botões de compartilhamento para indicações
 */

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface ShareButtonsProps {
  referralCode: string;
  message?: string;
}

export default function ShareButtons({ referralCode, message }: ShareButtonsProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bolaomax.com';
  const referralUrl = `${baseUrl}?ref=${referralCode}`;
  
  const defaultMessage = message || 
    `🎁 Use meu código ${referralCode} e ganhe R$ 10 de bônus na primeira compra no BolãoMax! ${referralUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(defaultMessage);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Convite BolãoMax - Ganhe R$ 10!');
    const body = encodeURIComponent(defaultMessage);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(referralUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(defaultMessage);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite BolãoMax',
          text: defaultMessage,
          url: referralUrl,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* Código de Indicação */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Seu Código de Indicação
        </label>
        <div className="flex gap-2">
          <div className={`flex-1 px-4 py-3 rounded-lg border font-mono text-lg font-bold text-center ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-bolao-green' 
              : 'bg-gray-50 border-gray-300 text-bolao-green'
          }`}>
            {referralCode}
          </div>
          <Button
            onClick={handleCopyCode}
            className={`${
              copied 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-bolao-green hover:bg-bolao-green/90'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Link de Indicação */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Seu Link de Indicação
        </label>
        <div className="flex gap-2">
          <div className={`flex-1 px-4 py-3 rounded-lg border text-sm truncate ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-gray-300' 
              : 'bg-gray-50 border-gray-300 text-gray-700'
          }`}>
            {referralUrl}
          </div>
          <Button
            onClick={handleCopyLink}
            className={`${
              copied 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-bolao-green hover:bg-bolao-green/90'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Botões de Compartilhamento */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Compartilhar via
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* WhatsApp */}
          <Button
            onClick={handleWhatsApp}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </Button>

          {/* Email */}
          <Button
            onClick={handleEmail}
            className="bg-[#EA4335] hover:bg-[#D33426] text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Email
          </Button>

          {/* Facebook */}
          <Button
            onClick={handleFacebook}
            className="bg-[#1877F2] hover:bg-[#166FE5] text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>

          {/* Compartilhar (genérico) */}
          <Button
            onClick={handleGenericShare}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Mais
          </Button>
        </div>
      </div>
    </div>
  );
}
