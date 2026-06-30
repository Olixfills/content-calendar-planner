import { Post, STATUS_CONFIGS, PillarConfig, getPlatformStyle } from '../types';
import { Edit2, Youtube, Instagram, Music, Calendar, Clock, ArrowUpDown, Globe, Linkedin } from 'lucide-react';
import { useState } from 'react';

interface PostListViewProps {
  posts: Post[];
  pillars: PillarConfig[];
  year: number;
  month: number; // 0-indexed
  onEditPost: (post: Post) => void;
}

type SortKey = 'date' | 'title' | 'pillar' | 'status' | 'time';

export default function PostListView({ posts, pillars, year, month, onEditPost }: PostListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter posts to the active month
  const monthPosts: Post[] = [];
  posts.forEach(post => {
    if (post.recurring === 'monthly') {
      // Find the day part
      const dayPart = post.date.split('-')[2];
      const monthPart = String(month + 1).padStart(2, '0');
      const virtualDate = `${year}-${monthPart}-${dayPart}`;
      monthPosts.push({
        ...post,
        date: virtualDate
      });
    } else {
      const postDate = new Date(post.date + 'T00:00:00');
      if (postDate.getFullYear() === year && postDate.getMonth() === month) {
        monthPosts.push(post);
      }
    }
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getPlatformLabel = (platform: string) => {
    const style = getPlatformStyle(platform);
    const badgeClass = `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bgClass} ${style.textClass} border ${style.borderClass}`;
    switch (platform) {
      case 'YouTube Shorts':
        return <span className={badgeClass}><Youtube className="w-3 h-3" /> Shorts</span>;
      case 'TikTok':
        return <span className={badgeClass}><Music className="w-3 h-3" /> TikTok</span>;
      case 'Instagram Reels':
        return <span className={badgeClass}><Instagram className="w-3 h-3" /> Reels</span>;
      case 'X':
        return <span className={badgeClass}><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X</span>;
      case 'LinkedIn':
        return <span className={badgeClass}><Linkedin className="w-3 h-3" /> LinkedIn</span>;
      default:
        return <span className={badgeClass}><Globe className="w-3 h-3" /> {platform}</span>;
    }
  };

  // Sort function
  const sortedPosts = [...monthPosts].sort((a, b) => {
    let valA = a[sortKey] || '';
    let valB = b[sortKey] || '';
    
    if (sortKey === 'time') {
      valA = a.time || '12:00';
      valB = b.time || '12:00';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {sortedPosts.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No posts found matching the filters in this month.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or adding a new post.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    Date <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600" onClick={() => handleSort('time')}>
                  <div className="flex items-center gap-1">
                    Time <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">
                    Content Title <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600" onClick={() => handleSort('pillar')}>
                  <div className="flex items-center gap-1">
                    Pillar <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Target Platforms
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedPosts.map(post => {
                  const pCfg = pillars.find(p => p.name === post.pillar) || {
                    name: post.pillar,
                    bgClass: 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30',
                    textClass: 'text-slate-800 dark:text-slate-300',
                    borderClass: 'border-slate-200 dark:border-slate-700',
                    dotClass: 'bg-slate-400'
                  };
                  const sCfg = STATUS_CONFIGS[post.status];
                  
                  // Format Date to nice human readable format (e.g. June 24)
                  const dateObj = new Date(post.date + 'T00:00:00');
                  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all">
                      {/* Date */}
                      <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{post.time || '12:00'}</span>
                        </div>
                      </td>

                      {/* Title & Notes snippet */}
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{post.title}</div>
                        {post.notes && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">
                            {post.notes}
                          </div>
                        )}
                      </td>

                      {/* Content Pillar */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${pCfg.dotClass}`} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{post.pillar}</span>
                        </div>
                      </td>

                      {/* Platforms */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {post.platforms.map(p => (
                            <span key={p}>{getPlatformLabel(p)}</span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
                          {post.status}
                        </span>
                      </td>

                      {/* Action edit button */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onEditPost(post)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/80 rounded-xl transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
