import React from 'react';
import { Post, PillarConfig, getPlatformStyle } from '../types';
import { CalendarCell, generateCalendarGrid } from '../utils';
import { Youtube, Instagram, Music, Plus, Globe, Linkedin } from 'lucide-react';

interface CalendarGridProps {
  posts: Post[];
  pillars: PillarConfig[];
  year: number;
  month: number; // 0-indexed
  onEditPost: (post: Post) => void;
  onAddPostOnDate: (dateString: string) => void;
  onMovePost: (postId: string, newDateString: string) => void;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CalendarGrid({
  posts,
  pillars,
  year,
  month,
  onEditPost,
  onAddPostOnDate,
  onMovePost
}: CalendarGridProps) {
  
  // Generate 42 cells representing the calendar month view
  const cells = generateCalendarGrid(year, month);

  // Group posts by formatted date string for rapid access
  const postsByDate: Record<string, Post[]> = {};
  
  cells.forEach(cell => {
    postsByDate[cell.dateString] = [];
  });

  posts.forEach(post => {
    if (post.recurring === 'monthly') {
      // Find the day part of the post's original date
      // e.g. "2026-06-15" => day 15
      const postDay = parseInt(post.date.split('-')[2], 10);
      
      // Match with any visible cells that have this day number
      cells.forEach(cell => {
        if (cell.date.getDate() === postDay) {
          postsByDate[cell.dateString].push({
            ...post,
            // When dragged/edited on a different month, we preserve its identifier but show the current month date
            date: cell.dateString
          });
        }
      });
    } else {
      // Single post
      if (postsByDate[post.date]) {
        postsByDate[post.date].push(post);
      }
    }
  });

  // Sort posts within a day by their planned publish time
  Object.keys(postsByDate).forEach(dateStr => {
    postsByDate[dateStr].sort((a, b) => {
      const timeA = a.time || '12:00';
      const timeB = b.time || '12:00';
      return timeA.localeCompare(timeB);
    });
  });

  // Drag and Drop Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Highlight day cell on hover
    e.currentTarget.classList.add('bg-indigo-50/50', 'dark:bg-indigo-950/20', 'border-indigo-300', 'dark:border-indigo-800');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-950/20', 'border-indigo-300', 'dark:border-indigo-800');
  };

  const handleDrop = (e: React.DragEvent, targetCell: CalendarCell) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-950/20', 'border-indigo-300', 'dark:border-indigo-800');
    
    try {
      const postId = e.dataTransfer.getData('text/plain');
      if (postId) {
        onMovePost(postId, targetCell.dateString);
      }
    } catch (err) {
      console.error('Failed to reschedule post via drag-and-drop', err);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const style = getPlatformStyle(platform);
    switch (platform) {
      case 'YouTube Shorts':
        return <Youtube className={`w-3 h-3 ${style.dotClass} shrink-0`} title="YouTube Shorts" />;
      case 'TikTok':
        return <Music className={`w-3 h-3 ${style.dotClass} shrink-0`} title="TikTok" />;
      case 'Instagram Reels':
        return <Instagram className={`w-3 h-3 ${style.dotClass} shrink-0`} title="Instagram Reels" />;
      case 'X':
        return (
          <svg className={`w-3 h-3 ${style.dotClass} shrink-0`} viewBox="0 0 24 24" fill="currentColor" aria-label="X">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'LinkedIn':
        return <Linkedin className={`w-3 h-3 ${style.dotClass} shrink-0`} title="LinkedIn" />;
      default:
        return <Globe className={`w-3 h-3 ${style.dotClass} shrink-0`} title={platform} />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      
      {/* Weekday Labels Grid */}
      <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-950">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-2.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r border-b border-slate-200 dark:border-slate-800">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.substring(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Day Cells Grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const dayPosts = postsByDate[cell.dateString] || [];
          
          return (
            <div
              key={`${cell.dateString}-${idx}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cell)}
              className={`min-h-[135px] p-2 flex flex-col justify-between border-r border-b border-slate-200 dark:border-slate-800 transition-colors group relative ${
                cell.isCurrentMonth 
                  ? 'bg-white dark:bg-slate-900' 
                  : 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-400'
              } ${cell.isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}`}
            >
              {/* Day Cell Header (Date number and Add indicator) */}
              <div className="flex items-center justify-between mb-1">
                <span 
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                    cell.isToday 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : cell.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400/80 dark:text-slate-600'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Quick Add Button */}
                <button
                  onClick={() => onAddPostOnDate(cell.dateString)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md transition-all duration-200 cursor-pointer"
                  title="Add content to this date"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day's Content Planner Chips */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[110px] scrollbar-thin py-1">
                {dayPosts.map(post => {
                  const cfg = pillars.find(p => p.name === post.pillar) || {
                    name: post.pillar,
                    bgClass: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30',
                    textClass: 'text-slate-800 dark:text-slate-300',
                    borderClass: 'border-slate-200 dark:border-slate-700',
                    dotClass: 'bg-slate-400'
                  };
                  return (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', post.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => onEditPost(post)}
                      className={`group/chip mt-2 p-2 rounded text-left border hover:shadow-xs transition-shadow cursor-grab active:cursor-grabbing select-none ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1 text-[9px] font-bold uppercase tracking-wide">
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          <span>{cfg.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {post.platforms.map(p => (
                            <span key={p}>
                              {getPlatformIcon(p)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-bold leading-tight truncate text-slate-800 dark:text-slate-200" title={post.title}>
                        {post.title}
                      </p>
                      {post.time && (
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                          {post.time}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status footer inside cell if day is busy */}
              {dayPosts.length > 3 && (
                <div className="text-[9px] text-center text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/20 py-0.5 rounded mt-1">
                  +{dayPosts.length - 3} more items
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
