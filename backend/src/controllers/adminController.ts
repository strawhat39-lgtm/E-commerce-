import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getDashboardSummary = async (req: Request, res: Response) => {
  // Aggregate counts using supabase head requests
  const [users, items, food, materials] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('item_listings').select('*', { count: 'exact', head: true }),
    supabase.from('food_listings').select('*', { count: 'exact', head: true }),
    supabase.from('upcycle_materials').select('*', { count: 'exact', head: true })
  ]);

  res.json({
    totalUsers: users.count || 0,
    totalMarketplaceItems: items.count || 0,
    totalFoodListings: food.count || 0,
    totalUpcycleMaterials: materials.count || 0
  });
};

export const getAllListingsCount = async (req: Request, res: Response) => {
  const { count, error } = await supabase.from('item_listings').select('*', { count: 'exact', head: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ count: count || 0 });
};

export const getClaimsCount = async (req: Request, res: Response) => {
  const { count, error } = await supabase.from('rescue_claims').select('*', { count: 'exact', head: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ count: count || 0 });
};

export const getImpactStats = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('sustainability_metrics').select('total_carbon_saved_kg, water_saved_liters');
  if (error) return res.status(400).json({ error: error.message });

  const totalCarbon = data.reduce((acc, curr) => acc + Number(curr.total_carbon_saved_kg), 0);
  const totalWater = data.reduce((acc, curr) => acc + Number(curr.water_saved_liters), 0);

  res.json({ totalCarbonSavedKg: totalCarbon, totalWaterSavedLiters: totalWater });
};
