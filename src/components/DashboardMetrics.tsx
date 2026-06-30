import { Post, Pillar, Platform, PillarConfig, getPlatformStyle } from '../types';
import { Settings } from 'lucide-react';

interface DashboardMetricsProps {
  posts: Post[];
  pillars: PillarConfig[];
  year: number;
  month: number; // 0-indexed
  availablePlatforms: Platform[];
  onManagePlatforms?: () => void;
}

export default function DashboardMetrics({ posts, pillars, year, month, availablePlatforms, onManagePlatforms }: DashboardMetricsProps) {
  // Filter posts to current month
  const monthPosts: Post[] = [];
  posts.forEach(post => {
    if (post.recurring === 'monthly') {
      const dayPart = post.date.split('-')[2];
      const monthPart = String(month + 1).padStart(2, '0');
      const virtualDate = `${year}-${monthPart}-${dayPart}`;
      monthPosts.push({
        ...post,
        date: virtualDate
      });
    } else {
      const postDate = new Date(post.date + 'T00:00:00'); // avoid tz shift
      if (postDate.getFullYear() === year && postDate.getMonth() === month) {
        monthPosts.push(post);
      }
    }
  });

  const totalCount = monthPosts.length;

  // Compute posts planned this week
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
  const thisWeekCount = monthPosts.filter(post => {
    const d = new Date(post.date + 'T00:00:00');
    return d >= startOfWeek && d <= endOfWeek;
  }).length;

  // Posts per Platform (initialized dynamically based on available platforms)
  const platformStats: Record<Platform, number> = {};
  availablePlatforms.forEach(p => {
    platformStats[p] = 0;
  });

  // Posts per Pillar (initialized dynamically)
  const pillarStats: Record<string, number> = {};
  pillars.forEach(p => {
    pillarStats[p.name] = 0;
  });

  // Status breakdown counters
  let postedCount = 0;
  let scheduledCount = 0;
  let filmingCount = 0;
  let scriptingCount = 0;
  let ideaCount = 0;

  monthPosts.forEach(post => {
    post.platforms.forEach(p => {
      if (p in platformStats) {
        platformStats[p]++;
      } else {
        // Fallback for custom platforms that might not be in availablePlatforms yet
        platformStats[p] = 1;
      }
    });

    if (post.pillar in pillarStats) {
      pillarStats[post.pillar]++;
    } else {
      // Fallback for custom pillars if needed
      pillarStats[post.pillar] = (pillarStats[post.pillar] || 0) + 1;
    }

    if (post.status === 'Posted') {
      postedCount++;
    } else if (post.status === 'Scheduled') {
      scheduledCount++;
    } else if (post.status === 'Filming') {
      filmingCount++;
    } else if (post.status === 'Scripting') {
      scriptingCount++;
    } else if (post.status === 'Idea') {
      ideaCount++;
    }
  });

  // Calculate top pillar dynamically
  let mainPillar = pillars[0]?.name || 'None';
  let maxCount = -1;
  pillars.forEach(p => {
    const count = pillarStats[p.name] || 0;
    if (count > maxCount) {
      maxCount = count;
      mainPillar = p.name;
    }
  });
  
  // Also account for cases where some posts have pillars not in current pillars
  Object.keys(pillarStats).forEach(pName => {
    if (!pillars.some(p => p.name === pName)) {
      if (pillarStats[pName] > maxCount) {
        maxCount = pillarStats[pName];
        mainPillar = pName;
      }
    }
  });

  const mainPillarPercentage = totalCount > 0 ? Math.round((maxCount / totalCount) * 100) : 0;
  const mainPillarCfg = pillars.find(p => p.name === mainPillar) || { dotClass: 'bg-slate-400' };

  // Calculate status percentages for segmented bar
  const postedPercent = totalCount > 0 ? (postedCount / totalCount) * 100 : 0;
  const scheduledPercent = totalCount > 0 ? (scheduledCount / totalCount) * 100 : 0;
  const filmingPercent = totalCount > 0 ? (filmingCount / totalCount) * 100 : 0;
  const scriptingPercent = totalCount > 0 ? (scriptingCount / totalCount) * 100 : 0;
  const ideaPercent = totalCount > 0 ? (ideaCount / totalCount) * 100 : 0;

  // Let's get top platforms up to 3 to display in split bubbles
  const sortedPlatformSplits = Object.entries(platformStats)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total Posts */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Posts</p>
        <div className="flex items-end justify-between mt-2">
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{totalCount}</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-100/50 dark:border-emerald-900/30">
            +{thisWeekCount} this week
          </span>
        </div>
      </div>

      {/* Card 2: Platform Split */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Platform Split</p>
          {onManagePlatforms && (
            <button
              onClick={onManagePlatforms}
              className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <Settings className="w-2.5 h-2.5" />
              <span>Manage</span>
            </button>
          )}
        </div>
        
        {/* Wrap container showing all active & added platforms */}
        <div className="flex flex-wrap gap-2.5 mt-1 overflow-y-auto pr-1">
          {availablePlatforms.map((pName) => {
            const style = getPlatformStyle(pName);
            const count = platformStats[pName] || 0;
            return (
              <div key={pName} className="flex flex-col items-center shrink-0 min-w-[28px]" title={`${pName}: ${count} posts`}>
                <div className={`w-7 h-7 rounded-full ${style.circleBg} border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-[9px] font-bold ${style.circleText}`}>
                  {style.shortLabel}
                </div>
                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350 mt-0.5 leading-none">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: Main Pillar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Main Pillar</p>
        <div className="flex items-center gap-2.5 mt-2.5">
          <div className={`w-3 h-3 rounded-full shrink-0 ${mainPillarCfg.dotClass}`} />
          <div className="truncate min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={mainPillar}>{mainPillar}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Dominates {mainPillarPercentage}% of planner</p>
          </div>
        </div>
      </div>

      {/* Card 4: Status Breakdown Segmented Progress Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status Breakdown</p>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
            {postedCount + scheduledCount} Ready
          </span>
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full flex overflow-hidden" title={`Posted: ${postedCount}, Scheduled: ${scheduledCount}, Filming: ${filmingCount}, Scripting: ${scriptingCount}, Idea: ${ideaCount}`}>
            {postedPercent > 0 && <div className="bg-emerald-500 h-full transition-all" style={{ width: `${postedPercent}%` }} />}
            {scheduledPercent > 0 && <div className="bg-blue-500 h-full transition-all" style={{ width: `${scheduledPercent}%` }} />}
            {filmingPercent > 0 && <div className="bg-sky-400 h-full transition-all" style={{ width: `${filmingPercent}%` }} />}
            {scriptingPercent > 0 && <div className="bg-orange-400 h-full transition-all" style={{ width: `${scriptingPercent}%` }} />}
            {ideaPercent > 0 && <div className="bg-slate-300 dark:bg-slate-600 h-full transition-all" style={{ width: `${ideaPercent}%` }} />}
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1.5">
            <span>Posted ({postedCount})</span>
            <span>Idea ({ideaCount})</span>
          </div>
        </div>
      </div>

    </div>
  );
}
