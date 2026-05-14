const express = require("express");
const cors = require("cors");
const http = require("http"); // Wajib di-import
const { Server } = require("socket.io"); // Wajib di-import

const app = express();
app.use(cors());
app.use(express.json());

// Bikin server HTTP pakai Express
const server = http.createServer(app);

// Pasang Socket.io di server HTTP tadi
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Masukin io ke global biar bisa dipanggil di controller (kayak pas create order)
global.io = io;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// Routes lu...
app.use("/api", require("./routes/menuRoutes"));

const PORT = 8448;
// PENTING: Gunakan server.listen, BUKAN app.listen
server.listen(PORT, () => {
  console.log(`Server & Socket.io jalan di port ${PORT} bro!`);
});
