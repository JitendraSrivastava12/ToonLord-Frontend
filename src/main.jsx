import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// 1. Import React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Scroll } from "lucide-react";
import ScrollToTop from "./ScrollToTop.jsx";
import { AppProvider } from "./UserContext.jsx";
import { AlertProvider } from "./context/AlertContext";
// 2. Create the Memory Engine (Query Client)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // Data stays in RAM for 30 minutes
      cacheTime: 1000 * 60 * 60, // Data stays in cache for 1 hour
      refetchOnWindowFocus: false, // Prevents reloading every time you click back to the tab
      retry: 2, // Retries failed fetches twice before giving up
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 3. Wrap everything in the Provider */}
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {/* Wrap the app here */}
        <AlertProvider> 
          <BrowserRouter>
            <ScrollToTop />
            <App />
          </BrowserRouter>
        </AlertProvider>
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>,
);
