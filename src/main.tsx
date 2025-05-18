import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import i18n configuration (this needs to be before any component that uses translations)
import "./i18n";

createRoot(document.getElementById("root")!).render(<App />);
