import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));


// Utility: Call Ollama via CLI with streaming
function callOllama(prompt, onData, onEnd) {
const process = spawn("ollama", ["run", "llama3.1", "--stream"]);


process.stdin.write(prompt);
process.stdin.end();


process.stdout.on("data", (chunk) => {
onData(chunk.toString());
});


process.stdout.on("end", () => {
onEnd();
});
}


// Translate endpoint (streaming)
app.post("/api/translate", async (req, res) => {
let text = req.body.text || "";


const prompt = `Translate this to English and only output the translation, no explanations:
${text}`;


res.setHeader("Content-Type", "text/plain; charset=utf-8");
res.setHeader("Transfer-Encoding", "chunked");


callOllama(
prompt,
(chunk) => res.write(chunk),
() => res.end()
);
});


// Suggestions endpoint
app.post("/api/suggest", async (req, res) => {
let text = req.body.text || "";


const prompt = `Given the word: "${text}", output a JSON array of related words and their English translations. Example: [{"word": "terapias", "translation": "therapies"}]`;


let buffer = "";


callOllama(
prompt,
(chunk) => (buffer += chunk.toString()),
() => {
try {
const jsonStart = buffer.indexOf("[");
const jsonEnd = buffer.lastIndexOf("]") + 1;


const json = buffer.slice(jsonStart, jsonEnd);
res.json(JSON.parse(json));
} catch (err) {
res.json([]);
}
}
);
});


const PORT = 3000;
app.listen(PORT, () => console.log("Ollama Translator running on http://localhost:" + PORT));
