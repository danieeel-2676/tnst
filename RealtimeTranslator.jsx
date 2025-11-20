// --- RealtimeTranslator.jsx ---
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function RealtimeTranslator() {
const [sourceLang, setSourceLang] = useState("es");
const [targetLang, setTargetLang] = useState("en");
const [query, setQuery] = useState("");
const [translation, setTranslation] = useState("");
const [suggestions, setSuggestions] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);


const latestQuery = useRef("");
const debounceTimer = useRef(null);


const debounce = (fn, wait = 300) => {
return (...args) => {
if (debounceTimer.current) clearTimeout(debounceTimer.current);
debounceTimer.current = setTimeout(() => fn(...args), wait);
};
};


// --- IA REAL ---
const aiTranslate = async (text, from, to) => {
const res = await fetch("/api/translate", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text, sourceLang: from, targetLang: to })
});
const data = await res.json();
return data.translation;
};


const aiSuggest = async (text, from, to) => {
const res = await fetch("/api/suggest", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text, sourceLang: from, targetLang: to })
});
const data = await res.json();
return data.suggestions || [];
};


const fetchTranslationAndSuggestions = async (text) => {
latestQuery.current = text;
if (!text) {
setTranslation("");
setSuggestions([]);
return;
}


setIsLoading(true);


try {
const [t, s] = await Promise.all([
aiTranslate(text, sourceLang, targetLang),
aiSuggest(text, sourceLang, targetLang)
]);


if (latestQuery.current === text) {
setTranslation(t);
setSuggestions(s);
}
} catch (err) {
console.error("translation error", err);
} finally {
setIsLoading(false);
}
};
}
