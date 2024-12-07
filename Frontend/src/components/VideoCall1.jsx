import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill, BsThreeDots } from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import * as mediasoupClient from 'mediasoup-client';

function VideoCall() {
    const socket = useSocket();
    const { roomCode } = useParams(); // Room code from URL
    const localVideoRef = useRef(null);
    const [remoteVideoRefs, setRemoteVideoRefs] = useState({}); // Track remote video elements
    const localStream = useRef(null);
    const peers = useRef({});
    const [copySuccess, setCopySuccess] = useState("");
    const [connectedUsers, setConnectedUsers] = useState([]); // State to track connected users

    // New state for media parameters
    const [audioParams, setAudioParams] = useState({});
    const [videoParams, setVideoParams] = useState({});
    const [device, setDevice] = useState(null);
    const [rtpCapabilities, setRtpCapabilities] = useState(null);
    const [producerTransport, setProducerTransport] = useState(null);
    const [consumerTransports, setConsumerTransports] = useState([]);
    const [videoContainer, setVideoContainer] = useState(null); // Reference to video container
    let devices;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`http://localhost:5173/videocall/${roomCode}`)
            .then(() => {
                setCopySuccess("Link copied to clipboard!");
                setTimeout(() => setCopySuccess(""), 2000); // Clear message after 2 seconds
                console.log("Link copied to clipboard."); // Log link copy success
            })
            .catch(err => {
                console.error("Failed to copy: ", err);
            });
    };

    // Function to handle successful stream acquisition
    const streamSuccess = (stream) => {
        localVideoRef.current.srcObject = stream; // Update local video ref
        audioParams.track = stream.getAudioTracks()[0];
        videoParams.track = stream.getVideoTracks()[0];
        console.log("Local stream acquired."); // Log stream acquisition
        joinRoom();
    };

    
    const getLocalStream = () => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: { min: 640, max: 1920 },
                height: { min: 400, max: 1080 },
            }
        })
        .then(streamSuccess)
        .catch(error => {
            console.log("Error getting local stream:", error.message); // Log error
        });
    };
    
    const joinRoom = () => {
        console.log(`Joining room: ${roomCode}`); // Log room joining
        socket.emit('joinRoom', { roomCode }, (data) => {
            console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
            setRtpCapabilities(data.rtpCapabilities);
            createDevice(data.rtpCapabilities);
        });
    };
    
    const createDevice = async () => {
        try {
            const devices = new mediasoupClient.device;
            await devices.load({
                routerRtpCapabilities: rtpCapabilities,
            });
            console.log(device);
            
            setDevice(device);
            console.log("Device created and loaded with RTP capabilities."); // Log device creation
            createSendTransport(); // Call createSendTransport after device is set
        } catch (error) {
            console.log("Error creating device:", error);
            if (error.name === 'UnsupportedError') console.warn('Browser not supported');
        }
    };
    
    const createSendTransport = () => {
        if (!device) {
            console.error("Device is not initialized."); // Log error if device is null
            return; // Exit early if device is not ready
        }
    
        console.log("Creating send transport..."); // Log transport creation
        socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
            if (params.error) {
                console.log("Error creating WebRTC transport:", params.error);
                return;
            }
            const newProducerTransport = device.createSendTransport(params);
            setProducerTransport(newProducerTransport);
            console.log("Send transport created:", newProducerTransport.id); // Log transport ID
    
            newProducerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await socket.emit('transport-connect', { dtlsParameters });
                    console.log("Transport connected."); // Log transport connection
                    callback();
                } catch (error) {
                    console.error("Transport connection error:", error);
                    errback(error);
                }
            });
    
            newProducerTransport.on('produce', async (parameters, callback, errback) => {
                try {
                    await socket.emit('transport-produce', {
                        kind: parameters.kind,
                        rtpParameters: parameters.rtpParameters,
                        appData: parameters.appData,
                    }, ({ id, producersExist }) => {
                        console.log("Produced:", id); // Log produced ID
                        callback({ id });
                        if (producersExist) getProducers();
                    });
                } catch (error) {
                    console.error("Error producing:", error);
                    errback(error);
                }
            });
    
            connectSendTransport();
        });
    };

    const connectSendTransport = async () => {
        console.log("Connecting send transport..."); // Log connecting send transport
        audioProducer = await producerTransport.produce(audioParams);
        videoProducer = await producerTransport.produce(videoParams);

        audioProducer.on('trackended', () => {
            console.log('Audio track ended'); // Log audio track end
        });

        audioProducer.on('transportclose', () => {
            console.log('Audio transport ended'); // Log audio transport end
        });

        videoProducer.on('trackended', () => {
            console.log('Video track ended'); // Log video track end
        });

        videoProducer.on('transportclose', () => {
            console.log('Video transport ended'); // Log video transport end
        });
    };

    const signalNewConsumerTransport = async (remoteProducerId) => {
        if (consumerTransports.includes(remoteProducerId)) return;
        consumerTransports.push(remoteProducerId);
        console.log(`Creating consumer transport for producer: ${remoteProducerId}`); // Log consumer transport creation

        await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
            if (params.error) {
                console.log("Error creating consumer transport:", params.error);
                return;
            }

            let consumerTransport;
            try {
                consumerTransport = device.createRecvTransport(params);
                console.log("Consumer transport created:", consumerTransport.id); // Log consumer transport ID
            } catch (error) {
                console.log("Error creating consumer transport:", error);
                return;
            }

            consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await socket.emit('transport-recv-connect', {
                        dtlsParameters,
                        serverConsumerTransportId: params.id,
                    });
                    console.log("Consumer transport connected."); // Log consumer transport connection
                    callback();
                } catch (error) {
                    console.error("Consumer transport connection error:", error);
                    errback(error);
                }
            });

            connectRecvTransport(consumerTransport, remoteProducerId, params.id);
        });
    };

    const getProducers = () => {
        console.log("Getting producers..."); // Log getting producers
        socket.emit('getProducers', producerIds => {
            producerIds.forEach(signalNewConsumerTransport);
        });
    };

    const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
        console.log(`Connecting to consume from producer: ${remoteProducerId}`); // Log connecting to consume
        await socket.emit('consume', {
            rtpCapabilities: device.rtpCapabilities,
            remoteProducerId,
            serverConsumerTransportId,
        }, async ({ params }) => {
            if (params.error) {
                console.log('Cannot consume:', params.error); // Log consume error
                return;
            }

            const consumer = await consumerTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters
            });

            const newElem = document.createElement('div');
            newElem.setAttribute('id', `td-${remoteProducerId}`);

            if (params.kind === 'audio') {
                newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>';
            } else {
                newElem.setAttribute('class', 'remoteVideo');
                newElem.innerHTML = '<video id="' + remoteProducerId + '" autoplay class="video"></video>';
            }

            videoContainer.appendChild(newElem);
            document.getElementById(remoteProducerId).srcObject = new MediaStream([consumer.track]);

            socket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId });
            console.log(`Consumer created for producer: ${remoteProducerId}`); // Log consumer creation
        });
    };

    socket.on('new-producer', ({ producerId }) => {
        console.log(`New producer detected: ${producerId}`); // Log new producer
        signalNewConsumerTransport(producerId);
    });

    socket.on('producer-closed', ({ remoteProducerId }) => {
        console.log(`Producer closed: ${remoteProducerId}`); // Log producer closure
        const producerToClose = consumerTransports.find(transportData => transportData.producerId === remoteProducerId);
        producerToClose.consumerTransport.close();
        producerToClose.consumer.close();
        consumerTransports = consumerTransports.filter(transportData => transportData.producerId !== remoteProducerId);
        videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`));
    });

    useEffect(() => {
        getLocalStream(); // Start getting local stream on component mount
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Video Section */}
            <main className="flex-grow flex justify-center items-center bg-gray-200 p-4 h-[90%] relative">
                <div className="absolute w-[23vw] bg-gray-500 bottom-0 z-10 left-2 rounded-lg text-white p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-medium">Your meeting's ready</h1>
                        <IoCloseOutline className="text-4xl font-bold" />
                    </div>
                    <p className="text-sm">Share this meeting link with others you want in the meeting</p>
                    <div className="w-full py-2 bg-gray-300 px-2 rounded-md flex items-center justify-between">
                        <p className="text-sm text-black">http://localhost:5173/videocall/{roomCode}</p>
                        <RiFileCopyLine
                            className="text-lg text-black cursor-pointer hover:scale-110"
                            onClick={handleCopyLink}
                        />
                    </div>
                    {copySuccess && <p className="text-green-500 text-sm mt-2">{copySuccess}</p>}
                </div>

                {/* Local Video */}
                <div className="relative w-[40%] h-[87vh] max-w-screen-md bg-black rounded-md shadow-lg overflow-hidden">
                    <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
                </div>

                {/* Remote Videos */}
                {Object.keys(remoteVideoRefs).map((userId) => (
                    <div
                        key={userId}
                        className="relative w-[20%] h-[30vh] max-w-screen-sm bg-gray-800 rounded-md shadow-lg overflow-hidden"
                    >
                        <video
                            autoPlay
                            srcObject={remoteVideoRefs[userId]}
                            className="w-full h-full object-cover"
                        ></video>
                    </div>
                ))}
            </main>

            {/* Display total number of participants */}
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-md m-4">
                Total Participants: {connectedUsers.length}
            </div>

            {/* Bottom Controls */}
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
}

export default VideoCall;