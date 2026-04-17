"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateProfile = exports.getUser = exports.getUsers = void 0;
const supabase_1 = require("../config/supabase");
const getUsers = async (req, res) => {
    const { data, error } = await supabase_1.supabase.from('profiles').select('*');
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase.from('profiles').select('*').eq('id', id).single();
    if (error)
        return res.status(404).json({ error: 'User not found' });
    res.json(data);
};
exports.getUser = getUser;
const createOrUpdateProfile = async (req, res) => {
    const { id, email, full_name, avatar_url } = req.body;
    const payload = id ? { id, email, full_name, avatar_url } : { email, full_name, avatar_url };
    const { data, error } = await supabase_1.supabase.from('profiles').upsert(payload, { onConflict: 'email' }).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
};
exports.createOrUpdateProfile = createOrUpdateProfile;
