import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Helper for urgency scoring (hours till expiry)
const calculateUrgency = (expiryDate: Date): number => {
  const hoursLeft = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft <= 0) return 0; // expired
  if (hoursLeft <= 24) return 10; // High urgency
  if (hoursLeft <= 72) return 5;
  return 2;
};

export const getFoodListings = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('food_listings')
    .select('*, profiles(full_name, avatar_url)')
    .eq('status', 'available')
    .order('urgency_score', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const createFoodListing = async (req: Request, res: Response) => {
  const { donor_id, title, description, quantity, expiry_date, location, image_url } = req.body;
  const urgency_score = calculateUrgency(new Date(expiry_date));

  const { data, error } = await supabase.from('food_listings').insert([{
    donor_id, title, description, quantity, expiry_date, location, image_url, urgency_score
  }]).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const claimFoodListing = async (req: Request, res: Response) => {
  const { id } = req.params; // food listing id
  const { claimer_id, message } = req.body;

  // Transaction-like behavior with supabase via RPC would be better, but we do standard calls
  const claimReq = await supabase.from('rescue_claims').insert([{
    claimer_id, food_listing_id: id, message, status: 'approved'
  }]).select().single();
  
  if (claimReq.error) return res.status(400).json({ error: claimReq.error.message });
  
  const { data, error } = await supabase.from('food_listings').update({ status: 'claimed' }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });

  res.json({ claim: claimReq.data, food_listing: data });
};

export const getRescueClaims = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from('rescue_claims').select('*, food_listings(*)').eq('claimer_id', userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
