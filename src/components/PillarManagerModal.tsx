import React, { useState, FormEvent } from 'react';
import { PillarConfig, COLOR_PRESETS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, FolderPlus, Palette, Trash2 } from 'lucide-react';

interface PillarManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillars: PillarConfig[];
  postsCountByPillar: Record<string, number>;
  onAddPillar: (name: string, colorPresetId: string) => void;
  onDeletePillar: (id: string) => void;
}

export default function PillarManagerModal({
  isOpen,
  onClose,
  pillars,
  postsCountByPillar,
  onAddPillar,
  onDeletePillar
}: PillarManagerModalProps) {
  const [newPillarName, setNewPillarName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('blue');
  const [pillarError, setPillarError] = useState('');

  if (!isOpen) return null;

  const handleCreatePillar = (e: FormEvent) => {
    e.preventDefault();
    setPillarError('');

    const trimmed = newPillarName.trim();
    if (!trimmed) {
      setPillarError('Pillar name cannot be empty.');
      return;
    }

    if (pillars.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setPillarError('A content pillar with this name already exists.');
      return;
    }

    onAddPillar(trimmed, selectedPresetId);
    setNewPillarName('');
    setSelectedPresetId('blue');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-md text-indigo-600 dark:text-indigo-400">
                <FolderPlus className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                Manage Content Pillars
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form and Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Form to create a new pillar */}
            <form onSubmit={handleCreatePillar} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Create Custom Content Pillar
              </h4>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Pillar Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Creator Growth, Tech Reviews, Finance"
                  value={newPillarName}
                  onChange={(e) => setNewPillarName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>Theme Color Accent</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map(preset => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${preset.dotClass}`} />
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 truncate w-full text-center">
                          {preset.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {pillarError && (
                <p className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                  {pillarError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create Pillar</span>
              </button>
            </form>

            {/* List of current pillars */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Content Pillars ({pillars.length})
              </h4>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {pillars.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No content pillars defined. Create one above!
                  </p>
                ) : (
                  pillars.map(pillar => {
                    const postsCount = postsCountByPillar[pillar.name] || 0;
                    return (
                      <div
                        key={pillar.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${pillar.dotClass}`} />
                          <div className="truncate">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {pillar.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold ml-2 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-800">
                              {postsCount} {postsCount === 1 ? 'post' : 'posts'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (postsCount > 0) {
                              if (confirm(`Warning: There are ${postsCount} posts using the pillar "${pillar.name}". Deleting this pillar will leave them without an associated configuration. Continue?`)) {
                                onDeletePillar(pillar.id);
                              }
                            } else {
                              onDeletePillar(pillar.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete Pillar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
