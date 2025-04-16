import { io } from "socket.io-client";

const socket = io("http://192.168.1.155:5000", {
  transports: ['websocket'],
  reconnection: false
});

// socket.on("connect", () => {
//   console.log("Connected to socket server:", socket.id);
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from socket server");
// });

export default socket;