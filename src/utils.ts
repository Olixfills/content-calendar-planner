import { Post } from './types';

/**
 * Returns an array of objects representing each day cell in a 6-week monthly calendar grid (42 days).
 * This keeps the layout perfectly stable across all months.
 */
export interface CalendarCell {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateCalendarGrid(year: number, month: number): CalendarCell[] {
  const cells: CalendarCell[] = [];
  
  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Day of the week (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = firstDayOfMonth.getDay();
  
  // We want to start the grid from the nearest Sunday
  const gridStartDate = new Date(year, month, 1 - startDayOfWeek);
  
  const today = new Date();
  const todayStr = formatDateString(today);

  // Generate 42 cells (6 rows * 7 columns)
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(gridStartDate);
    currentDate.setDate(gridStartDate.getDate() + i);
    
    const dateStr = formatDateString(currentDate);
    
    cells.push({
      date: currentDate,
      dateString: dateStr,
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: dateStr === todayStr
    });
  }
  
  return cells;
}

/**
 * Helper to safely format a Date into YYYY-MM-DD string without timezone shifting issues.
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Persists posts to localStorage.
 */
export function savePostsToStorage(posts: Post[]): void {
  try {
    localStorage.setItem('ccp_posts', JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts to localStorage', error);
  }
}

/**
 * Loads posts from localStorage, falling back to initial data if empty.
 */
export function loadPostsFromStorage(fallbackPosts: Post[]): Post[] {
  try {
    const stored = localStorage.getItem('ccp_posts');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading posts from localStorage', error);
  }
  return fallbackPosts;
}

/**
 * Get name of the month
 */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Helper to check if a post matches active filters
 */
export function matchesFilters(
  post: Post,
  search: string,
  pillar: string,
  platform: string,
  status: string
): boolean {
  // Title/Notes Search
  if (search.trim() !== '') {
    const query = search.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(query);
    const notesMatch = post.notes?.toLowerCase().includes(query) || false;
    if (!titleMatch && !notesMatch) return false;
  }

  // Pillar Filter
  if (pillar !== 'all' && post.pillar !== pillar) {
    return false;
  }

  // Platform Filter
  if (platform !== 'all' && !post.platforms.includes(platform as any)) {
    return false;
  }

  // Status Filter
  if (status !== 'all' && post.status !== status) {
    return false;
  }

  return true;
}
