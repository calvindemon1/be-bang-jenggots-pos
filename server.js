const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Load Routes
const posRoutes = require("./routes/menuRoutes");
app.use("/api", posRoutes);

app.get("/", (req, res) => res.send("API F&B Western POS mantap berjalan!"));

const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Izinin akses dari frontend
});

// Masukin io ke global biar bisa dipake di controller
global.io = io;

const PORT = process.env.PORT || 8448;
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});
