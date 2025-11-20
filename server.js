import express from "express";
import cors from "cors";
import OpenAI from "openai";


const app = express();
app.use(cors());
app.use(express.json());


const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});


app.post("/api/translate", async (req, res) => {
try {
const { text, sourceLang, targetLang } = req.body;


const response = await client.responses.create({
model: "gpt-4.1-mini",
input: `
Traduce este texto.
- Idioma origen: ${sourceLang}
- Idioma destino: ${targetLang}
Texto: "${text}"
Devuélvelo únicamente traducido, sin explicaciones.
`
});


res.json({
translation: response.output_text
});
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
input: `
Dame sugerencias de palabras o frases relacionadas con: "${text}"
Formato JSON:
[
{ "label": "palabra", "translated": "traducción" }
]
`
});


const suggestions = JSON.parse(response.output_text);


res.json({ suggestions });
} catch (err) {
console.error(err);
res.json({ suggestions: [] });
}
});


app.listen(3001, () => console.log("API funcionando en http://localhost:3001"));
