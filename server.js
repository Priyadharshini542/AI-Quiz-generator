import 'dotenv/config'; // Loads .env variables using 'dotenv/config'
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path'; // path is a standard library, imported here just in case, though often not needed in ESM if not using __dirname

const app = express();
const PORT = 3000;

// Initialize the Gemini client
// NOTE: Make sure your .env file has GEMINI_API_KEY=YOUR_KEY_HERE
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

// Middleware
app.use(express.json()); // For parsing application/json
// Serve static files (HTML, CSS, JS) from a 'public' folder
app.use(express.static('public')); 

// --- API Endpoint to Generate Quiz ---
app.post('/generate-quiz', async (req, res) => {
    const topic = req.body.topic;
    
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required.' });
    }

    // 1. Define the desired JSON schema for the quiz
    const quizSchema = {
        type: "object",
        properties: {
            quiz: {
                type: "array",
                description: "An array of 10 quiz questions.",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string", description: "The quiz question text." },
                        options: { 
                            type: "array", 
                            description: "An array of 4 possible answers.",
                            items: { type: "string" }
                        },
                        correct_answer: { type: "string", description: "The correct answer, which must match one of the options." }
                    },
                    required: ["question", "options", "correct_answer"]
                }
            }
        },
        required: ["quiz"]
    };

    // 2. Craft the prompt
    const prompt = `Generate a 10-question multiple-choice quiz about the topic: "${topic}". Each question must have 4 options. The entire output MUST be a JSON object that strictly conforms to the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });

        // The response text is the JSON string
        const quizData = JSON.parse(response.text);
        res.json(quizData);

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'Failed to generate quiz.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser.`);
});