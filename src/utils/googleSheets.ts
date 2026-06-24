import { Post, PillarConfig } from '../types';

export interface SyncResult {
  status: 'success' | 'error';
  posts?: Post[];
  pillars?: PillarConfig[];
  message?: string;
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
    const data = await response.json();
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
