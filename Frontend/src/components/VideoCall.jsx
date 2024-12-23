import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as mediasoupClient from 'mediasoup-client';
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill, BsThreeDots } from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import RoomChat from "../components/RoomChat";
import { useUser } from '../context/UserContext';
import { IoPeopleSharp } from "react-icons/io5";

const VideoCall = () => {
  const socket = useSocket();
  const { userName } = useUser() || {};
  const { roomCode } = useParams();
  const localVideoRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState("");
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
  const [consumers, setConsumers] = useState([]);
  const [audioProducer, setAudioProducer] = useState();
  const [videoProducer, setVideoProducer] = useState();
  const [socketId, setSocketId] = useState();
  const [moreOption, setMoreOption] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [remoteVideoBlurred, setRemoteVideoBlurred] = useState(false);
  const [isVideoBlurred, setIsVideoBlurred] = useState(false);
  const [producerId, setProducerId] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participants, setParticipants] = useState([]); 
  const [hostId, setHostId] = useState();
  const [participantsTab, setParticipantsTab] = useState(false);
  const [notification, setNotification] = useState("");



  console.log("socketId", socketId);
  console.log("hostId", hostId);

  const toggleVideoBlur = () => {
    const updatedBlurState = !isVideoBlurred;
    setIsVideoBlurred(updatedBlurState);


    if (producerId) {
      socket.emit("toggle-video-blur", { producerId, isBlurred: updatedBlurState });
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 5000); // Clear after 3 seconds
  };

  const handleKick = (participantId) => {
    const confirmKick = window.confirm("Are you sure you want to kick this participant?");
    if (confirmKick) {
      socket.emit("kick-participant", { participantId });
    }
  };

  useEffect(() => {
    socket.on("kicked", () => {
      // Redirect the user to the home page
      alert("You have been removed from the meeting.");
      window.location.href = "/";
    });
  
    return () => {
      socket.off("kicked");
    };
  }, [socket]);
  

  const toggleMute = () => {
    const updatedMuteState = !isMuted;
    setIsMuted(updatedMuteState);
    if (localVideoRef.current) {
      const audioTracks = localVideoRef.current.stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !updatedMuteState; 
      });
    }
    socket.emit('toggle-mute', { socketId, isMuted: updatedMuteState }); 
  };

  const toggleCamera = () => {
    const updatedCameraState = !isCameraOff;
    setIsCameraOff(updatedCameraState);
    if (localVideoRef.current) {
      const videoTracks = localVideoRef.current.stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !updatedCameraState; 
      });
    }
    socket.emit('toggle-camera', { socketId, isCameraOff: updatedCameraState }); 
  };

  useEffect(() => {
    socket.on("toggle-video-blur", ({ producerId, isBlurred }) => {
      setConsumers((prevConsumers) =>
        prevConsumers.map((consumer) =>
          consumer.id === producerId
            ? { ...consumer, isBlurred }
            : consumer
        )
      );
    });

    return () => {
      socket.off("toggle-video-blur");
    };
  }, [socket]);



  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  const toggleParticipants = useCallback(() => {
    setParticipantsTab(prevMode => !prevMode);
  }, []);

  const handleMoreOption = useCallback(() => {
    // console.log(moreOption);

    setMoreOption(prev => !prev);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`http://localhost:5173/videoCall/${roomCode}`)
      .then(() => {
        setCopySuccess("Link copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 2000);
        // console.log("Link copied to clipboard."); /
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  };


  useEffect(() => {
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    const handleConnectionSuccess = ({ socketId }) => {
      // setSocketId(socketId)
      // console.log("Socket connected. Socket ID:", socketId);
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
    // console.log(stream);

    localVideoRef.current.srcObject = stream;
    localVideoRef.current.stream = stream



    if (roomCode) {
      joinRoom();
    }
  };

  useEffect(() => {
    socket.on("updateParticipants", ({ participants, hostId }) => {
      console.log(participants, hostId);

      setParticipants(participants);

      setHostId(participants[0].id)





    });


    return () => {
      socket.off("updateParticipants");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("user-joined", ({ userName }) => {
      showNotification(`${userName} has joined the meeting`);
    });


    return () => {
      socket.off("user-joined");
    };
  }, [socket]);
  useEffect(() => {
    socket.on("user-left", ({ userName }) => {
      showNotification(`${userName} has left the meeting`);
    });


    return () => {
      socket.off("user-left");
    };
  }, [socket]);

  const joinRoom = () => {
    socket.emit('joinRoom', { roomCode, userName }, (data) => {
      console.log(data.socketId);

      setSocketId(data.socketId);
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
      setDevice(newDevice);
      createSendTransport(newDevice);
    } catch (error) {
      console.log(error);
      if (error.name === 'UnsupportedError') {
        console.warn('Browser not supported');
      }
    }
  };




  useEffect(() => {
    if (device) {
      console.log("Device initialized. Now ready for signaling.");

      socket.on('new-producer', ({ producerId }) => signalNewConsumerTransport(device, producerId));
    }
  }, [device]);


  const getProducers = (newDevice) => {
    socket.emit('getProducers', producerIds => {
      // console.log(producerIds)
      producerIds.forEach(producerId => signalNewConsumerTransport(newDevice, producerId));
    });
  };



  const createSendTransport = (newDevice) => {

    socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      if (params.error) {
        console.log("Error creating WebRTC transport:", params.error);
        return;
      }
      // console.log(params);
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
          // console.log(parameters);

          socket.emit('transport-produce', { kind: parameters.kind, rtpParameters: parameters.rtpParameters }, ({ id, producersExist }) => {
            callback({ id });

            console.log(producersExist);
            console.log(id);

            setProducerId(() => {
              if (parameters.kind == 'video') {
                return id
              }
            })


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
      const audioTrack = localVideoRef.current.stream.getAudioTracks()[0]



      const audioProducer = await newProducerTransport.produce({
        track: audioTrack,
        encodings: undefined,
        codecOptions: undefined,
      });

      const videoProducer = await newProducerTransport.produce({
        track: videoTrack,
        encodings: param.encodings,
        codecOptions: param.codecOptions,
      });

      console.log(videoProducer);
      console.log(audioProducer);

      setAudioProducer(audioProducer);
      setVideoProducer(videoProducer)




      videoProducer.on("trackended", () => console.log("Video track ended"));
      videoProducer.on("transportclose", () => console.log("Video transport closed"));

      audioProducer.on("trackended", () => console.log("Audio track ended"));
      audioProducer.on("transportclose", () => console.log("Audio transport closed"));


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

      console.log(newConsumer);


      const { track } = newConsumer;
      const newStream = new MediaStream([track]);


      setConsumers((prevConsumers) => {

        if (prevConsumers.some((consumer) => consumer.id === remoteProducerId)) {
          return prevConsumers;
        }
        return [
          ...prevConsumers,
          { id: remoteProducerId, kind: params.kind, stream: newStream },
        ];
      });





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


      setConsumerTransport(prevConsumerTransport =>
        prevConsumerTransport.filter(
          transportData => transportData.producerId !== remoteProducerId
        )
      );
    }

    removeConsumer(remoteProducerId);
  });


  return (
    <div id="video" className={` rounded-lg h-screen`}>
      <div className="flex-grow flex justify-center items-center bg-gray-200 py-4 h-[90%] relative">
        <div className="absolute w-[23vw] bg-gray-500 bottom-0 z-10 left-2 rounded-lg text-white p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium">Your meeting's ready</h1>
            <IoCloseOutline className="text-4xl font-bold cursor-pointer" />
          </div>
          <p className="text-sm">Share this meeting link with others you want in the meeting</p>
          <div className="w-full py-2 bg-gray-300 px-2 rounded-md flex items-center justify-between">
            <p className="text-sm text-black">http://localhost:5173/videoCall/{roomCode}</p>
            <RiFileCopyLine
              className="text-lg text-black cursor-pointer hover:scale-110"
              onClick={handleCopyLink}
            />
          </div>
          {copySuccess && <p className="text-green-500 text-sm mt-2">{copySuccess}</p>}
        </div>

        <div className={`w-full ${isDarkMode ? 'bg-[#202124]' : 'bg-gray-100'}  h-[90vh] `}>
          <div className="p-5">
            <div className="video-grid">
              <video style={{ filter: isVideoBlurred ? 'blur(10px)' : 'none' }} ref={localVideoRef} id="localVideo" autoPlay className={`video ${isDarkMode ? 'border-2 border-white ' : 'border-2 border-black'} `}></video>
              {consumers.map((consumer) => (
                consumer.kind === "video" ? (
                  <video id={consumer.id}
                    style={{ filter: consumer.isBlurred ? 'blur(10px)' : 'none' }}
                    key={consumer.id}
                    autoPlay
                    className={`video  ${isDarkMode ? 'border-2 border-white' : 'border-2 border-black'}
                      `}
                    ref={(videoRef) => {
                      if (videoRef) {
                        videoRef.srcObject = consumer.stream;
                      }
                    }}
                  ></video>
                ) : (
                  <audio
                    key={consumer.id}
                    autoPlay
                    ref={(audioRef) => {
                      if (audioRef) {
                        audioRef.srcObject = consumer.stream;
                      }
                    }}
                    style={{ display: 'none' }}
                  ></audio>
                )
              ))}

            </div>
          </div>

        </div>
        <div className={`w-[15vw]  absolute bottom-[0%] right-[34.5%] rounded-xl bg-[#199FD9] shadow-xl ${moreOption ? 'block' : 'hidden'}`}>
          <div className="w-full h-full p-4 flex flex-col gap-3">
            <div className="flex gap-2"> <label className="flex cursor-pointer select-none items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  className="sr-only"
                />
                <div className="block h-[1.3rem] w-9 rounded-full border border-[#BFCEFF] bg-[#EAEEFB]"></div>
                <div
                  className={`dot bg-black absolute top-[2px] left-1 h-4 w-4 rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-3' : 'translate-x-0'}`}
                ></div>
              </div>
            </label>
              <h1 className="text-white font-medium">Dark Mode</h1>
            </div>
            <div className="flex gap-2"> <label className="flex cursor-pointer select-none items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isVideoBlurred}
                  onChange={toggleVideoBlur}
                  className="sr-only"
                />
                <div className="block h-[1.3rem] w-9 rounded-full border border-[#BFCEFF] bg-[#EAEEFB]"></div>
                <div
                  className={`dot bg-black absolute top-[2px] left-1 h-4 w-4 rounded-full transition-transform duration-300 ${isVideoBlurred ? 'translate-x-3' : 'translate-x-0'}`}
                ></div>
              </div>
            </label>
              <h1 className="text-white font-medium">Blur Video</h1>
            </div>
          </div>
        </div>

        {notification && (
          <div className={`absolute bottom-4 right-4 ${!isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out`}>
            {notification}
          </div>
        )}


        <div className={`absolute w-[20vw] h-[95%] bg- rounded-md right-[6%] bottom-0 shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ${participantsTab ? 'block' : 'hidden'
          }`}
        >
          <div className="participants-list p-4 space-y-4">
            <div className="flex items-center justify-between border-b"><h2 className="text-xl font-semibold  pb-2">Participants</h2> <h5 className="text-xl font-semibold  pb-2">{participants.length}</h5></div>
            <ol className="list-decimal space-y-3 ">
              {participants.map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center justify-between px-2 py-1 bg-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:text-white"
                >
                  <span className="truncate">{participant.name}</span>
                  {participant.isHost && (
                    <span className="ml-2 text-xs font-medium  bg-blue-100 rounded-full px-2 py-0.5 dark:bg-blue-700">
                      Host
                    </span>
                  )}
                  {socketId == hostId && !participant.isHost && ( // Show kick button only for host
                    <button
                      className="ml-2 text-red-500"
                      onClick={() => handleKick(participant.id)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>


      </div>

      <footer className={`flex items-center justify-between px-4 ${isDarkMode ? 'bg-[#202124]' : 'bg-gray-100'}  shadow-md h-[10%]`}>
        <div className="flex items-center justify-center">
          <div><h1 className="px-2 font-medium">5:90 PM</h1></div><span className="font-medium"> | </span>
          <div><h1 className="px-2 font-medium">{roomCode}</h1></div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div onClick={toggleMute} className="w-[3.5vw] h-[3.5vw] flex items-center justify-center bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 ">
            {isMuted ? <FaMicrophoneSlash className="text-lg" /> : <FaMicrophone className="text-lg" />}
          </div>
          <div onClick={toggleCamera} className="  w-[3.5vw] h-[3.5vw] flex items-center justify-center bg-gray-300 rounded-full hover:bg-gray-400 transition">
            {isCameraOff ? <BsFillCameraVideoOffFill className="text-lg" /> : <BsFillCameraVideoFill className="text-lg" />}
          </div>
          <div onClick={handleMoreOption} className=" w-[3.5vw] h-[3.5vw] flex items-center justify-center  bg-gray-300 rounded-full hover:bg-gray-400 transition">
            <BsThreeDots className="text-xl" />
          </div>
          <div
            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
            onClick={() => (window.location.href = "/")}
          >
            <MdCallEnd className="text-lg text-white" />
          </div></div>
        <div className="flex items-center justify-center ">
          <div className=" w-[3.5vw] h-[3.5vw] flex items-center justify-center cursor-pointer relative" onClick={toggleParticipants}><IoPeopleSharp className="text-2xl" /> <div className="absolute bg-black top-0 text-white rounded-full w-[1.2vw] h-[1.2vw] text-xs right-1 flex items-center justify-center font-medium">{participants.length}</div></div>
          <RoomChat room={roomCode} socketId={socketId} />
        </div>
      </footer>
    </div>


  );
};

export default VideoCall;
