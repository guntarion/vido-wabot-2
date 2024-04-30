// This function fetches chat data from the server and displays messages for a specific chatId
// eslint-disable-next-line no-unused-vars
function loadMessages(chatId) {
    // console.log('Loading messages for chat:', chatId);
    fetch('/api/chats')  // Assuming '/api/chats' is set up to return the chatsData.json content
        .then(response => response.json())
        .then(chatsData => {
            const chat = chatsData.find(c => c.id === chatId);
            if (chat) {
                displayChatMessages(chat);
            }
        })
        .catch(error => console.error('Failed to load chats data:', error));
}

function displayChatMessages(chat) {
    const chatAvatar = document.getElementById('chat-avatar');
    const chatName = document.getElementById('chat-name');
    const chatLastOnline = document.getElementById('chat-last-online');
    const chatMessages = document.getElementById('chat-messages');

    chatAvatar.src = chat.avatar;
    chatName.textContent = chat.name;
    chatLastOnline.textContent = chat.lastonline;

    let messagesHtml = '';
    chat.messages.forEach(msg => {
        const alignClass = msg.type === 'me' ? ' me' : '';
        messagesHtml += `
            <div class="message${alignClass}">
                <div class="bubble">${msg.content}</div>
                <div class="time">${msg.time}</div>
            </div>
        `;
    });
    chatMessages.innerHTML = messagesHtml;
}

document.getElementById('get-content').addEventListener('click', function() {
    const chatMessages = document.getElementById('chat-messages');
    const chatContent = document.getElementById('chat-content');
    const lastSender = document.getElementById('last-sender');

    // Get the text content and type of all .message elements within #chat-messages
    const messages = Array.from(chatMessages.querySelectorAll('.message')).map(message => {
        const content = message.querySelector('.bubble').textContent;
        const type = message.classList.contains('me') ? 'CS' : 'Clients';
        return { type, content };
    });

    // Join the messages into a single string with line breaks between each message
    const messagesText = messages.map(message => `${message.type}: ${message.content}`).join('\n');

    // Insert the messages into #chat-content
    chatContent.textContent = messagesText;

    // Insert the type of the last message into #last-sender
    lastSender.textContent = messages[messages.length - 1].type;
});

document.getElementById('get-message').addEventListener('click', function() {
    const chatContent = document.getElementById('chat-content').textContent;
    const lastSender = document.getElementById('last-sender').textContent;
    console.log('chatContent:', chatContent);

    // Show the spinner
    document.querySelector('.css3-spinner').style.display = 'block';

    fetch('/api/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatContent, lastSender }),
    })
        .then(response => response.json())
        .then(data => {
            // Hide the spinner
            document.querySelector('.css3-spinner').style.display = 'none';

            document.getElementById('openai-output').value = data.message;
        })
        .catch(error => {
            // Hide the spinner in case of error
            document.querySelector('.css3-spinner').style.display = 'none';

            console.error('Error:', error);
        });
});