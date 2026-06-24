import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Calendar, Shield, Sliders, Database, Layers, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

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
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                How to Use Creator Planner
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area - Scrollable */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            
            {/* Intro */}
            <p>
              Welcome! <strong>Creator Planner</strong> is a premium, lightweight tool built for social media managers and creators to organize schedules and hook outlines across multiple video platforms.
            </p>

            {/* Step Columns */}
            <div className="space-y-4">
              
              {/* Feature 1 */}
              <div className="flex gap-3 items-start">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 mt-0.5 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Scheduling & Organizing
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any calendar cell to schedule a post directly. Drag and drop any post to easily reschedule it to another date.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-3 items-start">
                <div className="p-1.5 bg-purple-50 dark:bg-purple-950/50 rounded-lg text-purple-600 mt-0.5 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Content Pillars
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Categorize topics (e.g. tech, design, updates) by creating custom Content Pillars with custom colors from the <strong>Pillars</strong> modal in the header.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-3 items-start">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 rounded-lg text-rose-600 mt-0.5 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Month-to-Month Persistence
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Have content that runs indefinitely? When creating or editing a post, select <strong>Repeat Monthly</strong> to make it persist on that day for every month.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-3 items-start">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Collaborate with Google Sheets
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sync your schedule to a shared spreadsheet! Open <strong>Settings</strong>, copy the Apps Script code, and paste it into Google Sheets. Enter the generated URL to keep you and your manager synced.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Data is stored locally in your browser cache or on your secure spreadsheet.</span>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition-all"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
