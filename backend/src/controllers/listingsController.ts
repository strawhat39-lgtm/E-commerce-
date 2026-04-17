import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllListings = async (req: Request, res: Response) => {
  const { category, status, type } = req.query;
  let query = supabase.from('item_listings').select('*, profiles(full_name, avatar_url)');
  
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (type) query = query.eq('listing_type', type);
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createListing = async (req: Request, res: Response) => {
  const { owner_id, title, description, category, condition, listing_type, image_url } = req.body;

  const { data, error } = await supabase.from('item_listings').insert([{
    owner_id, title, description, category, condition, listing_type, image_url
  }]).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const getListingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('item_listings').select('*, profiles(*)').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Listing not found' });
  res.json(data);
};

export const updateListingStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const { data, error } = await supabase.from('item_listings').update({ status }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('item_listings').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
