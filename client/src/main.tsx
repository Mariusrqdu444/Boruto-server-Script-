import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { MessagingProvider } from "./contexts/MessagingContext";

createRoot(document.getElementById("root")!).render(
  <MessagingProvider>
    <App />
  </MessagingProvider>
);
