import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Alert({
  msg,
  type = "error",
  duration = 3000,
  onClose,
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = {
    success: { styles: "bg-green-500/10 text-green-400 border-green-500/20", bar: "bg-green-500", icon: <CheckCircle size={18} /> },
    error: { styles: "bg-red-500/10 text-red-400 border-red-500/20", bar: "bg-red-500", icon: <AlertCircle size={18} /> },
    info: { styles: "bg-blue-500/10 text-blue-400 border-blue-500/20", bar: "bg-blue-500", icon: <Info size={18} /> },
  };

  const activeConfig = config[type] || config.error;

  useEffect(() => {
    // 1. Enter immediately
    setVisible(true);

    // 2. Progress Bar Logic
    const startTime = Date.now();
    const endTime = startTime + duration;

    const progressInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const percent = (remaining / duration) * 100;
      setProgress(percent);

      if (percent <= 0) clearInterval(progressInterval);
    }, 10);

    // 3. Animation & Cleanup Logic
    // Start fading out 500ms before the bar hits zero
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, duration - 500);

    // Final removal: Added a 100ms "buffer" to ensure CSS finishes
    const removeTimer = setTimeout(() => {
      onClose?.();
    }, duration + 100); 

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-4 w-full flex justify-center pointer-events-none">
      <div
        className={`
          relative overflow-hidden min-w-[320px] max-w-[500px] px-5 py-4 rounded-2xl
          backdrop-blur-md shadow-2xl flex items-center gap-3 border pointer-events-auto
          ${activeConfig.styles}
          transition-all duration-500 ease-in-out
          ${visible 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 -translate-y-8 scale-95"}
        `}
      >
        <div className="shrink-0">{activeConfig.icon}</div>
        <p className="flex-1 text-sm font-medium leading-relaxed tracking-wide">{msg}</p>

        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 500);
          }}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={16} className="opacity-50 hover:opacity-100" />
        </button>

        {/* Progress Bar Container */}
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/5">
          <div 
            className={`h-full ${activeConfig.bar}`}
            style={{ 
              width: `${progress}%`,
              transition: "width 10ms linear" // Smooth increment
            }}
          />
        </div>
      </div>
    </div>
  );
}