import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type User = {
  id: string;
  email: string | null;
  name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  last_signed_in: string;
};

export type Project = {
  id: number;
  name: string;
  type: 'sampling' | 'detail_page' | 'new_product' | 'influencer';
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  importance: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string | null;
  deadline: string | null;
  start_date: string | null;
  target_date: string | null;
  completed_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  brand: string | null;
  product_name: string | null;
  manufacturer: string | null;
  sample_company: string | null;
  partner: string | null;
  development_type: string | null;
  progress_status: string | null;
  notes: string | null;
  sample_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

export type Sample = {
  id: number;
  project_id: number | null;
  round_number: number;
  manufacturer: string | null;
  lab_number: string | null;
  brand: string | null;
  product_name: string | null;
  category: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type Evaluation = {
  id: number;
  sample_id: number | null;
  evaluator_name: string;
  category: string;
  item: string;
  score: 1 | 3 | 5;
  feedback: string | null;
  created_at: string;
  updated_at: string;
};

export type Vendor = {
  id: number;
  name: string;
  type: 'manufacturer' | 'designer' | 'influencer' | 'other';
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Account = {
  id: number;
  platform: string;
  account_id: string;
  password: string | null;
  category: 'marketing' | 'sales' | 'product' | 'other';
  notes: string | null;
  created_at: string;
  updated_at: string;
};
