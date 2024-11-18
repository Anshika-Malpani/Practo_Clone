import { useCallback, useRef, useState } from "react";
import axios from 'axios';

export const useVideoControls = (myStream, remoteStream, socket, remoteSocketId) => {
  const [isVideoBlurred, setIsVideoBlurred] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);
  const [hasStoppedRecording, setHasStoppedRecording] = useState(false);
  const [hasUploadedRecording, setHasUploadedRecording] = useState(false);

  const toggleVideoBlur = useCallback(() => {
    const newBlurState = !isVideoBlurred;
    setIsVideoBlurred(newBlurState);
    socket.emit("video:blur:toggle", { to: remoteSocketId, isBlurred: newBlurState });
  }, [isVideoBlurred, remoteSocketId, socket]);

  const startRecording = useCallback(() => {
    if (!myStream) {
      console.error("Local stream not available for recording.");
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const videoWidth = 640;
    const videoHeight = 480;
    canvas.width = videoWidth * 2;
    canvas.height = videoHeight;

    const localVideo = document.createElement("video");
    const remoteVideo = document.createElement("video");

    localVideo.srcObject = myStream;
    localVideo.muted = true;
    localVideo.play();

    if (remoteStream) {
      remoteVideo.srcObject = remoteStream;
      remoteVideo.play();
    } else {
      console.warn("Remote stream not available for recording.");
    }

    const drawInterval = setInterval(() => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(localVideo, 0, 0, videoWidth, videoHeight);
      if (remoteStream) {
        context.drawImage(remoteVideo, videoWidth, 0, videoWidth, videoHeight);
      }
    }, 100);

    const combinedStream = canvas.captureStream();
    myStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
    }

    mediaRecorder.current = new MediaRecorder(combinedStream, { mimeType: "video/webm; codecs=vp8" });

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      clearInterval(drawInterval);
      if (!hasUploadedRecording) {
        setHasUploadedRecording(true);
        downloadRecording();
      }
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  }, [myStream, remoteStream, hasUploadedRecording]);

  const stopRecording = useCallback(() => {
    if (hasStoppedRecording) return;
    mediaRecorder.current.stop();
    setIsRecording(false);
    setHasStoppedRecording(true);
  }, [hasStoppedRecording]);

  const downloadRecording = useCallback(async () => {
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    const formData = new FormData();
    formData.append('file', blob, `recording_${new Date().toISOString()}.webm`);

    try {
      const response = await axios.post('http://localhost:3000/recording', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Video uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  }, []);

  return {
    isVideoBlurred,
    toggleVideoBlur,
    startRecording,
    stopRecording,
    isRecording,
  };
};