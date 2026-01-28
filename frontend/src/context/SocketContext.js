import { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();
const socket = io(process.env.REACT_APP_SOCKET_URL) || io("http://localhost:8000"); 

export const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null); // Initial null rakhein
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // --- NEW: Camera setup function ---
  const setupMedia = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
      return currentStream;
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  useEffect(() => {
    socket.on("me", (id) => setMe(id));
    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = async () => {
    // Call accept karte hi camera on karein
    const localStream = await setupMedia(); 
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream: localStream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = async (id) => {
    // Call dial karte hi camera on karein
    const localStream = await setupMedia(); 

    const peer = new Peer({ initiator: true, trickle: false, stream: localStream });

    peer.on("signal", (data) => {
      socket.emit("callUser", { userToCall: id, signalData: data, from: me, name });
    });

    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    // Camera ko band karne ke liye tracks stop karein
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    window.location.reload();
  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      setStream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
      setupMedia, // Component mein use karne ke liye export kiya
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;