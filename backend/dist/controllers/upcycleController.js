"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReuseSummary = exports.claimMaterial = exports.createMaterial = exports.getMaterials = void 0;
const supabase_1 = require("../config/supabase");
// Helper for reuse potential
const calculateReusePotential = (condition, weightKg) => {
    let score = 50;
    if (condition === 'Good')
        score += 20;
    if (weightKg > 10)
        score += 10;
    return Math.min(score, 100);
};
const getMaterials = async (req, res) => {
    const { data, error } = await supabase_1.supabase.from('upcycle_materials')
        .select('*, profiles(full_name, avatar_url)')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
exports.getMaterials = getMaterials;
const createMaterial = async (req, res) => {
    const { provider_id, material_type, description, quantity, weight_kg, image_url, condition } = req.body;
    const reuse_potential_score = calculateReusePotential(condition || 'Average', parseFloat(weight_kg || '0'));
    const { data, error } = await supabase_1.supabase.from('upcycle_materials').insert([{
            provider_id, material_type, description, quantity, weight_kg, image_url, reuse_potential_score
        }]).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
};
exports.createMaterial = createMaterial;
const claimMaterial = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'claimed'
    const { data, error } = await supabase_1.supabase.from('upcycle_materials').update({ status }).eq('id', id).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
exports.claimMaterial = claimMaterial;
const getReuseSummary = async (req, res) => {
    const { data, error } = await supabase_1.supabase.from('upcycle_materials').select('weight_kg').eq('status', 'claimed');
    if (error)
        return res.status(400).json({ error: error.message });
    const totalWeight = data.reduce((acc, curr) => acc + Number(curr.weight_kg), 0);
    res.json({ total_reused_weight_kg: totalWeight, items_claimed: data.length });
};
exports.getReuseSummary = getReuseSummary;
