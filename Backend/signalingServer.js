const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const mediasoup = require("mediasoup");

const io = new Server(8000, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

let worker;
let transports = []; // [ { socketId1, roomName1, transport, consumer }, ... ]
let producers = [];
let consumers = [];
let peers = {};
let producerTransport;
let consumerTransport;

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

// Create Mediasoup worker
const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2020,
  });
  console.log(`Worker PID: ${worker.pid}`);

  worker.on('died', error => {
    console.error('Mediasoup worker has died');
    setTimeout(() => process.exit(1), 2000); // Exit in 2 seconds
  });

  return worker;
};

worker = createWorker();

// Create WebRTC transport
const createWebRtcTransport = async (router) => {
  return new Promise(async (resolve, reject) => {
    try {
      const webRtcTransport_options = {
        listenIps: [
          {
            ip: '0.0.0.0', // replace with relevant IP address
            announcedIp: '192.168.1.33',
          }
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      }

      let transport = await router.createWebRtcTransport(webRtcTransport_options);
      console.log(`Transport created with ID: ${transport.id}`); // Log transport creation

      transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') {
          transport.close();
          console.log(`Transport closed: ${transport.id}`); // Log transport closure
        }
      });

      transport.on('close', () => {
        console.log('Transport closed');
      });

      resolve(transport)
    } catch (error) {
      console.error("Error creating transport:", error); // Log transport creation error
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
        roomCode = uuidv4().slice(0, 6); // Generate a unique 6-character room code
      } while (rooms[roomCode]);

      console.log(`Room created with code: ${roomCode}`); // Log room creation
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
    console.log("roomCode",roomCode);
    
    // create Router if it does not exist
    // const router1 = rooms[roomName] && rooms[roomName].get('data').router || await createRoom(roomName, socket.id)
    const router1 = await createRoom(roomCode, socket.id)

    peers[socket.id] = {
      socket,
      roomCode,           // Name for the Router this Peer joined
      transports: [],
      producers: [],
      consumers: [],
      peerDetails: {
        name: '',
        isAdmin: false,   // Is this Peer the Admin?
      }
    }

    // get Router RTP Capabilities
    const rtpCapabilities = router1.rtpCapabilities

    // call callback from the client and send back the rtpCapabilities
    callback({ rtpCapabilities })
  })

  const createRoom = async (roomCode, socketId) => {
    // worker.createRouter(options)
    // options = { mediaCodecs, appData }
    // mediaCodecs -> defined above
    // appData -> custom application data - we are not supplying any
    // none of the two are required
    let router1
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

  // socket.on('createRoom', async (callback) => {
  //   if (!router) {
  //     router = await worker.createRouter({ mediaCodecs });
  //     console.log(`Router ID: ${router.id}`);
  //   }
  //   getRtpCapabilities(callback);
  // });

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

        // add transport to Peer's properties
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
    // add the consumer to the consumers list
    consumers = [
      ...consumers,
      { socketId: socket.id, consumer, roomCode, }
    ]

    // add the consumer id to the peers list
    peers[socket.id] = {
      ...peers[socket.id],
      consumers: [
        ...peers[socket.id].consumers,
        consumer.id,
      ]
    }
  }

  socket.on('getProducers', callback => {
    //return all producer transports
    const { roomCode } = peers[socket.id]

    let producerList = []
    producers.forEach(producerData => {
      if (producerData.socketId !== socket.id && producerData.roomCode === roomCode) {
        producerList = [...producerList, producerData.producer.id]
      }
    })

    // return the producer list back to the client
    callback(producerList)
  })

  const informConsumers = (roomCode, socketId, id) => {
    console.log(`just joined, id ${id} ${roomCode}, ${socketId}`)
    // A new producer just joined
    // let all consumers to consume this producer
    producers.forEach(producerData => {
      if (producerData.socketId !== socketId && producerData.roomCode === roomCode) {
        const producerSocket = peers[producerData.socketId].socket
        // use socket to send producer id to producer
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

      // check if the router can consume the specified producer
      if (router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities
      })) {
        // transport can now consume and return a consumer
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

        // from the consumer extract the following params
        // to send back to the Client
        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
        }

        // send the parameters to the client
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

  socket.on('consumer-resume', async ({serverConsumerId}) => {
    console.log('consumer resume');
    const { consumer } = consumers.find(consumerData => consumerData.consumer.id === serverConsumerId)
    await consumer.resume();
  });
});



