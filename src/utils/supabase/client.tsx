import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info.tsx';

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createSupabaseClient(supabaseUrl, publicAnonKey);
  }
  return supabaseClient;
}

export function getServerUrl(path: string) {
  return `https://${projectId}.supabase.co/functions/v1/make-server-b46b7a19${path}`;
}

export function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`, // Always use anon key for edge function access
  };
  
  // Send user token in custom header
  if (token) {
    headers['X-User-Token'] = token;
  }
  
  return headers;
}