"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteListing = exports.updateListingStatus = exports.getListingById = exports.createListing = exports.getAllListings = void 0;
const supabase_1 = require("../config/supabase");
const getAllListings = async (req, res) => {
    const { category, status, type } = req.query;
    let query = supabase_1.supabase.from('item_listings').select('*, profiles(full_name, avatar_url)');
    if (category)
        query = query.eq('category', category);
    if (status)
        query = query.eq('status', status);
    if (type)
        query = query.eq('listing_type', type);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
};
exports.getAllListings = getAllListings;
const createListing = async (req, res) => {
    const { owner_id, title, description, category, condition, listing_type, image_url } = req.body;
    const { data, error } = await supabase_1.supabase.from('item_listings').insert([{
            owner_id, title, description, category, condition, listing_type, image_url
        }]).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(201).json(data);
};
exports.createListing = createListing;
const getListingById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase.from('item_listings').select('*, profiles(*)').eq('id', id).single();
    if (error)
        return res.status(404).json({ error: 'Listing not found' });
    res.json(data);
};
exports.getListingById = getListingById;
const updateListingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase_1.supabase.from('item_listings').update({ status }).eq('id', id).select().single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
exports.updateListingStatus = updateListingStatus;
const deleteListing = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase.from('item_listings').delete().eq('id', id);
    if (error)
        return res.status(400).json({ error: error.message });
    res.status(204).send();
};
exports.deleteListing = deleteListing;
