import React, { useState } from 'react';
import { Download, FileText, Database, Check, Loader2, Layers } from 'lucide-react';
import { downloadCardAsPng, downloadCardAsPdf, downloadCardAsAi } from '../utils/exportCard';

export default function ExportActions({
  cardRef,
  employee,
  onSaveRecord,
  isSaving,
  lastSavedAt,
}) {
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingAi, setIsExportingAi] = useState(false);

  // 1. Download High-Res PNG (300 DPI)
  const handleDownloadPng = async () => {
    if (!cardRef?.current) return;
    try {
      setIsExportingPng(true);
      await downloadCardAsPng(cardRef.current, employee?.name);
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  // 2. Download Print-Ready PDF
  const handleDownloadPdf = async () => {
    if (!cardRef?.current) return;
    try {
      setIsExportingPdf(true);
      await downloadCardAsPdf(cardRef.current, employee?.name);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 3. Download Adobe Illustrator .ai
  const handleDownloadAi = () => {
    try {
      setIsExportingAi(true);
      downloadCardAsAi(employee);
    } catch (err) {
      console.error('Adobe Illustrator .ai export failed:', err);
    } finally {
      setTimeout(() => setIsExportingAi(false), 600);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {/* 1. Download High-Res PNG (300 DPI) */}
      <button
        type="button"
        onClick={handleDownloadPng}
        disabled={isExportingPng}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {isExportingPng ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#EA6A2A]" />
        ) : (
          <Download className="w-4 h-4 text-[#EA6A2A]" />
        )}
        <span>Download High-Res PNG (300 DPI)</span>
      </button>

      {/* 2. Download Print-Ready PDF */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isExportingPdf}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {isExportingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
        ) : (
          <FileText className="w-4 h-4 text-emerald-400" />
        )}
        <span>Download Print-Ready PDF</span>
      </button>

      {/* 3. Download Adobe Illustrator .ai */}
      <button
        type="button"
        onClick={handleDownloadAi}
        disabled={isExportingAi}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-amber-500/40 hover:border-amber-400/80 shadow-md transition-all active:scale-[0.99] disabled:opacity-50 group"
      >
        {isExportingAi ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        ) : (
          <Layers className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        )}
        <span>Download Adobe Illustrator .ai</span>
      </button>

      {/* 4. Save Employee Record */}
      <button
        type="button"
        onClick={onSaveRecord}
        disabled={isSaving}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#EA6A2A] to-[#D85818] hover:from-[#F27838] hover:to-[#EA6A2A] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#EA6A2A]/25 transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : lastSavedAt ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <Database className="w-4 h-4 text-white" />
        )}
        <span>{lastSavedAt ? 'Card Saved!' : 'Save Employee Record'}</span>
      </button>
    </div>
  );
}

