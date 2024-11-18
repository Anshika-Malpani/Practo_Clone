const { Server } = require("socket.io");

// Initialize Socket.IO server on port 8000 with CORS enabled
const io = new Server(8000, {
  cors: {
    origin: "*", // Allow all origins for development; restrict in production
  },
});

const emailToSocketIdMap = new Map(); // Maps user email to socket ID
const socketIdToEmailMap = new Map(); // Maps socket ID to user email

let onlineUsers = []

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // Handle room joining
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    socket.join(room); // Join the specified room
    console.log(`User ${email} joined room ${room}`);

    // Notify room members that a user has joined
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", data); // Acknowledge joining to the user
  });

  // Handle sending a message to a specific room
  // socket.on("sendRoomMessage", (message) => {
  //   const { room, text, sender } = message;
  //   console.log(`Message from ${sender} in room ${room}: ${text}`);

  //   // Broadcast the message to all users in the room except the sender
  //   socket.to(room).emit("receiveRoomMessage", { ...message, sender: socket.id });
  // });

 

  // Handle user initiating a call
  socket.on("user:call", ({ to, offer, isAudioOnly }) => {
    console.log(`Incoming call from ${socket.id} to ${to}`);
    io.to(to).emit("incoming:call", { from: socket.id, offer, isAudioOnly });
  });

  // Handle when a call is accepted
  socket.on("call:accepted", ({ to, ans }) => {
    console.log(`Call accepted by ${socket.id}`);
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("video:blur:toggle", ({ to, isBlurred }) => {
    console.log(`Video blur state changed by ${socket.id} to ${isBlurred}`);
    io.to(to).emit("video:blur:toggle", { from: socket.id, isBlurred }); // Emit the new blur state to the other user
  });

  // Handle peer negotiation needed
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  // Handle peer negotiation completion
  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  // Start a video call
  socket.on("video:call:started", ({ to }) => {
    console.log(`Video call started from ${socket.id} to ${to}`);
    io.to(to).emit("video:call:started");
  });

  socket.on("call:ended", ({ to }) => {
    console.log(`Call ended by ${socket.id}`);
    io.to(to).emit("call:ended", { from: socket.id }); // Notify the other user

    
  });

    // Handle sending a message to a specific room
    socket.on("sendRoomMessage", (message) => {
      const { room, text, sender } = message;
      console.log(`Message from ${sender} in room ${room}: ${text}`);
  
      // Broadcast the message to all users in the room except the sender
      socket.to(room).emit("receiveRoomMessage", { ...message, sender: socket.id });
      
      // Emit confirmation back to the sender
      io.to(socket.id).emit("messageSent", message);
    });

  socket.on("addNewUser", (userId) => {
    !onlineUsers.some(user => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id
      })
      // console.log("onlineUsers",onlineUsers);
      io.emit("getOnlineUsers", onlineUsers)

  })

  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId)
    // console.log("Users",user);
    console.log("message",message);
    
    if (user) {
      io.to(user.socketId).emit("getMessage", message)
    }

  })





  socket.on("disconnect", () => {
    onlineUsers=onlineUsers.filter(user => user.socketId !== socket.id)
    io.emit("getOnlineUsers",onlineUsers)

    // Clean up the socket ID and email mapping
    const email = socketIdToEmailMap.get(socket.id);
    if (email) {
      emailToSocketIdMap.delete(email);
      socketIdToEmailMap.delete(socket.id);
    }
  });
});
