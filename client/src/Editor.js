import { useEffect, useState } from "react";
import socket from "./socket";

export default function Editor() {
  // ✅ Use URL path as document/room ID
  // Example URL: http://localhost:3000/doc/test
  const documentId = window.location.pathname;

  const [content, setContent] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    // Join document room
    socket.emit("get-document", documentId);

    // Load document from DB
    socket.on("load-document", data => {
      setContent(data);
      setIsLoaded(true);
    });

    // Receive real-time changes
    socket.on("receive-changes", data => {
      setContent(data);
    });

    return () => {
      socket.off("load-document");
      socket.off("receive-changes");
    };
  }, [documentId]);

  // Handle typing
  function handleChange(e) {
    const value = e.target.value;
    setContent(value);

    // Send changes to other users
    socket.emit("send-changes", value);

    // Save changes to MongoDB
    socket.emit("save-document", value);
  }

  if (!isLoaded) {
    return <h2 style={{ padding: "20px" }}>Loading document...</h2>;
  }

  return (
    <textarea
      value={content}
      onChange={handleChange}
      style={{
        width: "100%",
        height: "100vh",
        fontSize: "16px",
        padding: "10px",
        boxSizing: "border-box",
      }}
      placeholder="Start typing..."
    />
  );
}