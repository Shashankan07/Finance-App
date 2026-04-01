import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show our custom UI prompt after a short delay
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If it's already installed, don't show
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50"
      >
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00f0ff] to-[#10b981] rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            {isMobile ? <Smartphone className="text-black" size={24} /> : <Monitor className="text-black" size={24} />}
          </div>
          
          <div className="flex-1 pr-4">
            <h3 className="text-white font-bold text-lg leading-tight mb-1">
              Install Smart Finance
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              {isMobile 
                ? "Download our app to your home screen for quick access and a better experience."
                : "Install the desktop app for a native experience and quick access from your taskbar."}
            </p>
            
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 px-4 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Download size={18} />
              <span>{isMobile ? "Download App" : "Install App"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
