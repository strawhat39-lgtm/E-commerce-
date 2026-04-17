"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBadgesAndPoints = exports.getWeeklyTrend = exports.getSustainabilityMetrics = void 0;
const supabase_1 = require("../config/supabase");
const getSustainabilityMetrics = async (req, res) => {
    const { userId } = req.params;
    const { data, error } = await supabase_1.supabase.from('sustainability_metrics').select('*').eq('user_id', userId).single();
    // PGRST116 means no rows found (not an error if user just created)
    if (error && error.code !== 'PGRST116')
        return res.status(400).json({ error: error.message });
    res.json(data || { total_carbon_saved_kg: 0, items_reused: 0, water_saved_liters: 0, total_eco_points: 0 });
};
exports.getSustainabilityMetrics = getSustainabilityMetrics;
const getWeeklyTrend = async (req, res) => {
    // Mock weekly trend for hackathon dashboard
    res.json({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            { label: 'Carbon Saved (kg)', data: [1.2, 2.5, 0.5, 3.0, 1.0, 4.2, 2.1] }
        ]
    });
};
exports.getWeeklyTrend = getWeeklyTrend;
const getBadgesAndPoints = async (req, res) => {
    const { userId } = req.params;
    const { data, error } = await supabase_1.supabase
        .from('user_badges')
        .select('*, reward_badges(*)')
        .eq('user_id', userId);
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
exports.getBadgesAndPoints = getBadgesAndPoints;
