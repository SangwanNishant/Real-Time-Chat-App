document.addEventListener('DOMContentLoaded', () => {
  const profilePic = document.getElementById('profilePic');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const logoutBtn = document.getElementById('logoutBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const profileImg = document.getElementById('profileImg');
  const searchBar = document.getElementById('searchBar');
  const chatList = document.getElementById('chatList');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const messagesDiv = document.getElementById('messages');
  const chatWith = document.getElementById('chatWith');
  const status = document.getElementById('status');
  
  let selectedUser = null;

  // Fetching logged-in user's data (no sample data)
  async function fetchUserData() {
      try {
          const response = await fetch('/get-user-data');
          const data = await response.json();

          if (data.username) {
              // Set profile image and name
              profileImg.src = data.profilePic || ''; // Profile pic
              profileImg.alt = data.username;
              profilePic.addEventListener('click', toggleDropdownMenu);

              // Chat list will be populated dynamically with contacts
              // If there are contacts, they will be displayed here
              if (data.contacts && data.contacts.length > 0) {
                  data.contacts.forEach(contact => {
                      const chatItem = document.createElement('div');
                      chatItem.classList.add('chat-item');
                      chatItem.innerHTML = `
                          <img src="${contact.profilePic}" alt="Profile Picture">
                          <div class="details">
                              <div class="name">${contact.username}</div>
                              <div class="message">${contact.lastMessage || 'No messages yet'}</div>
                          </div>
                      `;
                      chatItem.addEventListener('click', () => startChat(contact.username));
                      chatList.appendChild(chatItem);
                  });
              }
          } else {
              // Redirect to login if user is not logged in
              window.location.href = '/login';
          }
      } catch (error) {
          console.error('Error fetching user data:', error);
      }
  }

  // Toggle dropdown menu on profile click
  function toggleDropdownMenu() {
      dropdownMenu.classList.toggle('hidden');
  }

  // Logout functionality
  logoutBtn.addEventListener('click', () => {
      alert('Logging out...');
      // Implement actual logout functionality
  });

  // Settings functionality
  settingsBtn.addEventListener('click', () => {
      alert('Redirecting to settings...');
      // Implement actual settings page redirection or functionality
  });

  // Function to start chat with selected contact
  function startChat(username) {
      selectedUser = username;
      chatWith.textContent = `Chatting with ${username}`;
      messageInput.disabled = false;
      sendMessageBtn.disabled = false;
      messagesDiv.innerHTML = ''; // Clear previous messages

      // Fetch messages for this user
      fetchMessages(username);
  }

  // Fetch chat messages for selected user
  async function fetchMessages(username) {
      try {
          const response = await fetch(`/get-messages/${username}`);
          const data = await response.json();
          
          // Display messages
          if (data.messages && data.messages.length > 0) {
              data.messages.forEach(message => {
                  const messageDiv = document.createElement('div');
                  messageDiv.classList.add('message', message.type);
                  messageDiv.innerHTML = `<div class="message-text">${message.text}</div>`;
                  messagesDiv.appendChild(messageDiv);
              });
          } else {
              messagesDiv.innerHTML = `<div class="message">No messages yet</div>`;
          }
      } catch (error) {
          console.error('Error fetching messages:', error);
      }
  }

  // Send message functionality
  sendMessageBtn.addEventListener('click', async () => {
      const message = messageInput.value.trim();
      if (message && selectedUser) {
          try {
              const response = await fetch('/send-message', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ to: selectedUser, text: message })
              });
              const data = await response.json();
              if (data.success) {
                  const newMessage = document.createElement('div');
                  newMessage.classList.add('message', 'sent');
                  newMessage.innerHTML = `<div class="message-text">${message}</div>`;
                  messagesDiv.appendChild(newMessage);
                  messageInput.value = ''; // Clear input field
              }
          } catch (error) {
              console.error('Error sending message:', error);
          }
      }
  });

  // Initial data fetch
  fetchUserData();
});
