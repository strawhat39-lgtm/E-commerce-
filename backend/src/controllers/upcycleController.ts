import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Helper for reuse potential
const calculateReusePotential = (condition: string, weightKg: number): number => {
  let score = 50;
  if (condition === 'Good') score += 20;
  if (weightKg > 10) score += 10;
  return Math.min(score, 100);
};

export const getMaterials = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('upcycle_materials')
    .select('*, profiles(full_name, avatar_url)')
    .eq('status', 'available')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const createMaterial = async (req: Request, res: Response) => {
  const { provider_id, material_type, description, quantity, weight_kg, image_url, condition } = req.body;
  const reuse_potential_score = calculateReusePotential(condition || 'Average', parseFloat(weight_kg || '0'));

  const { data, error } = await supabase.from('upcycle_materials').insert([{
    provider_id, material_type, description, quantity, weight_kg, image_url, reuse_potential_score
  }]).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const claimMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'claimed'
  
  const { data, error } = await supabase.from('upcycle_materials').update({ status }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const getReuseSummary = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('upcycle_materials').select('weight_kg').eq('status', 'claimed');
  if (error) return res.status(400).json({ error: error.message });
  
  const totalWeight = data.reduce((acc, curr) => acc + Number(curr.weight_kg), 0);
  res.json({ total_reused_weight_kg: totalWeight, items_claimed: data.length });
};
