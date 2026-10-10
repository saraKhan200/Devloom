const input = document.getElementById("chatInput");
const inputBtn = document.getElementById("chatBtn");
const geminiBtn = document.getElementById("geminiBtn");
const githubBtn = document.getElementById("githubBtn");
let responseDiv = document.getElementById("chatBox");
let taskNumber = 0;
let chatting = false;
let githubToken = "";
let geminiToken = "";

function validatePrompt(value) {
  const text = value?.trim();
  if (!text) {
    alert("Enter a prompt before sending.");
    return null;
  }
  if (text.length > 500) {
    alert(
      "length of prompt is more than 500 please make it shorter as it cant be processed",
    );
    return null;
  }
  return text;
}

async function sendPrompt(promptText) {
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: promptText,
      geminiApiKey: geminiToken,
      githubToken,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  if (typeof data.response !== "string") {
    throw new Error("The server returned an unexpected response.");
  }
  return data.response;
}

function createChatBubble(speaker, message) {
  if (speaker === "chatbot") {
    //  Create the element
    const newDiv = document.createElement("div");

    newDiv.textContent = `Gemini:${message}`;

    newDiv.classList.add("glassEffect");
    newDiv.id = "chatInnerDiv";

    responseDiv.appendChild(newDiv);
  } else if (speaker === "user") {
    //  Create the element
    const newDiv = document.createElement("div");

    newDiv.textContent = `${message}`;

    newDiv.classList.add("glassEffect");
    newDiv.id = "promptDiv";

    responseDiv.appendChild(newDiv);
  } else return;
}
// below are all the event listeners

geminiBtn.addEventListener("click", () => {
  const ask = window.prompt(
    "Enter your Gemini API key. It is kept in memory until this page is reloaded.",
  );
  if (ask === null) return;
  geminiToken = ask.trim();
  if (!geminiToken) {
    alert("Enter a non-empty Gemini API key.");
    return;
  }
  alert("Gemini API key set for this page session.");
});

githubBtn.addEventListener("click", () => {
  const ask = window.prompt(
    "Enter your GitHub access token. It is kept in memory until this page is reloaded.",
  );
  if (ask === null) return;
  githubToken = ask.trim();
  if (!githubToken) {
    alert("Enter a non-empty GitHub access token.");
    return;
  }
  alert("GitHub access token set for this page session.");
});

inputBtn.addEventListener("click", async () => {
  if (chatting) return;

  const promptText = validatePrompt(input.innerText);
  if (!promptText) return;
  if (!geminiToken || !githubToken) {
    createChatBubble(
      "chatbot",
      "Set both your Gemini API key and GitHub access token before sending a request.",
    );
    return;
  }

  chatting = true;
  inputBtn.disabled = true;
  createChatBubble("user", promptText);
  let output = document.createElement("div");

  output.className = "glassEffect";
  output.textContent = "Working...";
  responseDiv.appendChild(output);

  try {
    output.textContent = await sendPrompt(promptText);
    output.id = `chatInnerDiv`;
    input.innerText = "";
  } catch (error) {
    output.textContent =
      error instanceof Error ? error.message : "Request failed.";
  } finally {
    chatting = false;
    inputBtn.disabled = false;
  }
});
