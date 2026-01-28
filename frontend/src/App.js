import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import SocketContext from "./context/SocketContext";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";

// ✅ SOCKET URL FROM ENV (Vite)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Safety check
if (!SOCKET_URL) {
  console.error("❌ VITE_SOCKET_URL is not defined in env");
}

// ✅ socket instance
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user || {});
  const token = user?.token;

  return (
    <div className="dark">
      <SocketContext.Provider value={socket}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={token ? <Home socket={socket} /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!token ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!token ? <Register /> : <Navigate to="/" />}
            />
          </Routes>
        </Router>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
