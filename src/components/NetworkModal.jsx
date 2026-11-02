import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Check, Wifi, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';

export default function NetworkModal({ isOpen, onClose }) {
  const [appName, setAppName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppName(localStorage.getItem('dead_eye_metered_app') || '');
      setApiKey(localStorage.getItem('dead_eye_metered_key') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (appName.trim()) {
        localStorage.setItem('dead_eye_metered_app', appName.trim());
      } else {
        localStorage.removeItem('dead_eye_metered_app');
      }

      if (apiKey.trim()) {
        localStorage.setItem('dead_eye_metered_key', apiKey.trim());
      } else {
        localStorage.removeItem('dead_eye_metered_key');
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        window.location.reload();
      }, 1000);
    }
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dead_eye_metered_app');
      localStorage.removeItem('dead_eye_metered_key');
      setAppName('');
      setApiKey('');
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        window.location.reload();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-stone-950 border-2 border-amber-600/80 rounded-xl p-5 shadow-2xl text-left font-mono"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Globe size={18} />
              <span>CROSS-NETWORK DUELS</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-amber-200"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 space-y-3 text-xs text-desert-sand/90 max-h-[70vh] overflow-y-auto pr-1">
            {/* Status indicator */}
            <div className="p-2.5 bg-stone-900/90 rounded border border-amber-900/40">
              <div className="flex items-center space-x-2 text-green-400 font-bold text-[11px] mb-1">
                <Wifi size={14} />
                <span>WebRTC Relay (STUN + TURNS) Active</span>
              </div>
              <p className="text-[11px] text-desert-sand/70 leading-relaxed">
                Connects duels across different internet networks (one on 5G/4G, one on Wi-Fi) over encrypted TLS port 443.
              </p>
            </div>

            {/* Crucial Tips */}
            <div className="space-y-1.5 text-[11px] bg-amber-950/40 p-2.5 rounded border border-amber-800/40">
              <div className="font-bold text-amber-400 flex items-center space-x-1">
                <HelpCircle size={13} />
                <span>Quick Fixes if Rival Cannot Connect:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-desert-sand/80">
                <li>
                  <strong>In-App Browser:</strong> If opened in WhatsApp or Instagram, tap "..." at top right and choose <strong>Open in Chrome / Safari</strong>.
                </li>
                <li>
                  <strong>VPN:</strong> Disconnect any active VPNs on both phones before creating or joining a room.
                </li>
                <li>
                  <strong>Same Network:</strong> If your mobile carrier blocks WebRTC relays, connecting to the same Wi-Fi or turning on a phone hotspot connects instantly.
                </li>
              </ul>
            </div>

            {/* Custom Metered Relay Key (Optional) */}
            <div className="pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between text-amber-300 font-bold text-[11px] mb-1">
                <span>Optional: Custom Metered Key</span>
                <a
                  href="https://www.metered.ca/tools/openrelay/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 underline hover:text-amber-200 flex items-center space-x-0.5 text-[10px]"
                >
                  <span>Free 20GB</span>
                  <ExternalLink size={10} />
                </a>
              </div>
              <p className="text-[10px] text-desert-sand/60 mb-2">
                Have a free Metered TURN account? Enter your app name & API key for dedicated priority relay:
              </p>

              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase">
                    App Subdomain (e.g. "my-app")
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="my-duel-app"
                    className="w-full mt-0.5 px-2 py-1.5 bg-stone-900 border border-stone-700 rounded text-amber-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="metered_api_key_..."
                    className="w-full mt-0.5 px-2 py-1.5 bg-stone-900 border border-stone-700 rounded text-amber-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={handleSave}
                  className="flex-1 py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {saved ? <Check size={14} /> : null}
                  <span>{saved ? 'SAVED!' : 'SAVE & APPLY'}</span>
                </button>
                {(appName || apiKey) && (
                  <button
                    onClick={handleClear}
                    className="py-1.5 px-2.5 rounded bg-stone-800 text-stone-400 hover:text-red-400 border border-stone-700 text-xs cursor-pointer"
                  >
                    RESET
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

