import { Post, PillarConfig } from '../types';

export interface SyncResult {
  status: 'success' | 'error';
  posts?: Post[];
  pillars?: PillarConfig[];
  message?: string;
}

/**
 * Helper to safely normalize and parse Google Sheets date values into YYYY-MM-DD format.
 * Prevents timezone offset shifts from altering the intended day.
 */
export function cleanGoogleSheetsDate(dateStr: string): string {
  if (!dateStr) return '';
  dateStr = dateStr.trim();
  
  // 1. If it's already YYYY-MM-DD, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // 2. If it is an ISO string starting with YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10);
  }
  
  // 3. Try parsing text-based dates like "Thu Jun 25 2026..." to avoid timezone shifting
  const parts = dateStr.split(' ');
  if (parts.length >= 4) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = months.indexOf(parts[1]);
    const day = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10);
    
    if (monthIdx !== -1 && !isNaN(day) && !isNaN(year) && year > 1900 && year < 2100) {
      const formattedMonth = String(monthIdx + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      return `${year}-${formattedMonth}-${formattedDay}`;
    }
  }
  
  // 4. Fallback to standard Date parsing if it doesn't match above formats (e.g. "6/25/2026")
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return dateStr;
  }
  
  const y = parsedDate.getFullYear();
  const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const d = String(parsedDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Helper to safely normalize and parse Google Sheets time values into HH:MM format.
 * Google Sheets stores time-only cells relative to the Dec 30, 1899 epoch.
 */
export function cleanGoogleSheetsTime(timeStr: string): string {
  if (!timeStr) return '';
  timeStr = timeStr.trim();
  
  // 1. If it's already HH:MM, return it
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  // 2. If it contains HH:MM:SS, extract HH:MM (e.g. from "12:00:00" or a full Date string)
  const match = timeStr.match(/\b(\d{2}):(\d{2}):\d{2}\b/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  
  // 3. Fallback
  return timeStr;
}

/**
 * Fetch calendar data (posts and pillars) from user's Google Sheets Apps Script Web App URL.
 */
export async function fetchFromGoogleSheets(url: string): Promise<SyncResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as SyncResult;
    
    // Normalize date and time strings for all posts to ensure calendar alignment
    if (data.status === 'success' && data.posts) {
      data.posts = data.posts.map(post => ({
        ...post,
        date: cleanGoogleSheetsDate(post.date),
        time: cleanGoogleSheetsTime(post.time || '')
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch from Google Sheets:', error);
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown network error' };
  }
}

/**
 * Send calendar data (posts and pillars) to user's Google Sheets Apps Script Web App URL for synchronization.
 */
export async function syncToGoogleSheets(url: string, posts: Post[], pillars: PillarConfig[]): Promise<SyncResult> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Bypass CORS preflight request triggers in Apps Script
      },
      body: JSON.stringify({
        action: 'sync',
        posts,
        pillars,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown network error' };
  }
}
