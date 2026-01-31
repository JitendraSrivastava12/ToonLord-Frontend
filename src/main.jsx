import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ScrollToTop from "./ScrollToTop.jsx";
import { AppProvider } from "./UserContext.jsx";
import { AlertProvider } from "./context/AlertContext";
import { GlobalSVGFilters } from "./components/Visuals.jsx";

// ✅ THEME BOOTSTRAPPER (RUNS BEFORE REACT)


// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AlertProvider>
          <BrowserRouter>
          <GlobalSVGFilters />
            <ScrollToTop />
            <App />
          </BrowserRouter>
        </AlertProvider>
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>
);
