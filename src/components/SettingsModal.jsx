import React, { useState } from 'react';
import { X, Key, Database, Sparkles, Check, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  customApiKey,
  onSaveApiKey,
  serverHealth,
  onRefreshHealth,
}) {
  const [keyInput, setKeyInput] = useState(customApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EA6A2A]/10 text-[#EA6A2A]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">System Settings & Integrations</h3>
              <p className="text-xs text-slate-400">Configure Gemini API Key & MongoDB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini API Key Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#EA6A2A]" />
              Google AI Studio Gemini API Key
            </label>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Pre-Configured in Backend
            </span>
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Enter custom Gemini API key..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EA6A2A]"
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            By default, the backend uses the provided pre-configured key for the{' '}
            <code className="text-[#EA6A2A]">gemini-2.5-flash-image</code> model. If you wish to use your own
            personal API key from Google AI Studio, paste it above.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA6A2A] hover:bg-[#D85818] text-white text-xs font-semibold transition-all shadow-md shadow-[#EA6A2A]/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <span>Save Key Override</span>
              )}
            </button>
          </div>
        </div>

        {/* MongoDB Atlas Status */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">Database Connection</span>
            </div>
            <button
              type="button"
              onClick={onRefreshHealth}
              className="text-slate-400 hover:text-white p-1"
              title="Refresh connection status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  serverHealth?.mongoConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-medium text-slate-300">
                {serverHealth?.mongoConnected
                  ? 'Connected to MongoDB Atlas'
                  : 'Local Storage Fallback Mode Active'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {serverHealth?.mongoConnected ? 'Live DB' : 'Offline Safe'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            To connect persistent cloud storage, provide your{' '}
            <code className="text-slate-300">MONGODB_URI</code> in <code className="text-slate-300">.env</code> or
            Vercel Project Settings. The app seamlessly functions in Local Storage mode without any configuration.
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>metamorphosis ID Studio v1.0</span>
          <span>CR80 Portrait 300 DPI Export</span>
        </div>
      </div>
    </div>
  );
}
