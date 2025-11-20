import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


if (!OPENAI_API_KEY) {
console.warn('WARNING: OPENAI_API_KEY not set. Set it in .env or env vars.');
}


const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });


// Non-streaming suggestions endpoint
app.post('/api/suggest', async (req, res) => {
try {
const { text = '', sourceLang = 'es', targetLang = 'en' } = req.body;
if (!text) return res.json({ suggestions: [] });


const prompt = `Dame 6 sugerencias de palabras o frases relacionadas con: "${text}". Devuelve un JSON array de objetos con campos { "label": "...", "translated": "..." }.`;


const response = await openaiClient.responses.create({
model: 'gpt-4.1-mini',
input: prompt
});


// response.output_text is the raw text. Try to parse JSON inside.
const raw = response.output_text || '[]';
let suggestions = [];
try {
suggestions = JSON.parse(raw);
} catch (e) {
// If the model didn't return strict JSON, try to extract a JSON block
const m = raw.match(/\[.*\]/s);
if (m) {
try { suggestions = JSON.parse(m[0]); } catch (e2) { suggestions = []; }
}
}


res.json({ suggestions });
} catch (err) {
console.error('suggest error', err);
res.status(500).json({ suggestions: [] });
}
});


// Streaming translation using Server-Sent Events (SSE)
// Client connects with GET /api/stream-translate?text=...&sourceLang=es&targetLang=en
app.get('/api/stream-translate', async (req, res) => {
const text = req.query.text || '';
const sourceLang = req.query.sourceLang || 'es';
const targetLang = req.query.targetLang || 'en';


if (!text) {
return res.status(400).send('Missing text');
}


// Set headers for SSE
res.writeHead(200, {
'Content-Type': 'text/event-stream',
'Cache-Control': 'no-cache',
Connection: 'keep-alive',
'Access-Control-Allow-Origin': '*'
});


// Build a prompt for the OpenAI Responses API
const prompt = `Traduce texto de ${sourceLang} a ${targetLang}. Devuelve solo la traducción, en partes si es necesario.`;


app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
