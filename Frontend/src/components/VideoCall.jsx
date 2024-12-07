import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import React, { useEffect, useRef, useState } from "react";
import * as mediasoupClient from 'mediasoup-client';
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill, BsThreeDots } from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";


const VideoCall = () => {
  const socket = useSocket();
  const { roomCode } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [param, setParam] = useState({
    encodings: [
      { rid: 'r0', maxBitrate: 100000, scalabilityMode: 'S1T3' },
      { rid: 'r1', maxBitrate: 300000, scalabilityMode: 'S1T3' },
      { rid: 'r2', maxBitrate: 900000, scalabilityMode: 'S1T3' },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 }
  });
  const [device, setDevice] = useState();
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [producerTransport, setProducerTransport] = useState();
  const [producer, setProducer] = useState(null);
  const [consumer, setConsumer] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState([]);
  const [isProducer, setIsProducer] = useState(false);
  const [consumers, setConsumers] = useState([]);
  const [audioProducer, setAudioProducer] = useState();
  const [videoProducer, setVideoProducer] = useState(param);

  useEffect(() => {
    console.log("Current consumers state:", consumers);
  }, [consumers]);


  useEffect(() => {
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    const handleConnectionSuccess = ({ socketId }) => {
      console.log("Socket connected. Socket ID:", socketId);
      // getLocalStream();
    };

    socket.on("connection-success", handleConnectionSuccess);

    return () => {
      socket.off("connection-success", handleConnectionSuccess);
    };
  }, [socket]);

  useEffect(() => {
    getLocalStream();
  }, []);

  const removeConsumer = (remoteProducerId) => {
    setConsumers(prevConsumers => prevConsumers.filter(consumer => consumer.id !== remoteProducerId));
  };

  const streamSuccess = (stream) => {
    console.log(stream);

    localVideoRef.current.srcObject = stream;
    localVideoRef.current.stream = stream



    if (roomCode) {
      joinRoom(); // Call joinRoom when roomCode is available
    }
  };

  const joinRoom = () => {
    console.log("Emitting joinRoom with roomCode:", roomCode); // Log the roomCode
    socket.emit(`joinRoom`, { roomCode }, (data) => {
      console.log("Router RTP Capabilities..", data.rtpCapabilities);
      setRtpCapabilities(data.rtpCapabilities);
      createDevice(data.rtpCapabilities);
    });
  };

  const getLocalStream = () => {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: { min: 640, max: 1920 }, height: { min: 400, max: 1080 } }
    })
      .then(streamSuccess)
      .catch(error => {
        console.log("Error getting local stream:", error.message);
      });
  };


  const createDevice = async (RtpCapabilities) => {
    if (!RtpCapabilities) {
      console.error('RTP capabilities are not set');
      return;
    }

    try {
      const newDevice = new mediasoupClient.Device();
      await newDevice.load({ routerRtpCapabilities: RtpCapabilities });
      setDevice(newDevice); // Device is now set
      createSendTransport(newDevice);
    } catch (error) {
      console.log(error);
      if (error.name === 'UnsupportedError') {
        console.warn('Browser not supported');
      }
    }
  };


  // const getRtpCapabilities = (producerOrConsumer) => {
  //   socket.emit('createRoom', (data) => {
  //     if (!data.rtpCapabilities) {
  //       console.error('Failed to get RTP capabilities');
  //       return;
  //     }
  //     setRtpCapabilities(data.rtpCapabilities);
  //     createDevice(data.rtpCapabilities, producerOrConsumer);
  //   });
  // };

  useEffect(() => {
    if (device) {
      console.log("Device initialized. Now ready for signaling.");
      // Trigger other processes dependent on the device here
      socket.on('new-producer', ({ producerId }) => signalNewConsumerTransport(device, producerId));
    }
  }, [device]);


  const getProducers = (newDevice) => {
    socket.emit('getProducers', producerIds => {
      console.log(producerIds)
      producerIds.forEach(producerId => signalNewConsumerTransport(newDevice, producerId));
    });
  };



  const createSendTransport = (newDevice) => {

    socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      if (params.error) {
        console.log("Error creating WebRTC transport:", params.error);
        return;
      }
      console.log(params);
      const newProducerTransport = newDevice.createSendTransport(params);
      setProducerTransport(newProducerTransport);

      newProducerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emit('transport-connect', { dtlsParameters });
          callback();
        } catch (error) {
          errback(error);
        }
      });

      newProducerTransport.on('produce', async (parameters, callback, errback) => {
        try {
          console.log(parameters);

          socket.emit('transport-produce', { kind: parameters.kind, rtpParameters: parameters.rtpParameters }, ({ id, producersExist }) => {
            callback({ id });

            console.log(producersExist);
            
            if (producersExist) getProducers(newDevice)
          });
        } catch (error) {
          errback(error);
        }
      });

      connectSendTransport(newProducerTransport);
    });
  };

  const connectSendTransport = async (newProducerTransport) => {
    try {

      const videoTrack = localVideoRef.current.stream.getVideoTracks()[0];
      // const audioTrack = localVideoRef.current.stream.getAudioTracks()[0]

      // console.log(audioTrack);

      const videoProducer = await newProducerTransport.produce({
        track: videoTrack,
        encodings: param.encodings,
        codecOptions: param.codecOptions,
      });

      // Producing the audio track
      // const audioProducer = await newProducerTransport.produce({
      //   track: audioTrack,
      //   encodings: param.encodings, // You can modify this based on the audio codec needs
      //   codecOptions: param.codecOptions, // Modify if necessary for audio
      // });
      // console.log(newProducer);

      // setAudioProducer(audioProducer);
      setVideoProducer(videoProducer)
      videoProducer.on("trackended", () => console.log("Video track ended"));
      videoProducer.on("transportclose", () => console.log("Video transport closed"));

      // audioProducer.on("trackended", () => console.log("Audio track ended"));
      // audioProducer.on("transportclose", () => console.log("Audio transport closed"));
    } catch (error) {
      console.error("Error producing track:", error);
    }
  };

  const signalNewConsumerTransport = async (newDevice, remoteProducerId) => {
    if (!newDevice) {
      console.error('Device is not initialized');
      return;
    }
  
    await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }
  
      const newConsumerTransport = newDevice.createRecvTransport(params);
      console.log(newConsumerTransport);
  
      setConsumerTransport((prev) => [...prev, newConsumerTransport]);
  
      newConsumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emit('transport-recv-connect', { dtlsParameters, serverConsumerTransportId: params.id });
          callback();
        } catch (error) {
          errback(error);
        }
      });
  
      connectRecvTransport(newConsumerTransport, newDevice, remoteProducerId, params.id);
    });
  };
  

  const connectRecvTransport = async (newConsumerTransport, newDevice, remoteProducerId, serverConsumerTransportId) => {
    await socket.emit('consume', { rtpCapabilities: newDevice.rtpCapabilities, remoteProducerId, serverConsumerTransportId }, async ({ params }) => {
      if (params.error) {
        console.error('Cannot consume:', params.error);
        return;
      }
  
      const newConsumer = await newConsumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters,
      });
  
      setConsumerTransport((prevConsumerTransport) => [
        ...prevConsumerTransport,
        {
          consumerTransport: newConsumerTransport,
          serverConsumerTransportId: params.id,
          producerId: remoteProducerId,
          newConsumer,
        },
      ]);
  
      const { track } = newConsumer;
      const newStream = new MediaStream([track]);
  
      // Update the consumers array and notify all users of the new consumer
      setConsumers((prevConsumers) => [
        ...prevConsumers,
        { id: remoteProducerId, kind: params.kind, stream: newStream },
      ]);
  
      socket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId });
      setConsumer(newConsumer);
    });
  };
  



  socket.on('producer-closed', ({ remoteProducerId }) => {
    const producerToClose = consumerTransport.find(
      transportData => transportData.producerId === remoteProducerId
    );

    if (producerToClose) {
      producerToClose.consumerTransport.close();
      producerToClose.consumer.close();

      // Update the state without directly mutating it
      setConsumerTransport(prevConsumerTransport =>
        prevConsumerTransport.filter(
          transportData => transportData.producerId !== remoteProducerId
        )
      );
    }

    removeConsumer(remoteProducerId);
  });

  return (
    <div id="video" className=" bg-gray-100 rounded-lg h-screen ">
      <div className="w-full bg-gray-400 h-[90vh] flex">

        <div className="w-[30%]">
          <h1 className="text-center text-lg font-semibold pt-2">Local Video</h1>
          <div className="flex justify-center bg-papayawhip p-4 rounded-lg  w-[29vw] h-[50vh]">
            <video ref={localVideoRef} id="localVideo" autoPlay className=" rounded-lg object-cover shadow-md bg-black "></video>
            {/* <button onClick={getLocalStream}>Start</button> */}
          </div>
        </div>

        <div className="w-[70%]">
          <h1 className="text-center text-lg font-semibold pt-2">Remote Streams</h1>
          <div className="flex    justify-center">
            {consumers.map((consumer) => {
              return (
                <div key={consumer.id} className="w-[29vw] h-[50vh] p-4">
                  {consumer.kind === "video" ? (
                    <video
                      id={consumer.id}
                      autoPlay
                      className="video"
                      ref={(videoRef) => {
                        if (videoRef) {
                          console.log("Setting srcObject for video:", consumer.id, consumer.stream)
                            videoRef.srcObject = consumer.stream; // Set srcObject only if it's not already set
                          
                        }
                      }}
                    ></video>
                  ) : (
                    <audio
                      id={consumer.id}
                      autoPlay
                      ref={(audioRef) => {
                        if (audioRef) {
                          console.log("Setting srcObject for audio:", consumer.id);
                          if (consumer.stream) {
                            audioRef.srcObject = consumer.stream;
                          }
                        }
                      }}
                    ></audio>
                  )}
                </div>
              );
            })}
          </div>
        </div>


      </div>
        <footer className="flex items-center justify-center bg-gray-200 shadow-md h-[10%]">
                <button className="mx-2 p-4 bg-gray-300 rounded-full hover:bg-gray-400 transition">
                    <FaMicrophone className="text-lg" />
                </button>
                <button className="mx-2 p-4 bg-gray-300 rounded-full hover:bg-gray-400 transition">
                    <BsFillCameraVideoFill className="text-lg" />
                </button>
                <button className="mx-2 p-4 bg-gray-300 rounded-full hover:bg-gray-400 transition">
                    <BsThreeDots className="text-xl" />
                </button>
                <button
                    className="mx-2 p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
                    onClick={() => (window.location.href = "/")}
                >
                    <MdCallEnd className="text-lg text-white" />
                </button>
            </footer>

    </div>
  );
};

export default VideoCall;
