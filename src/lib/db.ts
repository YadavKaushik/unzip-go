// Helper to bypass strict typing when Database types are empty/not yet synced
import { supabase } from '@/integrations/supabase/client';

export const db = supabase as any;
