// Create main container
const chatContainer = document.createElement('div');
chatContainer.className = 'chat-container';
document.body.appendChild(chatContainer);

// Create chat messages container
const chatMessages = document.createElement('div');
chatMessages.id = 'chat-messages';
chatMessages.className = 'chat-messages';
chatContainer.appendChild(chatMessages);

// Create welcome message
const welcomeMessage = document.createElement('div');
welcomeMessage.className = 'message bot-message';
welcomeMessage.textContent = 'Lobby chat';
chatMessages.appendChild(welcomeMessage);

// Create join input area
const joinArea = document.createElement('div');
joinArea.className = 'join-input';
chatContainer.appendChild(joinArea);

const joinInput = document.createElement('input');
joinInput.id = 'join-input';
joinInput.type = 'text';
joinInput.placeholder = 'Enter your name';
joinArea.appendChild(joinInput);

const joinButton = document.createElement('button');
joinButton.id = 'join-button';
joinButton.textContent = 'Join';
joinArea.appendChild(joinButton);

// Create chat input area
const chatInputArea = document.createElement('div');
chatInputArea.className = 'chat-input';
chatContainer.appendChild(chatInputArea);

const messageInput = document.createElement('input');
messageInput.id = 'message-input';
messageInput.type = 'text';
messageInput.placeholder = 'Type your message...';
chatInputArea.appendChild(messageInput);

const sendButton = document.createElement('button');
sendButton.id = 'send-button';
sendButton.textContent = 'Send';
chatInputArea.appendChild(sendButton);

const container = document.querySelector(".container");
container.appendChild(chatContainer);
let userName = '';

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        addMessage('user', message);
        messageInput.value = '';
    }
}

function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender + '-message');

    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = formattedTimeStamp();
    messageElement.appendChild(timestamp);

    const textElement = document.createElement('span');
    textElement.className = 'message-text';
    textElement.textContent = userName + ': ' + text;
    messageElement.appendChild(textElement);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formattedTimeStamp() {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    return `${hours}:${minutes}`;
}
joinButton.addEventListener('click', e => {
    userName = joinInput.value;
    joinInput.value = '';
    joinArea.style.display = 'none';
    chatInputArea.style.display = 'flex';
});

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initially hide the chat input area
chatInputArea.style.display = 'none';