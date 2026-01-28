import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Context - अब हम अलग से बनाए गए ContextProvider का उपयोग करेंगे
import { ContextProvider } from "./context/SocketContext";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";

function App() {
  const { user } = useSelector((state) => state.user);
  
  // Safe token extraction
  const token = user?.token;

  return (
    <div className="dark">
      {/* Provider को यहाँ लपेटें ताकि पूरे ऐप को सॉकेट और वीडियो कॉल के फंक्शन्स मिल सकें।
        अब आपको यहाँ अलग से 'socket' डिफाइन करने की ज़रूरत नहीं है।
      */}
      <ContextProvider>
        <Router>
          <Routes>
            <Route
              exact
              path="/"
              element={
                token ? <Home /> : <Navigate to="/login" />
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
      </ContextProvider>
    </div>
  );
}

export default App;