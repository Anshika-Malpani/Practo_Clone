const { Server } = require("socket.io");
const mediasoup = require("mediasoup");
const { v4: uuidv4 } = require("uuid");

const io = new Server(8000, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

let worker;
let transports = []; 
let producers = [];
let consumers = [];
let peers = {};


const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
];


const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2100,
  });
  console.log(`Worker PID: ${worker.pid}`);

  worker.on('died', error => {
    console.error('Mediasoup worker has died');
    setTimeout(() => process.exit(1), 2000);s
  });

  return worker;
};

worker = createWorker();


const createWebRtcTransport = async (router) => {
  return new Promise(async (resolve, reject) => {
    try {
      const webRtcTransport_options = {
        listenIps: [
          {
            ip: '0.0.0.0', 
            announcedIp: '192.168.1.36',
          }
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      }

      let transport = await router.createWebRtcTransport(webRtcTransport_options);
      console.log(`Transport created with ID: ${transport.id}`); 

      transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') {
          transport.close();
          console.log(`Transport closed: ${transport.id}`); 
        }
      });

      transport.on('close', () => {
        console.log('Transport closed');
      });

      resolve(transport)
    } catch (error) {
      console.error("Error creating transport:", error); 
      reject(error);
    }
  })

}

io.on("connection", (socket) => {
  console.log('New client connected:', socket.id);
  socket.emit('connection-success', {
    socketId: socket.id
  });

  const removeItems = (items, socketId, type) => {
    items.forEach(item => {
      if (item.socketId === socket.id) {
        item[type].close()
      }
    })
    items = items.filter(item => item.socketId !== socket.id)

    return items
  }

  
  socket.on("create-roomCode", async (callback) => {
    try {
      let roomCode;
      do {
        roomCode = uuidv4().slice(0, 6); 
      } while (rooms[roomCode]);

      console.log(`Room created with code: ${roomCode}`); 
      callback(roomCode);
    } catch (error) {
      console.error("Error creating room:", error);
      callback({ error: "Room creation failed" });
    }
  });

  socket.on('disconnect', () => {
    // do some cleanup
    console.log('peer disconnected');

    consumers = removeItems(consumers, socket.id, 'consumer');
    producers = removeItems(producers, socket.id, 'producer');
    transports = removeItems(transports, socket.id, 'transport');

    if (peers[socket.id]) {
      const { roomCode } = peers[socket.id];
      delete peers[socket.id];

      // remove socket from room
      if (rooms[roomCode]) {
        rooms[roomCode] = {
          router: rooms[roomCode].router,
          peers: rooms[roomCode].peers.filter(socketId => socketId !== socket.id)
        };
      }
    } else {
      console.warn(`No peer found for socket ID: ${socket.id}`);
    }
  });

  socket.on('joinRoom', async ({ roomCode }, callback) => {
    console.log("roomCode", roomCode);

   
    const router1 = await createRoom(roomCode, socket.id)

    peers[socket.id] = {
      socket,
      roomCode,           
      transports: [],
      producers: [],
      consumers: [],
      peerDetails: {
        name: '',
        isAdmin: false,   
      }
    }


    const rtpCapabilities = router1.rtpCapabilities
    const socketId = socket.id

    
    callback({ rtpCapabilities, socketId })
  })

  const createRoom = async (roomCode, socketId) => {
    let peers = []
    if (rooms[roomCode]) {
      router1 = rooms[roomCode].router
      peers = rooms[roomCode].peers || []
    } else {
      router1 = await worker.createRouter({ mediaCodecs, })
    }

    console.log(`Router ID: ${router1.id}`, peers.length)

    rooms[roomCode] = {
      router: router1,
      peers: [...peers, socketId],
    }

    return router1
  }


  const getRtpCapabilities = (callback) => {
    const rtpCapabilities = router.rtpCapabilities;
    callback({ rtpCapabilities });
  };

  socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
    const roomCode = peers[socket.id].roomCode
    const router = rooms[roomCode].router

    createWebRtcTransport(router).then(
      transport => {
        callback({
          params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          }
        })

       
        addTransport(transport, roomCode, consumer)
      },
      error => {
        console.log(error)
      })
  })

  const addTransport = (transport, roomCode, consumer) => {

    transports = [
      ...transports,
      { socketId: socket.id, transport, roomCode, consumer, }
    ]

    peers[socket.id] = {
      ...peers[socket.id],
      transports: [
        ...peers[socket.id].transports,
        transport.id,
      ]
    }
  }


  const addProducer = (producer, roomCode) => {
    producers = [
      ...producers,
      { socketId: socket.id, producer, roomCode, }
    ]

    peers[socket.id] = {
      ...peers[socket.id],
      producers: [
        ...peers[socket.id].producers,
        producer.id,
      ]
    }
  }

  const addConsumer = (consumer, roomCode) => {
   
    consumers = [
      ...consumers,
      { socketId: socket.id, consumer, roomCode, }
    ]


    peers[socket.id] = {
      ...peers[socket.id],
      consumers: [
        ...peers[socket.id].consumers,
        consumer.id,
      ]
    }
  }

  socket.on('getProducers', callback => {
  
    const { roomCode } = peers[socket.id]

    let producerList = []
    producers.forEach(producerData => {
      if (producerData.socketId !== socket.id && producerData.roomCode === roomCode) {
        producerList = [...producerList, producerData.producer.id]
      }
    })

   
    callback(producerList)
  })

  const informConsumers = (roomCode, socketId, id) => {
    console.log(`just joined, id ${id} ${roomCode}, ${socketId}`)
 
    producers.forEach(producerData => {
      if (producerData.socketId !== socketId && producerData.roomCode === roomCode) {
        const producerSocket = peers[producerData.socketId].socket
        producerSocket.emit('new-producer', { producerId: id })
      }
    })
  }

  const getTransport = (socketId) => {
    const [producerTransport] = transports.filter(transport => transport.socketId === socketId && !transport.consumer)
    return producerTransport.transport
  }

  socket.on('transport-connect', ({ dtlsParameters }) => {
    console.log('DTLS PARAMS... ', { dtlsParameters });
    getTransport(socket.id).connect({ dtlsParameters })
  });

  socket.on('transport-produce', async ({ kind, rtpParameters }, callback) => {
    const producer = await getTransport(socket.id).produce({ kind, rtpParameters });
    // console.log(producer);

    const { roomCode } = peers[socket.id]

    addProducer(producer, roomCode)

    informConsumers(roomCode, socket.id, producer.id)

    console.log('Producer ID: ', producer.id, producer.kind);

    producer.on('transportclose', () => {
      console.log('transport for this producer closed');
      producer.close();
    });
    console.log(producers);

    callback({ id: producer.id, producersExist: producers.length > 1 ? true : false });
  });

  socket.on('transport-recv-connect', async ({ dtlsParameters, serverConsumerTransportId }) => {
    console.log(`DTLS PARAMS: ${dtlsParameters}`)
    const consumerTransport = transports.find(transportData => (
      transportData.consumer && transportData.transport.id == serverConsumerTransportId
    )).transport
    await consumerTransport.connect({ dtlsParameters })
  })

  socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
    try {

      const { roomCode } = peers[socket.id]
      const router = rooms[roomCode].router
      let consumerTransport = transports.find(transportData => (
        transportData.consumer && transportData.transport.id == serverConsumerTransportId
      )).transport

 
      if (router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities
      })) {
      
        const consumer = await consumerTransport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true,
        })

        consumer.on('transportclose', () => {
          console.log('transport close from consumer')
        })

        consumer.on('producerclose', () => {
          console.log('producer of consumer closed')
          socket.emit('producer-closed', { remoteProducerId })

          consumerTransport.close([])
          transports = transports.filter(transportData => transportData.transport.id !== consumerTransport.id)
          consumer.close()
          consumers = consumers.filter(consumerData => consumerData.consumer.id !== consumer.id)
        })

        addConsumer(consumer, roomCode)

        
        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
          socketId:socket.id
        }

 
        callback({ params })
      }
    } catch (error) {
      console.log(error.message)
      callback({
        params: {
          error: error
        }
      })
    }
  })


  socket.on("toggle-video-blur", ({ producerId, isBlurred }) => {
    socket.broadcast.emit("toggle-video-blur", { producerId, isBlurred });
  });
  


  socket.on('consumer-resume', async ({ serverConsumerId }) => {
    console.log('consumer resume');
    const { consumer } = consumers.find(consumerData => consumerData.consumer.id === serverConsumerId)
    await consumer.resume();
  });
  socket.on("sendRoomMessage", (message) => {
    const { room, text, sender } = message;
    console.log(`Message from ${sender} in room ${room}: ${text}`);

    socket.broadcast.emit("receiveRoomMessage", message);

    socket.emit("messageSent", message);
  });
});



