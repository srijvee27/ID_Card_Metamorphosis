import React from 'react';
import MetamorphosisLogo from './MetamorphosisLogo';
import { Settings, Users, Sparkles, ShieldCheck, Database, RefreshCw } from 'lucide-react';

export default function Header({
  savedCount = 0,
  onOpenHistory,
  onOpenSettings,
  serverHealth,
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Metamorphosis Branding */}
        <div className="flex items-center gap-4">
          <MetamorphosisLogo
            iconSize="w-[48px] h-[30px]"
            textSize="text-[20px]"
            taglineSize="text-[9.5px]"
          />
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EA6A2A]/10 text-[#EA6A2A] border border-[#EA6A2A]/20">
              ID Card Studio
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CR80 300-DPI
            </span>
          </div>
        </div>

        {/* Right: Actions and Integrations */}
        <div className="flex items-center gap-2.5">
          {/* Saved Employees History Drawer Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition-all"
          >
            <Users className="w-4 h-4 text-[#EA6A2A]" />
            <span className="hidden sm:inline">Saved Records</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#EA6A2A] text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
