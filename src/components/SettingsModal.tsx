import { useState } from 'react';
import { PillarConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Database, 
  RefreshCw, 
  Trash,
  Link,
  Clipboard,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDefaults: () => void;
  onClearAll: () => void;
  googleSheetsUrl: string;
  onSaveGoogleSheetsUrl: (url: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onResetDefaults,
  onClearAll,
  googleSheetsUrl,
  onSaveGoogleSheetsUrl
}: SettingsModalProps) {
  const [sheetUrlInput, setSheetUrlInput] = useState(googleSheetsUrl);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoogleSheetsUrl(sheetUrlInput.trim());
  };

  const handleCopyScript = () => {
    const scriptText = `/**
 * Google Apps Script for Content Calendar Planner Backend
 * Deploy this script as a "Web App" inside your Google Sheet.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let postsSheet = ss.getSheetByName("Posts");
  if (!postsSheet) {
    postsSheet = ss.insertSheet("Posts");
    postsSheet.appendRow(["id", "title", "date", "pillar", "platforms", "status", "notes", "time", "recurring"]);
    postsSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#f1f5f9");
  }
  let pillarsSheet = ss.getSheetByName("Pillars");
  if (!pillarsSheet) {
    pillarsSheet = ss.insertSheet("Pillars");
    pillarsSheet.appendRow(["id", "name", "bgClass", "textClass", "borderClass", "accentColor", "dotClass"]);
    pillarsSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f1f5f9");
  }
}
function doGet(e) {
  setupSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const postsSheet = ss.getSheetByName("Posts");
  const postsRows = postsSheet.getDataRange().getValues();
  const posts = [];
  for (let i = 1; i < postsRows.length; i++) {
    const row = postsRows[i];
    if (!row[0]) continue;
    posts.push({
      id: String(row[0]),
      title: String(row[1]),
      date: String(row[2]),
      pillar: String(row[3]),
      platforms: String(row[4]) ? String(row[4]).split(",") : [],
      status: String(row[5]),
      notes: String(row[6]),
      time: String(row[7]),
      recurring: String(row[8]) || "none"
    });
  }
  const pillarsSheet = ss.getSheetByName("Pillars");
  const pillarsRows = pillarsSheet.getDataRange().getValues();
  const pillars = [];
  for (let i = 1; i < pillarsRows.length; i++) {
    const row = pillarsRows[i];
    if (!row[0]) continue;
    pillars.push({
      id: String(row[0]),
      name: String(row[1]),
      bgClass: String(row[2]),
      textClass: String(row[3]),
      borderClass: String(row[4]),
      accentColor: String(row[5]),
      dotClass: String(row[6])
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "success", posts, pillars }))
    .setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  setupSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "sync") {
      const postsSheet = ss.getSheetByName("Posts");
      postsSheet.clear();
      postsSheet.appendRow(["id", "title", "date", "pillar", "platforms", "status", "notes", "time", "recurring"]);
      postsSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#f1f5f9");
      (data.posts || []).forEach(p => {
        postsSheet.appendRow([p.id, p.title, p.date, p.pillar, p.platforms ? p.platforms.join(",") : "", p.status, p.notes || "", p.time || "", p.recurring || "none"]);
      });
      const pillarsSheet = ss.getSheetByName("Pillars");
      pillarsSheet.clear();
      pillarsSheet.appendRow(["id", "name", "bgClass", "textClass", "borderClass", "accentColor", "dotClass"]);
      pillarsSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f1f5f9");
      (data.pillars || []).forEach(p => {
        pillarsSheet.appendRow([p.id, p.name, p.bgClass || "", p.textClass || "", p.borderClass || "", p.accentColor || "", p.dotClass || ""]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Synchronized successfully" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
              Planner Settings
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-5">
            {/* Google Sheets Sync panel */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Google Sheet Database Backend</span>
              </h4>
              
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Synchronize your calendar posts & pillars automatically with a Google Sheet. Follow the instructions to set up your backend spreadsheet.
              </p>

              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  1. Copy the Apps Script Template
                </span>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-100/70 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal pl-2 border-l border-indigo-500 space-y-1">
                <p>2. Open Google Sheets, create a spreadsheet & open <strong>Extensions &gt; Apps Script</strong>.</p>
                <p>3. Paste the code, save, click <strong>Deploy &gt; New Deployment</strong>.</p>
                <p>4. Set "Execute as" to <strong>Me</strong> and "Who has access" to <strong>Anyone</strong>.</p>
                <p>5. Copy the generated Web App URL and paste below.</p>
              </div>

              <form onSubmit={handleSaveUrl} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  Web App Exec URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Save URL
                  </button>
                </div>
                {googleSheetsUrl ? (
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Synchronized Google Sheet Backend is Active!</span>
                  </div>
                ) : (
                  <div className="text-[10px] font-medium text-slate-400 italic">
                    Currently operating in offline Local Storage mode.
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span>Storage Information</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your content schedule and customized pillars are saved in your browser's persistent **Local Storage**. This means your changes remain intact even when you refresh or close this tab.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">
                Destructive Operations
              </h4>

              <div className="space-y-3">
                {/* Reset button */}
                <div className="p-3.5 border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/10 rounded-xl flex items-start gap-3">
                  <div className="p-1 bg-amber-500/10 text-amber-500 rounded-md mt-0.5 shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400">
                      Reset to Demo Templates
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Overwrites all current posts and custom pillars with a clean blueprint.
                    </p>
                    <button
                      onClick={() => {
                        onResetDefaults();
                        onClose();
                      }}
                      className="mt-2.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                    >
                      Perform Reset
                    </button>
                  </div>
                </div>

                {/* Clear all button */}
                <div className="p-3.5 border border-red-200/60 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/10 rounded-xl flex items-start gap-3">
                  <div className="p-1 bg-red-500/10 text-red-500 rounded-md mt-0.5 shrink-0">
                    <Trash className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-red-800 dark:text-red-400">
                      Clear All Calendar Data
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Deletes all scheduled posts from your active database. Your custom content pillars will remain.
                    </p>
                    <button
                      onClick={() => {
                        onClearAll();
                        onClose();
                      }}
                      className="mt-2.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                    >
                      Clear Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}
