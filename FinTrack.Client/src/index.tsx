import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";
import { AuthProvider } from "./auth/AuthContext";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element was not found");
}

createRoot(rootElement).render(
    <BrowserRouter>
        <AuthProvider>
            <App />
        </AuthProvider>
    </BrowserRouter>
);