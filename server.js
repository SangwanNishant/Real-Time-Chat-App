const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;
const SECRET = process.env.JWT_SECRET;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log("mongoDB connected");
}).catch((error)=>{
  console.log("error connecting to mongoDB", error);
})

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// In-memory storage for socket IDs
const onlineUsers = {};

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send("User created successfully!");
  } catch (err) {
    res.status(400).send("Username already exists.");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid credentials.");
    }

    const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true }).send("Login successful!");
  } catch (err) {
    res.status(500).send("Error logging in.");
  }
});

// Verify Token Middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send("Unauthorized.");

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token.");
    req.user = user;
    next();
  });
};

// Get User Info
app.get("/me", authenticateToken, (req, res) => {
  res.send(req.user);
});

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Save user with their Socket ID
  socket.on("register_user", (username) => {
    onlineUsers[username] = socket.id;
    console.log(`${username} registered with socket ID: ${socket.id}`);
  });

  // Handle direct messaging
  socket.on("send_message", ({ to, message }) => {
    const recipientSocket = onlineUsers[to];
    if (recipientSocket) {
      io.to(recipientSocket).emit("receive_message", {
        from: socket.id,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [username, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) delete onlineUsers[username];
    }
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
