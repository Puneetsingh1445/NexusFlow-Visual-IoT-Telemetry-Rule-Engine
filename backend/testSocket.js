
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to NexusFlow Socket.IO!");
  console.log("Socket ID:", socket.id);
});

socket.on("newAlert", (alert) => {
  console.log("NEW REAL-TIME ALERT RECEIVED!");
  console.log("Alert details:");
  console.log(JSON.stringify(alert, null, 2));
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
