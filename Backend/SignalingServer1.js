// const { Server } = require("socket.io");
// const { v4: uuidv4 } = require("uuid");
// const mediasoup = require("mediasoup");

// const io = new Server(8000, {
//   cors: {
//     origin: "*",
//   },
// });
// const PUBLIC_IP = "103.157.169.109";

// const emailToSocketIdMap = new Map();
// const socketIdToEmailMap = new Map();

// let onlineUsers = [];
// const rooms = {};

// let worker;
// const peers = {}; // Store peer connections
// const mediaCodecs = [
//   { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
//   { kind: "video", mimeType: "video/VP8", clockRate: 90000 },
// ];

// function initializeRoom(roomCode) {
//   if (!rooms[roomCode]) {
//     rooms[roomCode] = {
//       router: null,
//       peers: {},
//     };
//   }
//   return rooms[roomCode];
// }

// (async () => {
//   worker = await mediasoup.createWorker();
//   console.log("Mediasoup worker created");
// })();

// async function createWebRtcTransport(router) {
//   return await router.createWebRtcTransport({
//     listenIps: [{ ip: "0.0.0.0", announcedIp: PUBLIC_IP }],
//     enableUdp: true,
//     enableTcp: true,
//     preferUdp: true,
//   });
// }

// io.on("connection", (socket) => {
//   console.log(`Socket Connected: ${socket.id}`);

//   socket.on("create-room", async (callback) => {
//     try {
//       let roomCode;
//       do {
//         roomCode = uuidv4().slice(0, 6); // Generate a unique 6-character room code
//       } while (rooms[roomCode]);

//       console.log(`Room created with code: ${roomCode}`);
//       const room = initializeRoom(roomCode);
//       room.router = await worker.createRouter({ mediaCodecs });

//       room.peers[socket.id] = { transports: [], producers: [], consumers: [] };
//       socket.join(roomCode);

//       callback(roomCode);
//     } catch (error) {
//       console.error("Error creating room:", error);
//       callback({ error: "Room creation failed" });
//     }
//   });

//   socket.on("join-room", async ({ roomCode }) => {
//     console.log(`User ${socket.id} joining room: ${roomCode}`);

//     const room = initializeRoom(roomCode);

//     room.peers[socket.id] = { transports: [], producers: [], consumers: [] };
//     peers[socket.id] = { roomCode, socket };

//     socket.join(roomCode);

//     // Notify other users in the room about the new user
//     socket.to(roomCode).emit("user-joined", { userId: socket.id });

//     // Send router capabilities to the client
//     socket.emit("router-rtp-capabilities", room.router.rtpCapabilities);

//     // Handle transport creation
//     socket.on("create-transport", async ({ direction }) => {
//       const transport = await createWebRtcTransport(room.router);
//       room.peers[socket.id].transports.push(transport);

//       socket.emit(`${direction}-transport-created`, {
//         id: transport.id,
//         iceParameters: transport.iceParameters,
//         iceCandidates: transport.iceCandidates,
//         dtlsParameters: transport.dtlsParameters,
//       });

//       transport.on("dtlsstatechange", (state) => {
//         if (state === "closed") transport.close();
//       });
//     });

//     // Handle transport connection
//     socket.on("connect-transport", async ({ transportId, dtlsParameters }) => {
//       const transport = room.peers[socket.id].transports.find((t) => t.id === transportId);
//       await transport.connect({ dtlsParameters });
//     });

//     // Handle media production
//     socket.on("produce", async ({ transportId, kind, rtpParameters }) => {
//       const transport = room.peers[socket.id].transports.find((t) => t.id === transportId);
//       const producer = await transport.produce({ kind, rtpParameters });
//       room.peers[socket.id].producers.push(producer);

//       // Notify other users in the room about the new producer
//       socket.to(roomCode).emit("new-producer", { producerId: producer.id });
//     });

//     // Handle media consumption
//     socket.on("consume", async ({ producerId, rtpCapabilities }) => {
//       const roomPeer = room.peers[socket.id];
//       const consumerTransport = roomPeer.transports.find((t) => t.direction === "recv");

//       if (room.router.canConsume({ producerId, rtpCapabilities })) {
//         const consumer = await consumerTransport.consume({
//           producerId,
//           rtpCapabilities,
//         });

//         roomPeer.consumers.push(consumer);

//         socket.emit("consumer-created", {
//           id: consumer.id,
//           producerId,
//           kind: consumer.kind,
//           rtpParameters: consumer.rtpParameters,
//         });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log(`User disconnected: ${socket.id}`);
//       room.peers[socket.id]?.transports.forEach((transport) => transport.close());
//       delete room.peers[socket.id];

//       // Notify other users in the room about the user leaving
//       socket.to(roomCode).emit("user-left", { userId: socket.id });
//     });

//     socket.on("room:join", (data) => {
//       const { email, room } = data;
//       emailToSocketIdMap.set(email, socket.id);
//       socketIdToEmailMap.set(socket.id, email);

//       socket.join(room);
//       console.log(`User ${email} joined room ${room}`);

//       io.to(room).emit("user:joined", { email, id: socket.id });
//       io.to(socket.id).emit("room:join", data);
//     });

//     socket.on("user:call", ({ to, offer, isAudioOnly }) => {
//       console.log(`Incoming call from ${socket.id} to ${to}`);
//       io.to(to).emit("incoming:call", { from: socket.id, offer, isAudioOnly });
//     });

//     socket.on("call:accepted", ({ to, ans }) => {
//       console.log(`Call accepted by ${socket.id}`);
//       io.to(to).emit("call:accepted", { from: socket.id, ans });
//     });

//     socket.on("video:blur:toggle", ({ to, isBlurred }) => {
//       console.log(`Video blur state changed by ${socket.id} to ${isBlurred}`);
//       io.to(to).emit("video:blur:toggle", { from: socket.id, isBlurred });
//     });

//     socket.on("peer:nego:needed", ({ to, offer }) => {
//       io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//     });

//     socket.on("peer:nego:done", ({ to, ans }) => {
//       io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//     });

//     // Start a video call
//     socket.on("video:call:started", ({ to }) => {
//       console.log(`Video call started from ${socket.id} to ${to}`);
//       io.to(to).emit("video:call:started");
//     });

//     socket.on("call:ended", ({ to }) => {
//       console.log(`Call ended by ${socket.id}`);
//       io.to(to).emit("call:ended", { from: socket.id });
//     });

//     socket.on("sendRoomMessage", (message) => {
//       const { room, text, sender } = message;
//       console.log(`Message from ${sender} in room ${room}: ${text}`);

//       socket.to(room).emit("receiveRoomMessage", { ...message, sender: socket.id });

//       io.to(socket.id).emit("messageSent", message);
//     });

//     socket.on("addNewUser", (userId) => {
//       if (!onlineUsers.some(user => user.userId === userId)) {
//         onlineUsers.push({
//           userId,
//           socketId: socket.id
//         });
//       }

//       io.emit("getOnlineUsers", onlineUsers);
//     });

//     socket.on("sendMessage", (message) => {
//       const user = onlineUsers.find(
//         (user) => user.userId === message.recipientId
//       );
//       console.log("message", message);

//       if (user) {
//         io.to(user.socketId).emit("getMessage", message);
//       }
//     });

//     socket.on("disconnect", () => {
//       onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
//       io.emit("getOnlineUsers", onlineUsers);

//       const email = socketIdToEmailMap.get(socket.id);
//       if (email) {
//         emailToSocketIdMap.delete(email);
//         socketIdToEmailMap.delete(socket.id);
//       }
//     });
//   });
// });