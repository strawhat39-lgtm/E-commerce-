import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, history, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    require('dotenv').config();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Missing GEMINI_API_KEY in backend Env!");
      return res.json({ reply: 'Sorry, my neural connection to the backend is currently offline. My creator needs to set the GEMINI_API_KEY. 🌿' });
    }

    // Step 1: Collect User Data from Supabase if known
    let userStatsString = 'Status: Anonymous User. No stats available.';
    if (userId && userId !== 'anonymous') {
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profile) {
          userStatsString = `User Name: ${profile.full_name}\nEco Points: ${profile.eco_points}\nMembership Tier: ${profile.membership_tier}`;
        }
      } catch (err) {
        console.error('Failed to fetch user context for chat:', err);
      }
    }

    // Step 2: Construct the Gemini Prompt
    const systemPrompt = `You are a "Sustainability Shopping Assistant" on the circular-economy platform "Reuse_Mart".
Your job is to be extremely helpful, conversational, and deeply focused on sustainable shopping, recycling, swapping, and eco impact metrics.

User Context:
${userStatsString}

STRICT ACTIONS COMMANDS:
If the user says they want to shop or buy something specifically, append EXACTLY this string at the very end of your response: [REDIRECT:/marketplace?category=apparel] (Change 'apparel' to whatever category makes sense: apparel, electronics, furniture, tools, food).
If they want to see their dashboard or stats, append: [REDIRECT:/dashboard]
If they want to list an item to sell/swap/rent, append: [REDIRECT:/dashboard]

Keep responses short (under 4 sentences). Use eco-emojis.`;

    // Map history to Gemini format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Step 3: Fast Native Fetch Call to Gemini AI REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    const body = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API Error:', body);
      return res.status(500).json({ error: 'Failed to access Gemini network' });
    }

    const replyText = body.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to process that.";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
