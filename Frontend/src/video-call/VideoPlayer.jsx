import React from 'react';

const VideoPlayer = ({ stream, isAudioOnly, isBlurred, isRemote }) => {
  return (
    <div className="flex flex-col items-center">
      {stream && !isAudioOnly ? (
        <video
          autoPlay
          width="500px"
          height="400px"
          ref={(video) => { if (video) video.srcObject = stream; }}
          className="shadow-md"
          style={{ filter: isBlurred ? 'blur(10px)' : 'none' }}
        />
      ) : (
        <audio
          autoPlay
          ref={(audio) => { if (audio) audio.srcObject = stream; }}
          className="border border-gray-300 rounded-lg shadow-md"
        />
      )}
    </div>
  );
};

export default VideoPlayer;