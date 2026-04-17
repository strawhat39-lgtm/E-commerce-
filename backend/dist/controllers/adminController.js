"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImpactStats = exports.getClaimsCount = exports.getAllListingsCount = exports.getDashboardSummary = void 0;
const supabase_1 = require("../config/supabase");
const getDashboardSummary = async (req, res) => {
    // Aggregate counts using supabase head requests
    const [users, items, food, materials] = await Promise.all([
        supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase_1.supabase.from('item_listings').select('*', { count: 'exact', head: true }),
        supabase_1.supabase.from('food_listings').select('*', { count: 'exact', head: true }),
        supabase_1.supabase.from('upcycle_materials').select('*', { count: 'exact', head: true })
    ]);
    res.json({
        totalUsers: users.count || 0,
        totalMarketplaceItems: items.count || 0,
        totalFoodListings: food.count || 0,
        totalUpcycleMaterials: materials.count || 0
    });
};
exports.getDashboardSummary = getDashboardSummary;
const getAllListingsCount = async (req, res) => {
    const { count, error } = await supabase_1.supabase.from('item_listings').select('*', { count: 'exact', head: true });
    if (error)
        return res.status(400).json({ error: error.message });
    res.json({ count: count || 0 });
};
exports.getAllListingsCount = getAllListingsCount;
const getClaimsCount = async (req, res) => {
    const { count, error } = await supabase_1.supabase.from('rescue_claims').select('*', { count: 'exact', head: true });
    if (error)
        return res.status(400).json({ error: error.message });
    res.json({ count: count || 0 });
};
exports.getClaimsCount = getClaimsCount;
const getImpactStats = async (req, res) => {
    const { data, error } = await supabase_1.supabase.from('sustainability_metrics').select('total_carbon_saved_kg, water_saved_liters');
    if (error)
        return res.status(400).json({ error: error.message });
    const totalCarbon = data.reduce((acc, curr) => acc + Number(curr.total_carbon_saved_kg), 0);
    const totalWater = data.reduce((acc, curr) => acc + Number(curr.water_saved_liters), 0);
    res.json({ totalCarbonSavedKg: totalCarbon, totalWaterSavedLiters: totalWater });
};
exports.getImpactStats = getImpactStats;
