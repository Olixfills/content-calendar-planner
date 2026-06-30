import { useState, useEffect } from 'react';
import { Post, PillarConfig, Platform, DEFAULT_PLATFORMS } from './types';
import { getInitialPillars, getInitialPosts } from './initialData';
import { 
  matchesFilters, 
  MONTH_NAMES 
} from './utils';
import DashboardMetrics from './components/DashboardMetrics';
import FilterBar from './components/FilterBar';
import CalendarGrid from './components/CalendarGrid';
import PostListView from './components/PostListView';
import PostModal from './components/PostModal';
import SettingsModal from './components/SettingsModal';
import PillarManagerModal from './components/PillarManagerModal';
import PlatformManagerModal from './components/PlatformManagerModal';
import InfoModal from './components/InfoModal';
import { exportPlanAsPDF } from './utils/pdfExport';
import { fetchFromGoogleSheets, syncToGoogleSheets } from './utils/googleSheets';
import { 
  Download, 
  RefreshCw, 
  Settings, 
  Calendar as CalendarIcon, 
  Trash2, 
  FileDown, 
  Sliders, 
  Sparkles, 
  CheckCircle,
  FolderPlus,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- SINGLE USER SPACE STATES ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [pillars, setPillars] = useState<PillarConfig[]>([]);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>(() => {
    return localStorage.getItem('ccp_google_sheets_url') || '';
  });

  // Dynamic Platforms state
  const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>(() => {
    const stored = localStorage.getItem('ccp_platforms');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_PLATFORMS;
  });

  // Track the active calendar month and year
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-indexed

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // View state ('calendar' or 'list')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Modal and Dropdown control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPillarModalOpen, setIsPillarModalOpen] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);

  // Success toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- INITIAL LOAD STATE & SHEET SYNC ---
  useEffect(() => {
    async function loadData() {
      // 1. Initial Local Fallbacks
      const storedPillars = localStorage.getItem('ccp_single_pillars');
      let loadedPillars: PillarConfig[] = [];
      if (storedPillars && storedPillars !== '[]') {
        try {
          const parsed = JSON.parse(storedPillars);
          const legacyNames = ['Audience Growth', 'Tech Reviews', "Layman's Finance", 'Creative Design'];
          const isLegacy = parsed.length > 0 && parsed.every((p: any) => legacyNames.includes(p.name));
          if (isLegacy) {
            loadedPillars = [];
            localStorage.setItem('ccp_single_pillars', '[]');
          } else {
            loadedPillars = parsed;
          }
        } catch (err) {
          loadedPillars = [];
        }
      }
      setPillars(loadedPillars);

      const storedPosts = localStorage.getItem('ccp_single_posts');
      let loadedPosts: Post[] = [];
      if (storedPosts) {
        try {
          loadedPosts = JSON.parse(storedPosts);
        } catch (err) {
          loadedPosts = [];
        }
      }
      setPosts(loadedPosts);

      // 2. Fetch from Google Sheets if configured
      if (googleSheetsUrl) {
        showToast('🔄 Syncing with Google Sheet...');
        const result = await fetchFromGoogleSheets(googleSheetsUrl);
        if (result.status === 'success' && result.posts && result.pillars) {
          setPosts(result.posts);
          setPillars(result.pillars);
          localStorage.setItem('ccp_single_posts', JSON.stringify(result.posts));
          localStorage.setItem('ccp_single_pillars', JSON.stringify(result.pillars));
          showToast('✅ Google Sheet data synchronized!');
        } else {
          showToast('⚠️ Sync failed. Running in offline mode.');
        }
      }
    }
    loadData();
  }, [googleSheetsUrl]);

  // Save platforms helper
  const savePlatforms = (newPlatforms: Platform[]) => {
    setAvailablePlatforms(newPlatforms);
    localStorage.setItem('ccp_platforms', JSON.stringify(newPlatforms));
  };

  const handleAddPlatform = (platformName: string) => {
    if (availablePlatforms.includes(platformName)) return;
    const next = [...availablePlatforms, platformName];
    savePlatforms(next);
    showToast(`📱 Platform "${platformName}" added!`);
  };

  const handleDeletePlatform = (platformName: string) => {
    // Prevent deleting default platforms
    if (DEFAULT_PLATFORMS.includes(platformName)) return;
    const next = availablePlatforms.filter(p => p !== platformName);
    savePlatforms(next);
    showToast(`🗑️ Platform "${platformName}" removed.`);
  };

  // --- PERSIST SAVES & SYNC WRAPPERS ---
  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('ccp_single_posts', JSON.stringify(newPosts));
    if (googleSheetsUrl) {
      syncToGoogleSheets(googleSheetsUrl, newPosts, pillars)
        .then(res => {
          if (res.status === 'success') {
            showToast('☁️ Sheet updated successfully');
          } else {
            showToast('⚠️ Local edit saved. Sync failed.');
          }
        });
    }
  };

  const savePillars = (newPillars: PillarConfig[]) => {
    setPillars(newPillars);
    localStorage.setItem('ccp_single_pillars', JSON.stringify(newPillars));
    if (googleSheetsUrl) {
      syncToGoogleSheets(googleSheetsUrl, posts, newPillars)
        .then(res => {
          if (res.status === 'success') {
            showToast('☁️ Sheet updated successfully');
          } else {
            showToast('⚠️ Local edit saved. Sync failed.');
          }
        });
    }
  };

  // Show a quick success feedback toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handler to configure Sheets URL
  const handleSaveGoogleSheetsUrl = async (url: string) => {
    setGoogleSheetsUrl(url);
    if (url) {
      localStorage.setItem('ccp_google_sheets_url', url);
      showToast('🔗 Testing connection...');
      const result = await fetchFromGoogleSheets(url);
      if (result.status === 'success') {
        if (result.posts && result.pillars) {
          // Merge or overwrite local cache
          setPosts(result.posts);
          setPillars(result.pillars);
          localStorage.setItem('ccp_single_posts', JSON.stringify(result.posts));
          localStorage.setItem('ccp_single_pillars', JSON.stringify(result.pillars));
        }
        showToast('✅ Sheets backend configured successfully!');
      } else {
        showToast('❌ Connection test failed. Check URL settings.');
      }
    } else {
      localStorage.removeItem('ccp_google_sheets_url');
      showToast('ℹ️ Switched back to Local Storage mode.');
    }
  };

  // --- ACTIONS & HANDLERS ---

  // Create or Update a post
  const handleSavePost = (postData: Omit<Post, 'id'> & { id?: string }) => {
    if (postData.id) {
      // Edit existing post
      const next = posts.map(p => p.id === postData.id ? { ...postData, id: p.id } : p);
      savePosts(next);
      showToast('✨ Content schedule updated successfully!');
    } else {
      // Add new post
      const newPost: Post = {
        ...postData,
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      const next = [...posts, newPost];
      savePosts(next);
      showToast('🚀 New post scheduled on your content board!');
    }
    setIsModalOpen(false);
    setEditingPost(null);
    setPreSelectedDate(undefined);
  };

  // Delete a post
  const handleDeletePost = (id: string) => {
    const next = posts.filter(p => p.id !== id);
    savePosts(next);
    showToast('🗑️ Post removed from your content planner.');
  };

  // Reschedule a post (supports drag-and-drop on the calendar grid!)
  const handleMovePost = (postId: string, newDateString: string) => {
    const postToMove = posts.find(p => p.id === postId);
    if (!postToMove) return;

    if (postToMove.date === newDateString) return; // No change

    const next = posts.map(p => p.id === postId ? { ...p, date: newDateString } : p);
    savePosts(next);
    
    const formattedDate = new Date(newDateString + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    showToast(`📅 Rescheduled "${postToMove.title}" to ${formattedDate}!`);
  };

  // Quick schedule helper (clicking a day cell on the calendar)
  const handleAddPostOnDate = (dateString: string) => {
    setEditingPost(null);
    setPreSelectedDate(dateString);
    setIsModalOpen(true);
  };

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Dynamic Content Pillar operations
  const handleAddPillar = (name: string, colorPresetId: string) => {
    const customPresets: Record<string, any> = {
      emerald: { dotClass: 'bg-emerald-500', bgClass: 'bg-emerald-50 hover:bg-emerald-100/50 dark:bg-emerald-950/20', textClass: 'text-emerald-700 dark:text-emerald-300', borderClass: 'border-emerald-200 dark:border-emerald-900/30', accentColor: '#10b981' },
      blue: { dotClass: 'bg-blue-500', bgClass: 'bg-blue-50 hover:bg-blue-100/50 dark:bg-blue-950/20', textClass: 'text-blue-700 dark:text-blue-300', borderClass: 'border-blue-200 dark:border-blue-900/30', accentColor: '#3b82f6' },
      purple: { dotClass: 'bg-purple-500', bgClass: 'bg-purple-50 hover:bg-purple-100/50 dark:bg-purple-950/20', textClass: 'text-purple-700 dark:text-purple-300', borderClass: 'border-purple-200 dark:border-purple-900/30', accentColor: '#a855f7' },
      amber: { dotClass: 'bg-amber-500', bgClass: 'bg-amber-50 hover:bg-amber-100/50 dark:bg-amber-950/20', textClass: 'text-amber-700 dark:text-amber-300', borderClass: 'border-amber-200 dark:border-amber-900/30', accentColor: '#f59e0b' },
      rose: { dotClass: 'bg-rose-500', bgClass: 'bg-rose-50 hover:bg-rose-100/50 dark:bg-rose-950/20', textClass: 'text-rose-700 dark:text-rose-300', borderClass: 'border-rose-200 dark:border-rose-900/30', accentColor: '#f43f5e' },
      indigo: { dotClass: 'bg-indigo-500', bgClass: 'bg-indigo-50 hover:bg-indigo-100/50 dark:bg-indigo-950/20', textClass: 'text-indigo-700 dark:text-indigo-300', borderClass: 'border-indigo-200 dark:border-indigo-900/30', accentColor: '#6366f1' },
      cyan: { dotClass: 'bg-cyan-500', bgClass: 'bg-cyan-50 hover:bg-cyan-100/50 dark:bg-cyan-950/20', textClass: 'text-cyan-700 dark:text-cyan-300', borderClass: 'border-cyan-200 dark:border-cyan-900/30', accentColor: '#06b6d4' },
      orange: { dotClass: 'bg-orange-500', bgClass: 'bg-orange-50 hover:bg-orange-100/50 dark:bg-orange-950/20', textClass: 'text-orange-700 dark:text-orange-300', borderClass: 'border-orange-200 dark:border-orange-900/30', accentColor: '#f97316' }
    };

    const selectedStyle = customPresets[colorPresetId] || customPresets.blue;

    const newPillar: PillarConfig = {
      id: `pillar-${Date.now()}`,
      name,
      ...selectedStyle
    };

    const next = [...pillars, newPillar];
    savePillars(next);
    showToast(`📁 Content pillar "${name}" added!`);
  };

  const handleDeletePillar = (pillarId: string) => {
    const next = pillars.filter(p => p.id !== pillarId);
    savePillars(next);
    showToast('🗑️ Content pillar deleted.');
  };

  // Bulk actions
  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset all posts and pillars to the original templates? This will overwrite your current settings.')) {
      const defaultPillars = getInitialPillars();
      const defaultPosts = getInitialPosts();
      savePillars(defaultPillars);
      savePosts(defaultPosts);
      savePlatforms(DEFAULT_PLATFORMS);
      handleGoToToday();
      showToast('🔄 Content calendar restored to clean templates.');
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL posts on your calendar? This cannot be undone.')) {
      savePosts([]);
      showToast('🧹 Clean slate! All calendar posts have been cleared.');
    }
  };

  // Export calendar data as JSON
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `content_calendar_backup_${currentYear}_${currentMonth + 1}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('📥 Backup JSON exported successfully!');
    } catch (err) {
      console.error('Failed to export content schedule', err);
      showToast('❌ Export failed. Please try again.');
    }
  };

  // --- DATA FILTERING ---
  const filteredPosts = posts.filter(post => 
    matchesFilters(post, search, selectedPillar, selectedPlatform, selectedStatus)
  );

  // Compute posts count by pillar for delete warning metrics
  const postsCountByPillar: Record<string, number> = {};
  posts.forEach(post => {
    postsCountByPillar[post.pillar] = (postsCountByPillar[post.pillar] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 pb-12 font-sans selection:bg-indigo-500/20">
      
      {/* Header Section */}
      <header className="sticky top-0 z-40 flex flex-col md:flex-row md:items-center justify-between px-6 sm:px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        
        {/* Left Brand and Navigation */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-lg shadow-md font-semibold text-white">
              🚀
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 font-sans">
                <span>Creator</span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">Planner</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-pulse" />
                <span>My Content Hub</span>
              </p>
            </div>
          </div>

          {/* Month Switcher Navigator */}
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
              title="Previous Month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-xs sm:text-sm font-semibold px-2 min-w-[100px] text-center text-slate-800 dark:text-slate-200">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
              title="Next Month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={handleGoToToday}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Right badging & utility menus */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Color Indicators Legend (Resolved Dynamically from active pillars!) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold max-w-sm overflow-hidden truncate">
            {pillars.slice(0, 3).map(p => (
              <span key={p.id} className={`px-2 py-0.5 rounded-md border text-[10px] ${p.bgClass} ${p.borderClass} ${p.textClass}`}>
                {p.name.split('/')[0].split(' ')[0]}
              </span>
            ))}
            {pillars.length > 3 && <span className="text-[10px] text-slate-400 font-semibold">+{pillars.length - 3} more</span>}
          </div>

          {/* PDF Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-200/40"
              title="Download content planner as printable PDF document"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <AnimatePresence>
              {isPdfDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPdfDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60">
                      Export Layout Range
                    </div>
                    <button
                      onClick={() => {
                        setIsPdfDropdownOpen(false);
                        exportPlanAsPDF(posts, pillars, currentYear, currentMonth, 'month');
                        showToast("📥 Month view PDF downloaded successfully!");
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Current Month ({MONTH_NAMES[currentMonth].slice(0, 3)})</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsPdfDropdownOpen(false);
                        exportPlanAsPDF(posts, pillars, currentYear, currentMonth, '3month');
                        showToast("📥 3-Month road plan PDF downloaded successfully!");
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                      <span>3-Month Roadmap Plan</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Core backup utility keys */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={handleExportData}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Export content backup data as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Manage Pillars Button */}
          <button
            onClick={() => setIsPillarModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent"
            title="Manage Content Pillars"
          >
            <FolderPlus className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Pillars</span>
          </button>

           {/* Help/Info Button */}
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-350 rounded-lg transition-all cursor-pointer"
            title="Help / Info"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Planner Settings Control Panel Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-305 rounded-lg transition-all cursor-pointer"
            title="Planner Settings"
          >
            <Settings className="w-4 h-4 animate-hover-spin" />
          </button>

          {/* Core Add CTA button */}
          <button
            onClick={() => {
              setEditingPost(null);
              setPreSelectedDate(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14M12 5v14"/></svg>
            <span>New Post</span>
          </button>
        </div>

      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Analytics Summary Cards (Dynamic) */}
        <DashboardMetrics 
          posts={posts} 
          pillars={pillars}
          year={currentYear} 
          month={currentMonth} 
          availablePlatforms={availablePlatforms}
          onManagePlatforms={() => setIsPlatformModalOpen(true)}
        />

        {/* Dynamic Filters & Search & Add Buttons */}
        <FilterBar 
          search={search}
          setSearch={setSearch}
          selectedPillar={selectedPillar}
          setSelectedPillar={setSelectedPillar}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddClick={() => {
            setEditingPost(null);
            setPreSelectedDate(undefined);
            setIsModalOpen(true);
          }}
          pillars={pillars}
          availablePlatforms={availablePlatforms}
        />

        {/* Dynamic Content Views */}
        <div className="relative">
          {viewMode === 'calendar' ? (
            <CalendarGrid 
              posts={filteredPosts}
              pillars={pillars}
              year={currentYear}
              month={currentMonth}
              onEditPost={(post) => {
                setEditingPost(post);
                setIsModalOpen(true);
              }}
              onAddPostOnDate={handleAddPostOnDate}
              onMovePost={handleMovePost}
            />
          ) : (
            <PostListView 
              posts={filteredPosts}
              pillars={pillars}
              year={currentYear}
              month={currentMonth}
              onEditPost={(post) => {
                setEditingPost(post);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      {/* Animated Action Form Modal (Create / Edit) */}
      <PostModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
          setPreSelectedDate(undefined);
        }}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        post={editingPost}
        initialDate={preSelectedDate}
        pillars={pillars}
        availablePlatforms={availablePlatforms}
      />

      {/* Combined Single-User Planner Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetDefaults={handleResetToDefault}
        onClearAll={handleClearAll}
        googleSheetsUrl={googleSheetsUrl}
        onSaveGoogleSheetsUrl={handleSaveGoogleSheetsUrl}
      />

      {/* Dedicated Content Pillar Manager Modal */}
      <PillarManagerModal
        isOpen={isPillarModalOpen}
        onClose={() => setIsPillarModalOpen(false)}
        pillars={pillars}
        postsCountByPillar={postsCountByPillar}
        onAddPillar={handleAddPillar}
        onDeletePillar={handleDeletePillar}
      />

      {/* Dedicated Social Platform Manager Modal */}
      <PlatformManagerModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        availablePlatforms={availablePlatforms}
        onAddPlatform={handleAddPlatform}
        onDeletePlatform={handleDeletePlatform}
      />

      {/* Info / Help Modal */}
      <InfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Status Toasts/Alerts overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 dark:border-slate-200 text-xs sm:text-sm font-bold"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
