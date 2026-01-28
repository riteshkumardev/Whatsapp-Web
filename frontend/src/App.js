import { useSelector } from "react-redux";
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

// ✅ API endpoint
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

// 🔐 safety check
if (!API_ENDPOINT) {
  console.error("❌ REACT_APP_API_ENDPOINT missing in .env");
}

// ✅ derive socket base url safely
const SOCKET_URL = API_ENDPOINT
  ? API_ENDPOINT.replace("/api/v1", "")
  : "";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

function App() {
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
