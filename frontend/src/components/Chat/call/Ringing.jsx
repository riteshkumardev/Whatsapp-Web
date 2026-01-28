import { useEffect, useState } from "react";
import { CloseIcon, ValidIcon } from "../../../svg";

export default function Ringing({ call, setCall, answerCall, endCall }) {
  const { name, picture } = call;
  const [timer, setTimer] = useState(0);

  // WhatsApp style: Sahi timer logic bina memory leak ke
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    if (timer > 30) {
      endCall(); // 30 sec baad auto-reject
    }

    return () => clearInterval(interval); // Cleanup zaroori hai
  }, [timer]);

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[550px] z-50 rounded-2xl overflow-hidden callbg shadow-2xl flex flex-col items-center justify-between py-12 transition-all duration-500">
      
      {/* Caller Info Section */}
      <div className="flex flex-col items-center gap-y-6">
        <div className="relative">
          <img
            src={picture || "../../../../images/default_profile.png"}
            alt="caller"
            className="w-32 h-32 rounded-full object-cover border-4 border-green_1 shadow-xl"
          />
          {/* Ringing pulse animation */}
          <div className="absolute inset-0 rounded-full border-4 border-green_1 animate-ping opacity-25"></div>
        </div>
        
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-2">
            {name}
          </h1>
          <span className="text-dark_text_1 text-lg animate-pulse">
            WhatsApp video call...
          </span>
        </div>
      </div>

      {/* Action Buttons Section */}
      <ul className="flex items-center gap-x-14">
        {/* Decline Button */}
        <li onClick={endCall}>
          <button className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 shadow-lg active:scale-90 transition-transform">
            <CloseIcon className="fill-white w-8" />
          </button>
          <p className="text-white text-center mt-2 text-sm">Decline</p>
        </li>

        {/* Accept Button */}
        <li onClick={answerCall}>
          <button className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 shadow-lg animate-bounce active:scale-90 transition-transform">
            <ValidIcon className="fill-white w-10 mt-1" />
          </button>
          <p className="text-white text-center mt-2 text-sm">Accept</p>
        </li>
      </ul>

      {/* Ringtone */}
      <audio src="../../../../audio/ringtone.mp3" autoPlay loop></audio>
    </div>
  );
}