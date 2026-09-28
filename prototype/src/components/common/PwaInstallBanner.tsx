import React, { useState, useEffect } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Capture Chrome/Android install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show for iOS users after a brief delay if not dismissed
    if (isIosDevice) {
      const dismissed = localStorage.getItem('divine_pwa_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('divine_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-fade-in pointer-events-auto">
      <div className="bg-[#1d1d1f] text-white rounded-2xl p-3.5 shadow-2xl border border-white/10 flex items-center justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-white text-[#1d1d1f] flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
          D
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Install Divine School App</span>
          </div>
          <div className="text-[11px] text-[#9a9aa0] truncate mt-0.5">
            {isIos ? 'Add to Home Screen for native experience' : 'Fast access & instant attendance alerts'}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-bold hover:bg-[#0077ed] transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
          >
            {isIos ? <Share2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isIos ? 'Install' : 'Install'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 text-[#9a9aa0] hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal Overlay */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-[#1d1d1f] rounded-3xl p-6 max-w-sm w-full text-center relative border border-[#e5e5ea] shadow-2xl">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-[#9a9aa0] hover:text-[#1d1d1f] p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-xl mx-auto mb-3">
              D
            </div>

            <h3 className="text-base font-bold mb-1">Install on Your iPhone</h3>
            <p className="text-xs text-[#6e6e73] mb-4">
              Get the standalone Divine School app with zero App Store downloads:
            </p>

            <div className="space-y-3 text-left text-xs bg-[#f5f5f7] p-3.5 rounded-2xl border border-[#e5e5ea] mb-4">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <span>Tap the Safari <strong>Share icon</strong> (⎋) at the bottom.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <span>Tap <strong>"Add"</strong> in the top-right corner.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white font-semibold text-xs hover:bg-[#0077ed]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
