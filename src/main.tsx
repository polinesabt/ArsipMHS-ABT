import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGlobalErrorLogger } from "@/services/error-logger.service";

initGlobalErrorLogger();

createRoot(document.getElementById("root")!).render(<App />);
