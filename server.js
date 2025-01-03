const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const http = require('http'); // Import the HTTP module
const socketIo = require('socket.io'); // Import socket.io
require("dotenv").config();
const path = require('path');
const { log } = require('console');

const app = express();
const server = http.createServer(app); // Create the HTTP server
const io = socketIo(server); // Initialize socket.io with the HTTP server

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI);

// Define the User schema and model
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

app.use(express.static('public')); // Serve static files from the 'public' folder

// Session configuration
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
    })
);

// Serve the index.html for the landing page
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', "/index.html"));
    } catch (error) {
        console.log("Error occurred during sending index.html file: ", error.message);
    }
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // If logged in, continue to the next middleware or route
    }
    res.redirect('/'); // If not logged in, redirect to the landing page
}

// Add this route to handle the search query
app.get('/search', isAuthenticated, async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json([]);
    }
    try {
        // Search for users that match the query
        const users = await User.find({ username: { $regex: query, $options: 'i' } }); // Case-insensitive search
        res.json(users);
    } catch (err) {
        console.error('Error searching for users:', err);
        res.status(500).json({ message: 'Error searching for users' });
    }
});


// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        req.session.user = { username: newUser.username };
        res.status(201).json({ username: newUser.username });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: 'Username or email already exists' });
        } else {
            res.status(500).json({ message: 'Error creating user' });
        }
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = { username: user.username };
            res.json({ username: user.username });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error during login' });
    }
});

// Chat route (only accessible for logged-in users)
app.get('/chat', isAuthenticated, (req, res) => {
    try {
        // Serve the chat page only if user is logged in
        res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    } catch (error) {
        console.log("Error occurred during sending chat.html file: ", error.message);
    }
});

// Logout route (optional, allows users to log out)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect('/'); // Redirect to the landing page after logout
    });
});

// Socket.IO logic
const userSockets = {}; // Store user sockets to track connections

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // When a user logs in, associate their socket with their username
    socket.on('set-username', (username) => {
        userSockets[username] = socket.id; // Store the socket ID for the user
        console.log(`${username} is now connected with socket ID: ${socket.id}`);
    });

    // Handle sending a message to another user
    socket.on('send-message', (data) => {
        const { recipient, message } = data;
        const recipientSocketId = userSockets[recipient]; // Get the socket ID of the recipient

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive-message', { sender: data.sender, message });
            console.log(`Message sent to ${recipient}`);
        } else {
            console.log('Recipient not connected');
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
