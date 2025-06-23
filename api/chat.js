// In api/chat.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from your frontend

// This is the endpoint your frontend will call
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    // IMPORTANT: Use the API Key from a secure environment variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: { message: 'API key not configured.' } });
    }

    try {
        const response = await axios.post(API_URL, {
            contents: messages,
             // Add any other specific configuration your model needs
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        // The Gemini API response structure is different. We need to adapt it.
        // This mirrors the structure your frontend expects.
        const botResponse = {
            choices: [{
                message: {
                    content: response.data.candidates[0].content.parts[0].text
                }
            }]
        };

        res.status(200).json(botResponse);

    } catch (error) {
        console.error('Error calling AI API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: { message: 'Failed to get response from AI.' } });
    }
});

// This is needed for Vercel to correctly handle the Express app
module.exports = app;