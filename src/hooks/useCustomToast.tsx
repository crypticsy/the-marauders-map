import React, { useRef } from "react";
import { toast } from "react-hot-toast";
import { FaWandMagicSparkles, FaSkull } from "react-icons/fa6";
import { IoFootsteps, IoSparkles } from "react-icons/io5";
import { GiQuillInk } from "react-icons/gi";

const MAX_TOASTS = 3;

// Custom Toast Component with animations and styling matching the parchment theme
const CustomToast = ({
  icon,
  message,
  background = "#1a1a1a",
  borderColor = "rgba(139, 111, 71, 0.3)",
  visible = true,
}: {
  icon: React.ReactNode;
  message: string;
  background?: string;
  borderColor?: string;
  visible?: boolean;
}) => {
  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg shadow-lg border-2 max-w-md
        transform transition-all duration-300 ease-in-out
        ${visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
      style={{
        backgroundColor: background,
        borderColor: borderColor,
        color: '#e8dcc4',
        fontFamily: "'IM Fell English', serif",
        fontSize: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="leading-5 break-words">
          {message}
        </p>
      </div>
    </div>
  );
};

// Hook to manage toasts with limit and proper timing
export function useCustomToast() {
  const activeToasts = useRef<string[]>([]);

  const showToast = ({
    message,
    type = "info",
    duration,
  }: {
    message: string;
    type?: "success" | "error" | "info" | "delete";
    duration?: number;
  }) => {
    // Dismiss oldest toast if limit exceeded
    if (activeToasts.current.length >= MAX_TOASTS) {
      const oldestId = activeToasts.current.shift();
      if (oldestId) {
        toast.dismiss(oldestId);
      }
    }

    // Set default durations matching react-hot-toast behavior
    let defaultDuration: number;
    switch (type) {
      case "success":
        defaultDuration = 800; // Success toasts are shorter
        break;
      default:
        defaultDuration = 1200; // Info toasts standard duration
        break;
    }

    const toastDuration = duration !== undefined ? duration : defaultDuration;

    let icon: React.ReactNode;
    let bg = "#1a1a1a"; // Dark background
    let borderColor = "rgba(139, 111, 71, 0.3)"; // Parchment border

    switch (type) {
      case "success":
        icon = <IoSparkles className="w-6 h-6" style={{ color: '#e8dcc4' }} />;
        bg = "#1a3a1a"; // Slightly green-tinted dark
        borderColor = "rgba(139, 171, 71, 0.5)"; // Greenish border
        break;
      case "error":
        icon = <FaSkull className="w-5 h-5" style={{ color: '#e8dcc4' }} />;
        bg = "#3a1a1a"; // Slightly red-tinted dark
        borderColor = "rgba(171, 71, 71, 0.5)"; // Reddish border
        break;
      case "delete":
        icon = <FaSkull className="w-5 h-5" style={{ color: '#e8dcc4' }} />;
        bg = "#3a1a1a"; // Slightly red-tinted dark
        borderColor = "rgba(171, 71, 71, 0.5)"; // Reddish border
        break;
      default:
        icon = <GiQuillInk className="w-6 h-6" style={{ color: '#e8dcc4' }} />;
        bg = "#1a1a2a"; // Slightly blue-tinted dark
        borderColor = "rgba(111, 139, 171, 0.5)"; // Bluish border
        break;
    }

    const id = toast.custom(
      (t) => (
        <CustomToast
          icon={icon}
          message={message}
          background={bg}
          borderColor={borderColor}
          visible={t.visible}
        />
      ),
      {
        duration: toastDuration,
        position: 'top-center', // Match react-hot-toast default position
      }
    );

    // Track the toast
    activeToasts.current.push(id);

    // Clean up the reference when toast is dismissed
    setTimeout(() => {
      activeToasts.current = activeToasts.current.filter(toastId => toastId !== id);
    }, toastDuration + 500); // Add extra time for exit animation

    return id;
  };

  // Additional utility methods
  const dismissAll = () => {
    activeToasts.current.forEach(id => toast.dismiss(id));
    activeToasts.current = [];
  };

  const dismiss = (id?: string) => {
    if (id) {
      toast.dismiss(id);
      activeToasts.current = activeToasts.current.filter(toastId => toastId !== id);
    } else {
      dismissAll();
    }
  };

  return {
    showToast,
    dismiss,
    dismissAll,
    activeCount: () => activeToasts.current.length,
  };
}
