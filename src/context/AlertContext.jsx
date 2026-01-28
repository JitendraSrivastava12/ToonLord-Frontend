import { createContext, useContext, useState, useCallback } from "react";
import Alert from "../ui/Alert";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  // We use useCallback to prevent unnecessary re-renders in components using the hook
  const showAlert = useCallback((msg, type = "error", time = 3000) => {
    setAlert({ msg, type });

    // FIX: Clear existing timeouts if a new alert is triggered
    const timer = setTimeout(() => {
      setAlert(null);
    }, time);

    return () => clearTimeout(timer);
  }, []);

  const hideAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {/* Container for the alert - usually positioned 'absolute' or 'fixed' */}
      {alert && (
        <div className="fixed top-5 right-5 z-[9999]">
          <Alert msg={alert.msg} type={alert.type} onClose={hideAlert} />
        </div>
      )}
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};