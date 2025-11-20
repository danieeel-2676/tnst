const input = document.getElementById("inputText");
const translationBox = document.getElementById("translation");
const suggestionsBox = document.getElementById("suggestions");
let typingTimer;


function debounce(callback) {
clearTimeout(typingTimer);
typingTimer = setTimeout(callback, 300);
}


input.addEventListener("input", () => {
const text = input.value.trim();
translationBox.innerHTML = "";


if (!text) return;


debounce(() => {
startTranslation(text);
fetchSuggestions(text);
});
});


async function startTranslation(text) {
const response = await fetch("/api/translate", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text })
});


const reader = response.body.getReader();
const decoder = new TextDecoder();


while (true) {
const { value, done } = await reader.read();
if (done) break;
translationBox.innerHTML += decoder.decode(value);
}
