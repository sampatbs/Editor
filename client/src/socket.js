import { io } from "socket.io-client";

const socket = io("http://10.216.234.34:5000", {
  transports: ["websocket"],
});

export default socket;