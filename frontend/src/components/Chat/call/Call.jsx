import { useState, useEffect, useRef } from "react";
import CallAcions from "./CallAcions";
import CallArea from "./CallArea";
import Header from "./Header";
import Ringing from "./Ringing";

export default function Call({
  call,
  setCall,
  callAccepted,
  myVideo,
  stream,
  userVideo,
  answerCall,
  show,
  endCall,
  totalSecInCall,
  setTotalSecInCall,
}) {
  // Typo fix: receiveingCall -> receivingCall (Ensure your state matches this)
  const { receivingCall, callEnded, name, picture } = call;
  const [showActions, setShowActions] = useState(false);
  const [toggle, setToggle] = useState(false);
  const audioRemote = useRef(null);

  // WhatsApp style: Jab call connect ho jaye to ringing stop ho jani chahiye
  useEffect(() => {
    if (callAccepted && audioRemote.current) {
      audioRemote.current.pause();
    }
  }, [callAccepted]);

  return (
    <>
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[550px] z-10 rounded-2xl overflow-hidden callbg shadow-2xl
        ${receivingCall && !callAccepted ? "hidden" : "flex flex-col"}
        `}
        onMouseOver={() => setShowActions(true)}
        onMouseOut={() => setShowActions(false)}
      >
        {/* Main Container */}
        <div className="relative h-full w-full">
          {/* Header & Info Layer */}
          <div className="absolute top-0 left-0 w-full z-20">
            <Header />
            <CallArea
              name={name}
              totalSecInCall={totalSecInCall}
              setTotalSecInCall={setTotalSecInCall}
              callAccepted={callAccepted}
            />
          </div>

          {/* Video Streams Logic */}
          <div className="h-full w-full bg-black relative">
            {/* User Video (Remote) - Large by default */}
            {callAccepted && !callEnded ? (
              <video
                ref={userVideo}
                playsInline
                autoPlay
                className={`${toggle ? "SmallVideoCall" : "largeVideoCall"}`}
                onClick={() => setToggle((prev) => !prev)}
              ></video>
            ) : (
              // Call connect hone se pehle user ki profile pic dikhana (WhatsApp style)
              <div className="flex items-center justify-center h-full">
                <img
                  src={picture || "../../../../images/default_profile.png"}
                  alt="caller"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}

            {/* My Video (Local) - Small float by default */}
            {stream ? (
              <video
                ref={myVideo}
                playsInline
                muted
                autoPlay
                className={`${toggle ? "largeVideoCall" : "SmallVideoCall"} ${
                  showActions ? "moveVideoCall" : ""
                } transition-all duration-300 shadow-lg border-2 border-dark_bg_1 rounded-lg`}
                onClick={() => setToggle((prev) => !prev)}
              ></video>
            ) : null}
          </div>

          {/* Floating Call Actions */}
          {showActions ? (
            <div className="absolute bottom-5 left-0 w-full z-30 transition-opacity duration-300">
      <CallAcions endCall={endCall} stream={stream} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Ringing UI (Incoming) */}
      {receivingCall && !callAccepted ? (
        <Ringing
          call={call}
          setCall={setCall}
          answerCall={answerCall}
          endCall={endCall}
        />
      ) : null}

      {/* Outgoing Ringtone Logic */}
      {!callAccepted && show ? (
        <audio
          ref={audioRemote}
          src="../../../../audio/ringing.mp3"
          autoPlay
          loop
        ></audio>
      ) : null}
    </>
  );
}