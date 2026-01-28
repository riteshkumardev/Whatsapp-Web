import { useState } from "react";
import {
  ArrowIcon,
  DialIcon,
  MuteIcon,
  SpeakerIcon,
  VideoDialIcon,
} from "../../../svg";

export default function CallAcions({ endCall, stream }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Microphone toggle logic
  const handleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
  };

  // Video toggle logic
  const handleVideoToggle = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  return (
    <div className="h-24 w-full absolute bottom-0 z-40 px-2 pb-2">
      {/* Container with WhatsApp-like Dark Glass Effect */}
      <div className="relative bg-dark_bg_3/90 backdrop-blur-md px-4 pt-8 pb-10 rounded-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.3)] border-t border-white/5">
        
        {/* Expand/Drag Handle Icon */}
        <button className="-rotate-90 scale-y-[250%] absolute top-2 left-1/2 -translate-x-1/2 opacity-50 hover:opacity-100 transition-opacity">
          <ArrowIcon className="fill-dark_svg_2" />
        </button>
        
        {/* Actions List */}
        <ul className="flex items-center justify-between max-w-xs mx-auto">
          
          {/* Speaker Button */}
          <li>
            <button className="flex items-center justify-center w-12 h-12 bg-dark_bg_4 hover:bg-dark_bg_2 rounded-full transition-colors">
              <SpeakerIcon className="fill-white w-6" />
            </button>
          </li>

          {/* Video Toggle Button */}
          <li>
            <button 
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isVideoOff ? 'bg-red-500' : 'bg-dark_bg_4 hover:bg-dark_bg_2'
              }`}
              onClick={handleVideoToggle}
            >
              <VideoDialIcon className={`fill-white w-6 ${isVideoOff ? 'opacity-100' : 'opacity-80'}`} />
            </button>
          </li>

          {/* Mute/Unmute Button */}
          <li>
            <button 
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isMuted ? 'bg-red-500' : 'bg-dark_bg_4 hover:bg-dark_bg_2'
              }`}
              onClick={handleMute}
            >
              <MuteIcon className={`fill-white w-5 ${isMuted ? 'opacity-100' : 'opacity-80'}`} />
            </button>
          </li>

          {/* End Call Button (WhatsApp Red Dial) */}
          <li>
            <button 
              className="flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full rotate-[135deg] shadow-lg shadow-red-900/40 transition-transform active:scale-90"
              onClick={() => endCall()}
            >
              <DialIcon className="fill-white w-7" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}