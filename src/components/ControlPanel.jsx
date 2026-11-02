import React, { useRef } from 'react';
import {
  User,
  Briefcase,
  CreditCard,
  Droplet,
  Phone,
  Upload,
  Sparkles,
  RotateCcw,
  ZoomIn,
  MoveHorizontal,
  MoveVertical,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import { BLOOD_GROUPS } from '../constants/defaults';
import { fileToBase64 } from '../utils/backgroundRemover';

export default function ControlPanel({
  employee,
  onChange,
  onProcessAiPhoto,
  isProcessingAi,
  aiStatusMessage,
  onResetToDefaults,
  onLoadPreset,
}) {
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    onChange({ ...employee, [field]: value });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      onChange({
        ...employee,
        photoBase64: base64,
        originalPhotoBase64: base64,
        photoScale: 1.0,
        photoOffsetX: 0,
        photoOffsetY: 0,
        useAiPhoto: true,
      });
    } catch (err) {
      console.error('File reading failed:', err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Employee Details Card */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EA6A2A]/10 text-[#EA6A2A]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Employee Information</h2>
              <p className="text-xs text-slate-400">Dynamic fields update the ID card in real-time</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset to template defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name <span className="text-[#EA6A2A]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={employee.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Mir Mynul Islam"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EA6A2A] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Designation / Post */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Designation / Position <span className="text-[#EA6A2A]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={employee.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                placeholder="e.g. Deputy Manager"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EA6A2A] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Grid: NID & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NID Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                NID Number <span className="text-[#EA6A2A]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={employee.nid}
                  onChange={(e) => handleInputChange('nid', e.target.value)}
                  placeholder="e.g. 3718652691"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EA6A2A] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Blood Group <span className="text-[#EA6A2A]">*</span>
              </label>
              <div className="relative">
                <select
                  value={employee.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#EA6A2A] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg} className="bg-slate-900 text-white">
                      {bg}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <Droplet className="w-4 h-4 text-rose-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Phone Number <span className="text-[#EA6A2A]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={employee.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g. 01703 887 655"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EA6A2A] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 mb-2 block">Quick Employee Presets:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onLoadPreset('default')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-[#EA6A2A]/20 hover:text-[#EA6A2A] border border-slate-700 text-slate-300 transition-colors"
            >
              Mir Mynul (Template)
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset('lead')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-[#EA6A2A]/20 hover:text-[#EA6A2A] border border-slate-700 text-slate-300 transition-colors"
            >
              Tanvir Ahmed (Tech Lead)
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset('hr')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-[#EA6A2A]/20 hover:text-[#EA6A2A] border border-slate-700 text-slate-300 transition-colors"
            >
              Nusrat Jahan (HR Manager)
            </button>
          </div>
        </div>
      </div>

      {/* Photo Upload & AI Studio Processor */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#EA6A2A] to-amber-500 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Employee Portrait & AI Studio</h2>
              <p className="text-xs text-slate-400">Gemini Nano Banana AI pure white background</p>
            </div>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-[#EA6A2A] bg-slate-950/50 hover:bg-[#EA6A2A]/5 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-[#EA6A2A]/20 group-hover:text-[#EA6A2A] flex items-center justify-center text-slate-400 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-white">
                Drag & drop photo here, or <span className="text-[#EA6A2A] underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">PNG, JPG, or WEBP (Standard passport/portrait photo)</p>
            </div>
          </div>
        </div>

        {/* AI Background Processor Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={onProcessAiPhoto}
            disabled={isProcessingAi || !employee.photoBase64}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-[#EA6A2A] via-[#F27838] to-[#EA6A2A] hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-[#EA6A2A]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessingAi ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="truncate">{aiStatusMessage || "Segmenting Subject & Applying Pure White Studio Background..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>Make Background Pure White (Gemini Nano Banana AI)</span>
              </>
            )}
          </button>

          {aiStatusMessage && (
            <p className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{aiStatusMessage}</span>
            </p>
          )}
        </div>

        {/* Photo View Toggle: Original vs AI Processed */}
        {employee.originalPhotoBase64 && (
          <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              Active Photo Layer:
            </span>
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => handleInputChange('useAiPhoto', false)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  !employee.useAiPhoto
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('useAiPhoto', true)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  employee.useAiPhoto
                    ? 'bg-[#EA6A2A] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Pure White
              </button>
            </div>
          </div>
        )}

        {/* Fine Tuning Controls: Zoom, X Offset, Y Offset */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#EA6A2A]" />
              Frame Adjustments
            </span>
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...employee,
                  photoScale: 1.0,
                  photoOffsetX: 0,
                  photoOffsetY: 0,
                });
              }}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Reset sliders
            </button>
          </div>

          {/* Zoom Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5" /> Photo Zoom
              </span>
              <span>{Math.round((employee.photoScale || 1.0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.5"
              step="0.02"
              value={employee.photoScale || 1.0}
              onChange={(e) => handleInputChange('photoScale', parseFloat(e.target.value))}
              className="w-full accent-[#EA6A2A] cursor-pointer"
            />
          </div>

          {/* Horizontal Position (X Offset) */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MoveHorizontal className="w-3.5 h-3.5" /> Horizontal Pan (X)
              </span>
              <span>{employee.photoOffsetX || 0}px</span>
            </div>
            <input
              type="range"
              min="-120"
              max="120"
              step="1"
              value={employee.photoOffsetX || 0}
              onChange={(e) => handleInputChange('photoOffsetX', parseInt(e.target.value, 10))}
              className="w-full accent-[#EA6A2A] cursor-pointer"
            />
          </div>

          {/* Vertical Position (Y Offset) */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MoveVertical className="w-3.5 h-3.5" /> Vertical Pan (Y)
              </span>
              <span>{employee.photoOffsetY || 0}px</span>
            </div>
            <input
              type="range"
              min="-120"
              max="120"
              step="1"
              value={employee.photoOffsetY || 0}
              onChange={(e) => handleInputChange('photoOffsetY', parseInt(e.target.value, 10))}
              className="w-full accent-[#EA6A2A] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
