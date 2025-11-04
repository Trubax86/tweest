import { useEffect, useRef } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function VideoPlayer({ url, title, onClose }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // ESC per chiudere
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 🛡️ BLOCCO POPUP E PUBBLICITÀ SUPER AGGRESSIVO
  useEffect(() => {
    let popupBlockCount = 0;
    
    // 1. BLOCCA TUTTI I WINDOW.OPEN
    const originalOpen = window.open;
    window.open = function(...args) {
      const url = args[0]?.toString() || '';
      popupBlockCount++;
      console.log(`🛡️ [POPUP BLOCKED #${popupBlockCount}]`, url.substring(0, 100));
      return null; // BLOCCA SEMPRE
    };

    // 2. BLOCCA CLICK SU LINK ESTERNI
    const blockAds = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;
      
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      
      // WHITELIST: Solo player video
      const allowedDomains = [
        'mixdrop.', 'streamtape.', 'supervideo.', 'maxstream.',
        'vidsrc.', 'embedstream.', 'stayonline.pro', 'uprot.net', 'swzz.xyz'
      ];
      
      if (allowedDomains.some(d => href.includes(d))) return;
      
      // BLACKLIST COMPLETA
      const blockedPatterns = [
        // Domini ads
        'ads.', 'ad.', 'adservice', 'advert', 'promo', 'offer', 'deal',
        'tracking.', 'track.', 'click.', 'redirect.', 'goto.', 'link.',
        
        // Parametri tracking
        'clickid=', 'campaign=', 'banner=', 'zone=', 'aff_', 'affiliate',
        'utm_', 'fbclid=', 'gclid=', 'msclkid=', 'ref=', 'source=',
        
        // Landing pages
        '/lp/', '/landing/', '/promo/', '/offer/', '/deal/', '/click/',
        
        // Network ads
        'doubleclick', 'googlesyndication', 'googleadservices', 'adsense',
        'google-analytics', 'facebook.com/tr', 'twitter.com/i/adsct',
        'outbrain', 'taboola', 'revcontent', 'mgid', 'propellerads',
        
        // Scam/Fake
        'captcha', 'verify', 'robot', 'human', 'check', 'confirm',
        'winner', 'prize', 'reward', 'gift', 'free', 'bonus',
        
        // Shopping
        'aliexpress', 'amazon-', 'ebay-', 'wish.', 'temu.', 'shein.',
        
        // Gaming/Download
        'download', 'install', 'play-now', 'game', 'app-',
        
        // Adult/Dating
        'dating', 'meet', 'singles', 'webcam', 'live-chat', 'adult',
        
        // Crypto/Casino
        'casino', 'bet', 'poker', 'crypto', 'bitcoin', 'trading',
        
        // Specifici trovati
        'fragpunk', 'bethall', 'goldveils', 'playonlinepcgames',
        'videosearchpro', 'prmtracking', 'opera.com'
      ];
      
      // BLOCCA se match pattern
      if (blockedPatterns.some(p => href.includes(p))) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        popupBlockCount++;
        console.log(`🛡️ [LINK BLOCKED #${popupBlockCount}]`, href.substring(0, 80));
        return false;
      }
      
      // BLOCCA URL lunghi (tracking)
      if (href.length > 250) {
        e.preventDefault();
        e.stopPropagation();
        popupBlockCount++;
        console.log(`🛡️ [LONG URL BLOCKED #${popupBlockCount}]`);
        return false;
      }
      
      // BLOCCA troppi parametri
      const paramCount = (href.match(/[?&]/g) || []).length;
      if (paramCount > 4) {
        e.preventDefault();
        e.stopPropagation();
        popupBlockCount++;
        console.log(`🛡️ [TRACKING BLOCKED #${popupBlockCount}]`);
        return false;
      }
    };

    // 3. BLOCCA BEFOREUNLOAD (impedisce redirect)
    const blockBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // 4. BLOCCA FOCUS CHANGE (alcuni popup usano questo)
    const blockFocusChange = (e: FocusEvent) => {
      if (e.target !== window && e.target !== document) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' || target.closest('a')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Aggiungi tutti i listener
    document.addEventListener('click', blockAds, true);
    document.addEventListener('mousedown', blockAds, true);
    document.addEventListener('touchstart', blockAds, true);
    window.addEventListener('beforeunload', blockBeforeUnload);
    window.addEventListener('blur', blockFocusChange);
    
    // Log iniziale
    console.log('🛡️ [TWEEST PROTECTION] Sistema anti-popup attivo');
    
    return () => {
      document.removeEventListener('click', blockAds, true);
      document.removeEventListener('mousedown', blockAds, true);
      document.removeEventListener('touchstart', blockAds, true);
      window.removeEventListener('beforeunload', blockBeforeUnload);
      window.removeEventListener('blur', blockFocusChange);
      window.open = originalOpen;
      console.log(`🛡️ [TWEEST PROTECTION] Disattivato - ${popupBlockCount} popup bloccati`);
    };
  }, []);

  return (
    <>
        <div className="video-player-overlay">
          <div className="video-player-header">
            <h2>{title}</h2>
            <div className="video-player-controls">
              <button className="video-player-close" onClick={onClose}>
                ✕ Chiudi
              </button>
            </div>
          </div>
          
          <div className="video-player-container">
            <iframe
              ref={iframeRef}
              src={url}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen *; web-share"
              allowFullScreen={true}
              sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-presentation"
              referrerPolicy="no-referrer"
              frameBorder="0"
              style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
            />
          </div>

          <div className="video-player-info">
            <p>💡 <strong>Fullscreen:</strong> Usa il pulsante fullscreen del player video (in basso a destra)</p>
            <p>⚠️ <strong>Popup:</strong> Se appaiono popup pubblicitari, chiudili semplicemente (sono esterni al video)</p>
            <p>🎬 <strong>Controlli:</strong> Premi ESC per chiudere il player</p>
          </div>
        </div>
    </>
  );
}
