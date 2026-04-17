import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getUsers = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json(data);
};

export const createOrUpdateProfile = async (req: Request, res: Response) => {
  const { id, email, full_name, avatar_url } = req.body;
  const payload = id ? { id, email, full_name, avatar_url } : { email, full_name, avatar_url };
  
  const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'email' }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};
