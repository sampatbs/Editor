require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const Document = require("./models/Document");

const app = express();
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// ✅ CREATE SOCKET.IO SERVER (THIS WAS MISSING)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/realtime_editor")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Socket logic
io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId);

    socket.join(documentId);
    socket.emit("load-document", document.content);

    socket.on("send-changes", data => {
      socket.broadcast.to(documentId).emit("receive-changes", data);
    });

    socket.on("save-document", async data => {
  console.log("SAVE EVENT RECEIVED");
  console.log("DOCUMENT ID:", documentId);
  console.log("CONTENT LENGTH:", data.length);

  await Document.findByIdAndUpdate(
    documentId,
    { content: data },
    { upsert: true }
  );

  console.log("SAVED TO MONGODB");
    });
  });
});

// ✅ STEP 3 — MUST BE OUTSIDE io.on
async function findOrCreateDocument(id) {
  if (!id) return;

  const document = await Document.findById(id);
  if (document) return document;

  return await Document.create({ _id: id, content: "" });
}

// Start server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});