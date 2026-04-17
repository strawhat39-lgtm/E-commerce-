import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createSwapRequest = async (req: Request, res: Response) => {
  const { requester_id, listing_id, message } = req.body;
  const { data, error } = await supabase.from('swap_requests').insert([{
    requester_id, listing_id, message
  }]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const createRentRequest = async (req: Request, res: Response) => {
  const { requester_id, listing_id, start_date, end_date, message } = req.body;
  const { data, error } = await supabase.from('rent_requests').insert([{
    requester_id, listing_id, start_date, end_date, message
  }]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const getRequestsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { type } = req.query; // 'swap' or 'rent'
  let query;
  if (type === 'rent') {
    query = supabase.from('rent_requests').select('*, item_listings(*)').eq('requester_id', userId);
  } else {
    query = supabase.from('swap_requests').select('*, item_listings(*)').eq('requester_id', userId);
  }
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.query; // 'swap' or 'rent'
  const { status } = req.body;
  
  const table = type === 'rent' ? 'rent_requests' : 'swap_requests';
  const { data, error } = await supabase.from(table).update({ status }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
