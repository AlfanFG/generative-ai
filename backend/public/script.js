const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  // Tampilkan pesan "Thinking..."
  const thinkingMessage = appendMessage("bot", "Gemini is thinking...");

  // Kirim pesan ke backend
  sendMessageToBackend(userMessage)
    .then((response) => {
      // Hapus pesan "Thinking..."
      thinkingMessage.remove();

      // Tambahkan pesan balasan dari bot
      if (response && response.reply) {
        console.log(response);
        appendMessage("bot", response.reply);
      } else {
        appendMessage("bot", "Sorry, no response received.");
      }
    })
    .catch((error) => {
      // Hapus pesan "Thinking..."
      thinkingMessage.remove();

      appendMessage("bot", "Failed to get response from server.");
      console.error("Error:", error);
    });
});

async function sendMessageToBackend(message) {
  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
