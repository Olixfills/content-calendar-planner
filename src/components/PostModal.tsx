import React, { useState, useEffect } from 'react';
import { Post, Pillar, Platform, PostStatus, STATUSES, STATUS_CONFIGS, PillarConfig, getPlatformStyle } from '../types';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, Trash2, Youtube, Instagram, Music, Check, Sparkles, Globe, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postData: Omit<Post, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  post?: Post | null; // If passed, we are EDITING. If null/undefined, we are ADDING.
  initialDate?: string; // If passed, default the date to this (useful when clicking a calendar day cell!)
  pillars: PillarConfig[];
  availablePlatforms: Platform[];
}

export default function PostModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  post,
  initialDate,
  pillars,
  availablePlatforms
}: PostModalProps) {
  const isEditing = !!post;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [pillar, setPillar] = useState<Pillar>('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [status, setStatus] = useState<PostStatus>('Idea');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState<'none' | 'monthly'>('none');
  
  // Validation error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset/Set state when modal opens or post changes
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setDate(post.date);
      setTime(post.time || '12:00');
      setPillar(post.pillar);
      setPlatforms(post.platforms);
      setStatus(post.status);
      setNotes(post.notes || '');
      setRecurring(post.recurring || 'none');
    } else {
      // Default values for new post
      setTitle('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTime('12:00');
      setPillar(pillars[0]?.name || '');
      setPlatforms(availablePlatforms.length > 0 ? [availablePlatforms[0]] : []);
      setStatus('Idea');
      setNotes('');
      setRecurring('none');
    }
    setErrors({});
  }, [post, initialDate, isOpen, pillars, availablePlatforms]);

  if (!isOpen) return null;

  const handleTogglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(item => item !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    if (platforms.length === 0) {
      newErrors.platforms = 'Select at least one platform';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: post?.id,
      title: title.trim(),
      date,
      pillar,
      platforms,
      status,
      notes: notes.trim(),
      time,
      recurring
    });
    
    onClose();
  };

  const getPlatformIcon = (p: Platform) => {
    switch (p) {
      case 'YouTube Shorts':
        return <Youtube className="w-4 h-4" />;
      case 'TikTok':
        return <Music className="w-4 h-4" />;
      case 'Instagram Reels':
        return <Instagram className="w-4 h-4" />;
      case 'X':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPlatformClass = (p: Platform, isSelected: boolean) => {
    if (!isSelected) {
      return 'border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950';
    }
    const style = getPlatformStyle(p);
    return `border-current ${style.bgClass} ${style.textClass} font-semibold`;
  };

  const getPlatformDisplayName = (p: Platform) => {
    switch (p) {
      case 'YouTube Shorts': return 'YouTube';
      case 'Instagram Reels': return 'Instagram';
      default: return p;
    }
  };

  // Determine grid columns based on platform count
  const platformGridCols = availablePlatforms.length <= 3
    ? 'grid-cols-3'
    : availablePlatforms.length <= 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-3';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-md text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Calendar Post' : 'Add Post to Calendar'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Content Title
              </label>
              <input
                type="text"
                placeholder="e.g. 5 Apps To Boost Productivity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-lg outline-none transition-all dark:bg-slate-950 ${
                  errors.title 
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title}</p>}
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg outline-none transition-all dark:bg-slate-950 ${
                    errors.date 
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
                {errors.date && <p className="text-xs text-red-500 font-semibold">{errors.date}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Publish Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-950"
                />
              </div>
            </div>

            {/* Recurrence Mode Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Recurrence / Persistence
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as 'none' | 'monthly')}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="none">Once (Only displays on selected date)</option>
                <option value="monthly">Repeat Monthly (Persists across all months on this day of the month)</option>
              </select>
            </div>

            {/* Content Pillar Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Content Pillar
                </label>
                {pillars.length === 0 && (
                  <span className="text-[10px] text-red-500 font-bold">No pillars configured! Go to settings to add pillars.</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {pillars.map(p => {
                  const isSelected = pillar === p.name;
                  const cfg = p;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPillar(p.name)}
                      className={`px-3 py-2 text-xs text-left rounded-lg border transition-all cursor-pointer flex flex-col justify-between h-14 ${
                        isSelected 
                          ? `border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20`
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold min-w-0 w-full">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`} />
                        <span className="text-slate-700 dark:text-slate-200 truncate">{p.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {isSelected ? 'Active Target' : 'Select Pillar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Post to Platforms
                </label>
                <span className="text-[10px] text-slate-400 font-medium">(Select Multiple)</span>
              </div>
              <div className={`grid ${platformGridCols} gap-2`}>
                {availablePlatforms.map(p => {
                  const isSelected = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleTogglePlatform(p)}
                      className={`px-3 py-2.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${getPlatformClass(p, isSelected)}`}
                    >
                      {getPlatformIcon(p)}
                      <span className="truncate">{getPlatformDisplayName(p)}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {errors.platforms && <p className="text-xs text-red-500 font-semibold">{errors.platforms}</p>}
            </div>

            {/* Status Flow Tracker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Production Status
              </label>
              <div className="grid grid-cols-5 gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
                {STATUSES.map(s => {
                  const isSelected = status === s;
                  const cfg = STATUS_CONFIGS[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-1.5 px-1 rounded-md text-[10px] sm:text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? `${cfg.bg} ${cfg.text} shadow-xs border ${cfg.border}`
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Script Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5" /> Hook / Script Notes
              </label>
              <textarea
                placeholder="Write scripting outlines, hooks, captions, or hashtags here..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-950"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              {isEditing && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this content planner item?')) {
                      onDelete(post.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              ) : (
                <div /> // Placeholder
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Schedule Post'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
