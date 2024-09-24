// Create main container
const chatContainer = document.createElement("div");
chatContainer.className = "chat-container";
document.body.appendChild(chatContainer);

// Create chat messages container
const chatMessages = document.createElement("div");
chatMessages.id = "chat-messages";
chatMessages.className = "chat-messages";
chatContainer.appendChild(chatMessages);

// Create welcome message
const welcomeMessage = document.createElement("div");
welcomeMessage.className = "message bot-message";
welcomeMessage.textContent = "Lobby chat";
chatMessages.appendChild(welcomeMessage);

// Create chat input area
const chatInputArea = document.createElement("div");
chatInputArea.className = "chat-input";
chatContainer.appendChild(chatInputArea);

const messageInput = document.createElement("input");
messageInput.id = "message-input";
messageInput.type = "text";
messageInput.placeholder = "Type your message...";
chatInputArea.appendChild(messageInput);

const sendButton = document.createElement("button");
sendButton.id = "send-button";
sendButton.textContent = "Send";
chatInputArea.appendChild(sendButton);

const container = document.querySelector(".container");
container.appendChild(chatContainer);

function addMessage(sender, text, userName) {
  if (userName) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender + "-message");

    const timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.textContent = formattedTimeStamp();
    messageElement.appendChild(timestamp);

    const textElement = document.createElement("span");
    textElement.className = "message-text";
    textElement.textContent = userName + ": " + text;
    messageElement.appendChild(textElement);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function botMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "bot-message");

    const timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.textContent = formattedTimeStamp();
    messageElement.appendChild(timestamp);

    const textElement = document.createElement("span");
    textElement.className = "message-text";
    textElement.textContent = message;
    messageElement.appendChild(textElement);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formattedTimeStamp() {
  const date = new Date();
  return date.toLocaleTimeString("en-US", {hour12: false});
}


function sendMessageBackend() {
  socket.emit("chat-message", messageInput.value);
  messageInput.value = "";
}

sendButton.addEventListener("click", () => {
  sendMessageBackend();
});

messageInput.addEventListener("keypress", function (e) {
  if (!messageInput.value) return;

  if (e.key === "Enter") {
    sendMessageBackend();
  }
});
socket.on("chat-message", ({senderId, message, userName}) => {
  if (senderId === socket.id) {
    addMessage("user", message, userName);
  } else {
    addMessage("other", message, userName);
  }
});

socket.on("bot-message", ({message}) => {
    botMessage(message);
});

chatInputArea.style.display = "none";