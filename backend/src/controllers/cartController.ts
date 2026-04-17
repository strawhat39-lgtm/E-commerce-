import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Helper for cart carbon estimation
const calculateCarbon = (category: string, quantity: number): number => {
  const multipliers: Record<string, number> = {
    'Clothing': 5.0,
    'Electronics': 25.0,
    'Food': 2.5,
    'Tools': 10.0,
    'Default': 3.0
  };
  const multiplier = multipliers[category] || multipliers['Default'];
  return multiplier * quantity;
};

export const getCartItems = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from('carbon_cart_items').select('*').eq('user_id', userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const addCartItem = async (req: Request, res: Response) => {
  const { user_id, product_name, category, quantity } = req.body;
  const q = quantity || 1;
  const estimated_carbon_kg = calculateCarbon(category, q);

  const { data, error } = await supabase.from('carbon_cart_items').insert([{
    user_id, product_name, category, quantity: q, estimated_carbon_kg
  }]).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const removeCartItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('carbon_cart_items').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};

export const getCarbonSummary = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from('carbon_cart_items').select('estimated_carbon_kg').eq('user_id', userId);
  if (error) return res.status(400).json({ error: error.message });
  
  const totalCarbon = data.reduce((acc, curr) => acc + Number(curr.estimated_carbon_kg), 0);
  res.json({ user_id: userId, total_carbon_kg: totalCarbon, items_count: data.length });
};
