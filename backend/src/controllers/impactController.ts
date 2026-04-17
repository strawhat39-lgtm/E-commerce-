import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getSustainabilityMetrics = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from('sustainability_metrics').select('*').eq('user_id', userId).single();
  // PGRST116 means no rows found (not an error if user just created)
  if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });
  res.json(data || { total_carbon_saved_kg: 0, items_reused: 0, water_saved_liters: 0, total_eco_points: 0 });
};

export const getWeeklyTrend = async (req: Request, res: Response) => {
  // Mock weekly trend for hackathon dashboard
  res.json({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Carbon Saved (kg)', data: [1.2, 2.5, 0.5, 3.0, 1.0, 4.2, 2.1] }
    ]
  });
};

export const getBadgesAndPoints = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, reward_badges(*)')
    .eq('user_id', userId);
    
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
