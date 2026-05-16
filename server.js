const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// 1. Setup CORS (Biar frontend bisa nembak API)
app.use(cors());

// 2. PENTING: Setup Body Parser Limit (TARUH DI SINI SEBELUM ROUTES)
console.log("=== MENGAKTIFKAN LIMIT UPLOAD 50MB ===");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 3. Bikin server HTTP pakai Express
const server = http.createServer(app);

// 4. Pasang Socket.io di server HTTP tadi
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});

// Masukin io ke global biar bisa dipanggil di controller manapun
global.io = io;

io.on("connection", (socket) => {
  console.log("Client connected ke Socket:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// 5. Daftarin semua Routes API lu di sini
// (Pastiin ngga ada app.use(express.json()) lagi di dalem file-file routes ini ya!)
app.use("/api", require("./routes/menuRoutes"));

// Catatan: Jangan lupa un-comment dan sesuain sama routes lu yang lain bro
// app.use("/api", require("./routes/orderRoutes"));
// app.use("/api", require("./routes/inventoryRoutes"));
// app.use("/api", require("./routes/purchaseRoutes"));
// app.use("/api", require("./routes/stockOpnameRoutes"));
// app.use("/api", require("./routes/supplierRoutes"));

// 6. Jalankan Server
const PORT = 8448;
server.listen(PORT, () => {
  console.log(
    `🚀 Server & Socket.io udah jalan dan siap nerima file gede di port ${PORT}!`,
  );
});
