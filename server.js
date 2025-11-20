import express from "express";
import cors from "cors";
import OpenAI from "openai";


const app = express();
app.use(cors());
app.use(express.json());


const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


app.post("/api/translate", async (req, res) => {
try {
const { text, sourceLang, targetLang } = req.body;


const response = await client.responses.create({
model: "gpt-4.1-mini",
input: `Traduce el siguiente texto de ${sourceLang} a ${targetLang}. Solo devuelve la traducción. Texto: "${text}"`
});


res.json({ translation: response.output_text });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Translation error" });
}
});


app.post("/api/suggest", async (req, res) => {
try {
const { text, sourceLang, targetLang } = req.body;


const response = await client.responses.create({
model: "gpt-4.1-mini",
input: `Dame sugerencias relacionadas con "${text}" en formato JSON: [{ "label": "palabra", "translated": "traducción" }]`
});


const suggestions = JSON.parse(response.output_text);
res.json({ suggestions });
} catch (err) {
console.error(err);
res.json({ suggestions: [] });
}
});


app.listen(3001, () => console.log("🚀 API lista en http://localhost:3001"));
