document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    const toggleButton = document.getElementById('chat-toggle');
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Toggle chat visibility
    toggleButton.addEventListener('click', function() {
        chatContainer.classList.toggle('hidden');
    });

    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user-message');
        userInput.value = '';

        // Send to backend
        fetch('http://localhost/E-Learning/backend/chatbot.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                addMessage('Error: ' + data.error, 'bot-message');
            } else {
                addMessage(data.response, 'bot-message');
            }
        })
        .catch(error => {
            addMessage('Error connecting to chatbot service', 'bot-message');
        });
    }

    // Add message to chat box
    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = className;
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}); 