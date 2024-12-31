document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Initialize the Socket.IO client

    const sendButton = document.querySelector('#sendButton');
    const messageInput = document.querySelector('#messageInput');
    const chatMessages = document.querySelector('#chatMessages');
    const searchBar = document.querySelector('#searchBar');
    const resultsContainer = document.querySelector('#searchResults');
    const usernameElement = document.querySelector('#username');
    const contactNameElement = document.querySelector('#contact-name');
    const loggedInUser = usernameElement.textContent; // Assume logged-in user info is dynamically populated

    // Set the username of the user when they log in
    socket.emit('set-username', loggedInUser);

    // Handle sending a message
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        const recipient = contactNameElement.textContent;

        if (message && recipient) {
            // Send the message to the recipient
            socket.emit('send-message', { sender: loggedInUser, recipient, message });

            // Display the message in the chat area (for the sender)
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.textContent = `You: ${message}`;
            chatMessages.appendChild(messageElement);
            messageInput.value = ''; // Clear input field
        }
    });

    // Handle receiving a message
    socket.on('receive-message', (data) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = `${data.sender}: ${data.message}`;
        chatMessages.appendChild(messageElement);
    });

    // Handle search input for searching contacts
    searchBar.addEventListener('input', async (event) => {
        const query = event.target.value.trim();

        if (query.length > 0) {
            try {
                const response = await fetch(`/search?q=${query}`);
                const users = await response.json();

                resultsContainer.innerHTML = ''; // Clear previous results
                users.forEach((user) => {
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('search-result');
                    resultItem.textContent = user.username;
                    resultItem.addEventListener('click', () => {
                        contactNameElement.textContent = user.username; // Set the contact's name in the chat window
                        resultsContainer.innerHTML = ''; // Clear the search results
                    });
                    resultsContainer.appendChild(resultItem);
                });
            } catch (err) {
                console.error('Error fetching search results:', err);
            }
        } else {
            resultsContainer.innerHTML = ''; // Clear search results if query is empty
        }
    });
});
