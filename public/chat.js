const socket = io();

// Get user info
fetch("/me")
  .then((res) => res.json())
  .then((user) => {
    document.getElementById("username").textContent = user.username;

    // Register user with socket
    socket.emit("register_user", user.username);
  })
  .catch(() => (window.location.href = "/"));

// Handle message sending
document.getElementById("sendMessage").addEventListener("click", () => {
  const recipient = document.getElementById("recipient").value.trim();
  const message = document.getElementById("messageInput").value.trim();

  if (recipient && message) {
    socket.emit("send_message", { to: recipient, message });

    const messagesDiv = document.getElementById("messages");
    const newMessage = document.createElement("p");
    newMessage.textContent = `You to ${recipient}: ${message}`;
    messagesDiv.appendChild(newMessage);
    document.getElementById("messageInput").value = "";
  }
});

// Display incoming messages
socket.on("receive_message", (data) => {
  const { from, message } = data;

  const messagesDiv = document.getElementById("messages");
  const newMessage = document.createElement("p");
  newMessage.textContent = `Message from ${from}: ${message}`;
  messagesDiv.appendChild(newMessage);
});
