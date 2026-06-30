import React, { useState, FormEvent } from 'react';
import { Platform, DEFAULT_PLATFORMS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Tv, Trash2 } from 'lucide-react';

interface PlatformManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePlatforms: Platform[];
  onAddPlatform: (name: string) => void;
  onDeletePlatform: (name: string) => void;
}

export default function PlatformManagerModal({
  isOpen,
  onClose,
  availablePlatforms,
  onAddPlatform,
  onDeletePlatform
}: PlatformManagerModalProps) {
  const [newPlatformName, setNewPlatformName] = useState('');
  const [platformError, setPlatformError] = useState('');

  if (!isOpen) return null;

  const handleCreatePlatform = (e: FormEvent) => {
    e.preventDefault();
    setPlatformError('');

    const trimmed = newPlatformName.trim();
    if (!trimmed) {
      setPlatformError('Platform name cannot be empty.');
      return;
    }

    if (availablePlatforms.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      setPlatformError('This platform already exists.');
      return;
    }

    onAddPlatform(trimmed);
    setNewPlatformName('');
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
                <Tv className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                Manage Social Platforms
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
            {/* Form to create a new platform */}
            <form onSubmit={handleCreatePlatform} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Create Custom Platform Target
              </h4>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Platform Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Threads, Pinterest, Substack"
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {platformError && (
                <p className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                  {platformError}
                </p>
              )}
            </form>

            {/* List of current platforms */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Social Platforms ({availablePlatforms.length})
              </h4>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {availablePlatforms.map(platform => {
                  const isDefault = DEFAULT_PLATFORMS.includes(platform);
                  return (
                    <div
                      key={platform}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="truncate">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {platform}
                          </span>
                          {isDefault && (
                            <span className="text-[9px] text-slate-400 font-bold ml-2 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>

                      {!isDefault && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove "${platform}"? Posts scheduled for this platform will retain the platform name but will not show up in the dynamic selector.`)) {
                              onDeletePlatform(platform);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete Platform"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
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
