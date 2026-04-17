import { supabase } from './supabase';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  try {
    // Dynamically retrieve the active session to inject JWT 
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: options.method || 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    // Some routes might return 204 No Content, fallback safely.
    if (res.status === 204) return true;
    
    return await res.json();
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}
