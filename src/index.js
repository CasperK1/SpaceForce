import { io} from "socket.io-client";


const messageInput = document.getElementById('message-input');
const joinInput = document.getElementById('join-input');
const joinButton = document.getElementById('join-button');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');


let userName = '';

const socket = io('http://localhost:3000');
socket.on('connect', () => {
    console.log('Connected to server with id ' + socket.id);
})

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        addMessage('user', message);
        messageInput.value = '';

    }
}

function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender + '-message');
    messageElement.textContent = userName + ': ' + text;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


joinButton.addEventListener('click', e => {
    userName=  joinInput.value
    joinInput.value = '';

});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});