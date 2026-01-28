import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";
import { ChatContainer, WhatsappHome } from "../components/Chat";
import { Sidebar } from "../components/sidebar";
import SocketContext from "../context/SocketContext";
import {
  getConversations,
  updateMessagesAndConversations,
} from "../features/chatSlice";
import Call from "../components/Chat/call/Call";
import {
  getConversationId,
  getConversationName,
  getConversationPicture,
} from "../utils/chat";

const callData = {
  socketId: "",
  receiveingCall: false,
  callEnded: false,
  name: "",
  picture: "",
  signal: "",
};

function Home({ socket }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { activeConversation } = useSelector((state) => state.chat);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // call states
  const [call, setCall] = useState(callData);
  const [stream, setStream] = useState(null);
  const [show, setShow] = useState(false);
  const { receiveingCall, callEnded, socketId } = call;
  const [callAccepted, setCallAccepted] = useState(false);
  const [totalSecInCall, setTotalSecInCall] = useState(0);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  
  // typing state
  const [typing, setTyping] = useState(false);

  // join user into the socket io
  useEffect(() => {
    socket.emit("join", user._id);
    socket.on("get-online-users", (users) => {
      setOnlineUsers(users);
    });
  }, [user]);

  // call socket events
  useEffect(() => {
    // setupMedia() ko yahan se hata diya gaya hai taaki login par camera on na ho
    
    socket.on("setup socket", (id) => {
      setCall((prev) => ({ ...prev, socketId: id }));
    });

    socket.on("call user", (data) => {
      setCall((prev) => ({
        ...prev,
        socketId: data.from,
        name: data.name,
        picture: data.picture,
        signal: data.signal,
        receiveingCall: true,
      }));
    });

    socket.on("end call", () => {
      setShow(false);
      setCall((prev) => ({ ...prev, callEnded: true, receiveingCall: false }));
      if (myVideo.current) myVideo.current.srcObject = null;
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    });
  }, [socket]);

  // --- Functions ---

  const setupMedia = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(currentStream);
      return currentStream;
    } catch (error) {
      console.error("Failed to get local stream", error);
    }
  };

  const enableMedia = (currentStream) => {
    setShow(true);
    // Timeout isliye taaki DOM render hone ka waqt mile
    setTimeout(() => {
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    }, 100);
  };

  const callUser = async () => {
    const localStream = await setupMedia();
    if (!localStream) return;

    enableMedia(localStream);
    
    setCall((prev) => ({
      ...prev,
      name: getConversationName(user, activeConversation.users),
      picture: getConversationPicture(user, activeConversation.users),
    }));

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: localStream,
    });

    peer.on("signal", (data) => {
      socket.emit("call user", {
        userToCall: getConversationId(user, activeConversation.users),
        signal: data,
        from: socketId,
        name: user.name,
        picture: user.picture,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    socket.on("call accepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    const localStream = await setupMedia();
    if (!localStream) return;

    enableMedia(localStream);
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: localStream,
    });

    peer.on("signal", (data) => {
      socket.emit("answer call", { signal: data, to: call.socketId });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const endCall = () => {
    setShow(false);
    setCall((prev) => ({ ...prev, callEnded: true, receiveingCall: false }));
    
    // Hardware Camera/Mic band karne ke liye
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (myVideo.current) myVideo.current.srcObject = null;
    socket.emit("end call", call.socketId);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
  };

  // get Conversations
  useEffect(() => {
    if (user?.token) {
      dispatch(getConversations(user.token));
    }
  }, [user, dispatch]);

  useEffect(() => {
    socket.on("receive message", (message) => {
      dispatch(updateMessagesAndConversations(message));
    });
    socket.on("typing", (conversation) => setTyping(conversation));
    socket.on("stop typing", () => setTyping(false));
  }, [socket, dispatch]);

  return (
    <>
      <div className="h-screen dark:bg-dark_bg_1 flex items-center justify-center overflow-hidden">
        <div className="container h-screen flex py-[19px]">
          <Sidebar onlineUsers={onlineUsers} typing={typing} />
          {activeConversation._id ? (
            <ChatContainer
              onlineUsers={onlineUsers}
              callUser={callUser}
              typing={typing}
            />
          ) : (
            <WhatsappHome />
          )}
        </div>
      </div>

      {/* Call UI */}
      <div className={(show || call.signal) && !call.callEnded ? "" : "hidden"}>
        <Call
          call={call}
          setCall={setCall}
          callAccepted={callAccepted}
          myVideo={myVideo}
          userVideo={userVideo}
          stream={stream}
          answerCall={answerCall}
          show={show}
          endCall={endCall}
          totalSecInCall={totalSecInCall}
          setTotalSecInCall={setTotalSecInCall}
        />
      </div>
    </>
  );
}

const HomeWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Home {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default HomeWithSocket;