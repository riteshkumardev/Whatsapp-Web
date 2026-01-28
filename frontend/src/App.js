import { useEffect, useState } from "react";
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

// socket io
// Check if API_ENDPOINT exists before splitting to avoid white screen crash
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000/api/v1";
const socket = io(API_ENDPOINT.split("/api/v1")[0]);

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  
  // Safe token extraction to avoid "undefined" errors
  const token = user?.token;

  return (
    <div className="dark">
      <SocketContext.Provider value={socket}>
        <Router>
          <Routes>
            <Route
              exact
              path="/"
              element={
                token ? <Home socket={socket} /> : <Navigate to="/login" />
              }
            />
            <Route
              exact
              path="/login"
              element={!token ? <Login /> : <Navigate to="/" />}
            />
            <Route
              exact
              path="/register"
              element={!token ? <Register /> : <Navigate to="/" />}
            />
          </Routes>
        </Router>
      </SocketContext.Provider>
    </div>
  );
}

// Yeh line sabse zaroori hai exports ke liye
export default App;