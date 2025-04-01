import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import UserContext from "./context/UserContext.jsx";
import CaptainContext from "./context/CapatainContext.jsx";
import SocketProvider from "./context/SocketContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")).render(
  <CaptainContext>
    <UserContext>
      <SocketProvider>
        <BrowserRouter>
          <GoogleOAuthProvider clientId="401182421842-2i2f270nbqb5hd2gttbjdqrstirnja01.apps.googleusercontent.com">
            <App />
          </GoogleOAuthProvider>
        </BrowserRouter>
      </SocketProvider>
    </UserContext>
  </CaptainContext>
);
