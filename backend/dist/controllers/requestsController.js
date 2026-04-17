"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestStatus = exports.getRequestsByUser = exports.createRentRequest = exports.createSwapRequest = void 0;
const supabase_1 = require("../config/supabase");
const createSwapRequest = async (req, res) => {
    const { requester_id, listing_id, message } = req.body;
    const { data, error } = await supabase_1.supabase.from('swap_requests').insert([{
            requester_id, listing_id, message
        }]).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
};
exports.createSwapRequest = createSwapRequest;
const createRentRequest = async (req, res) => {
    const { requester_id, listing_id, start_date, end_date, message } = req.body;
    const { data, error } = await supabase_1.supabase.from('rent_requests').insert([{
            requester_id, listing_id, start_date, end_date, message
        }]).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
};
exports.createRentRequest = createRentRequest;
const getRequestsByUser = async (req, res) => {
    const { userId } = req.params;
    const { type } = req.query; // 'swap' or 'rent'
    let query;
    if (type === 'rent') {
        query = supabase_1.supabase.from('rent_requests').select('*, item_listings(*)').eq('requester_id', userId);
    }
    else {
        query = supabase_1.supabase.from('swap_requests').select('*, item_listings(*)').eq('requester_id', userId);
    }
    const { data, error } = await query;
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
exports.getRequestsByUser = getRequestsByUser;
const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // 'swap' or 'rent'
    const { status } = req.body;
    const table = type === 'rent' ? 'rent_requests' : 'swap_requests';
    const { data, error } = await supabase_1.supabase.from(table).update({ status }).eq('id', id).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
exports.updateRequestStatus = updateRequestStatus;
