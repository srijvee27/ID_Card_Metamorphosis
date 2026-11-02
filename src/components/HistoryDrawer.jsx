import React, { useState } from 'react';
import {
  X,
  Clock,
  Search,
  ArrowUpRight,
  Trash2,
  Download,
  Database,
  HardDrive,
  Users,
} from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  savedEmployees,
  onLoadEmployee,
  onDeleteEmployee,
  source = 'memory',
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedEmployees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.designation && emp.designation.toLowerCase().includes(q)) ||
      (emp.nid && emp.nid.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EA6A2A]/10 text-[#EA6A2A]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Employee Records History</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                  {savedEmployees.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                {source === 'mongodb' ? (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Synced with MongoDB Atlas</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Stored in Local Storage / Session Memory</span>
                  </>
                )}
              </p>
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

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/30">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, designation, NID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#EA6A2A]"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Clock className="w-12 h-12 text-slate-600 mb-3 stroke-[1.5]" />
              <p className="text-base font-medium text-slate-300">No saved employee records yet</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Customize an employee ID card in the editor and click "Save Employee Record" to store it here.
              </p>
            </div>
          ) : (
            filtered.map((emp) => {
              const photo = emp.photoBase64 || emp.originalPhotoBase64;
              return (
                <div
                  key={emp._id || emp.id || emp.createdAt}
                  className="group relative bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail Avatar */}
                    <div className="w-14 h-14 rounded-full border-2 border-[#EA6A2A]/40 overflow-hidden bg-slate-900 flex-shrink-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt={emp.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          Photo
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#EA6A2A] transition-colors">
                        {emp.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{emp.designation}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>NID: {emp.nid}</span>
                        <span>•</span>
                        <span className="text-[#EA6A2A] font-semibold">{emp.bloodGroup}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadEmployee(emp);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EA6A2A]/10 hover:bg-[#EA6A2A] text-[#EA6A2A] hover:text-white font-medium text-xs transition-colors"
                      title="Load into Editor"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Load</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteEmployee(emp._id || emp.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
