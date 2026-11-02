import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import IDCardPreview from './components/IDCardPreview';
import ExportActions from './components/ExportActions';
import HistoryDrawer from './components/HistoryDrawer';
import SettingsModal from './components/SettingsModal';
import { DEFAULT_EMPLOYEE, CR80_DIMENSIONS } from './constants/defaults';
import { processAiWhiteBackground } from './utils/backgroundRemover';
import { fireConfetti } from './utils/exportCard';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';

export default function App() {
  const [employee, setEmployee] = useState(() => {
    const cached = localStorage.getItem('metamorphosis_current_card');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return DEFAULT_EMPLOYEE;
  });

  const [savedEmployees, setSavedEmployees] = useState(() => {
    const cached = localStorage.getItem('metamorphosis_saved_cards');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('metamorphosis_gemini_key') || '';
  });

  const [previewScale, setPreviewScale] = useState(0.68);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);
  const [dbSource, setDbSource] = useState('local');

  const cardRef = useRef(null);

  // Sync current card draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('metamorphosis_current_card', JSON.stringify(employee));
    } catch (e) {
      console.warn('LocalStorage draft save error:', e);
    }
  }, [employee]);

  // Sync saved cards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('metamorphosis_saved_cards', JSON.stringify(savedEmployees));
    } catch (e) {
      console.warn('LocalStorage list save error:', e);
    }
  }, [savedEmployees]);

  // Check server health and fetch saved cards on mount
  const checkHealthAndFetchCards = async () => {
    try {
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setServerHealth(healthData);
      }
    } catch (e) {
      console.log('Running in local/static mode without backend connection');
    }

    try {
      const empRes = await fetch('/api/employees');
      if (empRes.ok) {
        const empData = await empRes.json();
        if (empData?.employees && empData.employees.length > 0) {
          setSavedEmployees(empData.employees);
          setDbSource(empData.source || 'mongodb');
        }
      }
    } catch (e) {
      // LocalStorage fallback already populated
    }
  };

  useEffect(() => {
    checkHealthAndFetchCards();
  }, []);

  // Responsive scale handler for canvas preview
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPreviewScale(0.48);
      } else if (window.innerWidth < 1024) {
        setPreviewScale(0.58);
      } else if (window.innerWidth < 1440) {
        setPreviewScale(0.66);
      } else {
        setPreviewScale(0.72);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // AI Photo Processing via backend /api/process-photo
  const handleProcessAiPhoto = async () => {
    if (!employee.photoBase64) return;

    setIsProcessingAi(true);
    setAiStatusMessage('Connecting to Gemini Nano Banana AI...');

    const sourcePhoto = employee.photoBase64;

    try {
      // Layer 1: Call Gemini Nano Banana (gemini-2.5-flash-image) backend endpoint
      const response = await fetch('/api/process-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: sourcePhoto,
          customApiKey: customApiKey || undefined,
        }),
      });

      let geminiSuccess = false;

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.processedImage && data.provider === 'gemini-2.5-flash-image') {
          geminiSuccess = true;
          setEmployee((prev) => ({
            ...prev,
            photoBase64: data.processedImage,
            useAiPhoto: true, // Automatically switch Active Photo Layer toggle to AI Pure White
          }));
          setAiStatusMessage('Solid pure white background created by Gemini AI!');
          fireConfetti();
        }
      }

      // Layer 2: If Gemini API is unavailable, quota-limited, or failed,
      // seamlessly execute Real AI Human Segmentation (@imgly/background-removal)
      if (!geminiSuccess) {
        setAiStatusMessage('Segmenting Subject & Applying Pure White Studio Background...');
        const whiteStudioCutout = await processAiWhiteBackground(
          sourcePhoto,
          (statusText) => setAiStatusMessage(statusText)
        );

        setEmployee((prev) => ({
          ...prev,
          photoBase64: whiteStudioCutout,
          useAiPhoto: true, // Automatically switch Active Photo Layer toggle to AI Pure White
        }));
        setAiStatusMessage('Pure studio white background complete (AI Segmentation)!');
        fireConfetti();
      }
    } catch (err) {
      console.warn('Backend API unavailable, executing client-side AI background segmentation:', err);
      try {
        setAiStatusMessage('Segmenting Subject & Applying Pure White Studio Background...');
        const whiteStudioCutout = await processAiWhiteBackground(
          sourcePhoto,
          (statusText) => setAiStatusMessage(statusText)
        );

        setEmployee((prev) => ({
          ...prev,
          photoBase64: whiteStudioCutout,
          useAiPhoto: true, // Automatically switch Active Photo Layer toggle to AI Pure White
        }));
        setAiStatusMessage('Pure studio white background complete (AI Segmentation)!');
        fireConfetti();
      } catch (aiErr) {
        console.error('AI background segmentation failed:', aiErr);
        setAiStatusMessage('AI background segmentation error. Please try again.');
      }
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Save Employee Record to MongoDB (with LocalStorage fallback)
  const handleSaveRecord = async () => {
    setIsSaving(true);
    const newRecord = {
      ...employee,
      _id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.employee) {
          setSavedEmployees((prev) => [data.employee, ...prev.filter((e) => e._id !== data.employee._id)]);
          setDbSource(data.source || 'mongodb');
        }
      } else {
        // Fallback to local storage
        setSavedEmployees((prev) => [newRecord, ...prev]);
        setDbSource('local');
      }
    } catch (e) {
      // Offline fallback
      setSavedEmployees((prev) => [newRecord, ...prev]);
      setDbSource('local');
    } finally {
      setIsSaving(false);
      setLastSavedAt(Date.now());
      fireConfetti();
      setTimeout(() => setLastSavedAt(null), 3500);
    }
  };

  // Delete saved record
  const handleDeleteEmployee = async (id) => {
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setSavedEmployees((prev) => prev.filter((e) => (e._id || e.id) !== id));
  };

  // Load employee preset
  const handleLoadPreset = (type) => {
    if (type === 'default') {
      setEmployee(DEFAULT_EMPLOYEE);
    } else if (type === 'lead') {
      setEmployee((prev) => ({
        ...prev,
        name: 'Tanvir Ahmed',
        designation: 'Senior Solutions Architect',
        nid: '5819203948',
        bloodGroup: 'O+',
        phone: '01819 443 210',
      }));
    } else if (type === 'hr') {
      setEmployee((prev) => ({
        ...prev,
        name: 'Nusrat Jahan',
        designation: 'Head of Human Resources',
        nid: '4920194821',
        bloodGroup: 'A+',
        phone: '01912 778 332',
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Header
        savedCount={savedEmployees.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        serverHealth={serverHealth}
      />

      {/* Main Split-Screen Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Real-Time Input Controls & Photo AI Studio (5 cols on lg) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ControlPanel
              employee={employee}
              onChange={setEmployee}
              onProcessAiPhoto={handleProcessAiPhoto}
              isProcessingAi={isProcessingAi}
              aiStatusMessage={aiStatusMessage}
              onResetToDefaults={() => setEmployee(DEFAULT_EMPLOYEE)}
              onLoadPreset={handleLoadPreset}
            />
          </div>

          {/* Right Panel: Live Interactive Preview & Export Actions (7 cols on lg) */}
          <div className="lg:col-span-7 order-1 lg:order-2 sticky top-28 flex flex-col items-center">
            {/* Preview Toolbar */}
            <div className="w-full max-w-[638px] flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EA6A2A]" />
                <span className="font-semibold text-white">Live Interactive Canvas</span>
                <span className="text-slate-500">•</span>
                <span>CR80 Portrait (638 × 1012 px)</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(0.4, Number((s - 0.05).toFixed(2))))}
                  className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[11px] font-mono">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(1.0, Number((s + 0.05).toFixed(2))))}
                  className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScale(0.68)}
                  className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors ml-1"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Centered CR80 ID Card Canvas */}
            <div className="w-full flex items-center justify-center py-2 overflow-hidden">
              <div className="relative transition-all duration-150">
                <IDCardPreview
                  ref={cardRef}
                  employee={employee}
                  scale={previewScale}
                />
              </div>
            </div>

            {/* Export Actions Bar */}
            <div className="w-full max-w-[638px] mt-6">
              <ExportActions
                cardRef={cardRef}
                employee={employee}
                onSaveRecord={handleSaveRecord}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
              />
            </div>

            {/* Print & Quality Tip */}
            <div className="w-full max-w-[638px] mt-4 flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-[#EA6A2A] flex-shrink-0" />
              <span>
                Standard CR80 size (85.6mm × 53.98mm). Export renders at 300 DPI (3x pixel ratio)
                suitable for commercial PVC dye-sublimation and retransfer card printers.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedEmployees={savedEmployees}
        onLoadEmployee={(emp) => setEmployee(emp)}
        onDeleteEmployee={handleDeleteEmployee}
        source={dbSource}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customApiKey={customApiKey}
        onSaveApiKey={(key) => {
          setCustomApiKey(key);
          localStorage.setItem('metamorphosis_gemini_key', key);
        }}
        serverHealth={serverHealth}
        onRefreshHealth={checkHealthAndFetchCards}
      />
    </div>
  );
}
